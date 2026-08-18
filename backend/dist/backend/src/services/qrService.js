"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class QrService {
    /**
     * Generates a cryptographically secure random token (64 hex characters).
     * Does NOT encode Student ID, Name, Phone, Email, or payment data into the QR.
     */
    static generateSecureToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    /**
     * Retrieves or creates a single active QR token for an eligible candidate & event.
     * If candidate is not eligible, throws an error or returns null.
     */
    static async getOrCreateActiveToken(candidateId, eventId) {
        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId },
        });
        if (!candidate || !candidate.eligibilityStatus || candidate.normalizedPaymentStatus !== 'PAID') {
            throw new Error('Candidate is not eligible for QR generation');
        }
        // Check if an active token already exists for candidate + event
        const existingToken = await prisma.qrToken.findFirst({
            where: {
                candidateId,
                eventId,
                isActive: true,
            },
        });
        if (existingToken) {
            return existingToken.token;
        }
        // Deactivate any old tokens for this candidate/event to ensure exactly ONE active token
        await prisma.qrToken.updateMany({
            where: { candidateId, eventId },
            data: { isActive: false },
        });
        // Create new secure token
        const tokenStr = this.generateSecureToken();
        const newToken = await prisma.qrToken.create({
            data: {
                candidateId,
                eventId,
                token: tokenStr,
                isActive: true,
            },
        });
        return newToken.token;
    }
}
exports.QrService = QrService;
