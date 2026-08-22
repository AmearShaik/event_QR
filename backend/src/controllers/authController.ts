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

      const inputUsername = username.trim().toLowerCase();
      const inputPassword = password.trim();

      const defaultAdminUser = (process.env.DEFAULT_ADMIN_USERNAME || 'admin@graduation.edu').trim().toLowerCase();
      const defaultAdminPass = process.env.DEFAULT_ADMIN_PASSWORD || 'admin@2026';

      // 1. Bulletproof master admin check
      if (
        (inputUsername === defaultAdminUser || inputUsername === 'admin' || inputUsername === 'admin@graduation.edu') &&
        inputPassword === defaultAdminPass
      ) {
        let adminUser = await prisma.user.findFirst({
          where: {
            OR: [
              { username: 'admin@graduation.edu' },
              { username: 'admin' },
            ],
          },
        });

        if (!adminUser) {
          const passwordHash = PasswordUtils.hashPassword(defaultAdminPass);
          adminUser = await prisma.user.upsert({
            where: { username: 'admin@graduation.edu' },
            update: { passwordHash, role: 'ADMIN', name: 'Graduation Admin' },
            create: { username: 'admin@graduation.edu', passwordHash, role: 'ADMIN', name: 'Graduation Admin' },
          });
        }

        const token = JwtUtils.signToken({
          userId: adminUser.id,
          username: adminUser.username,
          role: adminUser.role,
        });

        return res.json({
          message: 'Login successful.',
          token,
          user: {
            id: adminUser.id,
            username: adminUser.username,
            name: adminUser.name,
            role: adminUser.role,
          },
        });
      }

      // 2. Standard user lookup
      let user = await prisma.user.findUnique({
        where: { username: inputUsername },
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      // Verify password
      const isMatch = PasswordUtils.verifyPassword(inputPassword, user.passwordHash);
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
      console.error('[Admin Login Error]', err);
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
