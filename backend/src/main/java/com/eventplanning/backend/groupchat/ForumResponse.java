package com.eventplanning.backend.groupchat;

import java.time.LocalDate;

public record ForumResponse(
        Long id,
        String forumName,
        Long createdByUserId,
        Long groupChatId,
        LocalDate createdAt
) {
    
    public static ForumResponse from(Forum forum) {
        return new ForumResponse(
                forum.getId(),
                forum.getForumName(),
                forum.getCreatedByUser().getId(),
                forum.getGroupChat().getId(),
                forum.getCreatedAt()
        );
    }
}
