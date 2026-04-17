pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME    = "${DOCKERHUB_CREDENTIALS_USR}"
        IMAGE_SERVER          = "${DOCKERHUB_USERNAME}/ozhukkam-server"
        IMAGE_CLIENT          = "${DOCKERHUB_USERNAME}/ozhukkam-client"
        IMAGE_TAG             = "${GIT_COMMIT[0..7]}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Server deps') {
                    steps {
                        dir('server') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Client deps') {
                    steps {
                        dir('client') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        stage('Lint') {
            parallel {
                stage('Lint Server') {
                    steps {
                        dir('server') {
                            sh 'npm run lint'
                        }
                    }
                }
                stage('Lint Client') {
                    steps {
                        dir('client') {
                            sh 'npm run lint'
                        }
                    }
                }
            }
        }

        stage('Unit Tests') {
            parallel {
                stage('Test Server') {
                    steps {
                        dir('server') {
                            sh 'npm test'
                        }
                    }
                }
                stage('Test Client') {
                    steps {
                        dir('client') {
                            sh 'npm test'
                        }
                    }
                }
            }
        }

        stage('Docker Build') {
            parallel {
                stage('Build Server Image') {
                    steps {
                        sh "docker build -f Dockerfile.server -t ${IMAGE_SERVER}:${IMAGE_TAG} -t ${IMAGE_SERVER}:latest ."
                    }
                }
                stage('Build Client Image') {
                    steps {
                        sh "docker build -f Dockerfile.client -t ${IMAGE_CLIENT}:${IMAGE_TAG} -t ${IMAGE_CLIENT}:latest ."
                    }
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh "echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_USERNAME} --password-stdin"
                sh "docker push ${IMAGE_SERVER}:${IMAGE_TAG}"
                sh "docker push ${IMAGE_SERVER}:latest"
                sh "docker push ${IMAGE_CLIENT}:${IMAGE_TAG}"
                sh "docker push ${IMAGE_CLIENT}:latest"
            }
        }
    }

    post {
        always {
            sh 'docker logout'
            cleanWs()
        }
        success {
            echo "✅ PIPELINE SUCCESS! Images pushed to Docker Hub"
        }
        failure {
            echo "❌ PIPELINE FAILED!"
        }
    }
}
