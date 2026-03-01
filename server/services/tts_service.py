"""
Text-to-Speech service using Google Cloud Text-to-Speech API.
"""

import logging
from typing import Optional

from google.cloud import texttospeech

logger = logging.getLogger(__name__)

# Available voice options for the coaching persona
AVAILABLE_VOICES = [
    {"name": "en-US-Neural2-F", "gender": "FEMALE", "description": "Professional female (default)"},
    {"name": "en-US-Neural2-D", "gender": "MALE", "description": "Professional male"},
    {"name": "en-US-Neural2-A", "gender": "MALE", "description": "Casual male"},
    {"name": "en-US-Neural2-C", "gender": "FEMALE", "description": "Casual female"},
    {"name": "en-US-Neural2-H", "gender": "FEMALE", "description": "Warm female"},
    {"name": "en-US-Neural2-I", "gender": "MALE", "description": "Authoritative male"},
]


class TTSService:
    """
    Synthesizes speech from text feedback using Google Cloud TTS.
    Returns audio in LINEAR16 (raw PCM) format for low-latency playback.
    """

    def __init__(self, voice_name: str = "en-US-Neural2-F") -> None:
        """
        Initialize the TTS service.

        Args:
            voice_name: Google Cloud TTS voice name.
        """
        self.client: Optional[texttospeech.TextToSpeechAsyncClient] = None
        self.voice_name = voice_name
        self._voice_params = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            name=voice_name,
        )
        self._audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.LINEAR16,
            sample_rate_hertz=24000,
            speaking_rate=1.05,  # Slightly faster for coaching urgency
            pitch=0.0,
        )
        logger.info("TTSService initialized with voice: %s", voice_name)

    async def _ensure_client(self) -> texttospeech.TextToSpeechAsyncClient:
        """Lazily initialize the async TTS client."""
        if self.client is None:
            self.client = texttospeech.TextToSpeechAsyncClient()
        return self.client

    async def synthesize(self, text: str) -> bytes:
        """
        Synthesize speech from text.

        Args:
            text: The text to convert to speech.

        Returns:
            Raw audio bytes in LINEAR16 format (24kHz, mono).

        Raises:
            RuntimeError: If synthesis fails.
        """
        if not text or not text.strip():
            return b""

        try:
            client = await self._ensure_client()

            synthesis_input = texttospeech.SynthesisInput(text=text)

            response = await client.synthesize_speech(
                request=texttospeech.SynthesizeSpeechRequest(
                    input=synthesis_input,
                    voice=self._voice_params,
                    audio_config=self._audio_config,
                )
            )

            logger.debug("Synthesized %d bytes of audio for text: %.50s...", len(response.audio_content), text)
            return response.audio_content

        except Exception as e:
            logger.error("TTS synthesis failed: %s", e)
            raise RuntimeError(f"Text-to-speech synthesis failed: {e}") from e

    def change_voice(self, voice_name: str) -> None:
        """
        Change the TTS voice.

        Args:
            voice_name: New Google Cloud TTS voice name.
        """
        self.voice_name = voice_name
        self._voice_params = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            name=voice_name,
        )
        logger.info("TTS voice changed to: %s", voice_name)

    async def close(self) -> None:
        """
        Close the TTS client and release resources.
        """
        if self.client is not None:
            try:
                transport = self.client.transport
                if hasattr(transport, "close"):
                    transport.close()
            except Exception as e:
                logger.warning("Error closing TTS client: %s", e)
            finally:
                self.client = None
