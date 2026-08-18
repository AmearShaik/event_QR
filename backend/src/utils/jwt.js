const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'graduation_day_2026_super_secret_jwt_key_998877';

function signToken(payload, expiresIn = '24h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function verifyJwtToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { signToken, verifyJwtToken };
