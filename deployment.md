# Deployment Guide

This project runs as two services: a FastAPI backend and a TanStack Start frontend. The steps below use Render for the API/database and Cloudflare Workers for the frontend. You can use equivalent providers, but keep the same build/runtime requirements.

## 1. Prepare the project for production

Before the first deployment:

1. Confirm `backend/requirements.txt` includes `langchain-chroma` and `python-multipart`. The application imports/uses both at runtime.
2. **Install FFmpeg for audio processing.** The Python package `ffmpeg-python` does not install the FFmpeg executable. For a Render Python service with `backend` as its root directory, add `backend/apt.txt` containing:

   ```text
   ffmpeg
   ```

   If your provider uses a different mechanism, install its FFmpeg system package there.

The frontend reads its API URL from `VITE_API_URL`, and the backend accepts the deployed site origin from `FRONTEND_ORIGIN`. The GitHub Actions workflow below supplies the first during its production build; configure the second in the Render service settings.

## 2. Create the production database

1. Create a managed PostgreSQL database, such as Render PostgreSQL.
2. Copy its connection string (`DATABASE_URL`). Use the provider's internal/private URL when the API and database are in the same provider/network.
3. Keep the database URL private. Do not put it in frontend variables or commit it to Git.

The backend creates its SQLAlchemy tables at startup. Keep regular database backups enabled.

## 3. Deploy the backend API

1. Create a **Web Service** from the repository in Render.
2. Set **Root Directory** to `backend`.
3. Choose Python 3.11 or newer.
4. Set the build command:

   ```bash
   pip install -r requirements.txt
   ```

5. Set the start command:

   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

6. Add these backend environment variables in the provider dashboard:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Managed PostgreSQL connection string |
   | `SECRET_KEY` | A newly generated, long random secret; do not use the development default |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | Optional; defaults to `30` |
   | `MISTRAL_API_KEY` | Mistral API key; required for summaries, insights, and AI chat |
   | `FRONTEND_ORIGIN` | Exact public frontend origin, such as `https://your-app.workers.dev` (no trailing slash) |
   | `WHISPER_MODEL` | Optional; defaults to `small`. The model is downloaded when first needed |
   | `SARVAM_API_KEY` | Optional; required for Hinglish transcription |
   | `SARVAM_STT_MODEL` | Optional; defaults to `saaras:v2.5` |

   Generate a secret locally with `python -c "import secrets; print(secrets.token_urlsafe(48))"`, then save it only in the provider's secret/environment settings.
7. Deploy the service and copy its public HTTPS URL, such as `https://your-api.onrender.com`.
8. Check `https://your-api.onrender.com/docs` to confirm the API starts and its OpenAPI page loads.

### Persist vector data

Uploaded files and downloaded YouTube media are temporary and deleted after processing. Chroma conversation data is stored in the backend's local `vector_db/` directory. Attach a persistent disk at the absolute path for that directory (with Render's `backend` root directory, this is typically `/opt/render/project/src/backend/vector_db`; confirm the service's working directory in its logs/settings). Without persistent storage, vector data can disappear during redeploys or instance replacement.

Run one backend instance unless vector storage is moved to a shared/persistent service; local Chroma files are not shared across instances. The Whisper model download and transcription also require sufficient disk space, memory, and CPU.

## 4. Deploy the frontend

The frontend is a TanStack Start/Nitro app configured for Cloudflare Workers, not a plain static-site build. Deployment is automated by GitHub Actions in the next section; use the manual commands below only for an initial setup or manual deployment.

1. Create a Cloudflare account and an API token authorized to deploy Workers. GitHub Actions will create/update the Worker using the repository's Nitro configuration; a Cloudflare Workers Builds project is not required.
2. Use Node.js 22 or newer in the GitHub Actions workflow.
3. The workflow installs and builds the frontend with:

   ```bash
   npm ci
   npm run build
   ```

4. It deploys the build with:

   ```bash
   npx nitro deploy --prebuilt
   ```

   The build generates the Nitro/Cloudflare output and Wrangler configuration used by this command.
5. Add the build-time variable `VITE_API_URL` with the backend HTTPS URL from step 3. Do not include a trailing slash.
6. After the first deployment, copy the Worker's HTTPS origin and set it as `FRONTEND_ORIGIN` in the Render backend service. Redeploy the backend (for example, run the GitHub Actions workflow again). If you use a custom domain, use that exact origin instead.

## 5. Configure CI/CD with GitHub Actions

The workflow at `.github/workflows/ci-cd.yml` runs on pull requests targeting `main`, pushes to `main`, and manual workflow dispatches:

- Backend: installs `backend/requirements.txt` and runs the Python unit tests.
- Frontend: installs from the lockfile and builds the production app.
- Deploy: after both checks pass on `main`, triggers the Render deploy hook and deploys the Cloudflare Worker.

Configure these values in **GitHub repository → Settings → Secrets and variables → Actions**:

| Name | Type | Value |
| --- | --- | --- |
| `RENDER_DEPLOY_HOOK` | Secret | Deploy hook URL for the Render backend Web Service |
| `CLOUDFLARE_API_TOKEN` | Secret | Cloudflare API token authorized to deploy Workers |
| `CLOUDFLARE_ACCOUNT_ID` | Secret | Cloudflare account ID for the Worker |
| `VITE_API_URL` | Variable | Public backend HTTPS URL, without a trailing slash |

The Render service's `FRONTEND_ORIGIN` environment variable must match the Worker's public origin. If you enable any provider-side Git auto-deploy, disable it to avoid deploying outside the CI checks. The workflow's production deploy job intentionally fails with a clear error if any required GitHub value is missing.

## 6. Verify the deployed application

1. Open the frontend URL and create an account.
2. Sign in, create a conversation, and try a short video or audio upload.
3. Confirm that processing, summaries, and chat work. Check the API and frontend provider logs if a request fails.
4. In browser developer tools, verify requests go to the deployed API URL—not `localhost` or `127.0.0.1`—and check for CORS errors.
5. After a successful upload, redeploy or restart the backend and verify that the conversation's vector-backed chat still works.

## 7. Production notes

- Never commit `.env` files or expose `DATABASE_URL`, `SECRET_KEY`, or AI provider keys in frontend code or build variables. Only `VITE_API_URL` belongs in the frontend.
- Keep the API, database, and persistent vector data backed up. Database backups do not include Chroma's `vector_db/` files.
- The project has no dedicated health-check route; use `/docs` to check API availability.
- For larger workloads, use a backend instance with adequate memory and CPU for Whisper, and monitor disk usage for vector data.
