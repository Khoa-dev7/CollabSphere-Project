# Sử dụng Python 3.10
FROM python:3.10-slim

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy file thư viện vào trước để tận dụng cache
COPY requirements.txt .

# Cài đặt các thư viện
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code vào
COPY . .

# Mở port 8000
EXPOSE 8000

# Lệnh chạy server (Ví dụ dùng Uvicorn cho FastAPI)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]