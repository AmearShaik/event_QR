const { PrismaClient } = require('@prisma/client');
const { verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

const prisma = new PrismaClient();

async function loginAdmin(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { username: username.trim().toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const isMatch = verifyPassword(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    });

    return res.json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
}

async function getMe(req, res) {
  try {
    const user = req.user;
    return res.json({
      user: {
        id: user.userId,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { loginAdmin, getMe };
