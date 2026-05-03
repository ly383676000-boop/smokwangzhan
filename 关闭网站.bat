@echo off
chcp 65001 >nul
title 烟具电商网站 - 关闭所有服务

echo 正在关闭所有服务...
taskkill /fi "WINDOWTITLE eq 后端API*" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq 网关*" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq 公网隧道*" /f >nul 2>&1
taskkill /im cloudflared.exe /f >nul 2>&1

echo.
echo 所有服务已关闭。
pause
