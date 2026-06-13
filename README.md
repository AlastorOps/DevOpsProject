# EMS-Ops

Employee Management System for HR operations — employee records, attendance, leave, payroll, performance reviews, roles, reporting, and system settings.

Built as a full-stack containerized DevOps application with local development, Docker Compose, and Kubernetes support.

---

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Backend | FastAPI 0.115, SQLAlchemy 2.0, Pydantic, Uvicorn |
| Database | PostgreSQL 16 |
| Frontend | React 19, Vite 8, Tailwind CSS 3.4, React Router 7 |
| Auth | JWT (HS256), bcrypt, refresh tokens, rate limiting |
| Runtime | Docker Compose or Kubernetes (Minikube) |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus, Grafana, Node Exporter |

---

## Features

| Module | Capabilities |
| ------ | ------------ |
| Auth | Login, logout, refresh tokens, forgot/reset password |
| Dashboard | Admin analytics with charts and notifications; employee personal dashboard |
| Employees | Full CRUD, photo upload, manager assignment, search and filter |
| Attendance | Daily check-in/out, status tracking, admin management |
| Leave | Request workflow with approval/rejection, leave balance tracking |
| Payroll | Salary records, payslip generation and download, approval flow |
| Performance | Manager reviews with ratings, employee history |
| Departments | Org hierarchy management |
| Positions | Job titles with salary ranges |
| Users | Account creation, status toggle, password management |
| Roles | RBAC with granular permission configuration |
| Settings | Organization name, logo upload, system config |
| Reports | HR report generation, data exports |
| Profile | Personal info edit, photo upload, password change |
| Monitoring | Prometheus metrics, Grafana dashboards, Node Exporter |

**Default roles:** Admin, HR Manager, Manager, Employee

---

## Project Structure

```text
.
├── backend/                  FastAPI app, routers, schemas, models, tests, Dockerfile
├── database/                 SQL schema, seed data, demo data
├── frontend/                 React/Vite app, nginx config, Dockerfile
├── kubernetes/               K8s manifests for all services + monitoring
├── monitoring/               Prometheus config and Grafana dashboard starter
├── .github/workflows/        CI/CD pipeline
├── docker-compose.yml        Local full-stack environment
├── package.json              Root dev orchestration scripts
└── README.md
```

---

## Prerequisites

| Tool | Version | Required for |
| ---- | ------- | ------------ |
| Docker Desktop | Current | Docker Compose |
| Node.js | 22+ | Frontend dev |
| Python | 3.12 | Backend dev |
| kubectl | Current | Kubernetes |
| Minikube | Current | Local Kubernetes |

Use Python 3.12 for the backend. Python 3.14 can fail with pinned native dependencies.

---

## Quick Start — Docker Compose

**1. Clone the repository**

```powershell
git clone <repo-url>
cd <project-folder>
```

**2. Create the root `.env` file**

```env
POSTGRES_PASSWORD=replace-with-strong-postgres-password
SECRET_KEY=replace-with-64-character-random-hex-string
ADMIN_PASSWORD=replace-with-strong-admin-password
DOCKER_USERNAME=your-dockerhub-username
```

Generate a secure secret key:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

**3. Build and start**

```powershell
docker compose up --build -d
```

**4. Open the app**

| Service | URL |
| ------- | --- |
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 |
| PostgreSQL | localhost:5433 |

**5. Log in**

| Account | Email | Password |
| ------- | ----- | -------- |
| Admin | `admin@company.com` | Your `Admin@1234` |
| Demo employees | `firstname.lastname@ems-ops.com` | `Employee@123` |

Demo accounts: `alice.johnson@ems-ops.com`, `bob.williams@ems-ops.com`, etc. See `database/init/03_fake_data.sql` for the full list.

**6. Stop / reset**

```powershell
# Stop
docker compose down

# Stop and delete all data volumes
docker compose down -v
```

---

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

Create `backend/.env`:

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

Dev server runs at `http://localhost:5173`. Vite proxies `/api` and `/uploads` to `http://localhost:8000`.

### Run Both at Once

After installing backend and frontend dependencies:

```powershell
npm install
npm run dev
```

---

## Kubernetes (Minikube)

### Files

| File | Purpose |
| ---- | ------- |
| `00-namespace.yaml` | `ems-ops` namespace |
| `secrets.example.yaml` | Safe template for required secrets |
| `secrets.yaml` | Local real secrets file, ignored by Git |
| `database.yaml` | PostgreSQL StatefulSet, Service, PVC (5Gi) |
| `backend.yaml` | FastAPI Deployment (Recreate), Service, uploads PVC (2Gi) |
| `deployment.yaml` | Frontend nginx Deployment (2 replicas) |
| `service.yaml` | Frontend ClusterIP Service |
| `ingress.yaml` | nginx Ingress route for `ems-ops.local` |
| `monitoring.yaml` | Prometheus, Grafana, Node Exporter Deployments, Services, PVCs |
| `kustomization.yaml` | Applies all resources except secrets |

### Deploy

**1. Start Minikube**

```powershell
minikube start
minikube addons enable ingress
```

**2. Build and load images**

```powershell
docker build -t alastorops/employee-management-backend:latest ./backend
docker build -t alastorops/employee-management-frontend:latest ./frontend
minikube image load alastorops/employee-management-backend:latest
minikube image load alastorops/employee-management-frontend:latest
```

**3. Apply secrets**

```powershell
Copy-Item kubernetes/secrets.example.yaml kubernetes/secrets.yaml
# Edit secrets.yaml with real base64-encoded values
kubectl apply -f kubernetes/secrets.yaml
```

**4. Deploy all resources**

```powershell
kubectl apply -k kubernetes/
```

**5. Initialize the database (first deploy only)**

```powershell
kubectl cp database/init/01_schema.sql ems-ops/ems-ops-db-0:/tmp/01_schema.sql
kubectl cp database/init/02_seed.sql ems-ops/ems-ops-db-0:/tmp/02_seed.sql
kubectl exec -n ems-ops ems-ops-db-0 -- psql -U postgres -d emsops -f /tmp/01_schema.sql
kubectl exec -n ems-ops ems-ops-db-0 -- psql -U postgres -d emsops -f /tmp/02_seed.sql
```

**6. Check status**

```powershell
kubectl get pods -n ems-ops
```

All pods should reach `1/1 Running`. The backend has an init container that waits for the database before starting.

### Access the App (Minikube)

Port-forward to access services from your browser:

```powershell
# Frontend (main app)
kubectl port-forward svc/ems-ops-frontend-svc -n ems-ops 8080:80

# Grafana
kubectl port-forward svc/grafana -n ems-ops 3000:3000

# Prometheus
kubectl port-forward svc/prometheus -n ems-ops 9090:9090
```

| Service | URL |
| ------- | --- |
| Frontend | http://localhost:8080 |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |

Alternatively, add a hosts entry and use the Ingress:

```text
127.0.0.1  ems-ops.local
```

Then run `minikube tunnel` and open `http://ems-ops.local`.

### Day-to-Day Usage

```powershell
# Start
minikube start
kubectl port-forward svc/ems-ops-frontend-svc -n ems-ops 8080:80

# Stop
minikube stop
```

No need to re-apply manifests. Kubernetes remembers all deployed resources after restart.

---

## Environment Variables

### Root `.env` (Docker Compose)

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `POSTGRES_PASSWORD` | Yes | PostgreSQL password |
| `SECRET_KEY` | Yes | JWT signing secret, 32+ random characters |
| `ADMIN_PASSWORD` | Yes | Initial admin account password |
| `DOCKER_USERNAME` | No | Docker Hub namespace for image tags |

### Backend `.env` (Local Dev)

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SECRET_KEY` | Yes | JWT signing secret |
| `ADMIN_PASSWORD` | Yes | Initial admin password |
| `ALGORITHM` | No | Defaults to `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Defaults to `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | Defaults to `7` |
| `CORS_ORIGINS` | No | JSON array of allowed origins |
| `UPLOAD_DIR` | No | Defaults to `uploads` |

### Frontend `.env` (Optional)

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `VITE_API_BASE_URL` | `/api` | Backend API prefix |

---

## Monitoring

Both Docker Compose and Kubernetes include a full monitoring stack.

**Prometheus** scrapes:
- Backend `/metrics` (via `prometheus-fastapi-instrumentator`)
- Node Exporter system metrics (CPU, memory, disk, network)
- Prometheus self-metrics

**Grafana** default credentials: `admin` / `admin`

Import the starter dashboard from:
```text
monitoring/grafana/dashboards/backend.json
```

---

## CI/CD

GitHub Actions workflow: `.github/workflows/main.yml`

**Triggers:** push or pull request to `main`, `dev`, `feature/**`

**Pipeline stages:**

| Stage | Steps |
| ----- | ----- |
| build-frontend | Install (npm ci), lint (ESLint), build (Vite) |
| build-backend | Install (pip), test (pytest, Python 3.12) |
| docker | Build multi-platform images, push to Docker Hub (main/dev only) |

Docker images pushed:
- `{DOCKER_USERNAME}/employee-management-frontend`
- `{DOCKER_USERNAME}/employee-management-backend`

Tags: `latest` (main branch), `dev`, git SHA

**Required GitHub secrets:**

| Secret | Description |
| ------ | ----------- |
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub access token |

---

## Testing

**Backend (38 tests):**

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest
```

**Frontend:**

```powershell
cd frontend
npm run lint
npm run build
```

**Docker Compose config validation:**

```powershell
docker compose config
```

---

## Security Notes

- `.env`, `backend/.env`, and `kubernetes/secrets.yaml` are ignored by Git.
- Do not commit real secrets, passwords, kubeconfigs, or certificates.
- Use strong unique values for `SECRET_KEY`, `ADMIN_PASSWORD`, and `POSTGRES_PASSWORD`.
- Restrict `CORS_ORIGINS` to real production domains.
- Use TLS at ingress in production (cert-manager stub is in `ingress.yaml`).
- Use a managed secret store (e.g. Vault, AWS Secrets Manager) for production.

---

## Known Limitations

- Kubernetes database schema is initialized manually on first deploy.
- Schema migrations require manual SQL — no Alembic auto-migration in the container.
- Token revocation/blacklisting is not implemented.
- Uploads PVC uses `ReadWriteOnce` — backend replicas must stay at 1 on Minikube.
- Grafana dashboards must be imported manually from `monitoring/grafana/dashboards/`.

---

## Useful Commands

```powershell
# Docker Compose
docker compose up --build -d
docker compose down
docker compose down -v            # wipe all volumes
docker compose logs -f backend

# Kubernetes
kubectl apply -k kubernetes/
kubectl get pods -n ems-ops
kubectl get all -n ems-ops
kubectl logs -n ems-ops deployment/ems-ops-backend
kubectl port-forward svc/ems-ops-frontend-svc -n ems-ops 8080:80

# Backend tests
cd backend
.\.venv\Scripts\python.exe -m pytest

# Frontend
cd frontend
npm run lint
npm run build
```
