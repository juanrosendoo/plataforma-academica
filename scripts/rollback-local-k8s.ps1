param(
    [string]$Namespace = "plataforma-academica"
)

$ErrorActionPreference = "Stop"

kubectl rollout undo deployment/auth-service --namespace $Namespace
kubectl rollout undo deployment/academic-service --namespace $Namespace
kubectl rollout undo deployment/gateway-service --namespace $Namespace

kubectl rollout status deployment/auth-service --namespace $Namespace --timeout=180s
kubectl rollout status deployment/academic-service --namespace $Namespace --timeout=180s
kubectl rollout status deployment/gateway-service --namespace $Namespace --timeout=180s

Write-Output "Rollback completed for auth-service, academic-service, and gateway-service."
