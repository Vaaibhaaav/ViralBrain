import time

import requests

from server.config import JINA_API_KEY
from server.utils.vector_db import query_selected_scripts
from langchain_core.messages import HumanMessage

JINA_EMBEDDING_URL = "https://api.jina.ai/v1/embeddings"
JINA_RERANK_URL = "https://api.jina.ai/v1/rerank"

RERANK_MODEL = "jina-reranker-v2-base-multilingual"
CANDIDATE_POOL_SIZE = 5
TOP_N_AFTER_RERANK = 2


def create_vector(text_query: str, task: str = "retrieval.passage", max_retries: int = 2):
    headers = {
        "Authorization": f"Bearer {JINA_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "jina-embeddings-v4",
        "input": [text_query],
        "dimensions": 768,
        "task": task,
    }

    last_error = None
    for attempt in range(1, max_retries + 1):
        try:
            response = requests.post(JINA_EMBEDDING_URL, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            return response.json()["data"][0]["embedding"]
        except requests.exceptions.Timeout as e:
            last_error = e
            print(f"⚠️ Jina embedding timed out (attempt {attempt}/{max_retries})")
            if attempt < max_retries:
                time.sleep(2 * attempt)
            continue
        except Exception as e:
            print(f"❌ Error creating embedding: {e}")
            raise

    print(f"❌ Error creating embedding after {max_retries} attempts: {last_error}")
    raise last_error


def rerank_documents(query: str, documents: list[str], top_n: int = TOP_N_AFTER_RERANK, max_retries: int = 2) -> list[int]:
    """
    Rerank `documents` against `query` with Jina's cross-encoder reranker.
    Returns the indices of the top_n documents into the original list,
    ordered best-first.

    Raises on failure — caller should fall back to the embedding-search
    order rather than lose results silently.
    """
    if not documents:
        return []

    headers = {
        "Authorization": f"Bearer {JINA_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": RERANK_MODEL,
        "query": query,
        "documents": documents,
        "top_n": min(top_n, len(documents)),
    }

    last_error = None
    for attempt in range(1, max_retries + 1):
        try:
            response = requests.post(JINA_RERANK_URL, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            result = response.json()
            return [item["index"] for item in result["results"]]
        except requests.exceptions.Timeout as e:
            last_error = e
            print(f"⚠️ Jina rerank timed out (attempt {attempt}/{max_retries})")
            if attempt < max_retries:
                time.sleep(2 * attempt)
            continue
        except Exception as e:
            print(f"❌ Error reranking: {e}")
            raise

    print(f"❌ Error reranking after {max_retries} attempts: {last_error}")
    raise last_error


def get_creator_style_examples(creator_id: str, niche: str, current_topic: str, limit: int = TOP_N_AFTER_RERANK) -> list[dict]:
    """
    Returns up to `limit` reranked style examples as a list of dicts:
    [{"script": ..., "visual_cue": ...}, ...]
    Empty list on no results or total failure (caller decides fallback text).
    """
    semantic_search_text = f"Topic: {current_topic}\nNiche: {niche}"

    try:
        query_vector = create_vector(semantic_search_text, task="retrieval.query")

        search_results = query_selected_scripts(
            query_vector=query_vector,
            creator_id=creator_id,
            niche=niche,
            limit=CANDIDATE_POOL_SIZE,
        )

        if not search_results:
            return []

        candidate_texts = [
            (hit.payload.get("draft_script") or hit.payload.get("transcript", ""))
            for hit in search_results
        ]

        try:
            top_indices = rerank_documents(semantic_search_text, candidate_texts, top_n=limit)
        except Exception as e:
            print(f"⚠️ Rerank failed, falling back to vector-search order: {e}")
            top_indices = list(range(min(limit, len(search_results))))

        return [
            {
                "script": candidate_texts[i],
                "visual_cue": search_results[i].payload.get("visual_cue", "N/A"),
            }
            for i in top_indices
        ]

    except Exception as e:
        print(f"⚠️ Failed to pull voice profile examples: {e}")
        return []


