package com.pulsepass.pulsepass.dto.response;

import com.pulsepass.pulsepass.domain.TicketStatus;
import com.pulsepass.pulsepass.domain.TicketType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record TicketResponse(
        Long id,
        String ticketCode,
        TicketType type,
        BigDecimal price,
        TicketStatus status,
        OffsetDateTime purchaseDate,
        String userEmail,
        String eventCode,
        String eventName
) {}
