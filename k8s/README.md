# Local Kubernetes Deployment

These manifests deploy the backend platform to a local Kubernetes cluster such as Docker Desktop Kubernetes, Minikube, or Kind.

## Images

The deployment expects images published to GitHub Container Registry:

- `ghcr.io/<owner>/<repository>/auth-service:<tag>`
- `ghcr.io/<owner>/<repository>/academic-service:<tag>`
- `ghcr.io/<owner>/<repository>/gateway-service:<tag>`

The `container-release.yml` workflow publishes these images on pushes to `main`.

## Deploy

From the repository root:

```powershell
.\scripts\deploy-local-k8s.ps1 `
  -ImageOwner "<github-owner>" `
  -ImageRepository "<github-repo>" `
  -ImageTag "latest"
```

## URLs

With Docker Desktop Kubernetes, NodePorts are available at:

- Gateway: `http://localhost:30080`
- Prometheus: `http://localhost:30090`
- Grafana: `http://localhost:30300`
- Loki: `http://localhost:30101`

Grafana credentials:

- User: `admin`
- Password: `admin`

## Rollback

```powershell
.\scripts\rollback-local-k8s.ps1
```

## Delete

```powershell
.\scripts\delete-local-k8s.ps1
```
