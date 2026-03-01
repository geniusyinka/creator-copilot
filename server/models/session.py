"""
Session-related Pydantic models.
"""

from typing import Literal, Optional
from pydantic import BaseModel, Field


class SessionConfig(BaseModel):
    """Configuration sent by the client when starting a coaching session."""

    platform: Literal["youtube", "tiktok", "linkedin", "twitter"] = Field(
        description="Target content platform"
    )
    intensity: Literal["aggressive", "balanced", "light", "muted"] = Field(
        default="balanced",
        description="How aggressively the AI should interrupt with feedback"
    )
    content_description: Optional[str] = Field(
        default=None,
        description="Optional description of the content being created"
    )


class SessionSummary(BaseModel):
    """Summary generated when a coaching session ends."""

    session_id: str = Field(description="Unique session identifier")
    duration_seconds: int = Field(description="Total session duration in seconds")
    platform: str = Field(description="Platform the session was coaching for")
    interruption_count: int = Field(description="Total number of interruptions made")
    issues_caught: list[str] = Field(
        default_factory=list,
        description="All issues identified during the session"
    )
    issues_fixed: list[str] = Field(
        default_factory=list,
        description="Issues the creator addressed after feedback"
    )
    final_recommendations: list[str] = Field(
        default_factory=list,
        description="Closing recommendations for the creator"
    )
