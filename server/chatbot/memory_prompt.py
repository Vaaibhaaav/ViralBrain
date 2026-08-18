import json

from server.utils.database import get_pool

DEFAULT_STATE = {
    "summary": "",
    "recent_messages": [],
    "total_message_count": 0,
    "next_summary_threshold": 20,
}


async def load_thread_memory(thread_id: str) -> dict:
    pool = await get_pool()
    row = await pool.fetchrow(
        """
        SELECT summary, recent_messages, total_message_count, next_summary_threshold
        FROM chat_memory WHERE thread_id = $1
        """,
        thread_id,
    )
    if row:
        return {
            "summary": row["summary"] or "",
            "recent_messages": json.loads(row["recent_messages"]) if row["recent_messages"] else [],
            "total_message_count": row["total_message_count"] or 0,
            "next_summary_threshold": row["next_summary_threshold"] or 20,
        }
    return dict(DEFAULT_STATE)


async def save_thread_memory(thread_id: str, creator_id: str, state: dict):
    pool = await get_pool()
    await pool.execute(
        """
        INSERT INTO chat_memory (
            thread_id, creator_id, summary, recent_messages,
            total_message_count, next_summary_threshold, updated_at
        )
        VALUES ($1, $2, $3, $4::jsonb, $5, $6, now())
        ON CONFLICT (thread_id)
        DO UPDATE SET
            summary = $3,
            recent_messages = $4::jsonb,
            total_message_count = $5,
            next_summary_threshold = $6,
            updated_at = now()
        """,
        thread_id,
        creator_id,
        state["summary"],
        json.dumps(state["recent_messages"]),
        state["total_message_count"],
        state["next_summary_threshold"],
    )