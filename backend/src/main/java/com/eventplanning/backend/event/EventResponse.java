package com.eventplanning.backend.event;

import java.time.LocalDate;

public record EventResponse(
        Long id,
        String eventName,
        LocalDate eventDate,
        String venue,
        String eventType,
        Long organizerId
) {
    public static EventResponse from(Event event) {
        return new EventResponse(
                event.getId(),
                event.getEventName(),
                event.getEventDate(),
                event.getVenue(),
                event.getEventType(),
                event.getOrganizer().getId()
        );
    }
}