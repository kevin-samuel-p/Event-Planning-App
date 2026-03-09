package com.eventplanning.backend.budget;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBudgetId(Long budgetId);
}