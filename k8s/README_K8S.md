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

## Check Everything Works

```bash
minikube status
kubectl get nodes
```

Both should show the cluster is running.

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

Open two terminal windows. In one:

```bash
kubectl port-forward -n cta svc/frontend 3000:3000
```

In the other:

```bash
kubectl port-forward -n cta svc/backend 8080:8080
```

Then go to `http://localhost:3000`.

## Common Commands

```bash
# Check status
kubectl get pods -n cta

# See what's running
kubectl get svc -n cta

# Check logs
kubectl logs -n cta -l app=backend -f

# Get into a pod if needed to debug
kubectl exec -it -n cta <pod-name> -- /bin/sh

# Restart something
kubectl rollout restart deployment/backend -n cta

# See resource usage
kubectl top pods -n cta
```

## Cleaning Up

```bash
# Delete everything in the namespace
kubectl delete namespace cta

# Or completely nuke minikube (careful!)
minikube delete
```

## Files Needed

Make sure all these files are in the `k8s/` folder:

- `cta-namespace.yaml`
- `cta-postgres-config.yaml`
- `cta-postgres-secret.yaml`
- `cta-postgres-pvc.yaml`
- `cta-postgres-deployment.yaml`
- `cta-backend-config.yaml`
- `cta-backend-secret.yaml`
- `cta-backend-deployment.yaml`
- `cta-frontend-config.yaml`
- `cta-frontend-deployment.yaml`

## What's in the Secret Files

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

**Note:** Don't commit secret files to Git. Add to `.gitignore`:
```
*-secret.yaml
```