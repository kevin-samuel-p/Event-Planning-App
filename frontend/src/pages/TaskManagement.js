import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './TaskManagement.css';

const TaskManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);

  const [taskForm, setTaskForm] = useState({
    taskName: '',
    description: '',
    deadline: '',
    assignedToUserId: '',
    assignedToUserName: ''
  });

  const [teamMembers, setTeamMembers] = useState([]);
  const [teamMemberSuggestions, setTeamMemberSuggestions] = useState([]);
  const [showTeamMemberSuggestions, setShowTeamMemberSuggestions] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchTeamMembers();
  }, [id]);

  // Close team member suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.team-member-input-container')) {
        setShowTeamMemberSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchTeamMembers = async () => {
    try {
      // Fetch both team members and vendors for task assignment
      const [teamMembersData, vendorsData] = await Promise.all([
        eventAPI.getAllTeamMembers(),
        eventAPI.getAllVendors()
      ]);
      
      // Combine both team members and vendors
      const allAssignableUsers = [
        ...(teamMembersData || []),
        ...(vendorsData || [])
      ];
      
      setTeamMembers(allAssignableUsers);
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    }
  };

  const handleTeamMemberNameChange = (e) => {
    const value = e.target.value;
    setTaskForm({...taskForm, assignedToUserName: value, assignedToUserId: ''});
    
    if (value.length > 0) {
      const filtered = teamMembers.filter(member => 
        member.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 4); // Limit to 4 suggestions
      setTeamMemberSuggestions(filtered);
      setShowTeamMemberSuggestions(true);
    } else {
      setTeamMemberSuggestions([]);
      setShowTeamMemberSuggestions(false);
    }
  };

  const handleTeamMemberSelect = (member) => {
    setTaskForm({
      ...taskForm,
      assignedToUserName: member.name,
      assignedToUserId: member.id
    });
    setTeamMemberSuggestions([]);
    setShowTeamMemberSuggestions(false);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const tasksData = await eventAPI.getTasks(id);
      setTasks(tasksData || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to load tasks. Please try again.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks based on user role
  const getVisibleTasks = () => {
    if (user?.role === 'ORGANIZER') {
      return tasks; // Organizers see all tasks
    } else {
      return tasks.filter(task => task.assignedToUserId === user?.id); // Non-organizers see only their tasks
    }
  };

  const canUpdateTaskStatus = (task) => {
    if (user?.role === 'ORGANIZER') {
      return false; // Organizers cannot update task status
    } else {
      return task.assignedToUserId === user?.id; // Users can only update their own tasks
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!canUpdateTaskStatus(task)) {
      return; // Don't allow status update
    }
    
    try {
      await eventAPI.updateTaskStatus(taskId, { status: newStatus });
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      ));
    } catch (err) {
      console.error('Failed to update task status:', err);
      setError('Failed to update task status. Please try again.');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      // Validate that a team member is selected
      if (!taskForm.assignedToUserId) {
        throw new Error('Please select a team member from the dropdown.');
      }

      const response = await eventAPI.createTask(id, taskForm);
      setTasks([...tasks, response]);
      setShowCreateTask(false);
      setTaskForm({
        taskName: '',
        description: '',
        deadline: '',
        assignedToUserId: '',
        assignedToUserName: ''
      });
      setError('');
    } catch (err) {
      console.error('Failed to create task:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create task');
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
                    {user?.role === 'ORGANIZER' ? (
                      <><strong>Assigned to:</strong> {task.assignedUserName || 'User ' + task.assignedToUserId}</>
                    ) : (
                      <><strong>Assigned by:</strong> Event Organizer</>
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
                  ) : null}
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
                <label>Assign to Team Member:</label>
                <div className="team-member-input-container">
                  <input
                    type="text"
                    value={taskForm.assignedToUserName}
                    onChange={handleTeamMemberNameChange}
                    onFocus={() => taskForm.assignedToUserName.length > 0 && setShowTeamMemberSuggestions(true)}
                    placeholder="Start typing team member name..."
                    required
                  />
                  {showTeamMemberSuggestions && teamMemberSuggestions.length > 0 && (
                    <div className="team-member-suggestions">
                      {teamMemberSuggestions.map((member, index) => (
                        <div
                          key={index}
                          className="team-member-suggestion-item"
                          onClick={() => handleTeamMemberSelect(member)}
                        >
                          {member.name} - {member.role}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
