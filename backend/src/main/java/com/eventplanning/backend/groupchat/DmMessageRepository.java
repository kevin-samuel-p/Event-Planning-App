package com.eventplanning.backend.groupchat;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DmMessageRepository extends JpaRepository<DmMessage, Long> {
    
    List<DmMessage> findByDirectMessageIdOrderByTimestampAsc(Long directMessageId);
    
    @Query("SELECT dm FROM DmMessage dm WHERE dm.directMessage.id = :dmId AND dm.user.id = :userId ORDER BY dm.timestamp ASC")
    List<DmMessage> findByDirectMessageIdAndUserId(@Param("dmId") Long directMessageId, @Param("userId") Long userId);
}
