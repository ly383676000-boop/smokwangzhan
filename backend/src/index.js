const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB, saveDB } = require('./db/init');
const productsRouter = require('./routes/products');
const variantsRouter = require('./routes/variants');
const ordersRouter = require('./routes/orders');
const uploadRouter = require('./routes/upload');
const settingsRouter = require('./routes/settings');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Static uploads - 部署时通过 UPLOAD_DIR 环境变量指向持久化挂载目录
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/api/products', productsRouter);
app.use('/api/variants', variantsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/auth', authRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Smoke Shop API is running' });
});

// Serve frontend SPA - all non-API requests fallback to index.html
const distPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// 404 handler (API only)
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// ✅ Only start listening AFTER the database is fully initialized
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Database ready. Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to initialize database, server will NOT start:', err);
    process.exit(1);
  });

// Graceful shutdown: save DB before exit
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  saveDB();
  process.exit(0);
});

process.on('SIGTERM', () => {
  saveDB();
  process.exit(0);
});
