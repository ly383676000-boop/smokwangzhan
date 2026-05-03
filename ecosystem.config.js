// PM2 进程管理配置
// 用法: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    // ─── 后端 API 服务 (端口 3001) ───
    {
      name: 'smoke-backend',
      cwd: '/var/www/smokeshop/backend',
      script: 'src/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        UPLOAD_DIR: '/var/www/smokeshop/backend/uploads',
      },
    },
    // ─── 网关服务 (端口 3000，前端+API代理) ───
    {
      name: 'smoke-gateway',
      cwd: '/var/www/smokeshop',
      script: 'gateway.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        UPLOAD_DIR: '/var/www/smokeshop/backend/uploads',
      },
    },
  ],
};
