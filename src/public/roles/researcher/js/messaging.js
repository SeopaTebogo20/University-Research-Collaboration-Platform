
// Store for contacts and messages
let contacts = [];
let activeContact = null;
let conversations = {};

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the page
  loadContacts();
  
  // Event Listeners
  document.getElementById('send-message').addEventListener('click', sendMessage);
  document.getElementById('message-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Search input
  const searchInput = document.querySelector('.contacts-search-input');
  searchInput.addEventListener('input', function() {
    filterContacts(this.value);
  });
});

// Load contacts
async function loadContacts() {
  try {
    // In a real application, this would fetch from an API
    // For demo, we'll use mock data
    const mockContacts = [
      {
        id: "c1",
        name: "Dr. Emily Chen",
        avatar: "EC",
        lastMessage: "I'll review your manuscript draft this weekend.",
        lastMessageTime: "10:30 AM",
        unreadCount: 2,
        online: true
      },
      {
        id: "c2",
        name: "Prof. Michael Rodriguez",
        avatar: "MR",
        lastMessage: "The findings from the coral reef study are promising.",
        lastMessageTime: "Yesterday",
        unreadCount: 0,
        online: false
      },
      {
        id: "c3",
        name: "Dr. Sarah Kim",
        avatar: "SK",
        lastMessage: "I'll send you the neural network architecture diagram tomorrow.",
        lastMessageTime: "Apr 15",
        unreadCount: 0,
        online: true
      },
      {
        id: "c4",
        name: "Dr. James Wilson",
        avatar: "JW",
        lastMessage: "Let's schedule a meeting to discuss the AI ethics paper.",
        lastMessageTime: "Apr 14",
        unreadCount: 5,
        online: false
      },
      {
        id: "c5",
        name: "Dr. Lisa Martinez",
        avatar: "LM",
        lastMessage: "The gene sequencing results have arrived.",
        lastMessageTime: "Apr 12",
        unreadCount: 0,
        online: true
      }
    ];
    
    // Generate mock conversations
    mockContacts.forEach(contact => {
      conversations[contact.id] = generateMockConversation(contact);
    });
    
    contacts = mockContacts;
    renderContacts();
  } catch (error) {
    console.error('Error loading contacts:', error);
    showToast('error', 'Error', 'Failed to load contacts. Please try again.');
  }
}

// Generate a mock conversation
function generateMockConversation(contact) {
  const conversation = [];
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Create a date for messages from a couple of days ago
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  // Add a date marker
  conversation.push({
    type: 'date',
    date: formatDate(twoDaysAgo)
  });
  
  // Add messages from two days ago
  conversation.push({
    id: `msg-${contact.id}-1`,
    sender: 'them',
    content: "Hi there! I've been looking at the research proposal you sent and I have some thoughts.",
    time: `${formatTime(twoDaysAgo.setHours(9, 30))}`
  });
  
  conversation.push({
    id: `msg-${contact.id}-2`,
    sender: 'me',
    content: "Great! I'd love to hear your feedback on it.",
    time: `${formatTime(twoDaysAgo.setHours(9, 45))}`
  });
  
  conversation.push({
    id: `msg-${contact.id}-3`,
    sender: 'them',
    content: "The methodology section looks solid, but I think we could strengthen the literature review. I'll send you some papers that might be helpful.",
    time: `${formatTime(twoDaysAgo.setHours(10, 0))}`
  });
  
  // Add a date marker for yesterday
  conversation.push({
    type: 'date',
    date: formatDate(yesterday)
  });
  
  conversation.push({
    id: `msg-${contact.id}-4`,
    sender: 'them',
    content: "I've attached those papers I mentioned. The one by Johnson et al. is particularly relevant to our research questions.",
    time: `${formatTime(yesterday.setHours(14, 15))}`
  });
  
  conversation.push({
    id: `msg-${contact.id}-5`,
    sender: 'me',
    content: "Thanks for sending these! I'll review them and incorporate the relevant findings into our literature review. Do you think we should consider adding a section on methodological limitations?",
    time: `${formatTime(yesterday.setHours(15, 0))}`
  });
  
  // Add a date marker for today
  conversation.push({
    type: 'date',
    date: "Today"
  });
  
  conversation.push({
    id: `msg-${contact.id}-6`,
    sender: 'them',
    content: contact.lastMessage,
    time: contact.lastMessageTime
  });
  
  return conversation;
}

// Render contacts
function renderContacts(filtered = null) {
  const contactsList = document.getElementById('contacts-list');
  contactsList.innerHTML = '';
  
  const contactsToRender = filtered || contacts;
  
  if (contactsToRender.length === 0) {
    contactsList.innerHTML = `
      <div class="p-4 text-center text-gray-500">
        No contacts found.
      </div>
    `;
    return;
  }
  
  contactsToRender.forEach(contact => {
    const contactItem = document.createElement('div');
    contactItem.className = `contact-item ${activeContact && activeContact.id === contact.id ? 'active' : ''}`;
    contactItem.setAttribute('data-id', contact.id);
    contactItem.innerHTML = `
      <div class="contact-avatar" style="background-color: var(--research-${contact.online ? 'primary' : 'dark'});">
        ${contact.avatar}
      </div>
      <div class="contact-info">
        <div class="contact-name">${contact.name}</div>
        <div class="contact-last-message">${contact.lastMessage}</div>
      </div>
      <div class="contact-meta">
        <div class="contact-time">${contact.lastMessageTime}</div>
        ${contact.unreadCount > 0 ? `<div class="contact-unread">${contact.unreadCount}</div>` : ''}
      </div>
    `;
    
    contactsList.appendChild(contactItem);
    
    // Add event listener for selecting contact
    contactItem.addEventListener('click', () => {
      selectContact(contact);
    });
  });
}

// Filter contacts
function filterContacts(query) {
  if (!query) {
    renderContacts();
    return;
  }
  
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(query.toLowerCase()) ||
    contact.lastMessage.toLowerCase().includes(query.toLowerCase())
  );
  
  renderContacts(filteredContacts);
}

// Select contact and load conversation
function selectContact(contact) {
  // Update active contact
  if (activeContact) {
    document.querySelector(`.contact-item[data-id="${activeContact.id}"]`).classList.remove('active');
  }
  
  activeContact = contact;
  document.querySelector(`.contact-item[data-id="${contact.id}"]`).classList.add('active');
  
  // Reset unread count
  if (contact.unreadCount > 0) {
    contact.unreadCount = 0;
    document.querySelector(`.contact-item[data-id="${contact.id}"] .contact-unread`)?.remove();
  }
  
  // Update chat header
  document.getElementById('chat-avatar').innerHTML = contact.avatar;
  document.getElementById('chat-name').textContent = contact.name;
  document.getElementById('chat-status').textContent = contact.online ? 'Online' : 'Offline';
  
  // Show message input area
  document.getElementById('message-input-area').style.display = 'flex';
  
  // Load conversation
  loadConversation(contact.id);
}

// Load conversation
function loadConversation(contactId) {
  const messagesContainer = document.getElementById('messages-container');
  messagesContainer.innerHTML = '';
  
  // Hide empty state
  document.getElementById('empty-chat-state').style.display = 'none';
  
  // Get conversation
  const conversation = conversations[contactId];
  
  conversation.forEach(item => {
    if (item.type === 'date') {
      // Render date marker
      const dateMarker = document.createElement('div');
      dateMarker.className = 'message-date';
      dateMarker.textContent = item.date;
      messagesContainer.appendChild(dateMarker);
    } else {
      // Render message
      const messageElement = document.createElement('div');
      messageElement.className = `message ${item.sender === 'me' ? 'sent' : 'received'}`;
      messageElement.innerHTML = `
        <div class="message-content">${item.content}</div>
        <div class="message-time">${item.time}</div>
      `;
      messagesContainer.appendChild(messageElement);
    }
  });
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message
function sendMessage() {
  if (!activeContact) return;
  
  const messageInput = document.getElementById('message-input');
  const messageContent = messageInput.value.trim();
  
  if (!messageContent) return;
  
  // Clear input
  messageInput.value = '';
  
  // Generate message object
  const now = new Date();
  const message = {
    id: `msg-${activeContact.id}-${Date.now()}`,
    sender: 'me',
    content: messageContent,
    time: formatTime(now)
  };
  
  // Add message to conversation
  const conversation = conversations[activeContact.id];
  
  // Check if we need to add a date marker
  const lastItem = conversation[conversation.length - 1];
  if (lastItem.type === 'date' && lastItem.date !== 'Today') {
    conversation.push({
      type: 'date',
      date: 'Today'
    });
  }
  
  conversation.push(message);
  
  // Update contact's last message
  activeContact.lastMessage = messageContent;
  activeContact.lastMessageTime = 'Just now';
  
  // Re-render contacts
  renderContacts();
  
  // Re-render conversation
  loadConversation(activeContact.id);
  
  // Simulate reply after a delay (for demo purposes)
  setTimeout(() => {
    simulateReply(activeContact.id);
  }, 3000);
}

// Simulate reply (for demo purposes)
function simulateReply(contactId) {
  // Generate a random reply
  const replies = [
    "That sounds interesting. Let's discuss it further in our next meeting.",
    "I agree with your approach. Let me know if you need any additional resources.",
    "Thanks for the update. I'll review the materials and get back to you soon.",
    "Great progress! Keep up the good work, and let me know if you encounter any challenges.",
    "I have a few questions about this. Could we schedule a quick call later this week?"
  ];
  
  const randomReply = replies[Math.floor(Math.random() * replies.length)];
  
  // Generate message object
  const now = new Date();
  const message = {
    id: `msg-${contactId}-${Date.now()}`,
    sender: 'them',
    content: randomReply,
    time: formatTime(now)
  };
  
  // Add message to conversation
  conversations[contactId].push(message);
  
  // Update contact's last message
  const contact = contacts.find(c => c.id === contactId);
  if (contact) {
    contact.lastMessage = randomReply;
    contact.lastMessageTime = 'Just now';
    
    // If not the active contact, increment unread count
    if (!activeContact || activeContact.id !== contactId) {
      contact.unreadCount = (contact.unreadCount || 0) + 1;
    }
    
    // Re-render contacts
    renderContacts();
    
    // Re-render conversation if it's the active contact
    if (activeContact && activeContact.id === contactId) {
      loadConversation(contactId);
    } else {
      // Show notification
      showToast('info', 'New Message', `${contact.name} just sent you a message.`);
    }
  }
}

// Helper functions
function formatDate(date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }
}

function formatTime(date) {
  if (typeof date === 'string') return date;
  
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

// Toast notification function
function showToast(type, title, message) {
  const toastContainer = document.querySelector('.toast-container');
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas ${getToastIcon(type)}"></i>
    </div>
    <div class="toast-content">
      <h3 class="toast-title">${title}</h3>
      <p class="toast-message">${message}</p>
    </div>
    <button class="toast-close">&times;</button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Activate toast with a slight delay for animation
  setTimeout(() => {
    toast.classList.add('active');
  }, 10);
  
  // Set up event listener for close button
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.remove('active');
    setTimeout(() => {
      toast.remove();
    }, 300); // Wait for animation to complete
  });
  
  // Auto-remove toast after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) { // Check if toast is still in the DOM
      toast.classList.remove('active');
      setTimeout(() => {
        if (toast.parentNode) { // Check again before removing
          toast.remove();
        }
      }, 300);
    }
  }, 5000);
}

// Get icon class for toast type
function getToastIcon(type) {
  switch (type) {
    case 'success': return 'fa-check-circle';
    case 'error': return 'fa-times-circle';
    case 'warning': return 'fa-exclamation-triangle';
    case 'info': return 'fa-info-circle';
    default: return 'fa-info-circle';
  }
}
