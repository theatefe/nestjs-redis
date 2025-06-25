@echo off
echo ===============================================
echo :: Starting NestJS + Redis Project with Docker ::
echo ===============================================
REM اجرای پروژه با Docker Compose
docker-compose -f docker-compose.yml up -d
timeout /t 10
cd service1
call yarn install
start cmd /k yarn start:dev

REM پیام موفقیت
echo ✅ Project started successfully!
pause