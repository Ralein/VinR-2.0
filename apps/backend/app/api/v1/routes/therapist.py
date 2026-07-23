"""Therapist directory routes."""

from fastapi import APIRouter, Query

router = APIRouter(prefix="/therapist", tags=["therapist"])

# Curated therapist directory providers
THERAPIST_PROVIDERS = [
    {
        "id": "betterhelp",
        "name": "BetterHelp",
        "type": "online",
        "description": "Online therapy with licensed counselors. Text, phone, or video sessions.",
        "url": "https://www.betterhelp.com",
        "specialties": ["anxiety", "depression", "stress", "relationships", "trauma"],
        "accepts_insurance": False,
        "telehealth": True,
        "emoji": "💬",
    },
    {
        "id": "psychologytoday",
        "name": "Psychology Today Directory",
        "type": "directory",
        "description": "Find therapists near you. Filter by specialty, insurance, and availability.",
        "url": "https://www.psychologytoday.com/us/therapists",
        "specialties": ["all"],
        "accepts_insurance": True,
        "telehealth": True,
        "emoji": "🔍",
    },
    {
        "id": "talkspace",
        "name": "Talkspace",
        "type": "online",
        "description": "Therapy on your schedule. Messaging, video, and audio sessions.",
        "url": "https://www.talkspace.com",
        "specialties": ["anxiety", "depression", "PTSD", "OCD", "bipolar"],
        "accepts_insurance": True,
        "telehealth": True,
        "emoji": "📱",
    },
    {
        "id": "openpathcollective",
        "name": "Open Path Collective",
        "type": "affordable",
        "description": "Affordable therapy ($30-$80/session). Sliding scale for all.",
        "url": "https://openpathcollective.org",
        "specialties": ["anxiety", "depression", "grief", "trauma"],
        "accepts_insurance": False,
        "telehealth": True,
        "emoji": "💚",
    },
]

WHY_THERAPY = [
    {
        "title": "It's a sign of strength",
        "text": "Seeking help shows self-awareness and courage. Athletes have coaches. You deserve a mental health expert.",
    },
    {
        "title": "Science backs it up",
        "text": "CBT has a 50-75% effectiveness rate for anxiety and depression. Therapy literally rewires your brain.",
    },
    {
        "title": "Apps + therapy = best results",
        "text": "Research shows combining self-help tools with professional guidance leads to 40% better outcomes.",
    },
]


@router.get("/directory")
async def get_directory(
    specialty: str | None = Query(None, description="Filter by specialty"),
    telehealth: bool = Query(True, description="Telehealth only"),
):
    """Get therapist directory with optional filters."""
    providers = THERAPIST_PROVIDERS.copy()

    if specialty:
        providers = [
            p for p in providers
            if "all" in p["specialties"] or specialty.lower() in p["specialties"]
        ]

    if telehealth:
        providers = [p for p in providers if p["telehealth"]]

    return {
        "providers": providers,
        "why_therapy": WHY_THERAPY,
    }
