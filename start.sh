#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     PepePuff Bot - Local Startup      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Проверка ngrok
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}✗ ngrok не установлен!${NC}"
    echo -e "${YELLOW}Установите ngrok:${NC}"
    echo "  brew install ngrok  (macOS)"
    echo "  или скачайте с https://ngrok.com/download"
    exit 1
fi

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js не установлен!${NC}"
    exit 1
fi

# Проверка зависимостей
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Устанавливаю зависимости...${NC}"
    npm install
fi

# Проверка .env файла
if [ ! -f ".env" ]; then
    echo -e "${RED}✗ Файл .env не найден!${NC}"
    echo -e "${YELLOW}Создайте .env файл на основе .env.example${NC}"
    exit 1
fi

# Загружаем переменные из .env
export $(cat .env | grep -v '^#' | xargs)

# Проверка BOT_TOKEN
if [ -z "$BOT_TOKEN" ]; then
    echo -e "${RED}✗ BOT_TOKEN не установлен в .env${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Все проверки пройдены${NC}"
echo ""

# Создаем директорию для логов
mkdir -p logs

# Функция для очистки процессов при выходе
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Останавливаю все процессы...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Запускаем ngrok в фоне
echo -e "${BLUE}🌐 Запускаю ngrok на порту 3000...${NC}"
ngrok http 3000 --log=stdout > logs/ngrok.log 2>&1 &
NGROK_PID=$!

# Ждем пока ngrok запустится
sleep 3

# Получаем публичный URL от ngrok
echo -e "${YELLOW}⏳ Получаю URL от ngrok...${NC}"
NGROK_URL=""
for i in {1..10}; do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | grep -o 'https://[^"]*' | head -1)
    if [ ! -z "$NGROK_URL" ]; then
        break
    fi
    sleep 1
done

if [ -z "$NGROK_URL" ]; then
    echo -e "${RED}✗ Не удалось получить URL от ngrok${NC}"
    echo -e "${YELLOW}Проверьте логи: logs/ngrok.log${NC}"
    kill $NGROK_PID
    exit 1
fi

echo -e "${GREEN}✓ ngrok запущен: ${NGROK_URL}${NC}"

# Обновляем WEBAPP_URL в .env
echo -e "${YELLOW}🔄 Обновляю WEBAPP_URL в .env...${NC}"

# Создаем резервную копию
cp .env .env.bak

# Проверяем есть ли строка WEBAPP_URL
if grep -q "^WEBAPP_URL=" .env; then
    # Обновляем существующую строку
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|^WEBAPP_URL=.*|WEBAPP_URL=${NGROK_URL}|g" .env
    else
        # Linux
        sed -i "s|^WEBAPP_URL=.*|WEBAPP_URL=${NGROK_URL}|g" .env
    fi
else
    # Добавляем новую строку
    echo "WEBAPP_URL=${NGROK_URL}" >> .env
fi

echo -e "${GREEN}✓ WEBAPP_URL обновлен в .env${NC}"

# Экспортируем новый URL
export WEBAPP_URL=$NGROK_URL

echo ""
echo -e "${BLUE}🤖 Запускаю бота...${NC}"

# Запускаем бота
node bot.js 2>&1 | tee logs/bot.log &
BOT_PID=$!

# Ждем немного
sleep 2

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          🎉 ВСЁ ЗАПУЩЕНО! 🎉          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📱 Telegram Bot:${NC} работает"
echo -e "${BLUE}🌐 Web App URL:${NC} ${NGROK_URL}"
echo -e "${BLUE}🔍 ngrok Dashboard:${NC} http://localhost:4040"
echo ""
echo -e "${YELLOW}💡 Отправьте /start боту в Telegram${NC}"
echo -e "${YELLOW}📋 Логи сохраняются в папке logs/${NC}"
echo ""
echo -e "${RED}Нажмите Ctrl+C для остановки${NC}"
echo ""

# Ждем
wait $BOT_PID
