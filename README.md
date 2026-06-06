# EMS-Ops — Employee Management System

A full-stack HR and Employee Management System designed to manage employees, departments, attendance, leave requests, payroll, performance reviews, and user access control.

The platform is built using a modern DevOps-oriented architecture featuring FastAPI, React, PostgreSQL, Docker, Kubernetes, Prometheus, Grafana, and GitHub Actions CI/CD.

---

# Features

| Module              | Capabilities                                         |
| ------------------- | ---------------------------------------------------- |
| Authentication      | JWT login, refresh tokens, role-based access control |
| Employee Management | Create, update, view, and deactivate employees       |
| Organization        | Department and position management                   |
| Attendance          | Daily attendance tracking and reporting              |
| Leave Management    | Leave requests, approvals, and balance tracking      |
| Payroll             | Salary processing and payroll records                |
| Performance Reviews | Employee performance evaluations                     |
| User Management     | User accounts and role assignments                   |
| Profile Management  | Self-service profile updates and password changes    |
| Roles & Permissions | Configurable access control                          |
| Dashboard           | Administrative and employee dashboards               |
| Reports             | System reporting and analytics                       |
| Settings            | Organization and application settings                |
| Monitoring          | Prometheus metrics and Grafana dashboards            |

---

# Tech Stack

| Layer            | Technology                         |
| ---------------- | ---------------------------------- |
| Backend          | FastAPI 0.115, Python 3.12         |
| Database         | PostgreSQL 16                      |
| Frontend         | React 19, Vite, Tailwind CSS       |
| Authentication   | JWT (python-jose + passlib/bcrypt) |
| ORM              | SQLAlchemy 2.0                     |
| Validation       | Pydantic v2                        |
| Containerization | Docker Compose                     |
| Orchestration    | Kubernetes                         |
| Monitoring       | Prometheus + Grafana               |
| CI/CD            | GitHub Actions                     |

---

# Architecture Overview

```text
React Frontend
      │
      ▼
FastAPI Backend
      │
      ▼
 PostgreSQL

Monitoring:
Prometheus ──► Grafana
```

---

# Project Structure

```text
EMS-Ops/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── auth.py
│   │   ├── dependencies.py
│   │   ├── routers/
│   │   └── schemas/
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── features/
│   │   └── hooks/
│   ├── Dockerfile
│   └── package.json
│
├── kubernetes/
│   ├── namespace.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
│
├── monitoring/
│   ├── prometheus.yml
│   └── grafana/
│
├── .github/workflows/
│   └── main.yml
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# Prerequisites

Before running the application, install:

* Docker Desktop
* Docker Compose
* Node.js 22+
* npm
* Python 3.12+
* PostgreSQL 16 (optional for local development)

---

# Quick Start (Docker)

## Clone Repository

```bash
git clone <repo-url>
cd EMS-Ops
```

## Configure Environment

Create a root `.env` file:

```env
POSTGRES_PASSWORD=your-password
SECRET_KEY=your-secret-key
ADMIN_PASSWORD=Admin@1234
DOCKER_USERNAME=your-dockerhub-username
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:your-password@db:5432/emsops
SECRET_KEY=your-secret-key
ADMIN_PASSWORD=Admin@1234
```

## Build and Start

```bash
docker compose up --build
```

---

## Available Services

| Service     | URL                         |
| ----------- | --------------------------- |
| Frontend    | http://localhost:8080       |
| Backend API | http://localhost:8000       |
| Swagger UI  | http://localhost:8000/docs  |
| ReDoc       | http://localhost:8000/redoc |
| PostgreSQL  | localhost:5433              |

---

## Stop Services

```bash
docker compose down
```

Remove volumes:

```bash
docker compose down -v
```

---

# Local Development

## Backend

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

Backend runs on:

```text
http://localhost:8000
```

---

## Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# Environment Variables

## Backend (.env)

| Variable                    | Required | Description                  |
| --------------------------- | -------- | ---------------------------- |
| DATABASE_URL                | Yes      | PostgreSQL connection string |
| SECRET_KEY                  | Yes      | JWT signing key              |
| ADMIN_PASSWORD              | Yes      | Initial admin password       |
| ALGORITHM                   | No       | JWT algorithm                |
| ACCESS_TOKEN_EXPIRE_MINUTES | No       | Access token lifetime        |
| REFRESH_TOKEN_EXPIRE_DAYS   | No       | Refresh token lifetime       |
| CORS_ORIGINS                | No       | Allowed origins              |
| UPLOAD_DIR                  | No       | Upload storage directory     |

---

## Frontend (.env)

| Variable          | Required | Description     |
| ----------------- | -------- | --------------- |
| VITE_API_BASE_URL | No       | Backend API URL |

Example:

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

# API Overview

Interactive API documentation:

* Swagger UI: `http://localhost:8000/docs`
* ReDoc: `http://localhost:8000/redoc`

## Core Endpoints

| Method | Endpoint      | Description          |
| ------ | ------------- | -------------------- |
| POST   | /auth/login   | User login           |
| POST   | /auth/refresh | Refresh access token |
| GET    | /auth/me      | Current user         |
| GET    | /employees    | Employee list        |
| POST   | /employees    | Create employee      |
| GET    | /departments  | Departments          |
| GET    | /attendance   | Attendance records   |
| GET    | /leave        | Leave requests       |
| GET    | /payroll      | Payroll records      |
| GET    | /performance  | Performance reviews  |
| GET    | /dashboard    | Dashboard data       |
| GET    | /reports      | Reports              |
| GET    | /health       | Health check         |

---

# Roles & Permissions

| Role       | Access                              |
| ---------- | ----------------------------------- |
| Admin      | Full system access                  |
| HR Manager | Employees, payroll, leave, reports  |
| Manager    | Team management and reviews         |
| Employee   | Personal dashboard and self-service |

Default roles are automatically seeded during application startup.

---

# CI/CD Pipeline

GitHub Actions pipeline runs on:

```text
main
dev
feature/*
```

## Frontend CI

```text
npm ci
npm run lint
npm run build
```

## Backend CI

```text
pip install -r requirements.txt
python -c "import app.main"
```

## Docker Build & Push

Runs only on the `main` branch after successful CI.

Images are pushed with:

```text
latest
<git-sha>
```

---

# Docker Images

Example image names:

```text
docker.io/<username>/ems-frontend
docker.io/<username>/ems-backend
```

Required GitHub Secrets:

| Secret          | Description             |
| --------------- | ----------------------- |
| DOCKER_USERNAME | Docker Hub username     |
| DOCKER_PASSWORD | Docker Hub access token |

---

# Kubernetes Deployment

Apply namespace:

```bash
kubectl apply -f kubernetes/namespace.yaml
```

Deploy resources:

```bash
kubectl apply -f kubernetes/
```

Before deployment, update image references:

```yaml
image: your-dockerhub-username/ems-frontend:latest
```

Current manifests include:

* Namespace
* Deployment
* Service
* Ingress

---

# Monitoring & Logging

## Prometheus

Prometheus scrapes:

```text
/backend/metrics
node-exporter
prometheus
```

Configuration:

```text
monitoring/prometheus.yml
```

---

## Grafana

Dashboard location:

```text
monitoring/grafana/dashboards/backend.json
```

Import through:

```text
Grafana → Dashboards → Import
```

---

# Security

* JWT Authentication
* Password hashing using bcrypt
* Role-Based Access Control (RBAC)
* Protected API endpoints
* Environment-based secrets
* CORS configuration support

Recommended for production:

* HTTPS/TLS
* Reverse proxy (Nginx/Traefik)
* Secret management solution
* Database backups

---

# Known Limitations

* No Alembic migration support
* Limited automated testing
* Kubernetes backend manifests incomplete
* Database health checks are basic
* No centralized logging
* No token revocation/blacklist system

---

# Future Improvements

* Alembic database migrations
* Pytest backend test suite
* Vitest frontend test suite
* Full Kubernetes deployment stack
* PostgreSQL backup automation
* Centralized logging with ELK/Loki
* Enhanced RBAC permissions
* Audit logging
* Email notifications
* Multi-tenant support

---

# License

This project is provided for educational and portfolio purposes.

Modify and distribute according to your organization's licensing requirements.