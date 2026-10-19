# PulsePass — Fixtures de Datos para Pruebas E2E

Este directorio contiene las definiciones e instrucciones para preparar la base de datos de pruebas para la ejecución manual E2E (Fase 5).

---

## 1. Contenido de `seed-e2e.sql`

El script SQL [`seed-e2e.sql`](file:///tests/e2e/fixtures/seed-e2e.sql) inicializa los registros deterministas requeridos por la suite de pruebas:

### 1.1 Venues (Recintos)
* **`VEN-BOG-01`**: *Movistar Arena* (Bogotá) — Activo, capacidad 14,000. Utilizado para crear eventos y asociar compras.
* **`VEN-MED-01`**: *Teatro Metropolitano* (Medellín) — Activo, capacidad 1,600.
* **`VEN-INACTIVE-01`**: *Coliseo El Campin* (Bogotá) — Inactivo (`active = FALSE`). Utilizado para validar rechazo al intentar programar eventos en recintos inactivos.

### 1.2 Usuarios Preprovisionados con BCrypt
Dado que el endpoint público `POST /api/users` solo asigna rol `ROLE_USER`, las cuentas con privilegios se cargan directamente mediante este seed:

| Actor | Username | Email | Contraseña Plana | Hash BCrypt | Roles |
|---|---|---|---|---|---|
| **ADMIN** | `admin.e2e` | `admin.e2e@example.test` | `AdminPass123!` | `$2a$10$4kbZSK...` | `ROLE_ADMIN`, `ROLE_USER` |
| **STAFF** | `staff.e2e` | `staff.e2e@example.test` | `StaffPass123!` | `$2a$10$swGnr9...` | `ROLE_STAFF`, `ROLE_USER` |
| **INACTIVE** | `inactive.e2e` | `inactive.e2e@example.test` | `InactivePass123!` | `$2a$10$GFBEyg...` | `ROLE_USER` (`active=FALSE`) |

*(Nota: Los usuarios ordinarios de prueba `USER_A` y `USER_B` se crean dinámicamente mediante el endpoint de registro `POST /api/users` durante la prueba).*

### 1.3 Eventos Pre-cargados
* **`EVT-PUB-2026`**: Evento en estado `PUBLISHED` con fecha a +30 días y artista *Solar Beat* vinculado. Listo para pruebas inmediatas de compra y consulta pública.
* **`EVT-DFT-2026`**: Evento en estado `DRAFT` con fecha a +45 días. Permite comprobar que los usuarios anónimos o con rol `USER` reciben `403 Forbidden` al intentar consultarlo.
* **`EVT-PUB-READY`**: Evento en estado `DRAFT` con fecha a +60 días. Preparado para la prueba manual de publicación con `PATCH /api/events/EVT-PUB-READY/publish`.

---

## 2. Instrucciones de Carga

### Precondición obligatoria
La aplicación Spring Boot debe haber arrancado al menos una vez para que **Flyway** aplique las migraciones `V1`, `V2`, `V3` y `V4`.

### Ejecución con psql (Línea de comandos)
```powershell
psql -h localhost -p 5432 -U postgres -d pulsepass -f tests/e2e/fixtures/seed-e2e.sql
```

### Ejecución con pgAdmin o DBeaver
1. Conectarse a la base de datos `pulsepass`.
2. Abrir el Query Tool.
3. Copiar y pegar el contenido de `tests/e2e/fixtures/seed-e2e.sql`.
4. Ejecutar el script (F5).

---

## 3. Repetibilidad e Idempotencia

El script `seed-e2e.sql` utiliza cláusulas `ON CONFLICT (...) DO UPDATE` o `DO NOTHING`. Esto garantiza que puede ser re-ejecutado múltiples veces sin generar errores de clave primaria o índices duplicados.

Para reiniciar completamente el ambiente a un estado limpio:
```sql
TRUNCATE TABLE tickets, event_artists, events, user_profiles, user_credentials, user_roles, users, venues CASCADE;
```
Y luego volver a ejecutar `seed-e2e.sql`. (Los artistas iniciales se conservan ya que fueron insertados por Flyway en `V2`).
