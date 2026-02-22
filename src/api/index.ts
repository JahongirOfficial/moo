import axios from 'axios';

// Dinamik API URL - protocol ga qarab
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `http://${window.location.hostname}:3001/api`
  : `${window.location.protocol}//${window.location.hostname}/api`;

const api = axios.create({
  baseURL: API_URL,
});

// Simple cache
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 30000; // 30 sekund

const getCached = (key: string) => {
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCache = (key: string, data: any) => {
  cache[key] = { data, timestamp: Date.now() };
};

export const clearCache = (pattern?: string) => {
  if (pattern) {
    Object.keys(cache).forEach(key => {
      if (key.includes(pattern)) delete cache[key];
    });
  } else {
    Object.keys(cache).forEach(key => delete cache[key]);
  }
};

// Add token to requests (optional - only for admin routes)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  login: (phone: string, password: string) => api.post('/auth/login', { phone, password }),
  register: (fullName: string, phone: string, password: string) => api.post('/auth/register', { fullName, phone, password }),
  getMe: () => api.get('/auth/me'),
};


// Sections (Bo'limlar) - cached
export const sectionsAPI = {
  getAll: async () => {
    const cached = getCached('sections');
    if (cached) return { data: cached };
    const res = await api.get('/sections');
    setCache('sections', res.data);
    return res;
  },
  getOne: async (id: string) => {
    const cached = getCached(`section_${id}`);
    if (cached) return { data: cached };
    const res = await api.get(`/sections/${id}`);
    setCache(`section_${id}`, res.data);
    return res;
  },
  create: (data: { name: string; icon?: string; color?: string }) => { clearCache('sections'); return api.post('/sections', data); },
  update: (id: string, data: { name: string; icon?: string; color?: string }) => { clearCache('section'); return api.put(`/sections/${id}`, data); },
  delete: (id: string, keepCategories?: boolean) => { clearCache('section'); return api.delete(`/sections/${id}`, { params: { keepCategories } }); },
};

// Categories - cached
export const categoriesAPI = {
  getAll: async (sectionId?: string) => {
    const key = sectionId ? `categories_${sectionId}` : 'categories';
    const cached = getCached(key);
    if (cached) return { data: cached };
    const res = await api.get('/categories', { params: { sectionId } });
    setCache(key, res.data);
    return res;
  },
  getOne: async (id: string) => {
    const cached = getCached(`category_${id}`);
    if (cached) return { data: cached };
    const res = await api.get(`/categories/${id}`);
    setCache(`category_${id}`, res.data);
    return res;
  },
  create: (data: { sectionId?: string; name: string; description?: string; icon?: string; color?: string }) => { clearCache('categor'); return api.post('/categories', data); },
  update: (id: string, data: { sectionId?: string; name: string; description?: string; icon?: string; color?: string }) => { clearCache('categor'); return api.put(`/categories/${id}`, data); },
  delete: (id: string) => { clearCache('categor'); return api.delete(`/categories/${id}`); },
};

// Lessons - cached
export const lessonsAPI = {
  getAll: async (categoryId?: string) => {
    const key = categoryId ? `lessons_${categoryId}` : 'lessons';
    const cached = getCached(key);
    if (cached) return { data: cached };
    const res = await api.get('/lessons', { params: { categoryId } });
    setCache(key, res.data);
    return res;
  },
  getOne: async (id: string) => {
    const cached = getCached(`lesson_${id}`);
    if (cached) return { data: cached };
    const res = await api.get(`/lessons/${id}`);
    setCache(`lesson_${id}`, res.data);
    return res;
  },
  create: (data: { categoryId: string; title: string; content?: string; duration?: string; type?: string; videoUrl?: string }) => { clearCache('lesson'); return api.post('/lessons', data); },
  update: (id: string, data: { title: string; content?: string; duration?: string; type?: string; orderIndex?: number; videoUrl?: string }) => { clearCache('lesson'); return api.put(`/lessons/${id}`, data); },
  delete: (id: string) => { clearCache('lesson'); return api.delete(`/lessons/${id}`); },
};

// Users (admin)
export const usersAPI = {
  getAll: () => api.get('/users'),
  getOne: (id: string) => api.get(`/users/${id}`),
  updateSubscription: (id: string, data: { isSubscribed: boolean; days?: number }) => api.put(`/users/${id}/subscription`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  getMySubscription: () => api.get('/users/me/subscription'),
};

// Upload
export const uploadAPI = {
  uploadVideo: (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('video', file);
    return api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
      timeout: 0 // Cheksiz timeout katta fayllar uchun
    });
  },
  deleteVideo: (filename: string) => api.delete(`/upload/video/${filename}`),
};

// AI Chat
export const aiAPI = {
  chat: (message: string) => api.post('/ai/chat', { message }),
  getHistory: () => api.get('/ai/history'),
  clearHistory: () => api.delete('/ai/history'),
};

export default api;
