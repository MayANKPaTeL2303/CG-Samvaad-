import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/users/token/refresh/`, {
            refresh: refreshToken,
          });
          
          localStorage.setItem('access_token', response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          
          return api(originalRequest);
        } catch (err) {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/users/register/', data),
  login: (data) => api.post('/users/login/', data),
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (data) => api.patch('/users/profile/', data),
};

// Complaint APIs
export const complaintAPI = {
  getAll: (params) => api.get('/complaints/v2/', { params }),
  getById: (id) => api.get(`/complaints/v2/${id}/`),
  create: (data) => {
    const formData = new FormData();
  
    // Handle each field properly
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.category) formData.append('category', data.category);
    
    // Handle coordinates - convert to proper decimal strings
    if (data.latitude !== undefined && data.latitude !== null) {
      formData.append('latitude', parseFloat(data.latitude).toFixed(6));
    }
    if (data.longitude !== undefined && data.longitude !== null) {
      formData.append('longitude', parseFloat(data.longitude).toFixed(6));
    }
  
    // Handle optional fields
    if (data.address) formData.append('address', data.address);
    if (data.district) formData.append('district', data.district);
    if (data.priority) formData.append('priority', data.priority);
  
    // Handle image - only append if it exists and is a File object
    if (data.image && data.image instanceof File) {
      formData.append('image', data.image);
    }
  
    // Debug logging
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
  
    return api.post('/complaints/v2/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
},
  update: (id, data) => api.patch(`/complaints/v2/${id}/`, data),
  delete: (id) => api.delete(`/complaints/v2/${id}/`),
  rateComplaint: (id, data) => api.post(`/complaints/v2/${id}/rate_complaint/`, data),
  getUpdates: (id) => api.get(`/complaints/v2/${id}/updates/`),
  assignToMe: (id) => api.post(`/complaints/v2/${id}/assign_to_me/`),
};

// Analytics APIs
export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard_stats/'),
  clusterComplaints: (data) => api.post('/analytics/cluster_complaints/', data),
  getClusters: () => api.get('/analytics/get_clusters/'),
  getHeatmapData: (params) => api.get('/analytics/heatmap_data/', { params }),
};

export default api;