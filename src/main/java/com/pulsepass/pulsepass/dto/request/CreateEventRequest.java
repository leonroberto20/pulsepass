package com.pulsepass.pulsepass.dto.request;

import com.pulsepass.pulsepass.domain.EventCategory;

import java.time.OffsetDateTime;

public record CreateEventRequest(
        String eventCode,
        String name,
        String description,
        EventCategory category,
        OffsetDateTime eventDate,
        Integer minimumAge,
        String venueCode
) {}
