import mongoose from 'mongoose';

let isMongoConnected = false;

// We will export schemas and compile Mongoose Models if MONGODB_URI is available.
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['HR', 'Employee'], required: true },
  title: { type: String, required: true },
  department: { type: String, required: true },
  dateOfJoining: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  reportingManager: { type: String, required: true },
  avatar: { type: String },
  personalInfo: {
    fatherName: { type: String },
    motherName: { type: String },
    dob: { type: String },
    maritalStatus: { type: String },
    bloodGroup: { type: String },
    nationality: { type: String },
    panCode: { type: String },
    aadhaarCode: { type: String },
    passportNo: { type: String },
    drivingLicense: { type: String },
    languages: [{ type: String }]
  },
  contactAddress: { type: String },
  emergencyContact: {
    name: { type: String },
    relation: { type: String },
    phone: { type: String }
  },
  skills: [{ name: String, percentage: Number }],
  education: [{ degree: String, school: String, years: String, grade: String }],
  certificates: [{ name: String, issuer: String, date: String }]
}, { timestamps: true });

const attendanceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  date: { type: String, required: true },
  checkIn: { type: String },
  checkOut: { type: String },
  status: { type: String, enum: ['Present', 'Absent', 'On Leave', 'Late', 'Early Exit'], required: true },
  workHours: { type: String },
  lateMinutes: { type: Number },
  earlyExitMinutes: { type: Number }
}, { timestamps: true });

const leaveSchema = new Schema({
  id: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  leaveType: { type: String, enum: ['Privilege Leave', 'Sick Leave', 'Casual Leave', 'Earned Leave', 'Comp Off'], required: true },
  fromDate: { type: String, required: true },
  toDate: { type: String, required: true },
  totalDays: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Approved', 'Pending', 'Rejected'], default: 'Pending' },
  appliedOn: { type: String, required: true }
}, { timestamps: true });

const wfhSchema = new Schema({
  id: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  fromDate: { type: String, required: true },
  toDate: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Approved', 'Pending', 'Rejected'], default: 'Pending' },
  appliedOn: { type: String, required: true }
}, { timestamps: true });

const otSchema = new Schema({
  id: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  date: { type: String, required: true },
  hours: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Approved', 'Pending', 'Rejected'], default: 'Pending' },
  appliedOn: { type: String, required: true }
}, { timestamps: true });

const performanceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  period: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String, required: true },
  reviewer: { type: String, required: true },
  status: { type: String, enum: ['Completed', 'In Progress', 'Pending'], required: true },
  completedOn: { type: String }
}, { timestamps: true });

const applicationSchema = new Schema({
  id: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  position: { type: String, required: true },
  appliedDate: { type: String, required: true },
  status: { type: String, enum: ['Under Review', 'Shortlisted', 'Interview Scheduled', 'Offer Made', 'Rejected'], required: true }
}, { timestamps: true });

const interviewSchema = new Schema({
  id: { type: String, required: true, unique: true },
  candidateName: { type: String, required: true },
  position: { type: String, required: true },
  department: { type: String, required: true },
  stage: { type: String, enum: ['Screening', 'Technical Round', 'HR Round', 'Final Round', 'Offer'], required: true },
  interviewers: [{ type: String }],
  datetime: { type: String, required: true },
  status: { type: String, enum: ['Upcoming', 'Completed', 'Feedback Pending', 'Cancelled'], required: true }
}, { timestamps: true });

const documentSchema = new Schema({
  id: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['Identity Proof', 'Education', 'Experience', 'Payroll', 'Medical', 'Employment'], required: true },
  type: { type: String, required: true },
  size: { type: String, required: true },
  uploadDate: { type: String, required: true },
  expiryDate: { type: String },
  url: { type: String, required: true }
}, { timestamps: true });

const holidaySchema = new Schema({
  id: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['National Holiday', 'Festival', 'Restricted Holiday', 'Optional Holiday'], required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  hinduMonth: { type: String },
  hinduTithi: { type: String }
}, { timestamps: true });

const policySchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  lastUpdated: { type: String, required: true },
  version: { type: String, required: true },
  status: { type: String, enum: ['Mandatory', 'Optional'], required: true },
  url: { type: String, required: true }
}, { timestamps: true });

const notificationSchema = new Schema({
  id: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: String, required: true }
}, { timestamps: true });

// Models variables (lazy initialized on DB connect)
let MEmployee = null;
let MAttendance = null;
let MLeave = null;
let MWFHRequest = null;
let MOTRequest = null;
let MPerformanceReview = null;
let MApplication = null;
let MInterview = null;
let MDocument = null;
let MHoliday = null;
let MPolicy = null;
let MNotification = null;

// Fallback high-fidelity in-memory databases
const initialEmployees = [
  {
    id: "EMP001",
    email: "john.doe@originedge.com",
    name: "John Doe",
    role: "Employee",
    title: "Senior Team Lead",
    department: "Engineering",
    dateOfJoining: "Jan 15, 2022",
    phone: "+91 98765 43210",
    location: "Bengaluru, India",
    reportingManager: "Michael Brown (Engineering Director)",
    personalInfo: {
      fatherName: "Robert Doe",
      motherName: "Linda Doe",
      dob: "May 12, 1994",
      maritalStatus: "Married",
      bloodGroup: "O+",
      nationality: "Indian",
      panCode: "ABCDE1234F",
      aadhaarCode: "1234 5678 9012",
      passportNo: "P1234567",
      drivingLicense: "KA01 20180012345",
      languages: ["English", "Hindi", "Kannada"]
    },
    contactAddress: "#45, 2nd Cross, 5th Main, Koralmangala, Bengaluru, Karnataka - 560034, India",
    emergencyContact: {
      name: "Jane Doe (Wife)",
      relation: "Wife",
      phone: "+91 91234 56789"
    },
    skills: [
      { name: "Leadership", percentage: 90 },
      { name: "Project Management", percentage: 85 },
      { name: "Communication", percentage: 80 },
      { name: "Problem Solving", percentage: 75 },
      { name: "Team Collaboration", percentage: 90 }
    ],
    education: [
      { degree: "Master of Computer Applications", school: "Visvesvaraya Technological University", years: "2016 - 2018", grade: "8.2 CGPA" },
      { degree: "Bachelor of Computer Applications", school: "Bangalore University", years: "2013 - 2016", grade: "7.8 CGPA" }
    ],
    certificates: [
      { name: "PMP® Certification", issuer: "Project Management Institute", date: "Apr 2022" },
      { name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", date: "Sep 2021" }
    ]
  },
  {
    id: "EMP002",
    email: "sarah.wilson@originedge.com",
    name: "Sarah Wilson",
    role: "HR",
    title: "HR Executive",
    department: "Human Resources",
    dateOfJoining: "May 10, 2023",
    phone: "+91 98722 11223",
    location: "Bengaluru, India",
    reportingManager: "Director of HR",
    personalInfo: {
      fatherName: "James Wilson",
      motherName: "Mary Wilson",
      dob: "Oct 22, 1995",
      maritalStatus: "Single",
      bloodGroup: "A+",
      nationality: "Indian",
      panCode: "HRWNS1234E",
      aadhaarCode: "8888 7777 6666",
      passportNo: "P9876543",
      drivingLicense: "KA03 20200055112",
      languages: ["English", "Hindi"]
    },
    contactAddress: "#12, HR Layout, Bengaluru, Karnataka, India",
    emergencyContact: {
      name: "James Wilson (Father)",
      relation: "Father",
      phone: "+91 98711 00332"
    },
    skills: [
      { name: "Talent Acquisition", percentage: 95 },
      { name: "Employee Relations", percentage: 92 },
      { name: "Payroll Management", percentage: 88 }
    ],
    education: [
      { degree: "MBA in HR", school: "Symbiosis Institute", years: "2018 - 2020", grade: "A Grade" }
    ],
    certificates: [
      { name: "SHRM Certified Professional", issuer: "SHRM", date: "Jan 2024" }
    ]
  },
  {
    id: "EMP003",
    email: "michael.brown@originedge.com",
    name: "Michael Brown",
    role: "Employee",
    title: "UI/UX Designer",
    department: "Design",
    dateOfJoining: "Mar 11, 2021",
    phone: "+91 99988 77665",
    location: "Bengaluru, India",
    reportingManager: "VP of Product",
    personalInfo: {
      fatherName: "Charles Brown",
      motherName: "Nancy Brown",
      dob: "Feb 14, 1992",
      maritalStatus: "Married",
      bloodGroup: "B+",
      nationality: "Indian",
      panCode: "MBRNN1222E",
      aadhaarCode: "3333 4444 5555",
      passportNo: "P5544332",
      drivingLicense: "KA04 2015003344",
      languages: ["English"]
    },
    contactAddress: "#88, Indiranagar, Bengaluru, India",
    emergencyContact: {
      name: "Nancy Brown (Mother)",
      relation: "Mother",
      phone: "+91 99001 12233"
    },
    skills: [
      { name: "Figma UI Design", percentage: 98 },
      { name: "Typography & Layout", percentage: 95 },
      { name: "Interaction Design", percentage: 90 }
    ],
    education: [
      { degree: "Bachelor of Design", school: "National Institute of Design", years: "2010 - 2014", grade: "9.0 CGPA" }
    ],
    certificates: [
      { name: "Google UX Certificate", issuer: "Google Coursera", date: "Jun 2020" }
    ]
  },
  {
    id: "EMP004",
    email: "emily.johnson@originedge.com",
    name: "Emily Johnson",
    role: "Employee",
    title: "Project Manager",
    department: "Engineering",
    dateOfJoining: "Jan 20, 2021",
    phone: "+91 90088 11224",
    location: "Bengaluru, India",
    reportingManager: "VP of Engineering",
    personalInfo: {
      fatherName: "Thomas Johnson",
      motherName: "Susan Johnson",
      dob: "Dec 05, 1990",
      maritalStatus: "Married",
      bloodGroup: "O-",
      nationality: "Indian",
      panCode: "PMTJN1045E",
      aadhaarCode: "9900 1100 2200",
      passportNo: "P0011223",
      drivingLicense: "KA05 2013009944",
      languages: ["English", "Hindi", "Spanish"]
    },
    contactAddress: "#302, Whitefield, Bengaluru, India",
    emergencyContact: {
      name: "Thomas Johnson (Father)",
      relation: "Father",
      phone: "+91 98800 11223"
    },
    skills: [
      { name: "Agile & Scrum", percentage: 95 },
      { name: "Resource Planning", percentage: 90 },
      { name: "Risk Assessment", percentage: 85 }
    ],
    education: [
      { degree: "B.Tech in Computer Science", school: "IIT Bombay", years: "2008 - 2012", grade: "8.5 CGPA" }
    ],
    certificates: [
      { name: "Scrum Alliance CSM", issuer: "Scrum Alliance", date: "Aug 2021" }
    ]
  },
  {
    id: "EMP005",
    email: "david.lee@originedge.com",
    name: "David Lee",
    role: "Employee",
    title: "Business Analyst",
    department: "Business Analysis",
    dateOfJoining: "Jun 14, 2023",
    phone: "+91 97766 55443",
    location: "Bengaluru, India",
    reportingManager: "Emily Johnson",
    personalInfo: {
      fatherName: "Arthur Lee",
      motherName: "Karen Lee",
      dob: "Mar 30, 1996",
      maritalStatus: "Single",
      bloodGroup: "AB+",
      nationality: "Indian",
      panCode: "DLEEC9988G",
      aadhaarCode: "6655 4433 2211",
      passportNo: "P6655443",
      drivingLicense: "KA06 20210088223",
      languages: ["English", "Tamil"]
    },
    contactAddress: "#101, Electronic City, Bengaluru, India",
    emergencyContact: {
      name: "Karen Lee (Mother)",
      relation: "Mother",
      phone: "+91 95533 11223"
    },
    skills: [
      { name: "Data Analysis", percentage: 90 },
      { name: "SQL & Tableaus", percentage: 85 },
      { name: "Requirements Gathering", percentage: 92 }
    ],
    education: [
      { degree: "B.Com & Analytics PG", school: "Loyola College", years: "2014 - 2018", grade: "7.9 CGPA" }
    ],
    certificates: [
      { name: "Certified Business Analysis Professional (CBAP)", issuer: "IIBA", date: "Nov 2023" }
    ]
  },
  {
    id: "EMP006",
    email: "jessica.taylor@originedge.com",
    name: "Jessica Taylor",
    role: "Employee",
    title: "QA Engineer",
    department: "Quality Assurance",
    dateOfJoining: "Aug 18, 2022",
    phone: "+91 88877 66554",
    location: "Bengaluru, India",
    reportingManager: "John Doe",
    personalInfo: {
      fatherName: "Stephen Taylor",
      motherName: "Lisa Taylor",
      dob: "Jul 15, 1997",
      maritalStatus: "Single",
      bloodGroup: "B-",
      nationality: "Indian",
      panCode: "JTAYL1122H",
      aadhaarCode: "7766 8899 0011",
      passportNo: "P7766554",
      drivingLicense: "KA07 20220055112",
      languages: ["English", "Telugu"]
    },
    contactAddress: "#502, Jayanagar, Bengaluru, India",
    emergencyContact: {
      name: "Stephen Taylor (Father)",
      relation: "Father",
      phone: "+91 88899 00112"
    },
    skills: [
      { name: "Automation Testing", percentage: 88 },
      { name: "Selenium & Cypress", percentage: 85 },
      { name: "Bug Reporting", percentage: 95 }
    ],
    education: [
      { degree: "B.E. in Information Science", school: "PES University", years: "2015 - 2019", grade: "8.0 CGPA" }
    ],
    certificates: [
      { name: "ISTQB Foundation Level", issuer: "ISTQB", date: "Oct 2022" }
    ]
  }
];

const initialAttendance = [
  { id: "ATT001", employeeId: "EMP001", date: "2026-06-20", checkIn: "09:02 AM", checkOut: "06:05 PM", status: "Present", workHours: "9h 03m", lateMinutes: 2, earlyExitMinutes: 0 },
  { id: "ATT002", employeeId: "EMP002", date: "2026-06-20", checkIn: "09:15 AM", checkOut: "06:00 PM", status: "Late", workHours: "8h 45m", lateMinutes: 15, earlyExitMinutes: 0 },
  { id: "ATT003", employeeId: "EMP003", date: "2026-06-20", checkIn: "09:01 AM", checkOut: "06:10 PM", status: "Present", workHours: "9h 09m", lateMinutes: 1, earlyExitMinutes: 0 },
  { id: "ATT004", employeeId: "EMP004", date: "2026-06-20", checkIn: undefined, checkOut: undefined, status: "On Leave", workHours: undefined, lateMinutes: 0, earlyExitMinutes: 0 },
  { id: "ATT005", employeeId: "EMP005", date: "2026-06-20", checkIn: "09:25 AM", checkOut: "05:30 PM", status: "Early Exit", workHours: "8h 05m", lateMinutes: 25, earlyExitMinutes: 30 },
  { id: "ATT006", employeeId: "EMP006", date: "2026-06-20", checkIn: undefined, checkOut: undefined, status: "Absent", workHours: undefined, lateMinutes: 0, earlyExitMinutes: 0 },

  // Previous day
  { id: "ATT007", employeeId: "EMP001", date: "2026-06-19", checkIn: "08:58 AM", checkOut: "06:15 PM", status: "Present", workHours: "9h 17m", lateMinutes: 0, earlyExitMinutes: 0 },
  { id: "ATT008", employeeId: "EMP002", date: "2026-06-19", checkIn: "09:05 AM", checkOut: "06:00 PM", status: "Present", workHours: "8h 55m", lateMinutes: 5, earlyExitMinutes: 0 },
  { id: "ATT009", employeeId: "EMP003", date: "2026-06-19", checkIn: "09:00 AM", checkOut: "06:05 PM", status: "Present", workHours: "9h 05m", lateMinutes: 0, earlyExitMinutes: 0 }
];

const initialLeaves = [
  { id: "LV2026-00128", employeeId: "EMP001", leaveType: "Privilege Leave", fromDate: "2026-05-26", toDate: "2026-05-28", totalDays: 3, reason: "Family function and travel to home town", status: "Approved", appliedOn: "2026-05-20" },
  { id: "LV2026-00115", employeeId: "EMP001", leaveType: "Sick Leave", fromDate: "2026-05-10", toDate: "2026-05-10", totalDays: 1, reason: "Fever and cold, taking rest", status: "Approved", appliedOn: "2026-05-09" },
  { id: "LV2026-00098", employeeId: "EMP001", leaveType: "Casual Leave", fromDate: "2026-04-24", toDate: "2026-04-24", totalDays: 1, reason: "Personal work related to home bank", status: "Approved", appliedOn: "2026-04-22" },
  { id: "LV2026-00076", employeeId: "EMP001", leaveType: "Earned Leave", fromDate: "2026-04-03", toDate: "2026-04-06", totalDays: 4, reason: "Planned vacation with family", status: "Approved", appliedOn: "2026-03-25" },
  { id: "LV2026-00052", employeeId: "EMP001", leaveType: "Privilege Leave", fromDate: "2026-03-18", toDate: "2026-03-19", totalDays: 2, reason: "Family gathering", status: "Rejected", appliedOn: "2026-03-15" },
  { id: "LV2026-00031", employeeId: "EMP001", leaveType: "Comp Off", fromDate: "2026-02-28", toDate: "2026-02-28", totalDays: 1, reason: "Worked on weekend for client release", status: "Approved", appliedOn: "2026-02-25" },
  { id: "LV2026-00140", employeeId: "EMP003", leaveType: "Casual Leave", fromDate: "2026-06-25", toDate: "2026-06-26", totalDays: 2, reason: "Out of city trip", status: "Pending", appliedOn: "2026-06-18" },
  { id: "LV2026-00141", employeeId: "EMP005", leaveType: "Sick Leave", fromDate: "2026-06-22", toDate: "2026-06-22", totalDays: 1, reason: "Doctor appointment", status: "Pending", appliedOn: "2026-06-19" }
];

const initialWFH = [
  { id: "WFH-001", employeeId: "EMP001", fromDate: "2026-06-21", toDate: "2026-06-21", reason: "Home delivery of large household goods", status: "Pending", appliedOn: "2026-06-19" },
  { id: "WFH-002", employeeId: "EMP003", fromDate: "2026-06-10", toDate: "2026-06-12", reason: "Rainy weather & personal request", status: "Approved", appliedOn: "2026-06-08" },
  { id: "WFH-003", employeeId: "EMP005", fromDate: "2026-06-05", toDate: "2026-06-05", reason: "Broadband issue in PG, need to test from local system", status: "Approved", appliedOn: "2026-06-04" }
];

const initialOT = [
  { id: "OT-001", employeeId: "EMP001", date: "2026-06-18", hours: 2.5, reason: "Deployment helper release", status: "Approved", appliedOn: "2026-06-18" },
  { id: "OT-002", employeeId: "EMP001", date: "2026-06-15", hours: 1.5, reason: "Bug critical patching support", status: "Approved", appliedOn: "2026-06-15" },
  { id: "OT-003", employeeId: "EMP003", date: "2026-06-19", hours: 3.0, reason: "UI assets pre-processing", status: "Pending", appliedOn: "2026-06-19" }
];

const initialPerformanceReviews = [
  { id: "REV-001", employeeId: "EMP001", period: "Annual Review 2025-26", rating: 4.2, comments: "John has excelled in project coordination and leading his design-engineering scrum. He shows tremendous focus, maintains stable delivery, and has resolved cross-functional blockages neatly.", reviewer: "Michael Brown (Engineering Manager)", status: "Completed", completedOn: "May 25, 2026" },
  { id: "REV-002", employeeId: "EMP003", period: "Annual Review 2025-26", rating: 4.5, comments: "Michael is a proactive UI designer. His design systems work have saved 30% dev cycles.", reviewer: "Emily Johnson (Project Manager)", status: "Completed", completedOn: "May 20, 2026" },
  { id: "REV-003", employeeId: "EMP005", period: "Annual Review 2025-26", rating: 3.8, comments: "David is strong in documentation. Needs more client engagement experience.", reviewer: "Emily Johnson (Project Manager)", status: "Completed", completedOn: "May 18, 2026" }
];

const initialApplications = [
  { id: "APP-001", employeeId: "EMP001", position: "Software Engineer", appliedDate: "May 10, 2026", status: "Under Review" },
  { id: "APP-002", employeeId: "EMP001", position: "Product Designer", appliedDate: "May 05, 2026", status: "Shortlisted" },
  { id: "APP-003", employeeId: "EMP001", position: "Data Analyst", appliedDate: "Apr 28, 2026", status: "Interview Scheduled" }
];

const initialInterviews = [
  { id: "INT-001", candidateName: "Rohan Sharma", position: "Software Engineer", department: "Engineering", stage: "Technical Round", interviewers: ["John Doe", "Emily Johnson"], datetime: "May 21, 2026 • 10:00 AM", status: "Upcoming" },
  { id: "INT-002", candidateName: "Anjali Patel", position: "Product Manager", department: "HR Layout", stage: "HR Round", interviewers: ["Sarah Wilson"], datetime: "May 21, 2026 • 02:00 PM", status: "Upcoming" },
  { id: "INT-003", candidateName: "Vikram Kumar", position: "UI/UX Designer", department: "Design", stage: "Final Round", interviewers: ["Michael Brown", "Sarah Wilson"], datetime: "May 20, 2026 • 11:00 AM", status: "Feedback Pending" },
  { id: "INT-004", candidateName: "Sneha Nair", position: "Business Analyst", department: "Business", stage: "HR Round", interviewers: ["Sarah Wilson"], datetime: "May 19, 2026 • 03:00 PM", status: "Completed" },
  { id: "INT-005", candidateName: "Manish Das", position: "DevOps Engineer", department: "Engineering", stage: "Technical Round", interviewers: ["John Doe"], datetime: "May 18, 2026 • 10:30 AM", status: "Completed" },
  { id: "INT-006", candidateName: "Priya Reddy", position: "Data Analyst", department: "Data Science", stage: "Technical Round", interviewers: ["David Lee"], datetime: "May 17, 2026 • 04:00 PM", status: "Cancelled" }
];

const initialDocuments = [
  { id: "DOC-001", employeeId: "EMP001", name: "Passport_John_Doe.pdf", category: "Identity Proof", type: "PDF", size: "1.24 MB", uploadDate: "May 10, 2025", url: "" },
  { id: "DOC-002", employeeId: "EMP001", name: "Aadhaar_Card_John.pdf", category: "Identity Proof", type: "PDF", size: "634 KB", uploadDate: "May 15, 2025", url: "" },
  { id: "DOC-003", employeeId: "EMP001", name: "Degree_Certificate_John.pdf", category: "Education", type: "PDF", size: "2.15 MB", uploadDate: "May 12, 2025", url: "" },
  { id: "DOC-004", employeeId: "EMP001", name: "Exp_Letter_TechCorp.pdf", category: "Experience", type: "PDF", size: "1.12 MB", uploadDate: "May 14, 2025", url: "" },
  { id: "DOC-005", employeeId: "EMP001", name: "SalarySlips_Apr2026.pdf", category: "Payroll", type: "PDF", size: "512 KB", uploadDate: "May 05, 2025", url: "" },
  { id: "DOC-006", employeeId: "EMP001", name: "Medical_Insurance_Card.pdf", category: "Medical", type: "PDF", size: "420 KB", uploadDate: "Apr 28, 2025", url: "" },
  { id: "DOC-007", employeeId: "EMP001", name: "PAN_Card_John.pdf", category: "Identity Proof", type: "PDF", size: "756 KB", uploadDate: "Apr 20, 2025", url: "" },
  { id: "DOC-008", employeeId: "EMP001", name: "Offer_Letter_OriginEdge.pdf", category: "Employment", type: "PDF", size: "1.02 MB", uploadDate: "Jan 12, 2022", url: "" }
];

const initialHolidays = [
  { id: "HOL-001", date: "2026-01-14", name: "Makar Sankranti / Pongal", type: "Festival", location: "All Sites", description: "Harvest festival celebrating the transition of the Sun into Makara rashi (Capricorn).", hinduMonth: "Pausha/Magha", hinduTithi: "Solar Transit" },
  { id: "HOL-002", date: "2026-01-26", name: "Republic Day", type: "National Holiday", location: "All Sites", description: "Celebrates the adoption of the Constitution of India.", hinduMonth: "", hinduTithi: "" },
  { id: "HOL-003", date: "2026-02-15", name: "Maha Shivaratri", type: "Festival", location: "All Sites", description: "Great Night of Lord Shiva, celebrating the cosmic dance of Shiva (Tandava) and spiritual vigilance.", hinduMonth: "Phalguna", hinduTithi: "Krishna Paksha Chaturdashi" },
  { id: "HOL-004", date: "2026-03-03", name: "Holi", type: "Festival", location: "India Sites", description: "Festival of colors, marks the arrival of spring and victory of devotion over evil.", hinduMonth: "Phalguna", hinduTithi: "Shukla Paksha Purnima" },
  { id: "HOL-005", date: "2026-03-19", name: "Ugadi / Gudi Padwa", type: "Optional Holiday", location: "Bengaluru & Mumbai", description: "New Year's Day according to the Hindu lunisolar calendar.", hinduMonth: "Chaitra", hinduTithi: "Shukla Paksha Pratipada" },
  { id: "HOL-006", date: "2026-03-27", name: "Rama Navami", type: "Restricted Holiday", location: "All Sites", description: "Birthday celebration of Lord Rama, the seventh avatar of Vishnu.", hinduMonth: "Chaitra", hinduTithi: "Shukla Paksha Navami" },
  { id: "HOL-007", date: "2026-03-31", name: "Eid-ul-Fitr", type: "Festival", location: "All Sites", description: "Islamic festival marking the culmination of the holy fasting month of Ramadan.", hinduMonth: "", hinduTithi: "" },
  { id: "HOL-010", date: "2026-04-10", name: "Mahavir Jayanti", type: "Restricted Holiday", location: "All Sites", description: "Birth anniversary of Lord Mahavir, the 24th Tirthankara of Jainism.", hinduMonth: "Chaitra", hinduTithi: "Shukla Paksha Trayodashi" },
  { id: "HOL-011", date: "2026-04-14", name: "Dr. B. R. Ambedkar Jayanti", type: "National Holiday", location: "All Sites", description: "Birth anniversary of Dr. B. R. Ambedkar, father of the Indian Constitution.", hinduMonth: "", hinduTithi: "" },
  { id: "HOL-012", date: "2026-05-01", name: "Labour Day", type: "Optional Holiday", location: "All Sites", description: "International Workers' Day honoring public labor.", hinduMonth: "", hinduTithi: "" },
  { id: "HOL-013", date: "2026-08-15", name: "Independence Day", type: "National Holiday", location: "All Sites", description: "Celebration of India's Sovereignty gained in 1947.", hinduMonth: "", hinduTithi: "" },
  { id: "HOL-014", date: "2026-08-28", name: "Raksha Bandhan", type: "Optional Holiday", location: "India Sites", description: "Sisters tie amulet of protection on their brothers' wrists to celebrate familial love.", hinduMonth: "Shravana", hinduTithi: "Shukla Paksha Purnima" },
  { id: "HOL-015", date: "2026-09-04", name: "Krishna Janmashtami", type: "Restricted Holiday", location: "All Sites", description: "An annual Hindu festival celebrating the birth of Lord Krishna.", hinduMonth: "Bhadrapada", hinduTithi: "Krishna Paksha Ashtami" },
  { id: "HOL-016", date: "2026-09-14", name: "Ganesh Chaturthi", type: "Festival", location: "Bengaluru & Mumbai", description: "Celebrates the arrival of Lord Ganesha to earth with clay idols and sweet modaks.", hinduMonth: "Bhadrapada", hinduTithi: "Shukla Paksha Chaturthi" },
  { id: "HOL-017", date: "2026-10-02", name: "Gandhi Jayanti", type: "National Holiday", location: "All Sites", description: "Honoring birth anniversary of Mahatma Gandhi.", hinduMonth: "", hinduTithi: "" },
  { id: "HOL-018", date: "2026-10-20", name: "Dussehra / Vijayadashami", type: "Festival", location: "All Sites", description: "Celebrating the victory of Lord Rama over Ravana and Goddess Durga over Mahishasura.", hinduMonth: "Ashvina", hinduTithi: "Shukla Paksha Dashami" },
  { id: "HOL-019", date: "2026-11-08", name: "Diwali / Deepavali", type: "Festival", location: "All Sites", description: "Festival of Lights celebrating Rama's return to Ayodhya and Goddess Lakshmi.", hinduMonth: "Kartika", hinduTithi: "Krishna Paksha Amavasya" },
  { id: "HOL-020", date: "2026-12-25", name: "Christmas Day", type: "National Holiday", location: "All Sites", description: "Annually celebrating the Nativity of Jesus.", hinduMonth: "", hinduTithi: "" }
];

const initialPolicies = [
  { id: "POL-001", name: "Code of Conduct", category: "Workplace Conduct", lastUpdated: "May 10, 2025", version: "v2.1", status: "Mandatory", url: "" },
  { id: "POL-002", name: "Attendance & Punctuality Policy", category: "Workplace", lastUpdated: "Apr 28, 2025", version: "v1.3", status: "Mandatory", url: "" },
  { id: "POL-003", name: "Leave Management Policy", category: "Leave", lastUpdated: "Apr 15, 2025", version: "v2.0", status: "Mandatory", url: "" },
  { id: "POL-004", name: "Work From Home (WFH) Policy", category: "Flexible Working", lastUpdated: "Apr 20, 2025", version: "v1.2", status: "Mandatory", url: "" },
  { id: "POL-005", name: "Overtime Policy", category: "Compensation", lastUpdated: "Apr 18, 2025", version: "v1.1", status: "Mandatory", url: "" },
  { id: "POL-006", name: "Performance Management Policy", category: "Performance", lastUpdated: "May 05, 2025", version: "v2.0", status: "Mandatory", url: "" },
  { id: "POL-007", name: "Information Security Policy", category: "Information Security", lastUpdated: "Mar 30, 2025", version: "v2.2", status: "Mandatory", url: "" },
  { id: "POL-008", name: "Anti-Harassment Policy", category: "Workplace Conduct", lastUpdated: "Apr 02, 2025", version: "v1.4", status: "Mandatory", url: "" },
  { id: "POL-009", name: "Data Privacy Policy", category: "Information Security", lastUpdated: "Mar 22, 2025", version: "v1.1", status: "Mandatory", url: "" },
  { id: "POL-010", name: "Travel & Expense Policy", category: "Finance", lastUpdated: "Apr 12, 2025", version: "v1.0", status: "Optional", url: "" }
];

const initialNotifications = [
  { id: "NOT-001", employeeId: "EMP001", title: "Daily Clock In", message: "You successfully clocked in today at 09:02 AM.", read: false, createdAt: "2026-06-20T09:02:00Z" },
  { id: "NOT-002", employeeId: "EMP001", title: "Leave Approved", message: "Your Privilege Leave request LV2026-00128 from May 26 to May 28 has been approved.", read: false, createdAt: "2026-05-20T11:45:00Z" },
  { id: "NOT-003", employeeId: "EMP001", title: "Performance Review Published", message: "Your supervisor Michael Brown has finalized your annual evaluation 2025-26. Current rating: 4.2 stars.", read: true, createdAt: "2026-05-25T14:30:00Z" },
  { id: "NOT-004", employeeId: "*", title: "New Leave Policy Broadcast", message: "The HR Team has updated the Leave Policy document for Q2 2026. Please check the Policy section.", read: false, createdAt: "2026-06-18T10:00:00Z" }
];

class MemoryDB {
  constructor() {
    this.employees = [...initialEmployees];
    this.attendance = [...initialAttendance];
    this.leaves = [...initialLeaves];
    this.wfhRequests = [...initialWFH];
    this.otRequests = [...initialOT];
    this.performanceReviews = [...initialPerformanceReviews];
    this.applications = [...initialApplications];
    this.interviews = [...initialInterviews];
    this.documents = [...initialDocuments];
    this.holidays = [...initialHolidays];
    this.policies = [...initialPolicies];
    this.notifications = [...initialNotifications];
  }
}

const memoryStore = new MemoryDB();

// Dynamic seeding execution for MongoDB Atlas representation
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("⚠️ Warning: MONGODB_URI environment variable is missing from your .env. We are launching HRMS instantly with our high-fidelity, in-memory backup database. All dashboards and operations will be 100% reactive in this workspace!");
    isMongoConnected = false;
    return;
  }

  let cleanUri = uri;
  try {
    const protocolIndex = uri.indexOf("://");
    if (protocolIndex !== -1) {
      const prefix = uri.substring(0, protocolIndex + 3);
      const remaining = uri.substring(protocolIndex + 3);
      
      let endOfHostIndex = remaining.indexOf("/");
      if (endOfHostIndex === -1) endOfHostIndex = remaining.indexOf("?");
      if (endOfHostIndex === -1) endOfHostIndex = remaining.indexOf("#");
      if (endOfHostIndex === -1) endOfHostIndex = remaining.length;
      
      const hostAndCreds = remaining.substring(0, endOfHostIndex);
      const pathAndOptions = remaining.substring(endOfHostIndex);
      
      const lastAtIdx = hostAndCreds.lastIndexOf("@");
      if (lastAtIdx !== -1) {
        const creds = hostAndCreds.substring(0, lastAtIdx);
        const host = hostAndCreds.substring(lastAtIdx + 1);
        
        const firstColonIdx = creds.indexOf(":");
        if (firstColonIdx !== -1) {
          const username = creds.substring(0, firstColonIdx);
          const password = creds.substring(firstColonIdx + 1);
          
          const safeUsername = encodeURIComponent(decodeURIComponent(username));
          const safePassword = encodeURIComponent(decodeURIComponent(password));
          
          cleanUri = `${prefix}${safeUsername}:${safePassword}@${host}${pathAndOptions}`;
        }
      }
    }
  } catch (cleanErr) {
    console.warn("⚠️ Warning formatting MONGODB_URI, attempting connection with original string...", cleanErr);
  }

  try {
    await mongoose.connect(cleanUri);
    isMongoConnected = true;
    console.log("🚀 MONGODB ATLAS database connected successfully for HRMS!");

    // Compile schemas lazily
    MEmployee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
    MAttendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
    MLeave = mongoose.models.Leave || mongoose.model('Leave', leaveSchema);
    MWFHRequest = mongoose.models.WFHRequest || mongoose.model('WFHRequest', wfhSchema);
    MOTRequest = mongoose.models.OTRequest || mongoose.model('OTRequest', otSchema);
    MPerformanceReview = mongoose.models.PerformanceReview || mongoose.model('PerformanceReview', performanceSchema);
    MApplication = mongoose.models.Application || mongoose.model('Application', applicationSchema);
    MInterview = mongoose.models.Interview || mongoose.model('Interview', interviewSchema);
    MDocument = mongoose.models.Document || mongoose.model('Document', documentSchema);
    MHoliday = mongoose.models.Holiday || mongoose.model('Holiday', holidaySchema);
    MPolicy = mongoose.models.Policy || mongoose.model('Policy', policySchema);
    MNotification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

    // Initial Seed check
    const empCount = await MEmployee.countDocuments();
    if (empCount === 0) {
      console.log("🌱 Database is empty! Seeding default employees, attendance logs, leaves, interviews, and policies...");
      await MEmployee.insertMany(initialEmployees);
      await MAttendance.insertMany(initialAttendance);
      await MLeave.insertMany(initialLeaves);
      await MWFHRequest.insertMany(initialWFH);
      await MOTRequest.insertMany(initialOT);
      await MPerformanceReview.insertMany(initialPerformanceReviews);
      await MApplication.insertMany(initialApplications);
      await MInterview.insertMany(initialInterviews);
      await MDocument.insertMany(initialDocuments);
      await MHoliday.deleteMany({});
      await MHoliday.insertMany(initialHolidays);
      await MPolicy.deleteMany({});
      await MPolicy.insertMany(initialPolicies);
      await MNotification.insertMany(initialNotifications);
      console.log("✨ Seed completed successfully on MongoDB Atlas!");
    } else {
      // Force sync of holidays and policies to keep them correct with code updates
      await MHoliday.deleteMany({});
      await MHoliday.insertMany(initialHolidays);
      await MPolicy.deleteMany({});
      await MPolicy.insertMany(initialPolicies);
      console.log("🔄 Holidays and Policies successfully updated and synced on MongoDB Atlas!");
    }
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB Atlas. Error:", err.message);
    console.log("⚠️ Reverting to reactive Memory DB fallback...");
    isMongoConnected = false;
  }
}

// Global accessor to seamlessly isolate either Memory Store or Mongo Atlas
export const dbService = {
  isAtlasConnected: () => isMongoConnected,

  employees: {
    find: async (query = {}) => {
      if (isMongoConnected) return await MEmployee.find(query).lean();
      return memoryStore.employees.filter(emp => {
        for (const key in query) {
          if (emp[key] !== query[key]) return false;
        }
        return true;
      });
    },
    findOne: async (query) => {
      if (isMongoConnected) return await MEmployee.findOne(query).lean();
      return memoryStore.employees.find(emp => {
        for (const key in query) {
          if (emp[key] !== query[key]) return false;
        }
        return true;
      }) || null;
    },
    create: async (data) => {
      if (isMongoConnected) return (await MEmployee.create(data)).toObject();
      const newEmp = { ...data, _id: "ID_" + Math.random().toString(36).substring(2, 9) };
      memoryStore.employees.push(newEmp);
      return newEmp;
    },
    updateOne: async (query, update) => {
      if (isMongoConnected) return await MEmployee.updateOne(query, update);
      const empIndex = memoryStore.employees.findIndex(emp => {
        for (const key in query) {
          if (emp[key] !== query[key]) return false;
        }
        return true;
      });
      if (empIndex !== -1) {
        memoryStore.employees[empIndex] = {
          ...memoryStore.employees[empIndex],
          ...update
        };
        return { nModified: 1 };
      }
      return { nModified: 0 };
    }
  },

  attendance: {
    find: async (query = {}) => {
      if (isMongoConnected) return await MAttendance.find(query).lean();
      return memoryStore.attendance.filter(att => {
        for (const key in query) {
          if (att[key] !== query[key]) return false;
        }
        return true;
      });
    },
    create: async (data) => {
      if (isMongoConnected) return (await MAttendance.create(data)).toObject();
      const newAtt = { ...data, _id: "ID_" + Math.random().toString(36).substring(2, 9) };
      memoryStore.attendance.push(newAtt);
      return newAtt;
    },
    updateOne: async (query, update) => {
      if (isMongoConnected) return await MAttendance.updateOne(query, update);
      const idx = memoryStore.attendance.findIndex(att => {
        for (const key in query) {
          if (att[key] !== query[key]) return false;
        }
        return true;
      });
      if (idx !== -1) {
        memoryStore.attendance[idx] = { ...memoryStore.attendance[idx], ...update };
        return { nModified: 1 };
      }
      return { nModified: 0 };
    },
    deleteOne: async (query) => {
      if (isMongoConnected) return await MAttendance.deleteOne(query);
      const idx = memoryStore.attendance.findIndex(att => {
        for (const key in query) {
          if (att[key] !== query[key]) return false;
        }
        return true;
      });
      if (idx !== -1) {
        memoryStore.attendance.splice(idx, 1);
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    }
  },

  leaves: {
    find: async (query = {}) => {
      if (isMongoConnected) return await MLeave.find(query).lean();
      return memoryStore.leaves.filter(lv => {
        for (const key in query) {
          if (lv[key] !== query[key]) return false;
        }
        return true;
      });
    },
    create: async (data) => {
      if (isMongoConnected) return (await MLeave.create(data)).toObject();
      const newLv = { ...data, _id: "ID_" + Math.random().toString(36).substring(2, 9) };
      memoryStore.leaves.push(newLv);
      return newLv;
    },
    updateOne: async (query, update) => {
      if (isMongoConnected) return await MLeave.updateOne(query, update);
      const idx = memoryStore.leaves.findIndex(lv => {
        for (const key in query) {
          if (lv[key] !== query[key]) return false;
        }
        return true;
      });
      if (idx !== -1) {
        memoryStore.leaves[idx] = { ...memoryStore.leaves[idx], ...update };
        return { nModified: 1 };
      }
      return { nModified: 0 };
    }
  },

  wfhRequests: {
    find: async (query = {}) => {
      if (isMongoConnected) return await MWFHRequest.find(query).lean();
      return memoryStore.wfhRequests.filter(w => {
        for (const key in query) {
          if (w[key] !== query[key]) return false;
        }
        return true;
      });
    },
    create: async (data) => {
      if (isMongoConnected) return (await MWFHRequest.create(data)).toObject();
      const newW = { ...data, _id: "ID_" + Math.random().toString(36).substring(2, 9) };
      memoryStore.wfhRequests.push(newW);
      return newW;
    },
    updateOne: async (query, update) => {
      if (isMongoConnected) return await MWFHRequest.updateOne(query, update);
      const idx = memoryStore.wfhRequests.findIndex(w => {
        for (const key in query) {
          if (w[key] !== query[key]) return false;
        }
        return true;
      });
      if (idx !== -1) {
        memoryStore.wfhRequests[idx] = { ...memoryStore.wfhRequests[idx], ...update };
        return { nModified: 1 };
      }
      return { nModified: 0 };
    }
  },

  otRequests: {
    find: async (query = {}) => {
      if (isMongoConnected) return await MOTRequest.find(query).lean();
      return memoryStore.otRequests.filter(ot => {
        for (const key in query) {
          if (ot[key] !== query[key]) return false;
        }
        return true;
      });
    },
    create: async (data) => {
      if (isMongoConnected) return (await MOTRequest.create(data)).toObject();
      const newOt = { ...data, _id: "ID_" + Math.random().toString(36).substring(2, 9) };
      memoryStore.otRequests.push(newOt);
      return newOt;
    },
    updateOne: async (query, update) => {
      if (isMongoConnected) return await MOTRequest.updateOne(query, update);
      const idx = memoryStore.otRequests.findIndex(ot => {
        for (const key in query) {
          if (ot[key] !== query[key]) return false;
        }
        return true;
      });
      if (idx !== -1) {
        memoryStore.otRequests[idx] = { ...memoryStore.otRequests[idx], ...update };
        return { nModified: 1 };
      }
      return { nModified: 0 };
    }
  },

  performanceReviews: {
    find: async (query = {}) => {
      if (isMongoConnected) return await MPerformanceReview.find(query).lean();
      return memoryStore.performanceReviews.filter(rev => {
        for (const key in query) {
          if (rev[key] !== query[key]) return false;
        }
        return true;
      });
    },
    create: async (data) => {
      if (isMongoConnected) return (await MPerformanceReview.create(data)).toObject();
      const newRev = { ...data, _id: "ID_" + Math.random().toString(36).substring(2, 9) };
      memoryStore.performanceReviews.push(newRev);
      return newRev;
    },
    updateOne: async (query, update) => {
      if (isMongoConnected) return await MPerformanceReview.updateOne(query, update);
      const idx = memoryStore.performanceReviews.findIndex(rev => {
        for (const key in query) {
          if (rev[key] !== query[key]) return false;
        }
        return true;
      });
      if (idx !== -1) {
        memoryStore.performanceReviews[idx] = { ...memoryStore.performanceReviews[idx], ...update };
        return { nModified: 1 };
      }
      return { nModified: 0 };
    }
  },

  applications: {
    find: async (query = {}) => {
      if (isMongoConnected) return await MApplication.find(query).lean();
      return memoryStore.applications.filter(app => {
        for (const key in query) {
          if (app[key] !== query[key]) return false;
        }
        return true;
      });
    },
    create: async (data) => {
      if (isMongoConnected) return (await MApplication.create(data)).toObject();
      const newApp = { ...data, _id: "ID_" + Math.random().toString(36).substring(2, 9) };
      memoryStore.applications.push(newApp);
      return newApp;
    }
  },

  interviews: {
    find: async (query = {}) => {
      if (isMongoConnected) return await MInterview.find(query).lean();
      return memoryStore.interviews.filter(it => {
        for (const key in query) {
          if (it[key] !== query[key]) return false;
        }
        return true;
      });
    },
    create: async (data) => {
      if (isMongoConnected) return (await MInterview.create(data)).toObject();
      const newIt = { ...data, _id: "ID_" + Math.random().toString(36).substring(2, 9) };
      memoryStore.interviews.push(newIt);
      return newIt;
    },
    updateOne: async (query, update) => {
      if (isMongoConnected) return await MInterview.updateOne(query, update);
      const idx = memoryStore.interviews.findIndex(it => {
        for (const key in query) {
          if (it[key] !== query[key]) return false;
        }
        return true;
      });
      if (idx !== -1) {
        memoryStore.interviews[idx] = { ...memoryStore.interviews[idx], ...update };
        return { nModified: 1 };
      }
      return { nModified: 0 };
    }
  },

  documents: {
    find: async (query = {}) => {
      if (isMongoConnected) return await MDocument.find(query).lean();
      return memoryStore.documents.filter(doc => {
        for (const key in query) {
          if (doc[key] !== query[key]) return false;
        }
        return true;
      });
    },
    create: async (data) => {
      if (isMongoConnected) return (await MDocument.create(data)).toObject();
      const newDoc = { ...data, _id: "ID_" + Math.random().toString(36).substring(2, 9) };
      memoryStore.documents.push(newDoc);
      return newDoc;
    },
    deleteOne: async (query) => {
      if (isMongoConnected) return await MDocument.deleteOne(query);
      const idx = memoryStore.documents.findIndex(doc => {
        for (const key in query) {
          if (doc[key] !== query[key]) return false;
        }
        return true;
      });
      if (idx !== -1) {
        memoryStore.documents.splice(idx, 1);
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    }
  },

  holidays: {
    find: async (query = {}) => {
      if (isMongoConnected) return await MHoliday.find(query).lean();
      return memoryStore.holidays;
    }
  },

  policies: {
    find: async (query = {}) => {
      if (isMongoConnected) return await MPolicy.find(query).lean();
      return memoryStore.policies;
    }
  },

  notifications: {
    find: async (query = {}) => {
      if (isMongoConnected) return await MNotification.find(query).lean();
      return memoryStore.notifications.filter(notif => {
        if (query.employeeId) {
          return notif.employeeId === query.employeeId || notif.employeeId === '*';
        }
        return true;
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    create: async (data) => {
      if (isMongoConnected) return (await MNotification.create(data)).toObject();
      const newNotif = { ...data, _id: "ID_" + Math.random().toString(36).substring(2, 9) };
      memoryStore.notifications.unshift(newNotif);
      return newNotif;
    },
    updateOne: async (query, update) => {
      if (isMongoConnected) return await MNotification.updateOne(query, update);
      const idx = memoryStore.notifications.findIndex(n => {
        for (const key in query) {
          if (n[key] !== query[key]) return false;
        }
        return true;
      });
      if (idx !== -1) {
        memoryStore.notifications[idx] = { ...memoryStore.notifications[idx], ...update };
        return { nModified: 1 };
      }
      return { nModified: 0 };
    }
  }
};
