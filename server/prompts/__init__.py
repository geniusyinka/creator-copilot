"""
Prompt templates for Creator Copilot.
"""

from prompts.base_prompt import BASE_SYSTEM_PROMPT
from prompts.youtube_prompt import YOUTUBE_PROMPT
from prompts.tiktok_prompt import TIKTOK_PROMPT
from prompts.linkedin_prompt import LINKEDIN_PROMPT
from prompts.twitter_prompt import TWITTER_PROMPT

__all__ = [
    "BASE_SYSTEM_PROMPT",
    "YOUTUBE_PROMPT",
    "TIKTOK_PROMPT",
    "LINKEDIN_PROMPT",
    "TWITTER_PROMPT",
    "get_platform_prompt",
]

_PLATFORM_PROMPTS: dict[str, str] = {
    "youtube": YOUTUBE_PROMPT,
    "tiktok": TIKTOK_PROMPT,
    "linkedin": LINKEDIN_PROMPT,
    "twitter": TWITTER_PROMPT,
}


def get_platform_prompt(platform: str) -> str:
    """
    Build the full system prompt for a given platform.

    Combines the base system prompt with the platform-specific prompt.
    Falls back to the base prompt if the platform is not recognized.

    Args:
        platform: Platform identifier (youtube, tiktok, linkedin, twitter).

    Returns:
        The complete system prompt string.
    """
    platform_template = _PLATFORM_PROMPTS.get(platform.lower())
    if platform_template is None:
        return BASE_SYSTEM_PROMPT

    return platform_template.format(base_prompt=BASE_SYSTEM_PROMPT)
