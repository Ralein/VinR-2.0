"""LLM Service — Groq API integration for emotional analysis."""

import json
import openai
from openai import AsyncOpenAI
from app.core.config import get_settings

settings = get_settings()

# Async OpenAI client
_client: AsyncOpenAI | None = None


def get_client() -> AsyncOpenAI:
    """Get or create cached OpenAI client for xAI/Grok."""
    global _client
    if _client is None:
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not set.")
        _client = AsyncOpenAI(api_key=settings.GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")
    return _client


# System prompt for VinR AI companion
VINR_SYSTEM_PROMPT = """You are VinR, a compassionate AI wellness companion.
Your responses are grounded in evidence-based mental health resources
from NIMH, SAMHSA, APA, and Mayo Clinic.

TRIAGE RULES:
- If input contains: suicidal ideation, self-harm, harming others,
  crisis language → isEmergency: true
- All other inputs → isEmergency: false

For non-emergency, respond in strict JSON:
{
  "isEmergency": false,
  "primaryEmotion": "string",
  "emotionSummary": "2 sentences — warm, reflective",
  "supportMessage": "1 empathetic sentence",
  "immediateRelief": [
    {
      "id": "unique_id",
      "name": "Technique name",
      "emoji": "emoji",
      "category": "breathing|grounding|movement|meditation|social|creative",
      "duration": "e.g. 5 minutes",
      "instructions": ["Step 1", "Step 2", "Step 3"],
      "scienceNote": "1 sentence — why this works",
      "source": "NIMH / APA / Mayo Clinic"
    }
  ],
  "dailyHabits": [ same schema, 3 items ],
  "affirmation": "Short powerful affirmation",
  "gratitudePrompt": "Tonight, reflect on...",
  "therapistNote": "Why professional support helps here"
}

immediateRelief must contain exactly 3 items.
dailyHabits must contain exactly 3 items.

For emergency, respond:
{
  "isEmergency": true,
  "primaryEmotion": "crisis",
  "emotionSummary": "Brief empathetic acknowledgment",
  "supportMessage": "You are not alone. Help is available right now.",
  "immediateRelief": [],
  "dailyHabits": [],
  "affirmation": "",
  "gratitudePrompt": "",
  "therapistNote": "Please reach out to a crisis counselor immediately."
}

Use the provided RAG context to ground your suggestions.
Always prefer scientifically validated techniques.
Return ONLY valid JSON, no markdown or extra text."""


async def analyze_emotions(
    mood_tag: str,
    raw_text: str,
    rag_context: str = "",
    user_context: str = "",
) -> dict:
    """
    Call Groq API to analyze emotions and generate a rescue plan.

    Args:
        mood_tag: Selected mood (e.g. "anxious", "sad")
        raw_text: User's free-text emotional input
        rag_context: Relevant knowledge from RAG pipeline
        user_context: Historical user context (future adaptive AI)

    Returns:
        Parsed dict matching the PlanResponse schema
    """
    # Build user message
    parts = [f"Mood: {mood_tag}"]
    if raw_text:
        parts.append(f"What I'm feeling: {raw_text}")
    if rag_context:
        parts.append(f"\n--- Relevant Knowledge Base Context ---\n{rag_context}")
    if user_context:
        parts.append(f"\n--- User History Context ---\n{user_context}")

    user_message = "\n\n".join(parts)

    try:
        client = get_client()
        response = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            max_tokens=2048,
            temperature=0.7,
            messages=[
                {"role": "system", "content": VINR_SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
        )

        # Extract text content from Groq's response
        response_text = response.choices[0].message.content.strip()

        # Parse JSON - handle potential markdown code blocks
        if response_text.startswith("```"):
            # Strip markdown code fences
            lines = response_text.split("\n")
            if lines[-1].strip() == "```":
                response_text = "\n".join(lines[1:-1])
            else:
                response_text = "\n".join(lines[1:])

        result = json.loads(response_text)
        return result

    except json.JSONDecodeError as e:
        # Fallback to mock if JSON parsing fails
        print(f"⚠️ Failed to parse Groq response as JSON: {e}\nResponse was: {response_text}")
        return _get_fallback_response(mood_tag, raw_text)
    except openai.APIError as e:
        print(f"⚠️ Groq API error: {e}")
        return _get_fallback_response(mood_tag, raw_text)
    except Exception as e:
        print(f"⚠️ Unexpected error in analyze_emotions: {e}")
        return _get_fallback_response(mood_tag, raw_text)


def _get_fallback_response(mood_tag: str, raw_text: str) -> dict:
    """Fallback response when Groq API is unavailable."""
    return {
        "isEmergency": False,
        "primaryEmotion": mood_tag,
        "emotionSummary": f"It sounds like you're feeling {mood_tag}. That's a completely valid way to feel right now.",
        "supportMessage": "Remember, every storm passes. You're stronger than you think.",
        "immediateRelief": [
            {
                "id": "box-breathing-1",
                "name": "Box Breathing",
                "emoji": "🫁",
                "category": "breathing",
                "duration": "4 minutes",
                "instructions": [
                    "Breathe in for 4 seconds",
                    "Hold for 4 seconds",
                    "Breathe out for 4 seconds",
                    "Hold for 4 seconds",
                    "Repeat 4 times",
                ],
                "scienceNote": "Box breathing activates the parasympathetic nervous system, reducing cortisol.",
                "source": "APA",
            },
            {
                "id": "grounding-54321",
                "name": "5-4-3-2-1 Grounding",
                "emoji": "🌿",
                "category": "grounding",
                "duration": "5 minutes",
                "instructions": [
                    "Name 5 things you can see",
                    "Name 4 things you can touch",
                    "Name 3 things you can hear",
                    "Name 2 things you can smell",
                    "Name 1 thing you can taste",
                ],
                "scienceNote": "Sensory grounding interrupts anxiety spirals by re-anchoring to the present.",
                "source": "NIMH",
            },
            {
                "id": "walk-10min",
                "name": "10-Minute Walk",
                "emoji": "🚶",
                "category": "movement",
                "duration": "10 minutes",
                "instructions": [
                    "Put on comfortable shoes",
                    "Step outside or walk around your space",
                    "Focus on the sensation of each step",
                ],
                "scienceNote": "Walking releases endorphins and reduces rumination by 25%.",
                "source": "Mayo Clinic",
            },
        ],
        "dailyHabits": [
            {
                "id": "morning-gratitude",
                "name": "Morning Gratitude",
                "emoji": "☀️",
                "category": "meditation",
                "duration": "5 minutes",
                "instructions": [
                    "Write down 3 things you're grateful for",
                    "Include at least 1 small, specific thing",
                    "Read them aloud to yourself",
                ],
                "scienceNote": "Gratitude journaling increases serotonin production.",
                "source": "Harvard Health",
            },
            {
                "id": "evening-breathing",
                "name": "Evening Wind-Down Breathing",
                "emoji": "🌙",
                "category": "breathing",
                "duration": "5 minutes",
                "instructions": [
                    "Use 4-7-8 technique: inhale 4s, hold 7s, exhale 8s",
                    "Do 4-8 cycles",
                    "Practice in bed with eyes closed",
                ],
                "scienceNote": "4-7-8 breathing promotes melatonin release and sleep onset.",
                "source": "APA",
            },
            {
                "id": "daily-movement",
                "name": "20-Minute Movement",
                "emoji": "💪",
                "category": "movement",
                "duration": "20 minutes",
                "instructions": [
                    "Choose: walking, yoga, dancing, or stretching",
                    "Focus on how your body feels, not performance",
                    "End with 2 minutes of deep breathing",
                ],
                "scienceNote": "Regular exercise is as effective as medication for mild-moderate depression.",
                "source": "NIMH",
            },
        ],
        "affirmation": "I am not my worst moments. I am the person who keeps showing up.",
        "gratitudePrompt": "Tonight, reflect on one person who made your day a little better.",
        "therapistNote": "Professional support can accelerate healing. A therapist provides tools tailored specifically to you.",
    }
