# Essential DevOps Commands Reference Guide
## Intelligent Land Record Digitization and Validation System

This document provides a categorized compilation of commands used across Linux, Git, Docker, Docker Compose, Kubernetes, Jenkins, and AWS CLI for the project.

---

## 1. Linux & Bash Commands

| Command | Purpose |
| :--- | :--- |
| `sudo apt update && sudo apt upgrade -y` | Synchronize package repositories and upgrade installed software |
| `sudo systemctl status docker` | Check if the Docker daemon is active and running |
| `sudo systemctl start docker` | Start the Docker service |
| `sudo usermod -aG docker $USER` | Add the current non-root user to the Docker group |
| `htop` | Interactive real-time process and system resource monitor |
| `df -h` | Display disk space usage in human-readable gigabytes |
| `free -m` | Display free and used physical and swap memory in megabytes |
| `ip addr show` / `curl ifconfig.me` | Find local private IP and public cloud IPv4 address |
| `chmod +x scripts/*.sh` | Grant executable permissions to shell scripts |
| `tail -f /var/log/syslog` | Stream real-time Linux operating system logs |

---

## 2. Git Version Control Commands

| Command | Purpose |
| :--- | :--- |
| `git clone <repo_url>` | Clone the project repository to your local machine or server |
| `git status` | View modified, staged, and untracked files |
| `git add .` | Stage all modified and new files for commit |
| `git commit -m "feat: implement validation engine"` | Record changes in the local repository with a descriptive message |
| `git push origin main` | Push committed changes to the GitHub remote repository |
| `git pull origin main` | Fetch and merge the latest code changes from GitHub |
| `git log --oneline -n 10` | Display a condensed, chronological list of the last 10 commits |
| `git branch -a` | List all local and remote branches |

---

## 3. Docker Commands

| Command | Purpose |
| :--- | :--- |
| `docker build -t landrecords/backend:1.0 ./backend` | Build the Backend Docker image from its Dockerfile |
| `docker build -t landrecords/ocr-service:1.0 ./ocr-service` | Build the Tesseract OCR microservice Docker image |
| `docker build -t landrecords/frontend:1.0 ./frontend` | Build the multi-stage React/Nginx frontend image |
| `docker images` | List all locally cached Docker images |
| `docker run -d -p 8000:8000 --name api landrecords/backend:1.0` | Run a standalone container in detached mode |
| `docker ps` | List all active running containers |
| `docker ps -a` | List all containers (including exited and stopped ones) |
| `docker logs -f <container_name>` | Stream container standard output and error logs |
| `docker exec -it land_records_backend /bin/bash` | Open an interactive terminal inside a running container |
| `docker system prune -a --volumes` | Clean up stopped containers, unused images, and dangling volumes |

---

## 4. Docker Compose Commands

| Command | Purpose |
| :--- | :--- |
| `docker compose -f docker/docker-compose.yml up -d --build` | Build images and start all 4 services in the background |
| `docker compose -f docker/docker-compose.yml ps` | Display status and health of all managed containers |
| `docker compose -f docker/docker-compose.yml logs -f` | Follow and aggregate logs across all 4 services |
| `docker compose -f docker/docker-compose.yml logs -f backend` | Stream logs specifically from the FastAPI backend service |
| `docker compose -f docker/docker-compose.yml restart` | Restart all running containers without destroying volumes |
| `docker compose -f docker/docker-compose.yml stop` | Stop all container services without removing them |
| `docker compose -f docker/docker-compose.yml down` | Stop and remove containers and networks (data volumes kept) |
| `docker compose -f docker/docker-compose.yml down -v` | Stop containers and wipe persistent data volumes (Full Reset) |

---

## 5. Kubernetes (Minikube & kubectl) Commands

| Command | Purpose |
| :--- | :--- |
| `minikube start --driver=docker --cpus=2 --memory=4096` | Start a local single-node Kubernetes cluster |
| `minikube status` | Check Minikube cluster and control-plane health |
| `kubectl apply -f k8s/storage/postgres-pvc.yaml` | Create the persistent volume claim for database storage |
| `kubectl apply -f k8s/configmaps/app-config.yaml` | Apply application configuration settings |
| `kubectl apply -f k8s/secrets/secret-template.yaml` | Apply database credentials and JWT secret |
| `kubectl apply -f k8s/deployments/` | Deploy all microservices (frontend, backend, OCR, DB) |
| `kubectl apply -f k8s/services/services.yaml` | Create Kubernetes ClusterIP and NodePort services |
| `kubectl get pods -o wide` | Display all running Pods, IP addresses, and node assignments |
| `kubectl get deployments` | Check deployment replica counts and rollout readiness |
| `kubectl get svc` | List services, exposed ports, and NodePort mappings |
| `kubectl logs -f deployment/backend-deployment` | Stream logs from the backend pod deployment |
| `kubectl describe pod <pod_name>` | Inspect detailed pod lifecycle events and troubleshooting diagnostics |
| `minikube service frontend-service` | Automatically open the frontend service in your default browser |

---

## 6. Jenkins Automation Commands

| Command | Purpose |
| :--- | :--- |
| `sudo systemctl status jenkins` | Verify that the Jenkins CI/CD automation server is running |
| `sudo systemctl restart jenkins` | Restart Jenkins service after installing plugins |
| `sudo cat /var/lib/jenkins/secrets/initialAdminPassword` | Retrieve initial administrator setup password |
| `pytest tests/test_api.py -v --junitxml=junit.xml` | Run test suite and export JUnit XML for Jenkins test graphs |

---

## 7. AWS Cloud & EC2 Commands

| Command | Purpose |
| :--- | :--- |
| `ssh -i key.pem ubuntu@<EC2_PUBLIC_IP>` | Connect securely to your AWS Ubuntu EC2 instance |
| `aws configure` | Configure AWS Access Key, Secret Key, and Default Region |
| `aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress]'` | List all EC2 instances and public IPs in your AWS region |
| `aws ec2 authorize-security-group-ingress --group-id <SG_ID> --protocol tcp --port 80 --cidr 0.0.0.0/0` | Open port 80 (HTTP) on an AWS Security Group |
| `sudo certbot certonly --standalone -d <domain>` | Provision free SSL/TLS certificate from Let's Encrypt |
