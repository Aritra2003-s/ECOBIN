import axiosInstance from './axiosInstance';

export const aiApi = {
  classifyText: (text) =>
    axiosInstance.post('/ai/classify-text', { text }),

  classifyImage: (formData) =>
    axiosInstance.post('/ai/classify-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  optimizeRoute: (data)  => axiosInstance.post('/ai/optimize-route', data),
  getPredictions: ()     => axiosInstance.get('/ai/predict'),
  getInsights:   (params) => axiosInstance.get('/ai/insights', { params }),
  markRead:      (id)    => axiosInstance.patch(`/ai/insights/${id}/read`),
};