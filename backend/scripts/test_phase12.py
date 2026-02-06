import httpx
import asyncio
import sys

BASE_URL = "http://127.0.0.1:8000/api"

async def test_phase12():
    async with httpx.AsyncClient() as client:
        # 1. Login as Lecturer
        print("\n--- Kiểm tra RBAC & Câu hỏi Milestone ---")
        login_resp = await client.post(f"{BASE_URL}/auth/login", data={"username": "lecturer_test", "password": "lecturer123"})
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Add question to milestone (Lecturer/Admin)
        # Assuming project 1 and milestone 1 exist
        q_resp = await client.post(
            f"{BASE_URL}/projects/milestones/1/questions", 
            headers=headers,
            json={"content": "What is the primary goal of this milestone?"}
        )
        if q_resp.status_code == 200:
            print("✅ Đã tạo câu hỏi Milestone")
            q_id = q_resp.json()["id"]
        else:
            print(f"❌ Failed to create question: {q_resp.text}")
            return

        # 3. Test Checkpoint CRUD (Leader)
        print("\n--- Kiểm tra Checkpoint CRUD (Nhóm 1) ---")
        cp_resp = await client.post(
            f"{BASE_URL}/workspace/teams/1/checkpoints",
            headers=headers,
            json={"title": "First Code Review", "description": "Review initial architecture"}
        )
        if cp_resp.status_code == 200:
            print("✅ Đã tạo Checkpoint")
            cp_id = cp_resp.json()["id"]
        else:
            print(f"❌ Failed to create checkpoint: {cp_resp.status_code}")
            return

        # 4. Assign members to checkpoint
        a_resp = await client.post(
            f"{BASE_URL}/workspace/teams/1/checkpoints/{cp_id}/assign",
            headers=headers,
            json={"user_ids": [1]} # Admin id 1
        )
        if a_resp.status_code == 200:
            print("✅ Đã gán thành viên vào Checkpoint")
        else:
            print(f"❌ Failed to assign members: {a_resp.text}")

        # 5. Submit Checkpoint
        s_resp = await client.post(
            f"{BASE_URL}/workspace/teams/1/checkpoints/{cp_id}/submit",
            headers=headers,
            json={"content": "Architecture looks good.", "file_url": "http://docs.com/arch"}
        )
        if s_resp.status_code == 200:
            print("✅ Đã nộp bài Checkpoint")
        else:
            print(f"❌ Failed to submit checkpoint: {s_resp.text}")

        # 6. Mark Milestone Done
        m_resp = await client.put(
            f"{BASE_URL}/workspace/teams/1/milestones/1/status",
            headers=headers,
            json={"is_done": True}
        )
        if m_resp.status_code == 200:
            print("✅ Đã đánh dấu Milestone hoàn tất")
        else:
            print(f"❌ Failed to mark milestone done: {m_resp.text}")

        # 7. Assign Project to Class
        print("\n--- Kiểm tra Giao dự án ---")
        p_resp = await client.post(
            f"{BASE_URL}/projects/1/assign-to-class/1",
            headers=headers
        )
        if p_resp.status_code == 200:
            print("✅ Đã giao dự án vào lớp")
        else:
            print(f"❌ Failed to assign project: {p_resp.text}")

if __name__ == "__main__":
    asyncio.run(test_phase12())
