pipeline {
    agent any

    options {
        disableConcurrentBuilds() 
        timestamps() 
    }
    parameters {
        base64File 'small'
    }
    environment{
        IMAGE_NAME_FOR_APP = "chat-api"
        IMAGE_NAME_FOR_PROXY = "chat-proxy"
        DOCKERHUB_USERNAME = "jamirul"
        IMAGE_TAG ="latest"
        GITHUB_URL='https://github.com/jamirul-1210/chat-app-backend.git'
        GITHUB_CREDENTIALS_ID = 'github-credentials'
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        SSH_CREDENTIALS_ID = 'remote-server-credentials'
        REMOTE_SERVER = 'ec2-13-232-170-244.ap-south-1.compute.amazonaws.com' 
        REMOTE_SERVER_USERNAME = 'ubuntu'
        DEST_PATH = '/home/ubuntu/backend' 
    }
    

    

    stages {

        stage("Workspace cleanup"){
            steps{
                script{
                    cleanWs()
                }
            }
        }
        
        stage('Clone Repository') {
            steps {
                git branch: 'main', url:GITHUB_URL , credentialsId: GITHUB_CREDENTIALS_ID 
            }
        }

        stage('Docker: Clear all cached Images'){
            steps{
                script {
                    
                    sh '''
                        docker rm -v -f $(docker ps -qa) || echo "No conatiners to remove"
                        docker rmi -f $(docker images -aq) || echo "No images to remove"
                    '''
                }
            }
        }

        stage('Docker: Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKERHUB_USERNAME}/${IMAGE_NAME_FOR_APP}:${IMAGE_TAG} ."
                sh "docker build -t ${DOCKERHUB_USERNAME}/${IMAGE_NAME_FOR_PROXY}:${IMAGE_TAG} ./nginx"
            }
        }

        stage("Docker: Push to DockerHub"){
            steps{
                
                withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    sh '''
                        echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
                    '''
                }
                sh "docker push ${DOCKERHUB_USERNAME}/${IMAGE_NAME_FOR_APP}:${IMAGE_TAG}"
                sh "docker push ${DOCKERHUB_USERNAME}/${IMAGE_NAME_FOR_PROXY}:${IMAGE_TAG}"
            }
        }


        stage('Test') {
            steps {
                echo 'skipping test ...'
            }
        }

        stage('Deploy') {
            steps {
                script {
                    sshagent (credentials: [env.SSH_CREDENTIALS_ID]) {
                        withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, passwordVariable: 'DOCKERHUB_PASS',usernameVariable: 'DOCKER_USERNAME')]) {
                            try {
                                sh """
                                ssh -o StrictHostKeyChecking=no $REMOTE_SERVER << 'EOF'

                                echo "Logging into Docker Hub"
                                echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin

                                echo "Stopping all running containers"
                                docker ps -q | xargs --no-run-if-empty docker stop

                                echo "Removing all Docker containers"
                                docker ps -aq | xargs --no-run-if-empty docker rm

                                echo "Removing all Docker images"
                                docker images -q | xargs --no-run-if-empty docker rmi -f

                                docker-compose up -d

                                echo "Deployment successful"
                                exit 0
                                EOF
                                """
                            } catch (Exception e) {
                                error("Deployment failed: ${e.message}")
                            } finally {
                                echo "SSH session completed."
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished!'
        }
        success {
            echo 'Build succeeded!'
        }
        failure {
            echo 'Build failed.'
        }
    }
}
