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
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.6.4/components.yaml
sleep 5
kubectl apply -f hpa-config.yaml
echo "Done!"
kubectl get pods -n cta