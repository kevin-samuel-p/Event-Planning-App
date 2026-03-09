package com.eventplanning.backend.task;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateTaskRequest(
        @NotBlank String taskName,
        @NotBlank String description,
        @NotNull @FutureOrPresent LocalDate deadline,
        @NotNull Long assignedToUserId
) {
}