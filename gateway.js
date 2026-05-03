const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── 上传文件：直接 serve 本地 uploads 目录 ───
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'backend', 'uploads');
app.use('/uploads', express.static(uploadDir));

// ─── 后端 API：代理到 localhost:3001 ───
// 注意：http-proxy-middleware v3 的 app.use('/api', proxy) 会自动剥离 /api 前缀
// 所以必须显式 pathRewrite 把 /api 加回去
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: (path, req) => {
    // v3 自动去掉了 /api 前缀，这里加回去
    return '/api' + path;
  },
}));

// ─── admin.html 单独提供（在 frontend/ 根目录，不在 dist 里）───
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'admin.html'));
});

// ─── 前端静态文件（禁用缓存确保每次拿到最新版本）───
app.use(express.static(path.join(__dirname, 'frontend', 'dist'), {
  setHeaders: (res, filePath) => {
    // HTML 文件永远不缓存
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    // JS/CSS 带 hash 的可以长期缓存，但为安全起见短期缓存
    if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=60');
    }
  },
}));

// SPA fallback（只对非 API、非 uploads 的请求返回 index.html）
app.get('{*path}', (req, res, next) => {
  // Skip API and uploads routes
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 统一网关已启动: http://localhost:${PORT}`);
  console.log(`   前端: http://localhost:${PORT}/`);
  console.log(`   后端: http://localhost:${PORT}/api/health`);
  console.log(`\n   对外暴露此端口即可，/api 路由自动转发到后端 3001\n`);
});
