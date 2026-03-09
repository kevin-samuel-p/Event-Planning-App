package com.eventplanning.backend.event;

public record EventReportResponse(
        Long eventId,
        long totalTasks,
        long completedTasks,
        long totalInvitations,
        long acceptedInvitations,
        long feedbackCount,
        double averageRating
) {
}