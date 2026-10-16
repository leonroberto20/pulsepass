package com.pulsepass.pulsepass.dto.response;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresInSeconds,
        AuthenticatedUserResponse user
) {
    public AuthResponse(String accessToken, long expiresInSeconds, AuthenticatedUserResponse user) {
        this(accessToken, "Bearer", expiresInSeconds, user);
    }
}
