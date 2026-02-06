import httpx
import asyncio
import sys

BASE_URL = "http://127.0.0.1:8000/api"

async def test_dashboard():
    async with httpx.AsyncClient() as client:
        # 1. Login
        login_resp = await client.post(f"{BASE_URL}/auth/login", data={"username": "admin", "password": "admin123"})
        if login_resp.status_code != 200:
            print(f"Đăng nhập thất bại: {login_resp.text}")
            return
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Kiểm tra thống kê
        print("\n--- Đang kiểm tra Thống kê chung ---")
        resp = await client.get(f"{BASE_URL}/dashboard/stats", headers=headers)
        if resp.status_code == 200:
            print(resp.json())
        else:
            print(f"Thất bại: {resp.status_code} {resp.text}")

        # 3. Kiểm tra phân bổ dự án
        print("\n--- Đang kiểm tra Phân bổ dự án ---")
        resp = await client.get(f"{BASE_URL}/dashboard/projects/distribution", headers=headers)
        if resp.status_code == 200:
            print(resp.json())
        else:
            print(f"Thất bại: {resp.status_code} {resp.text}")
            
        # 4. Kiểm tra phân bổ nhiệm vụ
        print("\n--- Đang kiểm tra Phân bổ nhiệm vụ ---")
        resp = await client.get(f"{BASE_URL}/dashboard/tasks/distribution", headers=headers)
        if resp.status_code == 200:
            print(resp.json())
        else:
            print(f"Thất bại: {resp.status_code} {resp.text}")
            
        # 5. Kiểm tra phân bổ người dùng
        print("\n--- Đang kiểm tra Phân bổ người dùng ---")
        resp = await client.get(f"{BASE_URL}/dashboard/users/distribution", headers=headers)
        if resp.status_code == 200:
            print(resp.json())
        else:
            print(f"Thất bại: {resp.status_code} {resp.text}")

if __name__ == "__main__":
    asyncio.run(test_dashboard())
