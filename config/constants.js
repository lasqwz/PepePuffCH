// Конфигурация приложения
const config = {
  // Города доставки
  ALLOWED_CITIES: ['Basel-Stadt', 'Basel-Landschaft'],
  
  // Валидация
  MIN_PHONE_DIGITS: 9,
  MAX_ORDER_ITEMS: 50,
  MAX_ORDER_TOTAL: 10000, // CHF
  MIN_ORDER_TOTAL: 1, // CHF
  
  // Rate limiting
  API_RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100
  },
  
  ADMIN_RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 20
  },
  
  ORDER_RATE_LIMIT: {
    windowMs: 5 * 60 * 1000, // 5 минут
    max: 5
  },
  
  // Кэширование
  STATIC_CACHE_MAX_AGE: 24 * 60 * 60 * 1000, // 24 часа
  API_CACHE_MAX_AGE: 5 * 60 * 1000, // 5 минут
  
  // База данных
  DB_NAME: 'pepepuff.db',
  
  // Популярные товары
  POPULAR_PRODUCT_IDS: [1, 7, 13, 24, 49, 71],
  
  // Версии для кэш-бастинга
  CURRENT_VERSION: 'v6',
  
  // Telegram
  CUSTOM_EMOJI_ID: '5165823665324951299',
  
  // Безопасность
  BCRYPT_ROUNDS: 12,
  JWT_EXPIRES_IN: '24h',
  
  // Логирование
  LOG_LEVEL: process.env.NODE_ENV === 'production' ? 'error' : 'debug'
};

// Валидация переменных окружения
function validateEnv() {
  const required = ['BOT_TOKEN', 'WEBAPP_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = {
  ...config,
  validateEnv
};