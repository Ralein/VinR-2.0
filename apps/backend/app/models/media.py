"""Media session model — tracks user listening history."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class MediaSession(Base):
    """Tracks when a user listens to audio or watches media."""
    __tablename__ = "media_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False, index=True)
    media_type = Column(String, nullable=False)  # sleep, breathing, meditation, affirmation, youtube
    media_id = Column(String, nullable=False)  # track ID or YouTube video ID
    duration_seconds = Column(Integer, nullable=True)  # how long they listened
    completed = Column(Boolean, default=False)  # did they finish?
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
