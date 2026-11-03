// API client service with token handling and error formatting

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function getAuthHeaders(isFormData = false) {
  const token = localStorage.getItem('land_records_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...getAuthHeaders(isFormData),
    ...(options.headers || {})
  };

  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, { ...options, headers });
    
    // Handle 401 Unauthorized
    if (response.status === 401 && !endpoint.includes('/api/auth/login')) {
      console.warn("Session expired or unauthorized. Clearing stored token.");
      localStorage.removeItem('land_records_token');
      localStorage.removeItem('land_records_user');
      // Dispatch custom event for UI updates
      window.dispatchEvent(new Event('auth_state_changed'));
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: async (email, password) => {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getProfile: async () => {
    return request('/api/auth/me');
  },

  // Dashboard
  getDashboardStats: async () => {
    return request('/api/dashboard/stats');
  },

  // Land Records
  getRecords: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, v);
      }
    });
    return request(`/api/records?${query.toString()}`);
  },

  getRecordById: async (id) => {
    return request(`/api/records/${id}`);
  },

  createRecord: async (recordData) => {
    return request('/api/records', {
      method: 'POST',
      body: JSON.stringify(recordData),
    });
  },

  updateRecord: async (id, recordData) => {
    return request(`/api/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recordData),
    });
  },

  deleteRecord: async (id) => {
    return request(`/api/records/${id}`, {
      method: 'DELETE',
    });
  },

  // Document Upload & OCR
  uploadDocument: async (file, recordId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (recordId) {
      formData.append('record_id', recordId);
    }
    return request('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });
  },

  extractOcrDirect: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/ocr/extract', {
      method: 'POST',
      body: formData,
    });
  },

  // Validation
  getValidationReport: async (recordId) => {
    return request(`/api/validation/${recordId}`);
  },

  revalidateRecord: async (recordId) => {
    return request(`/api/validation/${recordId}`, {
      method: 'POST',
    });
  },

  // Admin
  getAdminUsers: async () => {
    return request('/api/admin/users');
  },

  createAdminUser: async (userData) => {
    return request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getAdminActivity: async (limit = 50) => {
    return request(`/api/admin/activity?limit=${limit}`);
  },

  approveRecord: async (recordId, notes = '') => {
    return request(`/api/admin/records/${recordId}/approve?notes=${encodeURIComponent(notes)}`, {
      method: 'PUT',
    });
  },

  rejectRecord: async (recordId, reason = '') => {
    return request(`/api/admin/records/${recordId}/reject?reason=${encodeURIComponent(reason)}`, {
      method: 'PUT',
    });
  },

  // Monitoring & Health
  getHealth: async () => {
    return request('/health');
  },

  getMonitoringStatus: async () => {
    return request('/api/monitoring/status');
  }
};
