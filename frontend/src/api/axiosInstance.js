import axios from 'axios';

const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_BASE_URL;
  if (envURL && envURL.trim() !== "") {
    return envURL;
  }
  return 'http://localhost:5000/api/v1';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  // Removed hardcoded global Content-Type here to let Axios automatically 
  // set multi-part form boundaries when sending files.
});

// Request interceptor: Inject dynamic authentication tokens and content headers
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('wms_token');
  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Automatically adjust header configuration types dynamically based on payloads
  if (!config.headers['Content-Type']) {
    if (config.data instanceof FormData) {
      // Delete header entirely to let browser natively append exact boundary tags
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }
  }

  return config;
});

// Global response interceptor: Surface errors cleanly WITHOUT stripping Axios metadata
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract the precise backend message string
    const fallbackMessage =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0] ||
      error.message ||
      'Something went wrong';

    // FIXED: Append the clean string directly onto the native Axios error instance.
    // This allows components to catch both explicit strings AND full response entities.
    error.message = fallbackMessage; 
    
    return Promise.reject(error);
  }
);

// ── EXTENDED: ROUTE API MODULE ────────────────────────────────────────────────
export const routeApi = {
  create: async (data) => {
    const response = await axiosInstance.post('/routes', data);
    return response.data;
  },
  getAll: async (params) => {
    const response = await axiosInstance.get('/routes', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`/routes/${id}`);
    return response.data;
  },
  update: async (id, data) => {
    const response = await axiosInstance.patch(`/routes/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/routes/${id}`);
    return response.data;
  },
  completeStop: async (routeId, stopId) => {
    const response = await axiosInstance.patch(`/routes/${routeId}/stop/${stopId}/complete`);
    return response.data;
  },
};

// ── UNIFIED ENDPOINT ARCHITECTURES ──────────────────────────────────────────
export const pickupApi = {
  create: async (pickupData) => {
    const response = await axiosInstance.post('/pickups', pickupData);
    return response.data;
  }
};

export const reportApi = {
  create: async (reportData) => {
    const response = await axiosInstance.post('/reports', reportData);
    return response.data;
  }
};

export default axiosInstance;