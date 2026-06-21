/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Employee, Attendance, Leave, WFHRequest, OTRequest, 
  PerformanceReview, Application, Interview, Document, 
  Holiday, Policy, Notification 
} from '../types';

const BASE_URL = ''; // Same origin requests

function getHeaders() {
  const token = localStorage.getItem('hrms_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const api = {
  // Authentication
  login: async (email: string, password?: string): Promise<{ token: string; employee: Employee }> => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed.');
    }
    return res.json();
  },

  getMe: async (): Promise<Employee> => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to retrieve credentials.');
    return res.json();
  },

  // Employees
  getEmployees: async (): Promise<Employee[]> => {
    const res = await fetch(`${BASE_URL}/api/employees`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load employee list.');
    return res.json();
  },

  createEmployee: async (data: Partial<Employee>): Promise<Employee> => {
    const res = await fetch(`${BASE_URL}/api/employees`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to register employee.');
    }
    return res.json();
  },

  getProfile: async (id: string): Promise<Employee> => {
    const res = await fetch(`${BASE_URL}/api/employees/profile/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to retrieve details of profile.');
    return res.json();
  },

  updateProfile: async (id: string, data: any): Promise<any> => {
    const res = await fetch(`${BASE_URL}/api/employees/profile/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to edit profile fields.');
    return res.json();
  },

  // Attendance
  getAttendance: async (employeeId?: string): Promise<Attendance[]> => {
    const query = employeeId ? `?employeeId=${employeeId}` : '';
    const res = await fetch(`${BASE_URL}/api/attendance${query}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch attendance report.');
    return res.json();
  },

  clockIn: async (): Promise<Attendance> => {
    const res = await fetch(`${BASE_URL}/api/attendance/clockin`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to punch in.');
    }
    return res.json();
  },

  clockOut: async (): Promise<Attendance> => {
    const res = await fetch(`${BASE_URL}/api/attendance/clockout`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to punch out.');
    }
    return res.json();
  },

  resetAttendance: async (): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${BASE_URL}/api/attendance/reset`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to reset attendance.');
    }
    return res.json();
  },

  // Leaves
  getLeaves: async (): Promise<Leave[]> => {
    const res = await fetch(`${BASE_URL}/api/leaves`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load leaves.');
    return res.json();
  },

  applyLeave: async (data: { leaveType: string; fromDate: string; toDate: string; totalDays: number; reason: string }): Promise<Leave> => {
    const res = await fetch(`${BASE_URL}/api/leaves`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error occurred filing leave.');
    }
    return res.json();
  },

  updateLeaveStatus: async (id: string, status: 'Approved' | 'Rejected'): Promise<any> => {
    const res = await fetch(`${BASE_URL}/api/leaves/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Authentication failed for action.');
    return res.json();
  },

  // Work From Home (WFH)
  getWFH: async (): Promise<WFHRequest[]> => {
    const res = await fetch(`${BASE_URL}/api/wfh`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch WFH records.');
    return res.json();
  },

  applyWFH: async (data: { fromDate: string; toDate: string; reason: string }): Promise<WFHRequest> => {
    const res = await fetch(`${BASE_URL}/api/wfh`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to apply for WFH.');
    return res.json();
  },

  updateWFHStatus: async (id: string, status: 'Approved' | 'Rejected'): Promise<any> => {
    const res = await fetch(`${BASE_URL}/api/wfh/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed update WFH request.');
    return res.json();
  },

  // Overtime (OT)
  getOvertime: async (): Promise<OTRequest[]> => {
    const res = await fetch(`${BASE_URL}/api/overtime`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load OT log.');
    return res.json();
  },

  logOvertime: async (data: { date: string; hours: number; reason: string }): Promise<OTRequest> => {
    const res = await fetch(`${BASE_URL}/api/overtime`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to log overtime.');
    return res.json();
  },

  updateOTStatus: async (id: string, status: 'Approved' | 'Rejected'): Promise<any> => {
    const res = await fetch(`${BASE_URL}/api/overtime/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to process OT status update.');
    return res.json();
  },

  // Performance Reviews
  getPerformanceReviews: async (): Promise<PerformanceReview[]> => {
    const res = await fetch(`${BASE_URL}/api/performance-reviews`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load performance evaluations.');
    return res.json();
  },

  createPerformanceReview: async (data: { employeeId: string; period: string; rating: number; comments: string }): Promise<PerformanceReview> => {
    const res = await fetch(`${BASE_URL}/api/performance-reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to file review.');
    return res.json();
  },

  // Job Applications
  getApplications: async (): Promise<Application[]> => {
    const res = await fetch(`${BASE_URL}/api/applications`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to query open job requests.');
    return res.json();
  },

  // Candidate Interviews
  getInterviews: async (): Promise<Interview[]> => {
    const res = await fetch(`${BASE_URL}/api/interviews`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load candidate interview files.');
    return res.json();
  },

  scheduleInterview: async (data: { candidateName: string; position: string; department: string; stage: string; interviewers: string[]; datetime: string }): Promise<Interview> => {
    const res = await fetch(`${BASE_URL}/api/interviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to record interview scheduling.');
    return res.json();
  },

  // Holidays
  getHolidays: async (): Promise<Holiday[]> => {
    const res = await fetch(`${BASE_URL}/api/holidays`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to get holiday program list.');
    return res.json();
  },

  // Policies
  getPolicies: async (): Promise<Policy[]> => {
    const res = await fetch(`${BASE_URL}/api/policies`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to request policy document catalog.');
    return res.json();
  },

  // Notifications
  getNotifications: async (): Promise<Notification[]> => {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch alert list.');
    return res.json();
  },

  markNotificationRead: async (id: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to clear read status.');
    return res.json();
  },

  // S3 Documents
  getDocuments: async (): Promise<Document[]> => {
    const res = await fetch(`${BASE_URL}/api/documents`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to index S3 files.');
    return res.json();
  },

  uploadDocument: async (file: File, category: string): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    // Get auth token separately for custom header handling (no application/json here)
    const token = localStorage.getItem('hrms_token');
    const res = await fetch(`${BASE_URL}/api/documents/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      const detailedMsg = err.error ? `${err.message} (${err.error})` : (err.message || 'Direct S3 doc file upload failed.');
      throw new Error(detailedMsg);
    }
    return res.json();
  },

  deleteDocument: async (id: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/api/documents/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      let msg = 'Failed to delete Document.';
      try {
        const err = await res.json();
        msg = err.message || msg;
      } catch (e) {
        try {
          msg = await res.text() || msg;
        } catch (inner) {}
      }
      throw new Error(msg);
    }
    return res.json();
  }
};
