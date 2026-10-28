# Semgrep CE para el frontend

## Arquitectura elegida

- Analisis manual: contenedor `semgrep-front`, basado en la imagen oficial Semgrep 1.181.0 fijada por digest en `compose.semgrep.yml`.
- Jenkins: escaner instalado en un entorno Python aislado en `/opt/semgrep`; no necesita Docker CLI, socket Docker, cuenta ni token de Semgrep.
- No es un servidor web permanente: ejecuta el analisis y termina. No expone puertos y no tiene una URL local de dashboard. Un estado `Exited` al concluir es normal.
- Solo se modifica la integracion del frontend. El backend y su POM no cambian.

## Reglas y alcance

`ci/semgrep-scan.sh` analiza `src/main` con `p/java` y `p/javascript`. Abarca el codigo Java del cliente y su JavaScript propio. Las reglas se descargan del Registry; fijar la imagen no congela las reglas remotas.

`.semgrepignore` excluye artefactos generados y copias de Bootstrap, jQuery y Popper. No excluye los scripts propios del proyecto. La seguridad de bibliotecas de terceros requiere un analisis de dependencias separado; este escaneo no equivale a OWASP Dependency-Check ni a una prueba de navegador.

Se usa `--metrics off`, se desactiva la comprobacion de version y no se emplea `--autofix`. No se configura envio de hallazgos a Semgrep AppSec Platform.

## Analisis manual en Docker

Desde la raiz de `Ejercicio5Cliente`, con Docker Desktop iniciado y la red existente `admin-proyectos-ci`:

```powershell
New-Item -ItemType Directory -Path reportes/semgrep -Force | Out-Null
docker compose -f compose.semgrep.yml up --abort-on-container-exit --exit-code-from semgrep
```

Alternativamente, despues de crear el contenedor:

```powershell
docker start -a semgrep-front
docker inspect semgrep-front --format '{{.State.Status}} {{.State.ExitCode}}'
```

El contenedor monta el repositorio como solo lectura y escribe exclusivamente sus reportes en `reportes/semgrep/`. No se deben ejecutar dos analisis simultaneos sobre ese mismo contenedor y carpeta de salida. Los reportes contienen fragmentos de codigo y deben revisarse antes de compartirlos.

## Preparacion del Jenkins actual

La instalacion en este contenedor requiere Python 3 y venv; no instala paquetes Python en el interprete del sistema:

```powershell
docker exec -u root jenkins-lts apt-get update
docker exec -u root -e DEBIAN_FRONTEND=noninteractive jenkins-lts apt-get install -y --no-install-recommends python3 python3-venv
docker exec -u root jenkins-lts python3 -m venv /opt/semgrep
docker exec -u root jenkins-lts /opt/semgrep/bin/pip install --no-cache-dir semgrep==1.181.0 opentelemetry-instrumentation-requests==0.58b0 opentelemetry-instrumentation-threading==0.58b0
docker exec jenkins-lts /opt/semgrep/bin/semgrep --version
```

Son pasos de preparacion de la herramienta, no deben repetirse en cada build. La instalacion sobrevive a un reinicio del mismo contenedor, pero no a su eliminacion/recreacion. Para una imagen personalizada reproducible se incluye `infra/jenkins/Dockerfile.semgrep`; no se sustituye automaticamente el Jenkins existente ni se modifica el volumen `jenkins_home`.

Las dos dependencias OpenTelemetry se fijan a las versiones comprobadas en la imagen oficial de Semgrep 1.181.0 para evitar resolver combinaciones incompatibles. En esta preparacion se puede usar el wheel oficial descargado desde Windows y validado con el SHA-256 publicado por PyPI si la descarga directa desde el contenedor es lenta; no cambia la version instalada.

La ruta `/opt/semgrep/bin/semgrep` debe existir tambien en cualquier otro agente donde se ejecute este Jenkinsfile. Actualmente se usa el contenedor Linux revisado.

## Pipeline pegado en Jenkins

1. Versionar y subir `ci/semgrep-scan.sh`, `.semgrepignore`, `.gitattributes` y el resto de archivos de esta integracion al repositorio del frontend.
2. Copiar el `Jenkinsfile` actualizado completo a **Configurar → Pipeline → Definition: Pipeline script → Script** y guardar.
3. Ejecutar **Build Now**. No se configura una credencial `SEMGREP_APP_TOKEN` para esta modalidad.
4. Revisar la etapa **Semgrep - seguridad del frontend** y sus artefactos.

El orden es checkout → entorno → compilacion/pruebas/JaCoCo → Semgrep → cobertura/SonarQube/Quality Gate. La publicacion de Coverage, el analisis SonarQube y su Quality Gate estan agrupados en la ultima etapa, como en el esquema de clase.

## Reportes y resultados

| Uso | Carpeta |
|---|---|
| Contenedor manual | `reportes/semgrep/` en Windows |
| Jenkins | `target/semgrep/`, archivada como artefactos |

Se generan `semgrep.json`, `semgrep.sarif` y `semgrep.txt`. No se importan automaticamente en SonarQube ni se mezclan con el XML JaCoCo o los tests JUnit.

El primer analisis manual del 21/10/2026 completo 128 reglas sobre 12 archivos (7 Java y 5 JavaScript), sin errores ni hallazgos, con salida 0. Esto no demuestra ausencia de vulnerabilidades fuera de las reglas y archivos analizados. El archivo de texto puede estar vacio cuando no hay hallazgos; el resumen y los archivos analizados se consultan en JSON.

Tambien se verifico Semgrep 1.181.0 dentro de `jenkins-lts` con el usuario normal `jenkins` (UID 1000), sobre una copia temporal del frontend inicializada como repositorio Git. Completo las mismas 128 reglas y 12 archivos, sin errores ni hallazgos, con salida 0. `pip check` no encontro dependencias rotas. Los reportes de esa comprobacion estan en `reportes/semgrep/jenkins/`; no se ejecuto una tarea completa de Jenkins ni se afirma un Quality Gate aprobado. El siguiente paso es subir los archivos del frontend y pegar el pipeline actualizado en la tarea.

- Salida `0`: no se encontraron coincidencias con las reglas ejecutadas; no prueba ausencia total de vulnerabilidades.
- Salida `1`: hay hallazgos. La etapa Jenkins marca **UNSTABLE** y conserva los resultados; SonarQube continua para obtener ambos analisis. No se ocultan hallazgos ni se cambia su severidad.
- Otra salida: error tecnico/configuracion o advertencias estrictas; Jenkins detiene la ejecucion con error. Los reportes disponibles se archivan igualmente.

Los hallazgos requieren revision para distinguir vulnerabilidades reales de falsos positivos. Esta integracion no modifica automaticamente el codigo de negocio ni suprime reglas para forzar una aprobacion.

## Referencias

- [Semgrep en Jenkins y otros CI](https://docs.semgrep.dev/semgrep-ci/sample-ci-configs)
- [CLI y codigos de salida](https://docs.semgrep.dev/cli-reference)
- [Exclusiones por archivo](https://docs.semgrep.dev/ignoring-files-folders-code)
- [Imagen Docker oficial](https://docs.semgrep.dev/getting-started/quickstart)
