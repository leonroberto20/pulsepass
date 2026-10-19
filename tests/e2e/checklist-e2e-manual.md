# Checklist de Ejecución Manual E2E — PulsePass

Este checklist detalla los pasos cronológicos que el operador de pruebas debe ejecutar manualmente contra la API REST en ejecución local, utilizando Postman (Desktop o extensión en VS Code).

---

## 0. Fase Previa: Preparación del Entorno
- [x] Base de datos PostgreSQL iniciada y escuchando en el puerto 5432.
- [x] Base de datos `pulsepass` creada.
- [x] Aplicación Spring Boot iniciada (`mvnw spring-boot:run`) con migraciones Flyway V1 a V4 aplicadas exitosamente.
- [x] Script de fixtures [`seed-e2e.sql`](file:///tests/e2e/fixtures/seed-e2e.sql) ejecutado en la base de datos `pulsepass`.
- [x] Colección `PulsePass - E2E Manual` y entorno `PulsePass Local` importados en Postman.
- [x] Entorno `PulsePass Local` seleccionado como activo en Postman.
- [x] Ejecutar `TC-CONN-01` (`GET /api/venues/active`) y confirmar respuesta `200 OK`.

---

## 1. Flujo A — Catálogo Público y Descubrimiento (Sin Autenticación)
- [x] **TC-VEN-01**: Ejecutar `GET /api/venues/active` $\rightarrow$ Verificar array con recintos activos (`VEN-BOG-01`, `VEN-MED-01`).
- [x] **TC-VEN-02**: Ejecutar `GET /api/venues/{{venueActiveCode}}` $\rightarrow$ Verificar detalle de `VEN-BOG-01` con `active=true`.
- [x] **TC-VEN-03**: Ejecutar `GET /api/venues/VEN-INEXISTENTE-99` $\rightarrow$ Verificar `404 Not Found` y `ErrorResponse`.
- [x] **TC-ART-01**: Ejecutar `GET /api/artists/active` $\rightarrow$ Verificar array con artistas activos de la migración V2.
- [x] **TC-ART-02**: Ejecutar `GET /api/artists/{{artistId}}` $\rightarrow$ Verificar detalle de artista con ID 1 (*Solar Beat*).
- [x] **TC-ART-03**: Ejecutar `GET /api/artists/by-stage-name?stageName=Solar Beat` $\rightarrow$ Verificar coincidencia de nombre artístico.
- [x] **TC-ART-04**: Ejecutar `GET /api/artists/999999` $\rightarrow$ Verificar `404 Not Found`.

---

## 2. Flujo B — Registro, Autenticación y Matriz de Identidades
- [x] **TC-AUTH-001**: Ejecutar `POST /api/users` (Registro USER_A) $\rightarrow$ Verificar `201 Created` y DTO `UserResponse` sin contraseña (ID: 4).
- [x] **TC-AUTH-001b**: Ejecutar `POST /api/users` (Registro USER_B) $\rightarrow$ Verificar `201 Created` para usuario de contraste IDOR (ID: 5).
- [x] **TC-AUTH-002**: Ejecutar `POST /api/auth/login` con `userAUsername` $\rightarrow$ Verificar `200 OK`, `tokenType=Bearer`, `expiresInSeconds=900`.
  - **Acción Manual:** Copiar el `accessToken` al valor de `userAToken` en el entorno.
- [x] **TC-AUTH-003**: Ejecutar `POST /api/auth/login` con `userAEmail` $\rightarrow$ Verificar `200 OK` demostrando soporte dual (username/email).
- [x] **TC-AUTH-002b**: Ejecutar `POST /api/auth/login` con `userBUsername` $\rightarrow$ Verificar `200 OK`.
  - **Acción Manual:** Copiar el `accessToken` al valor de `userBToken` en el entorno.
- [x] **TC-AUTH-002c**: Ejecutar `POST /api/auth/login` con `staffIdentifier` (`staff.e2e`) $\rightarrow$ Verificar `200 OK`.
  - **Acción Manual:** Copiar el `accessToken` al valor de `staffToken` en el entorno.
- [x] **TC-AUTH-002d**: Ejecutar `POST /api/auth/login` con `adminIdentifier` (`admin.e2e`) $\rightarrow$ Verificar `200 OK`.
  - **Acción Manual:** Copiar el `accessToken` al valor de `adminToken` en el entorno.
- [x] **TC-AUTH-006**: Ejecutar `GET /api/auth/me` con `userAToken` $\rightarrow$ Verificar `200 OK` y roles: `[ROLE_USER]`.
- [x] **TC-AUTH-006b**: Ejecutar `GET /api/auth/me` con `staffToken` $\rightarrow$ Verificar `200 OK` y roles: `[ROLE_STAFF, ROLE_USER]`.
- [x] **TC-AUTH-006c**: Ejecutar `GET /api/auth/me` con `adminToken` $\rightarrow$ Verificar `200 OK` y roles: `[ROLE_ADMIN, ROLE_USER]`.

---

## 3. Flujo C — Administración de Eventos (ADMIN) y Control de Visibilidad
- [x] **TC-EVT-01**: Ejecutar `POST /api/events` con `adminToken` $\rightarrow$ Crear evento `{{newEventCode}}`. Verificar `201 Created` y `status=DRAFT`.
- [x] **TC-EVT-02**: Ejecutar `GET /api/events/{{newEventCode}}` con `adminToken` $\rightarrow$ Verificar `200 OK` (ADMIN puede ver borrador).
- [x] **TC-EVT-03**: Ejecutar `GET /api/events/published` sin token $\rightarrow$ Verificar que el evento recién creado en borrador **NO** aparece en el catálogo público.
- [x] **TC-EVT-04**: Ejecutar `PATCH /api/events/{{eventToPublishCode}}/publish` con `adminToken` $\rightarrow$ Verificar `200 OK` y cambio a `status=PUBLISHED`.
- [x] **TC-EVT-05**: Ejecutar `POST /api/events/{{newEventCode}}/artists/{{artistId}}` con `adminToken` $\rightarrow$ Verificar `200 OK` y presencia del artista en la respuesta.
- [x] **TC-EVT-06**: Ejecutar `GET /api/events/by-artist?stageName=Solar Beat` sin token $\rightarrow$ Verificar `200 OK`.
- [x] **TC-EVT-07**: Ejecutar `GET /api/events/{{publishedEventCode}}` sin token $\rightarrow$ Verificar `200 OK` al consultar evento publicado.

---

## 4. Flujo D — Compra, Ciclo de Vida y Transiciones de Tickets
- [x] **TC-TKT-01**: Ejecutar `POST /api/tickets` con `userAToken` para comprar Ticket 1 (`GENERAL`) $\rightarrow$ Verificar `201 Created` y `status=PAID`.
  - **Acción Manual:** Copiar el `ticketCode` generado a la variable `ticketCancelableCode` en el entorno.
- [x] **TC-TKT-01b**: Ejecutar `POST /api/tickets` con `userAToken` para comprar Ticket 2 (`VIP`) $\rightarrow$ Verificar `201 Created` y `status=PAID`.
  - **Acción Manual:** Copiar el `ticketCode` generado a la variable `ticketUsableCode` en el entorno.
- [x] **TC-TKT-02**: Ejecutar `GET /api/tickets/{{ticketCancelableCode}}` con `userAToken` $\rightarrow$ Verificar `200 OK` y `status=PAID`.
- [x] **TC-TKT-03**: Ejecutar `GET /api/tickets/by-user?email={{userAEmail}}` con `userAToken` $\rightarrow$ Verificar `200 OK` y lista de tickets.
- [x] **TC-TKT-04**: Ejecutar `GET /api/events/{{publishedEventCode}}/tickets/paid` con `staffToken` $\rightarrow$ Verificar `200 OK`.
- [x] **TC-TKT-05**: Ejecutar `PATCH /api/tickets/{{ticketCancelableCode}}/cancel` con `userAToken` $\rightarrow$ Verificar `200 OK` y cambio a `status=CANCELLED`.
- [x] **TC-TKT-06**: Ejecutar `PATCH /api/tickets/{{ticketUsableCode}}/use` con `staffToken` $\rightarrow$ Verificar `200 OK` y cambio a `status=USED`.

---

## 5. Flujo E — Pruebas Negativas y Códigos de Error HTTP

### 5.1 Control de Acceso y Autorización RBAC (403 Forbidden)
- [x] **TC-SEC-001**: `POST /api/events` con `userAToken` $\rightarrow$ Verificar `403 Forbidden`.
- [x] **TC-SEC-002**: `PATCH /api/events/{{draftEventCode}}/publish` con `userAToken` $\rightarrow$ Verificar `403 Forbidden`.
- [x] **TC-SEC-002b**: `PATCH /api/events/{{draftEventCode}}/publish` con `staffToken` $\rightarrow$ Verificar `403 Forbidden` (sólo ADMIN puede publicar).
- [x] **TC-SEC-003**: `POST /api/events/{{draftEventCode}}/artists/{{artistId}}` con `userAToken` $\rightarrow$ Verificar `403 Forbidden`.
- [x] **TC-SEC-004**: `GET /api/events/{{draftEventCode}}` sin token $\rightarrow$ Verificar `403 Forbidden`.
- [x] **TC-SEC-004b**: `GET /api/events/{{draftEventCode}}` con `userAToken` $\rightarrow$ Verificar `403 Forbidden`.
- [x] **TC-SEC-008**: `POST /api/tickets` con `userAToken` usando email de USER_B $\rightarrow$ Verificar `403 Forbidden` (anti-suplantación).
- [x] **TC-SEC-009**: `GET /api/tickets/{{ticketCancelableCode}}` con `userBToken` $\rightarrow$ Verificar `403 Forbidden` (anti-IDOR lectura individual).
- [x] **TC-SEC-010**: `GET /api/tickets/by-user?email={{userAEmail}}` con `userBToken` $\rightarrow$ Verificar `403 Forbidden` (anti-IDOR listado).
- [x] **TC-SEC-011**: `PATCH /api/tickets/{{ticketCancelableCode}}/cancel` con `userBToken` $\rightarrow$ Verificar `403 Forbidden` (anti-IDOR cancelación).
- [x] **TC-SEC-012**: `PATCH /api/tickets/{{ticketUsableCode}}/use` con `userAToken` $\rightarrow$ Verificar `403 Forbidden` (sólo STAFF/ADMIN).
- [x] **TC-SEC-013**: `GET /api/events/{{publishedEventCode}}/tickets/paid` con `userAToken` $\rightarrow$ Verificar `403 Forbidden`.

### 5.2 Errores de Autenticación (401 Unauthorized)
- [x] **TC-AUTH-004**: `POST /api/auth/login` con credenciales incorrectas $\rightarrow$ Verificar `401 Unauthorized`.
- [x] **TC-AUTH-005**: `POST /api/auth/login` con usuario inexistente $\rightarrow$ Verificar `401 Unauthorized`.
- [x] **TC-AUTH-007**: `GET /api/auth/me` sin cabecera `Authorization` $\rightarrow$ Verificar `401 Unauthorized`.
- [x] **TC-AUTH-008**: `GET /api/auth/me` con cabecera `Bearer tokenInvalido12345` $\rightarrow$ Verificar `401 Unauthorized`.
- [x] **TC-AUTH-009**: `GET /api/auth/me` con firma manipulada $\rightarrow$ Verificar `401 Unauthorized`.
- [x] **TC-AUTH-013**: `POST /api/auth/login` con usuario inactivo (`inactive.e2e`) $\rightarrow$ Verificar `401 Unauthorized`.

### 5.3 Validaciones y Manejo de Errores REST (400, 404, 409)
- [x] **TC-HTTP-400-01**: `POST /api/users` con datos inválidos $\rightarrow$ Verificar `400 Bad Request` y mapa de errores en `details`.
- [x] **TC-HTTP-400-02**: `POST /api/events` con campos obligatorios vacíos $\rightarrow$ Verificar `400 Bad Request`.
- [x] **TC-HTTP-404-01**: `GET /api/events/EVT-TOTALMENTE-INEXISTENTE` $\rightarrow$ Verificar `404 Not Found`.
- [x] **TC-HTTP-404-02**: `GET /api/tickets/TKT-TOTALMENTE-INEXISTENTE` con `adminToken` $\rightarrow$ Verificar `404 Not Found`.
- [x] **TC-HTTP-409-01**: `POST /api/users` con username o email duplicado $\rightarrow$ Verificar `409 Conflict`.
- [x] **TC-HTTP-409-02**: `PATCH /api/tickets/{{ticketCancelableCode}}/cancel` sobre ticket ya cancelado $\rightarrow$ Verificar `409 Conflict`.
- [x] **TC-HTTP-409-03**: `PATCH /api/tickets/{{ticketUsableCode}}/use` sobre ticket ya usado $\rightarrow$ Verificar `409 Conflict`.
