package com.pulsepass.pulsepass.dto.request;

import com.pulsepass.pulsepass.domain.TicketType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PurchaseTicketRequest(
        @NotBlank(message = "User email is required")
        @Email(message = "Invalid email format")
        String userEmail,

        @NotBlank(message = "Event code is required")
        String eventCode,

        @NotNull(message = "Ticket type is required")
        TicketType type
) {}
