import axios from "axios";

// Helper to get token
const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Use the same base as api.js but tailored for admin user routes
// Backend users route is /users (from main.py includer_router(users.router))
// But wait, users.py has prefix="/users"
// So standard CRUD is at /users
// Disable/Enable will be at /users/{id}/disable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getDashboard = () => axios.get(`${API_URL}/dashboard/admin/stats`, { headers: getAuthHeaders() });
export const getUsers = () => axios.get(`${API_URL}/users/`, { headers: getAuthHeaders() });
export const disableUser = (id) => axios.put(`${API_URL}/users/${id}/disable`, {}, { headers: getAuthHeaders() });
export const enableUser = (id) => axios.put(`${API_URL}/users/${id}/enable`, {}, { headers: getAuthHeaders() });
export const disableAllUsers = () => axios.put(`${API_URL}/users/disable-all`, {}, { headers: getAuthHeaders() });
export const getReports = () => axios.get(`${API_URL}/reports`, { headers: getAuthHeaders() });
