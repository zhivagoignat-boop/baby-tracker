import asyncio
import os
from dotenv import load_dotenv

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, WebAppInfo, KeyboardButton, ReplyKeyboardMarkup, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://example.com")

if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN не задан в .env")

bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher()


def get_main_keyboard():
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="🍼 Открыть трекер", web_app=WebAppInfo(url=WEBAPP_URL))],
            [KeyboardButton(text="📊 Статистика"), KeyboardButton(text="ℹ️ Помощь")],
        ],
        resize_keyboard=True
    )


@dp.message(CommandStart())
async def cmd_start(message: Message):
    await message.answer(
        f"Привет, {message.from_user.first_name}! 👋\n\n"
        "Я — трекер развития малыша.\n"
        "Здесь можно отмечать сон, кормления, прививки, навыки, "
        "стишки, рост и многое другое.\n\n"
        "Нажми кнопку ниже, чтобы открыть приложение 👇",
        reply_markup=get_main_keyboard()
    )


@dp.message(Command("help"))
@dp.message(F.text == "ℹ️ Помощь")
async def cmd_help(message: Message):
    await message.answer(
        "<b>Что умеет трекер:</b>\n\n"
        "• 💤 Сон с таймером\n"
        "• 🍼 Кормление\n"
        "• 🧷 Смена подгузников\n"
        "• 💉 Прививки и приёмы врача\n"
        "• 📈 Рост, вес, зубы\n"
        "• 🧠 Вехи развития по месяцам\n"
        "• 🎵 Стишки и песенки (можно добавлять свои)\n"
        "• 🚶 Прогулки и купание\n"
        "• 🥄 Прикорм\n"
        "• 📊 Статистика дня и недели + рекомендации\n"
        "• 📷 Ежемесячные фото\n\n"
        "Просто открой приложение и начни отмечать!",
        reply_markup=get_main_keyboard()
    )


@dp.message(F.text == "📊 Статистика")
async def cmd_stats(message: Message):
    await message.answer(
        "Открой приложение и зайди в раздел «Статистика» — "
        "там будет подробный отчёт за день и неделю с рекомендациями 📊",
        reply_markup=get_main_keyboard()
    )


@dp.message(F.web_app_data)
async def web_app_data(message: Message):
    # Если Mini App отправляет данные через sendData
    data = message.web_app_data.data
    await message.answer(f"Получены данные из приложения: {data}")


async def main():
    print("Бот запущен...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
