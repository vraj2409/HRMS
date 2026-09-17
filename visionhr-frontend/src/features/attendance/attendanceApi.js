import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';

export const attendanceApi = {
  punchIn: () => api.post(ENDPOINTS.attendance.punchIn).then((r) => r.data.data),
  punchOut: () => api.post(ENDPOINTS.attendance.punchOut).then((r) => r.data.data),
  my: (params = {}) => api.get(ENDPOINTS.attendance.my, { params }).then((r) => r.data),
  pendingApprovals: (params = {}) =>
    api.get(ENDPOINTS.attendance.pendingApprovals, { params }).then((r) => r.data),
  todaySummary: () => api.get(ENDPOINTS.attendance.todaySummary).then((r) => r.data.data),
  byEmployee: (employeeId, params = {}) =>
    api.get(ENDPOINTS.attendance.byEmployee(employeeId), { params }).then((r) => r.data),
  review: (id, status, remarks = '') =>
    api.patch(ENDPOINTS.attendance.review(id), { status, remarks }).then((r) => r.data.data),
};
