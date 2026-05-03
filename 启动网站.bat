@echo off
chcp 65001 >nul
title 烟具电商网站 - 一键启动

echo ========================================
echo   全球烟具电商网站 - 启动中...
echo ========================================
echo.

:: 启动后端
echo [1/3] 启动后端服务 (端口 3001)...
start "后端API" /min cmd /c "cd /d %~dp0backend && node src/index.js"
timeout /t 3 /nobreak >nul

:: 启动网关（前端+API代理）
echo [2/3] 启动网关服务 (端口 3000)...
start "网关" /min cmd /c "cd /d %~dp0 && node gateway.js"
timeout /t 3 /nobreak >nul

:: 启动内网穿透
echo [3/3] 启动 Cloudflare 隧道...
echo.
echo ========================================
echo   等待公网地址生成...
echo   地址会显示在下方窗口中
echo   格式: https://xxx.trycloudflare.com
echo ========================================
echo.
start "公网隧道" cmd /c "cloudflared tunnel --url http://localhost:3000"

echo.
echo 本地访问: http://localhost:3000
echo 公网地址: 查看"公网隧道"窗口
echo.
echo 关闭此窗口不会影响服务运行
echo 要停止所有服务，运行: 关闭网站.bat
echo.
pause
