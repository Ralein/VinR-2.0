import asyncio
from app.api.v1.routes.auth import register
from app.schemas.user import UserRegister
from app.core.database import AsyncSessionLocal

async def test_register():
    user_in = UserRegister(email="direct_test2@example.com", password="password123", name="Direct Test")
    async with AsyncSessionLocal() as db:
        try:
            res = await register(user_in=user_in, db=db)
            print("Success!", res)
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_register())
