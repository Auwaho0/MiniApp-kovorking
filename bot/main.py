import asyncio
import os

from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    WebAppInfo,
)

BOT_TOKEN = os.environ["BOT_TOKEN"]
MINI_APP_URL = os.environ["MINI_APP_URL"]

bot = Bot(BOT_TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def on_start(message: Message):
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Открыть Mini App", web_app=WebAppInfo(url=MINI_APP_URL)
                )
            ]
        ]
    )
    await message.answer(
        "Привет! 👋\n\n"
        "Запись на коворкинг и уведомления — внутри Mini App.\n"
        "Нажми кнопку ниже, чтобы открыть.",
        reply_markup=kb,
    )


async def main():
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())