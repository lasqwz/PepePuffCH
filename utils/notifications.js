const { sanitizeHtml } = require('../middleware/auth');

let bot = null;
let adminChatId = null;

// Инициализация бота (вызывается из main файла)
function initNotifications(botInstance, adminId) {
  bot = botInstance;
  adminChatId = adminId;
}

// Отправка уведомлений о заказе
async function sendOrderNotifications(orderData, orderId) {
  if (!bot) {
    console.error('Bot not initialized for notifications');
    return;
  }
  
  try {
    // Формируем сообщение о заказе
    let orderMessage = '🛒 Новый заказ!\n\n';
    
    // Информация о клиенте (sanitized)
    if (orderData.userData) {
      orderMessage += `👤 Клиент: ${sanitizeHtml(orderData.userData.name)}\n`;
      orderMessage += `📱 Telegram: @${sanitizeHtml(orderData.userData.telegramUsername || orderData.username || 'unknown')}\n`;
      orderMessage += `📍 Город: ${sanitizeHtml(orderData.userData.city)}\n`;
      if (orderData.userData.phone) {
        orderMessage += `☎️ Телефон: ${sanitizeHtml(orderData.userData.phone)}\n`;
      }
      orderMessage += `\n`;
    }
    
    // Товары (sanitized)
    orderMessage += '📦 Товары:\n';
    orderData.items.forEach(item => {
      const safeName = sanitizeHtml(item.name);
      const safeBrand = sanitizeHtml(item.brand);
      orderMessage += `${item.emoji} ${safeName}\n`;
      orderMessage += `   [${safeBrand}] ${item.quantity} шт × ${item.price} CHF = ${item.quantity * item.price} CHF\n\n`;
    });
    
    orderMessage += `💰 Итого: ${orderData.total} CHF\n`;
    orderMessage += `🆔 Заказ #${orderId}`;
    
    // Отправляем сообщение пользователю
    await bot.sendMessage(orderData.userId, orderMessage);
    await bot.sendMessage(orderData.userId, 'Спасибо за заказ! Скоро с вами свяжемся 🎉');
    
    // Отправляем уведомление админу
    if (adminChatId) {
      await bot.sendMessage(adminChatId, `🔔 ${orderMessage}`);
    }
    
  } catch (error) {
    console.error('Error sending order notifications:', error);
    // Не бросаем ошибку, чтобы не сломать процесс заказа
  }
}

module.exports = {
  initNotifications,
  sendOrderNotifications
};