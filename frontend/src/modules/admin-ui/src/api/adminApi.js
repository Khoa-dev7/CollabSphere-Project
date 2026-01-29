import axios from "axios";

const API = "http://localhost:8080/api/admin";

export const getDashboard = () => axios.get(`${API}/dashboard`);
export const getUsers = () => axios.get(`${API}/users`);
export const disableUser = (id) => axios.put(`${API}/users/${id}/disable`);
export const enableUser = (id) => axios.put(`${API}/users/${id}/enable`);
export const disableAllUsers = () => axios.put(`${API}/users/disable-all`);
export const getReports = () => axios.get(`${API}/reports`);
