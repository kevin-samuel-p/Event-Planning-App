package com.eventplanning.backend.feedback;

public record FeedbackResponse(Long id, Long userId, Long eventId, Integer rating, String comments) {
    public static FeedbackResponse from(Feedback feedback) {
        return new FeedbackResponse(
                feedback.getId(),
                feedback.getUser().getId(),
                feedback.getEvent().getId(),
                feedback.getRating(),
                feedback.getComments()
        );
    }
}