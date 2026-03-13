// Тестовый файл для проверки импортов
console.log('Testing imports...');

try {
  console.log('1. Loading dotenv...');
  require('dotenv').config();
  console.log('✓ dotenv loaded');
  
  console.log('2. Loading TelegramBot...');
  const TelegramBot = require('node-telegram-bot-api');
  console.log('✓ TelegramBot loaded');
  
  console.log('3. Loading express...');
  const express = require('express');
  console.log('✓ express loaded');
  
  console.log('4. Loading compression...');
  const compression = require('compression');
  console.log('✓ compression loaded');
  
  console.log('5. Loading config/constants...');
  const { validateEnv } = require('./config/constants');
  console.log('✓ config/constants loaded');
  
  console.log('6. Loading middleware/security...');
  const { helmetConfig, apiLimiter, adminLimiter } = require('./middleware/security');
  console.log('✓ middleware/security loaded');
  
  console.log('7. Loading middleware/auth...');
  const { requireAdmin } = require('./middleware/auth');
  console.log('✓ middleware/auth loaded');
  
  console.log('8. Loading utils/notifications...');
  const { initNotifications } = require('./utils/notifications');
  console.log('✓ utils/notifications loaded');
  
  console.log('9. Loading database...');
  const { saveUser, saveOrder } = require('./database');
  console.log('✓ database loaded');
  
  console.log('10. Loading routes/orders...');
  const ordersRouter = require('./routes/orders');
  console.log('✓ routes/orders loaded');
  
  console.log('11. Loading admin...');
  const adminRouter = require('./admin');
  console.log('✓ admin loaded');
  
  console.log('\n✓ All imports successful!');
  
} catch (error) {
  console.error('\n✗ Import failed:');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
