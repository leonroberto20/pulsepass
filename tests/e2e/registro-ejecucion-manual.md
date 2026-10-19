# Registro de Ejecución Manual E2E — PulsePass

## 1. Metadatos de la Ejecución

| Parámetro | Detalle de la Corrida |
|---|---|
| **Fecha de Ejecución:** | 2026-10-18 |
| **Evaluador / Tester:** | Roberto (Operador QA) |
| **Versión del Backend:** | PulsePass 0.0.1-SNAPSHOT (Spring Boot 4.1.1, Java 21) |
| **Ambiente de Pruebas:** | Local (`http://localhost:8080`) |
| **Motor de Base de Datos:** | PostgreSQL 18 en `localhost:5432/pulsepass` |
| **Herramienta Cliente:** | Postman Desktop (Scratch Pad) / Runner E2E Local |
| **Colección Ejecutada:** | `PulsePass - E2E Manual` (v2.1) |
| **Entorno Utilizado:** | `PulsePass - Local (E2E Manual)` (`runId: run01`) |

---

## 2. Bitácora de Casos de Prueba

| ID Caso | Método | Ruta / Endpoint | Actor / Auth | HTTP Esp. | HTTP Obs. | Estado | Observaciones y Validación Visual |
|---|---|---|---|:---:|:---:|:---:|---|
| **TC-CONN-01** | GET | `/api/venues/active` | Anónimo | 200 | 200 | **PASS** | Conectividad inicial verificada. Retorna 2 venues activos (VEN-BOG-01 y VEN-MED-01). |
| **TC-VEN-01** | GET | `/api/venues/active` | Anónimo | 200 | 200 | **PASS** | Lista de VenueResponse con `active=true` validada correctamente. |
| **TC-VEN-02** | GET | `/api/venues/{{venueActiveCode}}` | Anónimo | 200 | 200 | **PASS** | Detalle de recinto individual coincide con código `VEN-BOG-01` (Movistar Arena). |
| **TC-VEN-03** | GET | `/api/venues/VEN-INEXISTENTE-99` | Anónimo | 404 | 404 | **PASS** | ErrorResponse estructurado recibido con status 404 y error 'Not Found'. |
| **TC-ART-01** | GET | `/api/artists/active` | Anónimo | 200 | 200 | **PASS** | Lista de artistas activos de la migración V2 retornada exitosamente. |
| **TC-ART-02** | GET | `/api/artists/{{artistId}}` | Anónimo | 200 | 200 | **PASS** | Artista por ID (1 - Solar Beat) obtenido con estructura ArtistResponse. |
| **TC-ART-03** | GET | `/api/artists/by-stage-name?stageName=...` | Anónimo | 200 | 200 | **PASS** | Búsqueda exacta por stageName ('Solar Beat') retornó coincidencia exacta. |
| **TC-ART-04** | GET | `/api/artists/999999` | Anónimo | 404 | 404 | **PASS** | Artista inexistente retorna 404 Not Found con ErrorResponse. |
| **TC-AUTH-001** | POST | `/api/users` | Anónimo | 201 | 201 | **PASS** | Registro de USER_A exitoso. Generó ID=4. DTO UserResponse no expone password. |
| **TC-AUTH-001b** | POST | `/api/users` | Anónimo | 201 | 201 | **PASS** | Registro de USER_B exitoso. Generó ID=5 para pruebas anti-IDOR. No expone password. |
| **TC-AUTH-002** | POST | `/api/auth/login` | Anónimo | 200 | 200 | **PASS** | Login USER_A con username exitoso. Token JWT Bearer obtenido y asignado a userAToken. |
| **TC-AUTH-003** | POST | `/api/auth/login` | Anónimo | 200 | 200 | **PASS** | Login USER_A con email exitoso. Soporte de login dual validado. |
| **TC-AUTH-002b** | POST | `/api/auth/login` | Anónimo | 200 | 200 | **PASS** | Login USER_B exitoso. Token JWT Bearer obtenido y asignado a userBToken. |
| **TC-AUTH-002c** | POST | `/api/auth/login` | Anónimo | 200 | 200 | **PASS** | Login STAFF (`staff.e2e`) exitoso. Token JWT Bearer obtenido y asignado a staffToken. |
| **TC-AUTH-002d** | POST | `/api/auth/login` | Anónimo | 200 | 200 | **PASS** | Login ADMIN (`admin.e2e`) exitoso. Token JWT Bearer obtenido y asignado a adminToken. |
| **TC-AUTH-006** | GET | `/api/auth/me` | USER_A | 200 | 200 | **PASS** | AuthenticatedUserResponse con rol `ROLE_USER`. Subclaim coincide con usera_run01. |
| **TC-AUTH-006b** | GET | `/api/auth/me` | STAFF | 200 | 200 | **PASS** | AuthenticatedUserResponse con roles `ROLE_STAFF`, `ROLE_USER`. |
| **TC-AUTH-006c** | GET | `/api/auth/me` | ADMIN | 200 | 200 | **PASS** | AuthenticatedUserResponse con roles `ROLE_ADMIN`, `ROLE_USER`. |
| **TC-USR-01** | GET | `/api/users/by-email?email=...` | USER_A | 200 | 200 | **PASS** | Propietario consulta sus propios datos por email exitosamente. |
| **TC-USR-02** | GET | `/api/users/by-username?username=...` | USER_A | 200 | 200 | **PASS** | Propietario consulta sus datos por username exitosamente. |
| **TC-USR-03** | GET | `/api/users/by-email?email=...` | ADMIN | 200 | 200 | **PASS** | ADMIN consulta cualquier usuario legítimamente. |
| **TC-USR-04** | GET | `/api/users/by-email?email=...` | USER_B | 403 | 403 | **PASS** | Anti-IDOR: USER_B rechazado con 403 Forbidden al consultar email de USER_A. |
| **TC-USR-05** | GET | `/api/users/by-username?username=...` | USER_B | 403 | 403 | **PASS** | Anti-IDOR: USER_B rechazado con 403 Forbidden al consultar username ajeno. |
| **TC-EVT-01** | POST | `/api/events` | ADMIN | 201 | 201 | **PASS** | ADMIN crea nuevo evento con status=DRAFT y código `EVT-NEW-RUN01`. |
| **TC-EVT-02** | GET | `/api/events/{{newEventCode}}` | ADMIN | 200 | 200 | **PASS** | ADMIN consulta evento recién creado en borrador exitosamente. |
| **TC-EVT-03** | GET | `/api/events/published` | Anónimo | 200 | 200 | **PASS** | Catálogo público no lista eventos en borrador (`EVT-NEW-RUN01` no figura). |
| **TC-EVT-04** | PATCH | `/api/events/{{eventToPublishCode}}/publish`| ADMIN | 200 | 200 | **PASS** | ADMIN publica evento; pasa de DRAFT a PUBLISHED (`EVT-PUB-READY`). |
| **TC-EVT-05** | POST | `/api/events/.../artists/{{artistId}}` | ADMIN | 200 | 200 | **PASS** | ADMIN asocia artista al evento exitosamente (`artists.length=1`). |
| **TC-EVT-06** | GET | `/api/events/by-artist?stageName=...` | Anónimo | 200 | 200 | **PASS** | Catálogo público de eventos asociados a 'Solar Beat' retorna los eventos vinculados. |
| **TC-EVT-07** | GET | `/api/events/{{publishedEventCode}}` | Anónimo | 200 | 200 | **PASS** | Detalle público de evento publicado (`EVT-PUB-2026`) consultado con éxito. |
| **TC-TKT-01** | POST | `/api/tickets` | USER_A | 201 | 201 | **PASS** | Compra Ticket 1 (GENERAL). Código generado asignado a `ticketCancelableCode`. Status=PAID. |
| **TC-TKT-01b** | POST | `/api/tickets` | USER_A | 201 | 201 | **PASS** | Compra Ticket 2 (VIP). Código generado asignado a `ticketUsableCode`. Status=PAID. |
| **TC-TKT-02** | GET | `/api/tickets/{{ticketCancelableCode}}` | USER_A | 200 | 200 | **PASS** | Propietario consulta su ticket por código con respuesta 200 OK. |
| **TC-TKT-03** | GET | `/api/tickets/by-user?email=...` | USER_A | 200 | 200 | **PASS** | Propietario lista todas sus entradas adquiridas (retorna 2 entradas). |
| **TC-TKT-04** | GET | `/api/events/.../tickets/paid` | STAFF | 200 | 200 | **PASS** | STAFF consulta entradas pagadas para control de acceso exitosamente. |
| **TC-TKT-05** | PATCH | `/api/tickets/.../cancel` | USER_A | 200 | 200 | **PASS** | Propietario cancela su ticket cancelable; cambia a status CANCELLED. |
| **TC-TKT-06** | PATCH | `/api/tickets/.../use` | STAFF | 200 | 200 | **PASS** | STAFF redime ticket usable; cambia a status USED. |
| **TC-SEC-001** | POST | `/api/events` | USER_A | 403 | 403 | **PASS** | Rol USER denegado con 403 Forbidden al intentar crear eventos. |
| **TC-SEC-002** | PATCH | `/api/events/.../publish` | USER_A | 403 | 403 | **PASS** | Rol USER denegado con 403 Forbidden al intentar publicar eventos. |
| **TC-SEC-002b** | PATCH | `/api/events/.../publish` | STAFF | 403 | 403 | **PASS** | Rol STAFF denegado con 403 Forbidden al intentar publicar eventos (solo ADMIN). |
| **TC-SEC-003** | POST | `/api/events/.../artists/...` | USER_A | 403 | 403 | **PASS** | Rol USER denegado con 403 Forbidden al intentar asociar artistas. |
| **TC-SEC-004** | GET | `/api/events/{{draftEventCode}}` | Anónimo | 403 | 403 | **PASS** | Anónimo denegado con 403 Forbidden al intentar acceder a borrador. |
| **TC-SEC-004b** | GET | `/api/events/{{draftEventCode}}` | USER_A | 403 | 403 | **PASS** | Rol USER denegado con 403 Forbidden al intentar acceder a borrador. |
| **TC-SEC-008** | POST | `/api/tickets` | USER_A | 403 | 403 | **PASS** | Anti-suplantación: USER_A no puede comprar para USER_B (403 Forbidden). |
| **TC-SEC-009** | GET | `/api/tickets/{{ticketCancelableCode}}` | USER_B | 403 | 403 | **PASS** | Anti-IDOR: USER_B denegado con 403 Forbidden al consultar ticket ajeno. |
| **TC-SEC-010** | GET | `/api/tickets/by-user?email=...` | USER_B | 403 | 403 | **PASS** | Anti-IDOR: USER_B denegado con 403 Forbidden al listar tickets ajenos. |
| **TC-SEC-011** | PATCH | `/api/tickets/.../cancel` | USER_B | 403 | 403 | **PASS** | Anti-IDOR: USER_B denegado con 403 Forbidden al intentar cancelar ticket de USER_A. |
| **TC-SEC-012** | PATCH | `/api/tickets/.../use` | USER_A | 403 | 403 | **PASS** | Rol USER denegado con 403 Forbidden al intentar redimir tickets (solo STAFF/ADMIN). |
| **TC-SEC-013** | GET | `/api/events/.../tickets/paid` | USER_A | 403 | 403 | **PASS** | USER denegado con 403 Forbidden al intentar consultar tickets pagados operativos. |
| **TC-AUTH-004** | POST | `/api/auth/login` | Anónimo | 401 | 401 | **PASS** | Login con contraseña incorrecta retorna 401 Unauthorized sin fuga de info. |
| **TC-AUTH-005** | POST | `/api/auth/login` | Anónimo | 401 | 401 | **PASS** | Login con usuario inexistente retorna 401 Unauthorized genérico. |
| **TC-AUTH-007** | GET | `/api/auth/me` | Sin Auth | 401 | 401 | **PASS** | Petición sin header Authorization rechazada con 401 Unauthorized. |
| **TC-AUTH-008** | GET | `/api/auth/me` | Bearer malo | 401 | 401 | **PASS** | Cabecera Bearer con token inventado/malformado rechazada con 401 Unauthorized. |
| **TC-AUTH-009** | GET | `/api/auth/me` | Firma rota | 401 | 401 | **PASS** | JWT con firma manipulada rechazada con 401 Unauthorized. |
| **TC-AUTH-013** | POST | `/api/auth/login` | Inactivo | 401 | 401 | **PASS** | Rechazo de login para usuario inactivo (`active=false`) con 401 Unauthorized. |
| **TC-HTTP-400-01**| POST | `/api/users` | Anónimo | 400 | 400 | **PASS** | Email inválido y contraseña menor a 12 caracteres produce 400 Bad Request. |
| **TC-HTTP-400-02**| POST | `/api/events` | ADMIN | 400 | 400 | **PASS** | Campos obligatorios vacíos en creación de evento produce 400 Bad Request. |
| **TC-HTTP-404-01**| GET | `/api/events/EVT-INEXISTENTE` | Anónimo | 404 | 404 | **PASS** | Evento inexistente produce 404 Not Found con ErrorResponse estructurado. |
| **TC-HTTP-404-02**| GET | `/api/tickets/TKT-INEXISTENTE` | ADMIN | 404 | 404 | **PASS** | Ticket inexistente consultado por ADMIN produce 404 Not Found. |
| **TC-HTTP-409-01**| POST | `/api/users` | Anónimo | 409 | 409 | **PASS** | Registro duplicado de usuario (email/username ya existe) retorna 409 Conflict. |
| **TC-HTTP-409-02**| PATCH | `/api/tickets/.../cancel` | USER_A | 409 | 409 | **PASS** | Reintento de cancelación de ticket ya cancelado retorna 409 Conflict. |
| **TC-HTTP-409-03**| PATCH | `/api/tickets/.../use` | STAFF | 409 | 409 | **PASS** | Reintento de redención de ticket ya usado retorna 409 Conflict. |

---

## 3. Resumen Consolidado de la Ejecución

| Métrica | Cantidad | Porcentaje |
|---|:---:|:---:|
| **Total de Casos Evaluados:** | 52 | 100% |
| **Exitosos (PASS):** | 52 | 100% |
| **Fallidos (FAIL):** | 0 | 0% |
| **Bloqueados (BLOCKED):** | 0 | 0% |
| **Pendientes (NOT RUN):** | 0 | 0% |

---

## 4. Registro de Incidencias y Desviaciones (Defectos Encontrados)

| # | ID Caso | Comportamiento Observado vs Esperado | Severidad | Causa Raíz / Acción Tomada |
|---|---|---|:---:|---|
| - | - | Ninguna discrepancia o defecto encontrado durante toda la ejecución. | - | Comportamiento esperado 100% conforme a las especificaciones. |

---

## 5. Conclusión y Veredicto Final

* **Estado General:** FINALIZADO CON ÉXITO (52/52 completados - 100% PASS)
* **Veredicto:** APROBADO (PASS)
* **Firma del Evaluador:** Roberto (Operador QA)
