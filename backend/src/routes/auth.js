const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { runQuery, getDB } = require('../db/init');

const JWT_SECRET = process.env.JWT_SECRET || 'smok-shop-jwt-secret-2024';
const JWT_EXPIRY = 86400; // 24 hours

function signJWT(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyJWT(token) {
  try {
    const [header, body, signature] = token.split('.');
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expected) return null;
    return JSON.parse(Buffer.from(body, 'base64url').toString());
  } catch {
    return null;
  }
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Middleware: verify JWT token
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = auth.slice(7);
  const payload = verifyJWT(token);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Verify user still exists and is active
  const users = runQuery("SELECT id, is_active FROM admin_users WHERE username = ?", [payload.username]);
  if (users.length === 0 || users[0].is_active !== 1) {
    return res.status(401).json({ error: 'User not found or inactive' });
  }

  req.user = payload;
  next();
}

// Middleware: require admin role
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const passwordHash = hashPassword(password);
    const users = runQuery("SELECT id, username, password_hash, role, is_active FROM admin_users WHERE username = ?", [username]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    if (user.is_active !== 1) {
      return res.status(401).json({ error: 'Account is disabled' });
    }

    if (user.password_hash !== passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signJWT({
      sub: user.id,
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY,
    });

    res.json({ token, username: user.username, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ username: req.user.username, role: req.user.role });
});

router.put('/password', authMiddleware, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const username = req.user.username;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    const users = runQuery("SELECT password_hash FROM admin_users WHERE username = ?", [username]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (users[0].password_hash !== hashPassword(currentPassword)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters' });
    }

    const db = getDB();
    db.run("UPDATE admin_users SET password_hash = ?, updated_at = datetime('now') WHERE username = ?",
      [hashPassword(newPassword), username]);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = { router, authMiddleware, adminOnly };