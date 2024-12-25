pipeline {
    agent any

    options {
        disableConcurrentBuilds() 
        timestamps() 
    }

    environment{
        IMAGE_NAME_FOR_APP = "chat-api"
        IMAGE_NAME_FOR_PROXY = "chat-proxy"
        DOCKERHUB_USERNAME = "jamirul"
        IMAGE_TAG ="latest"
        GITHUB_URL='https://github.com/jamirul-1210/chat-app-backend.git'
        GITHUB_CREDENTIALS_ID = 'github-credentials'
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
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
