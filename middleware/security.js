const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting для API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Строгий rate limiting для админ endpoints
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 20, // максимум 20 запросов с одного IP
  message: {
    success: false,
    error: 'Too many admin requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting для заказов
const orderLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 минут
  max: 5, // максимум 5 заказов за 5 минут
  message: {
    success: false,
    error: 'Too many orders from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helmet конфигурация для безопасности
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://telegram.org", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

module.exports = {
  apiLimiter,
  adminLimiter,
  orderLimiter,
  helmetConfig
};