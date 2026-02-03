from sqlalchemy.orm import Session
from app.models import models
from datetime import datetime


def log_activity(
    db: Session,
    user_id: int,
    action: str,
    entity: str,
    entity_id: int | None = None,
    metadata: dict | None = None
):
    activity = models.ActivityLog(
        user_id=user_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        metadata=metadata or {},
        created_at=datetime.utcnow()
    )
    db.add(activity)
    db.commit()
