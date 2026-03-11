package com.eventplanning.backend.groupchat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SendDmMessageRequest(
        @NotNull Long dmId,
        @NotBlank String message
) {
}
