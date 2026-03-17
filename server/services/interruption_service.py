"""
Interruption engine that controls when and how the AI coach interrupts the creator.
"""

import logging
import math
import time
from typing import Optional

logger = logging.getLogger(__name__)


class InterruptionEngine:
    """
    Manages interruption timing, frequency, and severity thresholds.
    Prevents over-interrupting while ensuring critical issues are raised.
    """

    def __init__(self, intensity: str = "balanced") -> None:
        """
        Initialize the interruption engine.

        Args:
            intensity: Coaching intensity level (aggressive, balanced, light, muted).
        """
        self.intensity = intensity
        self.last_interruption_time: float = 0.0
        self.interruption_count: int = 0
        self.session_issues: list[dict] = []
        self.addressed_topics: set[str] = set()
        self._window_start: float = time.time()

        logger.info("InterruptionEngine initialized with intensity: %s", intensity)

    def should_interrupt(self, content: dict) -> bool:
        """
        Determine whether the AI should interrupt based on the content analysis,
        current cooldown state, interruption limits, severity threshold, and
        whether the topic has already been addressed.

        Args:
            content: Parsed feedback content from Gemini.

        Returns:
            True if the AI should interrupt, False otherwise.
        """
        if content is None:
            return False

        # Basic gate: cooldown and max checks
        if not self.can_interrupt():
            logger.debug("Interruption blocked: cooldown or max limit reached")
            return False

        # Check severity threshold
        if not self.meets_threshold(content):
            logger.debug("Interruption blocked: below severity threshold")
            return False

        # Check if this topic has already been addressed
        issue_key = self._get_topic_key(content)
        if issue_key and issue_key in self.addressed_topics:
            logger.debug("Interruption blocked: topic already addressed -- %s", issue_key)
            return False

        return True

    def can_interrupt(self) -> bool:
        """
        Basic check whether an interruption is allowed right now.

        Returns:
            True if cooldown has elapsed and max interruptions not exceeded.
        """
        now = time.time()

        # Reset window every 10 minutes
        if now - self._window_start >= 600:
            self.interruption_count = 0
            self._window_start = now

        # Check cooldown
        min_gap = self.get_min_gap()
        if min_gap == math.inf:
            return False
        if now - self.last_interruption_time < min_gap:
            return False

        # Check max interruptions per window
        if self.interruption_count >= self.get_max_interruptions():
            return False

        return True

    def record_interruption(self, content: dict) -> None:
        """
        Record that an interruption was made. Updates timing, counters,
        and addressed topics.

        Args:
            content: The feedback content that was delivered.
        """
        self.last_interruption_time = time.time()
        self.interruption_count += 1
        self.session_issues.append(content)

        topic_key = self._get_topic_key(content)
        if topic_key:
            self.addressed_topics.add(topic_key)

        logger.info(
            "Interruption recorded (#%d). Topic: %s",
            self.interruption_count,
            topic_key or "unknown",
        )

    def update_settings(self, intensity: str) -> None:
        """
        Update the coaching intensity mid-session.

        Args:
            intensity: New intensity level.
        """
        old_intensity = self.intensity
        self.intensity = intensity
        logger.info("Intensity updated: %s -> %s", old_intensity, intensity)

    def get_min_gap(self) -> float:
        """
        Get the minimum seconds between interruptions for the current intensity.

        Returns:
            Minimum gap in seconds.
        """
        gaps = {
            "aggressive": 15,
            "balanced": 30,
            "light": 60,
            "muted": math.inf,
        }
        return gaps.get(self.intensity, 60)

    def get_max_interruptions(self) -> int:
        """
        Get the maximum interruptions allowed per 10-minute window.

        Returns:
            Maximum interruption count.
        """
        limits = {
            "aggressive": 10,
            "balanced": 6,
            "light": 3,
            "muted": 0,
        }
        return limits.get(self.intensity, 4)

    def meets_threshold(self, content: dict) -> bool:
        """
        Check whether the content severity meets the intensity threshold.

        Args:
            content: Parsed feedback with a "severity" field.

        Returns:
            True if severity meets or exceeds the threshold.
        """
        thresholds = {
            "aggressive": 0.2,
            "balanced": 0.4,
            "light": 0.6,
            "muted": 1.1,  # effectively impossible
        }
        threshold = thresholds.get(self.intensity, 0.5)
        severity = content.get("severity", 0.5)
        return severity >= threshold

    def get_session_summary(self) -> dict:
        """
        Generate a summary of all interruptions and issues for the session.

        Returns:
            Dictionary with session interruption statistics.
        """
        issues_caught = []
        issues_fixed = []
        positive_notes = []

        for issue in self.session_issues:
            if issue.get("type") == "positive":
                working = issue.get("working", "")
                if working:
                    positive_notes.append(working)
            else:
                issue_text = issue.get("issue") or issue.get("advice", "Unknown issue")
                issues_caught.append(issue_text)

        # Consider addressed topics as potentially fixed
        for topic in self.addressed_topics:
            issues_fixed.append(topic)

        return {
            "interruption_count": self.interruption_count,
            "issues_caught": issues_caught,
            "issues_fixed": issues_fixed,
            "positive_notes": positive_notes,
            "intensity": self.intensity,
        }

    @staticmethod
    def _get_topic_key(content: dict) -> Optional[str]:
        """
        Extract a normalized topic key from feedback content for deduplication.

        Args:
            content: Parsed feedback content.

        Returns:
            Normalized topic string, or None if no topic can be extracted.
        """
        text = content.get("advice") or content.get("raw")

        if not text:
            return None

        # Normalize: lowercase, take first 80 chars, strip
        return text.lower().strip()[:80]
