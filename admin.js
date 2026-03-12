const express = require('express');
const path = require('path');
const {
  getAllUsers,
  getAllOrders,
  getOrder,
  updateOrderStatus,
  getOrderStats,
  getAllProducts,
  updateProductStock,
  updateProduct,
  syncProducts
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


// API для получения деталей заказа
router.get('/api/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const order = getOrder(id);
    if (order) {
      order.items = JSON.parse(order.items);
      res.json(order);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API для получения всех товаров
router.get('/api/products', (req, res) => {
  try {
    const products = getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API для обновления наличия товара
router.post('/api/products/:id/stock', (req, res) => {
  try {
    const { id } = req.params;
    const { in_stock } = req.body;
    updateProductStock(id, in_stock);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API для обновления товара
router.put('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, in_stock } = req.body;
    
    console.log('Updating product:', { id, name, price, in_stock });
    
    // Валидация
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid product name' });
    }
    
    if (!price || typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid product price' });
    }
    
    const result = updateProduct(id, { name, price, in_stock });
    console.log('Update result:', result);
    
    res.json({ success: true, changes: result.changes });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API для синхронизации товаров
router.post('/api/products/sync', (req, res) => {
  try {
    const { products } = req.body;
    syncProducts(products);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
