"""Events Service — Google Places + Eventbrite dual-source event discovery.

Real events only — no mock data. Combines Google Places Nearby Search
with Eventbrite event listings, merges and deduplicates results.
"""

import hashlib
import httpx
import time
from urllib.parse import quote_plus

from app.core.config import get_settings

settings = get_settings()

# ── Wellness-related place types for Google Places ───────────────────────
GOOGLE_PLACE_TYPES = [
    "gym", "spa", "yoga_studio", "health", "park",
    "physiotherapist",
]

# Wellness keywords for Google text search fallback
WELLNESS_KEYWORDS = [
    "yoga", "meditation", "mindfulness", "wellness center",
    "fitness studio", "mental health", "therapy", "breathwork",
    "support group", "hiking trail", "art therapy", "self-care",
]

# Eventbrite wellness categories
WELLNESS_CATEGORIES = {
    "yoga", "meditation", "mindfulness", "mental health", "wellness",
    "support group", "outdoor", "hiking", "walking", "art therapy",
    "therapy", "breathwork", "fitness", "self-care", "journaling",
}

# Emotion → event type mapping for personalization
EMOTION_EVENT_MAP = {
    "anxious": ["yoga", "meditation", "breathwork", "walking", "park"],
    "sad": ["support group", "outdoor", "hiking", "art therapy"],
    "angry": ["fitness", "yoga", "outdoor", "hiking", "gym"],
    "lonely": ["support group", "social", "art therapy", "walking"],
    "stressed": ["meditation", "yoga", "breathwork", "mindfulness", "spa"],
    "numb": ["art therapy", "outdoor", "hiking", "fitness"],
    "lost": ["support group", "mindfulness", "journaling", "walking"],
    "overwhelmed": ["meditation", "breathwork", "yoga", "self-care", "spa"],
}

# ── In-memory TTL cache (5 min) ─────────────────────────────────────────
_cache: dict[str, tuple[float, list[dict]]] = {}
CACHE_TTL = 300  # 5 minutes


def _cache_key(lat: float, lon: float, keyword: str | None) -> str:
    """Generate a cache key from location + keyword."""
    raw = f"{round(lat, 3)}:{round(lon, 3)}:{keyword or ''}"
    return hashlib.md5(raw.encode()).hexdigest()


def _get_cached(key: str) -> list[dict] | None:
    if key in _cache:
        ts, data = _cache[key]
        if time.time() - ts < CACHE_TTL:
            return data
        del _cache[key]
    return None


def _set_cache(key: str, data: list[dict]):
    _cache[key] = (time.time(), data)


# ── Google Places API ────────────────────────────────────────────────────

def _build_google_maps_url(lat: float, lng: float, name: str | None = None, place_id: str | None = None) -> str:
    """Build a Google Maps deep link URL using the official search API."""
    query = quote_plus(name) if name else f"{lat},{lng}"
    url = f"https://www.google.com/maps/search/?api=1&query={query}"
    if place_id:
        url += f"&query_place_id={place_id}"
    return url


def _build_photo_url(photo_reference: str, max_width: int = 400) -> str:
    """Build a Google Places photo URL."""
    return (
        f"https://maps.googleapis.com/maps/api/place/photo"
        f"?maxwidth={max_width}"
        f"&photo_reference={photo_reference}"
        f"&key={settings.GOOGLE_PLACES_API_KEY}"
    )


async def _search_google_places(
    lat: float, lon: float, radius_meters: int = 40000, keyword: str | None = None
) -> list[dict]:
    """Search Google Places Nearby Search API for wellness venues."""
    if not settings.GOOGLE_PLACES_API_KEY:
        return []

    events = []
    search_keyword = keyword or "wellness yoga meditation fitness mental health"

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.get(
                "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
                params={
                    "location": f"{lat},{lon}",
                    "radius": radius_meters,
                    "keyword": search_keyword,
                    "type": "health",  # broad wellness type
                    "key": settings.GOOGLE_PLACES_API_KEY,
                },
            )
            data = response.json()

            if data.get("status") != "OK":
                print(f"Google Places API status: {data.get('status')} — {data.get('error_message', '')}")
                return []

            for place in data.get("results", [])[:20]:
                geometry = place.get("geometry", {}).get("location", {})
                p_lat = geometry.get("lat")
                p_lng = geometry.get("lng")
                place_id = place.get("place_id", "")

                # Photo
                photo_url = None
                photos = place.get("photos", [])
                if photos:
                    photo_url = _build_photo_url(photos[0].get("photo_reference", ""))

                # Opening hours
                opening_hours = None
                oh = place.get("opening_hours", {})
                if oh:
                    opening_hours = oh.get("weekday_text", None)

                # Category from types
                types = place.get("types", [])
                category = _categorize_from_types(types, place.get("name", ""))

                events.append({
                    "event_id": f"gp_{place_id}",
                    "name": place.get("name", ""),
                    "description": place.get("vicinity", ""),
                    "venue": place.get("name", ""),
                    "address": place.get("vicinity", ""),
                    "date": None,
                    "start_time": None,
                    "category": category,
                    "distance_miles": None,
                    "url": None,
                    "is_virtual": False,
                    "image_url": photo_url,
                    "latitude": p_lat,
                    "longitude": p_lng,
                    "google_maps_url": _build_google_maps_url(p_lat, p_lng, place.get("name"), place_id),
                    "source": "google_places",
                    "photo_url": photo_url,
                    "rating": place.get("rating"),
                    "rating_count": place.get("user_ratings_total"),
                    "opening_hours": opening_hours,
                    "place_id": place_id,
                })

    except Exception as e:
        print(f"❌ Google Places search error: {e}")

    return events


def _categorize_from_types(types: list[str], name: str) -> str:
    """Map Google Place types to our wellness categories."""
    type_map = {
        "gym": "fitness",
        "spa": "wellness",
        "yoga_studio": "yoga",
        "health": "wellness",
        "park": "outdoor",
        "physiotherapist": "therapy",
        "doctor": "therapy",
        "hospital": "wellness",
    }
    for t in types:
        if t in type_map:
            return type_map[t]

    # Fallback: check name
    name_lower = name.lower()
    for cat in WELLNESS_CATEGORIES:
        if cat in name_lower:
            return cat

    return "wellness"


# ── Eventbrite API ───────────────────────────────────────────────────────

async def _search_eventbrite(
    lat: float, lon: float, radius: int = 25, keyword: str | None = None
) -> list[dict]:
    """Search Eventbrite for wellness events."""
    if not settings.EVENTBRITE_API_KEY:
        return []

    events = []
    try:
        params = {
            "location.latitude": lat,
            "location.longitude": lon,
            "location.within": f"{radius}mi",
            "categories": "107",  # Health & Wellness
            "sort_by": "date",
            "expand": "venue",
        }
        if keyword:
            params["q"] = keyword

        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.get(
                "https://www.eventbriteapi.com/v3/events/search/",
                params=params,
                headers={
                    "Authorization": f"Bearer {settings.EVENTBRITE_API_KEY}",
                },
            )
            data = response.json()

            for event in data.get("events", [])[:20]:
                venue = event.get("venue", {}) or {}
                address_info = venue.get("address", {}) or {}
                venue_lat = address_info.get("latitude")
                venue_lng = address_info.get("longitude")

                # Parse latitude/longitude
                lat_val = float(venue_lat) if venue_lat else None
                lng_val = float(venue_lng) if venue_lng else None

                # Google Maps URL
                maps_url = None
                if lat_val and lng_val:
                    maps_url = _build_google_maps_url(lat_val, lng_val, event.get("name", {}).get("text", ""))

                # Image
                logo = event.get("logo", {}) or {}
                image_url = logo.get("url")

                # Date formatting
                start = event.get("start", {}) or {}
                raw_date = start.get("local", "")

                events.append({
                    "event_id": f"eb_{event['id']}",
                    "name": event.get("name", {}).get("text", ""),
                    "description": (event.get("description", {}).get("text", "") or "")[:200],
                    "venue": venue.get("name", ""),
                    "address": address_info.get("localized_address_display", ""),
                    "date": raw_date,
                    "start_time": raw_date,
                    "category": _categorize_event_name(
                        event.get("name", {}).get("text", "")
                    ),
                    "distance_miles": None,
                    "url": event.get("url", ""),
                    "is_virtual": event.get("online_event", False),
                    "image_url": image_url,
                    "latitude": lat_val,
                    "longitude": lng_val,
                    "google_maps_url": maps_url,
                    "source": "eventbrite",
                    "photo_url": image_url,
                    "rating": None,
                    "rating_count": None,
                    "opening_hours": None,
                    "place_id": None,
                })

    except Exception as e:
        print(f"❌ Eventbrite search error: {e}")

    return events


def _categorize_event_name(name: str) -> str:
    """Categorize an event based on its name."""
    name_lower = name.lower()
    for cat in WELLNESS_CATEGORIES:
        if cat in name_lower:
            return cat
    return "wellness"


# ── Merge + Deduplicate ──────────────────────────────────────────────────

def _merge_events(google_events: list[dict], eb_events: list[dict]) -> list[dict]:
    """Merge Google Places and Eventbrite results, deduplicating by name proximity."""
    merged = []
    seen_names: set[str] = set()

    # Eventbrite events first (they have dates/schedules)
    for ev in eb_events:
        key = ev["name"].lower().strip()[:40]
        if key not in seen_names:
            seen_names.add(key)
            merged.append(ev)

    # Then Google Places results
    for ev in google_events:
        key = ev["name"].lower().strip()[:40]
        if key not in seen_names:
            seen_names.add(key)
            merged.append(ev)

    return merged


# ── Public API ───────────────────────────────────────────────────────────

async def search_events(
    lat: float, lon: float, radius: int = 25, keyword: str | None = None
) -> list[dict]:
    """
    Search for wellness events from both Google Places and Eventbrite.

    Returns merged, deduplicated results. Uses in-memory TTL cache.
    """
    key = _cache_key(lat, lon, keyword)
    cached = _get_cached(key)
    if cached is not None:
        return cached

    # Fire both API calls
    radius_meters = int(radius * 1609.34)  # miles → meters for Google
    google_results = await _search_google_places(lat, lon, radius_meters, keyword)
    eb_results = await _search_eventbrite(lat, lon, radius, keyword)

    merged = _merge_events(google_results, eb_results)

    # Cache the merged results
    if merged:
        _set_cache(key, merged)

    return merged


def personalize_events(events: list[dict], emotion: str | None) -> list[dict]:
    """
    Reorder events to prioritize those matching user's current emotion.
    e.g., anxious users see yoga and meditation first.
    """
    if not emotion or emotion not in EMOTION_EVENT_MAP:
        return events

    preferred_categories = EMOTION_EVENT_MAP[emotion]

    def score(event: dict) -> int:
        cat = (event.get("category") or "").lower()
        if cat in preferred_categories:
            return preferred_categories.index(cat)
        return len(preferred_categories)

    return sorted(events, key=score)
