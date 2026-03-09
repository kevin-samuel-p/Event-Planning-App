# Event Planning Backend

Spring Boot backend for the `ref/` use case and ER model.

## Tech Stack
- Java 21
- Spring Boot 4.0.0
- Maven
- Spring Security (JWT authn/authz)
- Spring Data JPA + H2

## Run
1. Ensure JDK 21 and Maven are installed.
2. From `backend/`:
   - `mvn spring-boot:run`

## Auth APIs
- `POST /api/auth/register`
- `POST /api/auth/login`

Both return JWT token. Use bearer token for protected APIs.

## Workflow APIs
- Event creation: `POST /api/events`
- Organizer events: `GET /api/events/my`
- Initialize budget: `POST /api/events/{eventId}/budget`
- Add vendor: `POST /api/events/{eventId}/vendors`
- Assign task: `POST /api/events/{eventId}/tasks`
- Update task status: `PATCH /api/tasks/{taskId}/status`
- Send invitation: `POST /api/events/{eventId}/invitations`
- RSVP update: `PATCH /api/invitations/{invitationId}/rsvp`
- Add payment: `POST /api/budgets/{budgetId}/payments`
- Add chat participant: `POST /api/events/{eventId}/chat/participants`
- Send chat message: `POST /api/events/{eventId}/chat/messages`
- List messages: `GET /api/events/{eventId}/chat/messages`
- My notifications: `GET /api/notifications/me`
- Mark notification read: `PATCH /api/notifications/{notificationId}/read`
- Submit feedback: `POST /api/events/{eventId}/feedback`
- Complete event: `POST /api/events/{eventId}/complete`
- Event report: `GET /api/events/{eventId}/report`

## Role Rules (core)
- Organizer: create/manage owned events, tasks, vendors, budget, invitations, payments, reports.
- Team member/vendor: task execution and chat participation.
- Guest: RSVP and feedback.

## Notes
- `ref/` files were not modified.
- H2 is in-memory; data resets on restart.
- Change `app.jwt.secret` in `application.yml` for non-dev use.