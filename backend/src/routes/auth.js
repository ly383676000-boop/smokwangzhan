const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { runQuery } = require('../db/init');

const JWT_SECRET = process.env.JWT_SECRET || 'smok-shop-jwt-secret-2024';
const JWT_EXPIRY = 86400;

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

function getAdminCredentials() {
  try {
    const result = runQuery("SELECT value FROM settings WHERE key = 'admin_password'");
    return result.length > 0 ? result[0].value : 'smok2024';
  } catch {
    return 'smok2024';
  }
}

function updateAdminPassword(newPassword) {
  try {
    const { getDB } = require('../db/init');
    const db = getDB();
    db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('admin_password', ?)", [newPassword]);
    return true;
  } catch {
    return false;
  }
}

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const adminPassword = getAdminCredentials();

    if (username !== 'admin' || password !== adminPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signJWT({
      sub: 'admin',
      username: 'admin',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY,
    });

    res.json({ token, username: 'admin', role: 'admin' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', (req, res) => {
  try {
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

    res.json({ username: payload.username, role: payload.role });
  } catch (err) {
    console.error('Token verify error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/password', (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = auth.slice(7);
    const payload = verifyJWT(token);

    if (!payload || payload.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    const adminPassword = getAdminCredentials();

    if (currentPassword !== adminPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters' });
    }

    const success = updateAdminPassword(newPassword);

    if (!success) {
      return res.status(500).json({ error: 'Failed to update password' });
    }

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;