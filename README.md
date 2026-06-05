# EMS Operations — Employee Management System

A full-stack HR platform for managing employees, departments, payroll, attendance, leave, and performance reviews.

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI 0.115, Python 3.12, SQLAlchemy 2.0 |
| Database | PostgreSQL 16 |
| Frontend | React 19, Vite, Tailwind CSS |
| Auth | JWT (python-jose + passlib/bcrypt) |
| Container | Docker Compose / Kubernetes |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus + Grafana |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Compose)
- Node.js 22+ and npm (for local frontend development)
- Python 3.12+ (for local backend development)

---

## Quick Start — Docker Compose

```bash
# 1. Clone the repo
git clone <repo-url>
cd DevOpsProject

# 2. Create your local env file from the template
cp .env.example .env
# Edit .env and set a strong POSTGRES_PASSWORD

# 3. Create the backend env file
cp backend/.env.example backend/.env
# Edit backend/.env — set DATABASE_URL (use the same password), SECRET_KEY, ADMIN_PASSWORD

# 4. Start all services
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:8000 |
| API docs (Swagger) | http://localhost:8000/docs |
| Database | localhost:5433 |

Default admin login (first boot only):
- **Email:** `admin@company.com`
- **Password:** value of `ADMIN_PASSWORD` in `backend/.env`

---

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # fill in values
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL=http://localhost:8000
npm run dev            # starts at http://localhost:5173
```

### Run both together (root)

```bash
npm install
npm run dev
```

---

## Environment Variables

### Root `.env` (used by Docker Compose for variable substitution)

| Variable | Description |
|----------|-------------|
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `DOCKER_USERNAME` | Docker Hub username for image tagging |

### `backend/.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | Full PostgreSQL connection string |
| `SECRET_KEY` | — | JWT signing key — generate with `python -c "import secrets,base64; print(base64.urlsafe_b64encode(secrets.token_bytes(32)).decode())"` |
| `ADMIN_PASSWORD` | — | Password seeded for `admin@company.com` on first boot |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token lifetime |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | Allowed CORS origins (JSON array) |
| `UPLOAD_DIR` | `uploads` | Directory for uploaded files |

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/main.yml`) runs on every push and PR to `main`, `dev`, and `feature/**` branches:

1. **Frontend CI** — `npm ci`, lint, build
2. **Backend CI** — `pip install`, import verification
3. **Docker build & push** (main branch only) — builds and pushes images to Docker Hub

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password or access token |
| `CI_SECRET_KEY` | JWT secret key for CI backend checks |

---

## Kubernetes Deployment

> The `kubernetes/` directory contains basic manifests. Update the image placeholder before applying.

```bash
# 1. Replace DOCKER_USERNAME in deployment.yaml with your Docker Hub username
sed -i 's/DOCKER_USERNAME/yourusername/g' kubernetes/deployment.yaml

# 2. Create namespace
kubectl apply -f kubernetes/namespace.yaml

# 3. Apply manifests
kubectl apply -f kubernetes/
```

> **Note:** Kubernetes manifests currently cover the frontend only. Backend, database, and persistent volume manifests are not yet defined — see open issues.

---

## API Reference

Interactive docs are served by FastAPI automatically:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Main endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Obtain JWT tokens |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/employees` | List employees |
| GET | `/departments` | List departments |
| GET | `/attendance` | Attendance records |
| GET | `/leave` | Leave requests |
| GET | `/payroll` | Payroll records |
| GET | `/performance` | Performance reviews |
| GET | `/dashboard` | Dashboard analytics |
| GET | `/health` | Health check |

---

## Project Structure

```
DevOpsProject/
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── main.py        # App entry point, lifespan, seeding
│   │   ├── config.py      # Pydantic settings
│   │   ├── models.py      # SQLAlchemy models
│   │   ├── database.py    # DB engine and session
│   │   ├── auth.py        # Password hashing, JWT helpers
│   │   ├── dependencies.py# Auth dependencies
│   │   ├── routers/       # One file per feature module
│   │   └── schemas/       # Pydantic request/response schemas
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/              # React + Vite SPA
│   ├── src/
│   │   ├── features/      # Feature-scoped components
│   │   ├── components/    # Shared UI components
│   │   ├── context/       # React context providers
│   │   └── hooks/         # Custom hooks
│   └── Dockerfile
├── kubernetes/            # K8s manifests (frontend only)
├── monitoring/            # Prometheus + Grafana config
├── .github/workflows/     # CI/CD pipeline
├── docker-compose.yml
└── .env.example           # Environment variable template
```

---

## Known Gaps

The following are tracked as open issues:

- No database migration system (Alembic) — schema is created via `create_all` on startup
- No automated test suite (pytest / Vitest)
- Kubernetes manifests incomplete — backend and database not defined
- CI pipeline runs no tests — only an import check
- Health check does not verify database connectivity
- No structured logging
- No user session/token revocation on logout
