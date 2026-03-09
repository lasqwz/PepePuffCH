require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');
const { saveOrder, saveUser } = require('./database');
const adminRouter = require('./admin');

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL;
const adminUsername = process.env.ADMIN_USERNAME || 'PepePuffManager';
const port = process.env.PORT || 3000;

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Подключаем админ-панель
app.use('/admin', adminRouter);

// API для оформления заказа
app.post('/api/order', (req, res) => {
  try {
    const data = req.body;
    
    // Сохраняем пользователя в базу данных
    if (data.userData) {
      saveUser({
        telegram_id: String(data.userId),
        telegram_username: data.userData.telegramUsername || data.username || null,
        name: data.userData.name,
        city: data.userData.city,
        phone: data.userData.phone || null
      });
    }
    
    // Сохраняем заказ в базу данных
    const orderResult = saveOrder({
      telegram_id: String(data.userId),
      telegram_username: data.userData?.telegramUsername || data.username || null,
      user_name: data.userData?.name || 'Unknown',
      user_city: data.userData?.city || 'Unknown',
      user_phone: data.userData?.phone || null,
      items: data.items,
      total: data.total
    });
    
    // Формируем сообщение о заказе
    let orderMessage = '🛒 Новый заказ!\n\n';
    
    // Информация о клиенте
    if (data.userData) {
      orderMessage += `👤 Клиент: ${data.userData.name}\n`;
      orderMessage += `📱 Telegram: @${data.userData.telegramUsername || data.username || 'unknown'}\n`;
      orderMessage += `📍 Город: ${data.userData.city}\n`;
      if (data.userData.phone) {
        orderMessage += `☎️ Телефон: ${data.userData.phone}\n`;
      }
      orderMessage += `\n`;
    }
    
    // Товары
    orderMessage += '📦 Товары:\n';
    data.items.forEach(item => {
      orderMessage += `${item.emoji} ${item.name}\n`;
      orderMessage += `   [${item.brand}] ${item.quantity} шт × ${item.price} CHF = ${item.quantity * item.price} CHF\n\n`;
    });
    
    orderMessage += `💰 Итого: ${data.total} CHF\n`;
    orderMessage += `🆔 Заказ #${orderResult.lastInsertRowid}`;
    
    // Отправляем сообщение пользователю
    bot.sendMessage(data.userId, orderMessage);
    bot.sendMessage(data.userId, 'Спасибо за заказ! Скоро с вами свяжемся 🎉');
    
    res.json({ success: true, orderId: orderResult.lastInsertRowid });
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  
  // Для всех открываем магазин (у админа будет дополнительная вкладка)
  const message = username === adminUsername 
    ? '👨‍💼 Добро пожаловать, администратор!\n\nВ магазине доступна вкладка "Админ"'
    : '🐸 Добро пожаловать в Pepe Puff!\n\nПремиум жидкости для вейпа';
  
  bot.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🛒 Открыть магазин', web_app: { url: webAppUrl } }]
      ]
    }
  });
});

// Команда /shop - открывает магазин
bot.onText(/\/shop/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '🛒 Открываю магазин...', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🛍️ Pepe Puff Shop', web_app: { url: webAppUrl } }]
      ]
    }
  });
});

// Обработка данных из веб-приложения
bot.on('web_app_data', (msg) => {
  const chatId = msg.chat.id;
  const data = JSON.parse(msg.web_app_data.data);
  
  // Сохраняем пользователя в базу данных
  if (data.userData) {
    saveUser({
      telegram_id: String(data.userId),
      telegram_username: data.userData.telegramUsername || data.username || null,
      name: data.userData.name,
      city: data.userData.city,
      phone: data.userData.phone || null
    });
  }
  
  // Сохраняем заказ в базу данных
  saveOrder({
    telegram_id: String(data.userId),
    telegram_username: data.userData?.telegramUsername || data.username || null,
    user_name: data.userData?.name || 'Unknown',
    user_city: data.userData?.city || 'Unknown',
    user_phone: data.userData?.phone || null,
    items: data.items,
    total: data.total
  });
  
  // Формируем сообщение о заказе
  let orderMessage = '🛒 Новый заказ!\n\n';
  
  // Информация о клиенте
  if (data.userData) {
    orderMessage += `👤 Клиент: ${data.userData.name}\n`;
    orderMessage += `📱 Telegram: @${data.userData.telegramUsername || data.username || 'unknown'}\n`;
    orderMessage += `📍 Город: ${data.userData.city}\n`;
    if (data.userData.phone) {
      orderMessage += `☎️ Телефон: ${data.userData.phone}\n`;
    }
    orderMessage += `\n`;
  }
  
  // Товары
  orderMessage += '📦 Товары:\n';
  data.items.forEach(item => {
    orderMessage += `${item.emoji} ${item.name}\n`;
    orderMessage += `   [${item.brand}] ${item.quantity} шт × ${item.price} CHF = ${item.quantity * item.price} CHF\n\n`;
  });
  
  orderMessage += `💰 Итого: ${data.total} CHF\n`;
  orderMessage += `🆔 ID: ${data.userId}`;
  
  bot.sendMessage(chatId, orderMessage);
  bot.sendMessage(chatId, 'Спасибо за заказ! Скоро с вами свяжемся 🎉');
});

// Запуск веб-сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
  console.log(`Web App URL: ${webAppUrl}`);
  console.log(`Бот активен`);
});
