"""
Platform configuration models and predefined platform data.
"""

from pydantic import BaseModel, Field


class PlatformConfig(BaseModel):
    """Configuration and rules for a specific content platform."""

    id: str = Field(description="Platform identifier")
    name: str = Field(description="Human-readable platform name")
    icon: str = Field(description="Emoji icon for the platform")
    hook_max_time: int = Field(description="Maximum seconds for the hook/intro")
    ideal_length: str = Field(description="Ideal content length description")
    key_rules: list[str] = Field(
        default_factory=list,
        description="Core rules for content on this platform"
    )
    common_mistakes: list[str] = Field(
        default_factory=list,
        description="Frequent mistakes creators make on this platform"
    )


PLATFORMS: dict[str, PlatformConfig] = {
    "youtube": PlatformConfig(
        id="youtube",
        name="YouTube",
        icon="YT",
        hook_max_time=10,
        ideal_length="8-15 minutes for most niches",
        key_rules=[
            "Hook viewers in the first 10 seconds",
            "Pattern interrupt by 30 seconds to reset attention",
            "Deliver first major payoff by 30% of video length",
            "Retention checkpoints every 2-3 minutes",
            "End screen placement in last 20 seconds",
            "Speak at 140-160 words per minute",
            "Visual change every 5-8 seconds",
        ],
        common_mistakes=[
            "Starting with 'Hey guys' or channel name",
            "Asking to subscribe before delivering value",
            "Long-winded introductions before the hook",
            "Burying the lead past 30 seconds",
            "Monotone delivery without energy shifts",
            "No clear value proposition in the first 10 seconds",
        ],
    ),
    "tiktok": PlatformConfig(
        id="tiktok",
        name="TikTok",
        icon="TT",
        hook_max_time=0,
        ideal_length="15-60 seconds, under 60s optimal",
        key_rules=[
            "Zero-second intro: start mid-action or with a bold claim",
            "One idea per video, get to the point immediately",
            "Loop-friendly structure so viewers rewatch",
            "Native CTA instead of forced calls to action",
            "Speak at 160-180 words per minute",
            "Cuts or visual change every 2-3 seconds",
            "Text overlay for key points",
        ],
        common_mistakes=[
            "Any form of welcome or introduction",
            "Trying to cover multiple topics",
            "Slow build-up before the payoff",
            "Non-native or forced CTAs",
            "Videos over 60 seconds without mini-hooks",
            "No text overlay for accessibility and retention",
        ],
    ),
    "linkedin": PlatformConfig(
        id="linkedin",
        name="LinkedIn",
        icon="LI",
        hook_max_time=2,
        ideal_length="150-300 words for posts, longer for articles",
        key_rules=[
            "First 2 lines must hook above the fold (before 'see more')",
            "Use contrarian or hyper-specific hooks",
            "Short lines with white space between them",
            "Professional but human tone",
            "Story-driven structure: hook, story, insight, question",
            "Vulnerability and authenticity outperform polish",
            "End with a question to drive comments",
        ],
        common_mistakes=[
            "Starting with 'I' or 'Excited to announce'",
            "Walls of text with no line breaks",
            "Corporate jargon without substance",
            "Humble-bragging disguised as advice",
            "No clear takeaway or insight",
            "Lecturing instead of storytelling",
        ],
    ),
    "twitter": PlatformConfig(
        id="twitter",
        name="X / Twitter",
        icon="X",
        hook_max_time=1,
        ideal_length="Under 280 chars for singles, 5-10 tweets for threads",
        key_rules=[
            "First line must work as a standalone scroll-stopper",
            "Thread first tweet must deliver value on its own",
            "5-10 tweets is the optimal thread length",
            "Each tweet in a thread must be valuable standalone",
            "Casual but authoritative tone",
            "Humor and hot takes are encouraged",
            "Use line breaks for readability",
        ],
        common_mistakes=[
            "Starting threads with 'Thread:' label",
            "First tweet that only makes sense with context",
            "Threads longer than 15 tweets",
            "Overly formal or corporate tone",
            "No hook in the opening line",
            "Tweets that require reading the whole thread to understand",
        ],
    ),
}
