"""
Service for interacting with the Gemini Live API for real-time content analysis.
Uses gemini-2.5-flash-native-audio with audio output and transcription.
"""

import logging
import re
from typing import AsyncGenerator, Optional

from google import genai
from google.genai import types

from config import settings
from prompts import get_platform_prompt

logger = logging.getLogger(__name__)


class GeminiService:
    """
    Manages a Gemini Live API session for real-time multimodal content analysis.
    Uses the native audio model with transcription for both voice and text output.
    """

    MODEL = "gemini-2.5-flash-native-audio-latest"

    def __init__(self, platform: str) -> None:
        self.platform = platform
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.system_prompt = get_platform_prompt(platform)
        self.config = types.LiveConnectConfig(
            response_modalities=["AUDIO"],
            system_instruction=self.system_prompt,
            output_audio_transcription=types.AudioTranscriptionConfig(),
        )
        self._session_context = None
        self.session = None

    async def create_session(self) -> None:
        """Open a persistent connection to the Gemini Live API."""
        logger.info("Creating Gemini Live session for platform: %s", self.platform)
        self._session_context = self.client.aio.live.connect(
            model=self.MODEL,
            config=self.config,
        )
        self.session = await self._session_context.__aenter__()
        logger.info("Gemini Live session created successfully")

    async def send_frame(self, frame_data: bytes) -> None:
        """Send a video frame (JPEG) to the active session."""
        if self.session is None:
            raise RuntimeError("Session not initialized")

        await self.session.send_realtime_input(
            media=types.Blob(
                mime_type="image/jpeg",
                data=frame_data,
            )
        )

    async def send_audio(self, audio_data: bytes) -> None:
        """Send raw PCM audio to the active session."""
        if self.session is None:
            raise RuntimeError("Session not initialized")

        await self.session.send_realtime_input(
            media=types.Blob(
                mime_type="audio/pcm",
                data=audio_data,
            )
        )

    async def request_analysis(self, trigger: str = "") -> None:
        """
        Send text prompt asking Gemini to analyze content and decide
        whether to interrupt.
        """
        if self.session is None:
            raise RuntimeError("Session not initialized")

        prompt = (
            "Based on everything you've seen and heard so far in this session, "
            "should you interrupt the creator with feedback? "
            "If there is a genuine issue worth mentioning, give your feedback directly as spoken advice. "
            "Be concise - 2-3 sentences max. Speak as a creative director giving a quick note. "
            "If everything looks fine, say exactly: [NO_INTERRUPT]"
        )
        if trigger:
            prompt = f"Context: {trigger}\n\n{prompt}"

        await self.session.send_client_content(
            turns=types.Content(
                parts=[types.Part(text=prompt)],
                role="user",
            ),
            turn_complete=True,
        )

    async def receive_responses(self) -> AsyncGenerator[dict, None]:
        """
        Async generator yielding parsed responses from the Gemini session.
        Returns dicts with audio data, transcription text, and parsed feedback.
        """
        if self.session is None:
            raise RuntimeError("Session not initialized")

        transcript = ""
        audio_chunks = []

        async for msg in self.session.receive():
            server = msg.server_content
            if server is None:
                continue

            # Collect audio chunks from model turn
            if server.model_turn:
                for part in server.model_turn.parts:
                    if part.inline_data:
                        audio_chunks.append(part.inline_data.data)

            # Collect transcription text
            if server.output_transcription and server.output_transcription.text:
                transcript += server.output_transcription.text

            # When turn is complete, yield the full response
            if server.turn_complete:
                text = transcript.strip()
                transcript = ""
                collected_audio = b"".join(audio_chunks)
                audio_chunks = []

                if not text and not collected_audio:
                    continue

                if "[NO_INTERRUPT]" in text:
                    yield {"type": "no_interrupt", "content": None, "audio": None}
                else:
                    parsed = self._parse_feedback(text)
                    yield {
                        "type": "interrupt",
                        "content": parsed,
                        "audio": collected_audio if collected_audio else None,
                    }

    @staticmethod
    def _parse_feedback(text: str) -> dict:
        """Parse feedback text into structured format."""
        result = {
            "raw": text,
            "type": "suggestion",
            "issue": None,
            "advice": text,  # Default: use full text as advice
            "example": None,
            "why": None,
            "severity": 0.5,
        }

        # Try structured ISSUE/ADVICE format
        issue_match = re.search(r"ISSUE:\s*(.+?)(?=\nADVICE:|\nWORKING:|\Z)", text, re.DOTALL)
        advice_match = re.search(r"ADVICE:\s*(.+?)(?=\nEXAMPLE:|\nWHY:|\Z)", text, re.DOTALL)
        example_match = re.search(r"EXAMPLE:\s*(.+?)(?=\nWHY:|\Z)", text, re.DOTALL)
        why_match = re.search(r"WHY:\s*(.+?)(?=\Z)", text, re.DOTALL)
        working_match = re.search(r"WORKING:\s*(.+?)(?=\nWHY:|\Z)", text, re.DOTALL)

        if issue_match:
            result["issue"] = issue_match.group(1).strip()
            result["type"] = "critical" if any(
                kw in result["issue"].lower()
                for kw in ["hook", "intro", "burying", "subscribe", "greeting", "welcome", "lead"]
            ) else "suggestion"
            result["severity"] = 0.8 if result["type"] == "critical" else 0.5

        if advice_match:
            result["advice"] = advice_match.group(1).strip()

        if example_match:
            result["example"] = example_match.group(1).strip()

        if why_match:
            result["why"] = why_match.group(1).strip()

        if working_match:
            result["type"] = "positive"
            result["advice"] = working_match.group(1).strip()
            result["severity"] = 0.3

        return result

    async def close(self) -> None:
        """Close the Gemini Live session."""
        if self._session_context is not None:
            try:
                await self._session_context.__aexit__(None, None, None)
                logger.info("Gemini Live session closed")
            except Exception as e:
                logger.warning("Error closing Gemini session: %s", e)
            finally:
                self.session = None
                self._session_context = None
