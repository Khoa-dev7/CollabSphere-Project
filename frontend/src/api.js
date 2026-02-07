import axios from 'axios';

// 1. Tạo cầu nối chung
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/', // Cổng Backend Python
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log("API Base URL:", api.defaults.baseURL);

// 2. Tự động gắn thẻ bài (Token) và chuẩn hóa đường dẫn
api.interceptors.request.use(
  (config) => {
    console.log("Original Request URL:", config.url);
    // Nếu URL bắt đầu bằng '/', xóa nó để nó trở thành tương đối với baseURL (tránh mất /api/)
    if (config.url && config.url.startsWith('/')) {
      config.url = config.url.substring(1);
      console.log("Sanitized Request URL:", config.url);
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Gắn vào thư
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;