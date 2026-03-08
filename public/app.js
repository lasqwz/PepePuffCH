const tg = window.Telegram.WebApp;
tg.expand();

// Товары ELFLIQ 30ml 5%
const elfliqProducts = [
  { id: 1, name: 'APPLE PEACH', brand: 'ELFLIQ', price: 45, emoji: '🍑' },
  { id: 2, name: 'BLACKBERRY LEMON', brand: 'ELFLIQ', price: 45, emoji: '🫐' },
  { id: 3, name: 'BLACKCURRANT ANISEED', brand: 'ELFLIQ', price: 45, emoji: '🍇' },
  { id: 4, name: 'BLUE RAZZ LEMONADE', brand: 'ELFLIQ', price: 45, emoji: '💙' },
  { id: 5, name: 'BLUEBERRY', brand: 'ELFLIQ', price: 45, emoji: '🫐' },
  { id: 6, name: 'BLUEBERRY SOUR RASPBERRY', brand: 'ELFLIQ', price: 45, emoji: '🫐' },
  { id: 7, name: 'CHERRY', brand: 'ELFLIQ', price: 45, emoji: '🍒' },
  { id: 8, name: 'CHERRY COLA', brand: 'ELFLIQ', price: 45, emoji: '🍒' },
  { id: 9, name: 'COLA', brand: 'ELFLIQ', price: 45, emoji: '🥤' },
  { id: 10, name: 'CUBA TOBACCO', brand: 'ELFLIQ', price: 45, emoji: '🚬' },
  { id: 11, name: 'ELF JACK', brand: 'ELFLIQ', price: 45, emoji: '🎃' },
  { id: 12, name: 'ELFBULL ICE', brand: 'ELFLIQ', price: 45, emoji: '❄️' },
  { id: 13, name: 'GRAPE', brand: 'ELFLIQ', price: 45, emoji: '🍇' },
  { id: 14, name: 'KIWI PASSION FRUIT GUAVA', brand: 'ELFLIQ', price: 45, emoji: '🥝' },
  { id: 15, name: 'P&B CLOUDD', brand: 'ELFLIQ', price: 45, emoji: '☁️' },
  { id: 16, name: 'PEACH ICE', brand: 'ELFLIQ', price: 45, emoji: '🍑' },
  { id: 17, name: 'PINA COLADA', brand: 'ELFLIQ', price: 45, emoji: '🍹' },
  { id: 18, name: 'PINK GRAPEFRUIT', brand: 'ELFLIQ', price: 45, emoji: '🍊' },
  { id: 19, name: 'PINK LEMONADE', brand: 'ELFLIQ', price: 45, emoji: '🍋' },
  { id: 20, name: 'RHUBARB SNOOW', brand: 'ELFLIQ', price: 45, emoji: '❄️' },
  { id: 21, name: 'SNOOW TOBACCO', brand: 'ELFLIQ', price: 45, emoji: '🚬' },
  { id: 22, name: 'SOUR APPLE', brand: 'ELFLIQ', price: 45, emoji: '🍏' },
  { id: 23, name: 'SPEARMINT', brand: 'ELFLIQ', price: 45, emoji: '🌿' },
  { id: 24, name: 'STRAWBERRY ICE', brand: 'ELFLIQ', price: 45, emoji: '🍓' },
  { id: 25, name: 'STRAWBERRY KIWI', brand: 'ELFLIQ', price: 45, emoji: '🍓' },
  { id: 26, name: 'STRAWBERRY RASPBERRY CHERRY ICE', brand: 'ELFLIQ', price: 45, emoji: '🍓' },
  { id: 27, name: 'STRAWBERRY SNOOW', brand: 'ELFLIQ', price: 45, emoji: '🍓' },
  { id: 28, name: 'WATERMELON', brand: 'ELFLIQ', price: 45, emoji: '🍉' }
];

// Эксклюзивные вкусы ELFLIQ
const elfliqExclusive = [
  { id: 29, name: 'APPLE PEAR', brand: 'ELFLIQ Exclusive', price: 45, emoji: '🍎' },
  { id: 30, name: 'BLUE RAZZ', brand: 'ELFLIQ Exclusive', price: 45, emoji: '💙' },
  { id: 31, name: 'BLUEBERRY RASPBERRY POMEGRANATE', brand: 'ELFLIQ Exclusive', price: 45, emoji: '🫐' },
  { id: 32, name: 'BLUEBERRY ROSE MINT', brand: 'ELFLIQ Exclusive', price: 45, emoji: '🫐' },
  { id: 33, name: 'CHERRY LEMON PEACH', brand: 'ELFLIQ Exclusive', price: 45, emoji: '🍒' },
  { id: 34, name: 'COOL MINT', brand: 'ELFLIQ Exclusive', price: 45, emoji: '🌿' },
  { id: 35, name: 'DOUBLE APPLE', brand: 'ELFLIQ Exclusive', price: 45, emoji: '🍎' },
  { id: 36, name: 'GRAPE CHERRY', brand: 'ELFLIQ Exclusive', price: 45, emoji: '🍇' },
  { id: 37, name: 'GREEN GRAPE ROSE', brand: 'ELFLIQ Exclusive', price: 45, emoji: '🍇' },
  { id: 38, name: 'JASMINE RASPBERRY', brand: 'ELFLIQ Exclusive', price: 45, emoji: '🌸' },
  { id: 39, name: 'LEMON LIME', brand: 'ELFLIQ Exclusive', price: 45, emoji: '🍋' },
  { id: 40, name: 'MANGO PEACH', brand: 'ELFLIQ Exclusive', price: 45, emoji: '🥭' },
  { id: 41, name: 'PINEAPPLE COLADA', brand: 'ELFLIQ Exclusive', price: 45, emoji: '🍍' },
  { id: 42, name: 'PINEAPPLE ICE', brand: 'ELFLIQ Exclusive', price: 45, emoji: '🍍' },
  { id: 43, name: 'PINK LEMONADE SODA', brand: 'ELFLIQ Exclusive', price: 45, emoji: '🍋' },
  { id: 44, name: 'RASPBERRY LYCHEE', brand: 'ELFLIQ Exclusive', price: 45, emoji: '🍇' },
  { id: 45, name: 'SOUR WATERMELON GUMMY', brand: 'ELFLIQ Exclusive', price: 45, emoji: '🍉' },
  { id: 46, name: 'STRAWBERRY BANANA', brand: 'ELFLIQ Exclusive', price: 45, emoji: '🍓' },
  { id: 47, name: 'STRAWBERRY CHERRY LEMON', brand: 'ELFLIQ Exclusive', price: 45, emoji: '🍓' },
  { id: 48, name: 'WATERMELON CHERRY', brand: 'ELFLIQ Exclusive', price: 45, emoji: '🍉' }
];

// Товары VOZOL 30ml 5%
const vozolProducts = [
  { id: 49, name: 'BERRY', brand: 'VOZOL', price: 45, emoji: '🫐' },
  { id: 50, name: 'BERRY PEACH', brand: 'VOZOL', price: 45, emoji: '🍑' },
  { id: 51, name: 'BLUE RASPBERRY', brand: 'VOZOL', price: 45, emoji: '💙' },
  { id: 52, name: 'BLUE RAZZ LEMON', brand: 'VOZOL', price: 45, emoji: '💙' },
  { id: 53, name: 'BLUEBERRY ICE', brand: 'VOZOL', price: 45, emoji: '🫐' },
  { id: 54, name: 'BLUEBERRY WATERMELON', brand: 'VOZOL', price: 45, emoji: '🫐' },
  { id: 55, name: 'CHERRY COLA', brand: 'VOZOL', price: 45, emoji: '🍒' },
  { id: 56, name: 'DRAGON FRUIT BANANA CHERRY', brand: 'VOZOL', price: 45, emoji: '🐉' },
  { id: 57, name: 'GRAPE ICE', brand: 'VOZOL', price: 45, emoji: '🍇' },
  { id: 58, name: 'KIWI PASSION FRUIT GUAVA', brand: 'VOZOL', price: 45, emoji: '🥝' },
  { id: 59, name: 'LAVA FIRE', brand: 'VOZOL', price: 45, emoji: '🔥' },
  { id: 60, name: 'LEMON LIME', brand: 'VOZOL', price: 45, emoji: '🍋' },
  { id: 61, name: 'LOVE 777', brand: 'VOZOL', price: 45, emoji: '💕' },
  { id: 62, name: 'MINT ICE', brand: 'VOZOL', price: 45, emoji: '🌿' },
  { id: 63, name: 'MIXED BERRIES', brand: 'VOZOL', price: 45, emoji: '🫐' },
  { id: 64, name: 'PEACH ICE', brand: 'VOZOL', price: 45, emoji: '🍑' },
  { id: 65, name: 'PEACH MANGO WATERMELON', brand: 'VOZOL', price: 45, emoji: '🍑' },
  { id: 66, name: 'PERFUME LEMON', brand: 'VOZOL', price: 45, emoji: '🍋' },
  { id: 67, name: 'PINEAPPLE PASSION FRUIT LIME', brand: 'VOZOL', price: 45, emoji: '🍍' },
  { id: 68, name: 'POMEGRANATE LEMONADE', brand: 'VOZOL', price: 45, emoji: '🍋' },
  { id: 69, name: 'PURPLE CANDY', brand: 'VOZOL', price: 45, emoji: '🍬' },
  { id: 70, name: 'SOUR APPLE ICE', brand: 'VOZOL', price: 45, emoji: '🍏' },
  { id: 71, name: 'STRAWBERRY ICE', brand: 'VOZOL', price: 45, emoji: '🍓' },
  { id: 72, name: 'STRAWBERRY ICE CREAM', brand: 'VOZOL', price: 45, emoji: '🍓' },
  { id: 73, name: 'STRAWBERRY KIWI', brand: 'VOZOL', price: 45, emoji: '🍓' },
  { id: 74, name: 'STRAWBERRY WATERMELON', brand: 'VOZOL', price: 45, emoji: '🍓' },
  { id: 75, name: 'VANILLA CREAM TOBACCO', brand: 'VOZOL', price: 45, emoji: '🚬' },
  { id: 76, name: 'WATERMELON BUBBLE GUM', brand: 'VOZOL', price: 45, emoji: '🍉' },
  { id: 77, name: 'WATERMELON ICE', brand: 'VOZOL', price: 45, emoji: '🍉' }
];

const products = [...elfliqProducts, ...elfliqExclusive, ...vozolProducts];

// Популярные товары (первые 6)
const popularProductIds = [1, 7, 13, 24, 49, 71];

let cart = [];
let currentFilter = 'all';

// Элементы
const homeView = document.getElementById('homeView');
const catalogView = document.getElementById('catalogView');
const cartView = document.getElementById('cartView');
const popularProducts = document.getElementById('popularProducts');
const productsList = document.getElementById('productsList');
const cartIcon = document.getElementById('cartIcon');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const totalPrice = document.getElementById('totalPrice');
const checkoutBtn = document.getElementById('checkoutBtn');
const goToCatalog = document.getElementById('goToCatalog');
const backToHome = document.getElementById('backToHome');
const backFromCart = document.getElementById('backFromCart');

// Отрисовка популярных товаров
function renderPopularProducts() {
  const popular = products.filter(p => popularProductIds.includes(p.id));
  popularProducts.innerHTML = popular.map(product => `
    <div class="product-card" onclick="addToCart(${product.id})">
      <div class="product-image">${product.emoji}</div>
      <div class="product-brand">${product.brand}</div>
      <div class="product-name">${product.name}</div>
      <div class="product-price">${product.price} CHF</div>
      <button class="btn-add">В корзину</button>
    </div>
  `).join('');
}

// Отрисовка товаров в каталоге
function renderProducts() {
  const filteredProducts = currentFilter === 'all' 
    ? products 
    : products.filter(p => p.brand.includes(currentFilter));
    
  productsList.innerHTML = filteredProducts.map(product => `
    <div class="product-card" onclick="addToCart(${product.id})">
      <div class="product-image">${product.emoji}</div>
      <div class="product-brand">${product.brand}</div>
      <div class="product-name">${product.name}</div>
      <div class="product-price">${product.price} CHF</div>
      <button class="btn-add">В корзину</button>
    </div>
  `).join('');
}

// Добавить в корзину
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  updateCart();
  tg.HapticFeedback.impactOccurred('light');
}

// Обновить корзину
function updateCart() {
  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="text-align: center; padding: 40px;">Корзина пуста</p>';
    totalPrice.textContent = '0';
    return;
  }
  
  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div>${item.emoji} ${item.name}</div>
        <div style="color: #666; font-size: 12px;">${item.brand}</div>
        <div style="color: #666;">${item.price} CHF</div>
      </div>
      <div class="cart-item-controls">
        <button class="btn-qty" onclick="changeQuantity(${item.id}, -1)">−</button>
        <span style="min-width: 20px; text-align: center;">${item.quantity}</span>
        <button class="btn-qty" onclick="changeQuantity(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join('');
  
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalPrice.textContent = total;
}

// Изменить количество
function changeQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  
  item.quantity += delta;
  
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  
  updateCart();
  tg.HapticFeedback.impactOccurred('light');
}

// Переключение видов
function showView(view) {
  homeView.classList.remove('active');
  catalogView.classList.remove('active');
  cartView.classList.remove('active');
  view.classList.add('active');
}

goToCatalog.addEventListener('click', () => {
  showView(catalogView);
  tg.HapticFeedback.impactOccurred('light');
});

backToHome.addEventListener('click', () => {
  showView(homeView);
  tg.HapticFeedback.impactOccurred('light');
});

cartIcon.addEventListener('click', () => {
  showView(cartView);
  tg.HapticFeedback.impactOccurred('light');
});

backFromCart.addEventListener('click', () => {
  showView(homeView);
  tg.HapticFeedback.impactOccurred('light');
});

// Фильтры
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderProducts();
    tg.HapticFeedback.impactOccurred('light');
  });
});

// Оформление заказа
checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) return;
  
  const order = {
    items: cart,
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    userId: tg.initDataUnsafe?.user?.id,
    username: tg.initDataUnsafe?.user?.username
  };
  
  tg.sendData(JSON.stringify(order));
});

// Инициализация
renderPopularProducts();
renderProducts();
updateCart();

// Глобальные функции для onclick
window.addToCart = addToCart;
window.changeQuantity = changeQuantity;
