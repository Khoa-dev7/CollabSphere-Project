from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from app.database import SessionLocal
from app.services.activity_logger import log_activity


class IDORAuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response

        except Exception as e:
            user = request.state.user if hasattr(request.state, "user") else None

            if user:
                db = SessionLocal()
                log_activity(
                    db=db,
                    user_id=user.id,
                    action="IDOR attempt blocked",
                    entity="security",
                    entity_id=None,
                    metadata={
                        "path": request.url.path,
                        "method": request.method
                    }
                )
                db.close()

            raise e
