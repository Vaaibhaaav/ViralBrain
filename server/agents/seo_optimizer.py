import os
from pydantic import BaseModel, Field
from typing import List, Any
from langchain_groq import ChatGroq
from tavily import TavilyClient
from langchain_core.prompts import ChatPromptTemplate
from server.agents.state import ViralBrainState
from server.config import TAVILY_API_KEY, GROQ_API_KEY


class OptimizedHashtag(BaseModel):
    tag: str = Field(description="The clean hashtag string including the '#' symbol (e.g., '#AIArbitrage'). No spaces.")
    volume_tier: str = Field(
        description="Expected search density tier based on data trends: High, Medium, or Niche/Targeted.")
    strategic_purpose: str = Field(
        description="Why this tag is included (e.g., 'Broad category anchor', 'Trending viral search keyword').")


class SEOOptimizerOutput(BaseModel):
    seo_optimized_meta_description: str = Field(
        description="A 150-character search-optimized text description for video search metadata algorithms.")
    primary_keywords_isolated: List[str] = Field(
        description="Top 5 core high-intent search keywords extracted from real live index trends.")
    viral_hashtags: List[OptimizedHashtag] = Field(
        description="Exactly 5 perfectly curated hashtags containing a mix of high-volume and hyper-targeted tags.")


tavily_client = TavilyClient(TAVILY_API_KEY)
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.2,
    api_key=GROQ_API_KEY
)


def fetch_live_hashtag_trends(niche: str, topic: str) -> str:
    """Queries the live internet index to find current trending hashtags, search volumes, and breakout buzzwords."""
    if not tavily_client:
        return "Fallback baseline keywords: #AI, #Tech, #Business Trends"

    try:
        search_query = f"trending hashtags viral volume search terms keywords for {niche} {topic} 2026 shorts reels"
        raw_response = tavily_client.search(
            query=search_query,
            search_depth="advanced",
            max_results=4
        )

        snippets = [r.get("content", "") for r in raw_response.get("results", [])]
        return "\n".join(snippets)
    except Exception as e:
        print(f"⚠️ Live SEO data extraction failed. Error: {e}")
        return "Fallback baseline data placeholder due to connection interruption."


def seo_optimizer_node(state: ViralBrainState) -> Any:
    print("\n--- [AGENT LOG] Running SEO & Hashtag Optimization Agent ---")
    print(f"[DEBUG] State keys available: {list(state.keys())}")
    topic = state.get("topic", "")
    niche = state.get("niche", "General")
    draft_script_str = state.get("draft_script", "")
    preferred_language = state.get("preferred_language", "en")

    print(f"[SEO RAG] Mining real-time viral search patterns and hashtags for niche: '{niche}'...")
    live_trend_noise = fetch_live_hashtag_trends(niche, topic)

    # Bind Pydantic output constraints directly to the Groq engine
    structured_llm = llm.with_structured_output(SEOOptimizerOutput, method="json_mode")

    # 4. Construct Content Discovery Prompts
    prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are an elite Search Engine Optimization (SEO) Specialist and Social Media Discovery Engineer.\n"
            "Your objective is to review a finished video script along with live real-time internet search noise to generate discoverability assets.\n\n"
            "Strategic Indexing Directives:\n"
            "1. VIRAL HASHTAG MIX: Curate exactly 5 hashtags using a high-performance barbell distribution model:\n"
            "   - 2 Broad/High-Volume tags (e.g., millions of views, broad audience categories like #ArtificialIntelligence).\n"
            "   - 2 Medium-Volume niche indicators (e.g., specific to the sector like #NextJSDeveloper).\n"
            "   - 1 Hyper-Targeted tag (e.g., highly specific to this exact video core topic hook).\n"
            "2. FORMATTING SANITATION: Ensure every single hashtag string entry starts strictly with the '#' character, is alphanumeric, and contains absolutely zero spaces or special characters inside it.\n"
            "3. METADATA WRITING: The meta description must be a compact, keyword-dense 150-character summary that maximizes search algorithm ranking potentials without sounding spammy.\n\n"
            "You MUST respond with ONLY valid JSON. No markdown, no explanation.\n"
            "Use EXACTLY these top-level keys:\n"
            "  * 'seo_optimized_meta_description' (string, max 150 chars)\n"
            "  * 'primary_keywords_isolated' (array of exactly 5 strings)\n"
            "  * 'viral_hashtags' (array of exactly 5 objects) — NOT 'hashtags', NOT 'tags'\n"
            "    Each object MUST have exactly:\n"
            "      - 'tag' (string, starts with '#', no spaces)\n"
            "      - 'volume_tier' (string: 'High', 'Medium', or 'Niche/Targeted')\n"
            "      - 'strategic_purpose' (string)\n"
        )),
        ("user", (
            "Live Web Trend Snippets:\n{trend_context}\n\n"
            "Approved Reference Video Script text:\n{approved_script}\n\n"
            "Preferred Language: {language}"
        ))
    ])

    chain = prompt | structured_llm

    # 5. Execute Code Chain Transformation
    response = chain.invoke({
        "trend_context": live_trend_noise,
        "approved_script": draft_script_str or topic,
        "language": preferred_language,
        "schema": SEOOptimizerOutput.model_json_schema()
    })

    formatted_tags = [tag_item.model_dump() for tag_item in response.viral_hashtags]

    print(f"✅ Generated high-converting SEO metadata and isolated top 5 trending barbell hashtags.")

    result = {
        "seo_metadata": response.seo_optimized_meta_description,
        "primary_keywords": response.primary_keywords_isolated,
        "viral_hashtags": formatted_tags,
    }

    print(result)

    return result
