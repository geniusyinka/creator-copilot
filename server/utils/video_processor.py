"""
Utilities for video frame encoding and decoding.
"""

import base64
import logging

logger = logging.getLogger(__name__)


def encode_frame(frame_bytes: bytes) -> str:
    """
    Encode raw JPEG frame bytes to a base64 string for transmission.

    Args:
        frame_bytes: Raw JPEG image bytes.

    Returns:
        Base64-encoded string of the frame.
    """
    return base64.b64encode(frame_bytes).decode("utf-8")


def decode_frame(frame_b64: str) -> bytes:
    """
    Decode a base64-encoded JPEG frame string back to raw bytes.

    Args:
        frame_b64: Base64-encoded string of the frame.

    Returns:
        Raw JPEG image bytes.

    Raises:
        ValueError: If the base64 string is invalid.
    """
    try:
        return base64.b64decode(frame_b64)
    except Exception as e:
        logger.error("Failed to decode frame: %s", e)
        raise ValueError(f"Invalid base64 frame data: {e}") from e


def validate_jpeg(data: bytes) -> bool:
    """
    Validate that the given bytes represent a JPEG image.

    JPEG files start with FF D8 FF and end with FF D9.

    Args:
        data: Raw bytes to validate.

    Returns:
        True if the data appears to be a valid JPEG.
    """
    if len(data) < 4:
        return False
    return data[:3] == b"\xff\xd8\xff" and data[-2:] == b"\xff\xd9"


def estimate_frame_quality(data: bytes) -> str:
    """
    Estimate the quality tier of a JPEG frame based on file size.

    Args:
        data: Raw JPEG bytes.

    Returns:
        Quality tier string: "low", "medium", or "high".
    """
    size_kb = len(data) / 1024

    if size_kb < 20:
        return "low"
    elif size_kb < 100:
        return "medium"
    else:
        return "high"
