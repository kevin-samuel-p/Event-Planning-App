package com.eventplanning.backend.groupchat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record JoinGroupChatRequest(
        @NotBlank @Size(max = 10) String joinCode
) {
}
