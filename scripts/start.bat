@echo off
chcp 65001 >nul
title 学生信息管理系统 - 一键启动
echo ============================================
echo   学生信息管理系统 一键启动
echo ============================================
echo.

set ROOT=%~dp0..

REM ---------- 启动后端 ----------
echo [1/3] 启动后端服务 (端口 3000) ...
cd /d "%ROOT%\backend"
if not exist node_modules (
    echo    首次运行，正在安装后端依赖，请稍候...
    call npm install --no-audit --no-fund >nul 2>&1
)
start "学生信息管理系统-后端" cmd /k "cd /d %ROOT%\backend && node server.js"

REM 等待后端就绪
timeout /t 3 /nobreak >nul

REM ---------- 启动前端 ----------
echo [2/3] 启动前端服务 (端口 5173) ...
cd /d "%ROOT%\frontend"
if not exist node_modules (
    echo    首次运行，正在安装前端依赖，请稍候...
    call npm install --no-audit --no-fund >nul 2>&1
)
start "学生信息管理系统-前端" cmd /k "cd /d %ROOT%\frontend && npm run dev"

REM ---------- 打开浏览器 ----------
echo [3/3] 正在打开浏览器...
timeout /t 4 /nobreak >nul
start http://localhost:5173

echo.
echo 系统已启动：
echo   前端页面: http://localhost:5173
echo   演示账号: admin / 123456 （管理员）
echo            teacher1 / 123456 （教师）
echo            student1 / 123456 （学生）
echo.
echo 关闭两个命令行窗口即可停止系统。
pause
