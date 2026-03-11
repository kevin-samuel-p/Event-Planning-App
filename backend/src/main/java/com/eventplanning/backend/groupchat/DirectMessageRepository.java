package com.eventplanning.backend.groupchat;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DirectMessageRepository extends JpaRepository<DirectMessage, Long> {
    
    List<DirectMessage> findByGroupChatId(Long groupChatId);
    
    @Query("SELECT dm FROM DirectMessage dm WHERE dm.groupChat.id = :gcId AND " +
           "(dm.member1.user.id = :userId OR dm.member2.user.id = :userId)")
    List<DirectMessage> findByGroupChatIdAndUserId(@Param("gcId") Long groupChatId, @Param("userId") Long userId);
}
