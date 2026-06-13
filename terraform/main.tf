terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }
}

provider "kubernetes" {
  config_path    = var.kube_config_path
  config_context = var.kube_context
}

resource "kubernetes_namespace" "ems_ops" {
  metadata {
    name = "ems-ops"
    labels = {
      "app.kubernetes.io/managed-by" = "terraform"
      "app.kubernetes.io/part-of"    = "ems-ops"
    }
  }
}

resource "null_resource" "apply_manifests" {
  depends_on = [kubernetes_namespace.ems_ops]

  provisioner "local-exec" {
    command     = "kubectl apply -k ../kubernetes/"
    working_dir = path.module
  }

  triggers = {
    always_run = timestamp()
  }
}

resource "null_resource" "destroy_manifests" {
  depends_on = [kubernetes_namespace.ems_ops]

  provisioner "local-exec" {
    when        = destroy
    command     = "kubectl delete namespace ems-ops --ignore-not-found"
    working_dir = path.module
  }
}
