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
   * Verifies password against stored salt:hash format.
   */
  static verifyPassword(password: string, storedHash: string): boolean {
    if (!storedHash || !storedHash.includes(':')) {
      return false;
    }
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === originalHash;
  }
}
