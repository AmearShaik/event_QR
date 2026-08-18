"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
async function main() {
    const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin@graduation.edu';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@2026Password!';
    const name = process.env.DEFAULT_ADMIN_NAME || 'Graduation Admin';
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const admin = await prisma.user.upsert({
        where: { username: username.toLowerCase() },
        update: {
            passwordHash,
            name,
            role: 'ADMIN',
        },
        create: {
            username: username.toLowerCase(),
            passwordHash,
            name,
            role: 'ADMIN',
        },
    });
    console.log('---------------------------------------------------');
    console.log(`[Seed Admin] Initial Administrator Account Created/Updated:`);
    console.log(` Username: ${admin.username}`);
    console.log(` Name:     ${admin.name}`);
    console.log(` Role:     ${admin.role}`);
    console.log('---------------------------------------------------');
}
main()
    .catch((e) => {
    console.error('Error seeding admin account:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
