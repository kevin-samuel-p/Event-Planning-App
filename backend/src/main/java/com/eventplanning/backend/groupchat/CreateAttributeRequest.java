package com.eventplanning.backend.groupchat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateAttributeRequest(
        @NotBlank @Size(max = 100) String attributeName,
        @NotBlank String permissionsConfig,
        Long groupChatId
) {
}
