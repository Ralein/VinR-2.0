import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def check():
    async with AsyncSessionLocal() as session:
        try:
            result = await session.execute(text("SELECT version_num FROM alembic_version"))
            version = result.scalar()
            print(f"Current version: {version}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check())
