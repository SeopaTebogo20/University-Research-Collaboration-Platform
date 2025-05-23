// admMessagesUtils.js

// Helper functions for notification/message management
function getNotificationTypeClass(type) {
    if (!type) return 'notification-default';
    
    switch(type.toLowerCase()) {
        case 'assignment': return 'notification-assignment';
        case 'deadline': return 'notification-deadline';
        case 'feedback': return 'notification-feedback';
        case 'system': return 'notification-system';
        default: return 'notification-default';
    }
}

function getNotificationIcon(type) {
    switch(type.toLowerCase()) {
        case 'assignment': return 'fa-clipboard-list';
        case 'deadline': return 'fa-clock';
        case 'feedback': return 'fa-comment-dots';
        case 'system': return 'fa-bell';
        default: return 'fa-info-circle';
    }
}

function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    
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

function groupNotificationsByDate(notificationsArray) {
    if (!Array.isArray(notificationsArray)) return { today: [], yesterday: [], earlier: [] };
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayNotifs = [];
    const yesterdayNotifs = [];
    const earlierNotifs = [];
    
    notificationsArray.forEach(notification => {
        if (!notification.timestamp) return;
        
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

function filterNotifications(notifications, filterType) {
    if (!Array.isArray(notifications)) return [];
    
    if (filterType === 'all') {
        return notifications;
    }
    
    if (filterType === 'unread') {
        return notifications.filter(n => n.unread === true);
    }
    
    return notifications.filter(n => n.type === filterType);
}

function searchNotifications(notifications, searchTerm) {
    if (!Array.isArray(notifications) || !searchTerm) return notifications;
    
    const searchLower = searchTerm.toLowerCase();
    return notifications.filter(n => 
        (n.title && n.title.toLowerCase().includes(searchLower)) || 
        (n.message && n.message.toLowerCase().includes(searchLower))
    );
}

function getPaginatedNotifications(notifications, page, itemsPerPage) {
    if (!Array.isArray(notifications)) return [];
    
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    return notifications.slice(startIdx, endIdx);
}

function calculatePaginationInfo(totalNotifications, currentPage, itemsPerPage) {
    const totalPages = Math.max(1, Math.ceil(totalNotifications / itemsPerPage));
    
    return {
        totalPages,
        currentPage,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        totalItems: totalNotifications,
        startItem: totalNotifications === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1,
        endItem: Math.min(currentPage * itemsPerPage, totalNotifications)
    };
}

function markNotificationAsRead(notifications, notificationId) {
    if (!Array.isArray(notifications)) return false;
    
    const notifIndex = notifications.findIndex(n => n.id === notificationId);
    if (notifIndex !== -1 && notifications[notifIndex].unread) {
        notifications[notifIndex].unread = false;
        return true;
    }
    return false;
}

function markAllNotificationsAsRead(notifications) {
    if (!Array.isArray(notifications)) return 0;
    
    let markedCount = 0;
    notifications.forEach(notification => {
        if (notification.unread) {
            notification.unread = false;
            markedCount++;
        }
    });
    
    return markedCount;
}

function getUnreadCount(notifications) {
    if (!Array.isArray(notifications)) return 0;
    return notifications.filter(n => n.unread === true).length;
}

function isValidNotification(notification) {
    return notification && 
           typeof notification === 'object' &&
           notification.id &&
           notification.title &&
           notification.message &&
           notification.timestamp &&
           notification.type;
}

function generateNotificationId() {
    return 'n' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getNotificationTypeOptions() {
    return [
        { value: 'assignment', label: 'Assignment' },
        { value: 'deadline', label: 'Deadline' },
        { value: 'feedback', label: 'Feedback' },
        { value: 'system', label: 'System' }
    ];
}

function getFilterOptions() {
    return [
        { value: 'all', label: 'All Notifications' },
        { value: 'unread', label: 'Unread' },
        { value: 'assignment', label: 'Assignments' },
        { value: 'deadline', label: 'Deadlines' },
        { value: 'feedback', label: 'Feedback' },
        { value: 'system', label: 'System' }
    ];
}

module.exports = {
    getNotificationTypeClass,
    getNotificationIcon,
    formatTimestamp,
    groupNotificationsByDate,
    filterNotifications,
    searchNotifications,
    getPaginatedNotifications,
    calculatePaginationInfo,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadCount,
    isValidNotification,
    generateNotificationId,
    getNotificationTypeOptions,
    getFilterOptions
};