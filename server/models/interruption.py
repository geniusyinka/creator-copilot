"""
Interruption-related Pydantic models.
"""

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field


class Interruption(BaseModel):
    """A single interruption event from the AI coach."""

    id: str = Field(description="Unique interruption identifier")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="When the interruption occurred"
    )
    type: Literal["critical", "suggestion", "positive"] = Field(
        description="Severity category of the interruption"
    )
    issue: Optional[str] = Field(
        default=None,
        description="The problem identified (None for positive interruptions)"
    )
    advice: str = Field(description="Actionable advice for the creator")
    example: Optional[str] = Field(
        default=None,
        description="Concrete example of how to improve"
    )
    platform_context: Optional[str] = Field(
        default=None,
        description="Why this matters for the specific platform"
    )
    severity: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="Severity score from 0.0 (minor) to 1.0 (critical)"
    )
