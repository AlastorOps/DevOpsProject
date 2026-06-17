# EMS Ops — Terraform

Provisions the EMS Ops infrastructure on Kubernetes with optional Render deployment triggers.

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Terraform | 1.6+ |
| kubectl | 1.28+ (must be configured and connected to the cluster) |
| Kubernetes cluster | 1.28+ (Minikube, k3s, or cloud-managed) |

## Directory structure

```
terraform/
├── provider.tf     # Provider requirements and configuration
├── variables.tf    # All input variables (with defaults)
├── main.tf         # Namespace, secret, kustomize apply
├── kubernetes.tf   # Deployments, Services, Ingress, HPA, PVCs
├── monitoring.tf   # Prometheus, Grafana, node-exporter (conditional)
├── render.tf       # Render deployment triggers via API
└── outputs.tf      # Exported values
```

## Quick start (Minikube / local)

```bash
# 1. Start cluster
minikube start --cpus=4 --memory=4096 --cni=calico

# 2. Enable ingress and metrics-server addons
minikube addons enable ingress
minikube addons enable metrics-server

# 3. Create a tfvars file (never commit this)
cat > terraform.tfvars <<EOF
postgres_password = "my-strong-password"
database_url      = "postgresql://postgres:my-strong-password@db:5432/emsops"
secret_key        = "$(python3 -c 'import secrets; print(secrets.token_hex(32))')"
admin_password    = "Admin@ChangeMeNow1"
grafana_password  = "Grafana@ChangeMeNow1"
EOF

# 4. Initialise and apply
terraform init
terraform plan
terraform apply
```

## Configuration variables

| Variable | Default | Description |
|----------|---------|-------------|
| `kube_config_path` | `~/.kube/config` | Path to kubeconfig |
| `kube_context` | `minikube` | Kubernetes context |
| `namespace` | `ems-ops` | Target namespace |
| `docker_username` | `alastorops` | Docker Hub username |
| `image_tag` | `latest` | Docker image tag |
| `backend_replicas` | `1` | Backend pod count |
| `frontend_replicas` | `2` | Frontend pod count |
| `enable_monitoring` | `true` | Deploy Prometheus + Grafana |
| `prometheus_retention` | `15d` | Prometheus data retention |
| `domain` | `ems-ops.xyz` | Production domain |
| `cors_origins` | `["https://ems-ops.xyz"]` | Allowed CORS origins |
| **`postgres_password`** | _required_ | PostgreSQL password (sensitive) |
| **`database_url`** | _required_ | Full DB connection string (sensitive) |
| **`secret_key`** | _required_ | JWT signing key (sensitive) |
| **`admin_password`** | _required_ | Admin account password (sensitive) |
| **`grafana_password`** | _required_ | Grafana admin password (sensitive) |

## Environment targeting

```bash
# Development (Minikube)
terraform apply -var="kube_context=minikube" -var="image_tag=dev"

# Production
terraform apply \
  -var="kube_context=production-cluster" \
  -var="image_tag=sha-$(git rev-parse --short HEAD)" \
  -var="domain=ems-ops.xyz"
```

## Render deployment (optional)

If you have a Render API key and know your service IDs:

```bash
terraform apply \
  -var="render_api_key=$RENDER_API_KEY" \
  -var="render_backend_service_id=srv-xxxx" \
  -var="render_frontend_service_id=srv-yyyy"
```

## Teardown

```bash
terraform destroy
```

This deletes the namespace and all resources inside it (Kubernetes) and removes Terraform-managed state.
