import os
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from tavily import TavilyClient
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from server.agents.state import ViralBrainState
from server.config import GROQ_API_KEY, TAVILY_API_KEY

load_dotenv(verbose=True)


class MarketAngle(BaseModel):
    angle: str = Field(
        description="A distinct visual or hook angle for the content (e.g., 'The Shocking Truth', 'The step-by-step guide')")
    rationale: str = Field(
        description="Why this specific angle is highly relevant based on current social media traction indicators")
    traction_metric: str = Field(description="Expected performance classification: High, Medium, or Low")
    audience: str = Field(description="Primary target audience for this angle based on user inputs")
    supporting_signal: str = Field(
        description="Evidence supporting this trend such as growing discussions, search volume increase, or viral posts")


class TrendScoutOutput(BaseModel):
    top_angles: list[MarketAngle] = Field(description="Exactly 3 distinct marketing angles tailored to user's topics.")


tavily_client = TavilyClient(TAVILY_API_KEY) if TAVILY_API_KEY else None

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.2,
    api_key=GROQ_API_KEY
)


def tavily_search(query: str) -> dict:
    """Executes advanced search and returns the complete API dictionary payload safely."""
    if not tavily_client:
        return {"results": [], "answer": "Tavily API key missing configuration."}

    try:
        return tavily_client.search(
            query=query,
            search_depth="advanced",
            max_results=6,
            include_answer=True,
        )
    except Exception as e:
        print(f"⚠️ Search tool execution failed. Error: {e}")
        return {"results": [], "answer": f"Fallback error triggered: {str(e)}"}


def normalize_results(raw_response: dict) -> list:
    """Safely extracts search records avoiding attribute access failures on raw response dictionary."""
    results_list = raw_response.get("results", [])
    return [
        {
            "title": r.get("title", "No Title"),
            "url": r.get("url", "#"),
            "content": r.get("content", ""),
        }
        for r in results_list
    ]


def trend_scout_node(state: ViralBrainState) -> any:
    print("\n--- [AGENT LOG] Running Trend Scout Node ---")

    topic = state.get("topic", "")
    topic_details = state.get("topic_details", "")
    niche = state.get("niche", "General")
    preferred_language = state.get("preferred_language", "en")
    target_audience = state.get("target_audience", "General Audience")

    safe_topic = topic[:80].strip()
    safe_niche = niche[:50].strip()

    search_query = f"{safe_topic} {safe_niche} reddit discussions viral trends pain points 2026"

    print(f"[SEARCH] Firing optimized query token sequence to Tavily: '{search_query}'")
    print(f"[SEARCH] Query string length: {len(search_query)} characters (Safety threshold: <400)")

    print(f"[SEARCH] Querying Tavily Advanced Index for Topic: '{topic}'")
    raw_web_data = tavily_search(search_query)
    normalized_web_data = normalize_results(raw_web_data)
    tavily_answer = raw_web_data.get("answer", "")

    structured_llm = llm.with_structured_output(TrendScoutOutput, method="json_mode")

    prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are an expert Social Media Trend Analyst and Viral Content Strategist.\n"
            "Your objective is to review raw internet search noise and discover high-signal narrative angles.\n\n"
            "Operational Constraints:\n"
            "- Niche Target: {niche}\n"
            "- Generation Tone/Language: {language}\n\n"
            "Analyze the provided search results carefully. Extract exactly 3 highly compelling content angles "
            "that target consumer curiosity, FOMO, or knowledge gaps.\n"
            "If language is set to 'hinglish', make sure your conceptual angles target an Indian Gen-Z demographic."
            "Make sure to rank the angles from best to worst as per {topic_details}\n"
            "You MUST respond with ONLY valid JSON. No explanation, no markdown fences.\n"
            "The JSON must use EXACTLY this structure:\n"
            "{{\n"
            "  \"top_angles\": [\n"
            "    {{\n"
            "      \"angle\": \"string\",\n"
            "      \"rationale\": \"string\",\n"
            "      \"traction_metric\": \"High | Medium | Low\",\n"
            "      \"audience\": \"string\",\n"
            "      \"supporting_signal\": \"string\"\n"
            "    }}\n"
            "  ]\n"
            "}}\n"
            "The key must be 'top_angles', not 'content_angles' or any other name."
        )),
        ("user", (
            "Seed Idea Topic: {topic}\n\n"
            "Tavily Summary Synthesis:\n{ai_answer}\n\n"
            "Raw Extracted Search Snippets:\n{search_context}"
        ))
    ])

    chain = prompt | structured_llm

    response = chain.invoke({
        "niche": niche,
        "language": preferred_language,
        "topic_details": topic_details,
        "topic": topic,
        "ai_answer": tavily_answer,
        "search_context": str(normalized_web_data),
        "schema": TrendScoutOutput.model_json_schema()
    })

    formatted_angles = [item.model_dump() for item in response.top_angles]

    return {
        "top_angles": formatted_angles,
        "retry_count": 0
    }
