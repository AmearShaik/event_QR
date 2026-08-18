"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const client_1 = require("@prisma/client");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const prisma = new client_1.PrismaClient();
class AuthController {
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required.' });
            }
            const user = await prisma.user.findUnique({
                where: { username: username.trim().toLowerCase() },
            });
            if (!user) {
                return res.status(401).json({ error: 'Invalid username or password.' });
            }
            const isMatch = password_1.PasswordUtils.verifyPassword(password, user.passwordHash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid username or password.' });
            }
            const token = jwt_1.JwtUtils.signToken({
                userId: user.id,
                username: user.username,
                role: user.role,
            });
            return res.json({
                message: 'Login successful.',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    role: user.role,
                },
            });
        }
        catch (err) {
            return res.status(500).json({ error: err.message || 'Server error during login.' });
        }
    }
    static async me(req, res) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user.userId },
                select: { id: true, username: true, name: true, role: true },
            });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            return res.json({ user });
        }
        catch (err) {
            return res.status(500).json({ error: err.message || 'Server error.' });
        }
    }
    static async logout(req, res) {
        return res.json({ message: 'Logged out successfully.' });
    }
}
exports.AuthController = AuthController;
