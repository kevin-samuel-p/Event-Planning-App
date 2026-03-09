package com.eventplanning.backend.chat;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    Optional<Chat> findByEventId(Long eventId);
}