/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Employee {
  _id?: string;
  id: string; // e.g. EMP00125
  email: string;
  name: string;
  role: 'HR' | 'Employee';
  title: string;
  department: string;
  dateOfJoining: string;
  phone: string;
  location: string;
  reportingManager: string;
  avatar?: string;
  personalInfo: {
    fatherName: string;
    motherName: string;
    dob: string;
    maritalStatus: string;
    bloodGroup: string;
    nationality: string;
    panCode: string;
    aadhaarCode: string;
    passportNo: string;
    drivingLicense: string;
    languages: string[];
  };
  contactAddress: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  skills: Array<{ name: string; percentage: number }>;
  education: Array<{ degree: string; school: string; years: string; grade: string }>;
  certificates: Array<{ name: string; issuer: string; date: string }>;
}

export interface Attendance {
  _id?: string;
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:MM AM/PM
  checkOut?: string; // HH:MM AM/PM
  status: 'Present' | 'Absent' | 'On Leave' | 'Late' | 'Early Exit';
  workHours?: string;
  lateMinutes?: number;
  earlyExitMinutes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Leave {
  _id?: string;
  id: string;
  employeeId: string;
  leaveType: 'Privilege Leave' | 'Sick Leave' | 'Casual Leave' | 'Earned Leave' | 'Comp Off';
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedOn: string;
}

export interface WFHRequest {
  _id?: string;
  id: string;
  employeeId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedOn: string;
}

export interface OTRequest {
  _id?: string;
  id: string;
  employeeId: string;
  date: string;
  hours: number;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedOn: string;
}

export interface PerformanceReview {
  _id?: string;
  id: string;
  employeeId: string;
  period: string; // e.g. "Annual Review 2025-26"
  rating: number; // 1-5
  comments: string;
  reviewer: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  completedOn?: string;
}

export interface Application {
  _id?: string;
  id: string;
  employeeId: string;
  position: string;
  appliedDate: string;
  status: 'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'Offer Made' | 'Rejected';
}

export interface Interview {
  _id?: string;
  id: string;
  candidateName: string;
  position: string;
  department: string;
  stage: 'Screening' | 'Technical Round' | 'HR Round' | 'Final Round' | 'Offer';
  interviewers: string[];
  datetime: string;
  status: 'Upcoming' | 'Completed' | 'Feedback Pending' | 'Cancelled';
}

export interface Document {
  _id?: string;
  id: string;
  employeeId: string;
  name: string;
  category: 'Identity Proof' | 'Education' | 'Experience' | 'Payroll' | 'Medical' | 'Employment';
  type: string; // e.g. "PDF", "PNG", "JPEG"
  size: string; // e.g. "1.2 MB"
  uploadDate: string;
  expiryDate?: string;
  url: string; // S3 URL or fallback local upload URL
}

export interface Holiday {
  _id?: string;
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: 'National Holiday' | 'Festival' | 'Restricted Holiday' | 'Optional Holiday';
  location: string;
  description: string;
  hinduMonth?: string;
  hinduTithi?: string;
}

export interface Policy {
  _id?: string;
  id: string;
  name: string;
  category: 'Workplace Conduct' | 'Workplace' | 'Leave' | 'Flexible Working' | 'Compensation' | 'Performance' | 'Information Security' | 'Finance' | 'Others';
  lastUpdated: string;
  version: string;
  status: 'Mandatory' | 'Optional';
  url: string;
}

export interface Notification {
  _id?: string;
  id: string;
  employeeId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
