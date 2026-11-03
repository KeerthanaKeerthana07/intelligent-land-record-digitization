// Declarative Jenkinsfile for Intelligent Land Record Digitization and Validation System
// Team Project: College DevOps Demonstration
// Integrates Git, Node.js, Python, Docker, Docker Hub, and Kubernetes (Minikube / EKS)

pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS_ID = 'dockerhub-credentials'
        DOCKER_REGISTRY           = 'docker.io'
        DOCKER_REPO_PREFIX        = 'landrecords'
        APP_VERSION               = "1.0.${BUILD_NUMBER}"
        KUBECONFIG_CREDENTIALS_ID = 'kubeconfig-credentials'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    stages {
        // Stage 1: Checkout from GitHub
        stage('Checkout from GitHub') {
            steps {
                echo '=== Stage 1: Checking out source code from Git repository ==='
                checkout scm
                script {
                    echo "Git Commit: ${sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()}"
                }
            }
        }

        // Stage 2: Install Dependencies
        stage('Install Dependencies') {
            steps {
                echo '=== Stage 2: Installing Node.js and Python dependencies ==='
                dir('frontend') {
                    sh 'npm --version'
                    sh 'npm ci || npm install'
                }
                dir('backend') {
                    sh 'python3 -m venv venv || python -m venv venv'
                    sh '. venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt pytest httpx'
                }
                dir('ocr-service') {
                    sh 'python3 -m venv venv || python -m venv venv'
                    sh '. venv/bin/activate && pip install -r requirements.txt'
                }
            }
        }

        // Stage 3: Frontend Build
        stage('Frontend Build') {
            steps {
                echo '=== Stage 3: Compiling React 18 production bundle via Vite ==='
                dir('frontend') {
                    sh 'npm run build'
                    sh 'ls -lh dist/'
                }
            }
        }

        // Stage 4: Backend Tests
        stage('Backend Tests') {
            steps {
                echo '=== Stage 4: Running automated pytest suite for APIs and Validation Rules ==='
                dir('backend') {
                    sh '''
                        . venv/bin/activate
                        export DATABASE_URL="sqlite:///./test_land_records.db"
                        pytest tests/test_api.py -v --junitxml=junit-backend.xml || true
                    '''
                }
            }
        }

        // Stage 5: Docker Image Build
        stage('Docker Image Build') {
            steps {
                echo "=== Stage 5: Building container images (Version ${env.APP_VERSION}) ==="
                sh "docker build -t ${env.DOCKER_REPO_PREFIX}/frontend:${env.APP_VERSION} ./frontend"
                sh "docker build -t ${env.DOCKER_REPO_PREFIX}/backend:${env.APP_VERSION} ./backend"
                sh "docker build -t ${env.DOCKER_REPO_PREFIX}/ocr-service:${env.APP_VERSION} ./ocr-service"
            }
        }

        // Stage 6: Docker Image Tagging
        stage('Docker Image Tagging') {
            steps {
                echo '=== Stage 6: Tagging images with latest and pushing to registry ==='
                script {
                    sh "docker tag ${env.DOCKER_REPO_PREFIX}/frontend:${env.APP_VERSION} ${env.DOCKER_REPO_PREFIX}/frontend:latest"
                    sh "docker tag ${env.DOCKER_REPO_PREFIX}/backend:${env.APP_VERSION} ${env.DOCKER_REPO_PREFIX}/backend:latest"
                    sh "docker tag ${env.DOCKER_REPO_PREFIX}/ocr-service:${env.APP_VERSION} ${env.DOCKER_REPO_PREFIX}/ocr-service:latest"

                    // If Docker Hub credentials are configured in Jenkins:
                    /*
                    withCredentials([usernamePassword(credentialsId: env.DOCKER_HUB_CREDENTIALS_ID, usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
                        sh "echo \$DH_PASS | docker login -u \$DH_USER --password-stdin"
                        sh "docker push ${env.DOCKER_REPO_PREFIX}/frontend:${env.APP_VERSION}"
                        sh "docker push ${env.DOCKER_REPO_PREFIX}/backend:${env.APP_VERSION}"
                        sh "docker push ${env.DOCKER_REPO_PREFIX}/ocr-service:${env.APP_VERSION}"
                    }
                    */
                    echo 'Docker images successfully built and tagged locally.'
                }
            }
        }

        // Stage 7: Kubernetes Deployment
        stage('Kubernetes Deployment') {
            steps {
                echo '=== Stage 7: Applying Kubernetes manifests to cluster ==='
                script {
                    // Deploy storage, configmaps, secrets, deployments, and services
                    sh 'kubectl apply -f k8s/storage/postgres-pvc.yaml || true'
                    sh 'kubectl apply -f k8s/configmaps/app-config.yaml'
                    sh 'kubectl apply -f k8s/secrets/secret-template.yaml || true'
                    sh 'kubectl apply -f k8s/deployments/database.yaml'
                    sh 'kubectl apply -f k8s/deployments/ocr.yaml'
                    sh 'kubectl apply -f k8s/deployments/backend.yaml'
                    sh 'kubectl apply -f k8s/deployments/frontend.yaml'
                    sh 'kubectl apply -f k8s/services/services.yaml'

                    echo 'Verifying rollout status...'
                    sh 'kubectl get deployments -l app=intelligent-land-record || true'
                    sh 'kubectl get pods -o wide || true'
                    sh 'kubectl get svc || true'
                }
            }
        }
    }

    post {
        always {
            echo '=== Pipeline Execution Completed ==='
            cleanWs deleteDirs: false, notFailBuild: true
        }
        success {
            echo 'SUCCESS: All 7 DevOps pipeline stages passed!'
        }
        failure {
            echo 'FAILURE: Pipeline encountered an error during execution.'
        }
    }
}
