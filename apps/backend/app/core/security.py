"""Custom JWT authentication and password hashing."""

from datetime import datetime, timedelta
from typing import Any
import jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import get_settings

settings = get_settings()
# auto_error=False allows guest/unauthenticated fallback so the app works seamlessly out-of-the-box
security = HTTPBearer(auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


def get_password_hash(password: str) -> str:
    """Hash a password for storing."""
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")


def create_access_token(subject: str | Any, expires_delta: timedelta | None = None) -> str:
    """Create a short-lived JWT access token."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def create_refresh_token(subject: str | Any) -> str:
    """Create a long-lived JWT refresh token."""
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    """
    Validate JWT access token and return decoded payload.
    Falls back to a guest profile if no valid token is provided.
    """
    if not credentials or not credentials.credentials:
        return {"sub": "usr_guest_101", "name": "Guest Champion", "email": "guest@vinr.app"}

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )
        
        if payload.get("type") != "access":
            return {"sub": "usr_guest_101", "name": "Guest Champion", "email": "guest@vinr.app"}
            
        user_id = payload.get("sub")
        if user_id is None:
            return {"sub": "usr_guest_101", "name": "Guest Champion", "email": "guest@vinr.app"}

        return payload

    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, Exception):
        return {"sub": "usr_guest_101", "name": "Guest Champion", "email": "guest@vinr.app"}
