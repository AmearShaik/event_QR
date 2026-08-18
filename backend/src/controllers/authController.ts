import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PasswordUtils } from '../utils/password';
import { JwtUtils } from '../utils/jwt';

const prisma = new PrismaClient();

export class AuthController {
  static async login(req: Request, res: Response) {
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

      const isMatch = PasswordUtils.verifyPassword(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

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
