package com.eventplanning.backend.event;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateEventRequest(
        @NotBlank String eventName,
        @NotNull @FutureOrPresent LocalDate eventDate,
        @NotBlank String venue,
        @NotBlank String eventType
) {
}