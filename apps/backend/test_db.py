import asyncio
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.core.security import get_password_hash

async def test_db():
    try:
        async with AsyncSessionLocal() as db:
            user = User(
                id=str(import_uuid.uuid4()) if 'import_uuid' in locals() else str(__import__('uuid').uuid4()),
                email="test_err_3@example.com",
                password_hash=get_password_hash("password123"),
                name="Error Test",
            )
            db.add(user)
            await db.commit()
            print("Successfully created user!")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_db())
