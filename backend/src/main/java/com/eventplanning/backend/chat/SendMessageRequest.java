package com.eventplanning.backend.chat;

import jakarta.validation.constraints.NotBlank;

public record SendMessageRequest(@NotBlank String messageText) {
}