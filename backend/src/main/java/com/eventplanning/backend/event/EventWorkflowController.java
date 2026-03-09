package com.eventplanning.backend.event;

import com.eventplanning.backend.budget.BudgetResponse;
import com.eventplanning.backend.budget.CreateBudgetRequest;
import com.eventplanning.backend.budget.CreatePaymentRequest;
import com.eventplanning.backend.budget.PaymentResponse;
import com.eventplanning.backend.chat.AddChatParticipantRequest;
import com.eventplanning.backend.chat.MessageResponse;
import com.eventplanning.backend.chat.SendMessageRequest;
import com.eventplanning.backend.feedback.CreateFeedbackRequest;
import com.eventplanning.backend.feedback.FeedbackResponse;
import com.eventplanning.backend.invitation.CreateInvitationRequest;
import com.eventplanning.backend.invitation.InvitationResponse;
import com.eventplanning.backend.invitation.UpdateRsvpRequest;
import com.eventplanning.backend.notification.NotificationResponse;
import com.eventplanning.backend.task.CreateTaskRequest;
import com.eventplanning.backend.task.TaskResponse;
import com.eventplanning.backend.task.UpdateTaskStatusRequest;
import com.eventplanning.backend.vendor.CreateEventVendorRequest;
import com.eventplanning.backend.vendor.EventVendorResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class EventWorkflowController {

    private final EventWorkflowService service;

    public EventWorkflowController(EventWorkflowService service) {
        this.service = service;
    }

    @PostMapping("/events")
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse createEvent(@Valid @RequestBody CreateEventRequest request) {
        return service.createEvent(request);
    }

    @GetMapping("/events/my")
    public List<EventResponse> myEvents() {
        return service.myEvents();
    }

    @PostMapping("/events/{eventId}/budget")
    @ResponseStatus(HttpStatus.CREATED)
    public BudgetResponse createBudget(@PathVariable Long eventId, @Valid @RequestBody CreateBudgetRequest request) {
        return service.createBudget(eventId, request);
    }

    @PostMapping("/events/{eventId}/vendors")
    @ResponseStatus(HttpStatus.CREATED)
    public EventVendorResponse addVendor(@PathVariable Long eventId, @Valid @RequestBody CreateEventVendorRequest request) {
        return service.addVendor(eventId, request);
    }

    @PostMapping("/events/{eventId}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse addTask(@PathVariable Long eventId, @Valid @RequestBody CreateTaskRequest request) {
        return service.addTask(eventId, request);
    }

    @PatchMapping("/tasks/{taskId}/status")
    public TaskResponse updateTaskStatus(@PathVariable Long taskId, @Valid @RequestBody UpdateTaskStatusRequest request) {
        return service.updateTaskStatus(taskId, request);
    }

    @PostMapping("/events/{eventId}/invitations")
    @ResponseStatus(HttpStatus.CREATED)
    public InvitationResponse sendInvitation(@PathVariable Long eventId, @Valid @RequestBody CreateInvitationRequest request) {
        return service.sendInvitation(eventId, request);
    }

    @PatchMapping("/invitations/{invitationId}/rsvp")
    public InvitationResponse updateRsvp(@PathVariable Long invitationId, @Valid @RequestBody UpdateRsvpRequest request) {
        return service.updateRsvp(invitationId, request);
    }

    @PostMapping("/budgets/{budgetId}/payments")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse addPayment(@PathVariable Long budgetId, @Valid @RequestBody CreatePaymentRequest request) {
        return service.addPayment(budgetId, request);
    }

    @PostMapping("/events/{eventId}/chat/participants")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addChatParticipant(@PathVariable Long eventId, @Valid @RequestBody AddChatParticipantRequest request) {
        service.addChatParticipant(eventId, request);
    }

    @PostMapping("/events/{eventId}/chat/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse sendMessage(@PathVariable Long eventId, @Valid @RequestBody SendMessageRequest request) {
        return service.sendMessage(eventId, request);
    }

    @GetMapping("/events/{eventId}/chat/messages")
    public List<MessageResponse> listMessages(@PathVariable Long eventId) {
        return service.listMessages(eventId);
    }

    @GetMapping("/notifications/me")
    public List<NotificationResponse> myNotifications() {
        return service.myNotifications();
    }

    @PatchMapping("/notifications/{notificationId}/read")
    public NotificationResponse markNotificationRead(@PathVariable Long notificationId) {
        return service.markNotificationRead(notificationId);
    }

    @PostMapping("/events/{eventId}/feedback")
    @ResponseStatus(HttpStatus.CREATED)
    public FeedbackResponse submitFeedback(@PathVariable Long eventId, @Valid @RequestBody CreateFeedbackRequest request) {
        return service.submitFeedback(eventId, request);
    }

    @PostMapping("/events/{eventId}/complete")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void completeEvent(@PathVariable Long eventId) {
        service.completeEvent(eventId);
    }

    @GetMapping("/events/{eventId}/report")
    public EventReportResponse report(@PathVariable Long eventId) {
        return service.generateReport(eventId);
    }
}