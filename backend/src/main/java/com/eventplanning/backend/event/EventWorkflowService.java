package com.eventplanning.backend.event;

import com.eventplanning.backend.budget.Budget;
import com.eventplanning.backend.budget.BudgetRepository;
import com.eventplanning.backend.budget.BudgetResponse;
import com.eventplanning.backend.budget.CreateBudgetRequest;
import com.eventplanning.backend.budget.CreatePaymentRequest;
import com.eventplanning.backend.budget.Payment;
import com.eventplanning.backend.budget.PaymentRepository;
import com.eventplanning.backend.budget.PaymentResponse;
import com.eventplanning.backend.budget.PaymentStatus;
import com.eventplanning.backend.common.BadRequestException;
import com.eventplanning.backend.common.CurrentUserProvider;
import com.eventplanning.backend.common.NotFoundException;
import com.eventplanning.backend.feedback.CreateFeedbackRequest;
import com.eventplanning.backend.feedback.Feedback;
import com.eventplanning.backend.feedback.FeedbackRepository;
import com.eventplanning.backend.feedback.FeedbackResponse;
import com.eventplanning.backend.invitation.CreateInvitationRequest;
import com.eventplanning.backend.invitation.Invitation;
import com.eventplanning.backend.invitation.InvitationRepository;
import com.eventplanning.backend.invitation.InvitationResponse;
import com.eventplanning.backend.invitation.RsvpStatus;
import com.eventplanning.backend.invitation.UpdateRsvpRequest;
import com.eventplanning.backend.notification.Notification;
import com.eventplanning.backend.notification.NotificationRepository;
import com.eventplanning.backend.notification.NotificationResponse;
import com.eventplanning.backend.notification.NotificationStatus;
import com.eventplanning.backend.task.CreateTaskRequest;
import com.eventplanning.backend.task.Task;
import com.eventplanning.backend.task.TaskRepository;
import com.eventplanning.backend.task.TaskResponse;
import com.eventplanning.backend.task.TaskStatus;
import com.eventplanning.backend.task.UpdateTaskStatusRequest;
import com.eventplanning.backend.user.Role;
import com.eventplanning.backend.user.User;
import com.eventplanning.backend.user.UserRepository;
import com.eventplanning.backend.vendor.CreateEventVendorRequest;
import com.eventplanning.backend.vendor.EventVendor;
import com.eventplanning.backend.vendor.EventVendorRepository;
import com.eventplanning.backend.vendor.EventVendorResponse;
import com.eventplanning.backend.vendor.UpdateEventVendorRequest;
import com.eventplanning.backend.vendor.VendorResponse;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class EventWorkflowService {

    private final CurrentUserProvider currentUserProvider;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final TaskRepository taskRepository;
    private final EventVendorRepository eventVendorRepository;
    private final BudgetRepository budgetRepository;
    private final PaymentRepository paymentRepository;
    private final InvitationRepository invitationRepository;
    private final NotificationRepository notificationRepository;
    private final FeedbackRepository feedbackRepository;

    public EventWorkflowService(CurrentUserProvider currentUserProvider, UserRepository userRepository,
                                EventRepository eventRepository, TaskRepository taskRepository,
                                EventVendorRepository eventVendorRepository, BudgetRepository budgetRepository,
                                PaymentRepository paymentRepository, InvitationRepository invitationRepository,
                                NotificationRepository notificationRepository,
                                FeedbackRepository feedbackRepository) {
        this.currentUserProvider = currentUserProvider;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.taskRepository = taskRepository;
        this.eventVendorRepository = eventVendorRepository;
        this.budgetRepository = budgetRepository;
        this.paymentRepository = paymentRepository;
        this.invitationRepository = invitationRepository;
        this.notificationRepository = notificationRepository;
        this.feedbackRepository = feedbackRepository;
    }

    public EventResponse createEvent(CreateEventRequest request) {
        User organizer = currentUserProvider.requireCurrentUser();
        requireRole(organizer, Role.ORGANIZER);

        Event event = eventRepository.save(Event.builder()
                .eventName(request.eventName())
                .eventDate(request.eventDate())
                .venue(request.venue())
                .eventType(request.eventType())
                .organizer(organizer)
                .build());

        return EventResponse.from(event);
    }

    @Transactional
    public EventResponse updateEvent(Long eventId, CreateEventRequest request) {
        User organizer = currentUserProvider.requireCurrentUser();
        requireRole(organizer, Role.ORGANIZER);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found"));

        // Check if user owns the event
        if (!event.getOrganizer().getId().equals(organizer.getId())) {
            throw new AccessDeniedException("You can only edit your own events");
        }

        // Update event fields
        event.setEventName(request.eventName());
        event.setEventDate(request.eventDate());
        event.setVenue(request.venue());
        event.setEventType(request.eventType());

        Event updatedEvent = eventRepository.save(event);
        return EventResponse.from(updatedEvent);
    }

    public List<EventResponse> myEvents() {
        User organizer = currentUserProvider.requireCurrentUser();
        requireRole(organizer, Role.ORGANIZER);
        return eventRepository.findByOrganizerId(organizer.getId()).stream().map(EventResponse::from).toList();
    }

    public List<TaskResponse> getDelegatedTasks() {
        User organizer = currentUserProvider.requireCurrentUser();
        requireRole(organizer, Role.ORGANIZER);
        return taskRepository.findByEventOrganizerId(organizer.getId()).stream().map(TaskResponse::from).toList();
    }

    public List<TaskResponse> getAssignedTasks() {
        User user = currentUserProvider.requireCurrentUser();
        if (user.getRole() != Role.TEAM_MEMBER && user.getRole() != Role.VENDOR) {
            throw new AccessDeniedException("Only team members and vendors can view assigned tasks");
        }
        return taskRepository.findByAssignedToId(user.getId()).stream().map(TaskResponse::from).toList();
    }

    public List<TaskResponse> getEventTasks(Long eventId) {
        Event event = getOwnedEvent(eventId);
        return taskRepository.findByEventId(eventId).stream().map(TaskResponse::from).toList();
    }

    public List<EventResponse> getVendorEvents() {
        User vendor = currentUserProvider.requireCurrentUser();
        requireRole(vendor, Role.VENDOR);
        return eventVendorRepository.findByVendorId(vendor.getId()).stream()
                .map(EventVendor::getEvent)
                .map(EventResponse::from)
                .toList();
    }

    public List<EventResponse> getTeamEvents() {
        User teamMember = currentUserProvider.requireCurrentUser();
        requireRole(teamMember, Role.TEAM_MEMBER);
        return taskRepository.findByAssignedToId(teamMember.getId()).stream()
                .map(Task::getEvent)
                .distinct()
                .map(EventResponse::from)
                .toList();
    }

    public BudgetResponse createBudget(Long eventId, CreateBudgetRequest request) {
        Event event = getOwnedEvent(eventId);
        budgetRepository.findByEventId(eventId).ifPresent(existing -> {
            throw new BadRequestException("Budget already exists for event");
        });

        Budget budget = budgetRepository.save(Budget.builder()
                .event(event)
                .totalBudget(request.totalBudget())
                .spentAmount(BigDecimal.ZERO)
                .build());

        notifyUser(event.getOrganizer(), event, "Budget initialized for event " + event.getEventName());
        return BudgetResponse.from(budget);
    }

    public BudgetResponse getBudget(Long eventId) {
        Event event = getOwnedEvent(eventId);
        Budget budget = budgetRepository.findByEventId(eventId)
                .orElseThrow(() -> new NotFoundException("Budget not found for event"));
        return BudgetResponse.from(budget);
    }

    public List<PaymentResponse> getPayments(Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new NotFoundException("Budget not found"));
        getOwnedEvent(budget.getEvent().getId()); // Verify ownership
        return paymentRepository.findByBudgetId(budgetId).stream().map(PaymentResponse::from).toList();
    }

    public EventVendorResponse addVendor(Long eventId, CreateEventVendorRequest request) {
        Event event = getOwnedEvent(eventId);
        User vendor = userRepository.findById(request.vendorId())
                .orElseThrow(() -> new NotFoundException("Vendor user not found"));
        if (vendor.getRole() != Role.VENDOR) {
            throw new BadRequestException("Selected user is not a vendor");
        }

        EventVendor eventVendor = eventVendorRepository.save(EventVendor.builder()
                .event(event)
                .vendor(vendor)
                .serviceType(request.serviceType())
                .contractStatus(request.contractStatus())
                .build());

        notifyUser(vendor, event, "You have been added to event " + event.getEventName());
        return EventVendorResponse.from(eventVendor);
    }

    public void removeVendor(Long vendorId) {
        EventVendor eventVendor = eventVendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Event vendor not found"));
        
        // Verify the event belongs to the current user
        getOwnedEvent(eventVendor.getEvent().getId());
        
        eventVendorRepository.delete(eventVendor);
    }

    public EventVendorResponse updateVendor(Long vendorId, UpdateEventVendorRequest request) {
        EventVendor eventVendor = eventVendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Event vendor not found"));
        
        // Verify the event belongs to the current user
        getOwnedEvent(eventVendor.getEvent().getId());
        
        // Update vendor details
        eventVendor.setServiceType(request.serviceType());
        eventVendor.setContractStatus(request.contractStatus());
        
        EventVendor updated = eventVendorRepository.save(eventVendor);
        return EventVendorResponse.from(updated);
    }

    public List<EventVendorResponse> getEventVendors(Long eventId) {
        Event event = getOwnedEvent(eventId);
        return eventVendorRepository.findByEventId(eventId).stream()
                .map(eventVendor -> new EventVendorResponse(
                        eventVendor.getId(),
                        eventVendor.getEvent().getId(),
                        eventVendor.getVendor().getId(),
                        eventVendor.getVendor().getName(),
                        eventVendor.getVendor().getEmail(),
                        eventVendor.getVendor().getPhone(),
                        eventVendor.getServiceType(),
                        eventVendor.getContractStatus()
                ))
                .toList();
    }

    public List<VendorResponse> getAllVendors() {
        return userRepository.findByRole(Role.VENDOR).stream()
                .map(VendorResponse::from)
                .toList();
    }

    public List<VendorResponse> getAllTeamMembers() {
        return userRepository.findByRole(Role.TEAM_MEMBER).stream()
                .map(VendorResponse::from)
                .toList();
    }

    public VendorResponse getVendorDetails(Long vendorId) {
        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        return VendorResponse.from(vendor);
    }

    public TaskResponse addTask(Long eventId, CreateTaskRequest request) {
        Event event = getOwnedEvent(eventId);
        User assignee = userRepository.findById(request.assignedToUserId())
                .orElseThrow(() -> new NotFoundException("Assigned user not found"));

        if (assignee.getRole() != Role.TEAM_MEMBER && assignee.getRole() != Role.VENDOR) {
            throw new BadRequestException("Task can be assigned only to team members or vendors");
        }

        Task task = taskRepository.save(Task.builder()
                .taskName(request.taskName())
                .description(request.description())
                .deadline(request.deadline())
                .status(TaskStatus.TODO)
                .event(event)
                .assignedTo(assignee)
                .build());

        notifyUser(assignee, event, "Task assigned: " + task.getTaskName());
        return TaskResponse.from(task);
    }

    public TaskResponse updateTaskStatus(Long taskId, UpdateTaskStatusRequest request) {
        User actor = currentUserProvider.requireCurrentUser();
        Task task = taskRepository.findById(taskId).orElseThrow(() -> new NotFoundException("Task not found"));

        boolean isOwnerOrganizer = actor.getRole() == Role.ORGANIZER
                && task.getEvent().getOrganizer().getId().equals(actor.getId());
        boolean isAssignee = task.getAssignedTo().getId().equals(actor.getId());
        if (!isOwnerOrganizer && !isAssignee) {
            throw new AccessDeniedException("Only organizer or assignee can update task");
        }

        task.setStatus(request.status());
        Task updated = taskRepository.save(task);
        notifyUser(updated.getEvent().getOrganizer(), updated.getEvent(),
                "Task status updated: " + updated.getTaskName() + " -> " + updated.getStatus());
        return TaskResponse.from(updated);
    }

    public InvitationResponse sendInvitation(Long eventId, CreateInvitationRequest request) {
        Event event = getOwnedEvent(eventId);
        User guest = userRepository.findById(request.guestId())
                .orElseThrow(() -> new NotFoundException("Guest user not found"));
        if (guest.getRole() != Role.GUEST) {
            throw new BadRequestException("Selected user is not a guest");
        }

        Invitation invitation = invitationRepository.save(Invitation.builder()
                .event(event)
                .guest(guest)
                .rsvpStatus(RsvpStatus.PENDING)
                .invitationDate(LocalDate.now())
                .customMessage(request.customMessage())
                .build());

        notifyUser(guest, event, "Invitation received for event " + event.getEventName());
        return InvitationResponse.from(invitation);
    }

    public InvitationResponse updateRsvp(Long invitationId, UpdateRsvpRequest request) {
        User guest = currentUserProvider.requireCurrentUser();
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new NotFoundException("Invitation not found"));

        if (!invitation.getGuest().getId().equals(guest.getId())) {
            throw new AccessDeniedException("Only invited guest can update RSVP");
        }

        invitation.setRsvpStatus(request.rsvpStatus());
        Invitation updated = invitationRepository.save(invitation);
        notifyUser(updated.getEvent().getOrganizer(), updated.getEvent(),
                "RSVP updated by " + guest.getName() + " to " + updated.getRsvpStatus());
        notifyUser(guest, updated.getEvent(), "You have updated your RSVP to " + updated.getRsvpStatus());
        return InvitationResponse.from(updated);
    }

    public PaymentResponse addPayment(Long budgetId, CreatePaymentRequest request) {
        User organizer = currentUserProvider.requireCurrentUser();
        requireRole(organizer, Role.ORGANIZER);

        Budget budget = budgetRepository.findById(budgetId).orElseThrow(() -> new NotFoundException("Budget not found"));
        if (!budget.getEvent().getOrganizer().getId().equals(organizer.getId())) {
            throw new AccessDeniedException("Only event organizer can add payments");
        }

        EventVendor eventVendor;
        try {
            eventVendor = eventVendorRepository.findById(request.eventVendorId())
                    .orElseThrow(() -> new NotFoundException("Event vendor not found with ID: " + request.eventVendorId()));
        } catch (NotFoundException e) {
            // For testing purposes, create a dummy vendor if none exists
            throw new BadRequestException("Event vendor not found. Please add a vendor to the event first. Vendor ID: " + request.eventVendorId());
        }
        
        // Verify the event vendor belongs to the same event as the budget
        if (!eventVendor.getEvent().getId().equals(budget.getEvent().getId())) {
            throw new BadRequestException("Event vendor does not belong to this event's budget");
        }

        // Budget validation - check if enough budget is available
        BigDecimal currentSpent = budget.getSpentAmount();
        BigDecimal totalBudget = budget.getTotalBudget();
        BigDecimal newSpent = currentSpent.add(request.amount());
        
        if (newSpent.compareTo(totalBudget) > 0) {
            throw new BadRequestException("Insufficient budget. Available: " + 
                totalBudget.subtract(currentSpent) + ", Requested: " + request.amount());
        }

        Payment payment = paymentRepository.save(Payment.builder()
                .budget(budget)
                .eventVendor(eventVendor)
                .amount(request.amount())
                .paymentDate(request.paymentDate())
                .paymentStatus(request.paymentStatus())
                .recipientName(request.recipientName())
                .build());

        // Update budget spent amount only for paid payments
        if (request.paymentStatus() == PaymentStatus.PAID) {
            budget.setSpentAmount(newSpent);
            budgetRepository.save(budget);
        }

        notifyUser(eventVendor.getVendor(), budget.getEvent(), 
            "Payment update: " + request.paymentStatus() + " amount " + request.amount());
        return PaymentResponse.from(payment);
    }

    public List<NotificationResponse> myNotifications() {
        User user = currentUserProvider.requireCurrentUser();
        return notificationRepository.findByUserIdOrderByIdDesc(user.getId()).stream().map(NotificationResponse::from).toList();
    }

    public NotificationResponse markNotificationRead(Long notificationId) {
        User user = currentUserProvider.requireCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification not found"));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Cannot update another user's notification");
        }

        notification.setStatus(NotificationStatus.READ);
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    public FeedbackResponse submitFeedback(Long eventId, CreateFeedbackRequest request) {
        User user = currentUserProvider.requireCurrentUser();
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new NotFoundException("Event not found"));

        Feedback feedback = feedbackRepository.save(Feedback.builder()
                .event(event)
                .user(user)
                .rating(request.rating())
                .comments(request.comments())
                .build());

        notifyUser(event.getOrganizer(), event, "New feedback submitted for event " + event.getEventName());
        return FeedbackResponse.from(feedback);
    }

    public void completeEvent(Long eventId) {
        Event event = getOwnedEvent(eventId);
        List<Invitation> invitations = invitationRepository.findByEventId(eventId);
        for (Invitation invitation : invitations) {
            notifyUser(invitation.getGuest(), event, "Event completed. Please submit your feedback.");
        }
    }

    public EventReportResponse generateReport(Long eventId) {
        getOwnedEvent(eventId);

        List<Task> tasks = taskRepository.findByEventId(eventId);
        List<Invitation> invitations = invitationRepository.findByEventId(eventId);
        List<Feedback> feedbacks = feedbackRepository.findByEventId(eventId);

        long completedTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long acceptedInvitations = invitations.stream().filter(i -> i.getRsvpStatus() == RsvpStatus.ACCEPTED).count();
        double averageRating = feedbacks.stream().mapToInt(Feedback::getRating).average().orElse(0);

        return new EventReportResponse(
                eventId,
                tasks.size(),
                completedTasks,
                invitations.size(),
                acceptedInvitations,
                feedbacks.size(),
                averageRating
        );
    }

    private Event getOwnedEvent(Long eventId) {
        User organizer = currentUserProvider.requireCurrentUser();
        requireRole(organizer, Role.ORGANIZER);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found"));
        if (!event.getOrganizer().getId().equals(organizer.getId())) {
            throw new AccessDeniedException("Only organizer who created event can manage it");
        }
        return event;
    }

    private void notifyUser(User user, Event event, String message) {
        notificationRepository.save(Notification.builder()
                .user(user)
                .event(event)
                .message(message)
                .status(NotificationStatus.UNREAD)
                .build());
    }

    private void requireRole(User user, Role expectedRole) {
        if (user.getRole() != expectedRole) {
            throw new AccessDeniedException("Operation requires role " + expectedRole);
        }
    }
}