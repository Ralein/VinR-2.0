"""Chat Service — VinR Buddy conversational AI with ephemeral in-memory history.

Genshin-style: messages live only in server memory. Logout, app restart,
or server restart clears everything. No database writes for chat.
"""

import hashlib
from collections import defaultdict
from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.rag_service import retrieve_context
from app.services.adaptive_service import build_user_context
from app.core.config import get_settings

settings = get_settings()

# ── Identity & Tone ───────────────────────────────────────────────

BASE_IDENTITY_PROMPT = """You are VinR LLM (also known as Winner) — an advanced AI companion. 
You have full voice and audio capabilities powered by local neural synthesis. 
Never say you are "text-based" or that you cannot produce audio. 
Always be positive, encouraging, and helpful. 
Your primary goal is to support the user's wellbeing and productivity."""

# ── Persona system prompts ──────────────────────────────────────────

HOPE_PROMPT = f"""{BASE_IDENTITY_PROMPT}
You are Hope — a kind, calm, and deeply empathetic VinR Buddy.
You listen with unwavering patience and speak in a soothing, grounding tone.
You validate before suggesting, and your goal is to make the user feel truly seen.
Keep responses concise (1-3 sentences). Focus on emotional safety."""

VINR_PROMPT = f"""{BASE_IDENTITY_PROMPT}
You are VinR AI — a smart, efficient, and direct AI companion.
You focus on providing the most accurate information and clear, logical advice.
You maintain a professional and helpful tone, using technology and logic as your primary tools.
Keep responses concise (1-3 sentences). Focus on productivity and clarity."""

SAGE_PROMPT = f"""{BASE_IDENTITY_PROMPT}
You are Sage — a calm, analytical, and wise VinR Buddy.
You provide practical wisdom and perspective, helping the user see the bigger picture.
Your tone is steady, thoughtful, and encouraging.
Keep responses concise (1-3 sentences). Focus on wisdom and perspective."""

THERAPIST_PROMPT = f"""{BASE_IDENTITY_PROMPT}
You are Dr. Aris — a professional clinical psychologist and therapist.
Your demeanor is clinical yet compassionate. You structure your responses thoughtfully.
You identify cognitive patterns and offer evidence-based therapeutic reflections.
Keep responses concise (1-3 sentences). Focus on clinical insight and structured support."""

COACH_PROMPT = f"""{BASE_IDENTITY_PROMPT}
You are Coach — a high-energy, motivational, and disciplined VinR Buddy.
You push the user toward action and discipline. You treat wellness like training for a marathon.
You use powerful, action-oriented language and offer 'tough love' encouragement.
Keep responses concise (1-3 sentences). Focus on momentum and discipline."""

PERSONA_PROMPTS = {
    "hope": HOPE_PROMPT,
    "vinr": VINR_PROMPT,
    "sage": SAGE_PROMPT,
    "therapist": THERAPIST_PROMPT,
    "coach": COACH_PROMPT,
}


# ── Client setup ─────────────────────────────────────────────────────

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not set.")
        _client = AsyncOpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
        )
    return _client


# ── In-Memory Chat Hash Map (Genshin-style ephemeral) ────────────────
#
# Structure: { hashed_user_id: [ { role, content, persona, audio_url, created_at }, ... ] }
# - Keyed by SHA-256 hash of user_id for privacy in memory dumps
# - FIFO eviction: max 30 messages per user
# - Cleared on: server restart (natural), explicit clear, or logout API call
#

MAX_MEMORY_PER_USER = 30

_chat_memory: dict[str, list[dict]] = defaultdict(list)


def _hash_uid(user_id: str) -> str:
    """Hash user_id for privacy-safe memory keying."""
    return hashlib.sha256(user_id.encode()).hexdigest()[:16]


def memory_get_history(user_id: str, limit: int = 30) -> list[dict]:
    """Fetch recent messages from in-memory store."""
    key = _hash_uid(user_id)
    history = _chat_memory.get(key, [])
    return history[-limit:]


def memory_save_message(
    user_id: str,
    role: str,
    content: str,
    audio_url: str | None = None,
    persona: str | None = "hope",
) -> dict:
    """Save a message to in-memory store with FIFO eviction."""
    from datetime import datetime
    import uuid

    key = _hash_uid(user_id)
    msg = {
        "id": str(uuid.uuid4()),
        "role": role,
        "content": content,
        "audio_url": audio_url,
        "persona": persona,
        "created_at": datetime.utcnow().isoformat(),
    }

    _chat_memory[key].append(msg)

    # FIFO: keep only the latest N messages
    if len(_chat_memory[key]) > MAX_MEMORY_PER_USER:
        _chat_memory[key] = _chat_memory[key][-MAX_MEMORY_PER_USER:]

    return msg


def memory_clear(user_id: str) -> int:
    """Clear all messages for a user. Returns count deleted."""
    key = _hash_uid(user_id)
    count = len(_chat_memory.get(key, []))
    _chat_memory.pop(key, None)
    return count


def memory_clear_all():
    """Nuclear option: clear all chat memory (e.g., admin endpoint)."""
    _chat_memory.clear()


# ── Buddy response generation ───────────────────────────────────────

async def generate_buddy_response(
    db: AsyncSession, user_id: str, message: str, persona: str = "hope",
) -> str:
    """
    Orchestrate: in-memory history + RAG + user context → Groq LLM → response.
    DB is only used for user profile context (adaptive service), NOT chat storage.
    """
    try:
        # 1. Retrieve RAG context from knowledge base
        rag_context = await retrieve_context(message)

        # 2. Build adaptive user context (mood trend, streak, preferences)
        user_context = await build_user_context(db, user_id)

        # 3. Fetch conversation history from memory (not DB)
        history = memory_get_history(user_id, limit=20)

        # 4. Build LLM messages
        normalized_persona = (persona or "hope").lower()
        sys_prompt = PERSONA_PROMPTS.get(normalized_persona, HOPE_PROMPT)
        llm_messages = [{"role": "system", "content": sys_prompt}]

        # Inject static "Evidence Grounding" rule
        llm_messages.append({
            "role": "system",
            "content": (
                "IMPORTANT: When suggesting activities or health facts, ONLY speak "
                "based on the provided wellness knowledge. If no knowledge is relevant, "
                "provide general empathetic validation without technical claims."
            )
        })

        # Inject RAG + user context as a system-level preamble
        if rag_context or user_context:
            context_parts = []
            if user_context:
                context_parts.append(user_context)
            if rag_context:
                context_parts.append(
                    f"--- Relevant Wellness Knowledge ---\n{rag_context}"
                )
            llm_messages.append({
                "role": "system",
                "content": "\n\n".join(context_parts),
            })

        # Add conversation history from memory
        for msg in history:
            llm_messages.append({"role": msg["role"], "content": msg["content"]})

        # Add current user message
        llm_messages.append({"role": "user", "content": message})

        # 5. Call Groq
        client = _get_client()
        response = await client.chat.completions.create(
            model=settings.GROQ_MODEL or "llama3-8b-8192",
            max_tokens=512,
            temperature=0.8,
            messages=llm_messages,
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        import traceback
        print(f"❌ Buddy generation error: {str(e)}")
        print(traceback.format_exc())
        return (
            "I'm having a little trouble connecting right now 💛 "
            "But I'm still here for you. Could you try again in a moment?"
        )
