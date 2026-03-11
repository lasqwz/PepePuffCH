const Database = require('better-sqlite3');
const db = new Database('pepepuff.db');

// Создание таблиц
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT UNIQUE,
    telegram_username TEXT,
    name TEXT,
    city TEXT,
    phone TEXT,
    photo_url TEXT,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    telegram_id TEXT,
    telegram_username TEXT,
    user_name TEXT,
    user_city TEXT,
    user_phone TEXT,
    items TEXT,
    total REAL,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    brand TEXT,
    price REAL,
    emoji TEXT,
    color TEXT,
    in_stock INTEGER DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Функции для работы с пользователями
const saveUser = (userData) => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users (telegram_id, telegram_username, name, city, phone, photo_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    userData.telegram_id,
    userData.telegram_username,
    userData.name,
    userData.city,
    userData.phone,
    userData.photo_url || null
  );
};

const getUser = (telegramId) => {
  const stmt = db.prepare('SELECT * FROM users WHERE telegram_id = ?');
  return stmt.get(telegramId);
};

const getAllUsers = () => {
  const stmt = db.prepare('SELECT * FROM users ORDER BY registered_at DESC');
  return stmt.all();
};

// Функции для работы с заказами
const saveOrder = (orderData) => {
  const stmt = db.prepare(`
    INSERT INTO orders (telegram_id, telegram_username, user_name, user_city, user_phone, items, total, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    orderData.telegram_id,
    orderData.telegram_username,
    orderData.user_name,
    orderData.user_city,
    orderData.user_phone,
    JSON.stringify(orderData.items),
    orderData.total,
    'new'
  );
};

const getAllOrders = () => {
  const stmt = db.prepare('SELECT * FROM orders ORDER BY created_at DESC');
  return stmt.all();
};

const updateOrderStatus = (orderId, status) => {
  const stmt = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
  return stmt.run(status, orderId);
};

const getOrderStats = () => {
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get();
  const totalRevenue = db.prepare('SELECT SUM(total) as sum FROM orders WHERE status != "cancelled"').get();
  const newOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = "new"').get();
  
  return {
    totalOrders: totalOrders.count,
    totalRevenue: totalRevenue.sum || 0,
    newOrders: newOrders.count
  };
};

// Функции для работы с товарами
const getAllProducts = () => {
  const stmt = db.prepare('SELECT * FROM products ORDER BY brand, name');
  return stmt.all();
};

const updateProductStock = (productId, inStock) => {
  const stmt = db.prepare('UPDATE products SET in_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  return stmt.run(inStock ? 1 : 0, productId);
};

const updateProduct = (productId, data) => {
  const stmt = db.prepare('UPDATE products SET name = ?, price = ?, in_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  return stmt.run(data.name, data.price, data.in_stock ? 1 : 0, productId);
};

const syncProducts = (products) => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO products (id, name, brand, price, emoji, color, in_stock)
    VALUES (?, ?, ?, ?, ?, ?, COALESCE((SELECT in_stock FROM products WHERE id = ?), 1))
  `);
  
  products.forEach(product => {
    stmt.run(product.id, product.name, product.brand, product.price, product.emoji, product.color, product.id);
  });
};

const getOrder = (orderId) => {
  const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
  return stmt.get(orderId);
};

module.exports = {
  db,
  saveUser,
  getUser,
  getAllUsers,
  saveOrder,
  getAllOrders,
  getOrder,
  updateOrderStatus,
  getOrderStats,
  getAllProducts,
  updateProductStock,
  updateProduct,
  syncProducts
};
