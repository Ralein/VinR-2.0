"""Journal Service — AI reflections and weekly insights via Groq."""

from datetime import date, timedelta
import openai
from openai import AsyncOpenAI
from app.core.config import get_settings

settings = get_settings()
client = AsyncOpenAI(api_key=settings.GROQ_API_KEY, base_url="https://api.groq.com/openai/v1") if settings.GROQ_API_KEY else None


async def generate_journal_reflection(
    gratitude_items: list[str],
    reflection_text: str | None,
    mood_at_entry: int | None,
    user_name: str | None = None,
) -> str:
    """
    Generate a warm AI reflection based on the user's journal entry.
    Returns 1 empathetic observation + 1 gentle prompt for tomorrow.
    """
    mood_map = {1: "really low", 2: "a bit low", 3: "okay", 4: "good", 5: "great"}
    mood_desc = mood_map.get(mood_at_entry, "unspecified") if mood_at_entry else "unspecified"
    name = user_name or "friend"

    gratitude_list = "\n".join(f"  - {item}" for item in gratitude_items)

    prompt = f"""You are VinR, a compassionate wellness companion. The user "{name}" just wrote a gratitude journal entry.

Mood: {mood_desc}
Gratitude items:
{gratitude_list}
{f'Reflection: {reflection_text}' if reflection_text else ''}

Write exactly 2 sentences:
1. A warm, specific observation about what they shared (reference something they wrote)
2. A gentle prompt or question for tomorrow's reflection

Rules:
- Be warm but not saccharine
- Reference specific details from their entry
- Keep it under 80 words total
- Do NOT use generic phrases like "That's wonderful!"
- Write in second person ("you")"""

    try:
        if not client:
            raise ValueError("GROQ_API_KEY not configured")
        
        response = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Journal reflection error: {e}")
        return "Thank you for sharing today. Every moment of gratitude builds the foundation for a brighter tomorrow."


async def generate_weekly_insight(
    entries: list[dict],
    user_name: str | None = None,
) -> str:
    """
    Generate a weekly insight summarizing the user's journal themes.
    Called every Sunday (or on-demand).
    """
    if not entries:
        return "Start journaling this week to unlock your first weekly insight!"

    name = user_name or "friend"

    entries_text = ""
    for entry in entries:
        entries_text += f"\nDate: {entry['date']}\n"
        entries_text += f"  Mood: {entry.get('mood_at_entry', '?')}/5\n"
        entries_text += f"  Grateful for: {', '.join(entry.get('gratitude_items', []))}\n"
        if entry.get("reflection_text"):
            entries_text += f"  Reflection: {entry['reflection_text']}\n"

    prompt = f"""You are VinR, a compassionate wellness companion. Here are {name}'s journal entries from this past week:

{entries_text}

Write a 2-3 sentence weekly insight that:
1. Identifies recurring themes or patterns (e.g., "work stress kept coming up", "gratitude for family was consistent")
2. Notes any mood trajectory (improving, steady, fluctuating)
3. Ends with one actionable, gentle suggestion for next week

Rules:
- Be specific — reference actual themes from their entries
- Keep under 100 words
- Write in second person ("you")
- Be encouraging but honest"""

    try:
        if not client:
            raise ValueError("GROQ_API_KEY not configured")
        
        response = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            max_tokens=250,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Weekly insight error: {e}")
        return "Keep journaling — your weekly insight will appear after a few more entries."
