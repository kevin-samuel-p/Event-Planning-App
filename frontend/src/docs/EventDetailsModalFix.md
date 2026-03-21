# Event Details Modal Fix: Add "View Agenda" Button

## 🎯 **Issue Identified:**

The "View Agenda" button should be added to the **Event Details modal** (not dashboard cards) and should link to the **Event Details page** (not agenda page).

## 🔍 **Current Structure Analysis:**

The Event Details modal in Dashboard.js has:
- Event information display
- Action buttons (View Details, Chat, etc.)
- Missing: "View Agenda" button

## 🛠️ **Fix Required:**

### **Step 1: Add "View Agenda" Button to Event Details Modal**

In the Event Details modal (around line 400-450 in Dashboard.js), add this button:

```javascript
// Find the event-actions section in the modal
<div className="event-actions">
  <button className="btn-primary" onClick={handleViewEvent}>
    View Details
  </button>
  
  {/* Existing buttons based on user role */}
  {userRole === 'ORGANIZER' && (
    <button className="btn-secondary" onClick={() => navigate(`/events/${selectedEvent.id}/edit`)}>
      Edit Event
    </button>
  )}
  
  {userRole === 'VENDOR' && (
    <button className="btn-secondary" onClick={() => navigate(`/events/${selectedEvent.id}/vendor-details`)}>
      View Contract
    </button>
  )}
  
  {userRole === 'TEAM_MEMBER' && (
    <button className="btn-secondary" onClick={() => navigate(`/events/${selectedEvent.id}/tasks`)}>
      My Tasks
    </button>
  )}
  
  {/* ADD THIS BUTTON - Event Day Agenda */}
  {isEventDay && (
    <button 
      className="btn-agenda"
      onClick={() => navigate(`/events/${selectedEvent.id}`)}
    >
      View Agenda
    </button>
  )}
</div>
```

### **Step 2: Update Event Details Page**

In the actual EventDetails.js page (separate file), add the EventDayAgenda component:

```javascript
import EventDayAgenda from '../components/EventDayAgenda';
import { useEventDay } from '../hooks/useEventDay';

const EventDetails = ({ eventId }) => {
  const { events } = useContext(EventContext);
  const event = events.find(e => e.id === eventId);
  
  // Check if today is event day
  const isEventDay = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.eventDate);
    eventDate.setHours(0, 0, 0, 0);
    return today.toDateString() === eventDate.toDateString();
  };

  return (
    <div className="event-details">
      {/* Existing event details section */}
      <div className="event-info">
        <h2>{event.eventName}</h2>
        <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
        <p><strong>Venue:</strong> {event.venue}</p>
        <p><strong>Type:</strong> {event.eventType}</p>
        <p><strong>Description:</strong> {event.description}</p>
      </div>

      {/* Event Day Agenda - Only shows on event day */}
      {isEventDay() && (
        <EventDayAgenda 
          eventId={eventId} 
          isEventDay={isEventDay()} 
          userRole={user.role} 
        />
      )}
      
      {/* Existing action buttons */}
      <div className="event-actions">
        {/* Back to Dashboard, Edit, etc. */}
      </div>
    </div>
  );
};
```

## 🎨 **Button Styling**

The `.btn-agenda` CSS is already in Dashboard.css:

```css
.btn-agenda {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.3s;
  font-size: 0.9rem;
}

.btn-agenda:hover {
  background: #5a6268;
}
```

## 📍 **Button Position:**

The "View Agenda" button should be:
- **In Event Details modal:** Under the Chat button
- **Only on Event Day:** Using `isEventDay` condition
- **Links to Event Details page:** `navigate(\`/events/\${selectedEvent.id}\`)`

## 🔧 **Implementation Steps:**

### **1. Update Dashboard.js Event Details Modal**
```javascript
// Find the modal section (around line 400-450)
// Add the "View Agenda" button in the event-actions div
// Use selectedEvent.id for navigation
// Condition: isEventDay && userRole !== 'GUEST'
```

### **2. Update/Verify EventDetails.js**
```javascript
// Import EventDayAgenda component
// Add event day detection logic
// Include EventDayAgenda component conditionally
// Ensure proper routing and navigation
```

### **3. Test Integration**
```javascript
// Test: Button appears only on event day
// Test: Navigation goes to correct Event Details page
// Test: EventDayAgenda displays properly
// Test: Real-time updates work correctly
```

## 🎯 **Expected Result:**

1. **Dashboard Event Cards:** "View Agenda" button appears on event day
2. **Event Details Modal:** "View Agenda" button appears on event day
3. **Navigation:** Both buttons link to Event Details page
4. **Event Details Page:** Shows EventDayAgenda component on event day
5. **Real-time Updates:** Progress bar updates live during event

## 📊 **Fix Priority:**

| Component | Status | Action Required |
|-----------|---------|-----------------|
| Dashboard Event Cards | ✅ Done | "View Agenda" button added |
| Event Details Modal | ❌ Missing | Add button under Chat |
| Event Details Page | ❌ Missing | Add EventDayAgenda component |
| Navigation Logic | ❌ Missing | Link to correct page |
| CSS Styling | ✅ Done | .btn-agenda styles ready |

**This fix will complete the Event Day Agenda integration as specified in the requirements!** 🎯
