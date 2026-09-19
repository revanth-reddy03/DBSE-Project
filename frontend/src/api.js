const API_BASE = 'http://localhost:5000/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: getHeaders(),
    ...options
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Authentication
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getProfile: () => request('/auth/profile'),

  getStaffMembers: () => request('/auth/staff'),

  // Vehicles
  getVehicles: (userId) =>
    request(`/vehicles${userId ? `?userId=${userId}` : ''}`),

  getVehicleById: (id) => request(`/vehicles/${id}`),

  createVehicle: (data) =>
    request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateVehicle: (id, data) =>
    request(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteVehicle: (id) =>
    request(`/vehicles/${id}`, {
      method: 'DELETE'
    }),

  // Service Centers & Slots
  getServiceCenters: () => request('/service-centers'),

  getCenterSlots: (centerId, date) =>
    request(`/service-centers/${centerId}/slots${date ? `?date=${date}` : ''}`),

  // Services Catalog
  getServices: (category) =>
    request(`/services${category ? `?category=${encodeURIComponent(category)}` : ''}`),

  // Bookings
  createBooking: (data) =>
    request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getBookings: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.centerId) query.append('centerId', params.centerId);
    if (params.date) query.append('date', params.date);
    if (params.search) query.append('search', params.search);
    if (params.assignedOnly) query.append('assignedOnly', 'true');
    const qs = query.toString();
    return request(`/bookings${qs ? `?${qs}` : ''}`);
  },

  getBookingDetails: (identifier) =>
    request(`/bookings/${identifier}`),

  cancelBooking: (id, reason) =>
    request(`/bookings/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    }),

  // Jobs / Mechanics
  assignMechanic: (bookingId, mechanicId, notes) =>
    request(`/jobs/assign/${bookingId}`, {
      method: 'POST',
      body: JSON.stringify({ mechanicId, notes })
    }),

  updateJobStatus: (bookingId, status, comments, estimatedCompletionHours) =>
    request(`/jobs/status/${bookingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, comments, estimatedCompletionHours })
    }),

  addPartsOrLabor: (bookingId, data) =>
    request(`/jobs/parts/${bookingId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Invoices
  getInvoiceByBooking: (bookingId) =>
    request(`/invoices/booking/${bookingId}`),

  getAllInvoices: () => request('/invoices'),

  payInvoice: (id, payment_method) =>
    request(`/invoices/${id}/pay`, {
      method: 'PATCH',
      body: JSON.stringify({ payment_method })
    }),

  // Stats / Admin
  getDashboardStats: () => request('/stats/dashboard'),

  // Notifications
  getNotifications: () => request('/notifications')
};
