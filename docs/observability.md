# Observabilidade

## Visão Geral

A stack de observabilidade cobre três necessidades:

- Logs estruturados das APIs.
- Coleta centralizada de logs.
- Métricas Prometheus com visualização no Grafana.

Componentes:

| Componente | Função | URL |
| --- | --- | --- |
| Página de Observabilidade | Página de entrada da observabilidade | `http://localhost:3100` |
| Grafana | Dashboards de métricas e logs | `http://localhost:3000` |
| Prometheus | Coleta e consulta de métricas | `http://localhost:9090` |
| Loki | Armazenamento de logs | `http://localhost:3101` |
| Promtail | Coleta logs dos containers | interno |

Login do Grafana:

```text
admin / admin
```

## Logs Estruturados

Os serviços `auth-service` e `academic-service` emitem logs em JSON para cada requisição.

Campos principais:

- `timestamp`
- `level`
- `logger`
- `message`
- `service`
- `event`
- `method`
- `path`
- `status_code`
- `duration_ms`
- `client_ip`

Exemplo:

```json
{
  "timestamp": "2026-06-23T23:38:45+0000",
  "level": "INFO",
  "logger": "app.requests",
  "message": "request_completed",
  "service": "auth-service",
  "event": "request_completed",
  "method": "GET",
  "path": "/",
  "status_code": 200,
  "duration_ms": 4.06,
  "client_ip": "172.18.0.1"
}
```

## Métricas Prometheus

Endpoints:

- Auth Service: `http://localhost:8001/metrics`
- Academic Service: `http://localhost:8002/metrics`

Métricas principais:

| Métrica | Tipo | Objetivo |
| --- | --- | --- |
| `http_requests_total` | Counter | Quantidade total de requisições por serviço, método, rota e status |
| `http_request_duration_seconds` | Histogram | Latência das requisições |
| `http_requests_in_progress` | Gauge | Requisições em andamento |

Também existem métricas padrão do processo Python, como CPU, memória, GC e informações do runtime.

## Prometheus

URL:

```text
http://localhost:9090
```

Targets:

```text
http://localhost:9090/targets
```

Serviços coletados:

- `auth-service:8000/metrics`
- `academic-service:8000/metrics`
- `prometheus:9090/metrics`

Consultas úteis:

```promql
sum by (service, path) (rate(http_requests_total[5m]))
```

```promql
histogram_quantile(
  0.95,
  sum by (service, path, le) (rate(http_request_duration_seconds_bucket[5m]))
)
```

```promql
sum by (service) (rate(http_requests_total{status_code=~"5.."}[5m]))
or on(service)
(sum by (service) (rate(http_requests_total[5m])) * 0)
```

## Grafana

URL:

```text
http://localhost:3000
```

Dashboard provisionado:

```text
Observabilidade da Plataforma Acadêmica
```

Link direto:

```text
http://localhost:3000/d/academic-platform-observability/observabilidade-da-plataforma-academica
```

Painéis:

- Taxa de Requisições.
- Latência P95.
- Erros 5xx.
- Requisições em Andamento.
- Logs dos Serviços.

Datasources provisionados:

- Prometheus.
- Loki.

## Loki E Promtail

Loki API:

```text
http://localhost:3101
```

Readiness:

```text
http://localhost:3101/ready
```

Promtail coleta os logs dos containers Docker usando o socket Docker:

```text
/var/run/docker.sock
```

Labels úteis no Loki:

- `service`
- `container`
- `compose_project`
- `service_name`

Consulta LogQL para serviços backend:

```logql
{service=~"auth-service|academic-service|gateway-service"}
```

Consulta para erros:

```logql
{service=~"auth-service|academic-service|gateway-service"} |= "ERROR"
```

## O Que Demonstrar

1. Abrir a página de entrada:

```text
http://localhost:3100
```

2. Abrir Prometheus targets:

```text
http://localhost:9090/targets
```

Mostrar `auth-service`, `academic-service` e `prometheus` com status `UP`.

3. Abrir endpoints de métricas:

```text
http://localhost:8001/metrics
http://localhost:8002/metrics
```

4. Gerar tráfego:

```text
http://localhost:8000/academic/disciplinas
http://localhost:8000/academic/turmas
http://localhost:8000/health
```

5. Abrir o dashboard Grafana e mostrar:

- Contadores de requisição aumentando.
- Latência P95.
- Erros 5xx como `0` quando não houver falhas.
- Logs dos serviços chegando via Loki.

6. Mostrar uma consulta LogQL no Grafana Explore:

```logql
{service=~"auth-service|academic-service|gateway-service"}
```

## Health Checks

Endpoints atuais:

| Serviço | Endpoint |
| --- | --- |
| Gateway | `http://localhost:8000/health` |
| Auth Service | `http://localhost:8001/` |
| Academic Service | `http://localhost:8002/` |
| Prometheus | `http://localhost:9090/-/ready` |
| Loki | `http://localhost:3101/ready` |
| Grafana | `http://localhost:3000/api/health` |

Para Kubernetes, os probes recomendados são:

- `gateway-service`: `/health`
- `auth-service`: `/`
- `academic-service`: `/`
- Métricas: `/metrics` para validação operacional
