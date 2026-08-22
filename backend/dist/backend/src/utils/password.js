"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordUtils = void 0;
const crypto_1 = __importDefault(require("crypto"));
class PasswordUtils {
    /**
     * Hashes password using Node.js built-in PBKDF2 SHA-512 with 10,000 iterations.
     */
    static hashPassword(password) {
        const salt = crypto_1.default.randomBytes(16).toString('hex');
        const hash = crypto_1.default.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return `${salt}:${hash}`;
    }
    /**
     * Verifies password against stored hash (supports PBKDF2, direct compare, and legacy formats).
     */
    static verifyPassword(password, storedHash) {
        if (!storedHash) {
            return false;
        }
        // 1. Check direct match (fallback)
        if (storedHash === password) {
            return true;
        }
        // 2. Check PBKDF2 format (salt:hash)
        if (storedHash.includes(':')) {
            const [salt, originalHash] = storedHash.split(':');
            if (!salt || !originalHash)
                return false;
            const hash = crypto_1.default.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
            return hash === originalHash;
        }
        return false;
    }
}
exports.PasswordUtils = PasswordUtils;
