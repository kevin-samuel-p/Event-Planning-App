package com.eventplanning.backend.groupchat;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttributeRepository extends JpaRepository<Attribute, Long> {
    
    List<Attribute> findByGroupChatId(Long groupChatId);
}
