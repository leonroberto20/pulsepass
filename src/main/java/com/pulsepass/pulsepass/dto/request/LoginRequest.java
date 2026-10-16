package com.pulsepass.pulsepass.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Identifier (username or email) is required")
        String identifier,

        @NotBlank(message = "Password is required")
        String password
) {}
