const express = require('express');
const router = express.Router();
const { saveOrder, saveUser } = require('../database');
const { validateOrderData, sanitizeHtml } = require('../middleware/auth');
const { orderLimiter } = require('../middleware/security');

// Создание заказа
router.post('/', orderLimiter, validateOrderData, async (req, res) => {
  try {
    const data = req.body;
    
    console.log('=== ORDER REQUEST ===');
    console.log('User ID:', data.userId);
    console.log('Username:', data.username);
    console.log('Items count:', data.items?.length);
    console.log('Total:', data.total);
    console.log('User data:', data.userData);
    
    // Sanitize пользовательские данные
    const sanitizedUserData = {
      telegram_id: String(data.userId),
      telegram_username: sanitizeHtml(data.userData.telegramUsername || data.username || ''),
      name: sanitizeHtml(data.userData.name || ''),
      city: sanitizeHtml(data.userData.city || ''),
      phone: sanitizeHtml(data.userData.phone || ''),
      photo_url: data.userData.photoUrl || null
    };
    
    console.log('Sanitized user data:', sanitizedUserData);
    
    // Sanitize данные заказа
    const sanitizedItems = data.items.map(item => ({
      ...item,
      name: sanitizeHtml(item.name),
      brand: sanitizeHtml(item.brand)
    }));
    
    console.log('Saving user to database...');
    // Сохраняем пользователя в базу данных
    await saveUser(sanitizedUserData);
    
    console.log('Saving order to database...');
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
    
    console.log('Order saved with ID:', orderResult.lastInsertRowid);
    
    console.log('Sending notifications...');
    // Отправляем уведомления через bot (импортируем bot отдельно)
    try {
      const { sendOrderNotifications } = require('../utils/notifications');
      await sendOrderNotifications(data, orderResult.lastInsertRowid);
      console.log('Notifications sent successfully');
    } catch (notifError) {
      console.error('Notification error (non-critical):', notifError.message);
      // Не бросаем ошибку - заказ уже сохранен
    }
    
    console.log('Order completed successfully');
    
    res.json({ 
      success: true, 
      orderId: orderResult.lastInsertRowid,
      message: 'Order created successfully'
    });
    
  } catch (error) {
    console.error('=== ORDER ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    // Определяем тип ошибки для более понятного сообщения
    let errorMessage = 'Internal server error. Please try again later.';
    let statusCode = 500;
    
    if (error.message.includes('UNIQUE constraint')) {
      errorMessage = 'Duplicate order detected. Please try again.';
      statusCode = 409;
    } else if (error.message.includes('validation')) {
      errorMessage = 'Invalid order data. Please check your information.';
      statusCode = 400;
    } else if (error.message.includes('database')) {
      errorMessage = 'Database error. Please try again later.';
      statusCode = 503;
    }
    
    res.status(statusCode).json({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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