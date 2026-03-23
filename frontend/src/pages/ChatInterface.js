import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatAPI } from '../services/api';
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
  const [addMemberUserId, setAddMemberUserId] = useState('');
  
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

  const handleAddMember = async () => {
    if (!addMemberUserId.trim()) return;
    
    try {
      const newMember = await chatAPI.addMemberToForum(selectedForum.id, addMemberUserId);
      setMembers(prev => [...prev, newMember]);
      setAddMemberUserId('');
      setShowAddMemberModal(false);
    } catch (err) {
      console.error('Failed to add member:', err);
      setError('Failed to add member. Please try again.');
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
      const mentionText = textBeforeCursor.substring(lastAtIndex + 1);
      const spaceIndex = mentionText.indexOf(' ');
      const currentMention = spaceIndex === -1 ? mentionText : mentionText.substring(0, spaceIndex);
      
      if (currentMention.length > 0) {
        const filteredMembers = members.filter(member => 
          (member.name || member.userName || '').toLowerCase().includes(currentMention.toLowerCase())
        );
        setMentionSuggestions(filteredMembers);
        setShowMentionSuggestions(true);
        setMentionIndex(0);
      } else {
        setMentionSuggestions(members);
        setShowMentionSuggestions(true);
        setMentionIndex(0);
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
    setEditText(message.content);
  };

  const handleSaveEdit = async () => {
    try {
      setMessages(messages.map(msg => 
        msg.id === editingMessage 
          ? { ...msg, content: editText, isEdited: true }
          : msg
      ));

      // Add system message about edit
      const systemMsg = {
        id: messages.length + 1,
        forumId: selectedForum.id,
        senderId: 0,
        senderName: 'System',
        content: `${user.name} changed their message`,
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
      setMessages(messages.filter(msg => msg.id !== messageId));
      setShowMessageMenu(null);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleRemoveMessage = async (messageId) => {
    try {
      setMessages(messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: 'This message was removed by an admin', removed: true }
          : msg
      ));
      setShowMessageMenu(null);
    } catch (error) {
      console.error('Failed to remove message:', error);
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
        senderId: 0,
        senderName: 'System',
        content: `${user.name} changed the forum title from "${oldName}" to "${newForumName}"`,
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
  const isOwnMessage = (message) => message.senderId === user.id;

  return (
    <div className="chat-interface">
      {/* Header */}
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
              {isAdmin && (
                <button 
                  className="add-member-btn"
                  onClick={() => setShowAddMemberModal(true)}
                  title="Add member to forum"
                  disabled={!selectedForum}
                >
                  + Add
                </button>
              )}
              <button 
                className="create-forum-btn"
                onClick={() => setShowCreateForumModal(true)}
                title="Create new forum"
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
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`message ${message.isSystem ? 'system-message' : ''} ${message.removed ? 'removed-message' : ''} ${highlightedMessages.has(message.id) ? 'highlighted' : ''}`}
                    onContextMenu={(e) => handleMessageRightClick(e, message)}
                  >
                    {!message.isSystem && !message.removed && (
                      <div className="message-header">
                        <div className="message-avatar">
                          {message.senderName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="message-info">
                          <span className="message-sender">{message.senderName || 'Unknown'}</span>
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
                        <p>{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
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
            <button 
              className="toggle-panel-btn"
              onClick={() => setShowMembersPanel(!showMembersPanel)}
            >
              {showMembersPanel ? '◀' : '▶'}
            </button>
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
              handleRemoveMessage(showMessageMenu.message.id);
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
              <h3>Add Member to Forum</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowAddMemberModal(false);
                  setAddMemberUserId('');
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="member-user-id">User ID</label>
                <input
                  id="member-user-id"
                  type="text"
                  value={addMemberUserId}
                  onChange={(e) => setAddMemberUserId(e.target.value)}
                  placeholder="Enter user ID to add..."
                  className="member-id-input"
                  autoFocus
                />
              </div>
              <div className="form-info">
                <p className="info-text">Enter the User ID of the person you want to add to this forum.</p>
                <p className="info-text">The user must already be registered in the system.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowAddMemberModal(false);
                  setAddMemberUserId('');
                }}
              >
                Cancel
              </button>
              <button 
                className="add-btn"
                onClick={handleAddMember}
                disabled={!addMemberUserId.trim()}
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
