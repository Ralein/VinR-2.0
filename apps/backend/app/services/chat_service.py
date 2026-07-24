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
You are Hope — a warm, deeply empathetic VinR companion.
You listen with patience and speak in a soothing, grounding tone.
You always validate emotions before offering perspective.
Respond in 2-4 sentences max. Prioritise emotional safety and genuine connection.
Never give generic advice — be specific to what the user shares."""

VINR_PROMPT = f"""{BASE_IDENTITY_PROMPT}
You are VinR AI — a smart, focused, results-driven companion.
You cut through noise and provide clear, actionable insights.
Your tone is confident, direct, and energising.
Respond in 2-4 sentences max. Prioritise clarity, logic, and practical next steps."""

SAGE_PROMPT = f"""{BASE_IDENTITY_PROMPT}
You are Sage — a calm, philosophical, and deeply wise companion.
You offer perspective that helps users zoom out and see the bigger picture.
Your tone is measured, thoughtful, and gently challenging.
Respond in 2-4 sentences max. Prioritise wisdom, context, and reframing."""

THERAPIST_PROMPT = f"""{BASE_IDENTITY_PROMPT}
You are Dr. Aris — a compassionate clinical psychologist.
You use evidence-based therapeutic techniques (CBT, DBT, motivational interviewing).
Your tone is warm but structured. You identify cognitive patterns without labelling.
Respond in 2-4 sentences max. Prioritise insight, validation, and therapeutic reflection."""

COACH_PROMPT = f"""{BASE_IDENTITY_PROMPT}
You are Coach — a high-energy, results-obsessed performance coach.
You push the user toward bold action with encouraging, powerful language.
You treat every conversation like a training session — no excuses, only growth.
Respond in 2-4 sentences max. Prioritise momentum, accountability, and action."""

# Map from persona ID to prompt
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
    """Get or create cached OpenAI client pointed at 9Router local endpoint."""
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            api_key=settings.NINE_ROUTER_API_KEY,
            base_url=settings.NINE_ROUTER_URL,
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
    from datetime import datetime, timezone
    import uuid

    key = _hash_uid(user_id)
    msg = {
        "id": str(uuid.uuid4()),
        "role": role,
        "content": content,
        "audio_url": audio_url,
        "persona": persona,
        "created_at": datetime.now(timezone.utc).isoformat(),
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

        # 5. Call LLM via 9Router
        client = _get_client()

        # Tune temperature per persona: coaches/vinr need higher creativity, hope needs stability
        temp_map = {
            "hope": 0.65, "vinr": 0.7, "sage": 0.72,
            "therapist": 0.6, "coach": 0.85,
        }
        temperature = temp_map.get(normalized_persona, 0.72)

        response = await client.chat.completions.create(
            model=settings.NINE_ROUTER_MODEL,
            max_tokens=1024,
            temperature=temperature,
            messages=llm_messages,
        )
        reply = response.choices[0].message.content.strip()

        # Strip any leftover markdown fences the model might add
        if reply.startswith("```"):
            lines = reply.split("\n")
            reply = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

        return reply

    except Exception as e:
        print(f"⚠️ LLM service error ({str(e)}), using enhanced local fallback...")
        lower = message.lower()

        # Richer keyword-driven fallback responses
        if any(w in lower for w in ["anxious", "anxiety", "stress", "stressed", "worry", "fear", "panic"]):
            return (
                "I hear you — anxiety can feel overwhelming, but you\'re not alone in this. "
                "Take a slow breath with me: inhale for 4 counts, hold for 4, exhale for 6. "
                "You have navigated 100% of your hardest days so far. What\'s one small thing that feels manageable right now?"
            )
        elif any(w in lower for w in ["sad", "depress", "low", "empty", "hopeless", "unmotivated"]):
            return (
                "What you\'re feeling is real and valid — it\'s okay to sit with it for a moment. "
                "Sometimes the smallest step forward is the most powerful one. "
                "Is there one tiny thing that might bring even a flicker of comfort right now?"
            )
        elif any(w in lower for w in ["happy", "excited", "great", "amazing", "win", "proud", "achieved"]):
            return (
                "That\'s real momentum — I love hearing that! "
                "Celebrating wins, big or small, is how consistency compounds into transformation. "
                "What made today feel like a victory?"
            )
        elif any(w in lower for w in ["sleep", "tired", "exhausted", "insomnia", "rest"]):
            return (
                "Rest is not laziness — it\'s recovery, and recovery is where growth actually happens. "
                "Try the 4-7-8 technique tonight: inhale 4s, hold 7s, exhale 8s. "
                "Is there anything specific keeping you from sleeping well?"
            )
        elif any(w in lower for w in ["hello", "hi", "hey", "start", "begin"]):
            return (
                "Hey there! I\'m right here with you. "
                "How\'s your energy and mood feeling today? "
                "Whether you want to reflect, vent, or just talk — I\'m all in."
            )
        else:
            return (
                "I\'m here and fully listening. "
                "Every moment you show up for yourself — even just by reaching out — is progress. "
                "Tell me more about what\'s on your mind."
            )
