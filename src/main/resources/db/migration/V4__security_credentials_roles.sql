-- ==========================================================
-- V4__security_credentials_roles.sql
-- Creación de tablas de seguridad: user_credentials y user_roles
-- ==========================================================

-- 1. Tabla de Credenciales de Usuario (Relación 1:1 con users)
CREATE TABLE user_credentials (
    user_id BIGINT PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_credentials_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 2. Tabla de Roles de Usuario (Relación 1:N con users)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_user_roles_role CHECK (role IN ('ROLE_USER', 'ROLE_STAFF', 'ROLE_ADMIN'))
);

-- ==========================================================
-- Índices para optimizar consultas de seguridad
-- ==========================================================
CREATE INDEX idx_user_roles_user_id ON user_roles (user_id);
