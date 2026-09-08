@echo off
chcp 65001 >nul
title 学生信息管理系统 - 上传到 GitHub
echo ============================================
echo   上传项目到 GitHub 开源仓库（任务2）
echo ============================================
echo.
echo 请提前完成：
echo   1. 注册 GitHub 账号并登录 https://github.com
echo   2. 点击右上角 "+" → New repository，创建一个【Public 公开】仓库
echo      仓库名建议: student-management-system（不要勾选任何初始化文件）
echo.
set /p URL=请输入你的仓库 https 地址（形如 https://github.com/用户名/student-management-system.git）:

if "%URL%"=="" (
    echo 仓库地址不能为空，请重新运行本脚本。
    pause
    exit /b
)

set ROOT=%~dp0..
cd /d "%ROOT%"

echo.
echo [1/4] 初始化 git 仓库 ...
git init >nul 2>&1

echo [2/4] 添加全部文件 ...
git add .

echo [3/4] 提交代码 ...
git commit -m "学生信息管理系统 期末考核项目 初始提交" >nul 2>&1
if errorlevel 1 (
    echo    首次提交失败，可能未配置 git 用户名，正在配置...
    set /p GITNAME=请输入你的 GitHub 用户名:
    set /p GITEMAIL=请输入你的 GitHub 邮箱:
    git config user.name "%GITNAME%"
    git config user.email "%GITEMAIL%"
    git commit -m "学生信息管理系统 期末考核项目 初始提交"
)

git branch -M main 2>nul

echo [4/4] 关联远程仓库并推送 ...
git remote remove origin >nul 2>&1
git remote add origin "%URL%"
git push -u origin main

echo.
echo 上传完成！请在浏览器打开仓库页面检查：
echo   %URL%
echo 然后把上面的地址（https 克隆地址）写入考核报告。
pause
