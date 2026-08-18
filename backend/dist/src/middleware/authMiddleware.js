"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminAuth = requireAdminAuth;
const jwt_1 = require("../utils/jwt");
function requireAdminAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        let token;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        if (!token) {
            return res.status(401).json({ error: 'Authentication required. Please log in as Admin.' });
        }
        const decoded = jwt_1.JwtUtils.verifyToken(token);
        if (decoded.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    }
}
