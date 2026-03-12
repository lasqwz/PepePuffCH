const crypto = require('crypto');

// Проверка подлинности данных Telegram WebApp
function verifyTelegramWebAppData(initData, botToken) {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    
    return calculatedHash === hash;
  } catch (error) {
    console.error('Error verifying Telegram data:', error);
    return false;
  }
}

// Middleware для проверки админа
function requireAdmin(req, res, next) {
  const adminUsername = process.env.ADMIN_USERNAME || 'PepePuffManager';
  const telegramUsername = req.body.telegram_username || req.query.telegram_username;
  
  if (telegramUsername !== adminUsername) {
    return res.status(403).json({ 
      success: false, 
      error: 'Access denied. Admin privileges required.' 
    });
  }
  
  next();
}

// Валидация входных данных
function validateOrderData(req, res, next) {
  const { items, total, userId, userData } = req.body;
  
  // Проверяем обязательные поля
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: 'Items are required and must be a non-empty array' 
    });
  }
  
  if (!total || typeof total !== 'number' || total <= 0) {
    return res.status(400).json({ 
      success: false, 
      error: 'Total must be a positive number' 
    });
  }
  
  if (!userId || typeof userId !== 'number') {
    return res.status(400).json({ 
      success: false, 
      error: 'Valid user ID is required' 
    });
  }
  
  if (!userData || !userData.city || !userData.phone) {
    return res.status(400).json({ 
      success: false, 
      error: 'User data with city and phone is required' 
    });
  }
  
  // Валидация телефона
  const phoneDigits = userData.phone.replace(/[^\d]/g, '');
  if (phoneDigits.length < 9) {
    return res.status(400).json({ 
      success: false, 
      error: 'Phone number must contain at least 9 digits' 
    });
  }
  
  // Валидация города
  const allowedCities = ['Basel-Stadt', 'Basel-Landschaft'];
  if (!allowedCities.includes(userData.city)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid city. Only Basel-Stadt and Basel-Landschaft are allowed' 
    });
  }
  
  // Валидация товаров
  for (const item of items) {
    if (!item.id || !item.name || !item.price || !item.quantity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Each item must have id, name, price, and quantity' 
      });
    }
    
    if (typeof item.price !== 'number' || item.price <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Item price must be a positive number' 
      });
    }
    
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Item quantity must be a positive number' 
      });
    }
  }
  
  next();
}

// Sanitize HTML для защиты от XSS
function sanitizeHtml(str) {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

module.exports = {
  verifyTelegramWebAppData,
  requireAdmin,
  validateOrderData,
  sanitizeHtml
};