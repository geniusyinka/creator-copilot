"""
Service for interacting with the Gemini Live API for real-time content analysis.
Uses gemini-2.5-flash-native-audio with audio output and transcription.
"""

import logging
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
            "If you notice something worth mentioning, speak up naturally — "
            "like a director giving a quick note on set. Two to three sentences, tops. "
            "If everything looks fine, say exactly: [NO_INTERRUPT]"
        )
        if trigger:
            prompt = f"{trigger}\n\n{prompt}"

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

    # Keywords that signal severity level from natural language
    _CRITICAL_KEYWORDS = [
        "hook", "intro", "opening", "first impression", "losing", "stop",
        "wait", "no no", "redo", "start over", "burying", "buried",
    ]
    _POSITIVE_KEYWORDS = [
        "love", "great", "perfect", "nice", "nailing", "keep",
        "exactly", "good job", "working", "that's it",
    ]

    @staticmethod
    def _parse_feedback(text: str) -> dict:
        """Parse natural-language feedback into type and severity using keywords."""
        lower = text.lower()

        # Detect positive feedback
        if any(kw in lower for kw in GeminiService._POSITIVE_KEYWORDS):
            return {
                "raw": text,
                "type": "positive",
                "advice": text,
                "severity": 0.3,
            }

        # Detect critical feedback
        if any(kw in lower for kw in GeminiService._CRITICAL_KEYWORDS):
            return {
                "raw": text,
                "type": "critical",
                "advice": text,
                "severity": 0.8,
            }

        # Default: suggestion
        return {
            "raw": text,
            "type": "suggestion",
            "advice": text,
            "severity": 0.5,
        }

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
