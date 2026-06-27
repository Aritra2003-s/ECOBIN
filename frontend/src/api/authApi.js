import axiosInstance from './axiosInstance';

export const authApi = {
  register:       (data) => axiosInstance.post('/auth/register', data),
  login:          (data) => axiosInstance.post('/auth/login', data),
  getMe:          ()     => axiosInstance.get('/auth/me'),
  changePassword: (data) => axiosInstance.patch('/auth/change-password', data),
};