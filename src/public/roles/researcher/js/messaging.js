document.addEventListener('DOMContentLoaded', function() {
  try {
    // DOM Elements
    const todayNotifications = document.getElementById('today-notifications');
    const yesterdayNotifications = document.getElementById('yesterday-notifications');
    const earlierNotifications = document.getElementById('earlier-notifications');
    const searchInput = document.getElementById('search-notifications');
    const filterTags = document.querySelectorAll('.filter-tag');
    const emptyState = document.getElementById('empty-notifications');
    const markAllReadBtn = document.getElementById('mark-all-read');
    const notificationSettingsBtn = document.getElementById('notifications-settings');
    const notificationModal = document.querySelector('.notification-modal');
    const settingsModal = document.querySelector('.settings-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const modalDismissBtn = document.getElementById('modal-dismiss');
    const modalActionBtn = document.getElementById('modal-action');
    const cancelSettingsBtn = document.querySelector('.cancel-settings');
    const notificationSettingsForm = document.getElementById('notification-settings-form');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const paginationInfo = document.getElementById('pagination-info');
    const notificationBadge = document.getElementById('notification-badge');
    
    // Verify critical elements exist
    if (!todayNotifications || !yesterdayNotifications || !earlierNotifications || 
        !searchInput || !notificationModal || !settingsModal) {
      throw new Error('Critical DOM elements not found');
    }

    // State variables
    let messages = [];
    let filteredMessages = [];
    let currentPage = 1;
    let currentFilter = 'all';
    let currentSearchTerm = '';
    let itemsPerPage = 10;
    let currentMessageId = null;
    let socket = null;
    let userId = localStorage.getItem('userId') || 'user-' + Math.random().toString(36).substr(2, 9);
    let pollingInterval = null;
    
    // Message types with colors and icons
    const messageTypes = {
      collaboration: { 
        icon: 'fa-handshake', 
        label: 'Collaboration',
        color: 'var(--info-blue)'
      },
      system: { 
        icon: 'fa-cog', 
        label: 'System',
        color: 'var(--primary-purple)'
      },
      feedback: { 
        icon: 'fa-comment-dots', 
        label: 'Feedback',
        color: 'var(--success-green)'
      },
      assignment: { 
        icon: 'fa-clipboard-list', 
        label: 'Assignment',
        color: 'var(--warning-orange)'
      },
      milestone: { 
        icon: 'fa-flag-checkered', 
        label: 'Milestone',
        color: 'var(--info-blue)'
      },
      funding: { 
        icon: 'fa-dollar-sign', 
        label: 'Funding',
        color: 'var(--success-green)'
      },
      admin: { 
        icon: 'fa-shield-alt', 
        label: 'Admin',
        color: 'var(--danger-red)'
      },
      review: { 
        icon: 'fa-star', 
        label: 'Review',
        color: 'var(--warning-orange)'
      }
    };
    
    // Initialize WebSocket connection
    function initWebSocket() {
      if (socket) {
        socket.close();
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/notifications?userId=${userId}`;
      
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket connection established');
        if (pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;
        }
      };

      socket.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          handleNewNotification(notification);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
        if (!pollingInterval) {
          startPolling();
        }
        // Attempt to reconnect after delay
        setTimeout(initWebSocket, 5000);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (!pollingInterval) {
          startPolling();
        }
      };
    }

    // Fallback polling mechanism
    function startPolling() {
      console.log('Starting polling for notifications');
      checkForNewNotifications();
      pollingInterval = setInterval(checkForNewNotifications, 30000); // Poll every 30 seconds
    }

    // Check for new notifications from server
    async function checkForNewNotifications() {
      try {
        // In a real app, this would fetch from your API endpoint
        // const response = await fetch(`/api/notifications?userId=${userId}`);
        // const data = await response.json();
        
        // For demo purposes, we'll simulate occasional new notifications
        if (Math.random() > 0.7) {
          const mockNotifications = generateMockNotifications(1);
          mockNotifications.forEach(notification => {
            handleNewNotification(notification);
          });
        }
      } catch (error) {
        console.error('Error checking for notifications:', error);
      }
    }

    // Handle new notification from either WS or polling
    function handleNewNotification(notification) {
      // Don't add duplicate notifications
      if (messages.some(msg => msg.id === notification.id)) {
        return;
      }

      const newMessage = {
        id: notification.id || 'msg-' + Date.now(),
        sender: notification.sender || 'System',
        title: notification.title || 'New Notification',
        content: notification.content || 'You have a new notification',
        timestamp: notification.timestamp ? new Date(notification.timestamp) : new Date(),
        unread: true,
        type: notification.type || 'system',
        actionUrl: notification.actionUrl || null,
        priority: notification.priority || 'normal'
      };

      // Add to beginning of array
      messages.unshift(newMessage);
      
      // Update UI
      renderMessages();
      updateNotificationBadge();
      
      // Show desktop notification if enabled and tab is not active
      if (Notification.permission === 'granted' && document.hidden) {
        showDesktopNotification(newMessage);
      }
      
      // Play sound if enabled
      if (localStorage.getItem('notificationSound') !== 'false') {
        playNotificationSound();
      }
      
      saveMessagesToLocalStorage();
    }

    // Show desktop notification
    function showDesktopNotification(message) {
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        return;
      }

      const notification = new Notification(message.title, {
        body: message.content,
        icon: '/images/logo.png'
      });
      
      notification.onclick = () => {
        window.focus();
        openMessageDetail(message);
        notification.close();
      };
    }

    // Play notification sound
    function playNotificationSound() {
      try {
        const sound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
        sound.volume = 0.3;
        sound.play().catch(e => console.log('Notification sound error:', e));
      } catch (e) {
        console.log('Error playing notification sound:', e);
      }
    }

    // Update notification badge count
    function updateNotificationBadge() {
      if (!notificationBadge) return;
      const unreadCount = messages.filter(m => m.unread).length;
      notificationBadge.textContent = unreadCount > 0 ? unreadCount : '';
      notificationBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
      
      // Update document title if there are unread messages
      document.title = unreadCount > 0 
        ? `(${unreadCount}) Notifications - CollabNexus` 
        : 'Notifications - CollabNexus';
    }
    
    // Load messages from server with fallback
    async function loadMessages() {
      try {
        // In a real app, this would fetch from your API endpoint
        // const response = await fetch('/api/notifications');
        // const data = await response.json();
        
        // For demo purposes, we'll use mock data
        const data = generateMockNotifications(8);
        
        messages = data.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          unread: !msg.read
        }));
        
        saveMessagesToLocalStorage();
      } catch (error) {
        console.error('Error loading notifications:', error);
        // Fallback to localStorage if available
        const localMessages = localStorage.getItem('userMessages');
        if (localMessages) {
          messages = JSON.parse(localMessages).map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        } else {
          // Load mock data if no messages found
          messages = generateMockNotifications(5);
        }
      }
      
      renderMessages();
      updateNotificationBadge();
      
      // Initialize real-time updates
      if ('WebSocket' in window) {
        initWebSocket();
      } else {
        startPolling();
      }
      
      // Request notification permission
      if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          console.log('Notification permission:', permission);
        });
      }
    }
    
    // Generate mock notifications for demo purposes
    function generateMockNotifications(count = 3) {
      const now = new Date();
      const types = Object.keys(messageTypes);
      const senders = [
        'Dr. Emily Chen',
        'Prof. James Wilson',
        'Research Committee',
        'System Administrator',
        'Dr. Sarah Johnson',
        'Funding Department'
      ];
      
      const mockNotifications = [];
      
      for (let i = 0; i < count; i++) {
        const hoursAgo = Math.floor(Math.random() * 72); // Up to 3 days ago
        const minutesAgo = Math.floor(Math.random() * 60);
        const timestamp = new Date(now);
        timestamp.setHours(timestamp.getHours() - hoursAgo);
        timestamp.setMinutes(timestamp.getMinutes() - minutesAgo);
        
        const type = types[Math.floor(Math.random() * types.length)];
        const sender = type === 'system' ? 'System' : senders[Math.floor(Math.random() * senders.length)];
        
        mockNotifications.push({
          id: 'mock-' + Date.now() + '-' + i,
          sender: sender,
          title: getMockTitle(type),
          content: getMockContent(type, sender),
          timestamp: timestamp.toISOString(),
          read: Math.random() > 0.5,
          type: type,
          actionUrl: Math.random() > 0.7 ? getMockActionUrl(type) : null
        });
      }
      
      return mockNotifications;
    }
    
    function getMockTitle(type) {
      const titles = {
        collaboration: [
          'New Collaboration Request',
          'Research Partnership Opportunity',
          'Invitation to Collaborate'
        ],
        system: [
          'System Maintenance Scheduled',
          'New Platform Features Available',
          'Account Verification Required'
        ],
        feedback: [
          'Feedback on Your Submission',
          'Review Comments Available',
          'Response to Your Feedback'
        ],
        assignment: [
          'New Review Assignment',
          'Proposal Review Requested',
          'Manuscript Evaluation Needed'
        ],
        milestone: [
          'Project Milestone Reached',
          'Milestone Deadline Approaching',
          'Milestone Completion Approved'
        ],
        funding: [
          'New Funding Opportunity',
          'Grant Application Update',
          'Funding Request Approved'
        ],
        admin: [
          'Administrative Action Required',
          'Account Settings Updated',
          'Important Security Notice'
        ],
        review: [
          'New Peer Review Request',
          'Review Deadline Reminder',
          'Review Feedback Received'
        ]
      };
      
      const typeTitles = titles[type] || ['New Notification'];
      return typeTitles[Math.floor(Math.random() * typeTitles.length)];
    }
    
    function getMockContent(type, sender) {
      const contents = {
        collaboration: [
          `You have been invited by ${sender} to collaborate on a new research project.`,
          `${sender} would like to discuss a potential research partnership with you.`,
          `New collaboration opportunity available from ${sender}. Click to view details.`
        ],
        system: [
          'A system update has been scheduled for tomorrow at 2 AM. The platform will be unavailable for approximately 30 minutes.',
          'New features have been added to the platform. Click here to learn more.',
          'Please verify your email address to complete your account setup.'
        ],
        feedback: [
          `${sender} has provided feedback on your recent submission.`,
          `New comments available on your research proposal from ${sender}.`,
          `${sender} has responded to your feedback on the collaborative project.`
        ],
        assignment: [
          `You have been assigned to review a new research proposal by ${sender}.`,
          `${sender} has requested your evaluation of a submitted manuscript.`,
          'New peer review assignment available. Deadline is in 7 days.'
        ],
        milestone: [
          'Your project "Advanced Quantum Computing" has reached its first milestone.',
          'The deadline for your next milestone is approaching in 3 days.',
          `${sender} has approved the completion of your project milestone.`
        ],
        funding: [
          'New funding opportunity available for research in your field. Application deadline is June 30.',
          'Your grant application has been received and is under review.',
          'Congratulations! Your funding request has been approved.'
        ],
        admin: [
          'Your account security settings have been updated. Please review the changes.',
          'Administrative approval is required for your recent request.',
          'Important security notice: Please update your password.'
        ],
        review: [
          `${sender} has requested your peer review for a new submission.`,
          'Reminder: Your review is due in 2 days. Please submit your evaluation.',
          'The author has responded to your review comments. Click to view.'
        ]
      };
      
      const typeContents = contents[type] || ['You have a new notification.'];
      return typeContents[Math.floor(Math.random() * typeContents.length)];
    }
    
    function getMockActionUrl(type) {
      const urls = {
        collaboration: '/projects/collaborations',
        system: '/account/settings',
        feedback: '/projects/feedback',
        assignment: '/reviews/assignments',
        milestone: '/projects/milestones',
        funding: '/funding/opportunities',
        admin: '/admin/notices',
        review: '/peer-reviews'
      };
      
      return urls[type] || '/notifications';
    }
    
    // Save messages to localStorage
    function saveMessagesToLocalStorage() {
      const messagesToSave = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
        read: !msg.unread
      }));
      localStorage.setItem('userMessages', JSON.stringify(messagesToSave));
    }
    
    // Format timestamp
    function formatTimestamp(timestamp) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const timestampDate = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());
      
      if (timestampDate.getTime() === today.getTime()) {
        // Today, show time
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (timestampDate.getTime() === yesterday.getTime()) {
        // Yesterday, show "Yesterday at [time]"
        return `Yesterday at ${timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        // More than a day ago, show date
        return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    
    // Group messages by date
    function groupMessagesByDate(messagesArray) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const todayMsgs = [];
      const yesterdayMsgs = [];
      const earlierMsgs = [];
      
      messagesArray.forEach(message => {
        const msgDate = new Date(message.timestamp.getFullYear(), message.timestamp.getMonth(), message.timestamp.getDate());
        
        if (msgDate.getTime() === today.getTime()) {
          todayMsgs.push(message);
        } else if (msgDate.getTime() === yesterday.getTime()) {
          yesterdayMsgs.push(message);
        } else {
          earlierMsgs.push(message);
        }
      });
      
      return {
        today: todayMsgs,
        yesterday: yesterdayMsgs,
        earlier: earlierMsgs
      };
    }
    
    // Create message HTML element
    function createMessageElement(message) {
      const messageItem = document.createElement('section');
      messageItem.className = `notification-item ${message.unread ? 'unread' : ''}`;
      messageItem.dataset.id = message.id;
      messageItem.dataset.type = message.type;
      
      const typeInfo = messageTypes[message.type] || { 
        icon: 'fa-envelope', 
        label: 'Message',
        color: 'var(--primary-purple)'
      };
      
      messageItem.innerHTML = `
        <section class="notification-icon" style="background-color: ${typeInfo.color}">
          <i class="fas ${typeInfo.icon}"></i>
        </section>
        <section class="notification-content">
          <h4 class="notification-title">${message.title}</h4>
          <p class="notification-message">From: ${message.sender || 'System'}</p>
          <section class="notification-meta">
            <nav class="notification-timestamp">${formatTimestamp(message.timestamp)}</nav>
            <nav class="notification-type">${typeInfo.label}</nav>
          </section>
        </section>
      `;
      
      messageItem.addEventListener('click', () => openMessageDetail(message));
      return messageItem;
    }
    
    // Render messages by date groups
    function renderMessages() {
      todayNotifications.innerHTML = '';
      yesterdayNotifications.innerHTML = '';
      earlierNotifications.innerHTML = '';
      
      applyFiltersAndSearch();
      
      const paginatedMessages = getPaginatedMessages();
      const groupedMsgs = groupMessagesByDate(paginatedMessages);
      
      document.getElementById('today-section').style.display = groupedMsgs.today.length ? 'block' : 'none';
      document.getElementById('yesterday-section').style.display = groupedMsgs.yesterday.length ? 'block' : 'none';
      document.getElementById('earlier-section').style.display = groupedMsgs.earlier.length ? 'block' : 'none';
      
      emptyState.style.display = 
        (groupedMsgs.today.length || groupedMsgs.yesterday.length || groupedMsgs.earlier.length) ? 
        'none' : 'flex';
      
      groupedMsgs.today.forEach(message => {
        todayNotifications.appendChild(createMessageElement(message));
      });
      
      groupedMsgs.yesterday.forEach(message => {
        yesterdayNotifications.appendChild(createMessageElement(message));
      });
      
      groupedMsgs.earlier.forEach(message => {
        earlierNotifications.appendChild(createMessageElement(message));
      });
      
      updatePagination();
    }
    
    // Apply filters and search
    function applyFiltersAndSearch() {
      filteredMessages = [...messages];
      
      if (currentFilter !== 'all') {
        if (currentFilter === 'unread') {
          filteredMessages = filteredMessages.filter(m => m.unread);
        } else {
          filteredMessages = filteredMessages.filter(m => m.type === currentFilter);
        }
      }
      
      if (currentSearchTerm) {
        const searchLower = currentSearchTerm.toLowerCase();
        filteredMessages = filteredMessages.filter(m => 
          m.title.toLowerCase().includes(searchLower) || 
          m.content.toLowerCase().includes(searchLower) ||
          (m.sender && m.sender.toLowerCase().includes(searchLower))
        );
      }
      
      currentPage = 1;
    }
    
    // Get paginated messages
    function getPaginatedMessages() {
      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      return filteredMessages.slice(startIdx, endIdx);
    }
    
    // Update pagination controls
    function updatePagination() {
      const totalPages = Math.max(1, Math.ceil(filteredMessages.length / itemsPerPage));
      paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;
      prevPageBtn.disabled = currentPage <= 1;
      nextPageBtn.disabled = currentPage >= totalPages;
    }
    
    // Open message detail modal
    function openMessageDetail(message) {
      currentMessageId = message.id;
      
      document.getElementById('modal-notification-title').textContent = message.title;
      document.getElementById('modal-notification-time').textContent = formatTimestamp(message.timestamp);
      
      const modalIcon = document.getElementById('modal-notification-icon');
      const typeInfo = messageTypes[message.type] || { icon: 'fa-envelope', label: 'Message' };
      modalIcon.className = `notification-icon`;
      modalIcon.innerHTML = `<i class="fas ${typeInfo.icon}"></i>`;
      modalIcon.style.backgroundColor = typeInfo.color || 'var(--primary-purple)';
      
      const detailContent = document.getElementById('modal-notification-content');
      detailContent.innerHTML = `
        <p><strong>From:</strong> ${message.sender || 'System'}</p>
        <p><strong>Date:</strong> ${message.timestamp.toLocaleString()}</p>
        <section class="message-content">
          ${message.content}
        </section>
      `;
      
      // Show action button if there's an action URL
      if (message.actionUrl) {
        modalActionBtn.style.display = 'inline-flex';
        modalActionBtn.textContent = getActionButtonText(message.type);
        modalActionBtn.onclick = () => {
          window.location.href = message.actionUrl;
        };
      } else {
        modalActionBtn.style.display = 'none';
      }
      
      if (message.unread) {
        markMessageAsRead(message.id);
      }
      
      notificationModal.showModal();
    }
    
    function getActionButtonText(type) {
      const actions = {
        collaboration: 'View Collaboration',
        system: 'View Details',
        feedback: 'View Feedback',
        assignment: 'View Assignment',
        milestone: 'View Milestone',
        funding: 'View Funding',
        admin: 'View Notice',
        review: 'View Review'
      };
      
      return actions[type] || 'Take Action';
    }
    
    // Mark message as read
    function markMessageAsRead(messageId) {
      const msgIndex = messages.findIndex(m => m.id === messageId);
      if (msgIndex !== -1 && messages[msgIndex].unread) {
        messages[msgIndex].unread = false;
        
        const msgElement = document.querySelector(`.notification-item[data-id="${messageId}"]`);
        if (msgElement) {
          msgElement.classList.remove('unread');
        }
        
        saveMessagesToLocalStorage();
        updateNotificationBadge();
      }
    }
    
    // Mark all messages as read
    function markAllAsRead() {
      let hasUnreadMessages = false;
      
      messages.forEach(message => {
        if (message.unread) {
          message.unread = false;
          hasUnreadMessages = true;
        }
      });
      
      if (hasUnreadMessages) {
        saveMessagesToLocalStorage();
        renderMessages();
        updateNotificationBadge();
        // In a real app, you would also notify the server
        // fetch('/api/notifications/mark-all-read', { method: 'POST' });
      }
    }
    
    // Close modals
    function closeModals() {
      notificationModal.close();
      settingsModal.close();
    }
    
    // Initialize the page
    function initialize() {
      loadMessages();
      setupEventListeners();
      
      // Request notification permission if not already determined
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      // For demo purposes, simulate occasional new notifications
      setInterval(() => {
        if (Math.random() > 0.8) { // 20% chance of new notification
          const mockNotifications = generateMockNotifications(1);
          mockNotifications.forEach(notification => {
            handleNewNotification(notification);
          });
        }
      }, 60000); // Check every minute
    }
    
    // Set up event listeners
    function setupEventListeners() {
      // Search input
      searchInput.addEventListener('input', function(e) {
        currentSearchTerm = e.target.value.trim();
        renderMessages();
      });
      
      // Filter tags
      filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
          filterTags.forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          currentFilter = this.getAttribute('data-filter');
          renderMessages();
        });
      });
      
      // Mark all as read button
      markAllReadBtn.addEventListener('click', markAllAsRead);
      
      // Notification settings button
      notificationSettingsBtn.addEventListener('click', function() {
        settingsModal.showModal();
      });
      
      // Close modal buttons
      closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModals);
      });
      
      // Dismiss notification button
      modalDismissBtn.addEventListener('click', closeModals);
      
      // Cancel settings button
      cancelSettingsBtn.addEventListener('click', closeModals);
      
      // Pagination buttons
      prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
          currentPage--;
          renderMessages();
        }
      });
      
      nextPageBtn.addEventListener('click', function() {
        const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
        if (currentPage < totalPages) {
          currentPage++;
          renderMessages();
        }
      });
      
      // Settings form submission
      notificationSettingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Save settings to localStorage
        const settings = {
          emailNewAssignments: document.getElementById('email-new-assignments').checked,
          emailDeadlines: document.getElementById('email-deadlines').checked,
          emailFeedback: document.getElementById('email-feedback').checked,
          systemAll: document.getElementById('system-all').checked,
          systemSound: document.getElementById('system-sound').checked
        };
        
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
        localStorage.setItem('notificationSound', settings.systemSound);
        
        alert('Notification settings saved successfully');
        closeModals();
      });
      
      // Load saved settings
      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        document.getElementById('email-new-assignments').checked = settings.emailNewAssignments !== false;
        document.getElementById('email-deadlines').checked = settings.emailDeadlines !== false;
        document.getElementById('email-feedback').checked = settings.emailFeedback !== false;
        document.getElementById('system-all').checked = settings.systemAll !== false;
        document.getElementById('system-sound').checked = settings.systemSound !== false;
      }
      
      // Update badge when tab becomes visible
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          updateNotificationBadge();
          document.title = 'Notifications - CollabNexus';
        }
      });
      
      // Logout button
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
          e.preventDefault();
          if (confirm('Are you sure you want to log out?')) {
            // Close WebSocket connection
            if (socket) {
              socket.close();
            }
            if (pollingInterval) {
              clearInterval(pollingInterval);
            }
            
            localStorage.removeItem('userToken');
            window.location.replace('../../../login.html');
          }
        });
      }
    }
    
    // Start the application
    initialize();

  } catch (error) {
    console.error('Error in notification center:', error);
    alert('There was an error initializing the notification center. Please check the console for details.');
  }
});
