const tg = window.Telegram.WebApp;
tg.expand();

// Товары
const products = [
  { id: 1, name: 'Жижа Яблоко', price: 500, emoji: '🍎' },
  { id: 2, name: 'Жижа Вишня', price: 550, emoji: '🍒' },
  { id: 3, name: 'Жижа Манго', price: 600, emoji: '🥭' },
  { id: 4, name: 'Жижа Мята', price: 500, emoji: '🌿' },
  { id: 5, name: 'Жижа Клубника', price: 550, emoji: '🍓' },
  { id: 6, name: 'Жижа Арбуз', price: 500, emoji: '🍉' }
];

let cart = [];

// Элементы
const catalogView = document.getElementById('catalogView');
const cartView = document.getElementById('cartView');
const productsList = document.getElementById('productsList');
const cartIcon = document.getElementById('cartIcon');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const totalPrice = document.getElementById('totalPrice');
const checkoutBtn = document.getElementById('checkoutBtn');
const backToShop = document.getElementById('backToShop');

// Отрисовка товаров
function renderProducts() {
  productsList.innerHTML = products.map(product => `
    <div class="product-card" onclick="addToCart(${product.id})">
      <div class="product-image">${product.emoji}</div>
      <div class="product-name">${product.name}</div>
      <div class="product-price">${product.price} ₽</div>
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
        <div style="color: #666;">${item.price} ₽</div>
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
cartIcon.addEventListener('click', () => {
  catalogView.classList.remove('active');
  cartView.classList.add('active');
});

backToShop.addEventListener('click', () => {
  cartView.classList.remove('active');
  catalogView.classList.add('active');
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
renderProducts();
updateCart();

// Глобальные функции для onclick
window.addToCart = addToCart;
window.changeQuantity = changeQuantity;
