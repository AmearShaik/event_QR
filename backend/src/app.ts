import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes';
import candidateRoutes from './routes/candidateRoutes';
import importRoutes from './routes/importRoutes';
import adminCandidatesRoutes from './routes/adminCandidatesRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import eventRoutes from './routes/eventRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

dotenv.config();

const app = express();

// Enable CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'Graduation Day 2026 System', timestamp: new Date().toISOString() });
});

// API root - provide a simple index for the API
app.get('/api', (req, res) => {
  res.json({
    status: 'API running',
    message: 'Graduation Day 2026 API',
    endpoints: {
      health: '/api/health',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);

app.use('/api/candidate', candidateRoutes);
app.use('/api/candidates', candidateRoutes);

app.use('/api/import', importRoutes);
app.use('/api/admin/import', importRoutes);

app.use('/api/admin/candidates', adminCandidatesRoutes);

app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin/attendance', attendanceRoutes);

app.use('/api/events', eventRoutes);
app.use('/api/admin/events', eventRoutes);

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Global Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
});

export default app;
