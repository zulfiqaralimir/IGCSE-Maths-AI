import os
from functools import lru_cache

from dotenv import load_dotenv
from openai import OpenAI
from supabase import Client, create_client

load_dotenv()


class Settings:
    supabase_url: str = os.environ["SUPABASE_URL"]
    supabase_service_key: str = os.environ["SUPABASE_SERVICE_KEY"]
    openai_api_key: str = os.environ["OPENAI_API_KEY"]
    elevenlabs_api_key: str = os.getenv("ELEVENLABS_API_KEY", "")

    ai_model: str = "gpt-4.1-mini"
    embed_model: str = "text-embedding-3-small"
    diagram_bucket: str = "diagrams"


@lru_cache
def get_settings() -> Settings:
    return Settings()


@lru_cache
def get_supabase() -> Client:
    s = get_settings()
    return create_client(s.supabase_url, s.supabase_service_key)


@lru_cache
def get_openai() -> OpenAI:
    return OpenAI(api_key=get_settings().openai_api_key)
