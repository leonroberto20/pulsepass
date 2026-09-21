-- ==========================================================
-- V3__add_streaming_url_to_event.sql
-- Evolución del esquema: Agrega soporte para eventos híbridos
-- ==========================================================

ALTER TABLE events
ADD COLUMN streaming_url VARCHAR(500);
