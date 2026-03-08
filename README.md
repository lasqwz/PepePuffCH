# Telegram Bot с Web App

Простой Telegram бот с веб-приложением.

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте `.env` файл на основе `.env.example`:
```bash
cp .env.example .env
```

3. Получите токен бота у [@BotFather](https://t.me/botfather) и добавьте в `.env`

4. Разверните приложение на сервере (например, Heroku, Railway, или VPS) и укажите URL в `.env`

## Запуск

Разработка:
```bash
npm run dev
```

Продакшн:
```bash
npm start
```

## Настройка Web App в BotFather

1. Отправьте `/mybots` в [@BotFather](https://t.me/botfather)
2. Выберите вашего бота
3. Bot Settings → Menu Button → Edit Menu Button URL
4. Укажите URL вашего веб-приложения
