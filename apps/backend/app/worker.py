"""Celery worker — Background tasks and scheduler."""

from celery import Celery
from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "vinr_tasks",
    broker=settings.CELERY_BROKER_URL,
    include=["app.services.notification_scheduler"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
)

# Optional: Periodic tasks (Beat) configuration
# celery_app.conf.beat_schedule = {
#     "check-streaks-daily": {
#         "task": "app.services.notification_scheduler.check_daily_streaks",
#         "schedule": 3600.0, # Run hourly
#     },
# }
