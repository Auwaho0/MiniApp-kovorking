import httpx

from .config import settings

API = f"https://api.telegram.org/bot{settings.BOT_TOKEN}"


async def send_message(
    chat_id: int,
    text: str,
    button_text: str | None = None,
    button_url: str | None = None,
) -> bool:
    payload: dict = {"chat_id": chat_id, "text": text, "parse_mode": "HTML"}
    if button_text and button_url:
        payload["reply_markup"] = {
            "inline_keyboard": [[{"text": button_text, "url": button_url}]]
        }
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.post(f"{API}/sendMessage", json=payload)
        return r.json().get("ok", False)