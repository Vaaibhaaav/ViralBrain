import os
import asyncio
import time
import uuid
import traceback
from typing import Optional
from pprint import pprint

from fastapi import FastAPI, HTTPException , Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from server.utils.client import client
from server.utils.embeddings import create_vector
from server.utils.vector_db import init_qdrant_collections, upsert_selected_scripts
from server.agents.graph import app as viral_brain_graph
from server.chatbot.chatbot import generate_response
from server.middleware.middleware import rate_limiter

load_dotenv()
init_qdrant_collections()

app = FastAPI(title="ViralBrain Core Multi-Agent API Engine")

chat_rate_limit = rate_limiter(max_calls=15, window_seconds=60, scope="chat")
script_rate_limit = rate_limiter(max_calls=5, window_seconds=60, scope="generate_script")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ContentGenerationRequest(BaseModel):
    creator_id: str = Field(default="creator_vaibhav_01")
    thread_id: Optional[str] = Field(default=None)
    niche: str = Field(...)
    topic: str = Field(...)
    topic_details: str = Field(default="")
    preferred_language: str = Field(default="hinglish")
    target_audience: str = Field(default="Tech Students")
    primary_platform: str = Field(default="Youtube Shorts")
    preferred_personalized_output: bool = Field(default=False)


class HumanRefinementPayload(BaseModel):
    thread_id: str = Field(...)
    edited_script: Optional[str] = Field(default=None)
    chat_feedback: Optional[str] = Field(default=None)
    approve_final: bool = Field(default=False)


class ChatbotMessagePayload(BaseModel):
    thread_id: str = Field(...)
    creator_id: str = Field(...)
    client_message_id: Optional[str] = Field(default=None)
    user_message: str = Field(..., min_length=1, max_length=4000)
    metadata: Optional[dict] = Field(default=None)
    niche: Optional[str] = Field(default=None)


class ChatbotMessageResponse(BaseModel):
    thread_id: str
    reply: str
    intent: Optional[str] = None
    grounded: Optional[bool] = None
    guardrail_flags: list[str] = Field(default_factory=list)


def _build_production_assets(state: dict) -> dict:
    return {
        "script_draft": state.get("draft_script"),
        "title_packaging": state.get("title_variants"),
        "ab_split_hooks": state.get("ab_pair"),
        "linkedin_copy": state.get("linkedin_post"),
        "twitter_thread_payload": state.get("twitter_thread"),
        "seo_indexing": {
            "meta_description": state.get("seo_metadata"),
            "primary_keywords": state.get("primary_keywords"),
            "trending_tags": state.get("viral_hashtags"),
        }
    }


async def persist_approved_script(creator_id: str, niche: str, topic: str, draft_scripts: str) -> bool:
    """Vectorizes the approved script and upserts it into Qdrant.

    Returns True on success, False on failure. Caller MUST check the return
    value and surface failures — this used to fail silently.
    """
    try:
        print(f"\n💾 [PERSISTENCE] Vectorizing final script for Creator: {creator_id}...")
        point_id = str(uuid.uuid4())

        vector = await asyncio.to_thread(create_vector, draft_scripts)

        await asyncio.to_thread(
            upsert_selected_scripts,
            point_id=point_id,
            vector=vector,
            creator_id=creator_id,
            topic=topic,
            niche=niche,
            draft_script=draft_scripts,
        )

        print(f"✅ [QDRANT] Script ID {point_id} saved to creator style index.")
        return True
    except Exception as e:
        print(f"❌ [PERSISTENCE ERROR] {e}")
        print(traceback.format_exc())
        return False


@app.post("/api/v1/generate/script", dependencies=[Depends(script_rate_limit)])
async def generate_viral_content_portfolio(payload: ContentGenerationRequest):
    print(f"\n🚀 [API INBOUND] Task caught for Tenant: {payload.creator_id}")
    active_thread_id = payload.thread_id or f"session_{uuid.uuid4().hex[:8]}"
    config = {"configurable": {"thread_id": active_thread_id}}

    initial_graph_state = {
        "creator_id": payload.creator_id,
        "niche": payload.niche,
        "topic": payload.topic,
        "topic_details": payload.topic_details,
        "preferred_language": payload.preferred_language,
        "target_audience": payload.target_audience,
        "primary_platform": payload.primary_platform,
        "preferred_personalized_output": payload.preferred_personalized_output,
        "retry_count": 0,
        "virality_score": 0.0,
        "score_reason": "",
    }

    try:
        print("[ORCHESTRATOR] Invoking graph asynchronously...")
        final_state = await viral_brain_graph.ainvoke(initial_graph_state, config)

        print("=" * 80)
        pprint(final_state)
        print("=" * 80)
        print(f"✨ [API OUTBOUND] Graph paused at review gate for thread: {active_thread_id}")

        return {
            "status": "paused_at_review_gate",
            "thread_id": active_thread_id,
            "data": {
                "final_virality_score": final_state.get("virality_score"),
                "audit_logs": final_state.get("score_reason"),
                "total_revision_cycles": final_state.get("retry_count", 1) - 1,
                "production_assets": _build_production_assets(final_state),
            }
        }

    except Exception as e:
        print(f"💥 [API ERROR] {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/generate/review")
async def process_human_refinement_iteration(payload: HumanRefinementPayload):
    print(f"\n✋ [HITL INTERCEPT] Action caught for Thread: {payload.thread_id}")
    print(
        f"[HITL DEBUG] edited_script={bool(payload.edited_script)}, "
        f"chat_feedback={bool(payload.chat_feedback)}, approve_final={payload.approve_final}"
    )

    config = {"configurable": {"thread_id": payload.thread_id}}

    try:
        snapshot = viral_brain_graph.get_state(config)
        if not snapshot or not snapshot.values:
            raise HTTPException(
                status_code=404,
                detail=f"Thread ID '{payload.thread_id}' does not exist or has no active state history."
            )

        if not (payload.edited_script or payload.chat_feedback or payload.approve_final):
            raise HTTPException(
                status_code=400,
                detail="Payload must include edited_script, chat_feedback, or approve_final=true.",
            )

        if payload.edited_script:
            print("[HITL] Overwriting draft_script in graph state...")
            viral_brain_graph.update_state(
                config,
                {"draft_script": payload.edited_script},
                as_node="seo_optimizer_node",
            )

        if payload.chat_feedback:
            print(f"[HITL] Injecting chat feedback: '{payload.chat_feedback}'")
            current_values = snapshot.values
            viral_brain_graph.update_state(
                config,
                {
                    "human_feedback": payload.chat_feedback,
                    "retry_count": current_values.get("retry_count", 0) + 1,
                },
                as_node="seo_optimizer_node",
            )

        if payload.chat_feedback:
            print("[HITL] Resuming graph from checkpoint...")
            updated_state = await viral_brain_graph.ainvoke(None, config)
        else:
            updated_state = viral_brain_graph.get_state(config).values

        persisted = None
        if payload.approve_final:
            persisted = await persist_approved_script(
                creator_id=updated_state.get("creator_id", "unknown"),
                niche=updated_state.get("niche", ""),
                topic=updated_state.get("topic", ""),
                draft_scripts=updated_state.get("draft_script", ""),
            )
            if not persisted:
                raise HTTPException(
                    status_code=502,
                    detail="Script approved but failed to persist to the vector store. Check server logs for the underlying error.",
                )

        is_done = payload.approve_final
        status_tag = "execution_complete" if is_done else "paused_at_next_checkpoint"
        msg = (
            "Portfolio finalized and exported."
            if is_done
            else "Script adjusted and assets updated."
        )

        return {
            "status": status_tag,
            "message": msg,
            "persisted": persisted,
            "data": {
                "final_virality_score": updated_state.get("virality_score"),
                "audit_logs": updated_state.get("score_reason"),
                "total_revision_cycles": updated_state.get("retry_count", 1) - 1,
                "production_assets": _build_production_assets(updated_state),
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"💥 [HITL ERROR] {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/chat", response_model=ChatbotMessageResponse, dependencies=[Depends(chat_rate_limit)])
async def user_to_chatbot(payload: ChatbotMessagePayload):
    print(f"[USER->CHATBOT MESSAGE] thread={payload.thread_id} creator={payload.creator_id}")
    try:
        result = await generate_response(payload)

        return ChatbotMessageResponse(
            thread_id=payload.thread_id,
            reply=result["response"],
            intent=result["intent"],
            guardrail_flags=result["input_flags"] + result["output_flags"],
        )

    except Exception as e:
        print(f"💥 [CHAT ERROR] {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def server_health_check():
    info = client.get_collection("selected_scripts_corpus")
    print(info.payload_schema)
    records, _ = client.scroll(
        collection_name="selected_scripts_corpus",
        limit=20,
        with_payload=True,
    )
    for r in records:
        print(r.payload.get("creator_id"), "|", r.payload.get("niche"))
    return {"status": "operational", "engine": "ViralBrain FastAPI v1"}
