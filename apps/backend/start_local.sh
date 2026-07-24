#!/bin/bash
# VinR Local Python Backend Launcher
# Runs 100% locally with zero cloud deployment or external services required.

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

PYTHON_BIN="/Library/Frameworks/Python.framework/Versions/3.13/bin/python3"
if [ ! -f "$PYTHON_BIN" ]; then
    PYTHON_BIN="python3"
fi

# Enable ADB port forwarding for connected Android USB devices
ADB_BIN="$HOME/Library/Android/sdk/platform-tools/adb"
if [ -f "$ADB_BIN" ]; then
    echo "📱 Configuring Android ADB reverse port forwarding (port 8000)..."
    "$ADB_BIN" reverse tcp:8000 tcp:8000 2>/dev/null || true
fi

echo "⚡ Starting VinR Local Python Backend..."

# Create .env if missing
if [ ! -f .env ]; then
    echo "⚙️ Creating local .env configuration..."
    cat << 'EOF' > .env
APP_NAME="VinR Local API"
APP_VERSION="2.0.0"
DEBUG=True
API_V1_PREFIX="/api/v1"
DATABASE_URL="sqlite+aiosqlite:///./vinr_local.db"
SECRET_KEY="vinr_local_development_secret_key"
CORS_ORIGINS=["*"]
EOF
    echo "✅ Created .env with local SQLite database settings."
fi

echo "🚀 Launching FastAPI server on http://0.0.0.0:8000..."
exec "$PYTHON_BIN" -m uvicorn app.main:app --host 0.0.0.0 --port 8000
