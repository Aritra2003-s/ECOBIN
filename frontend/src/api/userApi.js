import axiosInstance from './axiosInstance';

export const userApi = {
  getProfile:   ()     => axiosInstance.get('/users/profile'),
  updateProfile: (formData) =>
    axiosInstance.patch('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll:         (params) => axiosInstance.get('/users', { params }),
  getById:        (id)     => axiosInstance.get(`/users/${id}`),
  toggleStatus:   (id)     => axiosInstance.patch(`/users/${id}/status`),
};