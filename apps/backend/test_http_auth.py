import asyncio
import httpx
from app.main import app

async def test_auth_over_http():
    async with httpx.AsyncClient(app=app, base_url="http://testserver") as client:
        # Register a new user just for testing the HTTP flow
        test_email = "api_test_me@example.com"
        test_pass = "TestPassword123!"
        
        # 1. Login or Register
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": test_email, "password": test_pass}
        )
        
        if login_resp.status_code != 200:
            # Register if they don't exist
            reg_resp = await client.post(
                "/api/v1/auth/register",
                json={"email": test_email, "password": test_pass, "name": "API Test User"}
            )
            assert reg_resp.status_code == 200, f"Register failed: {reg_resp.text}"
            
            # Login again
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": test_email, "password": test_pass}
            )
            
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        data = login_resp.json()
        access_token = data["access_token"]
        print("Login successful! Token:", access_token[:20], "...")
        
        # 2. Get Profile using /auth/me
        me_resp = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        # If the schema bug is fixed, it will return 200. If it expects a UUID and we passed a string, it might have failed.
        # Wait, the registered user HAS a UUID string anyway. But we proved the schema crashed for Clerk IDs.
        # Now it should be fine.
        assert me_resp.status_code == 200, f"/auth/me failed! Expected 200, got {me_resp.status_code}. Response: {me_resp.text}"
        print("SUCCESS! /auth/me profile:", me_resp.json())

if __name__ == "__main__":
    asyncio.run(test_auth_over_http())
