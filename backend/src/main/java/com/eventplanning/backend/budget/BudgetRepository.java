package com.eventplanning.backend.budget;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByEventId(Long eventId);
}