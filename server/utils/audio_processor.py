"""
Utilities for audio chunk processing.
"""

import base64
import logging
import struct

logger = logging.getLogger(__name__)

# Standard audio configuration for the application
SAMPLE_RATE = 24000  # 24kHz
CHANNELS = 1  # Mono
SAMPLE_WIDTH = 2  # 16-bit PCM (2 bytes per sample)
CHUNK_DURATION_MS = 100  # Default chunk duration in milliseconds
BYTES_PER_CHUNK = int(SAMPLE_RATE * CHANNELS * SAMPLE_WIDTH * CHUNK_DURATION_MS / 1000)


def encode_audio(audio_bytes: bytes) -> str:
    """
    Encode raw PCM audio bytes to a base64 string for transmission.

    Args:
        audio_bytes: Raw PCM audio bytes (LINEAR16).

    Returns:
        Base64-encoded string.
    """
    return base64.b64encode(audio_bytes).decode("utf-8")


def decode_audio(audio_b64: str) -> bytes:
    """
    Decode a base64-encoded audio string back to raw PCM bytes.

    Args:
        audio_b64: Base64-encoded audio string.

    Returns:
        Raw PCM audio bytes.

    Raises:
        ValueError: If the base64 string is invalid.
    """
    try:
        return base64.b64decode(audio_b64)
    except Exception as e:
        logger.error("Failed to decode audio: %s", e)
        raise ValueError(f"Invalid base64 audio data: {e}") from e


def calculate_duration_ms(audio_bytes: bytes) -> float:
    """
    Calculate the duration in milliseconds of a PCM audio chunk.

    Assumes 24kHz, mono, 16-bit PCM.

    Args:
        audio_bytes: Raw PCM audio bytes.

    Returns:
        Duration in milliseconds.
    """
    num_samples = len(audio_bytes) / SAMPLE_WIDTH
    return (num_samples / SAMPLE_RATE) * 1000


def calculate_rms_level(audio_bytes: bytes) -> float:
    """
    Calculate the RMS (root mean square) audio level of a PCM chunk.
    Useful for detecting silence vs. speech.

    Args:
        audio_bytes: Raw 16-bit PCM audio bytes.

    Returns:
        RMS level as a float. Higher values indicate louder audio.
    """
    if len(audio_bytes) < SAMPLE_WIDTH:
        return 0.0

    # Unpack 16-bit signed integers
    num_samples = len(audio_bytes) // SAMPLE_WIDTH
    samples = struct.unpack(f"<{num_samples}h", audio_bytes[:num_samples * SAMPLE_WIDTH])

    if not samples:
        return 0.0

    # Calculate RMS
    sum_squares = sum(s * s for s in samples)
    rms = (sum_squares / len(samples)) ** 0.5
    return rms


def is_silence(audio_bytes: bytes, threshold: float = 500.0) -> bool:
    """
    Determine whether an audio chunk is silence based on RMS level.

    Args:
        audio_bytes: Raw 16-bit PCM audio bytes.
        threshold: RMS threshold below which audio is considered silence.

    Returns:
        True if the audio chunk is below the silence threshold.
    """
    return calculate_rms_level(audio_bytes) < threshold


def chunk_audio(audio_bytes: bytes, chunk_size: int = BYTES_PER_CHUNK) -> list[bytes]:
    """
    Split a large audio buffer into fixed-size chunks.

    Args:
        audio_bytes: Raw PCM audio bytes.
        chunk_size: Size of each chunk in bytes.

    Returns:
        List of audio byte chunks.
    """
    chunks = []
    for i in range(0, len(audio_bytes), chunk_size):
        chunk = audio_bytes[i : i + chunk_size]
        chunks.append(chunk)
    return chunks
