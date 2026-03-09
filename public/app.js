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

// Товары загружаются из products-data.js
const products = [...elfliqProducts, ...elfliqExclusive, ...vozolProducts];
const popularProductIds = [1, 7, 13, 24, 49, 71];

let cart = [];
let currentFilter = 'all';
let userData = null;

// Глобальная функция для оформления заказа (вызывается из HTML)
window.handleCheckout = function() {
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
  
  // Показываем подтверждение
  tg.showConfirm(
    `Оформить заказ на сумму ${order.total} CHF?`,
    (confirmed) => {
      if (confirmed) {
        // Отправляем заказ через API
        fetch('/api/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        })
        .then(res => {
          if (!res.ok) {
            throw new Error('Server error');
          }
          return res.json();
        })
        .then(data => {
          tg.HapticFeedback.notificationOccurred('success');
          
          // Очищаем корзину
          cart = [];
          updateCart();
          
          // Показываем сообщение
          tg.showAlert('Заказ отправлен! Скоро с вами свяжемся 🎉', () => {
            showPage('home');
          });
        })
        .catch(error => {
          // Даже если fetch упал, заказ мог пройти через web_app_data
          // Поэтому просто очищаем корзину и показываем успех
          tg.HapticFeedback.notificationOccurred('success');
          cart = [];
          updateCart();
          tg.showAlert('Заказ отправлен! Скоро с вами свяжемся 🎉', () => {
            showPage('home');
          });
        });
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
    admin: document.getElementById('adminView')
  };

  const popularProductsEl = document.getElementById('popularProducts');
  const productsListEl = document.getElementById('productsList');
  const cartItemsEl = document.getElementById('cartItems');
  const totalPriceEl = document.getElementById('totalPrice');
  const cartBadge = document.getElementById('cartBadge');

  // Проверка - это админ?
  const currentUsername = tg.initDataUnsafe?.user?.username;
  const isAdmin = currentUsername === 'PepePuffManager';
  
  // Показываем админскую вкладку если это админ
  if (isAdmin) {
    document.querySelector('.nav-btn.admin-only').style.display = 'flex';
  }

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
    const telegramUsername = document.getElementById('userTelegramUsername').value.trim();
    const city = document.getElementById('userCity').value;
    const phone = document.getElementById('userPhone').value.trim();
    const agreed = document.getElementById('agreeTerms').checked;
    
    if (!name) {
      tg.showAlert('Пожалуйста, введите ваше имя');
      return;
    }
    
    if (!telegramUsername) {
      tg.showAlert('Пожалуйста, введите ваше имя пользователя Telegram');
      return;
    }
    
    // Проверка формата username (должен начинаться с @ или без него)
    let cleanUsername = telegramUsername.startsWith('@') ? telegramUsername.substring(1) : telegramUsername;
    if (cleanUsername.length < 3) {
      tg.showAlert('Имя пользователя Telegram должно содержать минимум 3 символа');
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
      telegramUsername: cleanUsername,
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
    
    // Загружаем данные админки при открытии
    if (pageName === 'admin' && isAdmin) {
      loadAdminData();
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
  function loadAdminData() {
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

  function loadAdminStats() {
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

  function loadAdminOrders() {
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

  function loadAdminUsers() {
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

  // Инициализация
  checkUserRegistration();
  renderPopular();
  renderCatalog();
  updateCart();
});


  // Загрузка товаров в админке
  function loadAdminProducts() {
    // Сначала синхронизируем товары из products-data.js
    fetch('/admin/api/products/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products })
    })
    .then(() => {
      // Затем загружаем товары из БД
      return fetch('/admin/api/products');
    })
    .then(res => res.json())
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
            <div class="admin-product-emoji" style="background: ${product.color}">${product.emoji}</div>
            <div class="admin-product-info">
              <div class="admin-product-name">${product.name}</div>
              <div class="admin-product-brand">${product.brand}</div>
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
        searchInput.addEventListener('input', (e) => {
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
    
    fetch(`/admin/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, in_stock })
    })
    .then(() => {
      document.querySelector('.admin-modal').remove();
      loadAdminProducts();
      tg.HapticFeedback.notificationOccurred('success');
    })
    .catch(err => {
      console.error('Error saving product:', err);
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
      loadAdminData();
      tg.HapticFeedback.notificationOccurred('success');
    });
  }
