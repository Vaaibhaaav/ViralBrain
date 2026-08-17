from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field, model_validator
from typing import Any
import json, re
from server.agents.state import ViralBrainState
from server.config import GROQ_API_KEY
from server.utils.embeddings import get_creator_style_examples


class ScriptSegment(BaseModel):
    visual_cue: str = Field(
        description="On-screen actions, b-roll overlays, or text popups.")
    audio_spoken: str = Field(
        description="The exact spoken text.")
    pacing_beat: str = Field(
        description="Delivery pacing modifier (e.g., 'Deadpan', 'High Energy Explosion', 'Whisper').")

class ScriptBuilderOutput(BaseModel):
    pacing_strategy_applied: str = Field(
        description="Brief meta summary of how the viral structural framework was applied.")
    estimated_duration_seconds: int = Field(
        description="Total video length estimation in seconds.")
    timeline: list[ScriptSegment] = Field(
        description="Sequential timeline steps of the video.")


llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.3,
    api_key=GROQ_API_KEY
)


def parse_script_output(raw: str) -> ScriptBuilderOutput:
    """Strip markdown fences and parse JSON safely."""
    clean = re.sub(r"```(?:json)?|```", "", raw).strip()

    match = re.search(r'\{.*}', clean, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON object found in LLM output:\n{raw}")

    data = json.loads(match.group(0))
    return ScriptBuilderOutput(**data)


def script_writer_node(state: ViralBrainState) -> Any:
    print("\n--- [AGENT LOG] Running Script Writer Node ---")

    topic = state.get("topic", "")
    topic_details = state.get("topic_details", "")
    niche = state.get("niche", "General")
    primary_platform = state.get("primary_platform", "Instagram")
    preferred_language = state.get("preferred_language", "en")
    target_audience = state.get("target_audience", "General Audience")
    creator_id = state.get("creator_id", "default_user")
    retry_count = state.get("retry_count", 0)
    previous_critique = state.get("score_reason", "No previous critique available.")
    human_feedback = state.get("human_feedback", "")

    print(f"[STYLE RAG] Generating vector embedding for topic: '{topic}'")
    past_hits = "No previous approved scripts found for this creator style profile yet."

    print(f"[STYLE RAG] Fetching up to 3 historical voice matches for creator: {creator_id}")
    try:
        past_hits = get_creator_style_examples(
            creator_id=creator_id,
            niche=niche,
            current_topic=topic,
            limit=2
        )
    except Exception as e:
        print(f"⚠️ [STYLE RAG] Vector fetch failed, continuing without examples: {e}")

    viral_templates_data = state.get("viral_templates", {})
    templates_context = "Standard narrative structure: Hook -> Core Points -> Call to action."

    if viral_templates_data and "templates" in viral_templates_data:
        templates_list = viral_templates_data["templates"]
        template_index = min(retry_count, len(templates_list) - 1) if templates_list else 0
        if templates_list and len(templates_list) > template_index:
            top_tpl = templates_list[template_index]
            templates_context = (
                f"Pattern Framework: {top_tpl.get('pattern_name', 'Viral Structure')}\n"
                f"Hook Scaffold Blueprint: {top_tpl.get('hook_scaffold', '')}\n"
                f"Delivery Pacing Directives: {top_tpl.get('pacing_guidelines', '')}"
            )

    retry_instruction = ""
    if retry_count > 0:
        retry_instruction = (
            f"⚠️ CRITICAL REVISION COMMAND:\n"
            f"This is attempt #{retry_count}. Previous draft was REJECTED.\n"
            f"Eliminate this critique: {previous_critique}\n"
            f"Do not repeat prior hook phrasing. Use a completely different angle.\n"
        )

    if human_feedback and human_feedback.strip().lower() != "approved":
        retry_instruction += (
            f"\n🧑‍💻 HUMAN REVIEWER FEEDBACK — YOU MUST ADDRESS THIS:\n{human_feedback}\n"
            f"This takes priority over any prior critique.\n"
        )

    prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are an elite Short-Form Content Ghostwriter for tier-one vertical video creators.\n"
            "Transform concepts into highly engaging video scripts matching the creator's voice profile.\n\n"
            "FORMATTING RULES:\n"
            "1. NO INTRO FILLER: Hook within first 2 seconds. No 'Hey guys'.\n"
            "2. STYLE MATCH: Imitate the provided Creator Voice Reference Examples exactly.\n"
            "3. LANGUAGE RULE: If preferred_language is 'en', write punchy modern English. "
            "If preferred_language is 'hinglish', write Roman-script Hindi blended with English tech terms.\n"
            "4. PLATFORM: Optimize structure for {preferred_platform}.\n\n"
            "{retry_instruction}\n"
            "OUTPUT RULES — CRITICAL:\n"
            "- Respond with ONLY a valid JSON object. No markdown, no explanation.\n"
            "- Use EXACTLY these top-level keys:\n"
            "  * 'pacing_strategy_applied' (string)\n"
            "  * 'estimated_duration_seconds' (integer)\n"
            "  * 'timeline' (array) — NOT 'script', NOT 'segments'\n"
            "- Each item in 'timeline' MUST have exactly these keys:\n"
            "  * 'visual_cue' (string): on-screen action or overlay\n"
            "  * 'audio_spoken' (string): exact spoken words — NOT nested, plain string only\n"
            "  * 'pacing_beat' (string): e.g. 'High Energy', 'Deadpan', 'Whisper'\n"
        )),
        ("user", (
            "🎯 CREATOR CONFIGURATION:\n"
            "- Niche: {niche}\n"
            "- Target Audience: {target_audience}\n"
            "- Core Topic: {topic}\n"
            "- Details: {topic_details}\n"
            "- Platform: {preferred_platform}\n"
            "- Language: {preferred_language}\n\n"
            "📈 VIRAL SCAFFOLDING:\n{structural_template}\n\n"
            "📝 CREATOR VOICE EXAMPLES:\n{voice_examples}"
        ))
    ])

    chain = prompt | llm | StrOutputParser()
    raw_response = chain.invoke({
        "niche": niche,
        "target_audience": target_audience,
        "topic": topic,
        "topic_details": topic_details,
        "preferred_platform": primary_platform,
        "preferred_language": preferred_language,
        "structural_template": templates_context,
        "retry_instruction": retry_instruction,
        "voice_examples": past_hits,
    })

    try:
        response = parse_script_output(raw_response)
    except (json.JSONDecodeError, ValueError) as e:
        print(f"💥 [SCRIPT PARSE ERROR] {e}")
        print(f"[RAW OUTPUT]:\n{raw_response}")
        raise

    compiled_script_markdown = f"### 📊 PACING STRATEGY: {response.pacing_strategy_applied}\n"
    compiled_script_markdown += f"⏱️ ESTIMATED DURATION: {response.estimated_duration_seconds}s\n\n"
    compiled_script_markdown += "--- VIDEO SCRIPT RUNTIME LINEUP ---\n"

    for segment in response.timeline:
        compiled_script_markdown += f"\n🎬 VISUAL: {segment.visual_cue}\n"
        compiled_script_markdown += f"🎙️ AUDIO ({segment.pacing_beat}): \"{segment.audio_spoken}\"\n"

    print(f"✅ Script Draft #{retry_count + 1} generated successfully.")

    return {"draft_script": compiled_script_markdown.strip()}
