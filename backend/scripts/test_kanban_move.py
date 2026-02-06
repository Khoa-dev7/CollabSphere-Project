import httpx
import asyncio
import sys

BASE_URL = "http://127.0.0.1:8000/api"

async def test_kanban_move():
    async with httpx.AsyncClient() as client:
        # 1. Login
        login_resp = await client.post(f"{BASE_URL}/auth/login", data={"username": "admin", "password": "admin123"})
        if login_resp.status_code != 200:
            print(f"Đăng nhập thất bại: {login_resp.text}")
            return
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Cấu hình: Đảm bảo có nhiệm vụ trong Nhóm 1
        # Tạo 3 nhiệm vụ trong Todo
        team_id = 1
        print("Đang tạo các nhiệm vụ kiểm tra...")
        tasks = []
        for i in range(3):
            payload = {
                "team_id": team_id,
                "title": f"Kanban Task {i}",
                "status": "Todo",
                "priority": "Medium",
                "order": i
            }
            resp = await client.post(f"{BASE_URL}/workspace/tasks", json=payload, headers=headers)
            if resp.status_code == 200:
                tasks.append(resp.json())
            else:
                print(f"Không thể tạo nhiệm vụ: {resp.text}")

        if len(tasks) < 3:
            print("Không đủ nhiệm vụ được tạo. Hủy bỏ.")
            return

        t0, t1, t2 = tasks[0], tasks[1], tasks[2]
        print(f"Trạng thái ban đầu: {t0['id']}(0), {t1['id']}(1), {t2['id']}(2)")

        # 3. Kiểm tra 1: Sắp xếp lại Nhiệm vụ 0 sang chỉ mục 1 (Hoán đổi với Nhiệm vụ 1) trong Todo
        print("\n--- Kiểm tra 1: Sắp xếp lại Nhiệm vụ 0 sang chỉ mục 1 ---")
        move_payload = {"new_status": "Todo", "new_order": 1}
        resp = await client.put(f"{BASE_URL}/workspace/tasks/{t0['id']}/move", json=move_payload, headers=headers)
        
        if resp.status_code == 200:
            print("Move Successful!")
        else:
            print(f"Move Failed: {resp.status_code} {resp.text}")

        # Check order
        list_resp = await client.get(f"{BASE_URL}/workspace/teams/{team_id}/tasks", headers=headers)
        current_tasks = list_resp.json()
        todo_tasks = [t for t in current_tasks if t['status'] == "Todo"]
        todo_tasks.sort(key=lambda x: x['order'])
        print("Current Todo Order:")
        for t in todo_tasks:
            print(f"ID: {t['id']}, Order: {t['order']}")

        # 4. Kiểm tra 2: Di chuyển Nhiệm vụ 2 sang "In Progress" tại chỉ mục 0
        print("\n--- Kiểm tra 2: Di chuyển Nhiệm vụ 2 sang In Progress (Chỉ mục 0) ---")
        move_payload = {"new_status": "In Progress", "new_order": 0}
        resp = await client.put(f"{BASE_URL}/workspace/tasks/{t2['id']}/move", json=move_payload, headers=headers)
        
        if resp.status_code == 200:
            print("Move Successful!")
        else:
            print(f"Move Failed: {resp.status_code} {resp.text}")

        # Check order again
        list_resp = await client.get(f"{BASE_URL}/workspace/teams/{team_id}/tasks", headers=headers)
        current_tasks = list_resp.json()
        
        todo_tasks = [t for t in current_tasks if t['status'] == "Todo"]
        todo_tasks.sort(key=lambda x: x['order'])
        print("Current Todo Order:")
        for t in todo_tasks:
            print(f"ID: {t['id']}, Order: {t['order']}")
            
        progress_tasks = [t for t in current_tasks if t['status'] == "In Progress"]
        progress_tasks.sort(key=lambda x: x['order'])
        print("Thứ tự In Progress hiện tại:")
        for t in progress_tasks:
            print(f"ID: {t['id']}, Thứ tự: {t['order']}")

if __name__ == "__main__":
    asyncio.run(test_kanban_move())
