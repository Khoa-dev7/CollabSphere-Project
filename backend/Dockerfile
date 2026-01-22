# Sử dụng Python 3.9
FROM python:3.9-slim

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy file thư viện và cài đặt trước
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code vào container
COPY . .

# Mở port 5000
EXPOSE 5000

# Lệnh chạy server
CMD ["python", "app.py"]