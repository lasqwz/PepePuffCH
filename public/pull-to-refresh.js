// Pull to Refresh с лягушкой Pepe
class PullToRefresh {
  constructor() {
    this.startY = 0;
    this.currentY = 0;
    this.isDragging = false;
    this.threshold = 80; // Порог для обновления
    this.maxPull = 120; // Максимальное расстояние
    
    this.init();
  }
  
  init() {
    // Создаем элемент для pull-to-refresh
    const refreshContainer = document.createElement('div');
    refreshContainer.className = 'pull-to-refresh';
    refreshContainer.style.willChange = 'transform';
    refreshContainer.innerHTML = `
      <div class="pull-to-refresh-content">
        <dotlottie-player 
          src="images/icons/жабкадляпользователей.lottie" 
          background="transparent" 
          speed="1" 
          style="width: 60px; height: 60px;"
          class="pull-refresh-frog">
        </dotlottie-player>
        <div class="pull-refresh-text">Потяните для обновления</div>
      </div>
    `;
    
    document.body.insertBefore(refreshContainer, document.body.firstChild);
    
    this.refreshContainer = refreshContainer;
    this.frog = refreshContainer.querySelector('.pull-refresh-frog');
    this.text = refreshContainer.querySelector('.pull-refresh-text');
    
    // Получаем основной контент для движения
    this.mainContent = document.querySelector('body');
    
    this.attachEvents();
  }
  
  attachEvents() {
    let startY = 0;
    let currentY = 0;
    let watching = false;
    let touchMoveHandler = null;
    
    document.addEventListener('touchstart', (e) => {
      // Проверяем что скролл в самом верху
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        watching = true;
      }
    }, { passive: true });
    
    // Conditionally register non-passive touchmove
    touchMoveHandler = (e) => {
      if (!watching && !this.isDragging) return;
      
      currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      
      if (diff > 10) {
        // Set isDragging only after 10px threshold
        if (!this.isDragging) {
          this.isDragging = true;
        }
        
        // Предотвращаем стандартный скролл
        e.preventDefault();
        
        const pullDistance = Math.min(diff, this.maxPull);
        const progress = pullDistance / this.threshold;
        
        this.updateUI(pullDistance, progress);
      }
    };
    
    document.addEventListener('touchmove', touchMoveHandler, { passive: false });
    
    document.addEventListener('touchend', (e) => {
      if (!watching && !this.isDragging) return;
      
      const diff = currentY - startY;
      
      if (diff >= this.threshold) {
        this.triggerRefresh();
      } else {
        this.reset();
      }
      
      this.isDragging = false;
      watching = false;
      startY = 0;
      currentY = 0;
    });
  }
  
  updateUI(distance, progress) {
    // Двигаем контейнер с лягушкой вниз
    this.refreshContainer.style.transform = `translateY(${distance}px)`;
    this.refreshContainer.style.opacity = Math.min(progress, 1);
    
    // Двигаем весь контент страницы вниз (как в Snapchat)
    const pages = document.querySelectorAll('.page');
    const nav = document.querySelector('.bottom-nav');
    
    pages.forEach(page => {
      page.style.transform = `translateY(${distance}px)`;
      page.style.transition = 'none';
    });
    
    if (nav) {
      nav.style.transform = `translateY(${distance}px)`;
      nav.style.transition = 'none';
    }
    
    // Вращаем лягушку
    const rotation = progress * 360;
    this.frog.style.transform = `rotate(${rotation}deg) scale(${0.5 + progress * 0.5})`;
    
    // Меняем текст
    if (progress >= 1) {
      this.text.textContent = 'Отпустите для обновления';
      this.refreshContainer.classList.add('ready');
    } else {
      this.text.textContent = 'Потяните для обновления';
      this.refreshContainer.classList.remove('ready');
    }
  }
  
  async triggerRefresh() {
    this.refreshContainer.classList.add('refreshing');
    this.text.textContent = 'Обновление...';
    
    // Запускаем анимацию лягушки
    if (this.frog.play) {
      this.frog.play();
    }
    
    try {
      // Сохраняем текущую страницу
      const currentPage = document.querySelector('.page.active');
      if (currentPage) {
        localStorage.setItem('lastActivePage', currentPage.id.replace('View', ''));
      }
      
      // Перезагружаем страницу
      await new Promise(resolve => setTimeout(resolve, 800));
      window.location.reload();
    } catch (error) {
      console.error('Refresh error:', error);
      this.reset();
    }
  }
  
  reset() {
    // Возвращаем контейнер с лягушкой
    this.refreshContainer.style.transform = 'translateY(0)';
    this.refreshContainer.style.opacity = '0';
    this.refreshContainer.classList.remove('ready', 'refreshing');
    this.frog.style.transform = 'rotate(0deg) scale(0.5)';
    this.text.textContent = 'Потяните для обновления';
    
    // Возвращаем контент страницы
    const pages = document.querySelectorAll('.page');
    const nav = document.querySelector('.bottom-nav');
    
    pages.forEach(page => {
      page.style.transform = 'translateY(0)';
      page.style.transition = 'transform 0.3s ease';
    });
    
    if (nav) {
      nav.style.transform = 'translateY(0)';
      nav.style.transition = 'transform 0.3s ease';
    }
    
    // Убираем transition после анимации
    setTimeout(() => {
      pages.forEach(page => {
        page.style.transition = '';
      });
      if (nav) {
        nav.style.transition = '';
      }
    }, 300);
  }
}

// Инициализируем после загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PullToRefresh();
  });
} else {
  new PullToRefresh();
}
