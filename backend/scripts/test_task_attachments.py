import httpx
import asyncio
import io

BASE_URL = "http://127.0.0.1:8000/api"

async def test_attachments():
    async with httpx.AsyncClient() as client:
        # 1. Login
        login_resp = await client.post(f"{BASE_URL}/auth/login", data={"username": "admin", "password": "admin123"})
        if login_resp.status_code != 200:
            print(f"Đăng nhập thất bại: {login_resp.text}")
            return
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Use existing Task 2
        task_id = 2
        
        # 3. Tải lên tệp đính kèm
        print(f"Đang tải lên tệp đính kèm cho Nhiệm vụ {task_id}...")
        
        # Create a dummy file
        file_content = b"This is a test file for attachment."
        files = {"file": ("test_attachment.txt", file_content, "text/plain")}
        
        resp = await client.post(f"{BASE_URL}/workspace/tasks/{task_id}/attachments", files=files, headers=headers)
        
        if resp.status_code == 200:
            print("Tải tệp đính kèm lên thành công!")
            print(resp.json())
        else:
            print(f"Không thể tải lên tệp đính kèm: {resp.status_code} {resp.text}")
            return

        # 4. Lấy các tệp đính kèm
        print(f"Đang lấy các tệp đính kèm cho Nhiệm vụ {task_id}...")
        resp = await client.get(f"{BASE_URL}/workspace/tasks/{task_id}/attachments", headers=headers)
        
        if resp.status_code == 200:
            print("Lấy các tệp đính kèm thành công!")
            print(resp.json())
        else:
            print(f"Không thể lấy các tệp đính kèm: {resp.status_code} {resp.text}")

if __name__ == "__main__":
    asyncio.run(test_attachments())
