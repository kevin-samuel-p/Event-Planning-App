package com.eventplanning.backend.groupchat;

import java.time.Instant;

public record DmMessageResponse(
        Long id,
        Long dmId,
        Long userId,
        String userName,
        String message,
        Instant timestamp
) {
    
    public static DmMessageResponse from(DmMessage dmMessage) {
        return new DmMessageResponse(
                dmMessage.getId(),
                dmMessage.getDirectMessage().getId(),
                dmMessage.getUser().getId(),
                dmMessage.getUser().getName(),
                dmMessage.getMessage(),
                dmMessage.getTimestamp()
        );
    }
}
