import sys
import os
sys.path.append(os.getcwd())

from app.db.database import SessionLocal
# Import all models to ensure they are registered
from app.models.base_models import User
from app.models.project_models import Team, Project, Task, Class
from app.models import comm_models, eval_models

db = SessionLocal()
try:
    print("Danh sách Dự án:")
    projects = db.query(Project).all()
    for p in projects:
        print(f"ID: {p.id}, Title: {p.title}")

    print("\nDanh sách Nhóm:")
    teams = db.query(Team).all()
    for t in teams:
        print(f"ID: {t.id}, Name: {t.name}, ProjectID: {t.project_id}")

    print("\nDanh sách Công việc:")
    tasks = db.query(Task).all()
    for t in tasks:
        print(f"ID: {t.id}, Title: {t.title}, TeamID: {t.team_id}")

    from app.models.project_models import MilestoneQuestion, ClassProject
    from app.models.comm_models import Checkpoint

    print("\nDanh sách Câu hỏi Milestone:")
    questions = db.query(MilestoneQuestion).all()
    for q in questions:
        print(f"ID: {q.id}, Content: {q.content}")

    print("\nDanh sách Checkpoint:")
    checkpoints = db.query(Checkpoint).all()
    for cp in checkpoints:
        print(f"ID: {cp.id}, Title: {cp.title}")

    print("\nLiên kết Lớp - Dự án:")
    cp_list = db.query(ClassProject).all()
    for cp in cp_list:
        print(f"ClassID: {cp.class_id}, ProjectID: {cp.project_id}")

finally:
    db.close()
