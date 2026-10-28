# Actualización del frontend a Java 21 y Spring Boot 4.1.1

Fecha de verificación: 21 de octubre de 2026.

## Evidencias de los POM

- `pom-antes.xml`: copia conservada del POM original (Spring Boot 3.2.5 y Java 17), correspondiente al commit inicial `d9bd576`. No representa el HEAD actual, que ya incluye la actualización.
- `pom-previo-springboot4.xml`: cambios manuales de Java 21 y plugins previos a la migración de Spring Boot.
- `pom-despues.xml`: copia del POM final, equivalente a `../../pom.xml`.

## Cambios aplicados

| Elemento | Antes | Después / motivo |
|---|---|---|
| Spring Boot | 3.2.5 | 4.1.1, versión estable verificada en Spring y Maven Central |
| Java objetivo | 17 | 21 y `maven.compiler.release=21` |
| Maven Wrapper | 3.9.6 en el commit original | 3.9.16, cambio manual conservado |
| Starter MVC | `spring-boot-starter-web` | `spring-boot-starter-webmvc` |
| Cliente HTTP | Incluido en el conjunto anterior | `spring-boot-starter-restclient`, necesario para el soporte modular de `RestTemplate` |
| Pruebas | Starter genérico | `spring-boot-starter-webmvc-test` |
| Plugins | Configuración heredada | Compiler 3.13.0, Surefire 3.5.2, JaCoCo 0.8.12 y SonarScanner 5.5.0.6356 |

Se mantuvieron Thymeleaf, Bootstrap, las rutas y los formularios existentes. No se agregaron credenciales ni se cambió la dirección de la API (`localhost:8081`).

## Verificación realizada

- Primera construcción: `mvnw.cmd clean verify`; tras añadir regresiones de vistas se ejecutó `mvnw.cmd verify`.
- Resultado final: **5 pruebas, 0 fallos, 0 errores, 0 omitidas**.
- Se generaron el JAR ejecutable, Surefire y reportes JaCoCo HTML/XML.
- Bytecode major version 65 confirmado (Java 21).
- El JAR arrancó en el puerto 8080.
- `/`, `/login`, `/register` e `/inicio` respondieron HTTP 200.
- `/consultarProyectos` recuperó la respuesta de la API Spring Boot 4.1.1 mediante `RestTemplate`; sus identificadores coincidieron con los recibidos directamente desde el backend.
- Las nuevas pruebas MockMvc verifican renderizado Thymeleaf y objetos de formulario de registro/proyectos.

El análisis SonarQube y su Quality Gate ya están definidos en el `Jenkinsfile` para Linux. Los archivos POM/Jenkinsfile se comprobaron en GitHub, rama `main`, el 21/10/2026. No se dispone de evidencia de un build completo autenticado en Jenkins ni de aprobación del Quality Gate; estos resultados no se dan por obtenidos. La cobertura JaCoCo corresponde al código Java ejecutado; no mide automáticamente el JavaScript de la interfaz. Consulta [la guía actualizada de Jenkins](../jenkins-linux.md).

Repositorio: https://github.com/RamirezLuisManuel/Admin-Proyectos-Front

## Reproducción en PowerShell

Desde la raíz del repositorio:

```powershell
java -version
.\mvnw.cmd -version
.\mvnw.cmd clean verify
.\mvnw.cmd spring-boot:run
```

La API debe estar en `localhost:8081` para utilizar las operaciones de datos. El frontend usa 8080; si Jenkins ya ocupa ese puerto, inicia el frontend con:

```powershell
.\mvnw.cmd spring-boot:run '-Dspring-boot.run.arguments=--server.port=8082'
```

## Fuentes oficiales

- [Requisitos de Spring Boot 4.1.1](https://docs.spring.io/spring-boot/system-requirements.html)
- [Migración y modularización de starters](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide)
