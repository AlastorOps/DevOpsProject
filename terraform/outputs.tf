output "namespace" {
  description = "Kubernetes namespace where EMS Ops is deployed"
  value       = kubernetes_namespace.ems_ops.metadata[0].name
}

output "backend_service_name" {
  description = "Kubernetes Service name for the backend"
  value       = kubernetes_service.backend.metadata[0].name
}

output "frontend_service_name" {
  description = "Kubernetes Service name for the frontend"
  value       = kubernetes_service.frontend.metadata[0].name
}

output "ingress_host" {
  description = "Hostname configured on the Ingress resource"
  value       = var.domain
}

output "backend_image" {
  description = "Docker image used by the backend deployment"
  value       = "${var.docker_username}/employee-management-backend:${var.image_tag}"
}

output "frontend_image" {
  description = "Docker image used by the frontend deployment"
  value       = "${var.docker_username}/employee-management-frontend:${var.image_tag}"
}

output "monitoring_enabled" {
  description = "Whether the Prometheus/Grafana monitoring stack was deployed"
  value       = var.enable_monitoring
}

output "prometheus_service" {
  description = "Prometheus ClusterIP service name (empty when monitoring is disabled)"
  value       = var.enable_monitoring ? kubernetes_service.prometheus[0].metadata[0].name : ""
}

output "grafana_service" {
  description = "Grafana ClusterIP service name (empty when monitoring is disabled)"
  value       = var.enable_monitoring ? kubernetes_service.grafana[0].metadata[0].name : ""
}
