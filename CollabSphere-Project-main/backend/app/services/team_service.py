from sqlalchemy.orm import Session
from app.models.team_member import TeamMember


def count_team_members(db: Session, team_id: int) -> int:
    return (
        db.query(TeamMember)
        .filter(TeamMember.team_id == team_id)
        .count()
    )
