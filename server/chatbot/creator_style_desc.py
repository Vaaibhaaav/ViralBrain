from langchain_core.messages import HumanMessage
from server.utils.ai_client import groq_client
from server.utils.embeddings import get_creator_style_examples

from server.utils.embeddings import TOP_N_AFTER_RERANK


async def generate_style_description(examples: list[dict], niche: str) -> str:
    """
    Given the top reranked style examples, ask the LLM for a short
    (2-4 sentence) description of the creator's voice/style.
    """
    if not examples:
        return "No previous approved scripts available to derive a style profile."

    examples_text = "\n\n".join(
        f"--- Example {i} ---\n{ex['script']}\nVisual Cue: {ex['visual_cue']}"
        for i, ex in enumerate(examples, start=1)
    )

    prompt = f"""
        Based on the following approved scripts from a content creator in the "{niche}" niche,
        write a short (2-4 sentence) description of their writing/voice style — tone, pacing,
        vocabulary, hook style, and anything distinctive. Be specific, not generic.

        {examples_text}

        STYLE DESCRIPTION:"""

    try:
        response = await groq_client.ainvoke([HumanMessage(content=prompt)])
        return response.content
    except Exception as e:
        print(f"⚠️ Failed to generate style description: {e}")
        return "Style description unavailable due to system fallback state."


async def get_creator_style(creator_id: str, niche: str = "None", current_topic: str = "General") -> str:
    examples = get_creator_style_examples(creator_id, niche, current_topic, limit=TOP_N_AFTER_RERANK)
    return await generate_style_description(examples, niche)
