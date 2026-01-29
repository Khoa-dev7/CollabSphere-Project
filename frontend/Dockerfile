# Sử dụng Node.js
FROM node:18-alpine

WORKDIR /app

# Copy package.json để cài thư viện
COPY package.json .

# Cài đặt thư viện
RUN npm install

# Copy toàn bộ code
COPY . .

# Mở port 3000
EXPOSE 3000

# Lệnh chạy React
CMD ["npm", "start"]