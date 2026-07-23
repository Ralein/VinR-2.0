"""Audio Service — VinR Buddy speech-to-text (STT) via Groq Whisper."""

import httpx
from io import BytesIO
from app.core.config import get_settings

settings = get_settings()

GROQ_AUDIO_URL = "https://api.groq.com/openai/v1/audio/transcriptions"


async def transcribe_audio_whisper(
    audio_content: bytes,
    filename: str = "recording.m4a",
) -> str | None:
    """
    Transcribe audio bytes using Groq's high-speed Whisper Large v3.

    Args:
        audio_content: Bytes of the audio file (m4a, mp3, wav, etc.)
        filename: Name of the file with extension

    Returns:
        Transcribed text or None if error/missing key
    """
    api_key = settings.GROQ_API_KEY
    if not api_key:
        print("⚠️ GROQ_API_KEY is not set. Transcription skipped.")
        return None

    try:
        # Groq Whisper expects a file-like object in a multipart form
        files = {
            "file": (filename, audio_content, "audio/m4a"),
        }
        data = {
            "model": "whisper-large-v3",
            "response_format": "json",
            "language": "en",  # Can be auto-detected, but forcing 'en' for mental health accuracy
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                GROQ_AUDIO_URL,
                headers={"Authorization": f"Bearer {api_key}"},
                files=files,
                data=data,
            )

            if response.status_code == 200:
                result = response.json()
                return result.get("text", "").strip()
            else:
                print(
                    f"⚠️ Groq Whisper error: {response.status_code} "
                    f"{response.text[:200]}"
                )
                return None

    except Exception as e:
        print(f"⚠️ Audio transcription error: {e}")
        return None
