package com.eventplanning.backend.groupchat;

import jakarta.validation.constraints.NotNull;

public record AssignAttributeRequest(
        @NotNull Long memberId,
        @NotNull Long attributeId
) {
}
