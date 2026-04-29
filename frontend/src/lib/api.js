import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// Attach Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

// Incidents
export const incidentsApi = {
  getAll: () => api.get('/incidents'),
  getById: (id) => api.get(`/incidents/${id}`),
  create: (data) => api.post('/incidents', data),
  update: (id, data) => api.patch(`/incidents/${id}`, data),
  delete: (id) => api.delete(`/incidents/${id}`),
};

// Teams
export const teamsApi = {
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
  create: (data) => api.post('/teams', data),
  update: (id, data) => api.patch(`/teams/${id}`, data),
  assign: (teamId, incidentId) => api.post(`/teams/${teamId}/assign`, { incident_id: incidentId }),
};

// Assignments
export const assignmentsApi = {
  getAll: (params) => api.get('/assignments', { params }),
  update: (id, data) => api.patch(`/assignments/${id}`, data),
};

// Resources
export const resourcesApi = {
  getAll: (params) => api.get('/resources', { params }),
  getSummary: () => api.get('/resources/summary'),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.patch(`/resources/${id}`, data),
};

// Alerts
export const alertsApi = {
  getAll: () => api.get('/alerts'),
  create: (data) => api.post('/alerts', data),
};

// Profiles
export const profilesApi = {
  getMe: () => api.get('/profiles/me'),
  getAll: () => api.get('/profiles'),
  updateMe: (data) => api.patch('/profiles/me', data),
  updateRole: (id, role) => api.patch(`/profiles/${id}/role`, { role }),
};

export default api;
