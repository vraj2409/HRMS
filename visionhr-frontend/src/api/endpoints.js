// Central map of backend routes audited from visionhr-backend.
// Keeps path strings out of feature files — update here if routes change.

export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
    changePassword: '/auth/change-password',
  },
  employees: {
    list: '/employees',
    create: '/employees',
    me: '/employees/me',
    byId: (id) => `/employees/${id}`,
    deactivate: (id) => `/employees/${id}`,
    uploadDoc: (id) => `/employees/${id}/documents`,
    uploadDocMe: '/employees/me/documents',
    viewDoc: (id, docId) => `/employees/${id}/documents/${docId}/view`,
    viewDocMe: (docId) => `/employees/me/documents/${docId}/view`,
    deleteDoc: (id, docId) => `/employees/${id}/documents/${docId}`,
    deleteDocMe: (docId) => `/employees/me/documents/${docId}`,
  },
  attendance: {
    punchIn: '/attendance/punch-in',
    punchOut: '/attendance/punch-out',
    my: '/attendance/my',
    pendingApprovals: '/attendance/pending-approvals',
    todaySummary: '/attendance/today-summary',
    byEmployee: (employeeId) => `/attendance/employee/${employeeId}`,
    review: (id) => `/attendance/${id}/review`,
  },
  leaves: {
    apply: '/leaves/apply',
    my: '/leaves/my',
    cancel: (id) => `/leaves/${id}/cancel`,
    all: '/leaves',
    action: (id) => `/leaves/${id}/action`,
  },
  payroll: {
    process: '/payroll/process',
    all: '/payroll',
    my: '/payroll/my',
    byId: (id) => `/payroll/${id}`,
    summary: (month, year) => `/payroll/summary/${month}/${year}`,
    markPaid: (id) => `/payroll/${id}/mark-paid`,
  },
  departments: {
    list: '/departments',
    create: '/departments',
    update: (id) => `/departments/${id}`,
    delete: (id) => `/departments/${id}`,
  },
};
