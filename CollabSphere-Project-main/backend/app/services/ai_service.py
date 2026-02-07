# app/services/ai_service.py
import os
from openai import OpenAI
from app.core.config import settings

def get_client():
    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY chưa được cấu hình")
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def suggest_task_solution(description: str) -> str:
    client = get_client()

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Bạn là trợ lý hướng dẫn sinh viên làm task"},
            {"role": "user", "content": description}
        ]
    )
    return resp.choices[0].message.content
