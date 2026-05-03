/**
 * Admin authentication API for Vercel Serverless.
 * - POST /api/auth/login  → login, returns JWT token
 * - GET  /api/auth/me     → verify token, returns admin info
 *
 * Default credentials (change ADMIN_PASSWORD env var in Vercel):
 *   username: admin
 *   password: smok2024
 */

const crypto = require('crypto');

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'smok2024';
const JWT_SECRET = process.env.JWT_SECRET || 'smok-shop-jwt-secret-2024';

function json(res, code, data) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(JSON.stringify(data));
}

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

function getBody(req) {
  return new Promise((resolve, reject) => {
    let d = '';
    req.on('data', c => d += c);
    req.on('end', () => { try { resolve(d ? JSON.parse(d) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

function getToken(req) {
  const auth = (req.headers.authorization || '');
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 200, {});

  try {
    // POST /api/auth/login
    if (req.method === 'POST') {
      const body = await getBody(req);
      const { username, password } = body;

      if (!username || !password) {
        return json(res, 400, { error: 'Username and password required' });
      }

      if (username !== ADMIN_USER || password !== ADMIN_PASS) {
        return json(res, 401, { error: 'Invalid credentials' });
      }

      const token = signJWT({
        sub: 'admin',
        username: ADMIN_USER,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
      });

      return json(res, 200, { token, username: ADMIN_USER, role: 'admin' });
    }

    // GET /api/auth/me
    if (req.method === 'GET') {
      const token = getToken(req);
      if (!token) return json(res, 401, { error: 'No token provided' });

      const payload = verifyJWT(token);
      if (!payload || payload.exp < Math.floor(Date.now() / 1000)) {
        return json(res, 401, { error: 'Token expired or invalid' });
      }

      return json(res, 200, { username: payload.username, role: payload.role });
    }

    return json(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    return json(res, 500, { error: err.message });
  }
};
