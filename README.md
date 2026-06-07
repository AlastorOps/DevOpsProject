# EMS-Ops — Employee Management System

A full-stack HR and Employee Management System for managing employees, departments, attendance, leave, payroll, performance reviews, and role-based access control.

Built on a modern DevOps architecture: FastAPI · React · PostgreSQL · Docker · Kubernetes · GitHub Actions CI/CD.

---

## Features

| Module              | Capabilities                                                  |
| ------------------- | ------------------------------------------------------------- |
| Authentication      | JWT login, refresh tokens, role-based access control          |
| Employee Management | Create, update, view, deactivate employees, photo upload      |
| Organization        | Department and position management                            |
| Attendance          | Daily check-in/check-out tracking and reporting               |
| Leave Management    | Leave requests, manager approvals, balance tracking           |
| Payroll             | Salary processing, payslip generation, approval workflow      |
| Performance Reviews | Employee evaluations with ratings and cycles                  |
| User Management     | User accounts, role assignments, status control, CSV export   |
| Profile Management  | Self-service profile updates and password changes             |
| Roles & Permissions | Fully configurable module-level access control                |
| Dashboard           | Admin KPIs and employee self-service dashboard                |
| Reports             | System reporting and analytics with export                    |
| Settings            | Organization profile, logo upload, notification preferences   |
| Monitoring          | Prometheus metrics and Grafana dashboards                     |

---

## Tech Stack

| Layer            | Technology                              |
| ---------------- | --------------------------------------- |
| Backend          | FastAPI 0.115, Python 3.12              |
| Database         | PostgreSQL 16                           |
| Frontend         | React 19, Vite, Tailwind CSS            |
| Authentication   | JWT — python-jose + passlib/bcrypt      |
| ORM              | SQLAlchemy 2.0 (mapped_column API)      |
| Validation       | Pydantic v2                             |
| Containerization | Docker + Docker Compose                 |
| Orchestration    | Kubernetes (nginx-ingress)              |
| Monitoring       | Prometheus + Grafana                    |
| CI/CD            | GitHub Actions                          |

---

## Architecture

```
Browser
  │
  ▼
React (Vite)  ──npm run dev──►  Vite proxy  ──►  FastAPI :8000
  │                                                    │
  │   Docker / Kubernetes                              ▼
  └──► Nginx :80  ──/api/──►  FastAPI :8000       PostgreSQL :5432
                                   │
                                   ▼
                            /uploads  (static files)

Monitoring:
Prometheus ──► Grafana
```

---

## Project Structure

```
EMS-Ops/
├── backend/
│   ├── app/
│   │   ├── main.py               # App entry point, lifespan, static mounts
│   │   ├── config.py             # Settings from environment
│   │   ├── database.py           # SQLAlchemy engine + session
│   │   ├── models.py             # ORM models
│   │   ├── auth.py               # JWT helpers
│   │   ├── dependencies.py       # Auth guards (require_admin, require_hr …)
│   │   ├── routers/              # One file per domain
│   │   └── schemas/              # Pydantic request/response models
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/                  # Centralized service layer (one file per domain)
│   │   ├── components/           # Shared UI components
│   │   ├── context/              # AuthContext (JWT + user state)
│   │   ├── features/             # Page-level components by domain
│   │   └── lib/                  # Legacy shim (re-exports api client)
│   ├── nginx.conf                # Nginx reverse-proxy config (Docker)
│   ├── Dockerfile
│   └── package.json
│
├── database/
│   └── init/
│       ├── 01_schema.sql         # Full schema — runs once on empty volume
│       ├── 02_seed.sql           # Roles, settings, admin account
│       └── 03_fake_data.sql      # 15 demo employees (password: Employee@123)
│
├── kubernetes/
│   ├── 00-namespace.yaml         # Must be applied first
│   ├── secrets.yaml              # Base64 credentials — gitignored
│   ├── database.yaml             # Postgres StatefulSet + Service + PVC
│   ├── backend.yaml              # FastAPI Deployment + Service + PVC
│   ├── deployment.yaml           # React/Nginx Deployment
│   ├── service.yaml              # Frontend ClusterIP Service
│   └── ingress.yaml              # nginx-ingress → frontend
│
├── monitoring/
│   ├── prometheus.yml
│   └── grafana/dashboards/
│
├── .github/workflows/
│   └── main.yml                  # CI/CD pipeline
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Prerequisites

| Tool            | Version  | Notes                          |
| --------------- | -------- | ------------------------------ |
| Docker Desktop  | Latest   | Required for all Docker flows  |
| Node.js         | 22+      | Frontend local dev only        |
| Python          | 3.12+    | Backend local dev only         |
| kubectl         | Latest   | Kubernetes deployment only     |

---

## Quick Start — Docker Compose

### 1. Clone

```bash
git clone <repo-url>
cd EMS-Ops
```

### 2. Create environment file

Create a `.env` file in the project root:

```env
POSTGRES_PASSWORD=your-postgres-password
SECRET_KEY=your-jwt-secret-key
ADMIN_PASSWORD=Admin@1234
DOCKER_USERNAME=your-dockerhub-username
```

> Generate a strong `SECRET_KEY`:
> ```bash
> python -c "import secrets; print(secrets.token_hex(32))"
> ```

### 3. Build and start

```bash
docker-compose up --build -d
```

On first boot, PostgreSQL automatically runs the init scripts in `database/init/`:
- Creates all tables
- Seeds roles, system settings, and the admin account
- Loads 15 demo employees with fake data

### 4. Open the app

| Service     | URL                        |
| ----------- | -------------------------- |
| Frontend    | http://localhost:8080      |
| Backend API | http://localhost:8000      |
| Swagger UI  | http://localhost:8000/docs |
| PostgreSQL  | localhost:5433             |

### 5. Log in

| Role       | Email                   | Password       |
| ---------- | ----------------------- | -------------- |
| Admin      | admin@company.com       | *(ADMIN_PASSWORD from .env)* |
| Any demo employee | *(work email from employee list)* | Employee@123 |

---

## Stopping and Resetting

```bash
# Stop containers (keeps data)
docker-compose down

# Stop and delete all data volumes (full reset)
docker-compose down -v
```

---

## Database Migrations

This project uses `Base.metadata.create_all()` — it creates tables on first boot but does **not** run ALTER TABLE on existing databases.

If you added the `photo_path` column after your database was already created, run this once:

```bash
docker exec ems-db psql -U postgres -d emsops -c \
  "ALTER TABLE employees ADD COLUMN IF NOT EXISTS photo_path VARCHAR(500);"
```

---

## Local Development

### Backend

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:your-password@localhost:5433/emsops
SECRET_KEY=your-secret-key
ADMIN_PASSWORD=Admin@1234
CORS_ORIGINS=["http://localhost:5173","http://localhost:8080"]
UPLOAD_DIR=uploads
```

Start the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api` and `/uploads` to `http://localhost:8000` automatically via `vite.config.js`.

Frontend runs at: `http://localhost:5173`

---

## Environment Variables

### Root `.env` (Docker Compose)

| Variable          | Required | Description                       |
| ----------------- | -------- | --------------------------------- |
| POSTGRES_PASSWORD | Yes      | PostgreSQL password               |
| SECRET_KEY        | Yes      | JWT signing key (32+ random chars)|
| ADMIN_PASSWORD    | Yes      | Initial admin account password    |
| DOCKER_USERNAME   | No       | Docker Hub username for image tags|

### Backend `backend/.env` (local dev)

| Variable                    | Required | Description                    |
| --------------------------- | -------- | ------------------------------ |
| DATABASE_URL                | Yes      | PostgreSQL connection string   |
| SECRET_KEY                  | Yes      | JWT signing key                |
| ADMIN_PASSWORD              | Yes      | Initial admin password         |
| ALGORITHM                   | No       | Default: HS256                 |
| ACCESS_TOKEN_EXPIRE_MINUTES | No       | Default: 30                    |
| REFRESH_TOKEN_EXPIRE_DAYS   | No       | Default: 7                     |
| CORS_ORIGINS                | No       | JSON array of allowed origins  |
| UPLOAD_DIR                  | No       | Default: uploads               |

### Frontend `.env` (optional)

| Variable          | Default | Description         |
| ----------------- | ------- | ------------------- |
| VITE_API_BASE_URL | /api    | Backend API prefix  |

---

## API Reference

Interactive docs available at runtime:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Core Endpoints

| Method | Endpoint                     | Description              |
| ------ | ---------------------------- | ------------------------ |
| POST   | /auth/login                  | Login, returns JWT       |
| POST   | /auth/refresh                | Refresh access token     |
| GET    | /auth/me                     | Current user info        |
| GET    | /employees                   | Paginated employee list  |
| POST   | /employees                   | Create employee          |
| POST   | /employees/{id}/photo        | Upload employee photo    |
| PUT    | /employees/{id}              | Update employee          |
| DELETE | /employees/{id}              | Delete employee          |
| GET    | /departments                 | List departments         |
| GET    | /attendance                  | Attendance records       |
| GET    | /leave                       | Leave requests           |
| GET    | /payroll                     | Payroll records          |
| GET    | /performance                 | Performance reviews      |
| GET    | /roles                       | List roles               |
| PUT    | /roles/{name}                | Update role permissions  |
| GET    | /dashboard/admin-stats       | Admin KPI stats          |
| GET    | /reports                     | Generate reports         |
| GET    | /health                      | Health check             |

---

## Roles & Permissions

| Role       | Access Level                                    |
| ---------- | ----------------------------------------------- |
| Admin      | Full system access                              |
| HR Manager | Employees, payroll, leave, reports, settings    |
| Manager    | Team view, performance reviews                  |
| Employee   | Personal dashboard, self-service profile, leave |

Roles are seeded automatically on startup. Additional custom roles can be created from the **Roles & Permissions** admin page.

---

## CI/CD Pipeline

GitHub Actions runs on pushes to `main`, `dev`, and `feature/*` branches.

### Stages

| Stage          | Trigger       | Steps                                        |
| -------------- | ------------- | -------------------------------------------- |
| Frontend CI    | All branches  | `npm ci` → lint → build                     |
| Backend CI     | All branches  | `pip install` → import check                |
| Docker Build   | `main` only   | Build + push images to Docker Hub           |

### Required GitHub Secrets

| Secret          | Description              |
| --------------- | ------------------------ |
| DOCKER_USERNAME | Docker Hub username      |
| DOCKER_PASSWORD | Docker Hub access token  |

Images are tagged `latest` and `<git-sha>`.

---

## Kubernetes Deployment

### Prerequisites

- A running Kubernetes cluster (Docker Desktop, minikube, or cloud)
- `nginx-ingress` controller installed
- `kubectl` configured

### 1. Apply namespace first

```bash
kubectl apply -f kubernetes/00-namespace.yaml
```

### 2. Create secrets

Fill in `kubernetes/secrets.yaml` with base64-encoded values:

```bash
# Encode a value
echo -n "your-value" | base64
```

```bash
kubectl apply -f kubernetes/secrets.yaml
```

> `secrets.yaml` is in `.gitignore` — never commit real credentials.

### 3. Deploy everything

```bash
kubectl apply -f kubernetes/
```

### 4. Initialize the database schema

The Kubernetes postgres pod starts empty (no init scripts). Run the schema once:

```bash
kubectl cp database/init/01_schema.sql ems-ops/ems-ops-db-0:/tmp/01_schema.sql
kubectl cp database/init/02_seed.sql   ems-ops/ems-ops-db-0:/tmp/02_seed.sql

kubectl exec -n ems-ops ems-ops-db-0 -- psql -U postgres -d emsops -f /tmp/01_schema.sql
kubectl exec -n ems-ops ems-ops-db-0 -- psql -U postgres -d emsops -f /tmp/02_seed.sql
```

### 5. Check status

```bash
kubectl get all -n ems-ops
```

All pods should show `Running` and `READY 1/1`.

### 6. Access the app

Add to your hosts file (`C:\Windows\System32\drivers\etc\hosts` on Windows):

```
127.0.0.1  ems-ops.local
```

Open: `http://ems-ops.local`

### Teardown

```bash
# Remove workloads only
kubectl delete deployment ems-ops-frontend ems-ops-backend -n ems-ops
kubectl delete statefulset ems-ops-db -n ems-ops

# Full teardown
kubectl delete namespace ems-ops
```

---

## Monitoring

### Prometheus

Scrape targets configured in `monitoring/prometheus.yml`:

- `/backend/metrics` — FastAPI application metrics
- `node-exporter` — host metrics
- `prometheus` — self-metrics

### Grafana

Dashboard file: `monitoring/grafana/dashboards/backend.json`

Import via: **Grafana → Dashboards → Import → Upload JSON**

---

## Security Notes

- Passwords are hashed with bcrypt (cost factor 12)
- All API routes require a valid JWT Bearer token except `/auth/login`
- Role guards enforced server-side (`require_admin`, `require_hr`)
- CORS restricted to configured origins
- `secrets.yaml` and all `.env` files are gitignored

**Production checklist:**
- [ ] Set strong, unique `SECRET_KEY` and `ADMIN_PASSWORD`
- [ ] Enable HTTPS / TLS termination at the ingress
- [ ] Use a secrets manager (Vault, AWS Secrets Manager) instead of plain env files
- [ ] Schedule regular PostgreSQL backups
- [ ] Restrict CORS to your actual domain

---

## Known Limitations

- No Alembic migration support — schema changes on existing databases require manual `ALTER TABLE`
- No token revocation / blacklist system
- No automated test suite (unit or integration)
- No centralized log aggregation
- Kubernetes does not auto-seed the database on first deploy

---

## License

Provided for educational and portfolio purposes. Modify and distribute according to your organization's requirements.
