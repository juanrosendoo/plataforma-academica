param(
    [string]$Namespace = "plataforma-academica",
    [string]$Registry = "ghcr.io",
    [Parameter(Mandatory = $true)]
    [string]$ImageOwner,
    [Parameter(Mandatory = $true)]
    [string]$ImageRepository,
    [string]$ImageTag = "latest",
    [string]$MysqlRootPassword = "root",
    [string]$JwtSecretKey = "dev-secret-change-me",
    [string]$GhcrUsername = "",
    [string]$GhcrToken = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$k8sRoot = Join-Path $repoRoot "k8s"

kubectl apply -f (Join-Path $k8sRoot "namespace.yaml")

kubectl create secret generic plataforma-secrets `
    --namespace $Namespace `
    --from-literal MYSQL_ROOT_PASSWORD=$MysqlRootPassword `
    --from-literal JWT_SECRET_KEY=$JwtSecretKey `
    --dry-run=client `
    -o yaml | kubectl apply -f -

if ($GhcrUsername -and $GhcrToken) {
    kubectl create secret docker-registry ghcr-pull-secret `
        --namespace $Namespace `
        --docker-server=$Registry `
        --docker-username=$GhcrUsername `
        --docker-password=$GhcrToken `
        --dry-run=client `
        -o yaml | kubectl apply -f -

    kubectl patch serviceaccount default `
        --namespace $Namespace `
        --type merge `
        -p '{"imagePullSecrets":[{"name":"ghcr-pull-secret"}]}'
}

kubectl apply -f (Join-Path $k8sRoot "configmap.yaml")
kubectl apply -f (Join-Path $k8sRoot "mysql-auth.yaml")
kubectl apply -f (Join-Path $k8sRoot "mysql-academic.yaml")
kubectl apply -f (Join-Path $k8sRoot "auth-service.yaml")
kubectl apply -f (Join-Path $k8sRoot "academic-service.yaml")
kubectl apply -f (Join-Path $k8sRoot "gateway-service.yaml")
kubectl apply -f (Join-Path $k8sRoot "observability/prometheus.yaml")
kubectl apply -f (Join-Path $k8sRoot "observability/loki.yaml")
kubectl apply -f (Join-Path $k8sRoot "observability/grafana.yaml")
kubectl apply -f (Join-Path $k8sRoot "observability/promtail.yaml")
kubectl apply -f (Join-Path $k8sRoot "observability/home.yaml")

$imagePrefix = "$Registry/$($ImageOwner.ToLower())/$($ImageRepository.ToLower())"

kubectl set image deployment/auth-service `
    auth-service="$imagePrefix/auth-service:$ImageTag" `
    --namespace $Namespace
kubectl set image deployment/academic-service `
    academic-service="$imagePrefix/academic-service:$ImageTag" `
    --namespace $Namespace
kubectl set image deployment/gateway-service `
    gateway-service="$imagePrefix/gateway-service:$ImageTag" `
    --namespace $Namespace

kubectl rollout status deployment/db-auth --namespace $Namespace --timeout=180s
kubectl rollout status deployment/db-academic --namespace $Namespace --timeout=180s
kubectl rollout status deployment/auth-service --namespace $Namespace --timeout=180s
kubectl rollout status deployment/academic-service --namespace $Namespace --timeout=180s
kubectl rollout status deployment/gateway-service --namespace $Namespace --timeout=180s
kubectl rollout status deployment/observability-home --namespace $Namespace --timeout=180s

Write-Output ""
Write-Output "Local Kubernetes deployment completed."
Write-Output "Observability Home:  http://localhost:30100"
Write-Output "Gateway NodePort:    http://localhost:30080"
Write-Output "Prometheus NodePort: http://localhost:30090"
Write-Output "Grafana NodePort:    http://localhost:30300"
Write-Output "Loki NodePort:       http://localhost:30101"
Write-Output ""
Write-Output "Grafana login: admin / admin"
