// Ejecutar en un agente Linux con las herramientas JDK21 y Maven3 de Jenkins.
pipeline {
    agent any

    tools {
        jdk 'JDK21'
        maven 'Maven3'
    }

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Obtener codigo') {
            steps {
                checkout scm
            }
        }

        stage('Verificar entorno') {
            steps {
                script {
                    if (!isUnix()) {
                        error('Este Jenkinsfile requiere un agente Linux.')
                    }
                }

                sh '''
                    set -eu
                    test -x "$JAVA_HOME/bin/javac"
                    java -version
                    javac -version
                    mvn -version
                '''
            }
        }

        stage('Compilar y probar') {
            steps {
                // Las pruebas son autocontenidas; el backend utiliza H2 en memoria.
                sh 'mvn -B -ntp clean verify'
            }
        }

        stage('Publicar cobertura y artefactos') {
            steps {
                recordCoverage(
                        failOnError: true,
                        tools: [[
                            parser: 'JACOCO',
                            pattern: 'target/site/jacoco/jacoco.xml'
                        ]]
                )

                archiveArtifacts(
                        artifacts: 'target/*.jar,target/site/jacoco/**',
                        fingerprint: true,
                        allowEmptyArchive: false
                )
            }
        }

        stage('Analizar con SonarQube') {
            steps {
                withSonarQubeEnv(
                        installationName: 'SonarQube',
                        credentialsId: 'sonarqube-token'
                ) {
                    sh '''
                        set +x
                        set -eu
                        export SONAR_TOKEN="$SONAR_AUTH_TOKEN"
                        mvn -B -ntp org.sonarsource.scanner.maven:sonar-maven-plugin:5.5.0.6356:sonar -Dsonar.projectKey=admin-proyectos-front
                    '''
                }
            }
        }

        stage('Comprobar Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    script {
                        def qualityGate = waitForQualityGate()
                        if (qualityGate.status != 'OK') {
                            error("SonarQube no aprobo el Quality Gate: ${qualityGate.status}")
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            // También publica las pruebas fallidas cuando Maven devuelve un error.
            // Si falló el checkout o la compilación, todavía puede no existir XML.
            junit(
                    testResults: 'target/surefire-reports/TEST-*.xml',
                    allowEmptyResults: true
            )
        }
    }
}
