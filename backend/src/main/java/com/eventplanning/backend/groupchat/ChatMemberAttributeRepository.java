package com.eventplanning.backend.groupchat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMemberAttributeRepository extends JpaRepository<ChatMemberAttribute, Long> {
}
