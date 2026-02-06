import httpx
import asyncio
import sys

BASE_URL = "http://127.0.0.1:8000/api"

async def test_comments():
    async with httpx.AsyncClient() as client:
        # 1. Login as Admin
        login_resp = await client.post(f"{BASE_URL}/auth/login", data={"username": "admin", "password": "admin123"})
        if login_resp.status_code != 200:
            print(f"Đăng nhập thất bại: {login_resp.text}")
            return
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get User ID
        user_resp = await client.get(f"{BASE_URL}/auth/me", headers=headers)
        user_id = user_resp.json()["id"]

        # 3. Create Class (if needed) -> Skip, assume independent project or create one
        # Let's create a Project first
        project_payload = {
            "title": "Test Project for Comments",
            "description": "Auto-created by test script",
            "objectives": "Testing",
            "syllabus_id": 1, # Mock
            "start_date": "2023-01-01T00:00:00",
            "end_date": "2023-12-31T00:00:00"
        }
        # Note: Syllabus might be required. If so, fail. Let's try creating a Team directly if Class 1 exists?
        # Better: Check existing tasks first
        tasks_resp = await client.get(f"{BASE_URL}/workspace/teams/1/tasks", headers=headers)
        if tasks_resp.status_code == 200 and len(tasks_resp.json()) > 0:
            task_id = tasks_resp.json()[0]["id"]
            print(f"Sử dụng nhiệm vụ hiện có {task_id}")
        else:
            print("Không tìm thấy nhiệm vụ nào hiện có. Vui lòng tạo dữ liệu mẫu hoặc tạo nhiệm vụ thủ công trước.")
            # Try to create a task in Team 1 (assuming Team 1 exists from previous seeds)
            task_payload = {
                "team_id": 1,
                "title": "Test Task",
                "description": "For comments",
                "priority": "Medium",
                "status": "Todo"
            }
            create_resp = await client.post(f"{BASE_URL}/workspace/tasks", json=task_payload, headers=headers)
            if create_resp.status_code == 200:
                task_id = create_resp.json()["id"]
                print(f"Đã tạo nhiệm vụ {task_id}")
            else:
                print(f"Không thể tạo nhiệm vụ: {create_resp.text}")
                return

        # 4. Thêm bình luận
        print(f"Đang thêm bình luận cho Nhiệm vụ {task_id}...")
        comment_payload = {"content": "Đây là bình luận kiểm tra từ script."}
        resp = await client.post(f"{BASE_URL}/workspace/tasks/{task_id}/comments", json=comment_payload, headers=headers)
        
        if resp.status_code == 200:
            print("Đã thêm bình luận thành công!")
            print(resp.json())
        else:
            print(f"Không thể thêm bình luận: {resp.status_code} {resp.text}")

        # 5. Lấy bình luận
        print(f"Đang lấy bình luận cho Nhiệm vụ {task_id}...")
        resp = await client.get(f"{BASE_URL}/workspace/tasks/{task_id}/comments", headers=headers)
        
        if resp.status_code == 200:
            print("Lấy bình luận thành công!")
            print(resp.json())
        else:
            print(f"Không thể lấy bình luận: {resp.status_code} {resp.text}")

if __name__ == "__main__":
    asyncio.run(test_comments())
