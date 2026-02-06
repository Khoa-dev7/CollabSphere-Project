from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings
from pydantic import EmailStr

conf = ConnectionConfig(
    MAIL_USERNAME=settings.SMTP_USER,
    MAIL_PASSWORD=settings.SMTP_PASSWORD,
    MAIL_FROM=settings.SMTP_FROM,
    MAIL_PORT=settings.SMTP_PORT,
    MAIL_SERVER=settings.SMTP_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_reset_password_email(email_to: EmailStr, token: str):
    message = MessageSchema(
        subject="CollabSphere - Yêu cầu khôi phục mật khẩu",
        recipients=[email_to],
        body=f"Xin chào,\n\nBạn đã yêu cầu khôi phục mật khẩu. Mã khôi phục của bạn là: {token}\n\nNếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.",
        subtype=MessageType.plain
    )
    fm = FastMail(conf)
    await fm.send_message(message)

async def send_report_email(user_email: str, content: str):
    message = MessageSchema(
        subject="CollabSphere - Báo cáo hệ thống",
        recipients=[settings.SMTP_FROM], # Gửi tới email quản trị viên/hệ thống
        body=f"Báo cáo từ: {user_email}\n\nNội dung:\n{content}",
        subtype=MessageType.plain
    )
    fm = FastMail(conf)
    await fm.send_message(message)
