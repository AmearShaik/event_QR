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
            const inputUsername = username.trim().toLowerCase();
            const inputPassword = password.trim();
            // Look up user by exact username or alias
            let user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { username: inputUsername },
                        { username: inputUsername === 'admin' ? 'admin@graduation.edu' : inputUsername },
                    ],
                },
            });
            const defaultAdminUser = (process.env.DEFAULT_ADMIN_USERNAME || 'admin@graduation.edu').trim().toLowerCase();
            const defaultAdminPass = process.env.DEFAULT_ADMIN_PASSWORD || 'admin@2026';
            // If user not in DB yet, but matches default admin credentials, auto-create
            if (!user) {
                if ((inputUsername === defaultAdminUser || inputUsername === 'admin') &&
                    inputPassword === defaultAdminPass) {
                    const passwordHash = password_1.PasswordUtils.hashPassword(defaultAdminPass);
                    user = await prisma.user.upsert({
                        where: { username: defaultAdminUser },
                        update: { passwordHash, role: 'ADMIN', name: 'Graduation Admin' },
                        create: { username: defaultAdminUser, passwordHash, role: 'ADMIN', name: 'Graduation Admin' },
                    });
                }
                else {
                    return res.status(401).json({ error: 'Invalid username or password.' });
                }
            }
            // Verify password
            let isMatch = password_1.PasswordUtils.verifyPassword(inputPassword, user.passwordHash);
            // Check fallback to default credentials
            if (!isMatch && (inputUsername === defaultAdminUser || inputUsername === 'admin') && inputPassword === defaultAdminPass) {
                isMatch = true;
                // Update hash in background
                const newHash = password_1.PasswordUtils.hashPassword(defaultAdminPass);
                await prisma.user.update({
                    where: { id: user.id },
                    data: { passwordHash: newHash },
                }).catch(() => { });
            }
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
            console.error('[Admin Login Error]', err);
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
