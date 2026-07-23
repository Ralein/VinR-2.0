# VinR — Emotional Wellness & Growth Platform

"We don't just support you. We make you a WINNER."

VinR is a science-backed, AI-powered emotional support companion that turns mental health management into a 21-day winning streak. We are focused on therapy customers who want to win their life, establishing VinR as their growth partner.

## Tech Stack
* **Frontend:** React Native (Expo SDK 51+), Expo Router, NativeWind, Zustand, React Query
* **Backend:** Python (FastAPI), PostgreSQL + pgvector, Redis, Celery
* **AI & Integration:** LangChain, Anthropic Claude API, Firebase Cloud Messaging, AWS S3

---

## Prerequisites
Before you begin, ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Python](https://www.python.org/downloads/) (3.10 or higher)
* [PostgreSQL](https://www.postgresql.org/download/)
* [Redis](https://redis.io/download)
* [Docker](https://www.docker.com/) (Optional, for containerized services)

---

## Backend Setup (FastAPI)

1. **Navigate to the backend directory:**
   ```bash
   cd apps/backend
   ```

2. **Set up a Python virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: `venv\Scripts\activate`
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Create a `.env` file in the `apps/backend` directory and add your configuration variables:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/vinr_db
   REDIS_URL=redis://localhost:6379/0
   ANTHROPIC_API_KEY=your_claude_api_key
   SECRET_KEY=your_secret_key
   # Add any other required keys (Supabase, Pinecone, Firebase)
   ```

5. **Run Database Migrations:**
   Ensure your local PostgreSQL server is running, then execute:
   ```bash
   alembic upgrade head
   ```

6. **Start the API Server:**
   ```bash
   uvicorn app.main:app --reload
   uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   The API will be accessible at `http://localhost:8000`.

7. **Start the Celery Worker (for background tasks):**
   In a separate terminal window (ensure your virtualenv is activated and Redis is running):
   ```bash
   celery -A app.core.celery_app worker --loglevel=info
   ```

---

## Frontend Setup (React Native / Expo)

1. **Navigate to the mobile app directory:**
   ```bash
   cd apps/mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Variables:**
   Create a `.env` file in the `apps/mobile` directory:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
   # Add any other required public keys
   ```

4. **Start the Expo Development Server:**
   ```bash
   npx expo start -c
   ```
   * Press `i` to open in iOS Simulator
   * Press `a` to open in Android Emulator
   * Scan the QR code with the Expo Go app on your physical device

---

## Running with Docker (Alternative)

If you prefer to run the backend and its dependencies using Docker:
```bash
docker-compose up --build
```
This will spin up the FastAPI backend, PostgreSQL, Redis, and Celery worker defined in your `docker-compose.yml`.

---

## License
Confidential & Proprietary - All rights reserved.
