package com.eventplanning.backend.groupchat;

import java.time.Instant;

public record GcMessageResponse(
        Long id,
        Long forumId,
        Long memberId,
        String memberName,
        String message,
        Instant timestamp
) {
    
    public static GcMessageResponse from(GcMessage gcMessage) {
        return new GcMessageResponse(
                gcMessage.getId(),
                gcMessage.getForum().getId(),
                gcMessage.getMember().getId(),
                gcMessage.getMember().getUser().getName(),
                gcMessage.getMessage(),
                gcMessage.getTimestamp()
        );
    }
}
