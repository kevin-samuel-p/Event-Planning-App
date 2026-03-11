package com.eventplanning.backend.groupchat;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GcMessageRepository extends JpaRepository<GcMessage, Long> {
    
    List<GcMessage> findByForumIdOrderByTimestampAsc(Long forumId);
}
