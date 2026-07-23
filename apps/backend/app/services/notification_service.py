"""Notification Service — Expo Push Notifications delivery."""

import httpx
from app.core.config import get_settings

settings = get_settings()

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


async def send_push_notification(
    token: str,
    title: str,
    body: str,
    data: dict | None = None,
    channel_id: str = "streaks",
) -> bool:
    """
    Send a push notification via Expo Push Notifications service.

    Args:
        token: Expo push token (ExponentPushToken[xxx])
        title: Notification title
        body: Notification body text
        data: Optional data payload for deep linking
        channel_id: Android notification channel

    Returns:
        True if sent successfully
    """
    message = {
        "to": token,
        "title": title,
        "body": body,
        "sound": "default",
        "channelId": channel_id,
    }

    if data:
        message["data"] = data

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                EXPO_PUSH_URL,
                json=message,
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                timeout=10.0,
            )
            result = response.json()
            if response.status_code == 200 and result.get("data", {}).get("status") == "ok":
                return True
            else:
                print(f"Push notification failed: {result}")
                return False
    except Exception as e:
        print(f"Push notification error: {e}")
        return False


async def send_bulk_push_notifications(
    messages: list[dict],
) -> list[bool]:
    """
    Send multiple push notifications in a single request (Expo supports batching).

    Args:
        messages: List of dicts with keys: token, title, body, data, channel_id

    Returns:
        List of success booleans
    """
    expo_messages = []
    for msg in messages:
        expo_msg = {
            "to": msg["token"],
            "title": msg["title"],
            "body": msg["body"],
            "sound": "default",
            "channelId": msg.get("channel_id", "streaks"),
        }
        if msg.get("data"):
            expo_msg["data"] = msg["data"]
        expo_messages.append(expo_msg)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                EXPO_PUSH_URL,
                json=expo_messages,
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                timeout=30.0,
            )
            result = response.json()
            data = result.get("data", [])
            return [item.get("status") == "ok" for item in data]
    except Exception as e:
        print(f"Bulk push notification error: {e}")
        return [False] * len(messages)
