const express = require('express');
const path = require('path');
const {
  getAllUsers,
  getAllOrders,
  updateOrderStatus,
  getOrderStats
} = require('./database');

const router = express.Router();

// API для получения статистики
router.get('/api/stats', (req, res) => {
  try {
    const stats = getOrderStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API для получения всех заказов
router.get('/api/orders', (req, res) => {
  try {
    const orders = getAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API для обновления статуса заказа
router.post('/api/orders/:id/status', (req, res) => {
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
router.get('/api/users', (req, res) => {
  try {
    const users = getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
