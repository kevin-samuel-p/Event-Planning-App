package com.eventplanning.backend.groupchat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SendGcMessageRequest(
        @NotNull Long forumId,
        @NotBlank String message
) {
}
