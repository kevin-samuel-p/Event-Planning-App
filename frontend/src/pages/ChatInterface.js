import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatAPI } from '../services/api';
import './ChatInterface.css';

const ChatInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  
  const messagesEndRef = useRef(null);
  const currentUser = { id: 1, name: 'Alice Johnson', role: 'ORGANIZER' }; // Mock current user

  useEffect(() => {
    initializeChat();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      // Mock data for now - in real app, call APIs
      setGroupChat({
        id: 1,
        gcName: 'Summer Wedding Chat',
        joinCode: 'WED123',
        eventId: parseInt(id)
      });

      setForums([
        { id: 1, gcId: 1, forumName: 'General Discussion', createdAt: '2026-03-15T10:00:00Z' },
        { id: 2, gcId: 1, forumName: 'Planning', createdAt: '2026-03-15T11:00:00Z' },
        { id: 3, gcId: 1, forumName: 'Vendor Coordination', createdAt: '2026-03-15T12:00:00Z' }
      ]);

      setMembers([
        { userId: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'ORGANIZER', joinedAt: '2026-03-15T10:00:00Z', online: true },
        { userId: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'TEAM_MEMBER', joinedAt: '2026-03-15T10:30:00Z', online: true },
        { userId: 3, name: 'Carol White', email: 'carol@example.com', role: 'VENDOR', joinedAt: '2026-03-15T11:00:00Z', online: false },
        { userId: 4, name: 'David Brown', email: 'david@example.com', role: 'GUEST', joinedAt: '2026-03-15T11:30:00Z', online: false }
      ]);

      // Select first forum by default
      const firstForum = { id: 1, gcId: 1, forumName: 'General Discussion' };
      setSelectedForum(firstForum);
      loadForumMessages(firstForum.id);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  };

  const loadForumMessages = async (forumId) => {
    try {
      // Mock messages
      const mockMessages = [
        {
          id: 1,
          forumId: forumId,
          senderId: 1,
          senderName: 'Alice Johnson',
          content: 'Welcome everyone to the wedding planning chat!',
          timestamp: '2026-03-15T10:00:00Z',
          isEdited: false
        },
        {
          id: 2,
          forumId: forumId,
          senderId: 2,
          senderName: 'Bob Smith',
          content: 'Excited to help with the planning! @alice what are the main priorities?',
          timestamp: '2026-03-15T10:05:00Z',
          isEdited: false
        },
        {
          id: 3,
          forumId: forumId,
          senderId: 1,
          senderName: 'Alice Johnson',
          content: 'Great question @bob! We need to focus on venue, catering, and photography first.',
          timestamp: '2026-03-15T10:10:00Z',
          isEdited: false
        }
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedForum) return;

    try {
      const messageData = {
        forumId: selectedForum.id,
        content: newMessage.trim()
      };

      // Mock sending message
      const newMsg = {
        id: messages.length + 1,
        forumId: selectedForum.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        isEdited: false
      };

      setMessages([...messages, newMsg]);
      setNewMessage('');

      // Handle @user mentions
      const mentions = newMessage.match(/@(\w+)/g);
      if (mentions) {
        mentions.forEach(mention => {
          const username = mention.substring(1);
          const mentionedUser = members.find(m => 
            m.name.toLowerCase().replace(/\s+/g, '') === username.toLowerCase()
          );
          if (mentionedUser) {
            // Add to highlighted messages
            setHighlightedMessages(prev => new Set([...prev, newMsg.id]));
            // In real app, send notification to mentioned user
            console.log(`Notifying ${mentionedUser.name}`);
          }
        });
      }
      
      // Handle @everyone mentions
      if (newMessage.includes('@everyone')) {
        // Add to highlighted messages for all members
        setHighlightedMessages(prev => new Set([...prev, newMsg.id]));
        // In real app, send notifications to all members
        console.log('Notifying all members');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleForumSelect = (forum) => {
    setSelectedForum(forum);
    loadForumMessages(forum.id);
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
          member.name.toLowerCase().includes(currentMention.toLowerCase())
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
                          '@' + member.name.toLowerCase().replace(/\s+/g, '') + 
                          ' ' + textAfterCursor;
    
    setNewMessage(newMessageText);
    setShowMentionSuggestions(false);
    
    // Focus back to input and set cursor position
    setTimeout(() => {
      const input = document.querySelector('.message-input');
      input.focus();
      const newCursorPosition = lastAtIndex + member.name.toLowerCase().replace(/\s+/g, '').length + 2;
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
        content: `${currentUser.name} changed their message`,
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
        content: `${currentUser.name} changed the forum title from "${oldName}" to "${newForumName}"`,
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

  const isAdmin = currentUser.role === 'ORGANIZER';
  const isOwnMessage = (message) => message.senderId === currentUser.id;

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
          </div>
          <div className="forums-list">
            {forums.map(forum => (
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
            ))}
          </div>
        </div>

        {/* Center Panel - Messages */}
        <div className="messages-panel">
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
                      {message.senderName.charAt(0).toUpperCase()}
                    </div>
                    <div className="message-info">
                      <span className="message-sender">{message.senderName}</span>
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
                    <div className="mention-avatar">{member.name.charAt(0).toUpperCase()}</div>
                    <div className="mention-info">
                      <div className="mention-name">{member.name}</div>
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
                placeholder="Type a message..."
                className="message-input"
              />
              <button type="submit" className="send-btn">Send</button>
            </form>
          </div>
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
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-info">
                    <span className="member-name">{member.name}</span>
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
