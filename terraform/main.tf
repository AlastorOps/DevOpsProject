# ── Namespace ─────────────────────────────────────────────────────────────────

resource "kubernetes_namespace" "ems_ops" {
  metadata {
    name = var.namespace
    labels = {
      "app.kubernetes.io/managed-by" = "terraform"
      "app.kubernetes.io/part-of"    = "ems-ops"
      "environment"                  = var.kube_context
    }
  }
}

# ── Secrets ───────────────────────────────────────────────────────────────────

resource "kubernetes_secret" "ems_ops_secrets" {
  metadata {
    name      = "ems-ops-secrets"
    namespace = kubernetes_namespace.ems_ops.metadata[0].name
    labels = {
      "app.kubernetes.io/managed-by" = "terraform"
      "app.kubernetes.io/part-of"    = "ems-ops"
    }
  }

  type = "Opaque"

  data = {
    POSTGRES_PASSWORD = var.postgres_password
    DATABASE_URL      = var.database_url
    SECRET_KEY        = var.secret_key
    ADMIN_PASSWORD    = var.admin_password
    GRAFANA_PASSWORD  = var.grafana_password
  }
}

# ── Apply kustomize manifests ─────────────────────────────────────────────────
# This applies all manifests in kubernetes/ after the namespace and secret exist.

resource "null_resource" "apply_manifests" {
  depends_on = [
    kubernetes_namespace.ems_ops,
    kubernetes_secret.ems_ops_secrets,
  ]

  provisioner "local-exec" {
    command     = "kubectl apply -k ${path.module}/../kubernetes/"
    working_dir = path.module
  }

  triggers = {
    # Re-apply whenever any manifest changes or image tag changes
    manifests_hash = sha256(join("", [
      for f in fileset("${path.module}/../kubernetes", "*.yaml") :
      filesha256("${path.module}/../kubernetes/${f}")
    ]))
    image_tag = var.image_tag
  }
}

# ── Destroy hook ──────────────────────────────────────────────────────────────

resource "null_resource" "destroy_manifests" {
  depends_on = [kubernetes_namespace.ems_ops]

  provisioner "local-exec" {
    when        = destroy
    command     = "kubectl delete namespace ems-ops --ignore-not-found --timeout=120s"
    working_dir = path.module
  }
}
