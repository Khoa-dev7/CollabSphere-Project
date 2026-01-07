# Sử dụng Python 3.10
FROM python:3.10-slim

WORKDIR /app

# Copy file thư viện và cài đặt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code vào
COPY . .

# Mở port 5000
EXPOSE 5000

# Lệnh chạy server
CMD ["python", "app.py"]
