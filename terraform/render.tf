# Render deployment management.
#
# There is no official Terraform provider for Render, so this file uses
# null_resource + local-exec to drive the Render CLI (render-cli) or the
# Render Deploy Hook API to trigger deployments.
#
# Install Render CLI: https://render.com/docs/cli
# Or use the deploy hook URL available in your Render service dashboard.
#
# For full IaC of Render services, configure them via render.yaml (already
# present in the repo root) and point Render's Blueprint to your GitHub repo.

# ── Variables (render-specific) ───────────────────────────────────────────────

variable "render_api_key" {
  description = "Render API key — set via TF_VAR_render_api_key env var or -var flag (never in tfvars)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "render_backend_service_id" {
  description = "Render service ID for ems-backend (visible in the Render dashboard URL)"
  type        = string
  default     = ""
}

variable "render_frontend_service_id" {
  description = "Render service ID for ems-frontend"
  type        = string
  default     = ""
}

# ── Deploy backend via Render API ─────────────────────────────────────────────

resource "null_resource" "render_deploy_backend" {
  count = var.render_api_key != "" && var.render_backend_service_id != "" ? 1 : 0

  triggers = {
    image_tag = var.image_tag
  }

  provisioner "local-exec" {
    command = <<-SH
      curl -s -X POST \
        -H "Authorization: Bearer ${var.render_api_key}" \
        -H "Content-Type: application/json" \
        "https://api.render.com/v1/services/${var.render_backend_service_id}/deploys" \
        | jq -r '.id // "deploy triggered"'
    SH
    interpreter = ["bash", "-c"]
  }
}

# ── Deploy frontend via Render API ────────────────────────────────────────────

resource "null_resource" "render_deploy_frontend" {
  count = var.render_api_key != "" && var.render_frontend_service_id != "" ? 1 : 0

  triggers = {
    image_tag = var.image_tag
  }

  provisioner "local-exec" {
    command = <<-SH
      curl -s -X POST \
        -H "Authorization: Bearer ${var.render_api_key}" \
        -H "Content-Type: application/json" \
        "https://api.render.com/v1/services/${var.render_frontend_service_id}/deploys" \
        | jq -r '.id // "deploy triggered"'
    SH
    interpreter = ["bash", "-c"]
  }

  depends_on = [null_resource.render_deploy_backend]
}

# ── Outputs ───────────────────────────────────────────────────────────────────

output "render_backend_service_id" {
  description = "Render backend service ID"
  value       = var.render_backend_service_id
}

output "render_frontend_service_id" {
  description = "Render frontend service ID"
  value       = var.render_frontend_service_id
}
