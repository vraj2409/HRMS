# OriginEdge HRMS

OriginEdge HRMS is a full-stack Human Resource Management System built with React, TypeScript, Vite, Express, and MongoDB-compatible data storage. It provides a polished HR portal for employee management, attendance, leave approvals, performance reviews, interviews, documents, holidays, policies, and notifications.

## Overview

This project combines a modern frontend experience with a lightweight backend API so you can explore HR workflows in a single app. The UI is organized into employee and HR views with role-based access patterns, and the backend supports both a real MongoDB connection and an in-memory fallback for local demos.

## Key Features

- Employee and HR portal experience
- Secure authentication with JWT-based session handling
- Attendance tracking with clock in/clock out actions
- Leave, WFH, and overtime request workflows
- Performance review management
- Recruitment tracking with job applications and interviews
- Document management with upload and delete support
- Holidays, policies, and notifications views
- Demo-ready preset accounts for quick testing

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind-inspired UI components
- Backend: Node.js, Express
- Database: MongoDB via Mongoose, with in-memory fallback support
- Storage: AWS S3 integration for document uploads (optional)

## Project Structure

- frontend UI: src/
- backend services and routes: backend/
- database and model setup: backend/config/db.js
- API endpoints: backend/routes/ and backend/controllers/

## Prerequisites

Make sure you have the following installed:

- Node.js 18 or newer
- npm or pnpm

## Installation

1. Clone the repository and move into the project folder.
2. Install dependencies:

```bash
npm install
```

## Environment Variables

Create a .env file in the project root if you want to connect to real services.

Example:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/hrms
JWT_SECRET=your-secret-key
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

Notes:
- If MONGODB_URI is not provided, the app will run with its built-in fallback data store.
- Document upload features require AWS S3 credentials.

## Running the App

Start the development server:

```bash
npm run dev
```

The app will be available at:

- http://localhost:3000

## Production Build

Build the frontend bundle:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Notes

- The backend is configured to serve the frontend during development.
- The application is designed for demo and internal HR workflow exploration, not as a production-grade enterprise deployment out of the box.
