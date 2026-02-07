from fastapi import APIRouter
from livekit import api
import os

router = APIRouter(
    prefix="/video",
    tags=["Video Call"]
)

# Nên để trong biến môi trường (tạm hardcode vẫn chạy)
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY", "devkey")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET", "secret")
LIVEKIT_URL = os.getenv("LIVEKIT_URL", "ws://localhost:7880")


@router.get("/get-join-token")
def get_join_token(room: str, username: str):
    """
    Sinh token để client tham gia phòng video call (LiveKit)
    """
    token = (
        api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        .with_identity(username)
        .with_name(username)
        .with_grants(
            api.VideoGrants(
                room_join=True,
                room=room
            )
        )
    )

    return {
        "token": token.to_jwt(),
        "url": LIVEKIT_URL
    }
