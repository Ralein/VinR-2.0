import asyncio
from app.services.kokoro_service import tts_service

async def main():
    await tts_service.bootstrap()
    engine = tts_service.engine
    print("Engine loaded!")
    res = await tts_service.text_to_speech("Testing kokoro.", persona="vinr")
    if res is not None:
        print("Success! Got bytes:", len(res))
    else:
        print("Failed to generate audio.")

asyncio.run(main())
