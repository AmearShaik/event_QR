import crypto from 'crypto';

export class PasswordUtils {
  /**
   * Hashes password using Node.js built-in PBKDF2 SHA-512 with 10,000 iterations.
   */
  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Verifies password against stored hash (supports PBKDF2, direct compare, and legacy formats).
   */
  static verifyPassword(password: string, storedHash: string): boolean {
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
      if (!salt || !originalHash) return false;
      const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      return hash === originalHash;
    }

    return false;
  }
}
