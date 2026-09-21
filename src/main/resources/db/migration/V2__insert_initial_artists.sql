-- ==========================================================
-- V2__insert_initial_artists.sql
-- Inserción del catálogo inicial de artistas de prueba
-- ==========================================================

INSERT INTO artists (stage_name, country, genre, active) VALUES
    ('Solar Beat', 'Colombia', 'ELECTRONIC', TRUE),
    ('Neon Waves', 'Mexico', 'SYNTHWAVE', TRUE),
    ('Caribbean Sound', 'Colombia', 'REGGAE', TRUE),
    ('Ocean Drive', 'United States', 'INDIE_ROCK', TRUE),
    ('Digital Pulse', 'Germany', 'TECHNO', TRUE);
