package com.eventplanning.backend.groupchat;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ForumRepository extends JpaRepository<Forum, Long> {
    
    List<Forum> findByGroupChatId(Long groupChatId);
}
