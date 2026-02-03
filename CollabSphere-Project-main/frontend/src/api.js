import axios from 'axios';

// 1. Tạo cấu hình chung cho API
const api = axios.create({
  // QUAN TRỌNG: Backend FastAPI chạy ở cổng 8000 (không phải 5000)
  baseURL: 'http://localhost:8000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Tự động gắn Token vào mỗi yêu cầu gửi đi (Request Interceptor)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Lấy token từ bộ nhớ trình duyệt
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Gắn token vào header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Tự động xử lý khi nhận phản hồi lỗi (Response Interceptor)
api.interceptors.response.use(
  (response) => {
    // Nếu kết quả trả về OK, cứ thế trả về cho ứng dụng dùng
    return response;
  },
  (error) => {
    // Nếu gặp lỗi 401 (Unauthorized) -> Token hết hạn hoặc không hợp lệ
    if (error.response && error.response.status === 401) {
      console.log("Phiên đăng nhập đã hết hạn.");
      // Tùy chọn: Xóa token và reload trang để bắt đăng nhập lại
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;