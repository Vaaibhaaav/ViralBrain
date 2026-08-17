import os

from qdrant_client import QdrantClient
from dotenv import load_dotenv

from server.config import CLUSTER_ENDPOINT, QDRANT_API_KEY

load_dotenv()
client = QdrantClient(
    url= CLUSTER_ENDPOINT,
    api_key= QDRANT_API_KEY,
    cloud_inference=True
)

