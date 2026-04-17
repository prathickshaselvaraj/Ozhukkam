pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME    = "${DOCKERHUB_CREDENTIALS_USR}"
        IMAGE_SERVER          = "${DOCKERHUB_USERNAME}/ozhukkam-server"
        IMAGE_CLIENT          = "${DOCKERHUB_USERNAME}/ozhukkam-client"
        IMAGE_TAG             = "${GIT_COMMIT[0..7]}"
        SONAR_PROJECT_KEY     = "ozhukkam"
    }

    triggers {
        pollSCM('H/2 * * * *')
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Checked out branch: ${GIT_BRANCH} | commit: ${GIT_COMMIT}"
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

        stage('SonarQube Analysis') {
    steps {
        withSonarQubeEnv('My Sonar Server') {
            sh 'sonar-scanner -Dsonar.projectKey=ozhukkam -Dsonar.sources=server/src,client/src -Dsonar.tests='
        }
    }
}

        stage('Quality Gate — Strict_Production_Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
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

        stage('Update K8s Manifests') {
            steps {
                sh """
                    sed -i 's|image: .*ozhukkam-server.*|image: ${IMAGE_SERVER}:${IMAGE_TAG}|g' kubernetes/deployment.yaml
                    sed -i 's|image: .*ozhukkam-client.*|image: ${IMAGE_CLIENT}:${IMAGE_TAG}|g' kubernetes/deployment.yaml
                """
                sh """
                    git config user.email "jenkins@ozhukkam.ci"
                    git config user.name "Jenkins"
                    git add kubernetes/deployment.yaml
                    git commit -m "ci: update image tags to ${IMAGE_TAG} [skip ci]" || echo "No changes to commit"
                    git push origin main || echo "Push failed or no changes"
                """
            }
        }
    }

    post {
        success {
            echo "Pipeline SUCCESS — image tags: ${IMAGE_TAG}"
        }
        failure {
            echo "Pipeline FAILED — check the stage logs above"
        }
        always {
            sh 'docker logout'
            cleanWs()
        }
    }
}
