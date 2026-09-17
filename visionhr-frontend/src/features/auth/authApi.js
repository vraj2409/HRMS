import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';

export const authApi = {
  login: (email, password) => api.post(ENDPOINTS.auth.login, { email, password }).then((r) => r.data.data),
  me: () => api.get(ENDPOINTS.auth.me).then((r) => r.data.data),
  logout: () => api.post(ENDPOINTS.auth.logout).then((r) => r.data),
  changePassword: (payload) => api.patch(ENDPOINTS.auth.changePassword, payload).then((r) => r.data),
};
