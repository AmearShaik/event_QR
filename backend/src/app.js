const express = require('express');
const cors = require('cors');

try {
  process.loadEnvFile('.env');
} catch (e) {
  // process.env loaded or fallback
}

const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const importRoutes = require('./routes/importRoutes');
const adminCandidatesRoutes = require('./routes/adminCandidatesRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const eventRoutes = require('./routes/eventRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'Graduation Day 2026 QR Registration & Attendance' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled application error:', err);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

module.exports = app;
