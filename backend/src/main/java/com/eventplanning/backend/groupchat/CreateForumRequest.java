package com.eventplanning.backend.groupchat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateForumRequest(
        @NotBlank @Size(max = 100) String forumName,
        Long groupChatId
) {
}
