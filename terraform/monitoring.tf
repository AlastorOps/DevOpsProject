# Monitoring stack: Prometheus, Grafana, node-exporter
# Conditionally deployed based on var.enable_monitoring.

# ── Prometheus ConfigMap ──────────────────────────────────────────────────────

resource "kubernetes_config_map" "prometheus_config" {
  count = var.enable_monitoring ? 1 : 0

  metadata {
    name      = "prometheus-config"
    namespace = kubernetes_namespace.ems_ops.metadata[0].name
    labels = {
      "app.kubernetes.io/component"  = "monitoring"
      "app.kubernetes.io/part-of"    = "ems-ops"
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }

  data = {
    "prometheus.yml" = <<-YAML
      global:
        scrape_interval: 15s
        evaluation_interval: 15s

      rule_files:
        - /etc/prometheus/alert_rules.yml

      scrape_configs:
        - job_name: 'prometheus'
          static_configs:
            - targets: ['localhost:9090']

        - job_name: 'ems-backend'
          static_configs:
            - targets: ['backend:8000']
          metrics_path: '/metrics'

        - job_name: 'node-exporter'
          static_configs:
            - targets: ['node-exporter:9100']
    YAML

    "alert_rules.yml" = <<-YAML
      groups:
        - name: ems-ops.alerts
          interval: 1m
          rules:
            - alert: BackendDown
              expr: up{job="ems-backend"} == 0
              for: 2m
              labels:
                severity: critical
              annotations:
                summary: "EMS Backend is unreachable"
                description: "The backend scrape target has been down for more than 2 minutes."

            - alert: HighRequestErrorRate
              expr: |
                rate(http_requests_total{status=~"5.."}[5m])
                / rate(http_requests_total[5m]) > 0.05
              for: 5m
              labels:
                severity: warning
              annotations:
                summary: "High HTTP 5xx error rate"
                description: "Error rate is {{ $value | humanizePercentage }} over the last 5 minutes."

            - alert: HighCPUUsage
              expr: |
                100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 85
              for: 5m
              labels:
                severity: warning
              annotations:
                summary: "High CPU usage on {{ $labels.instance }}"
                description: "CPU is {{ $value | humanize }}% for more than 5 minutes."

            - alert: HighMemoryUsage
              expr: |
                (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
              for: 5m
              labels:
                severity: warning
              annotations:
                summary: "High memory usage on {{ $labels.instance }}"
                description: "Memory usage is {{ $value | humanize }}%."
    YAML
  }
}

# ── Prometheus PVC ────────────────────────────────────────────────────────────

resource "kubernetes_persistent_volume_claim" "prometheus" {
  count = var.enable_monitoring ? 1 : 0

  metadata {
    name      = "prometheus-pvc"
    namespace = kubernetes_namespace.ems_ops.metadata[0].name
    labels = {
      "app.kubernetes.io/component"  = "monitoring"
      "app.kubernetes.io/part-of"    = "ems-ops"
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }

  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = { storage = "5Gi" }
    }
  }
}

# ── Prometheus Deployment ─────────────────────────────────────────────────────

resource "kubernetes_deployment" "prometheus" {
  count = var.enable_monitoring ? 1 : 0

  metadata {
    name      = "prometheus"
    namespace = kubernetes_namespace.ems_ops.metadata[0].name
    labels = {
      "app"                          = "prometheus"
      "app.kubernetes.io/component"  = "monitoring"
      "app.kubernetes.io/part-of"    = "ems-ops"
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }

  spec {
    replicas = 1
    strategy { type = "Recreate" }
    selector { match_labels = { app = "prometheus" } }

    template {
      metadata { labels = { app = "prometheus", "app.kubernetes.io/part-of" = "ems-ops" } }

      spec {
        security_context {
          run_as_non_root = true
          run_as_user     = 65534
          fs_group        = 65534
        }

        container {
          name  = "prometheus"
          image = "prom/prometheus:v2.53.0"

          args = [
            "--config.file=/etc/prometheus/prometheus.yml",
            "--storage.tsdb.path=/prometheus",
            "--web.enable-lifecycle",
            "--storage.tsdb.retention.time=${var.prometheus_retention}",
          ]

          port { container_port = 9090; name = "http" }

          volume_mount { name = "config"; mount_path = "/etc/prometheus"; read_only = true }
          volume_mount { name = "data"; mount_path = "/prometheus" }

          security_context {
            allow_privilege_escalation = false
            capabilities { drop = ["ALL"] }
          }

          resources {
            requests = { cpu = "100m", memory = "256Mi" }
            limits   = { cpu = "500m", memory = "512Mi" }
          }

          liveness_probe {
            http_get { path = "/-/healthy"; port = 9090 }
            initial_delay_seconds = 15; period_seconds = 20; timeout_seconds = 5
          }
          readiness_probe {
            http_get { path = "/-/ready"; port = 9090 }
            initial_delay_seconds = 5; period_seconds = 10; timeout_seconds = 5
          }
        }

        volume {
          name = "config"
          config_map { name = kubernetes_config_map.prometheus_config[0].metadata[0].name }
        }
        volume {
          name = "data"
          persistent_volume_claim { claim_name = kubernetes_persistent_volume_claim.prometheus[0].metadata[0].name }
        }
      }
    }
  }

  depends_on = [kubernetes_config_map.prometheus_config, kubernetes_persistent_volume_claim.prometheus]
}

# ── Prometheus Service ────────────────────────────────────────────────────────

resource "kubernetes_service" "prometheus" {
  count = var.enable_monitoring ? 1 : 0

  metadata {
    name      = "prometheus"
    namespace = kubernetes_namespace.ems_ops.metadata[0].name
    labels = {
      "app.kubernetes.io/component"  = "monitoring"
      "app.kubernetes.io/part-of"    = "ems-ops"
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }

  spec {
    selector = { app = "prometheus" }
    type     = "ClusterIP"
    port { name = "http"; port = 9090; target_port = 9090 }
  }
}

# ── Grafana ConfigMap (datasources) ──────────────────────────────────────────

resource "kubernetes_config_map" "grafana_datasources" {
  count = var.enable_monitoring ? 1 : 0

  metadata {
    name      = "grafana-datasources"
    namespace = kubernetes_namespace.ems_ops.metadata[0].name
    labels = {
      "app.kubernetes.io/component"  = "monitoring"
      "app.kubernetes.io/part-of"    = "ems-ops"
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }

  data = {
    "datasources.yaml" = <<-YAML
      apiVersion: 1
      datasources:
        - name: Prometheus
          type: prometheus
          access: proxy
          url: http://prometheus:9090
          isDefault: true
          editable: false
    YAML
  }
}

# ── Grafana PVC ───────────────────────────────────────────────────────────────

resource "kubernetes_persistent_volume_claim" "grafana" {
  count = var.enable_monitoring ? 1 : 0

  metadata {
    name      = "grafana-pvc"
    namespace = kubernetes_namespace.ems_ops.metadata[0].name
    labels = {
      "app.kubernetes.io/component"  = "monitoring"
      "app.kubernetes.io/part-of"    = "ems-ops"
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }

  spec {
    access_modes = ["ReadWriteOnce"]
    resources { requests = { storage = "1Gi" } }
  }
}

# ── Grafana Deployment ────────────────────────────────────────────────────────

resource "kubernetes_deployment" "grafana" {
  count = var.enable_monitoring ? 1 : 0

  metadata {
    name      = "grafana"
    namespace = kubernetes_namespace.ems_ops.metadata[0].name
    labels = {
      "app"                          = "grafana"
      "app.kubernetes.io/component"  = "monitoring"
      "app.kubernetes.io/part-of"    = "ems-ops"
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }

  spec {
    replicas = 1
    strategy { type = "Recreate" }
    selector { match_labels = { app = "grafana" } }

    template {
      metadata { labels = { app = "grafana", "app.kubernetes.io/part-of" = "ems-ops" } }

      spec {
        security_context {
          run_as_non_root = true
          run_as_user     = 472
          fs_group        = 472
        }

        container {
          name  = "grafana"
          image = "grafana/grafana:11.1.0"

          port { container_port = 3000; name = "http" }

          env {
            name = "GF_SECURITY_ADMIN_PASSWORD"
            value_from {
              secret_key_ref { name = kubernetes_secret.ems_ops_secrets.metadata[0].name; key = "GRAFANA_PASSWORD" }
            }
          }
          env { name = "GF_USERS_ALLOW_SIGN_UP"; value = "false" }
          env { name = "GF_ANALYTICS_REPORTING_ENABLED"; value = "false" }
          env { name = "GF_SECURITY_DISABLE_GRAVATAR"; value = "true" }

          volume_mount { name = "data"; mount_path = "/var/lib/grafana" }
          volume_mount { name = "datasources"; mount_path = "/etc/grafana/provisioning/datasources"; read_only = true }

          security_context {
            allow_privilege_escalation = false
            capabilities { drop = ["ALL"] }
          }

          resources {
            requests = { cpu = "100m", memory = "128Mi" }
            limits   = { cpu = "250m", memory = "256Mi" }
          }

          liveness_probe {
            http_get { path = "/api/health"; port = 3000 }
            initial_delay_seconds = 15; period_seconds = 20; timeout_seconds = 5
          }
          readiness_probe {
            http_get { path = "/api/health"; port = 3000 }
            initial_delay_seconds = 5; period_seconds = 10; timeout_seconds = 5
          }
        }

        volume { name = "data"; persistent_volume_claim { claim_name = kubernetes_persistent_volume_claim.grafana[0].metadata[0].name } }
        volume { name = "datasources"; config_map { name = kubernetes_config_map.grafana_datasources[0].metadata[0].name } }
      }
    }
  }

  depends_on = [
    kubernetes_secret.ems_ops_secrets,
    kubernetes_config_map.grafana_datasources,
    kubernetes_persistent_volume_claim.grafana,
    kubernetes_deployment.prometheus,
  ]
}

# ── Grafana Service ───────────────────────────────────────────────────────────

resource "kubernetes_service" "grafana" {
  count = var.enable_monitoring ? 1 : 0

  metadata {
    name      = "grafana"
    namespace = kubernetes_namespace.ems_ops.metadata[0].name
    labels = {
      "app.kubernetes.io/component"  = "monitoring"
      "app.kubernetes.io/part-of"    = "ems-ops"
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }

  spec {
    selector = { app = "grafana" }
    type     = "ClusterIP"
    port { name = "http"; port = 3000; target_port = 3000 }
  }
}
