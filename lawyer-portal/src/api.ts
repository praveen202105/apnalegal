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
  loginPassword: (email: string, password: string) => api.post('/auth/login-password', { email, password }),
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: 'lawyer';
    phone: string;
    city: string;
    state?: string;
    specialties: string[];
    experience: number;
    bio?: string;
    pricePerCase?: number;
  }) => api.post('/auth/register', data),
  getProfile: () => api.get('/lawyer/profile'),
  updateAvailability: (isAvailable: boolean) => api.patch('/lawyer/availability', { isAvailable }),
  getCases: () => api.get('/lawyer/cases'),
  getCase: (id: string) => api.get(`/lawyer/cases/${id}`),
  acceptCase: (id: string) => api.patch(`/lawyer/cases/${id}/accept`),
  updateCaseStatus: (id: string, status: string) => api.patch(`/lawyer/cases/${id}/status`, { status }),
  getEarnings: () => api.get('/lawyer/earnings'),

  // Document Requests
  getDocumentRequests: () => api.get('/lawyer/document-requests'),
  getDocumentRequest: (id: string) => api.get(`/lawyer/document-requests/${id}`),
  acceptDocumentRequest: (id: string) => api.patch(`/lawyer/document-requests/${id}/accept`),
  deliverDocumentRequest: (id: string, file: File, lawyerNotes: string) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('lawyerNotes', lawyerNotes);
    return api.post(`/lawyer/document-requests/${id}/deliver`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
