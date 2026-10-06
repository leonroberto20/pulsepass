package com.pulsepass.pulsepass.dto.request;

import com.pulsepass.pulsepass.domain.TicketType;

public record PurchaseTicketRequest(
        String userEmail,
        String eventCode,
        TicketType type
) {}
