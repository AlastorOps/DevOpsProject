output "namespace" {
  description = "Deployed namespace name"
  value       = kubernetes_namespace.ems_ops.metadata[0].name
}
