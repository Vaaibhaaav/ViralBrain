from dotenv import load_dotenv
from pathlib import Path
import os

env_path = Path(__file__).resolve().parent / ".env"

print("Loading env from:", env_path)

load_dotenv(env_path)

print("GROQ =", repr(os.getenv("GROQ_API_KEY")))
QDRANT_API_KEY = os.environ.get("QDRANT_API_KEY")
CLUSTER_ENDPOINT = os.environ.get("CLUSTER_ENDPOINT")
GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
JINA_API_KEY = os.getenv("JINA_API_KEY")
GROQ_MODEL_NAME = os.getenv("GROQ_MODEL_NAME")
GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME")
NEON_DATABASE_URL = os.environ.get("NEON_DATABASE_URL")