from sqlalchemy.orm import Session
from app.models import models


def calculate_final_score(
    db: Session,
    student_id: int,
    team_id: int
):
    criteria = db.query(models.GradingCriteria).filter(
        models.GradingCriteria.team_id == team_id
    ).all()

    if not criteria:
        return 0

    final_score = 0

    for c in criteria:
        if c.name == "peer_review":
            score = db.query(models.PeerReviewScore).filter_by(
                student_id=student_id,
                team_id=team_id
            ).first()
            value = score.score if score else 0

        elif c.name == "task":
            total = db.query(models.Task).filter_by(
                assignee_id=student_id
            ).count()

            done = db.query(models.Task).filter_by(
                assignee_id=student_id,
                status="DONE"
            ).count()

            value = (done / total) * 100 if total > 0 else 0

        else:
            value = 0

        final_score += value * c.weight

    return round(final_score, 2)
