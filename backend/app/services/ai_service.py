import boto3
import json
import os
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.comm_models import AIInteraction
from app.schemas.ai_schemas import AIInteractionCreate
from openai import OpenAI

# Khởi tạo OpenAI client nếu có key
openai_client = None
if settings.OPENAI_API_KEY:
    openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)

def call_bedrock_ai(prompt: str, context: str = ""):
    try:
        if not settings.AWS_ACCESS_KEY_ID:
            return "Dịch vụ AI (Bedrock) chưa được cấu hình."
            
        client = boto3.client(
            service_name='bedrock-runtime',
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        
        model_id = 'anthropic.claude-3-haiku-20240307-v1:0'
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "messages": [{"role": "user", "content": f"Bối cảnh: {context}\n\nCâu hỏi: {prompt}"}]
        })
        
        response = client.invoke_model(body=body, modelId=model_id)
        response_body = json.loads(response.get('body').read())
        return response_body['content'][0]['text']
    except Exception as e:
        return f"Lỗi Bedrock: {str(e)}"

def call_openai_ai(prompt: str, context: str = ""):
    try:
        if not openai_client:
            return "Dịch vụ AI (OpenAI) chưa được cấu hình."
            
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"Bạn là một trợ lý hỗ trợ học tập theo dự án (PBL) hữu ích. Bối cảnh: {context}"},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Lỗi OpenAI: {str(e)}"

def process_system_command(prompt: str, context: str = "", db: Session = None, team_id: int = None):
    """
    Xử lý các lệnh hệ thống dựa trên từ khóa để trợ giúp người dùng ngay cả khi không có API AI.
    """
    p = prompt.lower()
    
    if "tạo task" in p or "nhiệm vụ" in p:
        return "💡 **Gợi ý từ Hệ thống:** Để tạo nhiệm vụ mới, bạn hãy vào mục **Workspace**, chọn cột mong muốn và nhấn nút **+ Thêm nhiệm vụ**. Bạn nên chia nhỏ dự án thành các phần: Phân tích, Thiết kế, Cài đặt và Kiểm thử."
    
    if "checkpoint" in p or "milestone" in p or "mốc" in p:
        return "🚩 **Hướng dẫn Mốc dự án:** Bạn có thể xem các mốc quan trọng trong menu **Dự án của tôi**. Thông thường một dự án sẽ có: \n1. Khởi tạo (Tuần 1-2)\n2. Báo cáo tiến độ (Tuần 5)\n3. Hoàn thiện nội dung (Tuần 10)\n4. Bảo vệ cuối kỳ (Tuần 15)."

    if "thành viên" in p or "nhóm" in p:
        return "👥 **Quản lý nhóm:** Bạn có thể quản lý thành viên trong trang **Nhóm của tôi**. Trưởng nhóm có quyền thêm thành viên bằng Email hoặc xóa thành viên khỏi nhóm."

    if "tài liệu" in p or "file" in p or "upload" in p:
        return "📁 **Tài liệu:** Bạn có thể tải lên các file liên quan đến dự án trong tab **Tài liệu** hoặc gửi trực tiếp vào **Chat nhóm** để mọi người cùng xem."

    return None

def ask_ai(prompt: str, context: str = "", db: Session = None, team_id: int = None):
    # 1. Kiểm tra lệnh hệ thống trước
    system_response = process_system_command(prompt, context, db, team_id)
    if system_response:
        return system_response

    # 2. Nếu không phải lệnh hệ thống, thử gọi AI thực tế
    if settings.AI_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        return call_openai_ai(prompt, context)
    elif settings.AI_PROVIDER == "bedrock" and settings.AWS_ACCESS_KEY_ID:
        return call_bedrock_ai(prompt, context)
    
    # 3. Fallback cuối cùng nếu không có API keys
    return "🌐 **Trợ lý CollabSphere:** Hiện tại dịch vụ AI nâng cao (GPT/Claude) chưa được cấu hình. Tuy nhiên, tôi có thể hỗ trợ bạn các lệnh hệ thống như: 'tạo task', 'quản lý nhóm', 'mốc dự án' hoặc 'tải tài liệu'. Bạn cần tôi hướng dẫn phần nào?"

def save_ai_interaction(db: Session, interaction_in: AIInteractionCreate):
    db_interaction = AIInteraction(**interaction_in.dict())
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

def brainstorm_ideas(db: Session, prompt: str, user_id: int, team_id: int = None):
    response = ask_ai(prompt, context="Đề xuất các ý tưởng PBL sáng tạo.", db=db, team_id=team_id)
    interaction_in = AIInteractionCreate(
        user_id=user_id, team_id=team_id, prompt=prompt, response=response, interaction_type="Brainstorming"
    )
    save_ai_interaction(db, interaction_in)
    return response

def get_project_guidance(db: Session, prompt: str, user_id: int, team_id: int = None):
    response = ask_ai(prompt, context="Cung cấp hướng dẫn kỹ thuật và quản lý dự án.", db=db, team_id=team_id)
    interaction_in = AIInteractionCreate(
        user_id=user_id, team_id=team_id, prompt=prompt, response=response, interaction_type="Guidance"
    )
    save_ai_interaction(db, interaction_in)
    return response

def get_task_guidance(db: Session, task_description: str, user_id: int, team_id: int = None):
    prompt = f"Tôi nên thực hiện nhiệm vụ này như thế nào? Mô tả nhiệm vụ: {task_description}"
    response = ask_ai(prompt, context="Bạn là một cố vấn kỹ thuật. Hãy cung cấp các gợi ý thực hiện từng bước cho nhiệm vụ đã cho.", db=db, team_id=team_id)
    
    interaction_in = AIInteractionCreate(
        user_id=user_id,
        team_id=team_id,
        prompt=prompt,
        response=response,
        interaction_type="TaskGuidance"
    )
    save_ai_interaction(db, interaction_in)
    return response
