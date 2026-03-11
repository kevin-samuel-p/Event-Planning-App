package com.eventplanning.backend.groupchat;

import java.time.LocalDate;

public record DirectMessageResponse(
        Long id,
        Long member1Id,
        Long member2Id,
        String member1Name,
        String member2Name,
        LocalDate createdAt
) {
    
    public static DirectMessageResponse from(DirectMessage directMessage) {
        return new DirectMessageResponse(
                directMessage.getId(),
                directMessage.getMember1().getId(),
                directMessage.getMember2().getId(),
                directMessage.getMember1().getUser().getName(),
                directMessage.getMember2().getUser().getName(),
                directMessage.getCreatedAt()
        );
    }
}
