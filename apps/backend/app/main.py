import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import get_settings
from app.api.v1.routes import auth, checkin, streaks, notifications, journal, media, events, analytics, therapist, rituals, chat
from app.services.kokoro_service import tts_service

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered emotional support companion with 21-day streak tracking",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Mount the static directory for internal assets
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Mount the public directory for greetings and user-accessible media
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public")
os.makedirs(PUBLIC_DIR, exist_ok=True)
app.mount("/public", StaticFiles(directory=PUBLIC_DIR), name="public")

@app.on_event("startup")
async def startup_event():
    """Trigger background tasks on startup."""
    # Pre-generate persona greetings in background to avoid blocking API startup
    import asyncio
    asyncio.create_task(tts_service.pregenerate_greetings())

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API v1 routes
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(checkin.router, prefix=settings.API_V1_PREFIX)
app.include_router(streaks.router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications.router, prefix=settings.API_V1_PREFIX)
app.include_router(journal.router, prefix=settings.API_V1_PREFIX)
app.include_router(media.router, prefix=settings.API_V1_PREFIX)
app.include_router(events.router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics.router, prefix=settings.API_V1_PREFIX)
app.include_router(therapist.router, prefix=settings.API_V1_PREFIX)
app.include_router(rituals.router, prefix=settings.API_V1_PREFIX)
app.include_router(chat.router, prefix=settings.API_V1_PREFIX)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to VinR API — We don't just support you. We make you a WINNER.",
        "docs": "/docs",
    }
