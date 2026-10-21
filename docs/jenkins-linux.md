# Jenkins y SonarQube en Docker — Frontend

## Estado y requisitos

El `Jenkinsfile` ejecuta en Linux: checkout, comprobación de herramientas, `clean verify`, publicación JUnit/JaCoCo, análisis SonarQube y validación del Quality Gate.

El análisis es obligatorio en cada build. Ya no existe el parámetro `EJECUTAR_SONAR`. Para ejecutar el pipeline primero se deben registrar el servidor, el token y el webhook indicados abajo.

El 21/10/2026 se verificó:

- Contenedor `jenkins-lts`: imagen `jenkins/jenkins:lts-jdk21`, Linux, Java/javac 21.0.12.1.
- Contenedor existente `sonarqube`: servidor 26.10.0.133078, estado UP, puerto 9000.
- Se creó la red `admin-proyectos-ci` y se conectaron ambos contenedores conservando sus conexiones previas.
- Jenkins pudo consultar `http://sonarqube:9000/api/system/status`.
- Desde SonarQube, el endpoint `http://jenkins-lts:8080/sonarqube-webhook/` respondió HTTP 405 a GET: está accesible y espera POST.
- Los plugins SonarQube y Coverage están instalados.
- La configuración de instalaciones SonarQube de Jenkins todavía estaba vacía. Las operaciones de administración por HTTP requieren autenticación; sus credenciales no se extrajeron ni se guardaron en el repositorio.

## 1. Herramientas de Jenkins

En **Administrar Jenkins → Tools**:

| Tipo | Nombre exacto | Configuración |
|---|---|---|
| JDK | `JDK21` | JAVA_HOME `/opt/java/openjdk`, instalación automática desactivada |
| Maven | `Maven3` | Instalación automática desde Apache, versión 3.9.16 |

Si el trabajo se ejecuta en otro agente, configura en ese nodo un JDK 21 válido. Maven3 pertenece a **Instalaciones de Maven**, no a JDK.

Se necesitan Pipeline, Git, JUnit, Coverage, SonarQube Scanner for Jenkins y soporte de herramientas Maven. El agente necesita acceso a GitHub, Maven Central y al servidor SonarQube.

## 2. Proyectos de SonarQube

Abre `http://localhost:9000` en el navegador e inicia sesión. Si es la primera entrada, completa el cambio de contraseña solicitado por SonarQube.

Crea manualmente los dos proyectos:

| Proyecto | Project key |
|---|---|
| Admin Proyectos Back | `admin-proyectos-back` |
| Admin Proyectos Front | `admin-proyectos-front` |

Este repositorio utiliza la clave `admin-proyectos-front` en su Jenkinsfile. Conserva el Quality Gate que quieras aplicar y configura la definición de código nuevo en el asistente del proyecto.

## 3. Token y credencial

En SonarQube, **My Account → Security → Generate Tokens**:

- Nombre sugerido: `jenkins-admin-proyectos`.
- Tipo: **Global Analysis Token**, con una cuenta que tenga permiso de análisis global.
- Selecciona una caducidad adecuada.
- Copia el token cuando se muestra; no lo agregues a Git, a capturas públicas ni al Jenkinsfile.

En Jenkins, **Administrar Jenkins → Credentials → System → Global credentials → Add Credentials**:

| Campo | Valor |
|---|---|
| Kind | Secret text |
| Secret | El token generado en SonarQube |
| ID | `sonarqube-token` |
| Description | Análisis SonarQube de Admin Proyectos |

El ID debe coincidir exactamente con el Jenkinsfile. La cuenta/token debe poder analizar ambos proyectos.

## 4. Registrar el servidor en Jenkins

En **Administrar Jenkins → Sistema → SonarQube servers**:

1. Habilita las variables de entorno de SonarQube si la pantalla muestra esa opción.
2. Añade una instalación:

| Campo | Valor |
|---|---|
| Name | `SonarQube` |
| Server URL | `http://sonarqube:9000` |
| Server authentication token | Credencial `sonarqube-token` |

3. Guarda la configuración.

No se necesita instalar el scanner CLI en Tools: el proyecto utiliza el plugin Maven `sonar-maven-plugin:5.5.0.6356`.

## 5. Webhook para el Quality Gate

En SonarQube, **Administration → Configuration → Webhooks → Create**:

| Campo | Valor |
|---|---|
| Name | `Jenkins` |
| URL | `http://jenkins-lts:8080/sonarqube-webhook/` |

Conserva la barra final. Un webhook global sirve para ambos proyectos.

El paso `waitForQualityGate()` espera hasta 10 minutos. Si el estado recibido no es `OK`, el pipeline falla e informa el estado. Si vence el tiempo, revisa la última entrega del webhook y la comunicación entre contenedores.

Que el análisis se envíe correctamente no garantiza que el código apruebe el Quality Gate. No se han bajado umbrales ni ocultado hallazgos para forzar una aprobación.

## 6. Trabajo Pipeline

1. Sube `Jenkinsfile` y el código actualizado a este repositorio.
2. Crea una tarea de tipo **Pipeline**.
3. Selecciona **Pipeline script from SCM → Git**.
4. Indica la URL de este repositorio y las credenciales Git si requiere autenticación.
5. Rama `*/main`; Script Path `Jenkinsfile`.
6. Guarda y ejecuta **Build Now**.

Al usar un repositorio por componente, el POM queda en la raíz del workspace. No uses `dir('Ejercicio5Cliente')`.

Las pruebas del backend usan H2 en memoria: el build no necesita MariaDB ni sus credenciales. Un despliegue o una prueba posterior sobre MariaDB sí requiere una conexión configurada.

## Direcciones

| Uso | Dirección |
|---|---|
| Navegador → Jenkins | `http://localhost:8080` |
| Navegador → SonarQube | `http://localhost:9000` |
| Jenkins → SonarQube | `http://sonarqube:9000` |
| SonarQube → Jenkins | `http://jenkins-lts:8080/sonarqube-webhook/` |

`localhost` dentro de un contenedor apunta al propio contenedor. Si se recrea Jenkins o SonarQube, conecta el nuevo contenedor a `admin-proyectos-ci`; reiniciar los contenedores existentes conserva sus conexiones.

Para inspeccionar la red desde PowerShell:

```powershell
docker network inspect admin-proyectos-ci
docker exec jenkins-lts curl --fail --silent http://sonarqube:9000/api/system/status
```

## Alcance

Las comprobaciones de conectividad y los archivos se prepararon localmente. La primera ejecución autenticada del análisis y del pipeline depende de completar los pasos de token/servidor/webhook en las sesiones de administración.

JaCoCo mide el Java ejecutado por las pruebas; no mide automáticamente el JavaScript del navegador. OWASP Dependency-Check no se ejecuta en este Jenkinsfile.

## Referencias oficiales

- [Herramientas y etapas de Pipeline](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Coverage](https://www.jenkins.io/doc/pipeline/steps/coverage/)
- [Configurar SonarQube en Jenkins](https://docs.sonarsource.com/sonarqube-server/analyzing-source-code/ci-integration/jenkins-integration/global-setup)
- [Webhook y Quality Gate](https://docs.sonarsource.com/sonarqube-server/analyzing-source-code/ci-integration/jenkins-integration/pipeline-pause)
