package com.eventplanning.backend.invitation;

import java.time.LocalDate;

public record InvitationResponse(
        Long id,
        Long eventId,
        Long guestId,
        RsvpStatus rsvpStatus,
        LocalDate invitationDate,
        String customMessage
) {
    public static InvitationResponse from(Invitation invitation) {
        return new InvitationResponse(
                invitation.getId(),
                invitation.getEvent().getId(),
                invitation.getGuest().getId(),
                invitation.getRsvpStatus(),
                invitation.getInvitationDate(),
                invitation.getCustomMessage()
        );
    }
}