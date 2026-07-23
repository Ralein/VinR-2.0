
import sys
import os
sys.path.append(os.getcwd())
from app.core.config import get_settings
import asyncio

async def test_settings():
    settings = get_settings()
    print(f"YOUTUBE_API_KEY: {settings.YOUTUBE_API_KEY[:5]}...")
    
    from app.services.media_service import search_youtube_reels
    reels = await search_youtube_reels("Stress Relief", max_results=1)
    print(f"Found {len(reels)} reels")
    if reels:
        print(f"First reel: {reels[0]['title']}")

if __name__ == "__main__":
    asyncio.run(test_settings())
