import axios from 'axios';

// 1. Tạo cầu nối chung
const api = axios.create({
  baseURL: 'http://localhost:5000', // Cổng Backend Python
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Tự động gắn thẻ bài (Token) vào mỗi lần gửi thư
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Lấy token từ bộ nhớ trình duyệt
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Gắn vào thư
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;