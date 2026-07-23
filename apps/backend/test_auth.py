import asyncio
from httpx import AsyncClient

async def test():
    async with AsyncClient(base_url="http://localhost:8000") as client:
        # try to register
        res = await client.post("/api/v1/auth/register", json={
            "email": "test@example.com",
            "password": "Password123!",
            "name": "Test User"
        })
        print("Register:", res.status_code, res.text)
        
        # log in
        res = await client.post("/api/v1/auth/login", json={
            "email": "test@example.com",
            "password": "Password123!"
        })
        print("Login:", res.status_code, res.text)
        if res.status_code == 200:
            token = res.json()["access_token"]
            # get me
            res2 = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
            print("Me:", res2.status_code, res2.text)

asyncio.run(test())
