const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { runQuery, getDB } = require('../db/init');
const { authMiddleware, adminOnly } = require('./auth');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminOnly);

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Get all users
router.get('/', (req, res) => {
  try {
    const users = runQuery(
      "SELECT id, username, role, is_active, created_at, updated_at FROM admin_users ORDER BY created_at DESC"
    );
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Create new user
router.post('/', (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    if (!['admin', 'editor'].includes(role)) {
      return res.status(400).json({ error: 'Role must be admin or editor' });
    }

    // Check if username exists
    const existing = runQuery("SELECT id FROM admin_users WHERE username = ?", [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const db = getDB();
    const passwordHash = hashPassword(password);
    db.run(
      "INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)",
      [username, passwordHash, role || 'editor']
    );

    const newUser = runQuery(
      "SELECT id, username, role, is_active, created_at FROM admin_users WHERE username = ?",
      [username]
    );

    res.status(201).json(newUser[0]);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;

    // Prevent self-demotion from admin
    if (id === String(req.user.sub) && role && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot demote yourself from admin' });
    }

    // Prevent disabling yourself
    if (id === String(req.user.sub) && is_active === 0) {
      return res.status(400).json({ error: 'Cannot disable your own account' });
    }

    const updates = [];
    const params = [];

    if (role !== undefined) {
      if (!['admin', 'editor'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      updates.push("role = ?");
      params.push(role);
    }

    if (is_active !== undefined) {
      updates.push("is_active = ?");
      params.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push("updated_at = datetime('now')");
    params.push(id);

    const db = getDB();
    db.run(`UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`, params);

    const user = runQuery("SELECT id, username, role, is_active, created_at, updated_at FROM admin_users WHERE id = ?", [id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user[0]);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Reset user password (admin only)
router.put('/:id/password', (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    const db = getDB();
    db.run(
      "UPDATE admin_users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?",
      [hashPassword(newPassword), id]
    );

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Delete user
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === String(req.user.sub)) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const db = getDB();
    const result = db.run("DELETE FROM admin_users WHERE id = ? AND role != 'admin'", [id]);

    // Check if user was actually deleted (db.run doesn't return affected rows easily in sql.js)
    const user = runQuery("SELECT id FROM admin_users WHERE id = ?", [id]);
    if (user.length > 0) {
      return res.status(400).json({ error: 'Cannot delete admin user' });
    }

    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
