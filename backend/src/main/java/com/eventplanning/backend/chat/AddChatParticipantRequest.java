package com.eventplanning.backend.chat;

import jakarta.validation.constraints.NotNull;

public record AddChatParticipantRequest(@NotNull Long userId) {
}