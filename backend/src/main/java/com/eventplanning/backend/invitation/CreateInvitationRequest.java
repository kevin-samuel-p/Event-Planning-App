package com.eventplanning.backend.invitation;

import jakarta.validation.constraints.NotNull;

public record CreateInvitationRequest(
        @NotNull Long guestId,
        String customMessage
) {
}
