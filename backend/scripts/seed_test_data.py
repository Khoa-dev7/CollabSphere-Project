import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models import base_models, project_models, comm_models, eval_models
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.models.base_models import User, Subject, Syllabus
from app.models.project_models import Project, ProjectMilestone, Team, Class
from app.core.security import get_password_hash

def seed_test_data():
    db = SessionLocal()
    try:
        # 1. Create Users for each Actor
        actors = [
            {"username": "admin", "role": "Admin", "pwd": "admin123", "name": "System Administrator", "email": "admin@test.com"},
            {"username": "staff_test", "role": "Staff", "pwd": "staff123", "name": "Office Staff", "email": "staff@test.com"},
            {"username": "lecturer_test", "role": "Lecturer", "pwd": "lecturer123", "name": "Test Lecturer", "email": "lecturer@test.com"},
            {"username": "student_test", "role": "Student", "pwd": "student123", "name": "Test Student", "email": "student@test.com"},
            {"username": "head_test", "role": "Head", "pwd": "head123", "name": "Head of Department", "email": "head@test.com"},
        ]

        for u in actors:
            db_user = db.query(User).filter(User.username == u["username"]).first()
            if not db_user:
                db_user = User(
                    username=u["username"],
                    email=u["email"],
                    full_name=u["name"],
                    role=u["role"],
                    password_hash=get_password_hash(u["pwd"]),
                    is_active=True
                )
                db.add(db_user)
                db.commit()
                db.refresh(db_user)
                print(f"Đã tạo {u['role']}: {u['username']}")
        
        lecturer = db.query(User).filter(User.username == "lecturer_test").first()
        student = db.query(User).filter(User.username == "student_test").first()

        # 2. Create Subject & Syllabus
        subj = db.query(Subject).first()
        if not subj:
            subj = Subject(name="Software Engineering", code="SE101")
            db.add(subj)
            db.commit()
            db.refresh(subj)
        
        syl = db.query(Syllabus).first()
        if not syl:
            syl = Syllabus(title="SE 2024 Syllabus", subject_id=subj.id)
            db.add(syl)
            db.commit()
            db.refresh(syl)

        # 3. Create Class
        cls = db.query(Class).first()
        if not cls:
            cls = Class(name="CS101.O21", lecturer_id=lecturer.id)
            db.add(cls)
            db.commit()
            db.refresh(cls)

        # 4. Create Project
        proj = db.query(Project).filter(Project.title == "Test Project Phase 12").first()
        if not proj:
            proj = Project(
                title="Test Project Phase 12",
                description="A project for testing Phase 12 features",
                syllabus_id=syl.id,
                creator_id=lecturer.id,
                lecturer_id=lecturer.id,
                status="Approved"
            )
            db.add(proj)
            db.commit()
            db.refresh(proj)
            
            # Add Milestone
            ms = ProjectMilestone(
                project_id=proj.id,
                title="Milestone 1",
                description="First milestone",
                order=1
            )
            db.add(ms)
            db.commit()
            print("Đã tạo Dự án và Milestone")

        # 5. Create Team
        team = db.query(Team).first()
        if not team:
            team = Team(name="Team Beta", class_id=cls.id, project_id=proj.id, leader_id=lecturer.id) # Leader is lecturer for testing
            db.add(team)
            db.commit()
            print("Đã tạo Nhóm Beta")

        print("Hoàn tất việc tạo dữ liệu mẫu!")

    except Exception as e:
        print(f"Lỗi khi tạo dữ liệu: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_test_data()
