// ============================================================
// VisionHR — Express Application Bootstrapper
// ============================================================

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

// Route Modules
import authRoutes from './routes/auth.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import leaveRoutes from './routes/leave.routes.js';
import payrollRoutes from './routes/payroll.routes.js';
import departmentRoutes from './routes/department.routes.js';

// ============================================================
// Database Connection
// ============================================================
connectDB();

// ============================================================
// Express App Initialization
// ============================================================
const app = express();

// ============================================================
// Security & Global Middleware
// ============================================================

// Helmet: Sets secure HTTP headers (XSS, clickjacking, MIME sniffing protection)
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

// CORS: Strictly whitelist only the frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true, // Allow cookies to be sent cross-origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request Body Parsers
app.use(express.json({ limit: '1mb' }));          // JSON payload limit
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cookie Parser (for JWT refresh token cookies)
app.use(cookieParser());

// HTTP Request Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================================
// API Health Check
// ============================================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'VisionHR API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ============================================================
// API Routes — Mounted under /api/v1
// ============================================================
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/employees`, employeeRoutes);
app.use(`${API_PREFIX}/attendance`, attendanceRoutes);
app.use(`${API_PREFIX}/leaves`, leaveRoutes);
app.use(`${API_PREFIX}/payroll`, payrollRoutes);
app.use(`${API_PREFIX}/departments`, departmentRoutes);

// ============================================================
// 404 Handler — Unmatched Routes
// ============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: [${req.method}] ${req.originalUrl}`,
  });
});

// ============================================================
// Centralized Error Handler (must be last middleware)
// ============================================================
app.use(errorHandler);

// ============================================================
// Server Startup
// ============================================================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('       VisionHR API Server');
  console.log('========================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api/v1`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log('========================================\n');
});

// ============================================================
// Graceful Shutdown Handlers
// ============================================================
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('✅ HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => process.exit(1));
});

export default app;
