"""ElevenLabs text-to-speech service."""

from __future__ import annotations

import httpx

from backend.config import get_settings

# Rachel — clear, educational tone, widely available on all ElevenLabs tiers
VOICE_ID = "21m00Tcm4TlvDq8ikWAM"
MAX_CHARS = 2500


async def synthesise(text: str) -> bytes:
    api_key = get_settings().elevenlabs_api_key
    if not api_key:
        raise ValueError("ELEVENLABS_API_KEY is not configured")

    # Collapse whitespace and hard-cap length to control cost / latency
    clean = " ".join(text.split())[:MAX_CHARS]

    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}",
            headers={
                "xi-api-key": api_key,
                "Content-Type": "application/json",
                "Accept": "audio/mpeg",
            },
            json={
                "text": clean,
                "model_id": "eleven_turbo_v2",
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
            },
        )
        res.raise_for_status()
        return res.content
