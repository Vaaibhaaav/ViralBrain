from typing import TypedDict, List, Dict, Any, Tuple,Optional


class ViralBrainState(TypedDict):
    topic: str
    topic_details: str
    creator_id: str
    niche: str
    preferred_language: str
    target_audience: str
    primary_platform: str
    preferred_personalized_output: bool

    top_angles: List[Dict[str, Any]]
    viral_templates: Dict[str, Any]
    draft_script: str
    virality_score: float
    score_reason: str
    retry_count: int

    title_variants: List[Dict[str, Any]]
    ab_pair: Tuple[str, str]
    # platform_output: Dict[str, Any]

    linkedin_post: str
    twitter_thread: List[Dict[str, Any]]

    seo_metadata: str
    primary_keywords: List[str]
    viral_hashtags: List[Dict[str, Any]]

    human_feedback: Optional[str]
