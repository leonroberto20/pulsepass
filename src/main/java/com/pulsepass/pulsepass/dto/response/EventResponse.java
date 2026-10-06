package com.pulsepass.pulsepass.dto.response;

import com.pulsepass.pulsepass.domain.EventCategory;
import com.pulsepass.pulsepass.domain.EventStatus;

import java.time.OffsetDateTime;
import java.util.Set;

public record EventResponse(
        Long id,
        String eventCode,
        String name,
        String description,
        EventCategory category,
        EventStatus status,
        OffsetDateTime eventDate,
        Integer minimumAge,
        String streamingUrl,
        String venueCode,
        String venueName,
        Set<ArtistResponse> artists
) {}
