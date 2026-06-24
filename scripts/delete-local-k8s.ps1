param(
    [string]$Namespace = "plataforma-academica"
)

$ErrorActionPreference = "Stop"

kubectl delete namespace $Namespace
Write-Output "Deleted namespace $Namespace."
