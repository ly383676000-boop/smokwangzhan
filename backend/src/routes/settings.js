const express = require('express');
const router = express.Router();
const { runQuery, getDB } = require('../db/init');
const feishuService = require('../services/feishu');

const ALLOWED_KEYS = [
  'company_name', 'company_name_zh', 'whatsapp', 'email', 'address', 'phone',
  'feishu_app_id', 'feishu_app_secret', 'feishu_chat_id'
];

router.get('/', (req, res) => {
  try {
    const settings = runQuery('SELECT key, value FROM settings');
    const result = {};
    for (const row of settings) {
      result[row.key] = row.value;
    }
    res.json(result);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/', (req, res) => {
  try {
    const db = getDB();
    const updates = req.body;

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Invalid settings data' });
    }

    for (const [key, value] of Object.entries(updates)) {
      if (ALLOWED_KEYS.includes(key)) {
        db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, String(value)]);
      }
    }

    const settings = runQuery('SELECT key, value FROM settings');
    const result = {};
    for (const row of settings) {
      result[row.key] = row.value;
    }

    feishuService.configure(
      result.feishu_app_id || '',
      result.feishu_app_secret || '',
      result.feishu_chat_id || ''
    );

    res.json({ success: true, settings: result });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;