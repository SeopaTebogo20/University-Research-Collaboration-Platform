document.addEventListener('DOMContentLoaded', function() {
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
    
    // State variables
    let notifications = [];
    let filteredNotifications = [];
    let currentPage = 1;
    let currentFilter = 'all';
    let currentSearchTerm = '';
    let itemsPerPage = 10;
    let currentNotificationId = null;
    
    // Load notification settings from localStorage or use defaults
    const settings = JSON.parse(localStorage.getItem('notificationSettings')) || {
        email: {
            newAssignments: true,
            deadlines: true,
            feedback: true
        },
        system: {
            all: true,
            sound: true
        }
    };

    // Mock notification data
    function generateMockNotifications() {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastWeek = new Date(now);
        lastWeek.setDate(lastWeek.getDate() - 7);
        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        return [
            {
                id: 'n1',
                title: 'New Proposal Assigned',
                message: 'You have been assigned a new research proposal "Novel Approaches to Quantum Computing" by Dr. Emily Chen.',
                timestamp: new Date(now.getTime() - 1000 * 60 * 30), // 30 minutes ago
                type: 'assignment',
                unread: true,
                actionLabel: 'Review Now',
                actionUrl: 'proposals.html'
            },
            {
                id: 'n2',
                title: 'Deadline Reminder',
                message: 'Review deadline for "Machine Learning in Healthcare" is approaching. Please submit your evaluation by tomorrow.',
                timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
                type: 'deadline',
                unread: true,
                actionLabel: 'Complete Review',
                actionUrl: 'proposals.html'
            },
            {
                id: 'n3',
                title: 'System Maintenance',
                message: 'CollabNexus will undergo scheduled maintenance this weekend. The platform may be unavailable from 2 AM to 5 AM EST on Sunday.',
                timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 5), // 5 hours ago
                type: 'system',
                unread: false,
                actionLabel: null,
                actionUrl: null
            },
            {
                id: 'n4',
                title: 'Feedback Response',
                message: 'Dr. Wilson has responded to your feedback on "Advancements in Neural Networks". Click to view the response.',
                timestamp: yesterday,
                type: 'feedback',
                unread: false,
                actionLabel: 'View Response',
                actionUrl: 'history.html'
            },
            {
                id: 'n5',
                title: 'Review Approved',
                message: 'Your review for "Climate Change Mitigation Strategies" has been approved by the administration.',
                timestamp: yesterday,
                type: 'system',
                unread: false,
                actionLabel: 'View Details',
                actionUrl: 'history.html'
            },
            {
                id: 'n6',
                title: 'New Feature Available',
                message: 'We\'ve added a new feature to help streamline your review process. Check out the new dashboard analytics!',
                timestamp: lastWeek,
                type: 'system',
                unread: false,
                actionLabel: 'Explore Feature',
                actionUrl: 'dashboard.html'
            },
            {
                id: 'n7',
                title: 'Quarterly Review Performance',
                message: 'Your quarterly review performance metrics are now available. You completed 12 reviews with an average rating of 4.8/5.',
                timestamp: lastWeek,
                type: 'system',
                unread: false,
                actionLabel: 'View Metrics',
                actionUrl: 'profile.html'
            },
            {
                id: 'n8',
                title: 'Research Conference Invitation',
                message: 'Based on your expertise, you\'ve been invited to attend the Annual Research Innovation Conference as a panel reviewer.',
                timestamp: twoWeeksAgo,
                type: 'system',
                unread: false,
                actionLabel: 'RSVP',
                actionUrl: '#'
            }
        ];
    }

    // Format timestamp
    function formatTimestamp(timestamp) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const timestampDate = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());
        
        if (timestamp > today) {
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

    // Group notifications by date
    function groupNotificationsByDate(notificationsArray) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const todayNotifs = [];
        const yesterdayNotifs = [];
        const earlierNotifs = [];
        
        notificationsArray.forEach(notification => {
            const notifDate = new Date(notification.timestamp.getFullYear(), notification.timestamp.getMonth(), notification.timestamp.getDate());
            
            if (notifDate.getTime() === today.getTime()) {
                todayNotifs.push(notification);
            } else if (notifDate.getTime() === yesterday.getTime()) {
                yesterdayNotifs.push(notification);
            } else {
                earlierNotifs.push(notification);
            }
        });
        
        return {
            today: todayNotifs,
            yesterday: yesterdayNotifs,
            earlier: earlierNotifs
        };
    }

    // Create notification HTML
    function createNotificationElement(notification) {
        const notifItem = document.createElement('div');
        notifItem.className = `notification-item ${notification.unread ? 'unread' : ''}`;
        notifItem.dataset.id = notification.id;
        notifItem.dataset.type = notification.type;
        
        notifItem.innerHTML = `
            <div class="notification-icon ${notification.type}">
                <i class="fas ${getIconForType(notification.type)}"></i>
            </div>
            <div class="notification-content">
                <h4 class="notification-title">${notification.title}</h4>
                <p class="notification-message">${notification.message}</p>
                <div class="notification-meta">
                    <span class="notification-timestamp">${formatTimestamp(notification.timestamp)}</span>
                </div>
            </div>
        `;
        
        // Add click event to open the notification detail modal
        notifItem.addEventListener('click', () => openNotificationDetail(notification));
        
        return notifItem;
    }

    // Get icon for notification type
    function getIconForType(type) {
        switch (type) {
            case 'assignment':
                return 'fa-clipboard-list';
            case 'deadline':
                return 'fa-clock';
            case 'feedback':
                return 'fa-comment-dots';
            case 'system':
            default:
                return 'fa-bell';
        }
    }

    // Render notifications by date groups
    function renderNotifications() {
        // Clear all containers
        todayNotifications.innerHTML = '';
        yesterdayNotifications.innerHTML = '';
        earlierNotifications.innerHTML = '';
        
        // Apply filters and search before displaying
        applyFiltersAndSearch();
        
        // Get paginated subset
        const paginatedNotifications = getPaginatedNotifications();
        
        // Group by date
        const groupedNotifs = groupNotificationsByDate(paginatedNotifications);
        
        // Hide date sections if empty
        document.getElementById('today-section').style.display = groupedNotifs.today.length ? 'block' : 'none';
        document.getElementById('yesterday-section').style.display = groupedNotifs.yesterday.length ? 'block' : 'none';
        document.getElementById('earlier-section').style.display = groupedNotifs.earlier.length ? 'block' : 'none';
        
        // Show empty state if all sections are empty
        emptyState.style.display = 
            (groupedNotifs.today.length || groupedNotifs.yesterday.length || groupedNotifs.earlier.length) ? 
            'none' : 'flex';
        
        // Render notifications in each section
        groupedNotifs.today.forEach(notification => {
            todayNotifications.appendChild(createNotificationElement(notification));
        });
        
        groupedNotifs.yesterday.forEach(notification => {
            yesterdayNotifications.appendChild(createNotificationElement(notification));
        });
        
        groupedNotifs.earlier.forEach(notification => {
            earlierNotifications.appendChild(createNotificationElement(notification));
        });
        
        // Update pagination
        updatePagination();
    }

    // Apply filters and search
    function applyFiltersAndSearch() {
        filteredNotifications = [...notifications];
        
        // Apply type filter
        if (currentFilter !== 'all') {
            if (currentFilter === 'unread') {
                filteredNotifications = filteredNotifications.filter(n => n.unread);
            } else {
                filteredNotifications = filteredNotifications.filter(n => n.type === currentFilter);
            }
        }
        
        // Apply search
        if (currentSearchTerm) {
            const searchLower = currentSearchTerm.toLowerCase();
            filteredNotifications = filteredNotifications.filter(n => 
                n.title.toLowerCase().includes(searchLower) || 
                n.message.toLowerCase().includes(searchLower)
            );
        }
        
        // Reset to page 1 when filters change
        currentPage = 1;
    }

    // Get paginated subset of notifications
    function getPaginatedNotifications() {
        const startIdx = (currentPage - 1) * itemsPerPage;
        const endIdx = startIdx + itemsPerPage;
        return filteredNotifications.slice(startIdx, endIdx);
    }

    // Update pagination controls and info
    function updatePagination() {
        const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / itemsPerPage));
        
        paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    }

    // Open notification detail modal
    function openNotificationDetail(notification) {
        currentNotificationId = notification.id;
        
        // Set modal content
        document.getElementById('modal-notification-title').textContent = notification.title;
        document.getElementById('modal-notification-time').textContent = formatTimestamp(notification.timestamp);
        
        const modalIcon = document.getElementById('modal-notification-icon');
        modalIcon.className = `notification-icon ${notification.type}`;
        modalIcon.innerHTML = `<i class="fas ${getIconForType(notification.type)}"></i>`;
        
        const detailContent = document.getElementById('modal-notification-content');
        detailContent.innerHTML = `
            <p>${notification.message}</p>
            <p>This notification was sent to you as part of your reviewer responsibilities at CollabNexus Research Hub.</p>
        `;
        
        // Set action button or hide it if no action
        if (notification.actionLabel && notification.actionUrl) {
            modalActionBtn.textContent = notification.actionLabel;
            modalActionBtn.style.display = '';
            modalActionBtn.onclick = () => {
                window.location.href = notification.actionUrl;
            };
        } else {
            modalActionBtn.style.display = 'none';
        }
        
        // Mark as read if unread
        if (notification.unread) {
            markNotificationAsRead(notification.id);
        }
        
        // Show modal
        notificationModal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }

    // Mark notification as read
    function markNotificationAsRead(notificationId) {
        const notifIndex = notifications.findIndex(n => n.id === notificationId);
        if (notifIndex !== -1 && notifications[notifIndex].unread) {
            notifications[notifIndex].unread = false;
            
            // Update UI
            const notifElement = document.querySelector(`.notification-item[data-id="${notificationId}"]`);
            if (notifElement) {
                notifElement.classList.remove('unread');
            }
        }
    }

    // Mark all notifications as read
    function markAllAsRead() {
        let hasUnreadNotifications = false;
        
        notifications.forEach(notification => {
            if (notification.unread) {
                notification.unread = false;
                hasUnreadNotifications = true;
            }
        });
        
        if (hasUnreadNotifications) {
            renderNotifications();
            alert('All notifications marked as read');
        }
    }

    // Close modals
    function closeModals() {
        notificationModal.style.display = 'none';
        settingsModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }

    // Apply notification settings
    function applySettings() {
        // Update checkbox states
        document.getElementById('email-new-assignments').checked = settings.email.newAssignments;
        document.getElementById('email-deadlines').checked = settings.email.deadlines;
        document.getElementById('email-feedback').checked = settings.email.feedback;
        document.getElementById('system-all').checked = settings.system.all;
        document.getElementById('system-sound').checked = settings.system.sound;
    }

    // Save notification settings
    function saveSettings() {
        settings.email.newAssignments = document.getElementById('email-new-assignments').checked;
        settings.email.deadlines = document.getElementById('email-deadlines').checked;
        settings.email.feedback = document.getElementById('email-feedback').checked;
        settings.system.all = document.getElementById('system-all').checked;
        settings.system.sound = document.getElementById('system-sound').checked;
        
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
    }

    // Event Listeners
    
    // Search input
    searchInput.addEventListener('input', function(e) {
        currentSearchTerm = e.target.value.trim();
        renderNotifications();
    });
    
    // Filter tags
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            // Remove active class from all filters
            filterTags.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked filter
            this.classList.add('active');
            
            // Update current filter
            currentFilter = this.getAttribute('data-filter');
            
            // Re-render notifications
            renderNotifications();
        });
    });
    
    // Mark all as read button
    markAllReadBtn.addEventListener('click', markAllAsRead);
    
    // Notification settings button
    notificationSettingsBtn.addEventListener('click', function() {
        applySettings();
        settingsModal.style.display = 'flex';
        document.body.classList.add('modal-open');
    });
    
    // Close modal buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Dismiss notification button
    modalDismissBtn.addEventListener('click', function() {
        closeModals();
    });
    
    // Cancel settings button
    cancelSettingsBtn.addEventListener('click', closeModals);
    
    // Settings form submission
    notificationSettingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveSettings();
        closeModals();
        alert('Notification settings saved successfully');
    });
    
    // Pagination buttons
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderNotifications();
        }
    });
    
    nextPageBtn.addEventListener('click', function() {
        const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderNotifications();
        }
    });
    // Set up event listeners
    function setupEventListeners() {
        document.getElementById('logout-btn').addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to log out?')) {
                // Clear session/local storage
                localStorage.removeItem('reviewerName');
                localStorage.removeItem('reviewerToken');

                // Redirect to login
                window.location.href = '/login';
            }
        });
    }
    
    // Initialize
    notifications = generateMockNotifications();
    renderNotifications();
});
