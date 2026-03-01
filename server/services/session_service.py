"""
Session management service for tracking active coaching sessions.
"""

import logging
import time
import uuid
from typing import Any, Optional

logger = logging.getLogger(__name__)


class SessionManager:
    """
    Manages active coaching sessions. Provides creation, retrieval,
    and cleanup of sessions stored in memory.
    """

    def __init__(self) -> None:
        """Initialize the session manager with an empty session store."""
        self._sessions: dict[str, dict[str, Any]] = {}

    def create_session(
        self,
        platform: str,
        intensity: str = "balanced",
        content_description: Optional[str] = None,
    ) -> dict[str, Any]:
        """
        Create a new coaching session.

        Args:
            platform: Target content platform.
            intensity: Coaching intensity level.
            content_description: Optional description of the content.

        Returns:
            Session data dictionary with ID and metadata.
        """
        session_id = str(uuid.uuid4())
        session = {
            "session_id": session_id,
            "platform": platform,
            "intensity": intensity,
            "content_description": content_description,
            "created_at": time.time(),
            "status": "active",
        }

        self._sessions[session_id] = session
        logger.info(
            "Session created: %s (platform=%s, intensity=%s)",
            session_id,
            platform,
            intensity,
        )
        return session

    def get_session(self, session_id: str) -> Optional[dict[str, Any]]:
        """
        Retrieve a session by its ID.

        Args:
            session_id: The unique session identifier.

        Returns:
            Session data dictionary, or None if not found.
        """
        return self._sessions.get(session_id)

    def end_session(self, session_id: str) -> Optional[dict[str, Any]]:
        """
        End a session and calculate its duration.

        Args:
            session_id: The unique session identifier.

        Returns:
            The ended session data, or None if not found.
        """
        session = self._sessions.get(session_id)
        if session is None:
            logger.warning("Attempted to end non-existent session: %s", session_id)
            return None

        session["status"] = "ended"
        session["ended_at"] = time.time()
        session["duration_seconds"] = int(session["ended_at"] - session["created_at"])

        logger.info(
            "Session ended: %s (duration=%ds)",
            session_id,
            session["duration_seconds"],
        )
        return session

    def get_active_sessions(self) -> list[dict[str, Any]]:
        """
        Get all currently active sessions.

        Returns:
            List of active session data dictionaries.
        """
        return [s for s in self._sessions.values() if s["status"] == "active"]

    def remove_session(self, session_id: str) -> bool:
        """
        Remove a session from the store entirely.

        Args:
            session_id: The unique session identifier.

        Returns:
            True if the session was removed, False if not found.
        """
        if session_id in self._sessions:
            del self._sessions[session_id]
            logger.info("Session removed from store: %s", session_id)
            return True
        return False


# Singleton instance for the application
session_manager = SessionManager()
