package com.eventplanning.backend.task;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByEventId(Long eventId);
    List<Task> findByAssignedToId(Long userId);
    List<Task> findByEventOrganizerId(Long organizerId);
}