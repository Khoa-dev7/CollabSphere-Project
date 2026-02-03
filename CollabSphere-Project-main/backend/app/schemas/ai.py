from pydantic import BaseModel


class AISuggestRequest(BaseModel):
    task_description: str


class AISuggestResponse(BaseModel):
    suggestion: str
