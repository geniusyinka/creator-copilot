"""
Health check and configuration endpoints.
"""

from fastapi import APIRouter

from models.platform import PLATFORMS
from services.tts_service import AVAILABLE_VOICES

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict:
    """
    Health check endpoint for load balancers and monitoring.

    Returns:
        Status and version information.
    """
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "creator-copilot",
    }


@router.get("/platforms")
async def get_platforms() -> dict:
    """
    Return available platform configurations.

    Returns:
        Dictionary of platform configs keyed by platform ID.
    """
    return {
        "platforms": {
            platform_id: config.model_dump()
            for platform_id, config in PLATFORMS.items()
        }
    }


@router.get("/voices")
async def get_voices() -> dict:
    """
    Return available TTS voice options.

    Returns:
        List of available voice configurations.
    """
    return {
        "voices": AVAILABLE_VOICES,
    }
