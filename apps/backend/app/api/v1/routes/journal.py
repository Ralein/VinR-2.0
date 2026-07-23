"""Journal routes — gratitude journal CRUD with AI reflections."""

from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, extract, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.journal import JournalEntry
from app.models.user import User
from app.schemas.journal import (
    JournalEntryCreate,
    JournalEntryResponse,
    JournalCalendarResponse,
    WeeklyInsightResponse,
)
from app.services.journal_service import generate_journal_reflection, generate_weekly_insight

router = APIRouter(prefix="/journal", tags=["journal"])


@router.post("", response_model=JournalEntryResponse)
async def create_journal_entry(
    request: JournalEntryCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new journal entry and get AI reflection."""
    user_id = current_user["sub"]

    # Get user name for personalized AI response
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    user_name = user.name if user else None

    # Generate AI reflection
    ai_response = await generate_journal_reflection(
        gratitude_items=request.gratitude_items,
        reflection_text=request.reflection_text,
        mood_at_entry=request.mood_at_entry,
        user_name=user_name,
    )

    # Create entry
    entry = JournalEntry(
        user_id=user_id,
        date=date.today(),
        gratitude_items=request.gratitude_items,
        reflection_text=request.reflection_text,
        mood_at_entry=request.mood_at_entry,
        ai_response=ai_response,
    )
    db.add(entry)
    await db.flush()
    await db.refresh(entry)

    # Update streaks (Journal counts towards Global Streak)
    from app.services.unified_streak_service import update_user_streak
    await update_user_streak(db, user_id, activity_type="journal")

    return entry


@router.get("", response_model=list[JournalEntryResponse])
async def get_journal_entries(
    month: str = Query(
        ..., pattern=r"^\d{4}-\d{2}$",
        description="Month in YYYY-MM format"
    ),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get journal entries for a specific month."""
    user_id = current_user["sub"]
    year, month_num = map(int, month.split("-"))

    result = await db.execute(
        select(JournalEntry)
        .where(JournalEntry.user_id == user_id)
        .where(extract("year", JournalEntry.date) == year)
        .where(extract("month", JournalEntry.date) == month_num)
        .order_by(JournalEntry.date.desc())
    )

    return result.scalars().all()


@router.get("/calendar", response_model=JournalCalendarResponse)
async def get_journal_calendar(
    month: str = Query(
        ..., pattern=r"^\d{4}-\d{2}$",
        description="Month in YYYY-MM format"
    ),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get dates with journal entries for calendar dots."""
    user_id = current_user["sub"]
    year, month_num = map(int, month.split("-"))

    result = await db.execute(
        select(JournalEntry.date)
        .where(JournalEntry.user_id == user_id)
        .where(extract("year", JournalEntry.date) == year)
        .where(extract("month", JournalEntry.date) == month_num)
        .distinct()
    )

    dates = [row[0] for row in result.all()]
    return JournalCalendarResponse(dates=dates)


@router.get("/weekly-insight", response_model=WeeklyInsightResponse)
async def get_weekly_insight(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get AI-generated weekly insight from this week's journal entries."""
    user_id = current_user["sub"]

    # Get this week's entries (Monday to Sunday)
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    result = await db.execute(
        select(JournalEntry)
        .where(JournalEntry.user_id == user_id)
        .where(JournalEntry.date >= week_start)
        .where(JournalEntry.date <= week_end)
        .order_by(JournalEntry.date)
    )

    entries = result.scalars().all()
    entry_dicts = [
        {
            "date": str(e.date),
            "gratitude_items": e.gratitude_items,
            "reflection_text": e.reflection_text,
            "mood_at_entry": e.mood_at_entry,
        }
        for e in entries
    ]

    # Get user name
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()

    insight = await generate_weekly_insight(entry_dicts, user.name if user else None)

    return WeeklyInsightResponse(
        insight=insight,
        week_start=week_start,
        week_end=week_end,
        entry_count=len(entries),
    )


@router.get("/search", response_model=list[JournalEntryResponse])
async def search_journal_entries(
    q: str = Query(..., min_length=2, max_length=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Search across all journal entries by text content."""
    user_id = current_user["sub"]

    # Search in reflection_text and gratitude_items (JSONB cast to text)
    result = await db.execute(
        select(JournalEntry)
        .where(JournalEntry.user_id == user_id)
        .where(
            JournalEntry.reflection_text.ilike(f"%{q}%")
            | func.cast(JournalEntry.gratitude_items, db.bind.dialect.type_descriptor(type(str))).ilike(f"%{q}%")
        )
        .order_by(JournalEntry.date.desc())
        .limit(20)
    )

    return result.scalars().all()
