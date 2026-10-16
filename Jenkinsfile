pipeline {
    agent any

    environment {
        IMAGE_BACKEND     = "smartstock-backend"
        IMAGE_FRONTEND    = "smartstock-frontend"
        SERVER_HOST       = "YOUR_SERVER_IP"   // ← Thay IP production của bạn
        SERVER_USER       = "root"
        DEPLOY_DIR        = "~/smartstock"
    }

    stages {

        // ─────────────────────────────────────────────
        // 1. Checkout source code từ GitHub
        // ─────────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/YOUR_USERNAME/YOUR_REPO.git',  // ← Thay URL repo
                        credentialsId: 'github-pat'
                    ]]
                ])
            }
        }

        // ─────────────────────────────────────────────
        // 2. Build & Push Backend image (.NET 10)
        // ─────────────────────────────────────────────
        stage('Build & Push Backend') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo "==> Building Backend image..."
                        docker build -t docker.io/\$DOCKER_USER/${IMAGE_BACKEND}:latest ./backend

                        echo "==> Logging in to Docker Hub..."
                        echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin

                        echo "==> Pushing Backend image..."
                        docker push docker.io/\$DOCKER_USER/${IMAGE_BACKEND}:latest
                    """
                }
            }
        }

        // ─────────────────────────────────────────────
        // 3. Build & Push Frontend image (React + Nginx)
        // ─────────────────────────────────────────────
        stage('Build & Push Frontend') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo "==> Building Frontend image..."
                        docker build -t docker.io/\$DOCKER_USER/${IMAGE_FRONTEND}:latest .

                        echo "==> Pushing Frontend image..."
                        docker push docker.io/\$DOCKER_USER/${IMAGE_FRONTEND}:latest
                    """
                }
            }
        }

        // ─────────────────────────────────────────────
        // 4. Deploy lên Production server qua SSH
        // ─────────────────────────────────────────────
        stage('Deploy to Production') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-cred',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    ),
                    string(credentialsId: 'db-conn', variable: 'DB_CONN'),
                    string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
                    file(credentialsId: 'docker-compose-prod', variable: 'COMPOSE_FILE')
                ]) {
                    sshagent(credentials: ['server-ssh-key']) {
                        sh """
                            echo "==> Creating deploy directory on server..."
                            ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} \
                                "mkdir -p ${DEPLOY_DIR}"

                            echo "==> Copying docker-compose.prod.yml to server..."
                            scp -o StrictHostKeyChecking=no \
                                \$COMPOSE_FILE \
                                ${SERVER_USER}@${SERVER_HOST}:${DEPLOY_DIR}/docker-compose.yml

                            echo "==> Running deployment on server..."
                            ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "
                                cd ${DEPLOY_DIR} && \

                                cat > .env << 'ENVEOF'
DOCKER_USER=\$DOCKER_USER
DB_CONNECTION_STRING=\$DB_CONN
JWT_SECRET=\$JWT_SECRET
ENVEOF

                                echo \"\$DOCKER_PASS\" | docker login -u \$DOCKER_USER --password-stdin && \
                                docker compose --env-file .env pull && \
                                docker compose --env-file .env down && \
                                docker compose --env-file .env up -d && \
                                docker image prune -f && \

                                echo '==> Deployment completed!' && \
                                docker ps
                            "
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline SUCCESS - App deployed!'
        }
        failure {
            echo 'Pipeline FAILED - Check logs!'
        }
        always {
            sh 'docker logout || true'
        }
    }
}
