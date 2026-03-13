@echo off
chcp 65001 >nul
color 0A

echo ╔════════════════════════════════════════╗
echo ║     PepePuff Bot - Local Startup      ║
echo ╚════════════════════════════════════════╝
echo.

REM Проверка ngrok
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ ngrok не установлен!
    echo Скачайте с https://ngrok.com/download
    pause
    exit /b 1
)

REM Проверка Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Node.js не установлен!
    pause
    exit /b 1
)

REM Проверка зависимостей
if not exist "node_modules" (
    echo 📦 Устанавливаю зависимости...
    call npm install
)

REM Проверка .env
if not exist ".env" (
    echo ✗ Файл .env не найден!
    echo Создайте .env файл на основе .env.example
    pause
    exit /b 1
)

echo ✓ Все проверки пройдены
echo.

REM Создаем директорию для логов
if not exist "logs" mkdir logs

echo 🌐 Запускаю ngrok...
start /B ngrok http 3000 > logs\ngrok.log 2>&1

REM Ждем запуска ngrok
timeout /t 3 /nobreak >nul

echo 🤖 Запускаю бота...
node bot.js

pause
