import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';

export const payrollApi = {
  process: (payload) =>
    api.post(ENDPOINTS.payroll.process, payload).then((r) => r.data.data),
  processForEmployee: (employeeId, payload) =>
    api.post(`/payroll/process/${employeeId}`, payload).then((r) => r.data.data),
  all: (params = {}) =>
    api.get(ENDPOINTS.payroll.all, { params }).then((r) => r.data),
  list: (params = {}) =>
    api.get('/payroll/list', { params }).then((r) => r.data.data),
  my: (params = {}) =>
    api.get(ENDPOINTS.payroll.my, { params }).then((r) => r.data),
  byId: (id) =>
    api.get(ENDPOINTS.payroll.byId(id)).then((r) => r.data.data),
  summary: (month, year) =>
    api.get(ENDPOINTS.payroll.summary(month, year)).then((r) => r.data.data),
  downloadPayslip: (id) =>
    api.get(`/payroll/payslip/${id}/download`).then((r) => r.data.data),
  markPaid: (id, remarks = '') =>
    api.patch(ENDPOINTS.payroll.markPaid(id), { remarks }).then((r) => r.data.data),
};
