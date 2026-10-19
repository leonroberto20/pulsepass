-- ============================================================================
-- PulsePass - Fixtures E2E (seed-e2e.sql)
-- Propósito: Provisionar datos deterministas para las pruebas manuales E2E
-- Ejecutar EXCLUSIVAMENTE en base de datos de pruebas (pulsepass_e2e o pulsepass local)
-- ============================================================================

-- 1. Venues de prueba
INSERT INTO venues (code, name, city, address, capacity, active)
VALUES 
    ('VEN-BOG-01', 'Movistar Arena', 'Bogota', 'Diagonal 61C # 26-36', 14000, TRUE),
    ('VEN-MED-01', 'Teatro Metropolitano', 'Medellin', 'Calle 41 # 57-30', 1600, TRUE),
    ('VEN-INACTIVE-01', 'Coliseo El Campin', 'Bogota', 'Carrera 30 # 63-50', 5000, FALSE)
ON CONFLICT (code) DO UPDATE 
SET active = EXCLUDED.active, 
    capacity = EXCLUDED.capacity, 
    name = EXCLUDED.name, 
    city = EXCLUDED.city, 
    address = EXCLUDED.address;

-- 2. Usuarios Privilegiados y de Prueba
-- Credenciales conocidas de prueba (contraseñas con BCrypt):
-- admin.e2e: AdminPass123!
-- staff.e2e: StaffPass123!
-- inactive.e2e: InactivePass123!

-- 2.1 Usuario Administrador (admin.e2e)
INSERT INTO users (username, email, active)
VALUES ('admin.e2e', 'admin.e2e@example.test', TRUE)
ON CONFLICT (username) DO UPDATE SET active = TRUE, email = EXCLUDED.email;

INSERT INTO user_profiles (first_name, last_name, phone, city, birth_date, user_id)
SELECT 'Admin', 'E2E', '+573001112233', 'Bogota', '1990-01-01', u.id
FROM users u WHERE u.username = 'admin.e2e'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_credentials (user_id, password_hash, password_changed_at)
SELECT u.id, '$2a$10$4kbZSKBBG.K/AXFjq6qKKuNVnaM4vlvXwL2JT7IG0y90kFMSPbyc.', CURRENT_TIMESTAMP
FROM users u WHERE u.username = 'admin.e2e'
ON CONFLICT (user_id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO user_roles (user_id, role)
SELECT u.id, 'ROLE_ADMIN' FROM users u WHERE u.username = 'admin.e2e'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT u.id, 'ROLE_USER' FROM users u WHERE u.username = 'admin.e2e'
ON CONFLICT (user_id, role) DO NOTHING;

-- 2.2 Usuario Staff (staff.e2e)
INSERT INTO users (username, email, active)
VALUES ('staff.e2e', 'staff.e2e@example.test', TRUE)
ON CONFLICT (username) DO UPDATE SET active = TRUE, email = EXCLUDED.email;

INSERT INTO user_profiles (first_name, last_name, phone, city, birth_date, user_id)
SELECT 'Staff', 'E2E', '+573002223344', 'Bogota', '1992-06-15', u.id
FROM users u WHERE u.username = 'staff.e2e'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_credentials (user_id, password_hash, password_changed_at)
SELECT u.id, '$2a$10$swGnr9e8esyf5fFEiRS6WeIrHiLWT2Rn.WsLCImU2FSDJYmuLNkXi', CURRENT_TIMESTAMP
FROM users u WHERE u.username = 'staff.e2e'
ON CONFLICT (user_id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO user_roles (user_id, role)
SELECT u.id, 'ROLE_STAFF' FROM users u WHERE u.username = 'staff.e2e'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT u.id, 'ROLE_USER' FROM users u WHERE u.username = 'staff.e2e'
ON CONFLICT (user_id, role) DO NOTHING;

-- 2.3 Usuario Inactivo (inactive.e2e)
INSERT INTO users (username, email, active)
VALUES ('inactive.e2e', 'inactive.e2e@example.test', FALSE)
ON CONFLICT (username) DO UPDATE SET active = FALSE, email = EXCLUDED.email;

INSERT INTO user_profiles (first_name, last_name, phone, city, birth_date, user_id)
SELECT 'Inactivo', 'E2E', '+573003334455', 'Medellin', '1995-10-20', u.id
FROM users u WHERE u.username = 'inactive.e2e'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_credentials (user_id, password_hash, password_changed_at)
SELECT u.id, '$2a$10$GFBEygX/875qtfpTWiySGu43ncBWcHvie4ZTF5TYE.oqxFlrqVPlu', CURRENT_TIMESTAMP
FROM users u WHERE u.username = 'inactive.e2e'
ON CONFLICT (user_id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO user_roles (user_id, role)
SELECT u.id, 'ROLE_USER' FROM users u WHERE u.username = 'inactive.e2e'
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Eventos Fixture Deterministas
-- 3.1 Evento publicado con artista asociado para pruebas inmediatas de compra y visibilidad pública
INSERT INTO events (event_code, name, description, category, status, event_date, minimum_age, venue_id)
SELECT 'EVT-PUB-2026', 'PulseFest 2026', 'Festival principal de prueba E2E', 'MUSIC', 'PUBLISHED', 
       CURRENT_TIMESTAMP + INTERVAL '30 days', 18, v.id
FROM venues v WHERE v.code = 'VEN-BOG-01'
ON CONFLICT (event_code) DO UPDATE 
SET status = 'PUBLISHED', minimum_age = 18, event_date = CURRENT_TIMESTAMP + INTERVAL '30 days';

INSERT INTO event_artists (event_id, artist_id)
SELECT e.id, a.id 
FROM events e, artists a 
WHERE e.event_code = 'EVT-PUB-2026' AND a.stage_name = 'Solar Beat'
ON CONFLICT (event_id, artist_id) DO NOTHING;

-- 3.2 Evento en borrador (DRAFT) para validar que anónimos y USER no puedan verlo
INSERT INTO events (event_code, name, description, category, status, event_date, minimum_age, venue_id)
SELECT 'EVT-DFT-2026', 'Secret Session 2026', 'Sesion privada en borrador para pruebas de seguridad', 'MUSIC', 'DRAFT', 
       CURRENT_TIMESTAMP + INTERVAL '45 days', 0, v.id
FROM venues v WHERE v.code = 'VEN-BOG-01'
ON CONFLICT (event_code) DO UPDATE 
SET status = 'DRAFT', minimum_age = 0, event_date = CURRENT_TIMESTAMP + INTERVAL '45 days';

INSERT INTO event_artists (event_id, artist_id)
SELECT e.id, a.id 
FROM events e, artists a 
WHERE e.event_code = 'EVT-DFT-2026' AND a.stage_name = 'Neon Waves'
ON CONFLICT (event_id, artist_id) DO NOTHING;

-- 3.3 Evento preparado para ser publicado vía PATCH /publish
INSERT INTO events (event_code, name, description, category, status, event_date, minimum_age, venue_id)
SELECT 'EVT-PUB-READY', 'Tech Summit 2026', 'Evento en borrador listo para probar endpoint de publicacion', 'TECHNOLOGY', 'DRAFT', 
       CURRENT_TIMESTAMP + INTERVAL '60 days', 12, v.id
FROM venues v WHERE v.code = 'VEN-MED-01'
ON CONFLICT (event_code) DO UPDATE 
SET status = 'DRAFT', minimum_age = 12, event_date = CURRENT_TIMESTAMP + INTERVAL '60 days';
