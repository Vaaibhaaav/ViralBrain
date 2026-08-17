import traceback

from fastapi import HTTPException
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from server.chatbot.memory_prompt import load_thread_memory, save_thread_memory

from chatbot.creator_style_desc import get_creator_style
from utils.ai_client import groq_client

KEEP_VERBATIM = 5


def get_next_threshold(current_threshold: int) -> int:
    """
    Schedule: 20 -> 40 -> 80 -> 100 -> then +40 forever (140, 180, 220, ...)
    """
    if current_threshold < 40:
        return 40
    if current_threshold < 80:
        return 80
    if current_threshold < 100:
        return 100
    return current_threshold + 40


async def append_message_and_maybe_summarize(state: dict, new_message: dict) -> dict:
    state["recent_messages"].append(new_message)
    state["total_message_count"] += 1

    if state["total_message_count"] >= state["next_summary_threshold"]:
        to_summarize = state["recent_messages"][:-KEEP_VERBATIM]
        remaining = state["recent_messages"][-KEEP_VERBATIM:]

        if to_summarize:
            new_summary = await summarize_and_merge(
                existing_summary=state["summary"],
                new_messages=to_summarize,
            )
            state["summary"] = new_summary
            state["recent_messages"] = remaining

        state["next_summary_threshold"] = get_next_threshold(state["next_summary_threshold"])

    return state


async def summarize_and_merge(existing_summary: str, new_messages: list[dict]) -> str:
    conversation_chunk = "\n".join(f"{m['role']}: {m['content']}" for m in new_messages)

    prompt = f"""
        Update the running summary of this conversation by incorporating the new messages below.
        Keep it concise — preserve key facts, decisions, and the creator's stated preferences. Don't restate
        things already captured; just merge in what's new.

        EXISTING SUMMARY:
        {existing_summary or "(none yet — this is the first summary)"}

        NEW MESSAGES TO INCORPORATE:
        {conversation_chunk}

        UPDATED SUMMARY:"""

    try:
        response = await groq_client.ainvoke([HumanMessage(content=prompt)])
        return response.content
    except Exception:
        print("💥 [SUMMARY ERROR]")
        print(traceback.format_exc())
        return existing_summary


def build_messages_for_llm(state: dict, new_user_message: str, system_prompt: str) -> list:
    messages = [SystemMessage(content=system_prompt)]

    if state["summary"]:
        messages.append(SystemMessage(content=f"Earlier conversation summary:\n{state['summary']}"))

    for m in state["recent_messages"]:
        cls = HumanMessage if m["role"] == "user" else AIMessage
        messages.append(cls(content=m["content"]))

    messages.append(HumanMessage(content=new_user_message))
    return messages


async def generate_content(thread_id: str, creator_id: str, user_message: str, system_prompt: str):
    try:
        state = await load_thread_memory(thread_id)
        messages = build_messages_for_llm(state, user_message, system_prompt)
        response = await groq_client.ainvoke(messages)
        reply_text = response.content

        state = await append_message_and_maybe_summarize(state, {"role": "user", "content": user_message})
        state = await append_message_and_maybe_summarize(state, {"role": "assistant", "content": reply_text})

        save_thread_memory(thread_id, creator_id, state)
        return {"thread_id": thread_id, "reply": reply_text}

    except Exception as e:
        print(f"💥 [CHAT ERROR] {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


async def generate_content_chat(
    thread_id: str,
    creator_id: str,
    user_message: str,
    system_prompt: str,
    niche: str = "None",
) -> dict:
    try:
        state = await load_thread_memory(thread_id)

        # Fetch style using the actual user request as the topic, so
        # retrieval is relevant to *this* request, not a generic default.
        creator_style_text = await get_creator_style(
            creator_id=creator_id,
            niche=niche,
            current_topic=user_message,
        )

        # Prepend style context for THIS call only — don't mutate the
        # message that gets stored in history.
        prompted_message = (
            f"Here is my preferred style for scripts and other content:\n"
            f"{creator_style_text}\n\n"
            f"Request: {user_message}"
        )

        messages = build_messages_for_llm(state, prompted_message, system_prompt)
        response = await groq_client.ainvoke(messages)
        reply_text = response.content

        # Store the ORIGINAL user message, not the style-prefixed one.
        state = await append_message_and_maybe_summarize(state, {"role": "user", "content": user_message})
        state = await append_message_and_maybe_summarize(state, {"role": "assistant", "content": reply_text})

        await save_thread_memory(thread_id, creator_id, state)
        return {"thread_id": thread_id, "reply": reply_text}

    except Exception as e:
        print(f"💥 [CHAT ERROR] {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))