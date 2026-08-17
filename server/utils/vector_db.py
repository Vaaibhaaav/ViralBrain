from server.utils.client import client
from qdrant_client.models import VectorParams, Distance, PointStruct, Filter, FieldCondition, MatchValue , PayloadSchemaType

COLLECTION_NAME = "vector_corpus"
SCRIPT_COLLECTION_NAME = "selected_scripts_corpus"


def init_qdrant_collections():
    """Initializes both collections safely if they do not exist."""
    # Patch 1: Ensure both collections are explicitly verified and set up
    if not client.collection_exists(COLLECTION_NAME):
        client.create_collection(
            COLLECTION_NAME,
            vectors_config=VectorParams(size=768, distance=Distance.COSINE)
        )

    if not client.collection_exists(SCRIPT_COLLECTION_NAME):
        client.create_collection(
            SCRIPT_COLLECTION_NAME,
            vectors_config=VectorParams(size=768, distance=Distance.COSINE)
        )

    client.create_payload_index(
        collection_name=COLLECTION_NAME,
        field_name="niche",
        field_schema=PayloadSchemaType.KEYWORD,
    )

    client.create_payload_index(
        collection_name=SCRIPT_COLLECTION_NAME,
        field_name="creator_id",
        field_schema=PayloadSchemaType.KEYWORD,
    )
    client.create_payload_index(
        collection_name=SCRIPT_COLLECTION_NAME,
        field_name="niche",
        field_schema=PayloadSchemaType.KEYWORD,
    )


def upsert_viral_transcripts(point_id: int, vector: list, transcript: str, niche: str, creator_id: str = "system"):
    """
    Upserts a trending transcript into the global knowledge corpus.
    Defaults to 'system' to make it globally accessible by niche.
    """
    client.upsert(COLLECTION_NAME, points=[
        PointStruct(
            id=point_id,
            vector=vector,
            payload={
                "transcript": transcript,
                "niche": niche,
                "creator_id": creator_id
            }
        )
    ])


def upsert_selected_scripts(point_id: int, vector: list, draft_script: str, topic : str,
                            niche: str, creator_id: str):
    """Upserts an approved user script configuration into their isolated voice profile database."""
    client.upsert(SCRIPT_COLLECTION_NAME, points=[
        PointStruct(
            id=point_id,
            vector=vector,
            payload={
                "draft_script": draft_script,
                "topic" : topic,
                "niche": niche,
                "creator_id": creator_id
            }
        )
    ])


def query_tenant_transcripts(query_vector: list, niche: str, limit: int = 20):
    """
    Queries the global trending trends collection.
    Patch 2: Removed creator_id restriction so agents can scan all platform trends for this niche.
    """
    search_result = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        query_filter=Filter(
            must=[
                FieldCondition(
                    key="niche",
                    match=MatchValue(value=niche)
                )
            ]
        ),
        limit=limit,
        with_payload=True,
        timeout=5
    )
    return search_result.points


def query_selected_scripts(query_vector: list, creator_id: str, niche: str, limit: int = 5):
    """
    Queries the private creator history collection.
    Guarantees strict data isolation boundaries—users can ONLY see their own past scripts.
    """
    search_result = client.query_points(
        collection_name=SCRIPT_COLLECTION_NAME,
        query=query_vector,
        query_filter=Filter(
            must=[
                FieldCondition(
                    key="creator_id",
                    match=MatchValue(value=creator_id)
                ),
                FieldCondition(
                    key="niche",
                    match=MatchValue(value=niche)
                )
            ]
        ),
        limit=limit,
        with_payload=True,
        timeout=5
    )
    return search_result.points
