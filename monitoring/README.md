# Monitoring

This folder contains local Prometheus and Grafana starter configuration for EMS-Ops.

## Prometheus

`prometheus.yml` currently scrapes:

- Prometheus self-metrics on `localhost:9090`
- Optional `node-exporter` on `node-exporter:9100`

The backend scrape target is intentionally commented out because the FastAPI app does not currently expose a Prometheus-format `/metrics` endpoint. Enable that job only after adding an exporter such as `prometheus-fastapi-instrumentator` or equivalent middleware.

## Grafana

Dashboard JSON lives in `grafana/dashboards/backend.json`.

Import it from Grafana with:

1. Open Grafana.
2. Go to Dashboards.
3. Select Import.
4. Upload `monitoring/grafana/dashboards/backend.json`.
