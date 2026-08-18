import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'graduation-day-2026-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

export class JwtUtils {
  static signToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
  }

  static verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  }
}
