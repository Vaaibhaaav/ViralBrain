from server.utils.ai_client import groq_client
from langchain_core.messages import SystemMessage, HumanMessage
from server.chatbot.general_chat import generate_content

from chatbot.general_chat import generate_content_chat
from chatbot.guardrails import run_input_guardrails, run_output_guardrails
from chatbot.tool import intent_checker
from main import ChatbotMessagePayload

SYSTEM_PROMPT = '''
You are **ViralForge**, ViralBrain's AI copilot for content creators.
Help creators turn ideas and trends into engaging, platform-native content.
Prioritize:
* Strong hooks and retention
* Authentic, human-sounding writing
* The creator's niche, audience, voice, and platform
* Clear structure: Hook → Value/Story → Payoff → CTA
* Practical, production-ready outputs

Adapt trends instead of copying them. Preserve the creator's voice when editing.

Be concise, creative, confident, and actionable. Avoid filler and generic advice.

Your goal: **create content people want to keep watching.**
'''
_BLOCKING_INPUT_FLAG_PREFIXES = ("possible_prompt_injection", "empty_message")


async def generate_response(payload: ChatbotMessagePayload):
    input_flags = await run_input_guardrails(payload.user_message, "ViralForge")

    if any(flag.startswith(prefix) for flag in input_flags for prefix in _BLOCKING_INPUT_FLAG_PREFIXES):
        return {
            "response": "I can't process that message — it looks like it might be trying to override my instructions. Could you rephrase what you're trying to do?",
            "intent": "blocked",
            "input_flags": input_flags,
            "output_flags": [],
        }

    intent = await intent_checker(payload.user_message)

    if intent in ("general_chat"):
        response = await generate_content(
            payload.thread_id, payload.creator_id, payload.user_message, SYSTEM_PROMPT
        )
    elif intent in ("generated_content_check", "check_virality_numbers", "generate_content"):
        response = await generate_content_chat(
            payload.thread_id, payload.creator_id, payload.user_message, SYSTEM_PROMPT, payload.niche
        )
    else:
        response = "I'm not sure how to help with that yet — could you rephrase?"

    output_flags = await run_output_guardrails(response, SYSTEM_PROMPT)

    return {
        "response": response,
        "intent": intent,
        "input_flags": input_flags,
        "output_flags": output_flags,
    }
