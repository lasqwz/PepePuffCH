const tg = window.Telegram.WebApp;

// Получаем цвета темы Telegram
const themeParams = tg.themeParams;
const bgColor = themeParams.bg_color || '#ffffff';
const textColor = themeParams.text_color || '#000000';
const buttonColor = themeParams.button_color || '#0088cc';
const buttonTextColor = themeParams.button_text_color || '#ffffff';
const secondaryBgColor = themeParams.secondary_bg_color || '#f0f0f0';
const hintColor = themeParams.hint_color || '#999999';
const linkColor = themeParams.link_color || '#0088cc';

// Применяем цвета темы к CSS переменным
document.documentElement.style.setProperty('--tg-bg-color', bgColor);
document.documentElement.style.setProperty('--tg-text-color', textColor);
document.documentElement.style.setProperty('--tg-button-color', buttonColor);
document.documentElement.style.setProperty('--tg-button-text-color', buttonTextColor);
document.documentElement.style.setProperty('--tg-secondary-bg-color', secondaryBgColor);
document.documentElement.style.setProperty('--tg-hint-color', hintColor);
document.documentElement.style.setProperty('--tg-link-color', linkColor);

// Расширяем на весь экран
tg.expand();
tg.enableClosingConfirmation();
tg.setHeaderColor(buttonColor);
tg.setBackgroundColor(bgColor);

// Скрываем кнопку "назад" если есть
if (tg.BackButton) {
  tg.BackButton.hide();
}

// Проверка регистрации пользователя
const userId = tg.initDataUnsafe?.user?.id;
const storageKey = `user_${userId}`;
const storageVersion = 'v5'; // Версия для сброса старых данных

// ПРОВЕРЯЕМ АДМИНА СРАЗУ
const currentUsername = tg.initDataUnsafe?.user?.username;
const isCurrentAdmin = currentUsername === 'PepePuffManager';

console.log('Current username:', currentUsername, 'Is admin:', isCurrentAdmin);

// ПРИНУДИТЕЛЬНАЯ ОЧИСТКА СТАРЫХ ДАННЫХ (кроме админа)
if (localStorage.getItem(`${storageKey}_version`) !== storageVersion) {
  if (!isCurrentAdmin) {
    console.log('Clearing localStorage for non-admin user');
    localStorage.clear();
    localStorage.setItem(`${storageKey}_version`, storageVersion);
  } else {
    console.log('Admin detected, skipping localStorage clear');
    // Для админа только обновляем версию, не очищаем данные
    localStorage.setItem(`${storageKey}_version`, storageVersion);
  }
}

// Товары загружаются из products-data.js
const products = [...elfliqProducts, ...elfliqExclusive, ...vozolProducts];
const popularProductIds = [1, 7, 13, 24, 49, 71];

let cart = [];
let currentFilter = 'all';
let userData = null;
let cartBadge, cartItemsEl, totalPriceEl; // Глобальные ссылки на элементы

// Глобальная функция обновления корзины
window.updateCart = function() {
  if (!cartBadge || !cartItemsEl || !totalPriceEl) return;
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalItems || '';
  
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--tg-hint-color);">Корзина пуста</p>';
    totalPriceEl.textContent = '0';
    return;
  }
  
  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div>${item.emoji} ${item.name}</div>
        <div style="color: var(--tg-hint-color); font-size: 12px;">${item.brand}</div>
        <div style="color: var(--tg-text-color); margin-top: 4px;">${item.price} CHF</div>
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

// Глобальная функция для оформления заказа (вызывается из HTML)
window.handleCheckout = function() {
  tg.HapticFeedback.impactOccurred('medium');
  
  console.log('=== CHECKOUT STARTED ===');
  
  if (cart.length === 0) {
    console.log('Cart is empty');
    tg.showAlert('Корзина пуста');
    return;
  }
  
  if (!userData) {
    console.log('User data not found');
    tg.showAlert('Ошибка: данные пользователя не найдены. Пожалуйста, перезапустите приложение.');
    return;
  }
  
  console.log('User data:', userData);
  console.log('Cart:', cart);
  
  // Показываем индикатор загрузки
  const checkoutBtn = document.getElementById('checkoutBtn');
  const originalText = checkoutBtn ? checkoutBtn.textContent : '';
  if (checkoutBtn) {
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Обработка...';
  }
  
  const order = {
    items: [...cart], // Копируем массив
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    userId: tg.initDataUnsafe?.user?.id,
    username: tg.initDataUnsafe?.user?.username,
    userData: userData
  };
  
  console.log('Order object:', order);
  
  // Показываем подтверждение
  tg.showConfirm(
    `Оформить заказ на сумму ${order.total} CHF?`,
    (confirmed) => {
      if (confirmed) {
        console.log('Order confirmed, sending to server...');
        // Отправляем заказ через API с обработкой ошибок
        fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        })
        .then(async res => {
          console.log('Response status:', res.status);
          const data = await res.json();
          console.log('Response data:', data);
          
          if (!res.ok) {
            throw new Error(data.error || `Server error: ${res.status}`);
          }
          
          if (!data.success) {
            throw new Error(data.error || 'Unknown error occurred');
          }
          
          return data;
        })
        .then(data => {
          console.log('Order successful:', data);
          // Очищаем корзину только после успешного ответа
          cart = [];
          updateCart();
          
          tg.HapticFeedback.notificationOccurred('success');
          tg.showAlert(`Заказ #${data.orderId} успешно оформлен! Скоро с вами свяжемся 🎉`, () => {
            showPage('home');
          });
        })
        .catch(error => {
          console.error('=== ORDER ERROR ===');
          console.error('Error:', error);
          console.error('Error message:', error.message);
          tg.HapticFeedback.notificationOccurred('error');
          
          // Показываем пользователю понятное сообщение об ошибке
          let errorMessage = 'Произошла ошибка при оформлении заказа. ';
          
          if (error.message.includes('rate limit')) {
            errorMessage += 'Слишком много запросов. Попробуйте позже.';
          } else if (error.message.includes('validation')) {
            errorMessage += 'Проверьте правильность введенных данных.';
          } else if (error.message.includes('network')) {
            errorMessage += 'Проблемы с соединением. Проверьте интернет.';
          } else {
            errorMessage += 'Попробуйте еще раз или обратитесь в поддержку.';
          }
          
          tg.showAlert(errorMessage);
        })
        .finally(() => {
          console.log('Checkout process finished');
          // Восстанавливаем кнопку
          if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = originalText;
          }
        });
      } else {
        console.log('Order cancelled by user');
        // Восстанавливаем кнопку если отменили
        if (checkoutBtn) {
          checkoutBtn.disabled = false;
          checkoutBtn.textContent = originalText;
        }
      }
    }
  );
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  // Элементы
  const pages = {
    ageCheck: document.getElementById('ageCheckView'),
    registration: document.getElementById('registrationView'),
    home: document.getElementById('homeView'),
    catalog: document.getElementById('catalogView'),
    cart: document.getElementById('cartView'),
    profile: document.getElementById('profileView'),
    admin: document.getElementById('adminView')
  };

  const popularProductsEl = document.getElementById('popularProducts');
  const productsListEl = document.getElementById('productsList');
  cartItemsEl = document.getElementById('cartItems');
  totalPriceEl = document.getElementById('totalPrice');
  cartBadge = document.getElementById('cartBadge');

  // Проверка - это админ?
  const currentUsername = tg.initDataUnsafe?.user?.username;
  const isAdmin = currentUsername === 'PepePuffManager';
  
  console.log('Username:', currentUsername, 'isAdmin:', isAdmin);
  
  // Показываем админскую вкладку если это админ, скрываем профиль
  const adminBtn = document.querySelector('.nav-btn.admin-only');
  const profileBtn = document.querySelector('.nav-btn.user-only');
  
  if (isAdmin) {
    if (adminBtn) adminBtn.style.display = 'flex';
    if (profileBtn) profileBtn.style.display = 'none';
  } else {
    if (adminBtn) adminBtn.style.display = 'none';
    if (profileBtn) profileBtn.style.display = 'flex';
  }

  // Проверка регистрации при загрузке
  function checkUserRegistration() {
    const saved = localStorage.getItem(storageKey);
    const savedVersion = localStorage.getItem(`${storageKey}_version`);
    const bottomNav = document.querySelector('.bottom-nav');
    const user = tg.initDataUnsafe?.user;
    
    // АДМИН ВСЕГДА ПРОПУСКАЕТ РЕГИСТРАЦИЮ
    if (isCurrentAdmin) {
      console.log('Admin detected - skipping registration');
      
      // Создаем минимальные данные для админа если их нет
      if (!saved) {
        userData = {
          name: user?.first_name || 'Admin',
          telegramUsername: currentUsername,
          city: 'Basel-Stadt',
          phone: '+41000000000',
          photoUrl: user?.photo_url || null,
          registeredAt: new Date().toISOString()
        };
        localStorage.setItem(storageKey, JSON.stringify(userData));
      } else {
        userData = JSON.parse(saved);
      }
      
      // Обновляем версию для админа
      localStorage.setItem(`${storageKey}_version`, storageVersion);
      
      document.body.classList.remove('onboarding');
      bottomNav.classList.add('visible');
      showPage('home');
      return;
    }
    
    // Если версия не совпадает, сбрасываем данные (только для не-админов)
    if (saved && savedVersion !== storageVersion) {
      localStorage.removeItem(storageKey);
      localStorage.setItem(`${storageKey}_version`, storageVersion);
      checkUserRegistration();
      return;
    }
    
    if (saved) {
      userData = JSON.parse(saved);
      
      // Проверяем корректность телефона
      const phone = userData.phone || '';
      const phoneDigits = phone.replace(/[^\d]/g, '');
      
      // Если телефон некорректный, сбрасываем регистрацию
      if (phoneDigits.length < 9) {
        localStorage.removeItem(storageKey);
        tg.showAlert('Необходимо указать корректный номер телефона для регистрации');
        checkUserRegistration();
        return;
      }
      
      // Обновляем данные пользователя из Telegram при каждом входе
      if (user) {
        const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
        userData.name = fullName || userData.name;
        userData.telegramUsername = user.username || userData.telegramUsername || '';
        userData.photoUrl = user.photo_url || userData.photoUrl || null;
        
        // Сохраняем обновленные данные
        localStorage.setItem(storageKey, JSON.stringify(userData));
        
        // Обновляем в базе данных
        fetch('/api/user/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegram_id: String(userId),
            telegram_username: userData.telegramUsername,
            name: userData.name,
            city: userData.city,
            phone: userData.phone,
            photo_url: userData.photoUrl
          })
        }).catch(err => console.error('Error updating user:', err));
      }
      
      document.body.classList.remove('onboarding');
      bottomNav.classList.add('visible');
      showPage('home');
    } else {
      // Переходим сразу к регистрации (данные заполнятся автоматически)
      localStorage.setItem(`${storageKey}_version`, storageVersion);
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
    const user = tg.initDataUnsafe?.user;
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ');
    const telegramUsername = user?.username || '';
    const city = document.getElementById('userCity').value;
    const phone = document.getElementById('userPhone').value.trim();
    const agreed = document.getElementById('agreeTerms').checked;
    
    if (!city) {
      tg.showAlert('Пожалуйста, выберите город доставки');
      return;
    }
    
    if (!phone) {
      tg.showAlert('Пожалуйста, укажите номер телефона');
      return;
    }
    
    // Проверка что телефон содержит цифры
    const phoneDigits = phone.replace(/[^\d]/g, '');
    if (phoneDigits.length < 9) {
      tg.showAlert('Пожалуйста, укажите корректный номер телефона (минимум 9 цифр)');
      return;
    }
    
    if (!agreed) {
      tg.showAlert('Необходимо согласиться с правилами магазина');
      return;
    }
    
    userData = {
      name: fullName || 'Пользователь',
      telegramUsername,
      city,
      phone,
      photoUrl: user?.photo_url || null,
      registeredAt: new Date().toISOString()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(userData));
    
    tg.showAlert(`Добро пожаловать, ${userData.name}! 🎉`, () => {
      document.body.classList.remove('onboarding');
      document.querySelector('.bottom-nav').classList.add('visible');
      showPage('home');
    });
    
    tg.HapticFeedback.notificationOccurred('success');
  });
  
  // Фильтр для поля телефона - только цифры и основные символы
  const phoneInput = document.getElementById('userPhone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      const value = e.target.value;
      // Разрешаем только цифры, +, -, пробелы и скобки
      const filtered = value.replace(/[^0-9+\-\s()]/g, '');
      e.target.value = filtered;
      
      // Дополнительная проверка - минимум 9 цифр
      const phoneDigits = filtered.replace(/[^\d]/g, '');
      const isValid = phoneDigits.length >= 9;
      
      // Визуальная обратная связь
      if (filtered && !isValid) {
        e.target.style.borderColor = '#ff6b6b';
      } else {
        e.target.style.borderColor = '';
      }
    });
  }

  // Навигация
  function showPage(pageName) {
    Object.values(pages).forEach(page => page.classList.remove('active'));
    pages[pageName].classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === pageName);
    });
    
    // Загружаем данные админки при открытии
    if (pageName === 'admin' && isAdmin) {
      if (window.loadAdminData) window.loadAdminData();
    }
    
    // Загружаем профиль при открытии
    if (pageName === 'profile') {
      loadProfile();
    }
    
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

  // Оформление заказа
  const checkoutButton = document.getElementById('checkoutBtn');
  if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
      tg.HapticFeedback.impactOccurred('medium');
      
      if (cart.length === 0) {
        tg.showAlert('Корзина пуста');
        return;
      }
      
      if (!userData) {
        tg.showAlert('Ошибка: данные пользователя не найдены. Пожалуйста, перезапустите приложение.');
        return;
      }
      
      const order = {
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        userId: tg.initDataUnsafe?.user?.id,
        username: tg.initDataUnsafe?.user?.username,
        userData: userData
      };
      
      try {
        tg.sendData(JSON.stringify(order));
        tg.HapticFeedback.notificationOccurred('success');
      } catch (error) {
        tg.showAlert('Ошибка при отправке заказа: ' + error.message);
      }
    });
  } else {
    // Если кнопка не найдена, показываем ошибку при загрузке страницы корзины
    setTimeout(() => {
      if (document.getElementById('cartView').classList.contains('active')) {
        tg.showAlert('Ошибка: кнопка оформления заказа не найдена');
      }
    }, 1000);
  }

  // Функции админ-панели
  window.loadAdminData = function() {
    loadAdminStats();
    loadAdminOrders();
    loadAdminProducts();
    loadAdminUsers();
  }

  // Переключение табов (только для админа)
  if (isAdmin) {
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tabName + 'Tab').classList.add('active');
        
        tg.HapticFeedback.impactOccurred('light');
      });
    });
  }

  // Инициализация
  checkUserRegistration();
  renderPopular();
  renderCatalog();
  updateCart();
  
  // Восстанавливаем последнюю активную страницу после обновления
  const lastActivePage = localStorage.getItem('lastActivePage');
  if (lastActivePage && lastActivePage !== 'ageCheck' && lastActivePage !== 'registration') {
    // Небольшая задержка чтобы дать время на инициализацию
    setTimeout(() => {
      const pageToShow = lastActivePage;
      // Проверяем что пользователь зарегистрирован
      if (userData || isCurrentAdmin) {
        showPage(pageToShow);
      }
      // Очищаем сохраненную страницу
      localStorage.removeItem('lastActivePage');
    }, 100);
  }
});

// Глобальные функции админ-панели (вне DOMContentLoaded)
window.loadAdminData = function() {
  loadAdminStats();
  loadAdminProducts();
  loadAdminOrders();
  loadAdminUsers();
}

window.loadAdminStats = function() {
  fetch('/admin/api/stats')
    .then(res => res.json())
    .then(data => {
      document.getElementById('adminTotalOrders').textContent = data.totalOrders || 0;
      document.getElementById('adminNewOrders').textContent = data.newOrders || 0;
      document.getElementById('adminRevenue').textContent = (data.totalRevenue || 0).toFixed(2) + ' CHF';
    })
    .catch(err => {
      console.error('Error loading stats:', err);
    });
}

window.loadAdminOrders = function() {
  fetch('/admin/api/orders')
    .then(res => res.json())
    .then(orders => {
      const container = document.getElementById('adminOrdersList');
      
      if (orders.length === 0) {
        container.innerHTML = '<div class="admin-empty">Заказов пока нет</div>';
        return;
      }
      
      container.innerHTML = orders.slice(0, 20).map(order => {
        const date = new Date(order.created_at).toLocaleDateString('ru-RU');
        return `
          <div class="admin-order-item" onclick="viewOrder(${order.id})" style="cursor: pointer;">
            <div class="admin-order-info">
              <div class="admin-order-id">#${order.id}</div>
              <div class="admin-order-user">@${order.telegram_username || 'unknown'} - ${order.user_name}</div>
              <div class="admin-order-date">${date}</div>
            </div>
            <div>
              <div class="admin-order-total">${order.total} CHF</div>
              <span class="admin-status ${order.status}">${order.status}</span>
            </div>
          </div>
        `;
      }).join('');
    })
    .catch(err => {
      console.error('Error loading orders:', err);
      document.getElementById('adminOrdersList').innerHTML = '<div class="admin-empty">Ошибка загрузки</div>';
    });
}

window.loadAdminUsers = function() {
  fetch('/admin/api/users')
    .then(res => res.json())
    .then(users => {
      const container = document.getElementById('adminUsersList');
      
      if (users.length === 0) {
        container.innerHTML = '<div class="admin-empty">Пользователей пока нет</div>';
        return;
      }
      
      container.innerHTML = users.slice(0, 10).map(user => {
        return `
          <div class="admin-user-item">
            <div class="admin-user-info">
              <div class="admin-user-name">@${user.telegram_username || 'unknown'} - ${user.name}</div>
              <div class="admin-user-city">${user.city} ${user.phone ? '• ' + user.phone : ''}</div>
            </div>
          </div>
        `;
      }).join('');
    })
    .catch(err => {
      console.error('Error loading users:', err);
      document.getElementById('adminUsersList').innerHTML = '<div class="admin-empty">Ошибка загрузки</div>';
    });
}

// Загрузка товаров в админке
window.loadAdminProducts = function() {
  // Загружаем товары из БД
  fetch('/admin/api/products')
    .then(res => res.json())
    .then(dbProducts => {
      // Если товаров нет в БД, синхронизируем из products-data.js
      if (dbProducts.length === 0) {
        return fetch('/admin/api/products/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products })
        })
        .then(() => fetch('/admin/api/products'))
        .then(res => res.json());
      }
      return dbProducts;
    })
    .then(dbProducts => {
      const container = document.getElementById('adminProductsList');
      
      if (dbProducts.length === 0) {
        container.innerHTML = '<div class="admin-empty">Товаров нет</div>';
        return;
      }
      
      container.innerHTML = dbProducts.map(product => {
        const inStock = product.in_stock === 1;
        return `
          <div class="admin-product-item" data-product-id="${product.id}">
            <div class="admin-product-emoji" style="background: ${escapeHtml(product.color)}">${product.emoji}</div>
            <div class="admin-product-info">
              <div class="admin-product-name">${escapeHtml(product.name)}</div>
              <div class="admin-product-brand">${escapeHtml(product.brand)}</div>
              <div class="admin-product-price">${product.price} CHF</div>
            </div>
            <div class="admin-product-actions">
              <div class="admin-stock-toggle">
                <span style="font-size: 11px; color: var(--tg-hint-color);">${inStock ? 'В наличии' : 'Нет в наличии'}</span>
                <div class="stock-switch ${inStock ? 'active' : ''}" onclick="toggleStock(${product.id}, ${!inStock})"></div>
              </div>
              <button class="admin-edit-btn" onclick="editProduct(${product.id})">Редактировать</button>
            </div>
          </div>
        `;
      }).join('');
      
      // Поиск товаров
      const searchInput = document.getElementById('productSearch');
      if (searchInput) {
        // Удаляем старые обработчики
        const newSearchInput = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newSearchInput, searchInput);
        
        newSearchInput.addEventListener('input', (e) => {
          const search = e.target.value.toLowerCase();
          document.querySelectorAll('.admin-product-item').forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(search) ? 'flex' : 'none';
          });
        });
      }
    })
    .catch(err => {
      console.error('Error loading products:', err);
      const container = document.getElementById('adminProductsList');
      if (container) {
        container.innerHTML = '<div class="admin-empty">Ошибка загрузки товаров</div>';
      }
    });
}

// Переключение наличия товара
window.toggleStock = function(productId, inStock) {
  fetch(`/admin/api/products/${productId}/stock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ in_stock: inStock })
  })
  .then(() => {
    loadAdminProducts();
    tg.HapticFeedback.notificationOccurred('success');
  })
  .catch(err => {
    console.error('Error updating stock:', err);
    tg.HapticFeedback.notificationOccurred('error');
  });
}

// Редактирование товара
window.editProduct = function(productId) {
  fetch('/admin/api/products')
    .then(res => res.json())
    .then(products => {
      const product = products.find(p => p.id === productId);
      if (!product) return;
      
      const modal = document.createElement('div');
      modal.className = 'admin-modal active';
      modal.innerHTML = `
        <div class="admin-modal-content">
          <div class="admin-modal-header">
            <h3 class="admin-modal-title">Редактировать товар</h3>
            <button class="admin-modal-close" onclick="this.closest('.admin-modal').remove()">×</button>
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">Название</label>
            <input type="text" class="admin-form-input" id="editName" value="${product.name}">
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">Цена (CHF)</label>
            <input type="number" class="admin-form-input" id="editPrice" value="${product.price}" step="0.01">
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">
              <input type="checkbox" id="editStock" ${product.in_stock ? 'checked' : ''}>
              В наличии
            </label>
          </div>
          <div class="admin-form-actions">
            <button class="admin-btn-secondary" onclick="this.closest('.admin-modal').remove()">Отмена</button>
            <button class="admin-btn-primary" onclick="saveProduct(${productId})">Сохранить</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      tg.HapticFeedback.impactOccurred('medium');
    });
}

// Сохранение изменений товара
window.saveProduct = function(productId) {
  const name = document.getElementById('editName').value;
  const price = parseFloat(document.getElementById('editPrice').value);
  const in_stock = document.getElementById('editStock').checked;
  
  console.log('Saving product:', { productId, name, price, in_stock });
  
  // Показываем что идет сохранение
  const saveBtn = document.querySelector('.admin-btn-primary');
  const originalText = saveBtn.textContent;
  saveBtn.disabled = true;
  saveBtn.textContent = 'Сохранение...';
  
  fetch(`/admin/api/products/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price, in_stock })
  })
  .then(async res => {
    const data = await res.json();
    console.log('Save response:', data);
    
    if (!res.ok) {
      throw new Error(data.error || `Ошибка сервера: ${res.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Не удалось сохранить товар');
    }
    
    return data;
  })
  .then((data) => {
    document.querySelector('.admin-modal').remove();
    tg.showAlert(`Товар обновлен! Изменено строк: ${data.changes || 1}`);
    
    // Перезагружаем товары
    setTimeout(() => {
      loadAdminProducts();
    }, 500);
    
    tg.HapticFeedback.notificationOccurred('success');
  })
  .catch(err => {
    console.error('Error saving product:', err);
    saveBtn.disabled = false;
    saveBtn.textContent = originalText;
    tg.showAlert(`Ошибка сохранения: ${err.message}`);
    tg.HapticFeedback.notificationOccurred('error');
  });
}

// Просмотр деталей заказа
window.viewOrder = function(orderId) {
  fetch(`/admin/api/orders/${orderId}`)
    .then(res => res.json())
    .then(order => {
      const modal = document.createElement('div');
      modal.className = 'admin-modal active';
      modal.innerHTML = `
        <div class="admin-modal-content">
          <div class="admin-modal-header">
            <h3 class="admin-modal-title">Заказ #${order.id}</h3>
            <button class="admin-modal-close" onclick="this.closest('.admin-modal').remove()">×</button>
          </div>
          <div class="admin-form-group">
            <strong>Клиент:</strong> ${order.user_name}<br>
            <strong>Telegram:</strong> @${order.telegram_username || 'unknown'}<br>
            <strong>Город:</strong> ${order.user_city}<br>
            ${order.user_phone ? `<strong>Телефон:</strong> ${order.user_phone}<br>` : ''}
            <strong>Дата:</strong> ${new Date(order.created_at).toLocaleString('ru-RU')}
          </div>
          <div class="order-detail-items">
            <strong>Товары:</strong>
            ${order.items.map(item => `
              <div class="order-detail-item">
                <div class="order-detail-item-name">${item.emoji} ${item.name}</div>
                <div class="order-detail-item-info">${item.quantity} × ${item.price} CHF = ${item.quantity * item.price} CHF</div>
              </div>
            `).join('')}
          </div>
          <div class="admin-form-group">
            <strong>Итого: ${order.total} CHF</strong>
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">Статус</label>
            <select class="admin-form-input" id="orderStatus">
              <option value="new" ${order.status === 'new' ? 'selected' : ''}>Новый</option>
              <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>В обработке</option>
              <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Выполнен</option>
              <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменен</option>
            </select>
          </div>
          <div class="admin-form-actions">
            <button class="admin-btn-secondary" onclick="this.closest('.admin-modal').remove()">Закрыть</button>
            <button class="admin-btn-primary" onclick="updateOrderStatusModal(${order.id})">Сохранить</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      tg.HapticFeedback.impactOccurred('medium');
    });
}

window.updateOrderStatusModal = function(orderId) {
  const status = document.getElementById('orderStatus').value;
  fetch(`/admin/api/orders/${orderId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  .then(() => {
    document.querySelector('.admin-modal').remove();
    // Перезагружаем все данные админки
    loadAdminStats();
    loadAdminOrders();
    tg.HapticFeedback.notificationOccurred('success');
  })
  .catch(err => {
    console.error('Error updating order status:', err);
    tg.HapticFeedback.notificationOccurred('error');
  });
}


// Функции профиля
function loadProfile() {
  const user = tg.initDataUnsafe?.user;
  
  // Отображаем данные пользователя напрямую из Telegram
  if (user) {
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
    document.getElementById('profileName').textContent = fullName || 'Пользователь';
    
    // Показываем username или ID если username нет
    if (user.username) {
      document.getElementById('profileUsername').textContent = '@' + user.username;
    } else {
      document.getElementById('profileUsername').textContent = 'ID: ' + user.id;
    }
    
    // Показываем фото профиля если есть
    const avatarEl = document.getElementById('profileAvatar');
    if (user.photo_url) {
      avatarEl.innerHTML = `<img src="${user.photo_url}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    } else {
      avatarEl.innerHTML = '<i class="fas fa-user"></i>';
    }
  }
  
  // Показываем город и телефон из сохраненных данных
  if (userData) {
    document.getElementById('profileCity').textContent = userData.city;
    document.getElementById('profilePhone').textContent = userData.phone || 'Не указан';
  }
  
  // Загружаем заказы пользователя
  loadUserOrders();
}

// Загружаем заказы пользователя
function loadUserOrders() {
  const telegramId = tg.initDataUnsafe?.user?.id;
  
  if (!telegramId) {
    console.error('No telegram ID available');
    document.getElementById('userOrdersList').innerHTML = '<div class="profile-empty">Ошибка получения данных пользователя</div>';
    return;
  }
  
  // Показываем индикатор загрузки
  const container = document.getElementById('userOrdersList');
  container.innerHTML = '<div class="profile-loading">Загрузка заказов...</div>';
  
  fetch(`/api/orders/user/${telegramId}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .then(orders => {
      if (orders.length === 0) {
        container.innerHTML = '<div class="profile-empty">У вас пока нет заказов</div>';
        return;
      }
      
      container.innerHTML = orders.map(order => {
        const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
        const date = new Date(order.created_at).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        
        const statusText = {
          'new': 'Новый',
          'processing': 'В обработке',
          'completed': 'Выполнен',
          'cancelled': 'Отменен'
        };
        
        return `
          <div class="user-order-item">
            <div class="user-order-header">
              <div class="user-order-id">Заказ #${order.id}</div>
              <div class="user-order-date">${date}</div>
            </div>
            <div class="user-order-items">
              ${items.map(item => `${item.emoji || '📦'} ${escapeHtml(item.name)} × ${item.quantity}`).join('<br>')}
            </div>
            <div class="user-order-footer">
              <div class="user-order-total">${order.total} CHF</div>
              <span class="user-order-status ${order.status}">${statusText[order.status] || order.status}</span>
            </div>
          </div>
        `;
      }).join('');
    })
    .catch(err => {
      console.error('Error loading user orders:', err);
      container.innerHTML = '<div class="profile-empty">Ошибка загрузки заказов. Попробуйте обновить страницу.</div>';
    });
}

// Функция для экранирования HTML (защита от XSS)
function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}


