const express = require('express');
const path = require('path');
const {
  getAllUsers,
  getAllOrders,
  updateOrderStatus,
  getOrderStats
} = require('./database');

const router = express.Router();

// Простая авторизация (в продакшене используй нормальную!)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Middleware для проверки авторизации
const checkAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth === `Bearer ${ADMIN_PASSWORD}`) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Главная страница админки
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// API для получения статистики
router.get('/api/stats', checkAuth, (req, res) => {
  try {
    const stats = getOrderStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API для получения всех заказов
router.get('/api/orders', checkAuth, (req, res) => {
  try {
    const orders = getAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API для обновления статуса заказа
router.post('/api/orders/:id/status', checkAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    updateOrderStatus(id, status);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API для получения всех пользователей
router.get('/api/users', checkAuth, (req, res) => {
  try {
    const users = getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
