package com.eventplanning.backend.groupchat;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupChatRepository extends JpaRepository<GroupChat, Long> {
    
    Optional<GroupChat> findByJoinCode(String joinCode);
    
    Optional<GroupChat> findByEventId(Long eventId);
}
