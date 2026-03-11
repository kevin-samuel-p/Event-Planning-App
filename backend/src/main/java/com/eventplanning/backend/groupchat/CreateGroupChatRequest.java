package com.eventplanning.backend.groupchat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateGroupChatRequest(
        @NotBlank @Size(max = 100) String gcName,
        Long eventId
) {
}
