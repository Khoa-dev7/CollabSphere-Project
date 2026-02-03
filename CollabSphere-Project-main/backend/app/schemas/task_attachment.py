from pydantic import BaseModel


class AttachmentResponse(BaseModel):
    id: int
    filename: str
    file_path: str

    class Config:
        from_attributes = True
