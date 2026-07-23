import asyncio
from app.api.v1.routes.auth import register, login
from app.schemas.user import UserRegister, UserLogin
from app.core.database import AsyncSessionLocal

async def test_auth():
    email = "test99@example.com"
    password = "password123"
    
    async with AsyncSessionLocal() as db:
        try:
            # Register
            reg_in = UserRegister(email=email, password=password, name="Test")
            res_reg = await register(reg_in, db)
            print("Register success:", res_reg)
            
            # Login
            log_in = UserLogin(email=email, password=password)
            res_log = await login(log_in, db)
            print("Login success:", res_log)
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_auth())
