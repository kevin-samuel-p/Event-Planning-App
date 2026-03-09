package com.eventplanning.backend.budget;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateBudgetRequest(
        @NotNull @DecimalMin("0.0") BigDecimal totalBudget
) {
}