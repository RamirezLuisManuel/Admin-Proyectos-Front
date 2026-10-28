# Jenkins y SonarQube en Docker — Frontend

## Estado y requisitos

El `Jenkinsfile` ejecuta en Linux: checkout, comprobación de herramientas, `clean verify`, publicación JUnit/JaCoCo, análisis SonarQube y validación del Quality Gate.

El análisis es obligatorio en cada build. Ya no existe el parámetro `EJECUTAR_SONAR`. Para ejecutar el pipeline primero se deben registrar el servidor, el token y el webhook indicados abajo.

El frontend incorpora una etapa Semgrep CE antes del analisis SonarQube. Requiere `/opt/semgrep/bin/semgrep` (1.181.0) en el agente; la preparacion, el contenedor manual y los reportes se explican en [semgrep.md](semgrep.md). Semgrep se ejecuta sin cuenta ni token y no requiere acceso al motor Docker desde Jenkins. Coverage, SonarQube y Quality Gate quedan agrupados en la ultima etapa.

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
| Secret | Vacío en esta configuración inicial; no es el token de análisis |

Conserva la barra final. Un webhook global sirve para ambos proyectos.

`jenkins-lts:8080` identifica el receptor dentro de Docker. La ruta `/sonarqube-webhook/` la expone el plugin de Jenkins: SonarQube envía ahí el resultado del análisis y Jenkins reanuda la comprobación del Quality Gate. No es una ruta de la API del proyecto ni requiere crear un controlador.

Si aparece `Invalid URL ... site-local ... are not allowed for webhooks`, la validación de destinos internos está bloqueando el registro. En este laboratorio aislado, entra en **Administration → Configuration → General Settings → Security**, busca **Enable local webhooks validation** (`sonar.validateWebhooks`), cambia a `false`, guarda y vuelve a crear el webhook. Es una indicación de configuración, no una afirmación de que ya esté aplicada. Desactivarla reduce la protección contra destinos internos/SSRF; no usarla como configuración general de un servidor público.

El secreto HMAC es opcional y diferente de `sonarqube-token`. Para habilitarlo posteriormente sin cambiar el Jenkinsfile, guarda un valor aleatorio como **Secret text** en Jenkins y selecciónalo en **SonarQube servers → Advanced → Webhook Secret**; configura el mismo valor en el campo Secret de SonarQube. Nunca publiques el valor en Git.

El paso `waitForQualityGate()` espera hasta 10 minutos. Si el estado recibido no es `OK`, el pipeline falla e informa el estado. Si vence el tiempo, revisa la última entrega del webhook y la comunicación entre contenedores.

Que el análisis se envíe correctamente no garantiza que el código apruebe el Quality Gate. No se han bajado umbrales ni ocultado hallazgos para forzar una aprobación.

## 6. Trabajo Pipeline con el script pegado en Jenkins

1. Crea una tarea de tipo **Pipeline**, o entra en **Configurar** en la tarea existente.
2. En el apartado **Pipeline → Definition**, selecciona **Pipeline script**; no **Pipeline script from SCM**.
3. Abre el `Jenkinsfile` de este repositorio y copia todo, desde los comentarios iniciales hasta la última llave de `pipeline { ... }`.
4. Pega ese contenido en el campo **Script** y conserva **Use Groovy Sandbox** activado.
5. Guarda con **Save** y ejecuta **Build Now / Construir ahora**.
6. Abre **Console Output** para comprobar checkout, Java/Maven, pruebas, cobertura y Quality Gate.

La etapa **Obtener codigo** utiliza `git branch: 'main', url: 'https://github.com/RamirezLuisManuel/Admin-Proyectos-Front.git'`. El checkout es explícito porque `checkout scm` depende del contexto SCM que no se configura en esta modalidad. No hay campo **Script Path** que completar.

El repositorio se comprobó como público el 21/10/2026; su descarga HTTPS no requiere credencial Git. `sonarqube-token` sigue siendo necesario para el análisis y no se utiliza para descargar el código. Si el repositorio se vuelve privado, registra una credencial Git HTTPS apropiada y añade su ID al paso `git`.

El `Jenkinsfile` puede conservarse y versionarse como copia del pipeline, pero Jenkins ejecuta el texto guardado en **Script**. Subir cambios a ese archivo no actualiza automáticamente el script de la tarea: debes volver a pegar su contenido cuando modifiques el pipeline. El código de la aplicación sí se obtiene de `main` en cada build.

Al usar un repositorio por componente, el POM queda en la raíz del workspace. No uses `dir('Ejercicio5Cliente')`.

La etapa **Ubicar POM y compilar** utiliza `dir('.')`, muestra la carpeta actual con `pwd`, comprueba `pom.xml` y ejecuta `mvn -B -ntp clean verify` dentro del mismo bloque. El punto corresponde a la raíz del checkout, no a `src` ni a una ruta de Windows. Un `sh 'cd ...'` en otra etapa no cambia permanentemente la carpeta de los pasos siguientes.

Las pruebas del backend usan H2 en memoria: el build no necesita MariaDB ni sus credenciales. Un despliegue o una prueba posterior sobre MariaDB sí requiere una conexión configurada.

## 7. Ejecución del frontend y conexión con la API

El pipeline compila y analiza; no despliega ni inicia permanentemente el frontend. Este componente es una aplicación Java con Spring MVC/Thymeleaf y consume la API mediante HTTP en `localhost:8081`. No se conecta directamente a MariaDB ni requiere `DB_USERNAME` o `DB_PASSWORD`.

Jenkins ya utiliza el puerto 8080 de Windows. Para iniciar el frontend manualmente sin conflicto, desde la raíz del repositorio:

```powershell
.\mvnw.cmd spring-boot:run '-Dspring-boot.run.arguments=--server.port=8082'
```

Abre `http://localhost:8082` y ejecuta la API en 8081 para las operaciones de datos. Las pruebas Maven actuales del frontend no necesitan la API en ejecución. Antes de contenerizar el frontend será necesario externalizar la URL de la API, actualmente fija en el controlador; Dockerizar Jenkins no equivale a Dockerizar la aplicación.

## Repositorios y correspondencia de proyectos

- Backend: https://github.com/RamirezLuisManuel/Admin-Proyectos-Back — `sonar.projectKey=admin-proyectos-back`.
- Frontend: https://github.com/RamirezLuisManuel/Admin-Proyectos-Front — `sonar.projectKey=admin-proyectos-front`.

`installationName: 'SonarQube'` selecciona el servidor; `credentialsId: 'sonarqube-token'` selecciona la credencial; `-Dsonar.projectKey` selecciona el proyecto destino. Compartir webhook no mezcla los análisis.

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
- [Validación de destinos internos: explicación del equipo de SonarSource](https://community.sonarsource.com/t/validating-webhooks-breaks-our-ci/189245)
