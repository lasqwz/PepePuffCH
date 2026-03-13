# Установка ngrok на macOS

## Вариант 1: Через Homebrew (рекомендуется)

Если у вас не установлен Homebrew, сначала установите его:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Затем установите ngrok:
```bash
brew install ngrok/ngrok/ngrok
```

## Вариант 2: Ручная установка

1. Скачайте ngrok для macOS:
   - Перейдите на https://ngrok.com/download
   - Выберите macOS (Apple Silicon или Intel)
   - Скачайте zip файл

2. Распакуйте архив:
```bash
cd ~/Downloads
unzip ngrok-*.zip
```

3. Переместите в /usr/local/bin:
```bash
sudo mv ngrok /usr/local/bin/
```

4. Проверьте установку:
```bash
ngrok version
```

## Регистрация (опционально, но рекомендуется)

1. Зарегистрируйтесь на https://ngrok.com/
2. Получите authtoken
3. Настройте:
```bash
ngrok config add-authtoken ваш_токен
```

Это даст вам:
- Более длинные сессии
- Больше запросов в минуту
- Статистику использования

## Готово!

Теперь можете запустить бота:
```bash
./start.sh
```
