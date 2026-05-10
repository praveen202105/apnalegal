import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminApi = {
  login: (phone: string, otp: string) => api.post('/auth/verify-otp', { phone, otp }),
  googleLogin: (token: string) => api.post('/auth/google', { googleToken: token }),
  loginPassword: (email: string, password: string) => api.post('/auth/login-password', { email, password }),
  register: (data: { name: string; email: string; password: string; role: 'admin' | 'lawyer' }) => api.post('/auth/register', data),
  getAnalytics: () => api.get('/admin/analytics'),
  getRequests: (status?: string) => api.get(`/admin/requests${status ? `?status=${status}` : ''}`),
  assignLawyer: (requestId: string, data: { lawyerId: string; lawyerFee: number; commissionRate?: number; adminNotes?: string }) => 
    api.post(`/admin/requests/${requestId}/assign`, data),
  updateRequestStatus: (requestId: string, status: string) => api.patch(`/admin/requests/${requestId}/status`, { status }),
  getLawyers: () => api.get('/admin/lawyers'),
  suggestLawyers: (params: { city?: string; category?: string }) => api.get('/admin/lawyers/suggest', { params }),
  onboardLawyer: (data: any) => api.post('/admin/lawyers', data),
  verifyLawyer: (id: string) => api.patch(`/admin/lawyers/${id}/verify`),
  suspendLawyer: (id: string) => api.patch(`/admin/lawyers/${id}/suspend`),

  // Document Requests
  getDocumentRequests: (params?: { status?: string; city?: string; q?: string }) =>
    api.get('/admin/document-requests', { params }),
  getDocumentRequest: (id: string) => api.get(`/admin/document-requests/${id}`),
  assignDocumentRequest: (id: string, data: { lawyerId: string; adminNotes?: string }) =>
    api.post(`/admin/document-requests/${id}/assign`, data),
  updateDocumentRequestStatus: (id: string, status: 'under_review' | 'cancelled', note?: string) =>
    api.patch(`/admin/document-requests/${id}/status`, { status, note }),
  documentRequestDeliverableUrl: (id: string) =>
    `${API_URL}/admin/document-requests/${id}/deliverable?token=${localStorage.getItem('adminToken') ?? ''}`,
  documentRequestSignedUrl: (id: string) =>
    `${API_URL}/admin/document-requests/${id}/signed?token=${localStorage.getItem('adminToken') ?? ''}`,
};

export default api;
