import axiosInstance from './axiosInstance';

export const reportApi = {
  // Create report — boundary tags are handled natively via axiosInstance interceptor
  create: (data) => {
    return axiosInstance.post('/reports', data);
  },

  // Get all reports with optional query params
  getAll: (params) => axiosInstance.get('/reports', { params }),

  // Get single report by ID
  getById: (id) => axiosInstance.get(`/reports/${id}`),

  // Update report 
  update: (id, data) => {
    return axiosInstance.patch(`/reports/${id}`, data);
  },

  // Delete report by ID
  delete: (id) => axiosInstance.delete(`/reports/${id}`),
};