import subprocess
import sys
import time
import os

# Set PYTHONPATH to verify imports work
os.environ["PYTHONPATH"] = os.getcwd()

scripts_to_run = [
    ("Dashboard API", "scripts/test_dashboard.py"),
    ("Grading Logic", "scripts/test_grading.py"),
    ("Kanban Logic", "scripts/test_kanban_move.py"),
    ("Task Attachments", "scripts/test_task_attachments.py"),
    ("Task Comments", "scripts/test_task_comments.py")
]

def run_verification():
    print("Đang bắt đầu kiểm tra tính toàn vẹn hệ thống...")
    print("="*50)
    
    results = {}
    all_passed = True
    
    for name, script_path in scripts_to_run:
        print(f"\n>> Đang xác minh: {name}...")
        start_time = time.time()
        
        try:
            # Run the script and capture output
            result = subprocess.run(
                [sys.executable, script_path],
                capture_output=True,
                text=True,
                timeout=30 # 30s timeout per script
            )
            
            duration = time.time() - start_time
            
            if result.returncode == 0:
                print(f"✅ THÀNH CÔNG ({duration:.2f}s)")
                results[name] = "THÀNH CÔNG"
            else:
                print(f"❌ THẤT BẠI ({duration:.2f}s)")
                print(f"Thông báo lỗi:\n{result.stderr}\n{result.stdout}")
                results[name] = "THẤT BẠI"
                all_passed = False
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
            results[name] = "ERROR"
            all_passed = False

    print("\n" + "="*50)
    print("Tóm tắt kết quả kiểm tra")
    print("="*50)
    for name, status in results.items():
        print(f"{name:<20}: {status}")
    
    if all_passed:
        print("\n✅ HỆ THỐNG ỔN ĐỊNH: Tất cả tính năng hoạt động bình thường.")
        sys.exit(0)
    else:
        print("\n❌ HỆ THỐNG CÓ LỖI: Đã phát hiện sai sót.")
        sys.exit(1)

if __name__ == "__main__":
    run_verification()
