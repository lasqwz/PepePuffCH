const tg = window.Telegram.WebApp;

// Расширяем веб-приложение на весь экран
tg.expand();

// Получаем элементы
const nameInput = document.getElementById('nameInput');
const emailInput = document.getElementById('emailInput');
const sendBtn = document.getElementById('sendBtn');

// Обработчик отправки данных
sendBtn.addEventListener('click', () => {
  const data = {
    name: nameInput.value,
    email: emailInput.value,
    userId: tg.initDataUnsafe?.user?.id
  };

  // Отправляем данные боту
  tg.sendData(JSON.stringify(data));
});

// Включаем главную кнопку Telegram
tg.MainButton.text = 'Отправить данные';
tg.MainButton.show();

tg.MainButton.onClick(() => {
  sendBtn.click();
});
