import axiosInstance from './axiosInstance';

export const routeApi = {
  create:       (data)   => axiosInstance.post('/routes', data),
  getAll:       (params) => axiosInstance.get('/routes', { params }),
  getById:      (id)     => axiosInstance.get(`/routes/${id}`),
  update:       (id, data) => axiosInstance.patch(`/routes/${id}`, data),
  delete:       (id)     => axiosInstance.delete(`/routes/${id}`),
  generate:     (data)   => axiosInstance.post('/routes/generate', data),
  optimize:     (data)   => axiosInstance.post('/routes/optimize', data),
  completeStop: (routeId, stopId) =>
    axiosInstance.patch(`/routes/${routeId}/stop/${stopId}/complete`),
};