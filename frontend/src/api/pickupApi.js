import axiosInstance from './axiosInstance';

export const pickupApi = {
  create:         (data) => axiosInstance.post('/pickups', data),
  getAll:         (params) => axiosInstance.get('/pickups', { params }),
  getById:        (id)   => axiosInstance.get(`/pickups/${id}`),
  updateStatus:   (id, data) => axiosInstance.patch(`/pickups/${id}/status`, data),
  cancel:         (id)   => axiosInstance.patch(`/pickups/${id}/cancel`),
  submitFeedback: (id, data) => axiosInstance.post(`/pickups/${id}/feedback`, data),
};