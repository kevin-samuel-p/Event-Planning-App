package com.eventplanning.backend.groupchat;

import jakarta.validation.constraints.NotNull;

public record CreateDirectMessageRequest(
        @NotNull Long member2Id
) {
}
