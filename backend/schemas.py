from pydantic import BaseModel

# Dùng để nhận yêu cầu chia nhóm từ Frontend
class GroupingRequest(BaseModel):
    project_id: int
    number_of_teams: int