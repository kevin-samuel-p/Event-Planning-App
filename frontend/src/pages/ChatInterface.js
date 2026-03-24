import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatAPI, eventAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './ChatInterface.css';

const ChatInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groupChat, setGroupChat] = useState(null);
  const [forums, setForums] = useState([]);
  const [selectedForum, setSelectedForum] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMembersPanel, setShowMembersPanel] = useState(true);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [showForumMenu, setShowForumMenu] = useState(null);
  const [renamingForum, setRenamingForum] = useState(null);
  const [newForumName, setNewForumName] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [highlightedMessages, setHighlightedMessages] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForumModal, setShowCreateForumModal] = useState(false);
  const [createForumName, setCreateForumName] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberUserName, setAddMemberUserName] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeChat();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      if (selectedForum) {
        fetchMessages(selectedForum.id);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [selectedForum]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get or create group chat for this event
      const groupChatData = await chatAPI.getEventGroupChat(id);
      setGroupChat(groupChatData);
      
      // Get forums for this group chat
      const forumsData = await chatAPI.getForums(groupChatData.id);
      setForums(forumsData || []);
      
      // Get members
      const membersData = await chatAPI.getGroupChatMembers(groupChatData.id);
      setMembers(membersData || []);
      
      // Ensure current user (organizer) is in the members list
      if (user && membersData && !membersData.some(member => member.userId === user.id)) {
        const organizerMember = {
          userId: user.id,
          name: user.name || user.email || 'Organizer',
          email: user.email,
          role: user.role,
          joinedAt: new Date().toISOString(),
          online: true
        };
        setMembers(prev => [...prev, organizerMember]);
      }
      
      // Only select a forum if one exists, otherwise show forum creation UI
      if (forumsData && forumsData.length > 0) {
        await selectForum(forumsData[0]);
      }
      // If no forums exist, don't select anything - show forum creation UI
    } catch (err) {
      console.error('Failed to initialize chat:', err);
      setError('Failed to load chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultForum = async () => {
    try {
      const defaultForum = await chatAPI.createForum({
        groupChatId: groupChat.id,
        forumName: 'General Discussion'
      });
      setForums([defaultForum]);
      await selectForum(defaultForum);
    } catch (err) {
      console.error('Failed to create default forum:', err);
    }
  };

  const handleCreateForum = async () => {
    if (!createForumName.trim()) return;
    
    try {
      const newForum = await chatAPI.createForum({
        groupChatId: groupChat.id,
        forumName: createForumName.trim()
      });
      setForums(prev => [...prev, newForum]);
      await selectForum(newForum);
      setCreateForumName('');
      setShowCreateForumModal(false);
    } catch (err) {
      console.error('Failed to create forum:', err);
      setError('Failed to create forum. Please try again.');
    }
  };

  const handleAddMemberClick = () => {
    setShowAddMemberModal(true);
    fetchAvailableUsers();
  };

  const fetchAvailableUsers = async () => {
    try {
      console.log('Starting fetchAvailableUsers...'); // Debug
      const allUsers = await eventAPI.getAllTeamMembers();
      console.log('Raw API response:', allUsers); // Debug
      console.log('API response type:', typeof allUsers); // Debug
      console.log('API response length:', allUsers?.length); // Debug
      
      const currentMemberIds = members.map(member => member.userId).filter(id => id != null);
      console.log('Current member IDs:', currentMemberIds); // Debug
      console.log('Current members array:', members); // Debug
      
      const availableUsers = (allUsers || []).filter(user => {
        console.log('Processing user:', user); // Debug
        const isValid = user && 
          user.id && 
          user.name &&
          !currentMemberIds.includes(user.id);
        console.log('User validation - isValid:', isValid, 'userId:', user?.id, 'name:', user?.name); // Debug
        return isValid;
      });
      
      console.log('Final available users:', availableUsers); // Debug
      console.log('Available users count:', availableUsers.length); // Debug
      setAvailableUsers(availableUsers);
    } catch (error) {
      console.error('Failed to fetch available users:', error);
      console.error('Error details:', error.response?.data || error.message); // Debug
      setAvailableUsers([]);
    }
  };

  const selectForum = async (forum) => {
    try {
      setSelectedForum(forum);
      await fetchMessages(forum.id);
    } catch (err) {
      console.error('Failed to select forum:', err);
    }
  };

  const fetchMessages = async (forumId) => {
    try {
      const messagesData = await chatAPI.getForumMessages(forumId);
      setMessages(messagesData || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const getCurrentUserName = () => {
    const currentUserMember = members.find(member => member.userId === user?.id);
    return currentUserMember?.name || currentUserMember?.userName || user?.name || user?.email || 'You';
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedForum) return;

    try {
      const messageData = {
        forumId: selectedForum.id,
        message: newMessage.trim()
      };

      // Send message via API
      const response = await chatAPI.sendGcMessage(messageData);
      console.log('Message response:', response); // Debug log
      
      // Add the new message to the local state
      setMessages(prev => [...prev, response]);
      
      // Clear input
      setNewMessage('');
      
      // Scroll to bottom
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleForumSelect = (forum) => {
    setSelectedForum(forum);
    fetchMessages(forum.id);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Check for @ mentions
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // Get text after @ and before cursor
      const mentionText = textBeforeCursor.substring(lastAtIndex + 1);
      const spaceIndex = mentionText.indexOf(' ');
      const currentMention = spaceIndex === -1 ? mentionText : mentionText.substring(0, spaceIndex);
      
      console.log('Mention detected:', { mentionText, currentMention, spaceIndex }); // Debug
      
      if (currentMention && currentMention.length > 0) {
        const filteredMembers = members.filter(member => {
          const memberName = (member.name || member.userName || '').toLowerCase();
          return memberName.includes(currentMention.toLowerCase());
        });
        console.log('Filtered members:', filteredMembers); // Debug
        setMentionSuggestions(filteredMembers);
        setShowMentionSuggestions(true);
        setMentionIndex(0);
      } else if (currentMention === '') {
        // When @ is typed but no text yet, show all members
        console.log('Showing all members for empty mention'); // Debug
        setMentionSuggestions(members);
        setShowMentionSuggestions(true);
        setMentionIndex(0);
      } else {
        setShowMentionSuggestions(false);
      }
    } else {
      setShowMentionSuggestions(false);
    }
  };

  const handleMentionSelect = (member) => {
    const cursorPosition = document.querySelector('.message-input').selectionStart;
    const textBeforeCursor = newMessage.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const textAfterCursor = newMessage.substring(cursorPosition);
    
    const newMessageText = textBeforeCursor.substring(0, lastAtIndex) + 
                          '@' + (member.name || member.userName || '').toLowerCase().replace(/\s+/g, '') + 
                          ' ' + textAfterCursor;
    
    setNewMessage(newMessageText);
    setShowMentionSuggestions(false);
    
    // Focus back to input and set cursor position
    setTimeout(() => {
      const input = document.querySelector('.message-input');
      input.focus();
      const newCursorPosition = lastAtIndex + (member.name || member.userName || '').toLowerCase().replace(/\s+/g, '').length + 2;
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message.id);
    setEditText(message.message);
  };

  const handleSaveEdit = async () => {
    try {
      setMessages(messages.map(msg => 
        msg.id === editingMessage 
          ? { ...msg, message: editText, isEdited: true }
          : msg
      ));

      // Add system message about edit
      const systemMsg = {
        id: messages.length + 1,
        forumId: selectedForum.id,
        memberId: 0,
        memberName: 'System',
        message: `${user.name} changed their message`,
        timestamp: new Date().toISOString(),
        isEdited: false,
        isSystem: true
      };
      setMessages([...messages, systemMsg]);

      setEditingMessage(null);
      setEditText('');
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await chatAPI.deleteGcMessage(messageId);
      setMessages(messages.filter(msg => msg.id !== messageId));
      setShowMessageMenu(null);
    } catch (error) {
      console.error('Failed to delete message:', error);
      setError('Failed to delete message. Please try again.');
    }
  };

  const handleRenameForum = async (forumId) => {
    try {
      const oldName = forums.find(f => f.id === forumId)?.forumName;
      
      setForums(forums.map(f => 
        f.id === forumId 
          ? { ...f, forumName: newForumName }
          : f
      ));

      if (selectedForum?.id === forumId) {
        setSelectedForum({ ...selectedForum, forumName: newForumName });
      }

      // Add system message about forum rename
      const systemMsg = {
        id: messages.length + 1,
        forumId: selectedForum.id,
        memberId: 0,
        memberName: 'System',
        message: `${user.name} changed the forum title from "${oldName}" to "${newForumName}"`,
        timestamp: new Date().toISOString(),
        isEdited: false,
        isSystem: true
      };
      setMessages([...messages, systemMsg]);

      setRenamingForum(null);
      setNewForumName('');
      setShowForumMenu(null);
    } catch (error) {
      console.error('Failed to rename forum:', error);
    }
  };

  const handleForumRightClick = (e, forum) => {
    e.preventDefault();
    setShowForumMenu({ forum, x: e.clientX, y: e.clientY });
  };

  const handleMessageRightClick = (e, message) => {
    e.preventDefault();
    setShowMessageMenu({ message, x: e.clientX, y: e.clientY });
  };

  const isAdmin = user.role === 'ORGANIZER';
  const isOwnMessage = (message) => message.memberId === user.id;

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="header-left">
          <h3>{selectedForum?.forumName || 'Select a forum'}</h3>
        </div>
        <div className="header-right">
          <button 
            className="admin-menu-btn"
            onClick={() => setShowAdminMenu(!showAdminMenu)}
          >
            ⋮
          </button>
          <button 
            className="close-btn"
            onClick={() => navigate(`/events/${id}`)}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="chat-body">
        {/* Left Panel - Forums */}
        <div className="forums-panel">
          <div className="forums-header">
            <h4>Forums</h4>
            <div className="forum-actions">
              <button 
                className="create-forum-btn"
                onClick={() => setShowCreateForumModal(true)}
                title="Create new forum"
                disabled={!selectedForum}
              >
                +
              </button>
            </div>
          </div>
          <div className="forums-list">
            {forums.length === 0 ? (
              <div className="no-forums">
                {isAdmin ? (
                  <div className="no-forums-admin">
                    <p>No forums yet. Create your first forum to start chatting!</p>
                    <button 
                      className="create-first-forum-btn"
                      onClick={() => setShowCreateForumModal(true)}
                    >
                      Create Forum
                    </button>
                  </div>
                ) : (
                  <p>No forums available. Waiting for organizer to create forums...</p>
                )}
              </div>
            ) : (
              forums.map(forum => (
                <div
                  key={forum.id}
                  className={`forum-item ${selectedForum?.id === forum.id ? 'active' : ''}`}
                  onClick={() => handleForumSelect(forum)}
                  onContextMenu={(e) => isAdmin && handleForumRightClick(e, forum)}
                >
                  <span className="forum-name">{forum.forumName}</span>
                  <span className="forum-time">
                    {new Date(forum.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center Panel - Messages */}
        <div className="messages-panel">
          {selectedForum ? (
            <>
              <div className="messages-container">
                {console.log('Rendering messages:', messages)} {/* Debug log */}
                {messages.map(message => {
                  console.log('Rendering message:', message); // Debug log
                  return (
                    <div
                      key={message.id}
                      className={`message ${message.isSystem || false ? 'system-message' : ''} ${message.removed || false ? 'removed-message' : ''} ${highlightedMessages.has(message.id) ? 'highlighted' : ''}`}
                      onContextMenu={(e) => handleMessageRightClick(e, message)}
                    >
                      {!(message.isSystem || false) && !(message.removed || false) && (
                        <div className="message-header">
                          <div className="message-avatar">
                            {message.memberName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="message-info">
                            <span className="message-sender">{message.memberName || 'Unknown'}</span>
                            <span className="message-time">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {message.isEdited && <span className="edited-indicator">(edited)</span>}
                          </div>
                        </div>
                      )}
                      <div className="message-content">
                        {editingMessage === message.id ? (
                          <div className="edit-message-form">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="edit-input"
                              autoFocus
                            />
                            <div className="edit-actions">
                              <button onClick={handleSaveEdit} className="save-btn">Save</button>
                              <button onClick={() => setEditingMessage(null)} className="cancel-btn">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <p>{message.message}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
                {showMentionSuggestions && (
                  <div className="mention-suggestions">
                    {mentionSuggestions.map((member, index) => (
                      <div
                        key={member.userId}
                        className={`mention-suggestion ${index === mentionIndex ? 'active' : ''}`}
                        onClick={() => handleMentionSelect(member)}
                      >
                        <div className="mention-avatar">{(member.name || member.userName || '?')?.charAt(0)?.toUpperCase()}</div>
                        <div className="mention-info">
                          <div className="mention-name">{member.name || member.userName || 'Unknown'}</div>
                          <div className="mention-role">{member.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            {/* Message Input */}
            <div className="message-input-container">
              <form onSubmit={handleSendMessage} className="message-form">
                <button type="button" className="attach-btn">+</button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (showMentionSuggestions) {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setMentionIndex(prev => (prev + 1) % mentionSuggestions.length);
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setMentionIndex(prev => prev === 0 ? mentionSuggestions.length - 1 : prev - 1);
                      } else if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (mentionSuggestions[mentionIndex]) {
                          handleMentionSelect(mentionSuggestions[mentionIndex]);
                        }
                      } else if (e.key === 'Escape') {
                        setShowMentionSuggestions(false);
                      }
                    }
                  }}
                  placeholder="Type a message... (use @ to mention)"
                  className="message-input"
                />
                <button type="submit" className="send-btn">Send</button>
              </form>
            </div>
                                    </>
          ) : (
            <div className="no-forum-selected">
              <div className="no-forum-content">
                <div className="no-forum-icon">💬</div>
                <h3>Select a Forum to Start Chatting</h3>
                <p>Choose a forum from the left panel to view and participate in discussions.</p>
                {forums.length === 0 && isAdmin && (
                  <div className="create-forum-prompt">
                    <p>As an organizer, you can create forums to enable team communication.</p>
                    <button 
                      className="create-forum-btn-large"
                      onClick={() => setShowCreateForumModal(true)}
                    >
                      Create First Forum
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Members */}
        <div className={`members-panel ${showMembersPanel ? 'show' : 'hide'}`}>
          <div className="members-header">
            <h4>Members</h4>
            <div className="members-actions">
              {isAdmin && (
                <button 
                  className="add-member-btn"
                  onClick={handleAddMemberClick}
                  title="Add member to group chat"
                  disabled={!selectedForum}
                >
                  + Add
                </button>
              )}
            </div>
          </div>
          {showMembersPanel && (
            <div className="members-list">
              {members.map(member => (
                <div key={member.userId} className="member-item">
                  <div className="member-avatar">
                    {member.name || member.userName || '?'}
                  </div>
                  <div className="member-info">
                    <span className="member-name">{member.name || member.userName || 'Unknown'}</span>
                    <span className={`member-status ${member.online ? 'online' : 'offline'}`}>
                      {member.online ? '●' : '○'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fixed Toggle Button */}
        <button 
          className="members-panel-toggle"
          onClick={() => setShowMembersPanel(!showMembersPanel)}
          title={showMembersPanel ? "Hide members panel" : "Show members panel"}
        >
          {showMembersPanel ? '◀' : '▶'}
        </button>

      </div>

      {/* Context Menus */}
      {showForumMenu && (
        <div 
          className="context-menu forum-menu"
          style={{ left: showForumMenu.x, top: showForumMenu.y }}
        >
          <button onClick={() => {
            setRenamingForum(showForumMenu.forum.id);
            setNewForumName(showForumMenu.forum.forumName);
            setShowForumMenu(null);
          }}>
            Rename Forum
          </button>
          <button onClick={() => setShowForumMenu(null)}>Cancel</button>
        </div>
      )}

      {showMessageMenu && (
        <div 
          className="context-menu message-menu"
          style={{ left: showMessageMenu.x, top: showMessageMenu.y }}
        >
          {isOwnMessage(showMessageMenu.message) && (
            <>
              <button onClick={() => {
                handleEditMessage(showMessageMenu.message);
                setShowMessageMenu(null);
              }}>
                Edit Message
              </button>
              <button onClick={() => {
                handleDeleteMessage(showMessageMenu.message.id);
                setShowMessageMenu(null);
              }}>
                Delete Message
              </button>
            </>
          )}
          {isAdmin && !isOwnMessage(showMessageMenu.message) && (
            <button onClick={() => {
              handleDeleteMessage(showMessageMenu.message.id);
              setShowMessageMenu(null);
            }}>
              Remove Message
            </button>
          )}
          <button onClick={() => setShowMessageMenu(null)}>Cancel</button>
        </div>
      )}

      {/* Forum Rename Modal */}
      {renamingForum && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Rename Forum</h3>
            <input
              type="text"
              value={newForumName}
              onChange={(e) => setNewForumName(e.target.value)}
              className="rename-input"
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={() => handleRenameForum(renamingForum)} className="btn-primary">
                Rename
              </button>
              <button onClick={() => {
                setRenamingForum(null);
                setNewForumName('');
              }} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Menu */}
      {showAdminMenu && (
        <div className="admin-menu-dropdown">
          <button>Notification Settings</button>
          <button>Manage Permissions</button>
          <button>Export Chat</button>
          <button onClick={() => setShowAdminMenu(false)}>Close</button>
        </div>
      )}

      {/* Create Forum Modal */}
      {showCreateForumModal && (
        <div className="modal-overlay">
          <div className="create-forum-modal">
            <div className="modal-header">
              <h3>Create New Forum</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowCreateForumModal(false);
                  setCreateForumName('');
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="forum-name">Forum Name</label>
                <input
                  id="forum-name"
                  type="text"
                  value={createForumName}
                  onChange={(e) => setCreateForumName(e.target.value)}
                  placeholder="Enter forum name..."
                  className="forum-name-input"
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowCreateForumModal(false);
                  setCreateForumName('');
                }}
              >
                Cancel
              </button>
              <button 
                className="create-btn"
                onClick={handleCreateForum}
                disabled={!createForumName.trim()}
              >
                Create Forum
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="modal-overlay">
          <div className="add-member-modal">
            <div className="modal-header">
              <h3>Add Member to Group Chat</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowAddMemberModal(false);
                  setAddMemberUserName('');
                  setShowUserDropdown(false);
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="member-user-name">User Name</label>
                <div style={{position: 'relative'}}>
                  <input
                    id="member-user-name"
                    type="text"
                    value={addMemberUserName}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAddMemberUserName(value);
                      console.log('Input value:', value); // Debug
                      console.log('Should show dropdown:', value.trim().length > 0); // Debug
                      setShowUserDropdown(value.trim().length > 0);
                    }}
                    placeholder="Type to search users..."
                    className="member-name-input"
                    autoFocus
                  />
                  {showUserDropdown && console.log('Dropdown should be visible!')} {/* Debug */}
                  {showUserDropdown && (
                    <div className="user-dropdown" style={{
                      position: 'absolute', 
                      top: '100%', 
                      left: 0, 
                      right: 0, 
                      backgroundColor: 'white', 
                      border: '1px solid #ccc', 
                      zIndex: 1000,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}>
                    {availableUsers
                      .filter(user => {
                        if (!user || !user.name) return false;
                        
                        // Show all users if input is empty, otherwise filter
                        if (addMemberUserName.trim() === '') {
                          return true;
                        }
                        
                        return user.name.toLowerCase().includes(addMemberUserName.toLowerCase());
                      })
                      .slice(0, 5)
                      .map(user => (
                        <div
                          key={user.id}
                          className="user-dropdown-item"
                          onClick={() => {
                            setAddMemberUserName(user.name);
                            setShowUserDropdown(false);
                          }}
                          style={{padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', backgroundColor: 'white'}}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                          <div className="dropdown-user-info">
                            <span className="dropdown-user-name">
                              {user.name}
                            </span>
                            <span className="dropdown-user-role">
                              {user.email || 'Vendor'}
                            </span>
                          </div>
                        </div>
                      ))}
                    {availableUsers.length === 0 && (
                      <div style={{padding: '10px', textAlign: 'center', color: '#666'}}>
                        No users available to add
                      </div>
                    )}
                  </div>
                )}
                </div>
              </div>
              <div className="form-info">
                <p className="info-text">Search for and select a user to add to this group chat.</p>
                <p className="info-text">Only users not already in this forum can be added.</p>
                <p className="info-text">The user must be registered in the system.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowAddMemberModal(false);
                  setAddMemberUserName('');
                  setShowUserDropdown(false);
                }}
              >
                Cancel
              </button>
              <button 
                className="add-btn"
                onClick={async () => {
                  console.log('Add Member button clicked!'); // Debug
                  console.log('Current input:', addMemberUserName); // Debug
                  console.log('Available users:', availableUsers); // Debug
                  
                  if (!addMemberUserName.trim()) {
                    console.log('Returning early - empty input'); // Debug
                    return;
                  }
                  
                  const selectedUser = availableUsers.find(user => 
                    user && 
                    user.name &&
                    user.name.toLowerCase().includes(addMemberUserName.toLowerCase())
                  );
                  
                  console.log('Selected user:', selectedUser); // Debug
                  
                  if (!selectedUser) {
                    console.log('No user found - showing error'); // Debug
                    setError('Please select a valid user from the dropdown');
                    return;
                  }

                  console.log('Calling API to add member...'); // Debug
                  try {
                    const newMember = await chatAPI.addMemberToForum(selectedForum.id, selectedUser.id);
                    console.log('API response:', newMember); // Debug
                    setMembers(prev => [...prev, newMember]);
                    setAddMemberUserName('');
                    setShowUserDropdown(false);
                    setShowAddMemberModal(false);
                  } catch (err) {
                    console.error('Failed to add member:', err);
                    setError('Failed to add member to group chat. Please try again.');
                  }
                }}
                disabled={!addMemberUserName.trim()}
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menus */}
      {(showForumMenu || showMessageMenu || showAdminMenu) && (
        <div 
          className="menu-overlay"
          onClick={() => {
            setShowForumMenu(null);
            setShowMessageMenu(null);
            setShowAdminMenu(null);
          }}
        />
      )}
    </div>
  );
};

export default ChatInterface;
