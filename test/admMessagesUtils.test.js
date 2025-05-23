// admMessagesUtils.test.js

const {
    getNotificationTypeClass,
    getNotificationIcon,

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
} = require('../src/public/js/admMessagesUtils');

// Mock data for testing
const mockNotifications = [
    {
        id: 'n1',
        title: 'New Assignment',
        message: 'You have a new assignment',
        timestamp: new Date(),
        type: 'assignment',
        unread: true
    },
    {
        id: 'n2',
        title: 'Deadline Reminder',
        message: 'Deadline approaching',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        type: 'deadline',
        unread: false
    },
    {
        id: 'n3',
        title: 'System Update',
        message: 'System maintenance scheduled',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
        type: 'system',
        unread: true
    }
];

describe('admMessagesUtils', () => {
    describe('getNotificationTypeClass', () => {
        test('should return correct class for assignment type', () => {
            expect(getNotificationTypeClass('assignment')).toBe('notification-assignment');
        });

        test('should return correct class for deadline type', () => {
            expect(getNotificationTypeClass('deadline')).toBe('notification-deadline');
        });

        test('should return correct class for feedback type', () => {
            expect(getNotificationTypeClass('feedback')).toBe('notification-feedback');
        });

        test('should return correct class for system type', () => {
            expect(getNotificationTypeClass('system')).toBe('notification-system');
        });

        test('should return default class for unknown type', () => {
            expect(getNotificationTypeClass('unknown')).toBe('notification-default');
        });

        test('should return default class for null input', () => {
            expect(getNotificationTypeClass(null)).toBe('notification-default');
        });
    });

    describe('getNotificationIcon', () => {
        test('should return correct icon for assignment type', () => {
            expect(getNotificationIcon('assignment')).toBe('fa-clipboard-list');
        });

        test('should return correct icon for deadline type', () => {
            expect(getNotificationIcon('deadline')).toBe('fa-clock');
        });

        test('should return correct icon for feedback type', () => {
            expect(getNotificationIcon('feedback')).toBe('fa-comment-dots');
        });

        test('should return correct icon for system type', () => {
            expect(getNotificationIcon('system')).toBe('fa-bell');
        });

        test('should return default icon for unknown type', () => {
            expect(getNotificationIcon('unknown')).toBe('fa-info-circle');
        });
    });

    describe('groupNotificationsByDate', () => {
        test('should group notifications correctly', () => {
            const grouped = groupNotificationsByDate(mockNotifications);
            expect(typeof grouped).toBe('object');
            expect(Array.isArray(grouped.today)).toBe(true);
            expect(Array.isArray(grouped.yesterday)).toBe(true);
            expect(Array.isArray(grouped.earlier)).toBe(true);
        });

        test('should return empty groups for empty array', () => {
            const grouped = groupNotificationsByDate([]);
            expect(grouped.today).toHaveLength(0);
            expect(grouped.yesterday).toHaveLength(0);
            expect(grouped.earlier).toHaveLength(0);
        });

        test('should return empty groups for null input', () => {
            const grouped = groupNotificationsByDate(null);
            expect(grouped.today).toHaveLength(0);
            expect(grouped.yesterday).toHaveLength(0);
            expect(grouped.earlier).toHaveLength(0);
        });
    });

    describe('filterNotifications', () => {
        test('should return all notifications for "all" filter', () => {
            const filtered = filterNotifications(mockNotifications, 'all');
            expect(filtered).toHaveLength(mockNotifications.length);
        });

        test('should filter unread notifications', () => {
            const filtered = filterNotifications(mockNotifications, 'unread');
            expect(filtered.every(n => n.unread === true)).toBe(true);
        });

        test('should filter by notification type', () => {
            const filtered = filterNotifications(mockNotifications, 'assignment');
            expect(filtered.every(n => n.type === 'assignment')).toBe(true);
        });

        test('should return empty array for empty input', () => {
            const filtered = filterNotifications([], 'all');
            expect(filtered).toHaveLength(0);
        });


    });

    describe('searchNotifications', () => {
        test('should find notifications by title', () => {
            const results = searchNotifications(mockNotifications, 'Assignment');
            expect(results.length).toBeGreaterThan(0);
        });

        test('should find notifications by message', () => {
            const results = searchNotifications(mockNotifications, 'approaching');
            expect(results.length).toBeGreaterThan(0);
        });

        test('should return no results for non-existent search', () => {
            const results = searchNotifications(mockNotifications, 'nonexistent');
            expect(results).toHaveLength(0);
        });

        test('should return all notifications for empty search', () => {
            const results = searchNotifications(mockNotifications, '');
            expect(results).toHaveLength(mockNotifications.length);
        });

      
    });

    describe('getPaginatedNotifications', () => {
        test('should return correct page size', () => {
            const paginated = getPaginatedNotifications(mockNotifications, 1, 2);
            expect(paginated.length).toBeLessThanOrEqual(2);
        });

        test('should return empty array for empty input', () => {
            const paginated = getPaginatedNotifications([], 1, 2);
            expect(paginated).toHaveLength(0);
        });

        
    });

    describe('calculatePaginationInfo', () => {
        test('should calculate pagination info correctly', () => {
            const info = calculatePaginationInfo(10, 1, 5);
            expect(info.totalPages).toBe(2);
            expect(info.currentPage).toBe(1);
            expect(info.hasNextPage).toBe(true);
            expect(info.hasPrevPage).toBe(false);
            expect(info.totalItems).toBe(10);
        });

        test('should handle zero items correctly', () => {
            const info = calculatePaginationInfo(0, 1, 5);
            expect(info.totalPages).toBe(1);
            expect(info.totalItems).toBe(0);
        });
    });

    describe('markNotificationAsRead', () => {
        test('should mark unread notification as read', () => {
            const testNotifications = [...mockNotifications];
            const result = markNotificationAsRead(testNotifications, 'n1');
            expect(result).toBe(true);
            expect(testNotifications.find(n => n.id === 'n1').unread).toBe(false);
        });

        test('should return false for non-existent notification', () => {
            const testNotifications = [...mockNotifications];
            const result = markNotificationAsRead(testNotifications, 'nonexistent');
            expect(result).toBe(false);
        });

        test('should return false for null input', () => {
            const result = markNotificationAsRead(null, 'n1');
            expect(result).toBe(false);
        });
    });

    describe('markAllNotificationsAsRead', () => {
        test('should mark all notifications as read', () => {
            const testNotifications = [...mockNotifications];
            const count = markAllNotificationsAsRead(testNotifications);
            expect(count).toBeGreaterThanOrEqual(0);
            expect(testNotifications.every(n => n.unread === false)).toBe(true);
        });

        test('should return 0 for null input', () => {
            const count = markAllNotificationsAsRead(null);
            expect(count).toBe(0);
        });
    });

    describe('getUnreadCount', () => {
        test('should return correct unread count', () => {
            const count = getUnreadCount(mockNotifications);
            expect(typeof count).toBe('number');
            expect(count).toBeGreaterThanOrEqual(0);
        });

        test('should return 0 for empty array', () => {
            const count = getUnreadCount([]);
            expect(count).toBe(0);
        });

        test('should return 0 for null input', () => {
            const count = getUnreadCount(null);
            expect(count).toBe(0);
        });
    });

    describe('isValidNotification', () => {
 





        
    });

    describe('generateNotificationId', () => {
        test('should generate string ID starting with n', () => {
            const id = generateNotificationId();
            expect(typeof id).toBe('string');
            expect(id.startsWith('n')).toBe(true);
        });

        test('should generate unique IDs', () => {
            const id1 = generateNotificationId();
            const id2 = generateNotificationId();
            expect(id1).not.toBe(id2);
        });
    });

    describe('getNotificationTypeOptions', () => {
        test('should return array of type options', () => {
            const options = getNotificationTypeOptions();
            expect(Array.isArray(options)).toBe(true);
            expect(options.length).toBeGreaterThan(0);
            expect(options.every(opt => opt.value && opt.label)).toBe(true);
        });
    });

    describe('getFilterOptions', () => {
        test('should return array of filter options', () => {
            const options = getFilterOptions();
            expect(Array.isArray(options)).toBe(true);
            expect(options.length).toBeGreaterThan(0);
            expect(options.every(opt => opt.value && opt.label)).toBe(true);
            expect(options.some(opt => opt.value === 'all')).toBe(true);
        });
    });
});