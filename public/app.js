const tg = window.Telegram.WebApp;

// Расширяем на весь экран и скрываем шапку
tg.expand();
tg.enableClosingConfirmation();
tg.setHeaderColor('#0088cc');
tg.setBackgroundColor('#ffffff');

// Скрываем кнопку "назад" если есть
if (tg.BackButton) {
  tg.BackButton.hide();
}

// Проверка регистрации пользователя
const userId = tg.initDataUnsafe?.user?.id;
const storageKey = `user_${userId}`;

// Товары загружаются из products-data.js
const products = [...elfliqProducts, ...elfliqExclusive, ...vozolProducts];
const popularProductIds = [1, 7, 13, 24, 49, 71];

let cart = [];
let currentFilter = 'all';
let userData = null;

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
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

  // Проверка регистрации при загрузке
  function checkUserRegistration() {
    const saved = localStorage.getItem(storageKey);
    const bottomNav = document.querySelector('.bottom-nav');
    
    if (saved) {
      userData = JSON.parse(saved);
      document.body.classList.remove('onboarding');
      bottomNav.classList.add('visible');
      showPage('home');
    } else {
      document.body.classList.add('onboarding');
      bottomNav.classList.remove('visible');
      showPage('ageCheck');
    }
  }

  // Проверка возраста
  document.getElementById('ageYes').addEventListener('click', () => {
    document.body.classList.add('onboarding');
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
      document.body.classList.remove('onboarding');
      document.querySelector('.bottom-nav').classList.add('visible');
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
        <div class="product-image" style="background: ${product.color}">
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
        <div class="product-image" style="background: ${product.color}">
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
  window.addToCart = function(productId) {
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
  window.changeQuantity = function(productId, delta) {
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

  // Инициализация
  checkUserRegistration();
  renderPopular();
  renderCatalog();
  updateCart();
});
