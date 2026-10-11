package com.pulsepass.pulsepass.dto.request;

import com.pulsepass.pulsepass.domain.EventCategory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;

public record CreateEventRequest(
        @NotBlank(message = "Event code is required")
        String eventCode,

        @NotBlank(message = "Name is required")
        String name,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description,

        @NotNull(message = "Category is required")
        EventCategory category,

        @NotNull(message = "Event date is required")
        OffsetDateTime eventDate,

        @NotNull(message = "Minimum age is required")
        @Min(value = 0, message = "Minimum age must be greater than or equal to 0")
        Integer minimumAge,

        @NotBlank(message = "Venue code is required")
        String venueCode
) {}
