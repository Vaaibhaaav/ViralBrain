from typing import Literal

from langchain_core.messages import SystemMessage, HumanMessage

from server.chatbot.creator_style_desc import get_creator_style
from server.utils.ai_client import gemini_client
from server.utils.ai_client import tavily_client

Intent = Literal[
    "general_chat",
    "generated_content_check",
    "check_virality_numbers",
    "generate_content",
    "other",
]

VALID_INTENTS: set[str] = {
    "general_chat",
    "generated_content_check",
    "check_virality_numbers",
    "generate_content",
    "other",
}


SYSTEM_PROMPT = """
You are the intent classifier for ViralBrain, an AI platform for content creators.

Classify the user's request into EXACTLY ONE of these intents:

1. general_chat
General questions, brainstorming, opinions, trends, or information.
Example: "What type of AI content is trending right now?"

2. generated_content_check
The user provides existing content and wants it analyzed, improved, rewritten,
rated, or checked for their audience.
Example: "Will this script work for my profile?"
Example: "Improve this hook."

3. check_virality_numbers
The user asks about content performance or metrics such as views, likes,
comments, reach, engagement, retention, CTR, or comparisons between posts.
Example: "Is 10k views good for my account?"
Example: "Compare these two post statistics."

4. generate_content
The user wants NEW content created, such as a script, hook, caption,
content idea, title, or CTA.
Example: "Write me a 30-second script about AI agents."

5. other
Anything that does not fit the above categories.

Important rules:
- If the user wants NEW content, use generate_content.
- If the user provides EXISTING content and wants feedback or changes,
  use generated_content_check.
- If the request is about performance metrics, use check_virality_numbers.
- Return ONLY the intent name.
- Do not explain your answer.
"""


async def intent_checker(user_request: str) -> Intent:
    """
    Classify a user request into one of ViralBrain's supported intents.
    """

    try:
        response = await gemini_client.ainvoke(
            [
                SystemMessage(content=SYSTEM_PROMPT),
                HumanMessage(content=user_request),
            ]
        )

        intent = response.content.strip().lower()

        if intent in VALID_INTENTS:
            return intent  # type: ignore

        return "other"

    except Exception:
        return "general_chat"

async def tavily_search_tool(user_query: str) -> list[str]:
    '''
    Search the web for the user query and return relevant real-time information
    on topics like current affairs or trending content.
    '''
    try:
        return await tavily_client.search(user_query, max_results=5)
    except Exception as e:
        print(f"⚠️ Tavily search failed: {e}")
        return []


async def creator_style(creator_id:  str , niche : str = "None",current_topic : str = "General")->str:
    '''
    Get the idea of what the user really likes while giving the intetn
    '''
    return await get_creator_style(creator_id,niche,current_topic)