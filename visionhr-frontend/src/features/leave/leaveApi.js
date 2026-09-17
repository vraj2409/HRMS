import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';

export const leaveApi = {
  apply: (payload) => api.post(ENDPOINTS.leaves.apply, payload).then((r) => r.data.data),
  my: (params = {}) => api.get(ENDPOINTS.leaves.my, { params }).then((r) => r.data),
  cancel: (id) => api.patch(ENDPOINTS.leaves.cancel(id)).then((r) => r.data.data),
  all: (params = {}) => api.get(ENDPOINTS.leaves.all, { params }).then((r) => r.data),
  action: (id, status, remarks = '') =>
    api.patch(ENDPOINTS.leaves.action(id), { status, remarks }).then((r) => r.data.data),
};
