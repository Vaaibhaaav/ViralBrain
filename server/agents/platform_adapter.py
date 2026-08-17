from typing import List
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field
from server.agents.state import ViralBrainState
from server.config import GROQ_API_KEY


class TwitterTweet(BaseModel):
    tweet_number: int = Field(description="The sequential ordering index of the tweet in the thread (e.g., 1, 2, 3).")
    tweet_text: str = Field(
        description="The actual text content of this specific tweet. MUST stay strictly under 280 characters.")


class PlatformAdapterOutput(BaseModel):
    linkedin_post: str = Field(
        description="A beautifully formatted, high-authority text post ready for LinkedIn. Uses clean spacing, bold metrics, and 1-2 relevant hashtags.")
    twitter_thread: List[TwitterTweet] = Field(
        description="The complete broken-down chronological X thread built out from the script core logic.")


llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.2,
    api_key=GROQ_API_KEY
)


def platform_adapter_node(state: ViralBrainState):
    print("\n--- [AGENT LOG] Running Platform Adapter Agent ---")
    print(f"[DEBUG] State keys available: {list(state.keys())}")  # ← ADD THIS
    print(f"[DEBUG] draft_script present: {bool(state.get('draft_script'))}")

    approved_script_str = state.get("draft_script", "")
    niche = state.get("niche", "General")
    preferred_language = state.get("preferred_language", "en")
    target_audience = state.get("target_audience", "General Audience")

    if not approved_script_str:
        print("⚠️ Approved script string missing from state. Pulling topic configuration data directly.")
        approved_script_str = f"Core Topic: {state.get('topic', 'Tech and Artificial Intelligence developments.')}"

    structured_llm = llm.with_structured_output(PlatformAdapterOutput,method="json_mode")

    prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are an expert Content Repurposing Specialist and Growth Marketer.\n"
            "Your objective is to take a high-retention short-form video script and translate its core message into high-performing text posts natively designed for LinkedIn and X (Twitter) and a caption for instagram posts.\n\n"
            "Platform Engineering Requirements:\n"
            "1. LINKEDIN ARCHITECTURE:\n"
            "   - Start with a powerful hook line immediately.\n"
            "   - Use generous whitespace. Every sentence should be its own line block to optimize mobile scannability.\n"
            "   - Structure insights into clean bullet points with professional emojis. No corporate cliché jargon.\n"
            "2. X (TWITTER) THREAD ARCHITECTURE:\n"
            "   - Convert the payload into an array of sequential tweets.\n"
            "   - Tweet #1 MUST be an attention-grabbing hook detailing a promise, outcome, or counter-intuitive claim.\n"
            "   - Every single tweet object text MUST stay strictly under 280 characters. Never spill over the boundary.\n"
            "3. LANGUAGE RIGOR:\n"
            "   - Maintain the language setting requested by the creator ('en' or 'hinglish'). If hinglish, ensure text sounds conversational, typing Hindi phrases natively in the Roman alphabet alongside professional English terms.\n\n"
            "You MUST respond with ONLY valid JSON. No markdown, no explanation.\n"
            "Use EXACTLY these top-level keys:\n"
            "  * 'linkedin_post' (string) — the full LinkedIn post text\n"
            "  * 'twitter_thread' (array of objects) — NOT 'tweets', NOT 'thread'\n"
            "    Each object MUST have exactly:\n"
            "      - 'tweet_number' (integer)\n"
            "      - 'tweet_text' (string, strictly under 280 characters)\n"

        )),
        ("user", (
            "Creator Profiles:\n"
            "- Target Industry Niche: {niche}\n"
            "- Language Code: {language}\n"
            "- Target Audience: {target_audience}\n\n"
            "Approved Source Video Script Material to Extract and Adapt:\n"
            "{source_script}"
        ))
    ])

    chain = prompt | structured_llm

    response = chain.invoke({
        "niche": niche,
        "language": preferred_language,
        "target_audience": target_audience,
        "source_script": approved_script_str,
        "schema" : PlatformAdapterOutput.model_json_schema()
    })

    formatted_tweets = [t.model_dump() for t in response.twitter_thread]

    print("✅ Successfully adapted video layout into native LinkedIn copy and structured X threads.")
    result = {
        "linkedin_post": response.linkedin_post,
        "twitter_thread": formatted_tweets,
    }

    print(result)

    return result
