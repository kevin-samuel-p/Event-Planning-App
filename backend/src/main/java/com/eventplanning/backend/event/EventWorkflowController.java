package com.eventplanning.backend.event;

import com.eventplanning.backend.budget.BudgetResponse;
import com.eventplanning.backend.budget.CreateBudgetRequest;
import com.eventplanning.backend.budget.CreatePaymentRequest;
import com.eventplanning.backend.budget.PaymentResponse;
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
import com.eventplanning.backend.vendor.UpdateEventVendorRequest;
import com.eventplanning.backend.vendor.VendorResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

    @PatchMapping("/events/{eventId}")
    public EventResponse updateEvent(@PathVariable Long eventId, @Valid @RequestBody CreateEventRequest request) {
        return service.updateEvent(eventId, request);
    }

    @GetMapping("/events/my")
    public List<EventResponse> myEvents() {
        return service.myEvents();
    }

    @GetMapping("/tasks/delegated")
    public List<TaskResponse> getDelegatedTasks() {
        return service.getDelegatedTasks();
    }

    @GetMapping("/tasks/assigned")
    public List<TaskResponse> getAssignedTasks() {
        return service.getAssignedTasks();
    }

    @GetMapping("/events/vendor")
    public List<EventResponse> getVendorEvents() {
        return service.getVendorEvents();
    }

    @GetMapping("/events/team")
    public List<EventResponse> getTeamEvents() {
        return service.getTeamEvents();
    }

    @PostMapping("/events/{eventId}/budget")
    @ResponseStatus(HttpStatus.CREATED)
    public BudgetResponse createBudget(@PathVariable Long eventId, @Valid @RequestBody CreateBudgetRequest request) {
        return service.createBudget(eventId, request);
    }

    @GetMapping("/events/{eventId}/budget")
    public BudgetResponse getBudget(@PathVariable Long eventId) {
        return service.getBudget(eventId);
    }

    @GetMapping("/budgets/{budgetId}/payments")
    public List<PaymentResponse> getPayments(@PathVariable Long budgetId) {
        return service.getPayments(budgetId);
    }

    @PostMapping("/events/{eventId}/vendors")
    @ResponseStatus(HttpStatus.CREATED)
    public EventVendorResponse addVendor(@PathVariable Long eventId, @Valid @RequestBody CreateEventVendorRequest request) {
        return service.addVendor(eventId, request);
    }

    @DeleteMapping("/events/vendors/{vendorId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeVendor(@PathVariable Long vendorId) {
        service.removeVendor(vendorId);
    }

    @PutMapping("/events/vendors/{vendorId}")
    public EventVendorResponse updateVendor(@PathVariable Long vendorId, @Valid @RequestBody UpdateEventVendorRequest request) {
        return service.updateVendor(vendorId, request);
    }

    @GetMapping("/events/{eventId}/vendors")
    public List<EventVendorResponse> getEventVendors(@PathVariable Long eventId) {
        return service.getEventVendors(eventId);
    }

    @GetMapping("/vendors/{vendorId}")
    public VendorResponse getVendorDetails(@PathVariable Long vendorId) {
        return service.getVendorDetails(vendorId);
    }

    @GetMapping("/vendors/list")
    public List<VendorResponse> getAllVendors() {
        return service.getAllVendors();
    }

    @GetMapping("/team-members/list")
    public List<VendorResponse> getAllTeamMembers() {
        return service.getAllTeamMembers();
    }

    @GetMapping("/test")
    public String testEndpoint() {
        return "Controller is working!";
    }

    @PostMapping("/events/{eventId}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse addTask(@PathVariable Long eventId, @Valid @RequestBody CreateTaskRequest request) {
        return service.addTask(eventId, request);
    }

    @GetMapping("/events/{eventId}/tasks")
    public List<TaskResponse> getEventTasks(@PathVariable Long eventId) {
        return service.getEventTasks(eventId);
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