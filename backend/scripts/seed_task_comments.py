import sys
import os
sys.path.append(os.getcwd())

from app.db.database import SessionLocal
from app.models.base_models import User, Syllabus, Subject
from app.models.project_models import Class, Project, Team, Task
from app.models import comm_models, eval_models
import datetime

db = SessionLocal()

def seed():
    try:
        # 1. Ensure Admin User
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            print("Admin not found. Please run seed_admin.py first.")
            return

        # 2. Create Subject
        subject = db.query(Subject).first()
        if not subject:
            subject = Subject(name="Software Engineering", code="SE101", description="Intro to SE")
            db.add(subject)
            db.commit()
            db.refresh(subject)
            print(f"Created Subject: {subject.name}")

        # 3. Create Syllabus
        syllabus = db.query(Syllabus).first()
        if not syllabus:
            syllabus = Syllabus(subject_id=subject.id, version="v1.0", content="...")
            db.add(syllabus)
            db.commit()
            db.refresh(syllabus)
            print(f"Created Syllabus: {syllabus.version}")

        # 4. Create Project
        project = db.query(Project).first()
        if not project:
            project = Project(
                title="CollabSphere Test Project",
                description="For testing comments",
                objectives="Testing",
                syllabus_id=syllabus.id,
                creator_id=admin.id,
                start_date=datetime.datetime.now(),
                end_date=datetime.datetime.now() + datetime.timedelta(days=30),
                max_members=5
            )
            db.add(project)
            db.commit()
            db.refresh(project)
            print(f"Created Project: {project.title}")

        # 5. Create Class
        classroom = db.query(Class).first()
        if not classroom:
            classroom = Class(name="SE Class 1", lecturer_id=admin.id)
            db.add(classroom)
            db.commit()
            db.refresh(classroom)
            print(f"Created Class: {classroom.name}")

        # 6. Create Team
        team = db.query(Team).first()
        if not team:
            team = Team(
                name="Team Alpha",
                class_id=classroom.id,
                project_id=project.id,
                leader_id=admin.id
            )
            db.add(team)
            db.commit()
            db.refresh(team)
            print(f"Created Team: {team.name}")

        # 7. Create Task
        task = db.query(Task).first()
        if not task:
            task = Task(
                team_id=team.id,
                title="Test Task for Comments",
                description="This task is for testing comments API",
                status="Todo",
                priority="High",
                assigned_to=admin.id,
                order=0
            )
            db.add(task)
            db.commit()
            db.refresh(task)
            print(f"Created Task: {task.title} (ID: {task.id})")
        else:
            print(f"Task already exists: {task.title} (ID: {task.id})")

    except Exception as e:
        print(f"Error seeding data: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    import os
    sys.path.append(os.getcwd())
    seed()
