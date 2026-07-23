
import asyncio
import httpx
from app.core.config import get_settings
from app.services.elevenlabs_service import text_to_speech, DEFAULT_VOICE_ID

async def main():
    settings = get_settings()
    api_key = settings.ELEVENLABS_API_KEY
    print(f"API Key: {api_key[:10]}...{api_key[-5:]}")
    print(f"Voice ID: {DEFAULT_VOICE_ID}")
    
    text = "This is a test message to verify ElevenLabs is working."
    try:
        from app.services.elevenlabs_service import _call_tts
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await _call_tts(client, api_key, text, DEFAULT_VOICE_ID)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                print(f"✅ Success! Generated {len(response.content)} bytes.")
            else:
                print(f"❌ Failed: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    import os
    import sys
    # Add project root to path
    sys.path.append(os.path.join(os.getcwd(), "apps", "backend"))
    asyncio.run(main())
