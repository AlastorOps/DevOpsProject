# ── Kubernetes ────────────────────────────────────────────────────────────────

variable "kube_config_path" {
  description = "Absolute path to the kubeconfig file"
  type        = string
  default     = "~/.kube/config"
}

variable "kube_context" {
  description = "Kubernetes context to use (e.g. minikube, docker-desktop, production-cluster)"
  type        = string
  default     = "minikube"
}

variable "namespace" {
  description = "Kubernetes namespace for all EMS Ops resources"
  type        = string
  default     = "ems-ops"
}

# ── Image configuration ────────────────────────────────────────────────────────

variable "docker_username" {
  description = "Docker Hub username (images are pulled as <username>/employee-management-*)"
  type        = string
  default     = "alastorops"
}

variable "image_tag" {
  description = "Docker image tag to deploy (e.g. latest, dev, sha-abc1234)"
  type        = string
  default     = "latest"
}

# ── Application secrets (supply via tfvars or environment, never hard-code) ───

variable "postgres_password" {
  description = "PostgreSQL superuser password"
  type        = string
  sensitive   = true
}

variable "database_url" {
  description = "Full PostgreSQL connection string for the backend (postgresql://...)"
  type        = string
  sensitive   = true
}

variable "secret_key" {
  description = "JWT signing key — generate with: python -c \"import secrets; print(secrets.token_hex(32))\""
  type        = string
  sensitive   = true
}

variable "admin_password" {
  description = "Initial admin account password"
  type        = string
  sensitive   = true
}

variable "grafana_password" {
  description = "Grafana admin password"
  type        = string
  sensitive   = true
}

# ── Application settings ───────────────────────────────────────────────────────

variable "cors_origins" {
  description = "JSON array of allowed CORS origins for the backend"
  type        = string
  default     = "[\"https://ems-ops.xyz\",\"https://www.ems-ops.xyz\"]"
}

variable "backend_replicas" {
  description = "Initial number of backend pod replicas"
  type        = number
  default     = 1
}

variable "frontend_replicas" {
  description = "Initial number of frontend pod replicas"
  type        = number
  default     = 2
}

# ── Monitoring ────────────────────────────────────────────────────────────────

variable "enable_monitoring" {
  description = "When true, deploy Prometheus and Grafana alongside the application"
  type        = bool
  default     = true
}

variable "prometheus_retention" {
  description = "How long Prometheus retains data (e.g. 15d, 30d)"
  type        = string
  default     = "15d"
}

# ── Ingress ───────────────────────────────────────────────────────────────────

variable "domain" {
  description = "Production domain name (used in Ingress host and TLS secret)"
  type        = string
  default     = "ems-ops.xyz"
}

variable "ingress_class" {
  description = "Ingress class name (e.g. nginx, traefik)"
  type        = string
  default     = "nginx"
}
