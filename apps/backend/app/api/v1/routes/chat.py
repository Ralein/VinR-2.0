"""VinR Buddy chat routes — Ephemeral in-memory chat (Genshin-style)."""

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.services.chat_service import (
    memory_get_history,
    memory_save_message,
    memory_clear,
    generate_buddy_response,
)
from app.services.audio_service import transcribe_audio_whisper
from app.services.kokoro_service import text_to_speech, audio_bytes_to_data_uri


router = APIRouter(prefix="/chat", tags=["chat"])


# ── Request / Response schemas ───────────────────────────────────────

class SendMessageRequest(BaseModel):
    text: str
    voice_enabled: bool = False
    persona: str = "vinr"  # Default persona



class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    audio_url: str | None = None
    persona: str | None = None
    created_at: str


class SendMessageResponse(BaseModel):
    user_message: ChatMessageResponse
    buddy_message: ChatMessageResponse


# ── Routes ───────────────────────────────────────────────────────────

@router.post("/message", response_model=SendMessageResponse)
async def send_message(
    request: SendMessageRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),  # Still needed for adaptive_service user profile
):
    """Send a message to VinR Buddy and get a response (ephemeral — no DB save)."""
    user_id = current_user["sub"]

    # Check for /voice command or voice_enabled flag
    is_voice = request.voice_enabled or request.text.strip().startswith("/voice")
    clean_text = request.text.strip()
    if clean_text.startswith("/voice"):
        clean_text = clean_text.replace("/voice", "", 1).strip()

    if not clean_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Save user message to memory (not DB)
    user_msg = memory_save_message(
        user_id, "user", clean_text, persona=request.persona
    )

    # Generate buddy response (reads memory for context)
    buddy_text = await generate_buddy_response(
        db, user_id, clean_text, persona=request.persona
    )

    # Optional: generate voice
    audio_url = None
    if is_voice:
        audio_bytes = await text_to_speech(buddy_text, persona=request.persona)
        if audio_bytes:
            audio_url = audio_bytes_to_data_uri(audio_bytes)

    # Save buddy message to memory (not DB)
    buddy_msg = memory_save_message(
        user_id, "assistant", buddy_text,
        audio_url=audio_url, persona=request.persona,
    )

    return SendMessageResponse(
        user_message=ChatMessageResponse(
            id=user_msg["id"],
            role=user_msg["role"],
            content=user_msg["content"],
            audio_url=user_msg["audio_url"],
            created_at=user_msg["created_at"],
        ),
        buddy_message=ChatMessageResponse(
            id=buddy_msg["id"],
            role=buddy_msg["role"],
            content=buddy_msg["content"],
            audio_url=buddy_msg["audio_url"],
            created_at=buddy_msg["created_at"],
        ),
    )


@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
):
    """Voice to text using Groq Whisper."""
    try:
        print(f"🎤 Received transcription request: {file.filename} ({file.content_type})")
        content = await file.read()
        print(f"📊 Audio data size: {len(content)} bytes")
        
        if len(content) == 0:
            raise ValueError("Empty audio file received")

        text = await transcribe_audio_whisper(content, filename=file.filename)
        
        if not text:
            print("⚠️ Transcription service returned no text")
            raise HTTPException(status_code=400, detail="Transcription failed to produce text")
            
        print(f"📝 Transcribed text: {text[:50]}...")
        return {"text": text}
    except Exception as e:
        import traceback
        print(f"❌ Transcribe route error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


class TTSRequest(BaseModel):
    text: str
    persona: str = "vinr"


@router.post("/tts")
async def generate_tts(
    request: TTSRequest,
    current_user: dict = Depends(get_current_user),
):
    """Generate TTS audio for arbitrary text (e.g. intro greetings)."""
    audio_bytes = await text_to_speech(request.text, persona=request.persona)
    if not audio_bytes:
        return {"audio_url": None}

    return {"audio_url": audio_bytes_to_data_uri(audio_bytes)}


@router.get("/history")
async def get_history(
    current_user: dict = Depends(get_current_user),
):
    """Fetch conversation history from in-memory store (ephemeral)."""
    user_id = current_user["sub"]
    messages = memory_get_history(user_id, limit=50)

    return {
        "messages": [
            {
                "id": msg["id"],
                "role": msg["role"],
                "content": msg["content"],
                "audio_url": msg["audio_url"],
                "created_at": msg["created_at"],
            }
            for msg in messages
        ]
    }


@router.delete("/history")
async def delete_history(
    current_user: dict = Depends(get_current_user),
):
    """Clear all conversation history from memory for the current user."""
    user_id = current_user["sub"]
    count = memory_clear(user_id)
    return {"deleted": count, "message": "Conversation cleared"}
