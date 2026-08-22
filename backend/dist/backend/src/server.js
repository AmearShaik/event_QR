"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const client_1 = require("@prisma/client");
const password_1 = require("./utils/password");
const prisma = new client_1.PrismaClient();
async function bootstrapAdmin() {
    try {
        const adminUser = (process.env.DEFAULT_ADMIN_USERNAME || 'admin@graduation.edu').trim().toLowerCase();
        const adminPass = process.env.DEFAULT_ADMIN_PASSWORD || 'admin@2026';
        const passwordHash = password_1.PasswordUtils.hashPassword(adminPass);
        await prisma.user.upsert({
            where: { username: adminUser },
            update: {
                passwordHash,
                role: 'ADMIN',
                name: 'Graduation Admin',
            },
            create: {
                username: adminUser,
                passwordHash,
                role: 'ADMIN',
                name: 'Graduation Admin',
            },
        });
        console.log(`[Bootstrap] Admin account verified: ${adminUser}`);
    }
    catch (err) {
        console.warn('[Bootstrap] Notice during admin initialization:', err.message);
    }
}
const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';
app_1.default.listen(PORT, HOST, async () => {
    console.log(`===================================================`);
    console.log(` Graduation Day 2026 Backend Running on port ${PORT}`);
    console.log(`===================================================`);
    await bootstrapAdmin();
});
exports.default = app_1.default;
