import hmac
import hashlib
from urllib.parse import parse_qsl, unquote
from datetime import datetime, timedelta
from fastapi import Header, HTTPException, Depends
from typing import Optional
import os
import json

BOT_TOKEN = os.getenv("BOT_TOKEN", "")


def validate_init_data(init_data: str, bot_token: str, max_age_seconds: int = 86400) -> dict:
    """Validate Telegram WebApp initData and return parsed data."""
    if not init_data:
        raise HTTPException(status_code=401, detail="No initData provided")

    try:
        parsed = dict(parse_qsl(init_data, keep_blank_values=True))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid initData format")

    received_hash = parsed.pop("hash", None)
    if not received_hash:
        raise HTTPException(status_code=401, detail="No hash in initData")

    # Build data-check-string
    data_check_arr = [f"{k}={v}" for k, v in sorted(parsed.items())]
    data_check_string = "\n".join(data_check_arr)

    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(calculated_hash, received_hash):
        raise HTTPException(status_code=401, detail="Invalid initData hash")

    # Check auth_date
    auth_date = int(parsed.get("auth_date", 0))
    if datetime.utcnow().timestamp() - auth_date > max_age_seconds:
        raise HTTPException(status_code=401, detail="initData expired")

    # Parse user
    user_data = {}
    if "user" in parsed:
        try:
            user_data = json.loads(unquote(parsed["user"]))
        except Exception:
            pass

    return {
        "user": user_data,
        "auth_date": auth_date,
        "query_id": parsed.get("query_id"),
        "raw": parsed,
    }


async def get_current_user(x_telegram_init_data: Optional[str] = Header(None, alias="X-Telegram-Init-Data")):
    if not x_telegram_init_data:
        # Для локальной разработки можно пропустить (осторожно!)
        if os.getenv("DEV_MODE") == "1":
            return {"id": 1, "first_name": "Dev", "username": "dev"}
        raise HTTPException(status_code=401, detail="Missing X-Telegram-Init-Data header")

    data = validate_init_data(x_telegram_init_data, BOT_TOKEN)
    user = data.get("user")
    if not user or "id" not in user:
        raise HTTPException(status_code=401, detail="No user in initData")
    return user
