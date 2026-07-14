# FastAPI Authentication Backend

This backend provides:
- Signup and login with JWT authentication
- Protected dashboard endpoint
- PostgreSQL database integration via SQLAlchemy

## Setup

1. Create a PostgreSQL database named `ai_video_auth`.
2. Copy `.env.example` to `.env` and update the values if needed.
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

- POST `/signup`
- POST `/login`
- GET `/me` (requires Bearer token)
- GET `/dashboard` (requires Bearer token)
