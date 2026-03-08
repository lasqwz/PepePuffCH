const tg = window.Telegram.WebApp;

// Расширяем на весь экран
tg.expand();
tg.enableClosingConfirmation();

// Проверка регистрации пользователя
const userId = tg.initDataUnsafe?.user?.id;
const storageKey = `user_${userId}`;

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
const popularProductIds = [1, 7, 13, 24, 49, 71];

let cart = [];
let currentFilter = 'all';

// Элементы
const pages = {
  ageCheck: document.getElementById('ageCheckView'),
  registration: document.getElementById('registrationView'),
  home: document.getElementById('homeView'),
  catalog: document.getElementById('catalogView'),
  cart: document.getElementById('cartView')
};

const popularProductsEl = document.getElementById('popularProducts');
const productsListEl = document.getElementById('productsList');
const cartItemsEl = document.getElementById('cartItems');
const totalPriceEl = document.getElementById('totalPrice');
const cartBadge = document.getElementById('cartBadge');

// Данные пользователя
let userData = null;

// Проверка регистрации при загрузке
function checkUserRegistration() {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    userData = JSON.parse(saved);
    showPage('home');
  } else {
    showPage('ageCheck');
  }
}

// Проверка возраста
document.getElementById('ageYes').addEventListener('click', () => {
  showPage('registration');
  tg.HapticFeedback.notificationOccurred('success');
});

document.getElementById('ageNo').addEventListener('click', () => {
  tg.showAlert('К сожалению, вы не можете использовать этот магазин', () => {
    tg.close();
  });
  tg.HapticFeedback.notificationOccurred('error');
});

// Регистрация
document.getElementById('completeRegistration').addEventListener('click', () => {
  const name = document.getElementById('userName').value.trim();
  const city = document.getElementById('userCity').value;
  const phone = document.getElementById('userPhone').value.trim();
  const agreed = document.getElementById('agreeTerms').checked;
  
  if (!name) {
    tg.showAlert('Пожалуйста, введите ваше имя');
    return;
  }
  
  if (!city) {
    tg.showAlert('Пожалуйста, выберите город доставки');
    return;
  }
  
  if (!agreed) {
    tg.showAlert('Необходимо согласиться с правилами магазина');
    return;
  }
  
  userData = {
    name,
    city,
    phone,
    registeredAt: new Date().toISOString()
  };
  
  localStorage.setItem(storageKey, JSON.stringify(userData));
  
  tg.showAlert(`Добро пожаловать, ${name}! 🎉`, () => {
    showPage('home');
  });
  
  tg.HapticFeedback.notificationOccurred('success');
});

// Навигация
function showPage(pageName) {
  Object.values(pages).forEach(page => page.classList.remove('active'));
  pages[pageName].classList.add('active');
  
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === pageName);
  });
  
  tg.HapticFeedback.impactOccurred('light');
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => showPage(btn.dataset.page));
});

document.getElementById('goToCatalog').addEventListener('click', () => {
  showPage('catalog');
});

// Фильтры
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderCatalog();
    tg.HapticFeedback.impactOccurred('light');
  });
});

// Отрисовка популярных товаров
function renderPopular() {
  const popular = products.filter(p => popularProductIds.includes(p.id));
  popularProductsEl.innerHTML = popular.map(product => `
    <div class="product-card" onclick="addToCart(${product.id})">
      <div class="product-image" style="background-image: url('${product.img}')">
        <div class="product-image-emoji">${product.emoji}</div>
      </div>
      <div class="product-brand">${product.brand}</div>
      <div class="product-name">${product.name}</div>
      <div class="product-price">${product.price} CHF</div>
      <button class="btn-add">В корзину</button>
    </div>
  `).join('');
}

// Отрисовка каталога
function renderCatalog() {
  const filtered = currentFilter === 'all' 
    ? products 
    : products.filter(p => p.brand.includes(currentFilter));
    
  productsListEl.innerHTML = filtered.map(product => `
    <div class="product-card" onclick="addToCart(${product.id})">
      <div class="product-image" style="background-image: url('${product.img}')">
        <div class="product-image-emoji">${product.emoji}</div>
      </div>
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
  const existing = cart.find(item => item.id === productId);
  
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  updateCart();
  tg.HapticFeedback.notificationOccurred('success');
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

// Обновить корзину
function updateCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalItems || '';
  
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">Корзина пуста</p>';
    totalPriceEl.textContent = '0';
    return;
  }
  
  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div>${item.emoji} ${item.name}</div>
        <div style="color: #999; font-size: 12px;">${item.brand}</div>
        <div style="color: #666; margin-top: 4px;">${item.price} CHF</div>
      </div>
      <div class="cart-item-controls">
        <button class="btn-qty" onclick="changeQuantity(${item.id}, -1)">−</button>
        <span style="min-width: 24px; text-align: center; font-weight: 600;">${item.quantity}</span>
        <button class="btn-qty" onclick="changeQuantity(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join('');
  
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalPriceEl.textContent = total;
}

// Оформление заказа
document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (cart.length === 0) return;
  
  const order = {
    items: cart,
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    userId: tg.initDataUnsafe?.user?.id,
    username: tg.initDataUnsafe?.user?.username,
    userData: userData
  };
  
  tg.sendData(JSON.stringify(order));
});

// Глобальные функции
window.addToCart = addToCart;
window.changeQuantity = changeQuantity;

// Инициализация
checkUserRegistration();
renderPopular();
renderCatalog();
updateCart();
