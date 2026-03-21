package com.eventplanning.backend.task;

import java.time.LocalDate;

public record TaskResponse(
        Long id,
        String taskName,
        String description,
        LocalDate deadline,
        TaskStatus status,
        Long eventId,
        Long assignedToUserId,
        String assignedUserName
) {
    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTaskName(),
                task.getDescription(),
                task.getDeadline(),
                task.getStatus(),
                task.getEvent().getId(),
                task.getAssignedTo().getId(),
                task.getAssignedTo().getName()
        );
    }
}