package com.eventplanning.backend.groupchat;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMemberRepository extends JpaRepository<ChatMember, Long> {
    
    Optional<ChatMember> findByGroupChatIdAndUserId(Long groupChatId, Long userId);
    
    List<ChatMember> findByGroupChatId(Long groupChatId);
    
    List<ChatMember> findByUserId(Long userId);
}
