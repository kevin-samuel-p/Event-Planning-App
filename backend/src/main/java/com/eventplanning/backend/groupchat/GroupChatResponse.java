package com.eventplanning.backend.groupchat;

import java.time.LocalDate;

public record GroupChatResponse(
        Long id,
        String gcName,
        String joinCode,
        Long createdByUserId,
        Long eventId,
        LocalDate createdAt
) {
    
    public static GroupChatResponse from(GroupChat groupChat) {
        return new GroupChatResponse(
                groupChat.getId(),
                groupChat.getGcName(),
                groupChat.getJoinCode(),
                groupChat.getCreatedByUser().getId(),
                groupChat.getEvent().getId(),
                groupChat.getCreatedAt()
        );
    }
}
