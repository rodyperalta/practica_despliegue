pipeline {
    agent any

    tools {
        nodejs "NodeJS" // Configura una instalación de Node.js en Jenkins
        dockerTool 'Dockertool'  // Cambia el nombre de la herramienta según tu configuración en Jenkins
    }

    stages {
         stage('Preparar Sistema') {
            steps {
        sh '''
            # Detectar el sistema operativo y instalar libatomic
            if command -v apk > /dev/null 2>&1; then
                echo "Sistema Alpine. Instalando libatomic..."
                apk add --no-cache libatomic
            elif command -v apt-get > /dev/null 2>&1; then
                echo "Sistema Debian/Ubuntu. Instalando libatomic1..."
                apt-get update && apt-get install -y libatomic1
            elif command -v yum > /dev/null 2>&1; then
                echo "Sistema RHEL/CentOS. Instalando libatomic..."
                yum install -y libatomic
            else
                echo "ERROR: No se pudo identificar el gestor de paquetes."
                exit 1
            fi
        '''
    }
        }
        
        stage('Instalar dependencias') {
            steps {
                sh 'npm install'
            }
        }

        stage('Ejecutar tests') {
            steps {
                sh 'chmod +x ./node_modules/.bin/jest'  // Soluciona el problema de permisos
                sh 'npm test -- --ci --runInBand'
                sh 'npm test'
            }
        }

        stage('Construir Imagen Docker') {
            when {
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                sh 'docker build -t hola-mundo-node:latest .'
            }
        }

        stage('Ejecutar Contenedor Node.js') {
            when {
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                sh '''
                    docker stop hola-mundo-node || true
                    docker rm hola-mundo-node || true
                    docker run -d --name hola-mundo-node -p 3000:3000 hola-mundo-node:latest
                '''
            }
        }
    }
}
