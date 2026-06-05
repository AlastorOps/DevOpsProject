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

```
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
=======
# EMS-Ops — Employee Management System

A full-stack HR and employee management platform with a React frontend, FastAPI backend, PostgreSQL database, Docker Compose for local deployment, Kubernetes manifests for production, Prometheus/Grafana monitoring, and a GitHub Actions CI/CD pipeline.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start (Local Dev)](#quick-start-local-dev)
- [Docker Compose](#docker-compose)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Roles & Permissions](#roles--permissions)
- [CI/CD Pipeline](#cicd-pipeline)
- [Kubernetes](#kubernetes)
- [Monitoring](#monitoring)

---

## Features

| Module | Capabilities |
|---|---|
| **Authentication** | JWT login/refresh, role-based access, password reset |
| **Employee Management** | Directory, profiles, add/edit/deactivate employees |
| **Organization** | Department and position management |
| **Attendance** | Clock-in/out tracking, daily records |
| **Leave Management** | Leave requests, approval workflow, balance tracking |
| **Payroll** | Salary processing, payslip generation, export |
| **Performance Reviews** | Review cycles, ratings, comments |
| **User Accounts** | User creation, role assignment, status control |
| **Personal Profile** | Self-service name/email update, password change |
| **System Settings** | Org details, notification preferences, 2FA toggle |
| **Dashboards** | Admin analytics dashboard + Employee personal dashboard |
| **Reports** | System-wide report generation and export |
| **Theming** | Light / Dark / System theme with persistent preference |

---

## Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS with Material Design 3 color tokens
- React Router v6
- Material Symbols (Google Icons)

**Backend**
- Python 3.12 + FastAPI
- SQLAlchemy 2.0 (ORM)
- Pydantic v2 (validation & schemas)
- PostgreSQL 16
- JWT authentication via `python-jose` + `bcrypt`

**Infrastructure**
- Docker + Docker Compose
- Kubernetes (Namespace / Deployment / Service / Ingress)
- Prometheus + Grafana (metrics & dashboards)
- GitHub Actions (CI/CD)

---

## Project Structure

```
EMS-Ops/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, lifespan, seeding
│   │   ├── config.py          # Pydantic settings (reads .env)
│   │   ├── database.py        # SQLAlchemy engine & session
│   │   ├── models.py          # ORM models
│   │   ├── auth.py            # JWT helpers, password hashing
│   │   ├── dependencies.py    # Auth guards (get_current_user, require_admin…)
│   │   ├── routers/           # One file per feature module
│   │   └── schemas/           # Pydantic request/response models
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/App.jsx        # Route definitions
│   │   ├── components/        # Shared layout + UI primitives
│   │   ├── context/           # AuthContext (login, logout, updateUser)
│   │   ├── features/          # Screen-level modules by domain
│   │   └── hooks/useTheme.js  # Light/dark/system theme hook
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── Dockerfile
├── kubernetes/
│   ├── namespace.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
├── monitoring/
│   ├── prometheus.yml
│   └── grafana/dashboards/backend.json
├── .github/workflows/main.yml
├── docker-compose.yml
├── .env                       # Root env (used by docker-compose)
└── package.json               # Root scripts (runs both services)
```

---

## Quick Start (Local Dev)

### Prerequisites

- Node.js 22+
- Python 3.12+
- PostgreSQL running locally **or** use Docker Compose (see below)

### 1. Clone and install root tooling

```bash
git clone <repo-url>
cd "DevOps Project"
npm install
```

### 2. Set up the backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
<<<<<<< HEAD
cp .env.example .env   # fill in values
uvicorn app.main:app --reload --port 8000
```

### Frontend
=======
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:devpass@localhost:5432/emsops
SECRET_KEY=your-random-32-char-secret-key-here
ADMIN_PASSWORD=Admin@1234
```

### 3. Set up the frontend

```bash
cd frontend
npm install
<<<<<<< HEAD
cp .env.example .env   # set VITE_API_BASE_URL=http://localhost:8000
npm run dev            # starts at http://localhost:5173
```

### Run both together (root)

```bash
npm install
npm run dev
```

=======
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:8000
```

### 4. Run both services

From the project root:

```bash
npm run dev
```

This starts:
- Backend → `http://localhost:8000` (Uvicorn + auto-reload)
- Frontend → `http://localhost:5173` (Vite HMR)

On first run the backend automatically:
- Creates all database tables
- Seeds the four system roles (Admin, HR Manager, Manager, Employee)
- Creates the default admin account
- Creates default system settings

### Default Admin Credentials

| Field | Value |
|---|---|
| Email | `admin@company.com` |
| Password | `Admin@1234` *(set via `ADMIN_PASSWORD` env var)* |

> Change `ADMIN_PASSWORD` before any non-local deployment.

---

## Docker Compose

Runs the full stack (PostgreSQL + backend + frontend) in containers.

### 1. Configure root `.env`

```env
POSTGRES_PASSWORD=your-db-password
SECRET_KEY=your-random-32-char-secret-key-here
ADMIN_PASSWORD=Admin@1234
DOCKER_USERNAME=your-dockerhub-username   # optional, used for image tagging
```

### 2. Build and start

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:8080` |
| Backend API | `http://localhost:8000` |
| API Docs | `http://localhost:8000/docs` |
| PostgreSQL | `localhost:5433` |

### Stop

```bash
docker compose down          # stop containers
docker compose down -v       # stop and remove volumes
```

---

## Environment Variables

<<<<<<< HEAD
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
=======
### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `SECRET_KEY` | Yes | — | JWT signing key (min 32 chars) |
| `ADMIN_PASSWORD` | Yes | — | Password for the seeded admin account |
| `ALGORITHM` | No | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `30` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | `7` | Refresh token lifetime |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated allowed origins |
| `UPLOAD_DIR` | No | `uploads` | Directory for uploaded files |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | No | `http://localhost:8000` | Backend base URL |

---

## API Overview

Interactive docs available at `http://localhost:8000/docs` when the backend is running.

| Prefix | Description | Auth required |
|---|---|---|
| `POST /auth/login` | Obtain access + refresh tokens | No |
| `POST /auth/refresh` | Rotate tokens | No |
| `GET /auth/me` | Current user info | Yes |
| `GET/POST /employees` | Employee directory | Yes |
| `GET/PUT /employees/{id}` | Employee detail | Yes (self or HR+) |
| `GET/POST /departments` | Departments | Yes |
| `GET/POST /positions` | Positions | Yes |
| `GET/POST /attendance` | Attendance records | Yes |
| `GET/POST /leave` | Leave requests | Yes |
| `GET/POST /payroll` | Payroll records | HR+ |
| `GET/POST /performance` | Performance reviews | Yes |
| `GET/POST /users` | User accounts | Admin |
| `GET /users/profile/me` | Own profile | Yes |
| `PUT /users/profile/me` | Update own name/email | Yes |
| `PUT /users/profile/password` | Change own password | Yes |
| `GET/PUT /roles` | Role permissions | Admin |
| `GET/PUT /settings` | System settings | Admin |
| `GET /dashboard` | Dashboard statistics | Yes |
| `GET /reports` | System reports | HR+ |
| `GET /health` | Health check | No |

---

## Roles & Permissions

| Role | Access Level |
|---|---|
| **Admin** | Full access to all modules |
| **HR Manager** | Employee management, payroll, leave approval, reports |
| **Manager** | Team view, performance reviews, leave approval |
| **Employee** | Personal dashboard, own attendance/leave, own profile |

Roles and their module permissions are seeded automatically on first start and can be customized via **Settings → Roles & Permissions** in the UI.
>>>>>>> 3a4016af3185dc214f873ba808f24b3185e9d7d6

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/main.yml`) runs on every push and PR to `main`, `dev`, and `feature/**` branches:

1. **Frontend CI** — `npm ci`, lint, build
2. **Backend CI** — `pip install`, import verification
3. **Docker build & push** (main branch only) — builds and pushes images to Docker Hub
=======
Defined in [`.github/workflows/main.yml`](.github/workflows/main.yml).

Triggers on push or pull request to `main`, `dev`, or `feature/**` branches.

### Jobs

```
push to any branch
    ├── Frontend CI        (Node 22 — npm ci → lint → build)
    └── Backend CI         (Python 3.12 — pip install → import check)
            │
            └── Docker (main branch only, after both CI jobs pass)
                    ├── Build & push frontend image to Docker Hub
                    └── Build & push backend image to Docker Hub
```

Images are tagged with both `:latest` and `:<git-sha>`.

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password or access token |
| `CI_SECRET_KEY` | JWT secret key for CI backend checks |

---

## Kubernetes Deployment

> The `kubernetes/` directory contains basic manifests. Update the image placeholder before applying.

```
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
=======
|---|---|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub access token |

---

## Kubernetes

Manifests are in the [`kubernetes/`](kubernetes/) directory.

```
# Create namespace
kubectl apply -f kubernetes/namespace.yaml

# Deploy services
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml
kubectl apply -f kubernetes/ingress.yaml
```

> Update `image: DOCKER_USERNAME/...` in `deployment.yaml` to match your Docker Hub username before applying.

The deployment runs **2 replicas** of the frontend with liveness and readiness probes configured.

---

## Monitoring

Prometheus and Grafana configs are in [`monitoring/`](monitoring/).

**Prometheus** scrapes:
- `backend:8000/metrics` — FastAPI application metrics
- `node-exporter:9100` — host-level metrics
- `localhost:9090` — Prometheus self-monitoring

A pre-built **Grafana dashboard** for backend metrics is at `monitoring/grafana/dashboards/backend.json`. Import it via Grafana UI → Dashboards → Import.
