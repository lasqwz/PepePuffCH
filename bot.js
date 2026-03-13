require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');
const { saveOrder, saveUser } = require('./database');
const adminRouter = require('./admin');

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL;
const adminUsername = process.env.ADMIN_USERNAME || 'PepePuffManager';
const adminChatId = process.env.ADMIN_CHAT_ID; // Telegram ID админа
const port = process.env.PORT || 3000;

const bot = new TelegramBot(token, { polling: true });
const app = express();

// Отключаем кэширование для всех статических файлов
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

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
        phone: data.userData.phone || null,
        photo_url: data.userData.photoUrl || null
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
    
    // Отправляем уведомление админу
    if (adminChatId) {
      bot.sendMessage(adminChatId, `🔔 ${orderMessage}`);
    }
    
    res.json({ success: true, orderId: orderResult.lastInsertRowid });
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API для получения заказов пользователя
app.get('/api/user/:telegramId/orders', (req, res) => {
  try {
    const { telegramId } = req.params;
    const { db } = require('./database');
    const stmt = db.prepare('SELECT * FROM orders WHERE telegram_id = ? ORDER BY created_at DESC');
    const orders = stmt.all(telegramId);
    res.json(orders);
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// API для обновления профиля пользователя
app.post('/api/user/update', (req, res) => {
  try {
    const { telegram_id, telegram_username, name, city, phone, photo_url } = req.body;
    saveUser({ telegram_id, telegram_username, name, city, phone, photo_url });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API для очистки базы (только для админа)
app.post('/api/admin/cleanup-users', (req, res) => {
  try {
    const { db } = require('./database');
    
    // Получаем telegram_id админа
    const adminUser = db.prepare('SELECT telegram_id FROM users WHERE telegram_username = ?').get(adminUsername);
    
    if (adminUser) {
      // Удаляем всех пользователей кроме админа
      const result = db.prepare('DELETE FROM users WHERE telegram_username != ?').run(adminUsername);
      
      // Удаляем заказы не-админов
      const ordersResult = db.prepare('DELETE FROM orders WHERE telegram_id != ?').run(adminUser.telegram_id);
      
      res.json({ 
        success: true, 
        deletedUsers: result.changes,
        deletedOrders: ordersResult.changes
      });
    } else {
      res.json({ success: false, message: 'Admin not found' });
    }
  } catch (error) {
    console.error('Error cleaning up users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API для очистки пользователей с некорректными телефонами
app.post('/api/admin/cleanup-invalid-phones', (req, res) => {
  try {
    const { db } = require('./database');
    
    // Получаем всех пользователей
    const users = db.prepare('SELECT * FROM users').all();
    let deletedCount = 0;
    
    users.forEach(user => {
      // Пропускаем админа
      if (user.telegram_username === adminUsername) return;
      
      // Проверяем телефон
      const phone = user.phone || '';
      const phoneDigits = phone.replace(/[^\d]/g, '');
      
      // Если телефон некорректный (меньше 9 цифр), удаляем пользователя
      if (phoneDigits.length < 9) {
        db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
        db.prepare('DELETE FROM orders WHERE telegram_id = ?').run(user.telegram_id);
        deletedCount++;
      }
    });
    
    res.json({ 
      success: true, 
      deletedUsers: deletedCount,
      message: `Удалено ${deletedCount} пользователей с некорректными телефонами`
    });
  } catch (error) {
    console.error('Error cleaning up invalid phones:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  
  // Логируем Chat ID админа для настройки
  if (username === adminUsername) {
    console.log(`Admin Chat ID: ${chatId}`);
  }
  
  // Добавляем версию к URL для сброса кэша
  const webAppUrlWithVersion = `${webAppUrl}?v=${Date.now()}`;
  
  // Для всех открываем магазин (у админа будет дополнительная вкладка)
  const message = username === adminUsername 
    ? `👨‍💼 Добро пожаловать, администратор!\n\nВ магазине доступна вкладка "Админ"\n\n🆔 Ваш Chat ID: ${chatId}\n(Добавьте его в Railway как ADMIN_CHAT_ID)`
    : '🐸 Добро пожаловать в Pepe Puff!\n\nПремиум жидкости для вейпа';
  
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🛒 Открыть магазин', web_app: { url: webAppUrlWithVersion } }]
      ]
    }
  });
});

// Команда /shop - открывает магазин
bot.onText(/\/shop/, (msg) => {
  const chatId = msg.chat.id;
  const webAppUrlWithVersion = `${webAppUrl}?v=${Date.now()}`;
  bot.sendMessage(chatId, '🐸 Открываю магазин Pepe Puff...', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🛍️ Pepe Puff Shop', web_app: { url: webAppUrlWithVersion } }]
      ]
    }
  });
});

// Команда /myid - показывает Chat ID (для настройки админа)
bot.onText(/\/myid/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  bot.sendMessage(chatId, `👤 Ваш Chat ID: ${chatId}\n📱 Username: @${username || 'не установлен'}`);
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

