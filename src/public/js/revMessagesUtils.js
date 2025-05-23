// revMessagesUtils.js

// Helper functions for notifications/messages display and processing

/**
 * Gets the appropriate CSS class for a notification based on its status
 * @param {boolean} isUnread - Whether the notification is unread
 * @returns {string} The CSS class name
 */
function getNotificationStatusClass(isUnread) {
    return isUnread ? 'unread' : 'read';
}

/**
 * Gets the appropriate icon class for a notification type
 * @param {string} type - Notification type (assignment, deadline, feedback, system)
 * @returns {string} Font Awesome icon class
 */
function getNotificationIcon(type) {
    const iconMap = {
        'assignment': 'fa-clipboard-list',
        'deadline': 'fa-clock',
        'feedback': 'fa-comment-dots',
        'system': 'fa-bell'
    };
    return iconMap[type.toLowerCase()] || 'fa-bell';
}

/**
 * Formats a timestamp into a user-friendly relative time string
 * @param {Date} timestamp - The timestamp to format
 * @returns {string} Formatted time string
 */
function formatNotificationTime(timestamp) {
    if (!(timestamp instanceof Date)) {
        timestamp = new Date(timestamp);
    }

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

/**
 * Groups notifications by date (today, yesterday, earlier)
 * @param {Array} notifications - Array of notification objects
 * @returns {Object} Object with grouped notifications {today: [], yesterday: [], earlier: []}
 */
function groupNotificationsByDate(notifications) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const result = {
        today: [],
        yesterday: [],
        earlier: []
    };
    
    notifications.forEach(notification => {
        const notifDate = new Date(notification.timestamp.getFullYear(), 
                                 notification.timestamp.getMonth(), 
                                 notification.timestamp.getDate());
        
        if (notifDate.getTime() === today.getTime()) {
            result.today.push(notification);
        } else if (notifDate.getTime() === yesterday.getTime()) {
            result.yesterday.push(notification);
        } else {
            result.earlier.push(notification);
        }
    });
    
    return result;
}

/**
 * Filters notifications based on type and search term
 * @param {Array} notifications - Array of notification objects
 * @param {string} filterType - Type to filter by ('all', 'unread', or specific type)
 * @param {string} searchTerm - Search term to filter by
 * @returns {Array} Filtered array of notifications
 */
function filterNotifications(notifications, filterType, searchTerm = '') {
    let filtered = [...notifications];
    
    // Apply type filter
    if (filterType !== 'all') {
        if (filterType === 'unread') {
            filtered = filtered.filter(n => n.unread);
        } else {
            filtered = filtered.filter(n => n.type === filterType);
        }
    }
    
    // Apply search
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(n => 
            n.title.toLowerCase().includes(searchLower) || 
            n.message.toLowerCase().includes(searchLower)
        );
    }
    
    return filtered;
}

/**
 * Gets paginated subset of notifications
 * @param {Array} notifications - Array of notification objects
 * @param {number} currentPage - Current page number (1-based)
 * @param {number} itemsPerPage - Number of items per page
 * @returns {Array} Paginated subset of notifications
 */
function getPaginatedNotifications(notifications, currentPage, itemsPerPage) {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    return notifications.slice(startIdx, endIdx);
}

module.exports = {
    getNotificationStatusClass,
    getNotificationIcon,
    formatNotificationTime,
    groupNotificationsByDate,
    filterNotifications,
    getPaginatedNotifications
};