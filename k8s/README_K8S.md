# CTA Kubernetes Deployment

## Prerequisites

- kubectl
- minikube
- Docker
- Docker images pushed to Docker Hub (`francomm/cta-backend:latest` and `francomm/cta-frontend:latest`)

## Install Everything (Arch Linux)

```bash
yay -S kubectl minikube docker

sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker
```

## Starting Minikube

```bash
minikube start --driver=docker --cpus=4 --memory=4096
```

## Setup Metrics Server (for HPA)

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.7.1/components.yaml
```

Fix certificate issue for minikube:

```bash
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value":"--kubelet-insecure-tls"}]'
```

Wait for it to be ready:

```bash
kubectl get pods -n kube-system -l k8s-app=metrics-server -w
```

Should show `1/1` Running.

## Check Everything Works

```bash
minikube status
kubectl get nodes
kubectl get pods -n kube-system | grep metrics-server
```

All should be running.

## Deploying the App

Go to the `k8s/` folder and create a file called `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "Creating namespace..."
kubectl apply -f cta-namespace.yaml

echo "Deploying PostgreSQL..."
kubectl apply -f cta-postgres-config.yaml
kubectl apply -f cta-postgres-secret.yaml
kubectl apply -f cta-postgres-deployment.yaml
kubectl wait --for=condition=ready pod -l app=postgres -n cta --timeout=300s

echo "Deploying backend..."
kubectl apply -f cta-backend-config.yaml
kubectl apply -f cta-backend-secret.yaml
kubectl apply -f cta-backend-deployment.yaml
kubectl wait --for=condition=ready pod -l app=backend -n cta --timeout=300s

echo "Deploying frontend..."
kubectl apply -f cta-frontend-config.yaml
kubectl apply -f cta-frontend-deployment.yaml

echo "Deploying HPA..."
kubectl apply -f hpa-config.yaml

echo "Done!"
kubectl get pods -n cta
```

Make it executable:

```bash
chmod +x deploy.sh
```

Run it:

```bash
./deploy.sh
```

## Running the App

Open three terminal windows.

**Terminal 1 - Frontend:**
```bash
kubectl port-forward -n cta svc/frontend 3000:3000
```

**Terminal 2 - Backend:**
```bash
kubectl port-forward -n cta svc/backend 8080:8080
```

**Terminal 3 - Monitor HPA:**
```bash
kubectl get hpa -n cta -w
```

Then go to `http://localhost:3000`.

## Load Testing & Monitoring HPA

**Terminal 1 - Watch HPA scaling:**
```bash
kubectl get hpa -n cta -w
```

**Terminal 2 - Run load test:**
```bash
# Make sure port-forward is running
kubectl port-forward -n cta svc/backend 8080:8080

# In your frontend directory:
npm run test:load
```

You'll see HPA create new pods as load increases:
- Backend scales 1-5 replicas
- Frontend scales 1-3 replicas

## Common Commands

```bash
kubectl get pods -n cta
kubectl get svc -n cta
kubectl logs -n cta -l app=backend -f
kubectl exec -it -n cta <pod-name> -- /bin/sh
kubectl rollout restart deployment/backend -n cta
kubectl get hpa -n cta
kubectl describe hpa backend-hpa -n cta
kubectl get events -n cta --sort-by='.lastTimestamp'
```

## Cleaning Up

```bash
kubectl delete namespace cta
minikube delete
```

## Files Needed in `k8s/` folder

- `cta-namespace.yaml`
- `cta-postgres-config.yaml`
- `cta-postgres-secret.yaml`
- `cta-postgres-deployment.yaml`
- `cta-backend-config.yaml`
- `cta-backend-secret.yaml`
- `cta-backend-deployment.yaml`
- `cta-frontend-config.yaml`
- `cta-frontend-deployment.yaml`
- `hpa-config.yaml`

## Secret Files Content

**cta-postgres-secret.yaml:**
```yaml
POSTGRES_USER: "postgres"
POSTGRES_PASSWORD: "admin"
```

**cta-backend-secret.yaml:**
```yaml
SPRING_DATASOURCE_URL: "jdbc:postgresql://postgres:5432/cta"
SPRING_DATASOURCE_USERNAME: "postgres"
SPRING_DATASOURCE_PASSWORD: "admin"
JWT_SECRET: "my-secret-key-minimum-32-characters-long"
JWT_EXPIRATION: "86400000"
ENVIRONMENT: "kubernetes"
```

Add to `.gitignore`:
```
*-secret.yaml
```