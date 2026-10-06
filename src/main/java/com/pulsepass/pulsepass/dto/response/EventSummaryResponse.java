package com.pulsepass.pulsepass.dto.response;

import com.pulsepass.pulsepass.domain.EventCategory;
import com.pulsepass.pulsepass.domain.EventStatus;

import java.time.OffsetDateTime;

public record EventSummaryResponse(
        Long id,
        String eventCode,
        String name,
        EventCategory category,
        EventStatus status,
        OffsetDateTime eventDate,
        String venueName
) {}
