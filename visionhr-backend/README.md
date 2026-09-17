# VisionHR — Backend API

Enterprise-grade HRMS REST API built on the MERN stack with AWS S3 integration.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js LTS (v20+) |
| Framework | Express.js v4 |
| Database | MongoDB via Mongoose v8 |
| Auth | JWT (Access + Refresh Token rotation) |
| File Storage | AWS S3 via `@aws-sdk/client-s3` |
| Validation | Zod |
| File Upload | Multer (memory storage) |

---

## Project Structure

```
server/
├── src/
│   ├── config/         # DB connection, AWS S3 client
│   ├── constants/      # Roles, enums, HTTP codes, S3 prefixes
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Auth, RBAC, validation, upload, error handler
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express route declarations
│   ├── services/       # S3 service, Payroll computation engine
│   ├── utils/          # Tokens, API response helpers, date helpers, seeder
│   └── server.js       # App bootstrapper
├── .env.example
├── .gitignore
└── package.json
```

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Fill in MONGO_URI, JWT secrets, AWS credentials
```

### 3. Seed the Database (first run only)
```bash
npm run seed
# Creates: 5 default departments + SuperAdmin account
# Default SuperAdmin: admin@visionhr.com / Admin@VisionHR2024
# ⚠️  Change this password immediately after first login!
```

### 4. Start the Server
```bash
npm run dev      # Development (nodemon)
npm start        # Production
```

---

## RBAC Roles

| Role | Permissions |
|---|---|
| `SuperAdmin` | Full access to everything |
| `HR` | Manage employees, approve attendance/leaves, run payroll |
| `Manager` | View & approve direct reports only |
| `Employee` | Self-service: punch in/out, apply leave, view own payslips |

---

## API Reference

**Base URL:** `http://localhost:5000/api/v1`

All authenticated routes require: `Authorization: Bearer <accessToken>`

---

### Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/login` | ❌ | Login → returns `accessToken` + sets `HttpOnly` refresh cookie |
| POST | `/refresh` | cookie | Get new access token using refresh cookie |
| POST | `/logout` | ✅ | Invalidate refresh token + clear cookie |
| GET | `/me` | ✅ | Get authenticated user's full profile |
| PATCH | `/change-password` | ✅ | Change password (invalidates all sessions) |

**Login Request:**
```json
{ "email": "admin@visionhr.com", "password": "Admin@VisionHR2024" }
```

**Login Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "eyJhbGci...",
    "user": { "id": "...", "email": "...", "role": "SuperAdmin", "fullName": "System Administrator" }
  }
}
```

---

### Employees — `/api/v1/employees`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/` | HR, SuperAdmin | Onboard new employee (creates User + Employee records) |
| GET | `/` | HR, SuperAdmin, Manager | Employee directory with pagination & search |
| GET | `/:id` | All | Get employee profile (employees: own only) |
| PATCH | `/:id` | All | Update profile (employees: contact fields only) |
| DELETE | `/:id` | SuperAdmin | Soft-deactivate employee |
| POST | `/:id/documents` | HR, SuperAdmin | Upload document to S3 |
| GET | `/:id/documents/:docId/view` | All | Get 15-min pre-signed URL to view document |
| DELETE | `/:id/documents/:docId` | HR, SuperAdmin | Delete document from S3 + DB |

**Create Employee Request:**
```json
{
  "email": "john.doe@company.com",
  "password": "TempPass@123",
  "role": "Employee",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210",
  "department": "<departmentObjectId>",
  "designation": "Software Engineer",
  "joiningDate": "2024-01-15",
  "basicSalary": 50000,
  "hra": 20000,
  "taxDeduction": 5000,
  "pfDeduction": 1800
}
```

**Query Params for GET /employees:**
- `page`, `limit` — pagination
- `search` — searches firstName, lastName, employeeCode
- `department` — filter by department ObjectId
- `isActive` — `true` | `false`
- `employmentType` — `Full-Time` | `Part-Time` | `Contract` | `Intern`

---

### Attendance — `/api/v1/attendance`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/punch-in` | All | Record punch-in (status: Pending) |
| POST | `/punch-out` | All | Record punch-out, compute total hours |
| GET | `/my` | All | Own attendance history |
| GET | `/pending-approvals` | HR, Manager, SuperAdmin | Queue of pending records |
| GET | `/today-summary` | HR, SuperAdmin | Today's attendance stats |
| GET | `/employee/:employeeId` | HR, Manager, SuperAdmin | Any employee's attendance |
| PATCH | `/:id/review` | HR, Manager, SuperAdmin | Approve or reject a punch |

**Review Request:**
```json
{ "status": "Approved", "remarks": "Verified via office access logs." }
```

**Attendance State Machine:**
```
Punch In → Pending → [Approved | Rejected]
```
Only `Approved` attendance counts toward payable days.

---

### Leaves — `/api/v1/leaves`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/apply` | All | Apply for leave (supports file attachment) |
| GET | `/my` | All | Own leave history + current balances |
| PATCH | `/:id/cancel` | Employee | Cancel own pending leave |
| GET | `/` | HR, Manager, SuperAdmin | All leave requests with filters |
| PATCH | `/:id/action` | HR, Manager, SuperAdmin | Approve/reject leave, auto-deducts balance |

**Apply Leave Request:**
```json
{
  "leaveType": "Sick",
  "startDate": "2024-03-10",
  "endDate": "2024-03-11",
  "reason": "Fever and doctor's appointment",
  "workDelegation": "Handover to Priya for sprint tasks"
}
```

**Leave Types:** `Casual` | `Sick` | `Earned`

**Default Balances:** Casual: 12 | Sick: 8 | Earned: 15 days/year

---

### Payroll — `/api/v1/payroll`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/process` | HR, SuperAdmin | Run monthly payroll for all employees |
| GET | `/` | HR, SuperAdmin | All payroll records with filters |
| GET | `/my` | Employee | Own payslip history |
| GET | `/summary/:month/:year` | HR, SuperAdmin | Aggregate payroll stats |
| GET | `/:id` | HR, SuperAdmin, Employee (own) | Single payroll detail |
| PATCH | `/:id/mark-paid` | HR, SuperAdmin | Mark salary as disbursed |

**Process Payroll Request:**
```json
{ "month": 6, "year": 2024 }
```

**Payroll Formula:**
```
Payable Days     = Approved Attendance Days + Approved Leave Days
Daily Rate       = Basic Salary / Total Working Days (Mon–Fri)
Gross Earnings   = (Daily Rate × Payable Days) + HRA + Other Allowances
Loss of Pay      = Daily Rate × Unpaid Absence Days
Net Salary       = Gross Earnings − Tax − PF − Loss of Pay
```

---

### Departments — `/api/v1/departments`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/` | All | List all active departments |
| POST | `/` | HR, SuperAdmin | Create department |
| PATCH | `/:id` | HR, SuperAdmin | Update department |
| DELETE | `/:id` | SuperAdmin | Deactivate (blocked if employees assigned) |

---

## Standard Response Envelope

All responses follow this shape:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... } | [ ... ] | null,
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 47,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "errors": { "fieldName": "error message" }
}
```

---

## AWS S3 Setup

1. Create a **private** S3 bucket (block all public access)
2. In IAM, create a backend user with this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

3. Generate Access Key + Secret Key and add to `.env`

**S3 Key Structure:**
```
employees/<EMP_CODE>/documents/<uuid>.<ext>
employees/<EMP_CODE>/payslips/<YYYY-MM>/<uuid>.pdf
employees/<EMP_CODE>/avatar/<uuid>.<ext>
```

Documents are never publicly accessible. All viewing is done via **pre-signed URLs** (15-minute expiry).

---

## Security Architecture

- **Passwords:** bcryptjs, salt rounds: 12
- **Access Token:** JWT, 15-minute expiry, sent via `Authorization: Bearer` header
- **Refresh Token:** JWT, 7-day expiry, stored in `HttpOnly; SameSite=Strict` cookie + hashed in DB
- **Token Revocation:** Refresh tokens stored in DB — logout invalidates immediately
- **Headers:** Helmet middleware for XSS, clickjacking, MIME sniffing protection
- **CORS:** Strict origin whitelist (only `CLIENT_ORIGIN`)
- **Input Validation:** Zod schemas on all write endpoints
- **File Uploads:** memoryStorage only — zero disk writes, direct S3 streaming
- **Server-Side Encryption:** All S3 objects use AES256 encryption at rest

---

## Health Check

```
GET /health
```
```json
{
  "status": "healthy",
  "service": "VisionHR API",
  "version": "1.0.0",
  "environment": "development"
}
```
