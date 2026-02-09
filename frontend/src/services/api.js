import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({ baseURL });

export const propertyAPI = {
  getProperties: (params = {}) => api.get('/properties/', { params }),
  getPropertyDetail: (slug) => api.get(`/properties/${slug}/`),
  getLocationSuggestions: (q = '') => api.get('/locations/autocomplete/', { params: { q } }),
};

export default api;
