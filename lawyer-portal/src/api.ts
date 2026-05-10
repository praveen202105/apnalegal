import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lawyerToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const lawyerApi = {
  login: (phone: string, otp: string) => api.post('/auth/verify-otp', { phone, otp }),
  googleLogin: (token: string) => api.post('/auth/google', { googleToken: token }),
  getProfile: () => api.get('/lawyer/profile'),
  updateAvailability: (isAvailable: boolean) => api.patch('/lawyer/availability', { isAvailable }),
  getCases: () => api.get('/lawyer/cases'),
  getCase: (id: string) => api.get(`/lawyer/cases/${id}`),
  acceptCase: (id: string) => api.patch(`/lawyer/cases/${id}/accept`),
  updateCaseStatus: (id: string, status: string) => api.patch(`/lawyer/cases/${id}/status`, { status }),
  getEarnings: () => api.get('/lawyer/earnings'),
};

export default api;
