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
        // SCM polling — checks GitHub every 2 minutes
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
                            sh 'npm ci'
                        }
                    }
                }
                stage('Client deps') {
                    steps {
                        dir('client') {
                            sh 'npm ci'
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
                            sh 'npm test -- --coverage'
                        }
                    }
                    post {
                        always {
                            junit 'server/coverage/junit.xml'
                        }
                    }
                }
                stage('Test Client') {
                    steps {
                        dir('client') {
                            sh 'npm test -- --watchAll=false --coverage'
                        }
                    }
                    post {
                        always {
                            junit 'client/coverage/junit.xml'
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        sonar-scanner \
                          -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                          -Dsonar.sources=server/src,client/src \
                          -Dsonar.javascript.lcov.reportPaths=server/coverage/lcov.info,client/coverage/lcov.info
                    '''
                }
            }
        }

        stage('Quality Gate — Strict_Production_Gate') {
            steps {
                // Wait up to 5 minutes for SonarQube to process results
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
                    git commit -m "ci: update image tags to ${IMAGE_TAG} [skip ci]"
                    git push origin main
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
