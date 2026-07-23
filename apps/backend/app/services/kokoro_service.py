"""Kokoro TTS Service — Fast local text-to-speech using kokoro-onnx."""

import os
import io
import base64
import logging
import httpx
import asyncio
from kokoro_onnx import Kokoro
import soundfile as sf
from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# ── Paths ───────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
KOKORO_DIR = os.path.join(BASE_DIR, "resources", "kokoro")
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
STATIC_GREETINGS_DIR = os.path.join(PUBLIC_DIR, "wav", "greetings")

os.makedirs(KOKORO_DIR, exist_ok=True)
os.makedirs(STATIC_GREETINGS_DIR, exist_ok=True)

MODEL_PATH = os.path.join(KOKORO_DIR, "kokoro-v1.0.onnx")
VOICES_PATH = os.path.join(KOKORO_DIR, "voices-v1.0.bin")

# ── Voice Mapping ───────────────────────────────────────────────────
# Default Kokoro voices (af = adult female, am = adult male)
PERSONA_VOICE_MAP = {
    "vinr": "af_heart",
    "hope": "af_bella",
    "sage": "am_adam",
    "therapist": "af_sarah",
    "coach": "am_michael",
}

class KokoroService:
    """Singleton TTS service using Kokoro-82M ONNX for high-speed synthesis."""
    _instance = None
    _kokoro = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(KokoroService, cls).__new__(cls)
        return cls._instance

    async def bootstrap(self):
        """Download model and voices if they don't exist."""
        urls = {
            MODEL_PATH: "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx",
            VOICES_PATH: "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin"
        }

        async with httpx.AsyncClient(follow_redirects=True, timeout=600.0) as client:
            for path, url in urls.items():
                if not os.path.exists(path):
                    print(f"📦 Downloading Kokoro asset to {os.path.basename(path)}... (This may take a minute)")
                    response = await client.get(url)
                    response.raise_for_status()
                    with open(path, "wb") as f:
                        f.write(response.content)
                    print(f"✅ Downloaded {os.path.basename(path)}")

    @property
    def engine(self) -> Kokoro:
        """Lazy load the ONNX engine."""
        if self._kokoro is None:
            if not os.path.exists(MODEL_PATH) or not os.path.exists(VOICES_PATH):
                raise RuntimeError("Kokoro assets not found. Run bootstrap() first.")
            
            print(f"🚀 Loading Kokoro-ONNX engine...")
            self._kokoro = Kokoro(MODEL_PATH, VOICES_PATH)
            print("✅ Kokoro-ONNX engine ready.")
        return self._kokoro

    async def pregenerate_greetings(self, force: bool = False):
        """Pre-generate standard greetings for all personas."""
        try:
            # First ensure we have the models
            await self.bootstrap()

            print("🎙️ Refreshing persona greetings with Kokoro...")
            for persona_id, voice in PERSONA_VOICE_MAP.items():
                file_path = os.path.join(STATIC_GREETINGS_DIR, f"{persona_id}.wav")
                
                # Ensure we have the greeting for each persona
                if os.path.exists(file_path) and not force:
                    continue
                
                persona_name = persona_id.capitalize() if persona_id != "vinr" else "VinR Buddy"
                text = f"Hey! I'm {persona_name}. Voice mode is now active — I'll speak my replies to you."
                
                print(f"   - Synthesizing {persona_id} ({voice})...")
                audio_bytes = await self.text_to_speech(text, persona=persona_id)
                if audio_bytes:
                    with open(file_path, "wb") as f:
                        f.write(audio_bytes)
            print("✅ Kokoro greetings ready.")
        except Exception as e:
            print(f"⚠️ Kokoro pre-generation failed: {str(e)}")

    async def text_to_speech(self, text: str, persona: str = "vinr") -> bytes | None:
        """Generate WAV bytes from text using Kokoro-ONNX."""
        try:
            voice = PERSONA_VOICE_MAP.get(persona.lower(), "af_heart")
            
            # Clean markdown for TTS
            clean_text = text.replace('*', '').replace('_', '').replace('#', '').strip()
            
            # Kokoro.create returns (samples, sample_rate)
            # Run in threadpool as it's CPU intensive
            samples, sample_rate = await asyncio.to_thread(
                self.engine.create, clean_text, voice=voice, speed=1.1, lang="en-us"
            )
            
            # Save to buffer using soundfile
            buffer = io.BytesIO()
            sf.write(buffer, samples, sample_rate, format='WAV')
            return buffer.getvalue()
        except Exception as e:
            print(f"❌ Kokoro TTS error: {str(e)}")
            return None

def audio_bytes_to_data_uri(audio_bytes: bytes, mime_type: str = "audio/wav") -> str:
    base64_audio = base64.b64encode(audio_bytes).decode("utf-8")
    return f"data:{mime_type};base64,{base64_audio}"

# Exportable singleton
tts_service = KokoroService()

async def text_to_speech(text: str, persona: str = "vinr") -> bytes | None:
    return await tts_service.text_to_speech(text, persona)
