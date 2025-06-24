@echo off
echo ===============================================
echo :: Starting NestJS + Redis Project with Docker ::
echo ===============================================
REM بررسی وجود docker
where docker >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed or not in PATH.
    pause
    exit /b
)
REM اجرای پروژه با Docker Compose
docker-compose up --build

REM پیام موفقیت
echo ✅ Project started successfully!
pause