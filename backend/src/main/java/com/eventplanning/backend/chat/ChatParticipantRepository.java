package com.eventplanning.backend.chat;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {
    boolean existsByChatIdAndUserId(Long chatId, Long userId);
}