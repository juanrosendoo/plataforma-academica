param(
    [string]$Namespace = "plataforma-academica"
)

$ErrorActionPreference = "Stop"

$forwards = @(
    @{ Name = "observability-home"; LocalPort = "13101"; ServicePort = "80" },
    @{ Name = "gateway-service"; LocalPort = "18080"; ServicePort = "8000" },
    @{ Name = "prometheus"; LocalPort = "19090"; ServicePort = "9090" },
    @{ Name = "grafana"; LocalPort = "13000"; ServicePort = "3000" },
    @{ Name = "loki"; LocalPort = "13100"; ServicePort = "3100" }
)

foreach ($forward in $forwards) {
    $existing = Get-NetTCPConnection -LocalPort $forward.LocalPort -State Listen -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Output "$($forward.Name) already has a local listener on port $($forward.LocalPort); skipping."
        continue
    }

    Start-Process -WindowStyle Hidden -FilePath kubectl -ArgumentList @(
        "port-forward",
        "--namespace",
        $Namespace,
        "svc/$($forward.Name)",
        "$($forward.LocalPort):$($forward.ServicePort)"
    ) | Out-Null
}

Write-Output "Local Kubernetes port-forwards started."
Write-Output "Observability Home: http://localhost:13101"
Write-Output "Gateway:    http://localhost:18080"
Write-Output "Prometheus: http://localhost:19090"
Write-Output "Grafana:    http://localhost:13000"
Write-Output "Loki:       http://localhost:13100"
Write-Output ""
Write-Output "Grafana login: admin / admin"
