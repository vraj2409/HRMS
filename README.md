# VisionHR 

VisionHR is a modern, full-stack Human Resource Management System (HRMS) designed to automate and secure core HR operations. Built on a scalable MERN-like stack (MongoDB, Express.js, React, Node.js), it provides strict role-based access control, secure document vaults, and an automated payroll engine.

---

## 🏗️ Architecture

VisionHR employs a decoupled, client-server architecture to ensure high performance, security, and maintainability.

### 1. The Client Layer (Frontend)
The frontend is a Single Page Application (SPA) built with React. It uses **React Query** for intelligent server-state caching and synchronization, ensuring the UI is always up-to-date without redundant network requests. Routing is handled by `react-router-dom`, wrapped in protective Higher-Order Components (HOCs) that intercept and block navigation based on the user's decrypted JWT role.

### 2. The API Layer (Backend)
The backend acts as a strict gatekeeper and processing engine. Built on **Express.js**, it follows a clean Model-View-Controller (MVC) pattern. Every endpoint is shielded by a two-tier middleware system:
- **Authentication**: Validates the JWT and prevents unauthorized access.
- **Authorization**: Ensures the validated user holds the specific role (e.g., `HR` or `SuperAdmin`) required to perform the action.

### 3. The Data & Storage Layer
- **Relational Integrity via MongoDB**: Mongoose schemas are heavily populated and interlinked (e.g., Payroll records map directly to Employee profiles and Leave balances). 
- **Ephemeral S3 Storage**: AWS S3 is used for document and payslip storage. Files are entirely segregated by role, and the system **never** exposes public URLs. Instead, the backend generates cryptographic, short-lived (15-minute) pre-signed URLs to stream documents to authorized viewers.

---

## 📂 Folder Structure

The repository is divided into two distinct applications:

### Backend (`/visionhr-backend-fixed`)
```text
visionhr-backend-fixed/
├── src/
│   ├── config/          # Database and AWS S3 configuration
│   ├── constants/       # Global constants (Roles, HTTP Status, S3 Prefixes)
│   ├── controllers/     # Core business logic (Auth, Employee, Leave, Payroll)
│   ├── middleware/      # JWT Validation, RBAC Auth, Error Handling, File Uploads (Multer)
│   ├── models/          # Mongoose Schemas (User, Employee, Leave, Payroll, Department)
│   ├── routes/          # Express route definitions
│   ├── services/        # Third-party integrations (S3 Service, PDFKit Generator, Payroll Math Engine)
│   ├── utils/           # Helper functions (API Response formatters, Pagination)
│   ├── seeder.js        # Database population script
│   └── server.js        # Express application entry point
├── .env                 # Environment variables
└── package.json
```

### Frontend (`/visionhr-frontend`)
```text
visionhr-frontend/
├── src/
│   ├── api/             # Axios instance setup, request/response interceptors
│   ├── components/      # Reusable UI components (Buttons, Modals, Spinners, Tables)
│   ├── features/        # API service layers categorized by domain (authApi, payrollApi, etc.)
│   ├── layouts/         # Layout wrappers (Sidebar, Top Navigation, Auth Layout)
│   ├── pages/           # High-level route views (Dashboard, LeaveApplyPage, PayrollManagementPage)
│   ├── store/           # Redux slices for global client state (Auth context)
│   ├── utils/           # Date formatters, utility functions
│   ├── App.jsx          # Root component and Router configuration
│   └── index.css        # Tailwind directives and global styles
├── .env                 # Environment variables
├── tailwind.config.js   # Tailwind configuration and custom theme variables
└── vite.config.js       # Vite bundler configuration
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js 18
- **Bundler**: Vite
- **State Management**: React Query (Server State), Redux Toolkit (Client State)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose ORM
- **Authentication**: JSON Web Tokens (JWT) & bcrypt (Password hashing)
- **File Parsing**: Multer (In-memory multipart/form-data parsing)
- **Cloud Storage**: AWS SDK v3 (S3)
- **Document Generation**: PDFKit

---

## ⚙️ How It Works (Core Workflows)

### 1. Document Vault (S3 Integration)
When an employee or HR uploads a file (e.g., ID Proof):
1. The React frontend sends the file to the Express backend via `multipart/form-data`.
2. Multer holds the file in RAM (no disk writing).
3. The backend calculates a secure S3 path based on the user's role (e.g., `Employee/EMP-123/docs/id.pdf`).
4. The AWS SDK streams the buffer directly to S3 with AES256 server-side encryption.
5. S3 returns success, and the backend saves the `S3 Key` into the Employee's MongoDB document.
6. **Viewing**: When a user clicks "View", the backend uses its IAM credentials to generate a 15-minute Pre-Signed URL for that specific S3 Key, ensuring absolute security.

### 2. Automated Payroll Processing
When an HR Manager initiates payroll at the end of the month:
1. The backend verifies the HR's `departmentId` to ensure they are authorized to process this specific employee.
2. The **Payroll Engine** queries the employee's `basicSalary` and `hra`.
3. It checks the **Leave System** for any Unapproved Absences in the target month. It mathematically computes "Loss of Pay" based on `(Gross / Total Days) * Absent Days`.
4. The final Net Payable is calculated.
5. **PDF Generation**: `pdfkit` draws a highly formatted Payslip PDF directly into a Node.js memory buffer.
6. The buffer is injected into the secure `HR/EMP-123/payroll/` S3 folder.
7. Employees can securely download this PDF from their dashboard via dynamically generated Pre-Signed URLs.

### 3. Leave & Attendance Loop
1. Employees possess a ledger of Leave Balances (Casual, Sick, Earned).
2. When applying for leave, a `Pending` record is created, and the requested days are temporarily deducted from their balance.
3. If an employee applies for a leave that exceeds their remaining balance, the system permits it but flags the excess days as `Loss of Pay`.
4. When HR runs payroll at month-end, the Payroll Engine automatically detects these `Loss of Pay` days and deducts from the final salary payout.

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Cluster
- AWS S3 Bucket with IAM credentials

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd visionhr-backend-fixed
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env` file with your MongoDB URI, JWT secrets, and AWS Credentials.
4. Run the database seeder to populate default roles and departments (Warning: Wipes existing data):
   ```bash
   node src/seeder.js
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd visionhr-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
