from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from server.agents.state import ViralBrainState

from server.config import GROQ_API_KEY

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.3,
    api_key=GROQ_API_KEY
)


def script_refiner_node(state: ViralBrainState) -> dict:
    print("\n--- [AGENT LOG] Running Script Refiner Node (Human Chat Intercept) ---")

    current_script = state.get("draft_script", "")
    feedback = state.get("human_feedback", "")
    niche = state.get("niche", "")
    language = state.get("preferred_language", "en")

    if not feedback:
        print("[REFINER] No conversational text feedback detected. Passing state forward.")
        return {}

    print(f"[REFINER] Processing Creator Directive: '{feedback}'")

    prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are an expert executive script editor. Your goal is to modify an existing short-form vertical video script "
            "based strictly on direct human conversational feedback.\n\n"
            "Execution Instructions:\n"
            "1. RETAIN STRUCTURE: Preserve the visual cues, audio timing segments, and formatting styles of the original script "
            "unless the human explicitly requests to change them.\n"
            "2. DIRECTIVES COMPLIANCE: Apply the user's specific text changes precisely. If they ask to make it less corporate, "
            "use high-stakes vocabulary or slang appropriate to the preferred language context.\n"
            "3. LANGUAGE PRESERVATION:\n"
            "   - Maintain the specified language ({language}). If hinglish, keep the spoken audio lines conversational Hindi typed in Roman script, mixed with English keywords.\n\n"
            "Output the updated script document immediately in the exact markdown lineup structure. Do not include introductory conversational filler like 'Sure, here is the updated script:'."
        )),
        ("user", (
            "Current Script Draft:\n"
            "{current_script}\n\n"
            "Human Conversational Change Directive:\n"
            "'{feedback}'"
        ))
    ])

    chain = prompt | llm
    response = chain.invoke({
        "current_script": current_script,
        "feedback": feedback,
        "language": language
    })


    return {
        "draft_script": response.content.strip(),
        "human_feedback": "",
        "retry_count": state.get("retry_count", 0) + 1
    }
