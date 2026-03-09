package com.eventplanning.backend.budget;

import java.math.BigDecimal;

public record BudgetResponse(Long id, Long eventId, BigDecimal totalBudget, BigDecimal spentAmount) {
    public static BudgetResponse from(Budget budget) {
        return new BudgetResponse(budget.getId(), budget.getEvent().getId(), budget.getTotalBudget(), budget.getSpentAmount());
    }
}