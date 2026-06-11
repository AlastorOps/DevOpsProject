# EMS-Ops

Employee Management System for HR operations, employee records, attendance, leave, payroll, performance reviews, roles, reporting, and system settings.

The project is built as a full-stack DevOps application:

- Backend: FastAPI, SQLAlchemy, Pydantic, PostgreSQL
- Frontend: React, Vite, Tailwind CSS
- Runtime: Docker Compose or Kubernetes
- CI/CD: GitHub Actions
- Monitoring: Prometheus and Grafana starter configuration

## Project Structure

```text
.
├── backend/                  FastAPI app, tests, Dockerfile
├── database/                 SQL schema, seed data, demo data, Alembic files
├── frontend/                 React/Vite app and nginx Docker config
├── kubernetes/               Namespace, database, backend, frontend, ingress
├── monitoring/               Prometheus config and Grafana dashboard starter
├── .github/workflows/        CI/CD workflow
├── docker-compose.yml
├── package.json              Root dev orchestration scripts
└── README.md
```

## Prerequisites

| Tool | Version |
| ---- | ------- |
| Docker Desktop | Current |
| Node.js | 22+ |
| Python | 3.12 |
| kubectl | Current, for Kubernetes only |

Use Python 3.12 for the backend. Python 3.14 can fail with the pinned native dependencies because compatible wheels may not be available.

## Quick Start With Docker Compose

Create a root `.env` file:

```env
POSTGRES_PASSWORD=replace-with-strong-postgres-password
SECRET_KEY=replace-with-64-character-random-hex-string
ADMIN_PASSWORD=replace-with-strong-admin-password
DOCKER_USERNAME=your-dockerhub-username
```

Generate a strong secret key:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

Start the stack:

```powershell
docker compose up --build -d
```

Open:

| Service | URL |
| ------- | --- |
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| PostgreSQL | localhost:5433 |

Stop the stack:

```powershell
docker compose down
```

Reset all Docker data:

```powershell
docker compose down -v
```

## Local Development

### Backend

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Create `backend/.env` for local backend development:

```env
DATABASE_URL=postgresql://postgres:replace-with-password@localhost:5433/emsops
SECRET_KEY=replace-with-64-character-random-hex-string
ADMIN_PASSWORD=replace-with-strong-admin-password
CORS_ORIGINS=["http://localhost:5173","http://localhost:8080"]
UPLOAD_DIR=uploads
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend dev server runs at `http://localhost:5173`. Vite proxies `/api` and `/uploads` to `http://localhost:8000`.

### Root Dev Script

After installing backend and frontend dependencies, the root script can run both apps:

```powershell
npm install
npm run dev
```

## Testing And Validation

Backend tests:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest
```

Current verified result:

```text
38 passed
```

Frontend checks:

```powershell
cd frontend
npm run lint
npm run build
```

Docker Compose static validation:

```powershell
docker compose config
```

## Environment Variables

### Root `.env`

Used by Docker Compose.

| Variable | Required | Description |
| -------- | -------- | ----------- |
| POSTGRES_PASSWORD | Yes | PostgreSQL password |
| SECRET_KEY | Yes | JWT signing secret, 32+ random characters |
| ADMIN_PASSWORD | Yes | Initial admin password |
| DOCKER_USERNAME | No | Docker Hub namespace for image tags |

### Backend `.env`

Used by local FastAPI development.

| Variable | Required | Description |
| -------- | -------- | ----------- |
| DATABASE_URL | Yes | Database connection string |
| SECRET_KEY | Yes | JWT signing secret |
| ADMIN_PASSWORD | Yes | Initial admin password |
| ALGORITHM | No | Defaults to `HS256` |
| ACCESS_TOKEN_EXPIRE_MINUTES | No | Defaults to `30` |
| REFRESH_TOKEN_EXPIRE_DAYS | No | Defaults to `7` |
| CORS_ORIGINS | No | JSON array of allowed origins |
| UPLOAD_DIR | No | Defaults to `uploads` |

### Frontend `.env`

Optional for local frontend development.

| Variable | Default | Description |
| -------- | ------- | ----------- |
| VITE_API_BASE_URL | `/api` | Backend API prefix |

## Kubernetes

The `kubernetes/` folder contains:

| File | Purpose |
| ---- | ------- |
| `00-namespace.yaml` | Namespace |
| `secrets.example.yaml` | Safe template for required secrets |
| `secrets.yaml` | Local real secret file, ignored by Git |
| `database.yaml` | PostgreSQL StatefulSet and Service |
| `backend.yaml` | FastAPI Deployment, Service, and uploads PVC |
| `deployment.yaml` | Frontend nginx Deployment |
| `service.yaml` | Frontend ClusterIP Service |
| `ingress.yaml` | nginx ingress route |
| `kustomization.yaml` | Applies non-secret Kubernetes resources |

Create the namespace:

```powershell
kubectl apply -f kubernetes/00-namespace.yaml
```

Create real secrets from the template:

```powershell
Copy-Item kubernetes/secrets.example.yaml kubernetes/secrets.yaml
```

Edit `kubernetes/secrets.yaml`, then apply it:

```powershell
kubectl apply -f kubernetes/secrets.yaml
```

Deploy the app resources:

```powershell
kubectl apply -k kubernetes
```

Initialize the database on first Kubernetes deploy:

```powershell
kubectl cp database/init/01_schema.sql ems-ops/ems-ops-db-0:/tmp/01_schema.sql
kubectl cp database/init/02_seed.sql ems-ops/ems-ops-db-0:/tmp/02_seed.sql
kubectl exec -n ems-ops ems-ops-db-0 -- psql -U postgres -d emsops -f /tmp/01_schema.sql
kubectl exec -n ems-ops ems-ops-db-0 -- psql -U postgres -d emsops -f /tmp/02_seed.sql
```

Check status:

```powershell
kubectl get all -n ems-ops
```

For local ingress, add this hosts entry:

```text
127.0.0.1 ems-ops.local
```

Then open `http://ems-ops.local`.

## Monitoring

`monitoring/prometheus.yml` currently scrapes:

- Prometheus self-metrics
- Optional `node-exporter`

The backend Prometheus scrape is commented out because the FastAPI app does not currently expose a Prometheus-format `/metrics` endpoint. Add a FastAPI metrics exporter before enabling that target.

Grafana dashboard starter:

```text
monitoring/grafana/dashboards/backend.json
```

See `monitoring/README.md` for import notes.

## CI/CD

GitHub Actions workflow:

```text
.github/workflows/main.yml
```

Pipeline stages:

- Frontend: install, lint, build
- Backend: install dependencies, run pytest with Python 3.12
- Docker: build and push frontend/backend images on `main` and `dev`

Required GitHub secrets for Docker publishing:

| Secret | Description |
| ------ | ----------- |
| DOCKER_USERNAME | Docker Hub username |
| DOCKER_PASSWORD | Docker Hub access token |

## Security Notes

- `.env`, `backend/.env`, and `kubernetes/secrets.yaml` are ignored by Git.
- Do not commit real secrets, passwords, kubeconfigs, or local certificates.
- Use strong unique values for `SECRET_KEY`, `ADMIN_PASSWORD`, and `POSTGRES_PASSWORD`.
- Restrict `CORS_ORIGINS` to real production domains.
- Use TLS at ingress in production.
- Use a managed secret store for production deployments.

## Known Limitations

- Kubernetes database schema is initialized manually.
- The app creates tables on startup, but existing database schema changes still need migrations or manual SQL.
- Backend Prometheus metrics are not exposed yet.
- Token revocation/blacklisting is not implemented.

## Useful Commands

```powershell
# Frontend
cd frontend
npm run lint
npm run build

# Backend
cd backend
.\.venv\Scripts\python.exe -m pytest

# Docker
docker compose config
docker compose up --build -d
docker compose down

# Kubernetes
kubectl apply -k kubernetes
kubectl get all -n ems-ops
```
