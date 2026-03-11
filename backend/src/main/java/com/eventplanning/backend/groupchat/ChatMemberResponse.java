package com.eventplanning.backend.groupchat;

import java.time.LocalDate;
import java.util.List;

public record ChatMemberResponse(
        Long id,
        Long userId,
        String userName,
        Long groupChatId,
        LocalDate joinedAt,
        List<AttributeResponse> attributes
) {
    
    public static ChatMemberResponse from(ChatMember chatMember) {
        return new ChatMemberResponse(
                chatMember.getId(),
                chatMember.getUser().getId(),
                chatMember.getUser().getName(),
                chatMember.getGroupChat().getId(),
                chatMember.getJoinedAt(),
                null // Will be populated in service layer
        );
    }
}
