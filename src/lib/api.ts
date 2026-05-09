const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

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
  const res = await json<{ document: { _id: string; status: string; pdfPath: string } }>(`/documents/${id}/generate`, { method: 'POST' });
  return res.document;
};

export const downloadDocumentUrl = (id: string) => `${BASE_URL}/documents/${id}/download?token=${getAccessToken()}`;

export const deleteDocument = (id: string) =>
  json(`/documents/${id}`, { method: 'DELETE' });

// ── Lawyers ───────────────────────────────────────────────────────────────────
export interface Lawyer {
  _id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  reviewCount: number;
  availability: string;
  pricePerHour: number;
  verified: boolean;
  city: string;
  bio: string;
  availableSlots: { date: string; times: string[] }[];
}

export const getLawyers = (params?: { specialty?: string; search?: string }) => {
  const qs = new URLSearchParams();
  if (params?.specialty) qs.set('specialty', params.specialty);
  if (params?.search) qs.set('search', params.search);
  return json<Lawyer[]>(`/lawyers${qs.toString() ? `?${qs}` : ''}`);
};

export const getLawyer = (id: string) => json<Lawyer>(`/lawyers/${id}`);

export const getLawyerAvailability = (id: string) =>
  json<{ date: string; times: string[] }[]>(`/lawyers/${id}/availability`);

// ── Bookings ──────────────────────────────────────────────────────────────────
export interface Booking {
  _id: string;
  lawyerId: { _id: string; name: string; specialty: string } | string;
  date: string;
  time: string;
  type: string;
  status: string;
  amount: number;
  paymentId?: string;
}

export const createBooking = (data: { lawyerId: string; date: string; time: string; type: string }) =>
  json<Booking>('/bookings', { method: 'POST', body: JSON.stringify(data) });

export const getBookings = () => json<Booking[]>('/bookings');

export const getUpcomingBookings = () => json<Booking[]>('/bookings/upcoming');

export const getBooking = (id: string) => json<Booking>(`/bookings/${id}`);

export const cancelBooking = (id: string) =>
  json(`/bookings/${id}/cancel`, { method: 'POST' });

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
