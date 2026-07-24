"""Journal Entry ORM model."""

import uuid
from datetime import datetime, date
from sqlalchemy import String, DateTime, Date, Text, Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id: Mapped[str] = mapped_column(
        String(255), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(255), ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    date: Mapped[date] = mapped_column(Date, default=date.today, index=True)

    # Gratitude items — array of strings
    gratitude_items: Mapped[list] = mapped_column(JSON, nullable=False, default=list)

    # Free reflection
    reflection_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Mood at time of entry (1-5)
    mood_at_entry: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # AI-generated response
    ai_response: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    # Relationships
    user = relationship("User", back_populates="journal_entries")
