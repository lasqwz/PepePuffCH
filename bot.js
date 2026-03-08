require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL;
const port = process.env.PORT || 3000;

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет! Нажми на кнопку ниже, чтобы открыть веб-приложение:', {
    reply_markup: {
      keyboard: [
        [{ text: 'Открыть приложение', web_app: { url: webAppUrl } }]
      ],
      resize_keyboard: true
    }
  });
});

// Обработка данных из веб-приложения
bot.on('web_app_data', (msg) => {
  const chatId = msg.chat.id;
  const data = JSON.parse(msg.web_app_data.data);
  
  bot.sendMessage(chatId, `Получены данные:\nИмя: ${data.name}\nEmail: ${data.email}`);
});

// Запуск веб-сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
  console.log(`Web App URL: ${webAppUrl}`);
  console.log(`Бот активен`);
});
