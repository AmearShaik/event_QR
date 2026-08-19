"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const candidateRoutes_1 = __importDefault(require("./routes/candidateRoutes"));
const importRoutes_1 = __importDefault(require("./routes/importRoutes"));
const adminCandidatesRoutes_1 = __importDefault(require("./routes/adminCandidatesRoutes"));
const attendanceRoutes_1 = __importDefault(require("./routes/attendanceRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Enable CORS
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
app.use('/api/auth', authRoutes_1.default);
app.use('/api/candidate', candidateRoutes_1.default);
app.use('/api/candidates', candidateRoutes_1.default);
app.use('/api/import', importRoutes_1.default);
app.use('/api/admin/import', importRoutes_1.default);
app.use('/api/admin/candidates', adminCandidatesRoutes_1.default);
app.use('/api/attendance', attendanceRoutes_1.default);
app.use('/api/admin/attendance', attendanceRoutes_1.default);
app.use('/api/events', eventRoutes_1.default);
app.use('/api/admin/events', eventRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/admin/dashboard', dashboardRoutes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[Global Error]', err);
    const status = err.status || 500;
    res.status(status).json({
        error: err.message || 'Internal Server Error',
    });
});
exports.default = app;
