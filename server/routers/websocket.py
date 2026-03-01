"""
WebSocket endpoint for real-time coaching sessions.
Connects client media streams to Gemini Live API and relays
interruptions (audio + text) back to the client.
"""

import asyncio
import base64
import json
import logging
import time
import uuid

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from services.gemini_service import GeminiService
from services.interruption_service import InterruptionEngine
from services.session_service import session_manager

logger = logging.getLogger(__name__)

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/session")
async def websocket_session(ws: WebSocket) -> None:
    """
    Real-time coaching session over WebSocket.

    Protocol:
    1. Client sends config (platform, intensity, description).
    2. Client streams video_frame and audio_chunk messages.
    3. Server periodically prompts Gemini and sends interruptions.
    4. Client can send manual_check, settings_update, or end_session.
    """
    await ws.accept()
    logger.info("WebSocket connection accepted")

    gemini: GeminiService | None = None
    engine: InterruptionEngine | None = None
    session: dict | None = None
    background_tasks: list[asyncio.Task] = []
    stop_event = asyncio.Event()

    try:
        # ---- 1. Receive config ----
        raw_config = await ws.receive_text()
        config = json.loads(raw_config)
        platform = config.get("platform", "youtube")
        intensity = config.get("intensity", "balanced")
        description = config.get("description") or config.get("content_description")

        logger.info("Config: platform=%s intensity=%s", platform, intensity)

        # ---- 2. Initialize services ----
        gemini = GeminiService(platform=platform)
        engine = InterruptionEngine(intensity=intensity)

        session = session_manager.create_session(
            platform=platform,
            intensity=intensity,
            content_description=description,
        )

        await gemini.create_session()

        # If creator provided a description, send it as initial context
        if description:
            from google.genai import types as gtypes
            await gemini.session.send_client_content(
                turns=gtypes.Content(
                    role="user",
                    parts=[gtypes.Part(text=f"The creator is working on: {description}")],
                ),
                turn_complete=False,
            )

        await ws.send_json({
            "type": "status",
            "status": "ready",
            "session_id": session["session_id"],
        })

        # ---- 3. Background tasks ----

        async def periodic_analysis() -> None:
            """Every N seconds, ask Gemini to evaluate and possibly interrupt."""
            while not stop_event.is_set():
                await asyncio.sleep(8)  # Check every 8 seconds
                if stop_event.is_set():
                    break
                try:
                    if engine.can_interrupt():
                        await gemini.request_analysis(
                            trigger="Periodic check: review the latest content."
                        )
                except Exception as exc:
                    logger.error("Periodic analysis error: %s", exc)

        async def handle_gemini_responses() -> None:
            """Listen to Gemini responses and forward interruptions to client."""
            try:
                async for response in gemini.receive_responses():
                    if stop_event.is_set():
                        break

                    if response["type"] == "no_interrupt":
                        continue

                    content = response.get("content")
                    if content is None:
                        continue

                    # Check interruption engine rules
                    if not engine.should_interrupt(content):
                        logger.debug("Engine blocked interruption")
                        continue

                    engine.record_interruption(content)

                    # Build payload for client
                    itype = content.get("type", "suggestion")
                    payload: dict = {
                        "type": "interruption",
                        "content": {
                            "type": itype,
                            "raw": content.get("raw", ""),
                            "issue": content.get("issue"),
                            "advice": content.get("advice"),
                            "example": content.get("example"),
                            "why": content.get("why"),
                        },
                    }

                    # Include Gemini's native audio if available
                    audio_bytes = response.get("audio")
                    if audio_bytes:
                        payload["audio"] = base64.b64encode(audio_bytes).decode()

                    await ws.send_json(payload)
                    logger.info("Sent %s interruption to client", itype)

            except asyncio.CancelledError:
                pass
            except Exception as exc:
                logger.error("Response handler error: %s", exc)

        analysis_task = asyncio.create_task(periodic_analysis())
        response_task = asyncio.create_task(handle_gemini_responses())
        background_tasks = [analysis_task, response_task]

        # ---- 4. Main message loop ----
        while True:
            raw = await ws.receive_text()
            msg = json.loads(raw)
            mtype = msg.get("type")

            if mtype == "video_frame":
                data = msg.get("data", "")
                if data:
                    await gemini.send_frame(base64.b64decode(data))

            elif mtype == "audio_chunk":
                data = msg.get("data", "")
                if data:
                    await gemini.send_audio(base64.b64decode(data))

            elif mtype == "manual_check":
                await gemini.request_analysis(
                    trigger="Creator explicitly asked for feedback now."
                )

            elif mtype == "settings_update":
                new_intensity = msg.get("intensity")
                if new_intensity and engine:
                    engine.update_settings(new_intensity)
                    await ws.send_json({
                        "type": "status",
                        "status": "ready",
                        "intensity": new_intensity,
                    })

            elif mtype == "end_session":
                break

    except WebSocketDisconnect:
        logger.info("Client disconnected")
    except Exception as exc:
        logger.error("Session error: %s", exc)
    finally:
        # ---- 5. Cleanup ----
        stop_event.set()
        for task in background_tasks:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass

        # Send summary if connection is still open
        if engine and session:
            try:
                summary_data = engine.get_session_summary()
                ended = session_manager.end_session(session["session_id"])
                duration = ended["duration_seconds"] if ended else 0

                summary_msg = {
                    "type": "summary",
                    "data": {
                        "session_id": session["session_id"],
                        "duration_seconds": duration,
                        "platform": session.get("platform", ""),
                        "interruption_count": summary_data["interruption_count"],
                        "issues_caught": summary_data["issues_caught"],
                        "issues_fixed": summary_data["issues_fixed"],
                        "final_recommendations": summary_data.get("positive_notes", []),
                    },
                }
                await ws.send_json(summary_msg)
            except Exception:
                pass

        if gemini:
            await gemini.close()
        if session:
            session_manager.remove_session(session["session_id"])

        logger.info("Session cleaned up")
