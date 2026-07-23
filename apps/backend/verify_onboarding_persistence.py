import asyncio
import httpx
from app.main import app
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.user import User

async def verify_persistence():
    async with httpx.AsyncClient(app=app, base_url="http://testserver") as client:
        test_email = "persistence_test@example.com"
        test_pass = "TestPassword123!"
        
        # 1. Register/Login
        reg_resp = await client.post(
            "/api/v1/auth/register",
            json={"email": test_email, "password": test_pass, "name": "Persistence Test"}
        )
        if reg_resp.status_code != 200:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": test_email, "password": test_pass}
            )
        else:
            login_resp = reg_resp
            
        assert login_resp.status_code == 200
        access_token = login_resp.json()["access_token"]
        
        # 2. Check initial state
        me_resp = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_data = me_resp.json()
        print(f"Initial onboarding_complete: {user_data.get('onboarding_complete')}")
        
        # 3. Update onboarding_complete to True
        patch_resp = await client.patch(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {access_token}"},
            json={"onboarding_complete": True}
        )
        assert patch_resp.status_code == 200
        print(f"Update response onboarding_complete: {patch_resp.json().get('onboarding_complete')}")
        
        # 4. Verify persistence in a NEW request
        me_resp_v2 = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        final_state = me_resp_v2.json().get('onboarding_complete')
        print(f"Final onboarding_complete (persisted): {final_state}")
        
        if final_state is True:
            print("VERIFICATION SUCCESSFUL: Onboarding status persisted!")
        else:
            print("VERIFICATION FAILED: Onboarding status NOT persisted!")
            exit(1)

if __name__ == "__main__":
    asyncio.run(verify_persistence())
