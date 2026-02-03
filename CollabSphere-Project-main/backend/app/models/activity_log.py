from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    action = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    related_type = Column(String(50))
    related_id = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
