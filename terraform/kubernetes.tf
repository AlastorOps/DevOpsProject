# Kubernetes resource definitions managed by Terraform.
# These supplement the kustomize manifests in kubernetes/ and are used
# when you prefer full Terraform-native resource management over kubectl apply.
#
# Usage:
#   terraform apply -var="postgres_password=..." -var="secret_key=..." ...
#
# Resources here mirror kubernetes/*.yaml but are Terraform-native, giving
# full state tracking, drift detection, and plan/apply workflows.

# ── ConfigMap: backend application config ─────────────────────────────────────

resource "kubernetes_config_map" "backend_config" {
  metadata {
    name      = "ems-ops-backend-config"
    namespace = kubernetes_namespace.ems_ops.metadata[0].name
    labels = {
      "app.kubernetes.io/component"  = "backend"
      "app.kubernetes.io/part-of"    = "ems-ops"
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }

  data = {
    ALGORITHM                    = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES  = "30"
    REFRESH_TOKEN_EXPIRE_DAYS    = "7"
    CORS_ORIGINS                 = var.cors_origins
    ENABLE_DOCS                  = "false"
    UPLOAD_DIR                   = "/app/uploads"
  }
}

# ── Deployment: backend ───────────────────────────────────────────────────────

resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "ems-ops-backend"
    namespace = kubernetes_namespace.ems_ops.metadata[0].name
    labels = {
      "app"                          = "ems-ops-backend"
      "app.kubernetes.io/name"       = "ems-ops-backend"
      "app.kubernetes.io/component"  = "backend"
      "app.kubernetes.io/part-of"    = "ems-ops"
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }

  spec {
    replicas = var.backend_replicas

    strategy {
      type = "RollingUpdate"
      rolling_update {
        max_surge       = 1
        max_unavailable = 0
      }
    }

    selector {
      match_labels = { app = "ems-ops-backend" }
    }

    template {
      metadata {
        labels = {
          app                          = "ems-ops-backend"
          "app.kubernetes.io/name"     = "ems-ops-backend"
          "app.kubernetes.io/component" = "backend"
          "app.kubernetes.io/part-of"  = "ems-ops"
        }
      }

      spec {
        init_container {
          name              = "wait-for-db"
          image             = "postgres:16-alpine"
          image_pull_policy = "IfNotPresent"
          command           = ["sh", "-c", "until pg_isready -h db -p 5432 -U postgres; do echo 'Waiting for PostgreSQL...'; sleep 2; done; echo 'PostgreSQL is ready'"]

          security_context {
            allow_privilege_escalation = false
            run_as_non_root            = true
            run_as_user                = 70

            capabilities {
              drop = ["ALL"]
            }
          }
        }

        container {
          name              = "backend"
          image             = "${var.docker_username}/employee-management-backend:${var.image_tag}"
          image_pull_policy = "Always"

          port {
            container_port = 8000
            name           = "http"
            protocol       = "TCP"
          }

          # Secrets
          env_from {
            secret_ref { name = kubernetes_secret.ems_ops_secrets.metadata[0].name }
          }

          # Non-secret config
          env_from {
            config_map_ref { name = kubernetes_config_map.backend_config.metadata[0].name }
          }

          volume_mount {
            name       = "upload-storage"
            mount_path = "/app/uploads"
          }

          security_context {
            allow_privilege_escalation = false
            run_as_non_root            = true
            run_as_user                = 1000

            capabilities {
              drop = ["ALL"]
            }

            seccomp_profile {
              type = "RuntimeDefault"
            }
          }

          resources {
            requests = { cpu = "100m", memory = "128Mi" }
            limits   = { cpu = "500m", memory = "256Mi" }
          }

          liveness_probe {
            http_get {
              path = "/health"
              port = 8000
            }
            initial_delay_seconds = 30
            period_seconds        = 20
            timeout_seconds       = 5
            failure_threshold     = 3
          }

          readiness_probe {
            http_get {
              path = "/health"
              port = 8000
            }
            initial_delay_seconds = 10
            period_seconds        = 10
            timeout_seconds       = 5
            failure_threshold     = 3
          }
        }

        volume {
          name = "upload-storage"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.uploads.metadata[0].name
          }
        }
      }
    }
  }

  depends_on = [
    kubernetes_secret.ems_ops_secrets,
    kubernetes_config_map.backend_config,
    kubernetes_persistent_volume_claim.uploads,
  ]
}

# ── Deployment: frontend ──────────────────────────────────────────────────────

resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "ems-ops-frontend"
    namespace = kubernetes_namespace.ems_ops.metadata[0].name
    labels = {
      "app"                          = "ems-ops-frontend"
      "app.kubernetes.io/name"       = "ems-ops-frontend"
      "app.kubernetes.io/component"  = "frontend"
      "app.kubernetes.io/part-of"    = "ems-ops"
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }

  spec {
    replicas = var.frontend_replicas

    strategy {
      type = "RollingUpdate"
      rolling_update {
        max_surge       = 1
        max_unavailable = 0
      }
    }

    selector {
      match_labels = { app = "ems-ops-frontend" }
    }

    template {
      metadata {
        labels = {
          app                          = "ems-ops-frontend"
          "app.kubernetes.io/name"     = "ems-ops-frontend"
          "app.kubernetes.io/component" = "frontend"
          "app.kubernetes.io/part-of"  = "ems-ops"
        }
      }

      spec {
        container {
          name              = "frontend"
          image             = "${var.docker_username}/employee-management-frontend:${var.image_tag}"
          image_pull_policy = "Always"

          port {
            container_port = 8080
            name           = "http"
            protocol       = "TCP"
          }

          security_context {
            allow_privilege_escalation = false
            run_as_non_root            = true
            run_as_user                = 101

            capabilities {
              drop = ["ALL"]
            }

            seccomp_profile {
              type = "RuntimeDefault"
            }
          }

          resources {
            requests = { cpu = "100m", memory = "64Mi" }
            limits   = { cpu = "250m", memory = "128Mi" }
          }

          liveness_probe {
            http_get { path = "/"; port = 8080 }
            initial_delay_seconds = 10
            period_seconds        = 15
            timeout_seconds       = 5
            failure_threshold     = 3
          }

          readiness_probe {
            http_get { path = "/"; port = 8080 }
            initial_delay_seconds = 5
            period_seconds        = 10
            timeout_seconds       = 5
            failure_threshold     = 3
          }
        }
      }
    }
  }
}

# ── Services ──────────────────────────────────────────────────────────────────

resource "kubernetes_service" "backend" {
  metadata {
    name      = "backend"
    namespace = kubernetes_namespace.ems_ops.metadata[0].name
    labels = {
      "app.kubernetes.io/component"  = "backend"
      "app.kubernetes.io/part-of"    = "ems-ops"
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }

  spec {
    selector = { app = "ems-ops-backend" }
    type     = "ClusterIP"

    port {
      name        = "http"
      port        = 8000
      target_port = 8000
      protocol    = "TCP"
    }
  }
}

resource "kubernetes_service" "frontend" {
  metadata {
    name      = "ems-ops-frontend-svc"
    namespace = kubernetes_namespace.ems_ops.metadata[0].name
    labels = {
      "app.kubernetes.io/component"  = "frontend"
      "app.kubernetes.io/part-of"    = "ems-ops"
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }

  spec {
    selector = { app = "ems-ops-frontend" }
    type     = "ClusterIP"

    port {
      name        = "http"
      port        = 80
      target_port = 8080
      protocol    = "TCP"
    }
  }
}

# ── Persistent Volume Claim: uploads ─────────────────────────────────────────

resource "kubernetes_persistent_volume_claim" "uploads" {
  metadata {
    name      = "ems-ops-uploads-pvc"
    namespace = kubernetes_namespace.ems_ops.metadata[0].name
    labels = {
      "app.kubernetes.io/component"  = "backend"
      "app.kubernetes.io/part-of"    = "ems-ops"
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }

  spec {
    access_modes = ["ReadWriteOnce"]

    resources {
      requests = { storage = "2Gi" }
    }
  }
}

# ── Ingress ───────────────────────────────────────────────────────────────────

resource "kubernetes_ingress_v1" "ems_ops" {
  metadata {
    name      = "ems-ops-ingress"
    namespace = kubernetes_namespace.ems_ops.metadata[0].name
    labels = {
      "app.kubernetes.io/managed-by" = "terraform"
      "app.kubernetes.io/part-of"    = "ems-ops"
    }

    annotations = {
      "nginx.ingress.kubernetes.io/proxy-body-size"    = "20m"
      "nginx.ingress.kubernetes.io/proxy-read-timeout" = "60"
      "cert-manager.io/cluster-issuer"                 = "letsencrypt-prod"
      "nginx.ingress.kubernetes.io/ssl-redirect"       = "true"
    }
  }

  spec {
    ingress_class_name = var.ingress_class

    tls {
      hosts       = [var.domain]
      secret_name = "ems-ops-tls"
    }

    rule {
      host = var.domain
      http {
        path {
          path      = "/"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service.frontend.metadata[0].name
              port { number = 80 }
            }
          }
        }
      }
    }
  }
}

# ── HPA ───────────────────────────────────────────────────────────────────────

resource "kubernetes_horizontal_pod_autoscaler_v2" "backend" {
  metadata {
    name      = "ems-ops-backend-hpa"
    namespace = kubernetes_namespace.ems_ops.metadata[0].name
    labels = {
      "app.kubernetes.io/component"  = "backend"
      "app.kubernetes.io/part-of"    = "ems-ops"
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }

  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.backend.metadata[0].name
    }

    min_replicas = 1
    max_replicas = 3

    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 70
        }
      }
    }

    behavior {
      scale_down {
        stabilization_window_seconds = 300
        select_policy                = "Min"
        policy {
          type          = "Pods"
          value         = 1
          period_seconds = 60
        }
      }
      scale_up {
        stabilization_window_seconds = 30
        select_policy                = "Max"
        policy {
          type          = "Pods"
          value         = 1
          period_seconds = 30
        }
      }
    }
  }

  depends_on = [kubernetes_deployment.backend]
}
