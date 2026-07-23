"""Check-in routes — AI-powered emotional analysis."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, date, timedelta

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.checkin import Checkin, Plan
from app.models.streak import Streak
from app.schemas.checkin import CheckinRequest, CheckinResponse, PlanResponse
from app.services.llm_service import analyze_emotions
from app.services.rag_service import retrieve_context
from app.services.adaptive_service import build_user_context

router = APIRouter(prefix="/checkin", tags=["checkin"])


@router.post("", response_model=CheckinResponse)
async def create_checkin(
    request: CheckinRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new emotional check-in.

    Flow:
    1. Retrieve relevant RAG context based on user's text
    2. Build adaptive user context from history
    3. Call Grok API with system prompt + RAG context + user context
    4. Parse structured JSON response
    5. Store checkin + plan in DB
    6. Create/update streak record (upsert — never duplicate)
    7. Return full plan to client
    """
    user_id = current_user["sub"]

    # Step 1: Retrieve RAG context
    rag_context = await retrieve_context(request.text or request.mood_tag)

    # Step 2: Build adaptive user context
    user_context = await build_user_context(db, user_id)

    # Step 3-4: Call Grok with full context
    ai_response = await analyze_emotions(
        mood_tag=request.mood_tag,
        raw_text=request.text or "",
        rag_context=rag_context,
        user_context=user_context,
    )

    # Step 4: Store checkin
    checkin = Checkin(
        user_id=user_id,
        mood_tag=request.mood_tag,
        raw_text=request.text,
        emotion_analysis=ai_response,
        is_emergency=ai_response.get("isEmergency", False),
    )
    db.add(checkin)
    await db.flush()

    # Store plan
    plan = Plan(
        checkin_id=checkin.id,
        user_id=user_id,
        immediate_relief=ai_response.get("immediateRelief", []),
        daily_habits=ai_response.get("dailyHabits", []),
        affirmation=ai_response.get("affirmation", ""),
        gratitude_prompt=ai_response.get("gratitudePrompt", ""),
        therapist_note=ai_response.get("therapistNote", ""),
    )
    db.add(plan)
    await db.flush()

    # Step 5: Update streaks (Unified)
    from app.services.unified_streak_service import update_user_streak
    
    streak_id = None
    current_streak = 0
    global_streak = 0

    if not ai_response.get("is_emergency", False):
        # Update both global and plan streak
        result = await update_user_streak(
            db, 
            user_id, 
            activity_type="checkin", 
            plan_id=str(plan.id)
        )
        if result:
            current_streak = result.get("plan_streak") or 0
            global_streak = result.get("global_streak") or 0
            
            # Find the streak id for the response
            # (We just created/updated it in the service)
            streak_result = await db.execute(
                select(Streak).where(Streak.plan_id == str(plan.id))
            )
            streak = streak_result.scalar_one_or_none()
            if streak:
                streak_id = str(streak.id)

    return CheckinResponse(
        checkin_id=str(checkin.id),
        plan=PlanResponse(**ai_response),
        streak_id=streak_id,
        current_streak=current_streak,
        global_streak=global_streak,
        created_at=checkin.created_at,
    )
