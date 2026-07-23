"""Chat message model for VinR Buddy conversations."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id = Column(
        String(255), ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    role = Column(
        String(20), nullable=False,  # "user" or "assistant"
    )
    content = Column(Text, nullable=False)
    audio_url = Column(Text, nullable=True)  # ElevenLabs TTS Data URI or URL
    persona = Column(String(50), nullable=True, default="hope")  # vinr, hope, sage, therapist, coach
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False,
    )
