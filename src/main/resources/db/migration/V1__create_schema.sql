-- ==========================================================
-- V1__create_schema.sql
-- Creación del esquema inicial de base de datos para PulsePass
-- ==========================================================

-- 1. Tabla de Venues
CREATE TABLE venues (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_venues_code UNIQUE (code),
    CONSTRAINT chk_venues_capacity CHECK (capacity > 0)
);

-- 2. Tabla de Eventos (Nota: streaming_url se agregará en V3 para demostrar la evolución del esquema)
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    event_code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    minimum_age INTEGER NOT NULL DEFAULT 0,
    venue_id BIGINT NOT NULL,
    CONSTRAINT uk_events_event_code UNIQUE (event_code),
    CONSTRAINT fk_events_venue FOREIGN KEY (venue_id) REFERENCES venues (id),
    CONSTRAINT chk_events_minimum_age CHECK (minimum_age >= 0),
    CONSTRAINT chk_events_category CHECK (
        category IN ('MUSIC', 'SPORTS', 'TECHNOLOGY', 'EDUCATION', 'CULTURE', 'ENTERTAINMENT')
    ),
    CONSTRAINT chk_events_status CHECK (
        status IN ('DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED', 'FINISHED')
    )
);

-- 3. Tabla de Artistas
CREATE TABLE artists (
    id BIGSERIAL PRIMARY KEY,
    stage_name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    genre VARCHAR(50) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_artists_stage_name UNIQUE (stage_name)
);

-- 4. Tabla asociativa Evento <-> Artista (Relación N:M)
CREATE TABLE event_artists (
    event_id BIGINT NOT NULL,
    artist_id BIGINT NOT NULL,
    CONSTRAINT pk_event_artists PRIMARY KEY (event_id, artist_id),
    CONSTRAINT fk_event_artists_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    CONSTRAINT fk_event_artists_artist FOREIGN KEY (artist_id) REFERENCES artists (id) ON DELETE CASCADE
);

-- 5. Tabla de Usuarios
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email)
);

-- 6. Tabla de Perfiles de Usuario (Relación 1:1 con User)
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    city VARCHAR(100),
    birth_date DATE,
    user_id BIGINT NOT NULL,
    CONSTRAINT uk_user_profiles_user_id UNIQUE (user_id),
    CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 7. Tabla de Tickets (Entidad de dominio con precio y trazabilidad)
CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_code VARCHAR(50) NOT NULL,
    type VARCHAR(30) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    CONSTRAINT uk_tickets_ticket_code UNIQUE (ticket_code),
    CONSTRAINT fk_tickets_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_tickets_event FOREIGN KEY (event_id) REFERENCES events (id),
    CONSTRAINT chk_tickets_price CHECK (price >= 0),
    CONSTRAINT chk_tickets_type CHECK (
        type IN ('GENERAL', 'VIP', 'BACKSTAGE', 'STUDENT')
    ),
    CONSTRAINT chk_tickets_status CHECK (
        status IN ('RESERVED', 'PAID', 'CANCELLED', 'USED')
    )
);

-- ==========================================================
-- Índices para optimizar claves foráneas y consultas frecuentes
-- ==========================================================
CREATE INDEX idx_events_venue_id ON events (venue_id);
CREATE INDEX idx_events_status_date ON events (status, event_date);
CREATE INDEX idx_event_artists_artist_id ON event_artists (artist_id);
CREATE INDEX idx_tickets_user_id ON tickets (user_id);
CREATE INDEX idx_tickets_event_id ON tickets (event_id);
CREATE INDEX idx_tickets_event_status ON tickets (event_id, status);
