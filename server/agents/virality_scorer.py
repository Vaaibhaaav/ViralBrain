from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI  # ✅ Fix 1
from pydantic import BaseModel, Field

from server.agents.state import ViralBrainState
from server.config import GOOGLE_API_KEY

GEMINI_API_KEY = GOOGLE_API_KEY


class ViralityScorerOutput(BaseModel):
    virality_score: float = Field(
        description="A strict numeric score from 0 to 100 assessing the CTR potential of the hook.")
    dominant_emotional_trigger: str = Field(
        description="The primary trigger detected: FOMO, Curiosity Gap, Outrage, Urgency, or Information Gain.")
    critique_rationale: str = Field(
        description="Deep analytical explanation of why the hook scored this way. Be highly critical.")
    actionable_remedy: str = Field(
        description="Clear, explicit instructions on how to rewrite the hook to raise the score.")


google_client = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    api_key=GEMINI_API_KEY
)


def virality_scorer_node(state: ViralBrainState) -> dict:
    print("\n--- [AGENT LOG] Running Virality Scorer Node (The Gatekeeper) ---")

    draft_script_str = state.get("draft_script", "")
    retry_count = state.get("retry_count", 0)

    hook_text_to_evaluate = ""
    if draft_script_str:
        lines = draft_script_str.split("\n")
        for line in lines:
            if line.startswith("🎙️ AUDIO"):
                start_idx = line.find('"')
                end_idx = line.rfind('"')
                if start_idx != -1 and end_idx != -1:
                    hook_text_to_evaluate = line[start_idx + 1: end_idx]
                    break

    if not hook_text_to_evaluate:
        print("⚠️ Failed to parse spoken hook. Forcing fallback score.")
        return {
            "virality_score": 0.0,
            "score_reason": "Could not extract spoken hook text.",
            "retry_count": retry_count + 1
        }

    print(f"[EVALUATION RUN] Isolated Spoken Hook to Grade: \"{hook_text_to_evaluate}\"")
    print(f"[RETRY TRACKER] Current iteration attempt count: {retry_count}")

    system_instruction = (
        "You are an elite, highly cynical Social Media Data Scientist and Hook Auditor.\n"
        "Your sole job is to review short-form video hooks and assign a cold, metrics-driven virality score from 0 to 100.\n\n"
        "Scoring Heuristics:\n"
        "- Scores above 80: Flawless curiosity gap, immediate high-contrast pacing, specific numbers, zero intro filler.\n"
        "- Scores 60 to 80: Good concept, but uses generic vocabulary or lacks an instant high-stakes emotional trigger.\n"
        "- Scores below 60: Passive wording, reads like a textbook headline, lacks stakes, or contains introductory waste words.\n\n"
        "Be brutally honest. If a hook is weak, grade it under 60 and provide a precise actionable structural remedy."
    )

    user_prompt = f"""
        Target Niche: {state.get('niche', 'General')}
        Target Audience Profile: {state.get('target_audience', 'General')}

        Spoken Hook Line To Analyze:
        \"{hook_text_to_evaluate}\"
        """

    complete_prompt = ChatPromptTemplate(
        messages=[SystemMessage(system_instruction), HumanMessage(user_prompt)],
    )

    structured_llm = google_client.with_structured_output(ViralityScorerOutput)
    chain = complete_prompt | structured_llm

    result = chain.invoke({})

    return {
        "virality_score": result.virality_score,                          # ✅ Fix 2
        "score_reason": (                                                  # ✅ Fix 3
            f"{result.dominant_emotional_trigger} | "
            f"{result.critique_rationale} | "
            f"{result.actionable_remedy}"
        ),
        "retry_count": retry_count + 1
    }