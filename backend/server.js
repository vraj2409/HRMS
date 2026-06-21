import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

import { getHolidays, getPolicies } from './controllers/attendanceController.js';
import { authenticateToken } from './middlewares/authMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  await connectDB();

  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api', requestRoutes);
  app.use('/api/performance-reviews', performanceRoutes);
  app.use('/api', interviewRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Miscellaneous/Constants
  app.get('/api/holidays', authenticateToken, getHolidays);
  app.get('/api/policies', authenticateToken, getPolicies);

  // Serve Frontend
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
