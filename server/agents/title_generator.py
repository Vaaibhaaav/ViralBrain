import os
from typing import List, Any

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq

from server.agents.state import ViralBrainState
from server.config import GROQ_API_KEY


class TitleVariant(BaseModel):
    title: str = Field(
        description="The on-screen text or video title. Max 50 characters. Must use high-impact triggers.")
    psychology_type: str = Field(
        description="The angle category: e.g., 'Curiosity Gap', 'Negative Framework', 'The Secret'.")


class ABPackagingPair(BaseModel):
    variant_a_hook_modifier: str = Field(
        description="Alternative opening line modification focusing on extreme curiosity.")
    variant_b_hook_modifier: str = Field(
        description="Alternative opening line modification focusing on an aggressive loss-aversion metric.")


class TitleGeneratorOutput(BaseModel):
    title_variants: List[TitleVariant] = Field(
        description="Exactly 3 high-CTR title variations tailored to the final approved script content.")
    ab_pair: ABPackagingPair = Field(
        description="An A/B hook pair variation layout allowing creators to split-test their script opening entries.")


llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.7,
    api_key=GROQ_API_KEY
)


def title_generator_node(state: ViralBrainState) -> Any:
    print("\n--- [AGENT LOG] Running A/B Title Generator Node ---")

    draft_script_str = state.get("draft_script", "")
    niche = state.get("niche", "General")
    preferred_language = state.get("preferred_language", "en")
    primary_platform = state.get("primary_platform", "")
    target_audience = state.get("target_audience", "General Audience")

    if not draft_script_str:
        print("⚠️ No script text detected in state. Running title calculations on core topic inputs.")
        draft_script_str = f"Topic Focus: {state.get('topic', 'General content asset generation')}"

    structured_llm = llm.with_structured_output(TitleGeneratorOutput, method="json_mode")
    prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are an elite {platform} Shorts Growth Hacker and algorithmic CTR optimization expert.\n"
            "Your objective is to analyze a completed vertical video script and generate hyper-optimized titles and alternative A/B testing variations.\n\n"
            "Copywriting Directives:\n"
            "1. SHORT & PUNCHY: Titles must be under 50 characters so they never get cut off on mobile viewports.\n"
            "2. EMOTIONAL TRIGGERS: Leverage proven psychological angles like the curiosity gap, counter-intuitive statements, or aggressive metrics.\n"
            "3. LINGUISTIC ALIGNMENT:\n"
            "   - If preferred_language is 'en', use crisp, high-converting western growth marketing copy.\n"
            "   - If preferred_language is 'hinglish', make the titles match natural Indian Gen-Z social trends. Blend phonetic Hindi words typed in Roman script with english hooks (e.g., 'Yeh Secret Kisi Ko Nahinn Pata 🤫').\n\n"
            "You MUST respond with ONLY valid JSON. No markdown, no explanation.\n"
            "Use EXACTLY these top-level keys:\n"
            "  * 'title_variants' (array of 3 objects) — NOT 'optimizedTitles', NOT 'titles'\n"
            "    Each object MUST have exactly:\n"
            "      - 'title' (string, max 50 chars)\n"
            "      - 'psychology_type' (string)\n"
            "  * 'ab_pair' (single object) — NOT 'altTextVariations', NOT 'ab_variants'\n"
            "    Must have exactly:\n"
            "      - 'variant_a_hook_modifier' (string)\n"
            "      - 'variant_b_hook_modifier' (string)\n"
        )),
        ("user", (
            "Creator Meta Constraints:\n"
            "- Content Niche: {niche}\n"
            "- Target Demographics: {target_audience}\n\n"
            "Approved Reference Script Material:\n"
            "{approved_script}"
        ))
    ])

    chain = prompt | structured_llm

    response = chain.invoke({
        "niche": niche,
        "platform": primary_platform,
        "target_audience": target_audience,
        "approved_script": draft_script_str,
        "schema": TitleGeneratorOutput.model_json_schema()
    })

    formatted_title_variants = [variant.model_dump() for variant in response.title_variants]
    formatted_ab_pair = (response.ab_pair.variant_a_hook_modifier, response.ab_pair.variant_b_hook_modifier)

    print("✅ Successfully optimized 3 custom title alternatives and formatted the split-test packaging metrics.")

    return {
        "title_variants": formatted_title_variants,
        "ab_pair": formatted_ab_pair
    }
