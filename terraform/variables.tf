variable "kube_config_path" {
  description = "Path to kubeconfig file"
  default     = "~/.kube/config"
}

variable "kube_context" {
  description = "Kubernetes context to use"
  default     = "minikube"
}
