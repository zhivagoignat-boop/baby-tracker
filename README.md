# 🍼 Трекер малыша — Telegram Mini App

Полноценный трекер развития ребёнка для Telegram.

## Что умеет

- 💤 **Сон** с живым таймером
- 🍼 **Кормление** (грудь / бутылочка / смесь / прикорм)
- 🧷 **Подгузники** (быстрые кнопки)
- 💉 **Прививки** и **приёмы у врача**
- 📈 **Рост, вес, окружность головы**
- 🧠 **Вехи развития** по месяцам с галочками
- 🦷 **Зубы**
- 🧸 **Любимые игрушки**
- 🚶 **Прогулки** и 🛁 **купание**
- 🥄 **Прикорм** с реакцией
- 🤒 **Болезни**
- 🎵 **Стишки и песни** (стандартные + свои под каждое действие)
- ❓ **FAQ** по развитию
- 📊 **Статистика дня и недели** + рекомендации
- 📷 **Ежемесячные фото**
- 👶 Профиль ребёнка (имя, дата рождения, пол)

---

## Быстрый старт

### 1. Создай бота

1. Напиши [@BotFather](https://t.me/BotFather) → `/newbot`
2. Скопируй токен

### 2. Установи зависимости

```bash
cd baby-tracker
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Настрой .env

```bash
cp .env.example .env
```

Открой `.env` и вставь:

```
BOT_TOKEN=123456:ABC-...
WEBAPP_URL=https://xxxx.ngrok-free.app
DEV_MODE=0
```

### 4. Запусти ngrok (для HTTPS)

Telegram Mini Apps требуют HTTPS.

```bash
ngrok http 8000
```

Скопируй URL вида `https://xxxx.ngrok-free.app` → вставь в `.env` как `WEBAPP_URL`.

### 5. Запусти backend

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 6. Запусти бота (в другом терминале)

```bash
python -m bot.main
```

### 7. Открой бота в Telegram

Нажми **Start** → кнопку **«Открыть трекер»**.

---

## Структура проекта

```
baby-tracker/
├── backend/
│   ├── main.py          # FastAPI + все API
│   ├── models.py        # SQLAlchemy модели
│   ├── schemas.py       # Pydantic схемы
│   ├── auth.py          # Валидация Telegram initData
│   └── database.py
├── bot/
│   └── main.py          # aiogram 3 бот
├── frontend/
│   ├── index.html
│   └── static/app.js    # весь UI Mini App
├── requirements.txt
├── .env.example
└── README.md
```

---

## Локальная разработка без Telegram

Поставь в `.env`:

```
DEV_MODE=1
```

Тогда API будет принимать запросы без `X-Telegram-Init-Data` (пользователь id=1).

Открывай `http://localhost:8000` в браузере.

---

## Деплой (кратко)

1. Залей код на сервер / Railway / Render / VPS
2. Поставь `WEBAPP_URL` на свой домен
3. В BotFather → `/setmenubutton` или через код уже есть кнопка
4. Для продакшена лучше PostgreSQL вместо SQLite

---

## Дальнейшие улучшения (по желанию)

- Уведомления «ты давно не отмечал сон/кормление»
- Несколько детей с переключением
- Экспорт в PDF
- Графики роста
- Напоминания о прививках

---

Сделано с заботой о родителях 💛
