# Деплой на Railway

## Шаги для деплоя:

1. Зарегистрируйся на [Railway](https://railway.app/) (можно через GitHub)

2. Установи Railway CLI (опционально):
```bash
npm install -g @railway/cli
```

3. Или используй веб-интерфейс:
   - Нажми "New Project"
   - Выбери "Deploy from GitHub repo"
   - Подключи свой GitHub аккаунт
   - Выбери этот репозиторий

4. Добавь переменные окружения в Railway:
   - `BOT_TOKEN` = 8702975487:AAF_21H6d6mEnJQ2sYfCg81JCPc4944ibiE
   - `WEBAPP_URL` = (Railway автоматически даст URL, например https://твой-проект.up.railway.app)
   - `PORT` = (Railway сам установит)
   - `NODE_ENV` = production
   - `DATABASE_PATH` = /data/pepepuff.db
   - `ADMIN_PASSWORD` = (установи безопасный пароль для админ-панели)
   - `ADMIN_USERNAME` = PepePuffManager
   - `ADMIN_CHAT_ID` = (твой Chat ID из команды /myid)

5. Настрой Railway Volume для постоянного хранения базы данных:
   - В Railway Dashboard перейди в свой проект
   - Открой вкладку "Volumes"
   - Нажми "New Volume"
   - Установи Mount Path: `/data`
   - Сохрани изменения
   - Это обеспечит сохранность базы данных SQLite при редеплоях

6. После деплоя:
   - Скопируй URL твоего приложения из Railway
   - Обнови переменную `WEBAPP_URL` на этот URL
   - Бот автоматически перезапустится

## Альтернатива: Render

1. Зарегистрируйся на [Render](https://render.com/)
2. Создай новый "Web Service"
3. Подключи GitHub репозиторий
4. Добавь переменные окружения
5. Деплой!

## Быстрый деплой без Git

Если не хочешь использовать Git, можешь задеплоить через Railway CLI:

```bash
railway login
railway init
railway up
railway variables set BOT_TOKEN=8702975487:AAF_21H6d6mEnJQ2sYfCg81JCPc4944ibiE
```

После деплоя получишь URL и обновишь WEBAPP_URL.
