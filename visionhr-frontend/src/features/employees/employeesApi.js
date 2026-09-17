import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';

export const employeesApi = {
  list: (params = {}) => api.get(ENDPOINTS.employees.list, { params }).then((r) => r.data),
  byId: (id) => api.get(ENDPOINTS.employees.byId(id)).then((r) => r.data.data),
  getMe: () => api.get(ENDPOINTS.employees.me).then((r) => r.data.data),
  create: (payload) => api.post(ENDPOINTS.employees.create, payload).then((r) => r.data.data),
  update: (id, payload) => api.patch(ENDPOINTS.employees.byId(id), payload).then((r) => r.data.data),
  updateMe: (payload) => api.patch(ENDPOINTS.employees.me, payload).then((r) => r.data.data),
  deactivate: (id) => api.delete(ENDPOINTS.employees.deactivate(id)).then((r) => r.data),
  
  uploadDoc: (id, formData) => api.post(ENDPOINTS.employees.uploadDoc(id), formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.data),
  uploadDocMe: (formData) => api.post(ENDPOINTS.employees.uploadDocMe, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.data),
  
  viewDoc: (id, docId) => api.get(ENDPOINTS.employees.viewDoc(id, docId)).then(r => r.data.data),
  viewDocMe: (docId) => api.get(ENDPOINTS.employees.viewDocMe(docId)).then(r => r.data.data),
  
  deleteDoc: (id, docId) => api.delete(ENDPOINTS.employees.deleteDoc(id, docId)).then(r => r.data.data),
  deleteDocMe: (docId) => api.delete(ENDPOINTS.employees.deleteDocMe(docId)).then(r => r.data.data),
};

export const departmentsApi = {
  list: () => api.get(ENDPOINTS.departments.list).then((r) => r.data.data),
};
