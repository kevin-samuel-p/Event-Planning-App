package com.eventplanning.backend.event;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByOrganizerId(Long organizerId);
}