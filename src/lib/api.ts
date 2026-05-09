const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const CATEGORIES = ['Rent Agreement', 'Property Dispute', 'Consumer Complaint', 'Family Law', 'Criminal Defence', 'Labour Law', 'Corporate', 'Cyber Crime', 'Other'];
export const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh', 'Laksadweep', 'Puducherry'];


// Token storage
export const getAccessToken = () => localStorage.getItem('accessToken');

export function setTokens(accessToken: string) {
  localStorage.setItem('accessToken', accessToken);
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
}

export function isAuthenticated() {
  return !!getAccessToken();
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers, credentials: 'include' });

  if (res.status === 401) {
    // Try refresh
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    
    if (refreshRes.ok) {
      const { accessToken } = await refreshRes.json();
      localStorage.setItem('accessToken', accessToken);
      headers['Authorization'] = `Bearer ${accessToken}`;
      return fetch(`${BASE_URL}${path}`, { ...options, headers, credentials: 'include' });
    } else {
      clearTokens();
      window.location.href = '/auth';
    }
  }

  return res;
}

async function json<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await apiFetch(path, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const sendOtp = (phone: string) =>
  json<{ message: string }>('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone: phone.startsWith('+91') ? phone : `+91${phone}` }),
  });

export const verifyOtp = (phone: string, otp: string) =>
  json<{ accessToken: string; user: { name: string; phone: string } }>(
    '/auth/verify-otp',
    {
      method: 'POST',
      body: JSON.stringify({ phone: phone.startsWith('+91') ? phone : `+91${phone}`, otp }),
    }
  );

export const googleLogin = (googleToken: string) =>
  json<{ accessToken: string; user: { name: string; email: string } }>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ googleToken }),
  });

export const logout = () =>
  apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});

// ── User ──────────────────────────────────────────────────────────────────────
export const getMe = () =>
  json<{ _id: string; phone: string; name: string; email: string; subscription: { plan: string } }>('/user/me');

export const updateMe = (data: { name?: string; email?: string }) =>
  json<{ _id: string; name: string; email: string }>('/user/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const getStats = () =>
  json<{ documents: number; consultations: number; drafts: number }>('/user/stats');

export const getPreferences = () =>
  json<{ darkMode: boolean; language: string; notifications: boolean; emailNotifications: boolean }>(
    '/user/preferences'
  );

export const updatePreferences = (prefs: object) =>
  json('/user/preferences', { method: 'PUT', body: JSON.stringify(prefs) });

// ── Documents ─────────────────────────────────────────────────────────────────
export const getDocuments = () =>
  json<{ _id: string; type: string; status: string; createdAt: string; formData: Record<string, string> }[]>(
    '/documents'
  );

export const getDrafts = () =>
  json<{ _id: string; type: string; status: string; createdAt: string }[]>('/documents/drafts');

export const createDocument = (type: string, formData: Record<string, string>) =>
  json<{ _id: string; type: string; status: string }>('/documents', {
    method: 'POST',
    body: JSON.stringify({ type, formData }),
  });

export const getDocument = (id: string) =>
  json<{ _id: string; type: string; status: string; formData: Record<string, string>; createdAt: string; pdfPath?: string }>(
    `/documents/${id}`
  );

export const generateDocument = async (id: string) => {
  const res = await json<{ message: string; document: { _id: string; status: string }; pdfBase64?: string }>(
    `/documents/${id}/generate`,
    { method: 'POST' }
  );
  return res; // returns { document, pdfBase64 }
};

export const downloadDocumentUrl = (id: string) => `${BASE_URL}/documents/${id}/download?token=${getAccessToken()}`;

export const deleteDocument = (id: string) =>
  json(`/documents/${id}`, { method: 'DELETE' });

// ── Consultations (Admin-Mediated) ──────────────────────────────────────────
export type ConsultationStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'accepted'
  | 'in_progress'
  | 'closed'
  | 'cancelled';

export interface ConsultationRequest {
  _id: string;
  legalCategory: string;
  description: string;
  city: string;
  state?: string;
  preferredLanguage: string;
  status: ConsultationStatus;
  adminNotes?: string;
  assignedLawyerId?: {
    _id: string;
    name: string;
    phone: string;
    email: string;
    city: string;
  };
  documentId?: {
    _id: string;
    type: string;
    title: string;
  };
  createdAt: string;
}

export const createConsultationRequest = (data: {
  legalCategory: string;
  description: string;
  city: string;
  state?: string;
  preferredLanguage?: string;
  documentId?: string;
}) => json<ConsultationRequest>('/consultations', { method: 'POST', body: JSON.stringify(data) });

export const getConsultationRequests = () => json<ConsultationRequest[]>('/consultations');

export const getConsultationRequest = (id: string) => json<ConsultationRequest>(`/consultations/${id}`);

export const rateConsultation = (id: string, rating: number, note?: string) =>
  json(`/consultations/${id}/rate`, { method: 'POST', body: JSON.stringify({ rating, note }) });

// ── Deprecated Lawyers/Bookings (Legacy) ──────────────────────────────────────
export interface Lawyer { _id: string; name: string; specialty: string; city: string; }
export interface Booking { _id: string; lawyerId: any; date: string; time: string; status: string; }
export const getLawyers = () => { throw new Error('Deprecated'); };
export const createBooking = () => { throw new Error('Deprecated'); };
export const getUpcomingBookings = () => json<Booking[]>('/bookings/upcoming'); // Keep for backward compatibility until HomeDashboard is updated


// ── Payments ──────────────────────────────────────────────────────────────────
export const pay = (bookingId: string, amount: number) =>
  json<{ success: boolean; transactionId: string }>('/payments/pay', {
    method: 'POST',
    body: JSON.stringify({ bookingId, amount }),
  });

export const getPaymentHistory = () => json<object[]>('/payments/history');

// ── Subscriptions ─────────────────────────────────────────────────────────────
export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export const getPlans = () => json<Plan[]>('/subscription/plans');

export const getCurrentPlan = () =>
  json<Plan & { since?: string }>('/subscription/current');

export const upgradePlan = (planId: string) =>
  json('/subscription/upgrade', { method: 'POST', body: JSON.stringify({ planId }) });

export const cancelSubscription = () =>
  json('/subscription/cancel', { method: 'POST' });

// ── Notifications ─────────────────────────────────────────────────────────────
export interface ApiNotification {
  _id: string;
  type: 'document' | 'consultation' | 'reminder' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const getNotifications = () =>
  json<{ notifications: ApiNotification[]; unreadCount: number }>('/notifications');

export const markNotificationRead = (id: string) =>
  json<ApiNotification>(`/notifications/${id}/read`, { method: 'PUT' });

export const markAllNotificationsRead = () =>
  json('/notifications/read-all', { method: 'PUT' });

export const deleteNotification = (id: string) =>
  json(`/notifications/${id}`, { method: 'DELETE' });

// ── AI Assistant ──────────────────────────────────────────────────────────────
export const askAI = (query: string) =>
  json<{ response: string }>('/ai/query', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });

// ── Lawyer Reviews ────────────────────────────────────────────────────────────
export interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId: { name: string } | string;
}

export const getLawyerReviews = (lawyerId: string) =>
  json<Review[]>(`/lawyers/${lawyerId}/reviews`);

export const submitReview = (lawyerId: string, rating: number, comment: string) =>
  json<Review>(`/lawyers/${lawyerId}/review`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  });
