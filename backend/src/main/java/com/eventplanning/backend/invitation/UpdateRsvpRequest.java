package com.eventplanning.backend.invitation;

import jakarta.validation.constraints.NotNull;

public record UpdateRsvpRequest(@NotNull RsvpStatus rsvpStatus) {
}