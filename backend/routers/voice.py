"""
POST /voice
Accepts explanation text, returns MP3 audio stream from ElevenLabs.
Non-blocking: the frontend calls this only when the student clicks 🔊 Listen.
"""

from __future__ import annotations

import io
import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from backend.services.voice import synthesise

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/voice", tags=["voice"])


class VoiceRequest(BaseModel):
    text: str


@router.post("")
async def generate_voice(req: VoiceRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="text is required")
    try:
        audio_bytes = await synthesise(req.text)
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={"Cache-Control": "no-store"},
        )
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.error("ElevenLabs error: %s", exc)
        raise HTTPException(status_code=502, detail="Voice generation failed")
