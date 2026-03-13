// Liquid Glass Navigation в стиле Telegram
class LiquidNavigation {
  constructor() {
    this.currentIndex = 0;
    this.pages = ['home', 'catalog', 'cart', 'profile']; // или 'admin' для админа
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.threshold = 50; // Минимальное расстояние для свайпа
    
    this.init();
  }
  
  init() {
    // Проверяем админа
    const tg = window.Telegram.WebApp;
    const currentUsername = tg.initDataUnsafe?.user?.username;
    const isAdmin = currentUsername === 'PepePuffManager';
    
    if (isAdmin) {
      this.pages = ['home', 'catalog', 'cart', 'admin'];
    }
    
    this.setupNavigation();
    this.attachSwipeEvents();
    this.attachLongPressEvents();
  }
  
  setupNavigation() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;
    
    // Добавляем liquid indicator
    const indicator = document.createElement('div');
    indicator.className = 'liquid-indicator';
    nav.appendChild(indicator);
    
    this.indicator = indicator;
    this.nav = nav;
    
    // Обновляем позицию индикатора при клике на кнопки
    const buttons = nav.querySelectorAll('.nav-btn');
    buttons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        this.currentIndex = index;
        this.updateIndicator(false);
      });
    });
    
    // Устанавливаем начальную позицию
    setTimeout(() => this.updateIndicator(false), 100);
  }
  
  attachSwipeEvents() {
    const container = document.querySelector('body');
    let startX = 0;
    let startY = 0;
    let moveX = 0;
    
    container.addEventListener('touchstart', (e) => {
      // Игнорируем если это pull-to-refresh или скролл
      if (window.scrollY > 50) return;
      
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      this.isDragging = false;
    }, { passive: true });
    
    container.addEventListener('touchmove', (e) => {
      if (!startX) return;
      
      moveX = e.touches[0].clientX;
      const moveY = e.touches[0].clientY;
      const diffX = moveX - startX;
      const diffY = moveY - startY;
      
      // Определяем горизонтальный свайп
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
        this.isDragging = true;
      }
    }, { passive: true });
    
    container.addEventListener('touchend', () => {
      if (!this.isDragging || !startX) {
        startX = 0;
        return;
      }
      
      const diffX = moveX - startX;
      
      if (Math.abs(diffX) > this.threshold) {
        if (diffX > 0 && this.currentIndex > 0) {
          // Свайп вправо - предыдущая страница
          this.currentIndex--;
          this.navigateToPage(this.currentIndex);
        } else if (diffX < 0 && this.currentIndex < this.pages.length - 1) {
          // Свайп влево - следующая страница
          this.currentIndex++;
          this.navigateToPage(this.currentIndex);
        }
      }
      
      startX = 0;
      moveX = 0;
      this.isDragging = false;
    });
  }
  
  attachLongPressEvents() {
    const buttons = this.nav.querySelectorAll('.nav-btn');
    let longPressTimer;
    let isDraggingNav = false;
    
    buttons.forEach((btn, index) => {
      btn.addEventListener('touchstart', () => {
        
        // Запускаем таймер для long press
        longPressTimer = setTimeout(() => {
          isDraggingNav = true;
          this.startNavDrag(index);
          window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }, 300);
      });
      
      btn.addEventListener('touchmove', (e) => {
        if (isDraggingNav) {
          e.preventDefault();
          this.handleNavDrag(e.touches[0].clientX);
        }
      });
      
      btn.addEventListener('touchend', () => {
        clearTimeout(longPressTimer);
        
        if (isDraggingNav) {
          this.endNavDrag();
          isDraggingNav = false;
        }
      });
      
      btn.addEventListener('touchcancel', () => {
        clearTimeout(longPressTimer);
        isDraggingNav = false;
      });
    });
  }
  
  startNavDrag(index) {
    this.nav.classList.add('dragging');
    this.currentIndex = index;
  }
  
  handleNavDrag(clientX) {
    const navRect = this.nav.getBoundingClientRect();
    const buttons = this.nav.querySelectorAll('.nav-btn');
    const buttonWidth = navRect.width / buttons.length;
    
    // Вычисляем индекс кнопки под пальцем
    const relativeX = clientX - navRect.left;
    const newIndex = Math.floor(relativeX / buttonWidth);
    
    if (newIndex >= 0 && newIndex < this.pages.length && newIndex !== this.currentIndex) {
      this.currentIndex = newIndex;
      this.updateIndicator(true);
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  }
  
  endNavDrag() {
    this.nav.classList.remove('dragging');
    this.navigateToPage(this.currentIndex);
    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
  }
  
  navigateToPage(index) {
    const pageName = this.pages[index];
    const btn = this.nav.querySelector(`[data-page="${pageName}"]`);
    
    if (btn) {
      btn.click();
      this.updateIndicator(true);
    }
  }
  
  updateIndicator(animate = true) {
    const buttons = this.nav.querySelectorAll('.nav-btn');
    const activeButton = buttons[this.currentIndex];
    
    if (!activeButton || !this.indicator) return;
    
    const navRect = this.nav.getBoundingClientRect();
    const btnRect = activeButton.getBoundingClientRect();
    
    const left = btnRect.left - navRect.left;
    const width = btnRect.width;
    
    if (animate) {
      this.indicator.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    } else {
      this.indicator.style.transition = 'none';
    }
    
    this.indicator.style.left = `${left}px`;
    this.indicator.style.width = `${width}px`;
    
    // Возвращаем transition обратно
    setTimeout(() => {
      this.indicator.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }, 50);
  }
}

// Инициализируем после загрузки
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => new LiquidNavigation(), 500);
  });
} else {
  setTimeout(() => new LiquidNavigation(), 500);
}
