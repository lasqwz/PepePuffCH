# 🚀 Локальный запуск PepePuff Bot

## Требования

1. **Node.js** (версия 18 или выше)
2. **ngrok** - для публичного доступа к локальному серверу

## Установка ngrok

### macOS
```bash
brew install ngrok
```

### Windows
Скачайте с https://ngrok.com/download и добавьте в PATH

### Linux
```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

## Настройка

1. Убедитесь что файл `.env` существует и содержит:
```env
BOT_TOKEN=ваш_токен_бота
WEBAPP_URL=http://localhost:3000
PORT=3000
ADMIN_USERNAME=PepePuffManager
ADMIN_CHAT_ID=ваш_chat_id
```

2. Установите зависимости (если еще не установлены):
```bash
npm install
```

## Запуск

### macOS/Linux
```bash
./start.sh
```

### Windows
```bash
start.bat
```

Или просто двойной клик по файлу `start.bat`

## Что происходит при запуске?

1. ✅ Проверяются все зависимости
2. 🌐 Запускается ngrok на порту 3000
3. 🔄 Автоматически обновляется WEBAPP_URL в .env
4. 🤖 Запускается Telegram бот
5. 📱 Бот готов к работе!

## После запуска

1. Отправьте `/start` вашему боту в Telegram
2. Нажмите "Открыть магазин"
3. Приложение откроется через ngrok URL

## Полезные ссылки

- **ngrok Dashboard**: http://localhost:4040
  - Здесь можно посмотреть все запросы в реальном времени
  - Очень полезно для отладки

- **Логи**:
  - `logs/bot.log` - логи бота
  - `logs/ngrok.log` - логи ngrok

## Остановка

Нажмите `Ctrl+C` в терминале где запущен скрипт

## Troubleshooting

### ngrok не запускается
- Проверьте что ngrok установлен: `ngrok version`
- Убедитесь что порт 3000 свободен

### Бот не отвечает
- Проверьте логи: `cat logs/bot.log`
- Убедитесь что BOT_TOKEN правильный
- Проверьте что нет других запущенных экземпляров бота

### Web App не открывается
- Проверьте ngrok Dashboard: http://localhost:4040
- Убедитесь что WEBAPP_URL обновился в .env
- Перезапустите скрипт

## Преимущества локального запуска

✅ Мгновенные изменения - не нужно ждать deploy  
✅ Полный контроль над логами  
✅ Легкая отладка  
✅ Бесплатно (ngrok free tier)  
✅ Работает на вашем компьютере  

## Примечание

ngrok бесплатная версия:
- Генерирует новый URL при каждом запуске
- Ограничение 40 запросов в минуту (достаточно для разработки)
- Сессия живет 2 часа (потом нужно перезапустить)

Для production рекомендуется использовать платный ngrok или другой хостинг.
