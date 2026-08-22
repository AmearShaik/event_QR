import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PasswordUtils } from '../utils/password';
import { JwtUtils } from '../utils/jwt';

const prisma = new PrismaClient();

export class AuthController {
  static async login(req: Request, res: Response) {
    console.log(`[Admin Login Hit] IP: ${req.ip}, Body:`, req.body);
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        console.log(`[Admin Login Failed] Missing username or password`);
        return res.status(400).json({ error: 'Username and password are required.' });
      }

      const normalizedUsername = username.trim().toLowerCase();
      console.log(`[Admin Login] Searching for user: "${normalizedUsername}"`);

      const user = await prisma.user.findUnique({
        where: { username: normalizedUsername },
      });

      if (!user) {
        console.log(`[Admin Login Failed] User NOT FOUND in database: "${normalizedUsername}"`);
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      console.log(`[Admin Login] User found. Verifying password...`);
      const isMatch = PasswordUtils.verifyPassword(password, user.passwordHash);
      
      if (!isMatch) {
        console.log(`[Admin Login Failed] Password mismatch for user: "${normalizedUsername}"`);
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      console.log(`[Admin Login Success] User authenticated: "${normalizedUsername}"`);
      const token = JwtUtils.signToken({
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
    } catch (err: any) {
      console.error(`[Admin Login Error] Server error:`, err);
      return res.status(500).json({ error: err.message || 'Server error during login.' });
    }
  }

  static async me(req: any, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, username: true, name: true, role: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      return res.json({ user });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Server error.' });
    }
  }

  static async logout(req: Request, res: Response) {
    return res.json({ message: 'Logged out successfully.' });
  }
}
