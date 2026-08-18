from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from tavily import TavilyClient
from server.config import GROQ_MODEL_NAME, GROQ_API_KEY, GEMINI_MODEL_NAME, GOOGLE_API_KEY
from server.config import TAVILY_API_KEY

load_dotenv()

GROQ_MODEL_NAME = GROQ_MODEL_NAME
GEMINI_MODEL_NAME = GEMINI_MODEL_NAME

groq_client = ChatGroq(
    model=GROQ_MODEL_NAME,
    api_key=GROQ_API_KEY,
    timeout=30,
    max_retries=2,
    max_tokens=7000
)

gemini_client = ChatGoogleGenerativeAI(
    model=GEMINI_MODEL_NAME,
    api_key=GOOGLE_API_KEY
)

tavily_client = TavilyClient(api_key=TAVILY_API_KEY)