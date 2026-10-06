# Stashly 🚀

<div align="center">

**Сучасний, швидкий та приватний менеджер закладок із деревом тегів, автоматичним скрапінгом метаданих, REST API та Telegram-ботом.**

[![Next.js](https://img.shields.io/badge/Next.js-15%2B%20App%20Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Cloudflare](https://img.shields.io/badge/Deploy-Cloudflare%20Edge%20%2F%20D1-orange?style=flat-square&logo=cloudflare)](https://cloudflare.com/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=flat-square&logo=clerk)](https://clerk.com/)
[![License](https://img.shields.io/badge/License-ISC-green?style=flat-square)](LICENSE)

</div>

---

## ✨ Основні можливості

- ⚡ **Швидкість та продуктивність**: Next.js App Router із повноцінною SPA-гідрацією (MobX, TanStack Table, Radix UI).
- 🏷️ **Деревоподібні теги (Вкладені категорії)**: Необмежена вкладеність, кастомні кольорові палітри, закріплені категорії.
- 🤖 **Telegram-бот інтеграція**:
  - Збереження посилань у 1 клік з мобільного телефону або десктопа.
  - Автоматичне створення тегів із хештегів (#tech, #news) та нотаток.
  - Пошук закладок прямо у чаті (`/search <запит>`).
  - Сповіщення в Telegram при додаванні закладок через веб-інтерфейс.
- 🔍 **Миттєвий повнотекстовий пошук**: Пошук за назвою, URL, коментарями, доменом чи тегами з гарячими клавішами.
- 🖼️ **Автоматичний парсер метаданих (Scraper)**: Завантаження заголовків, описів, Favicon та OpenGraph прев'ю без сторонніх платних сервісів.
- 📱 **PWA & Browser Bookmarklet**: Можливість встановлення як автономного додатку на iOS, Android, macOS та Windows.
- 🌐 **Публічний шеринг категорій**: Генерація безпечних посилань на публічні добірки (`/share/[id]`) з імпортом в 1 клік.
- 🔑 **Публічний REST API (v1)**: Персональні API-токени (`st__...`) для автоматизацій, скриптів та браузерних розширень.
- 📦 **Імпорт та експорт без обмежень**: Повний імпорт з браузерів (HTML) та експорт у **HTML**, **JSON**, **CSV**.
- 🌓 **Сучасний адаптивний UI**: Світла, темна та системна теми з плавною анімацією.

---

## 🛠️ Швидкий старт (Local Development)

### 1. Клонування репозиторію:
```bash
git clone https://github.com/ihornone/stashly.git
cd stashly
```

### 2. Встановлення залежностей:
```bash
npm install
```

### 3. Налаштування змінних оточення:
Створіть файл `.env.local` на основі шаблону:
```bash
cp .env.example .env.local
```

Відкрийте `.env.local` та заповніть ваші ключі:
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Ключі Clerk (https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# (Опціонально) Telegram Бот (https://t.me/BotFather)
TELEGRAM_BOT_TOKEN="1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ"
TELEGRAM_BOT_USERNAME="StashlyAppBot"
TELEGRAM_WEBHOOK_SECRET="your_webhook_secret"
```

### 4. Запуск локального сервера розробки:
```bash
npm run dev
```
Відкрийте [http://localhost:3000](http://localhost:3000) у браузері.

> 💡 **Примітка:** Для локальної розробки локальна база даних SQLite (`better-sqlite3`) ініціалізується та мігрується автоматично у директорію `./storage/database.sqlite`.

---

## 🤖 Налаштування Telegram-бота

1. Створіть нового бота через [@BotFather](https://t.me/BotFather) у Telegram та отримайте токен.
2. Вкажіть `TELEGRAM_BOT_TOKEN` та `TELEGRAM_BOT_USERNAME` у файлі змінних оточення.
3. Після публікації додатку налаштуйте Webhook:
```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://your-domain.com/api/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```
4. Увійдіть у Stashly, відкрийте **Налаштування ⚙️ ➔ Telegram Бот** та натисніть **«Підключити Telegram-бота»**.

---

## 🚀 Деплой у Продакшн

### Варіант А: Cloudflare Pages / Workers (Edge Runtime)
Проєкт оптимізований під роботу з Cloudflare D1 та OpenNext:
```bash
# Збірка під Cloudflare
npm run cloudflare:build

# Попередній перегляд
npm run cloudflare:preview

# Розгортання у Cloudflare Workers
npm run cloudflare:deploy
```

### Варіант Б: Vercel / Node.js Сервер
```bash
# Збірка додатку
npm run build

# Запуск продакшн сервера
npm run start
```

---

## 🔒 Безпека та Конфіденційність
- Усі персональні закладки та структура тегів захищені автентифікацією.
- Вбудований захист SSRF у парсері посилань (блокування локальних IP, intranet та метаданих хмарних провайдерів).
- Жодних секретних ключів у репозиторії — конфігурація виключно через безпечні змінні середовища.

---

## 📄 Ліцензія
Розповсюджується під ліцензією [ISC](LICENSE).
Розроблено [Ihor Pelykh](https://github.com/ihornone).
