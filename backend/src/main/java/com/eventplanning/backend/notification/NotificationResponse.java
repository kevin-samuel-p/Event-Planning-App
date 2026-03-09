package com.eventplanning.backend.notification;

public record NotificationResponse(Long id, Long userId, Long eventId, String message, NotificationStatus status) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getUser().getId(),
                notification.getEvent().getId(),
                notification.getMessage(),
                notification.getStatus()
        );
    }
}