from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import models


class DashboardService:

    @staticmethod
    def task_status_overview(db: Session, team_id: int):
        """
        Trả về số lượng task theo trạng thái
        """

        result = (
            db.query(
                models.Task.status,
                func.count(models.Task.id)
            )
            .join(models.TaskColumn)
            .filter(models.TaskColumn.team_id == team_id)
            .group_by(models.Task.status)
            .all()
        )

        return {
            status: count
            for status, count in result
        }

    @staticmethod
    def completion_rate(db: Session, team_id: int):
        """
        Tính % hoàn thành task
        """

        total = (
            db.query(func.count(models.Task.id))
            .join(models.TaskColumn)
            .filter(models.TaskColumn.team_id == team_id)
            .scalar()
        )

        if total == 0:
            return {
                "total": 0,
                "completed": 0,
                "rate": 0
            }

        completed = (
            db.query(func.count(models.Task.id))
            .join(models.TaskColumn)
            .filter(
                models.TaskColumn.team_id == team_id,
                models.Task.status == "DONE"
            )
            .scalar()
        )

        return {
            "total": total,
            "completed": completed,
            "rate": round(completed / total * 100, 2)
        }
