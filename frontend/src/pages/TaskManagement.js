import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI } from '../services/api';
import './TaskManagement.css';

const TaskManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);
  
  // Mock current user - in real app, get from auth context
  const currentUser = { id: 1, name: 'Alice Johnson', role: 'ORGANIZER' };

  const [taskForm, setTaskForm] = useState({
    taskName: '',
    description: '',
    deadline: '',
    assignedToUserId: ''
  });

  useEffect(() => {
    fetchTasks();
  }, [id]);

  const fetchTasks = async () => {
    try {
      // For now, we'll simulate task data
      // In a real app, you'd call eventAPI.getTasks(id)
      setTasks([
        {
          id: 1,
          taskName: 'Setup Venue',
          description: 'Arrange tables and chairs',
          deadline: '2026-04-11',
          status: 'TODO',
          assignedToUserId: 3,
          assignedToName: 'John Doe'
        },
        {
          id: 2,
          taskName: 'Catering Arrangement',
          description: 'Coordinate with catering service',
          deadline: '2026-04-10',
          status: 'IN_PROGRESS',
          assignedToUserId: 4,
          assignedToName: 'Jane Smith'
        }
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks based on user role
  const getVisibleTasks = () => {
    if (currentUser.role === 'ORGANIZER') {
      return tasks; // Organizers see all tasks
    } else {
      return tasks.filter(task => task.assignedToUserId === currentUser.id); // Non-organizers see only their tasks
    }
  };

  const canUpdateTaskStatus = (task) => {
    if (currentUser.role === 'ORGANIZER') {
      return false; // Organizers cannot update task status
    } else {
      return task.assignedToUserId === currentUser.id; // Users can only update their own tasks
    }
  };

  const handleStatusUpdate = (taskId, newStatus) => {
    if (!canUpdateTaskStatus(tasks.find(t => t.id === taskId))) {
      return; // Don't allow status update
    }
    
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const response = await eventAPI.createTask(id, taskForm);
      setTasks([...tasks, { ...response, assignedToName: 'New User' }]);
      setShowCreateTask(false);
      setTaskForm({
        taskName: '',
        description: '',
        deadline: '',
        assignedToUserId: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await eventAPI.updateTaskStatus(taskId, { status: newStatus });
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO': return '#6c757d';
      case 'IN_PROGRESS': return '#ffc107';
      case 'DONE': return '#28a745';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return <div className="task-loading">Loading...</div>;
  }

  return (
    <div className="task-container">
      <div className="task-header">
        <h2>Task Management</h2>
        <button className="btn-back" onClick={() => navigate(`/events/${id}`)}>
          ← Back to Event
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="task-content">
        <div className="section-header">
          <h3>Tasks ({tasks.length})</h3>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateTask(true)}
          >
            Create Task
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="no-tasks">
            <p>No tasks created yet</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {getVisibleTasks().map(task => (
              <div key={task.id} className="task-card">
                <div className="task-header-info">
                  <h4>{task.taskName}</h4>
                  <span 
                    className="task-status"
                    style={{ backgroundColor: getStatusColor(task.status) }}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                
                <p className="task-description">{task.description}</p>
                
                <div className="task-meta">
                  <div className="task-deadline">
                    <strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}
                  </div>
                  <div className="task-assignee">
                    {currentUser.role === 'ORGANIZER' ? (
                      <><strong>Assigned to:</strong> {task.assignedToName}</>
                    ) : (
                      <><strong>Assigned by:</strong> Task Manager</>
                    )}
                  </div>
                </div>

                <div className="task-actions">
                  {canUpdateTaskStatus(task) ? (
                    <select 
                      value={task.status}
                      onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  ) : (
                    <div className="status-display">
                      <span className="status-label">Status:</span>
                      <span className="status-value">{task.status.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateTask && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create Task</h3>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Task Name:</label>
                <input
                  type="text"
                  value={taskForm.taskName}
                  onChange={(e) => setTaskForm({...taskForm, taskName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  required
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Deadline:</label>
                <input
                  type="date"
                  value={taskForm.deadline}
                  onChange={(e) => setTaskForm({...taskForm, deadline: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Assign to User ID:</label>
                <input
                  type="number"
                  value={taskForm.assignedToUserId}
                  onChange={(e) => setTaskForm({...taskForm, assignedToUserId: e.target.value})}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Create Task</button>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateTask(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
