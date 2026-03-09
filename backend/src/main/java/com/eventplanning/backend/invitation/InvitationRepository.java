package com.eventplanning.backend.invitation;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {
    List<Invitation> findByEventId(Long eventId);
    List<Invitation> findByGuestId(Long guestId);
}