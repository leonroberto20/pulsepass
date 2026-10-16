package com.pulsepass.pulsepass.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.Base64;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    // 32 bytes of secure random bytes encoded in Base64 (256 bits for HMAC-SHA256)
    private static final String VALID_SECRET_BASE64 = Base64.getEncoder().encodeToString(
            "pulsepass-secure-test-secret-key-32b!".getBytes()
    );

    private JwtProperties properties;
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        properties = new JwtProperties();
        properties.setIssuer("pulsepass-api-test");
        properties.setSecretBase64(VALID_SECRET_BASE64);
        properties.setAccessTokenTtl(Duration.ofMinutes(15));

        jwtService = new JwtService(properties);
        jwtService.init();
    }

    @Test
    @DisplayName("Debe generar y validar un token JWT correctamente con los claims estándar requeridos")
    void shouldGenerateAndValidateTokenSuccessfully() {
        Long userId = 42L;

        String token = jwtService.generateToken(userId);

        assertThat(token).isNotBlank();
        assertThat(jwtService.isTokenValid(token)).isTrue();
        assertThat(jwtService.isTokenValid(token, userId)).isTrue();
        assertThat(jwtService.isTokenValid(token, 999L)).isFalse();
        assertThat(jwtService.extractUserId(token)).isEqualTo(userId);

        Claims claims = jwtService.extractAllClaims(token);
        assertThat(claims.getSubject()).isEqualTo("42");
        assertThat(claims.getIssuer()).isEqualTo("pulsepass-api-test");
        assertThat(claims.getId()).isNotBlank();
        assertThat(claims.getIssuedAt()).isNotNull();
        assertThat(claims.getExpiration()).isNotNull();
    }

    @Test
    @DisplayName("Debe incluir y recuperar claims personalizados adicionales")
    void shouldIncludeAndExtractCustomClaims() {
        Long userId = 10L;
        Map<String, Object> extra = Map.of("email", "andrea@test.com", "role", "ROLE_USER");

        String token = jwtService.generateToken(userId, extra);

        Claims claims = jwtService.extractAllClaims(token);
        assertThat(claims.get("email", String.class)).isEqualTo("andrea@test.com");
        assertThat(claims.get("role", String.class)).isEqualTo("ROLE_USER");
    }

    @Test
    @DisplayName("Debe rechazar un token alterado o con firma manipulada (SEC-008)")
    void shouldRejectTokenWithTamperedSignature() {
        String token = jwtService.generateToken(1L);
        // Alter last character of the signature
        char lastChar = token.charAt(token.length() - 1);
        char alteredChar = (lastChar == 'a') ? 'b' : 'a';
        String tamperedToken = token.substring(0, token.length() - 1) + alteredChar;

        assertThat(jwtService.isTokenValid(tamperedToken)).isFalse();
        assertThatThrownBy(() -> jwtService.extractAllClaims(tamperedToken))
                .isInstanceOf(JwtException.class);
    }

    @Test
    @DisplayName("Debe rechazar un token expirado")
    void shouldRejectExpiredToken() {
        // Set negative TTL to simulate immediate expiration
        properties.setAccessTokenTtl(Duration.ofSeconds(-10));
        JwtService expiredJwtService = new JwtService(properties);
        expiredJwtService.init();

        String expiredToken = expiredJwtService.generateToken(1L);

        assertThat(jwtService.isTokenValid(expiredToken)).isFalse();
        assertThatThrownBy(() -> jwtService.extractAllClaims(expiredToken))
                .isInstanceOf(JwtException.class);
    }

    @Test
    @DisplayName("Debe fallar al iniciar si la clave secreta está ausente o en blanco (SEC-004)")
    void shouldFailInitWhenSecretIsBlankOrMissing() {
        JwtProperties emptyProps = new JwtProperties();
        emptyProps.setSecretBase64("   ");
        JwtService service = new JwtService(emptyProps);

        assertThatThrownBy(service::init)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("PULSEPASS_JWT_SECRET_BASE64");
    }

    @Test
    @DisplayName("Debe fallar al iniciar si la clave secreta tiene menos de 256 bits (32 bytes)")
    void shouldFailInitWhenSecretIsTooShort() {
        JwtProperties shortKeyProps = new JwtProperties();
        // 16 bytes encoded in Base64 (only 128 bits, insufficient for HS256)
        shortKeyProps.setSecretBase64(Base64.getEncoder().encodeToString("short-16-bytes!".getBytes()));
        JwtService service = new JwtService(shortKeyProps);

        assertThatThrownBy(service::init)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 256 bits");
    }
}
