package com.eventplanning.backend.chat;

import java.time.Instant;

public record MessageResponse(Long id, Long chatId, Long senderId, String messageText, Instant timestamp) {
    public static MessageResponse from(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getChat().getId(),
                message.getSender().getId(),
                message.getMessageText(),
                message.getTimestamp()
        );
    }
}