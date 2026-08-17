import os
from typing import Any, List
from logging import getLogger
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field, SecretStr
from langchain_google_genai import ChatGoogleGenerativeAI
from server.agents.state import ViralBrainState
from server.utils.scrapper import discover_viral_videos

MAX_TRANSCRIPT_CHARS = 1500
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    api_key=SecretStr(GEMINI_API_KEY),
    temperature=0.2,
    max_retries=3,
)
logger = getLogger(__name__)


class StructuralTemplate(BaseModel):
    pattern_name: str = Field(
        description="The psychology name (e.g., 'Curiosity Gap', 'Shock Stat', 'The Anti-Guru Statement').")
    hook_scaffold: str = Field(
        description="Fill-in-the-blank text structure containing bracketed placeholders. Example: 'Everyone tells you to [Action], but they are hiding [Secret].'")
    pacing_guidelines: str = Field(
        description="Instructions on delivery pacing (e.g., 'Deliver the first 3 words under 0.8 seconds, high energy entry').")


class DNAScannerOutput(BaseModel):
    dominant_viral_pattern: str = Field(
        description="The primary statistical hook psychology observed across the viral corpus transcripts.")
    core_reasoning_why_it_works: str = Field(
        description="Deep architectural analysis of why this specific pacing/hook framework hooks the current target niche audience.")
    templates: List[StructuralTemplate] = Field(
        description="Exactly 3 distinct fill-in-the-blank structural scaffolding templates built from the corpus.")


def retrieve_viral_transcripts(niche: str, preferred_language: str) -> List[dict]:
    """
        Simulates fetching the top 20 viral video transcripts for the target niche
        from our personal vector index corpus (updated weekly via a background cron).
    """
    data = None
    try:
        data = discover_viral_videos(niche, preferred_language, 2) or []
    except Exception as e:
        print(f"Error occurred while fetching transcripts : {e}")

    return data


def dna_scanner_node(state: ViralBrainState) -> Any:
    print("\n--- [AGENT LOG] Running Virality DNA Scanner Node ---")

    niche = state.get("niche", "General")
    top_angles = state.get("top_angles", [])
    preferred_language = state.get("preferred_language", "Hindi")

    chosen_angle_context = ""
    if top_angles:
        primary = top_angles[0]
        chosen_angle_context = f"Target Angle: {primary.get('angle')} | Rationale: {primary.get('rationale')} | Traction Metric : {primary.get('traction_metric')} | Supporting Signal : {primary.get('supporting_signal')}"
    else:
        chosen_angle_context = "Fallback to generic industry pattern tracking definitions."

    raw_corpus_videos = retrieve_viral_transcripts(niche, preferred_language)

    if not raw_corpus_videos:
        return {
            "viral_templates": {
                "dominant_viral_pattern": "Insufficient data",
                "core_reasoning_why_it_works": "",
                "templates": []
            }
        }

    formatted_transcripts_payload = ""
    for idx, vid in enumerate(raw_corpus_videos, start=1):
        title = vid.get("title", "Unknown Title")
        transcript = vid.get("transcript", "")
        transcript = transcript[:MAX_TRANSCRIPT_CHARS]
        formatted_transcripts_payload += f"\n--- VIDEO COMPILATION REFERENCE #{idx} ({title}) ---\n"
        formatted_transcripts_payload += f"Transcript Payload Data: {transcript}\n"

    system_instruction = (
        "You are an advanced Content Intelligence Reverse-Engineering Agent.\n"
        "Your task is to analyze a massive batch of viral video transcripts simultaneously "
        "and isolate the exact hook patterns and psychological structures causing retention spikes.\n\n"
        "Instructions:\n"
        "1. Identify structural trends: Look for curiosity gaps, controversy entries, how-to arcs, or shock metrics.\n"
        "2. Provide concrete, highly detailed structural 'fill-in-the-blank' scaffolding skeletons.\n"
        "3. Do not return loose strings or markdown code formatting blocks. Follow the strict structural validation JSON schema precisely."
    )

    user_prompt = f"""
    Current Target Positioning Angle Context:
    {chosen_angle_context}
    
    Raw High-Traction Corpus Video Transcripts Records:
    {formatted_transcripts_payload}
    """

    print("[GEMINI INFERENCE] Processing full transcript context block through Gemini 1.5 Flash...")

    structured_llm = llm.with_structured_output(DNAScannerOutput)

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_instruction),
        ("human", user_prompt),
    ])

    chain = prompt | structured_llm

    try:
        result = chain.invoke({})
    except Exception as e:
        logger.exception("DNA scanner failed")
        raise RuntimeError(
            f"DNA Scanner failed: {str(e)}"
        )

    return {
        "viral_templates": result.model_dump()
    }
