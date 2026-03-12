const express = require('express');
const router = express.Router();
const { saveOrder, saveUser } = require('../database');
const { validateOrderData, sanitizeHtml } = require('../middleware/auth');
const { orderLimiter } = require('../middleware/security');

// Создание заказа
router.post('/', orderLimiter, validateOrderData, async (req, res) => {
  try {
    const data = req.body;
    
    // Sanitize пользовательские данные
    const sanitizedUserData = {
      telegram_id: String(data.userId),
      telegram_username: sanitizeHtml(data.userData.telegramUsername || data.username || ''),
      name: sanitizeHtml(data.userData.name || ''),
      city: sanitizeHtml(data.userData.city || ''),
      phone: sanitizeHtml(data.userData.phone || ''),
      photo_url: data.userData.photoUrl || null
    };
    
    // Sanitize данные заказа
    const sanitizedItems = data.items.map(item => ({
      ...item,
      name: sanitizeHtml(item.name),
      brand: sanitizeHtml(item.brand)
    }));
    
    // Сохраняем пользователя в базу данных
    await saveUser(sanitizedUserData);
    
    // Сохраняем заказ в базу данных
    const orderResult = await saveOrder({
      telegram_id: sanitizedUserData.telegram_id,
      telegram_username: sanitizedUserData.telegram_username,
      user_name: sanitizedUserData.name,
      user_city: sanitizedUserData.city,
      user_phone: sanitizedUserData.phone,
      items: sanitizedItems,
      total: data.total
    });
    
    // Отправляем уведомления через bot (импортируем bot отдельно)
    const { sendOrderNotifications } = require('../utils/notifications');
    await sendOrderNotifications(data, orderResult.lastInsertRowid);
    
    res.json({ 
      success: true, 
      orderId: orderResult.lastInsertRowid,
      message: 'Order created successfully'
    });
    
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error. Please try again later.' 
    });
  }
});

// Получение заказов пользователя
router.get('/user/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;
    
    // Валидация telegram ID
    if (!telegramId || !/^\d+$/.test(telegramId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid Telegram ID' 
      });
    }
    
    const { db } = require('../database');
    const stmt = db.prepare('SELECT * FROM orders WHERE telegram_id = ? ORDER BY created_at DESC LIMIT 50');
    const orders = stmt.all(telegramId);
    
    // Sanitize данные перед отправкой
    const sanitizedOrders = orders.map(order => ({
      ...order,
      user_name: sanitizeHtml(order.user_name),
      user_city: sanitizeHtml(order.user_city),
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
    }));
    
    res.json(sanitizedOrders);
    
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;