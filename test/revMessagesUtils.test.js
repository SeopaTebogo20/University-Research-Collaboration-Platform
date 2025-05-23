// revMessagesUtils.test.js
const {
    getNotificationStatusClass,
    getNotificationIcon,
    formatNotificationTime,
    groupNotificationsByDate,
    filterNotifications,
    getPaginatedNotifications
} = require('../src/public/js/revMessagesUtils');

describe('Notification Utilities', () => {
    const mockNotifications = [
        {
            id: 'n1',
            title: 'New Assignment',
            message: 'You have a new project to review',
            type: 'assignment',
            unread: true,
            timestamp: new Date()
        },
        {
            id: 'n2',
            title: 'Deadline Approaching',
            message: 'Your review is due tomorrow',
            type: 'deadline',
            unread: false,
            timestamp: new Date(Date.now() - 86400000) // Yesterday
        },
        {
            id: 'n3',
            title: 'Feedback Received',
            message: 'Your review has been acknowledged',
            type: 'feedback',
            unread: true,
            timestamp: new Date(Date.now() - 172800000) // 2 days ago
        }
    ];

    describe('getNotificationStatusClass', () => {
        test('returns "unread" for unread notifications', () => {
            expect(getNotificationStatusClass(true)).toBe('unread');
        });

        test('returns "read" for read notifications', () => {
            expect(getNotificationStatusClass(false)).toBe('read');
        });
    });

    describe('getNotificationIcon', () => {
        test('returns correct icon for assignment type', () => {
            expect(getNotificationIcon('assignment')).toBe('fa-clipboard-list');
        });

        test('returns correct icon for deadline type', () => {
            expect(getNotificationIcon('deadline')).toBe('fa-clock');
        });

        test('returns correct icon for feedback type', () => {
            expect(getNotificationIcon('feedback')).toBe('fa-comment-dots');
        });

        test('returns default icon for unknown types', () => {
            expect(getNotificationIcon('unknown')).toBe('fa-bell');
        });
    });

    describe('formatNotificationTime', () => {
        test('formats current time correctly', () => {
            const now = new Date();
            const formatted = formatNotificationTime(now);
            expect(formatted).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
        });

        test('formats yesterday correctly', () => {
            const yesterday = new Date(Date.now() - 86400000);
            const formatted = formatNotificationTime(yesterday);
            expect(formatted).toMatch(/Yesterday at \d{1,2}:\d{2} (AM|PM)/);
        });

        test('formats older dates correctly', () => {
            const oldDate = new Date(2020, 0, 1);
            const formatted = formatNotificationTime(oldDate);
            expect(formatted).toMatch(/Jan \d{1,2}, 2020/);
        });
    });

    describe('groupNotificationsByDate', () => {
        test('correctly groups notifications by date', () => {
            const grouped = groupNotificationsByDate(mockNotifications);
            expect(grouped.today).toHaveLength(1);
            expect(grouped.yesterday).toHaveLength(1);
            expect(grouped.earlier).toHaveLength(1);
        });

        test('handles empty array', () => {
            const grouped = groupNotificationsByDate([]);
            expect(grouped.today).toHaveLength(0);
            expect(grouped.yesterday).toHaveLength(0);
            expect(grouped.earlier).toHaveLength(0);
        });
    });

    describe('filterNotifications', () => {
        test('filters by type', () => {
            const filtered = filterNotifications(mockNotifications, 'assignment');
            expect(filtered).toHaveLength(1);
            expect(filtered[0].type).toBe('assignment');
        });

        test('filters by unread status', () => {
            const filtered = filterNotifications(mockNotifications, 'unread');
            expect(filtered).toHaveLength(2);
            expect(filtered.every(n => n.unread)).toBeTruthy();
        });

        test('filters by search term', () => {
            const filtered = filterNotifications(mockNotifications, 'all', 'deadline');
            expect(filtered).toHaveLength(1);
            expect(filtered[0].title).toBe('Deadline Approaching');
        });

       
    });

    describe('getPaginatedNotifications', () => {
        test('returns correct page of notifications', () => {
            const paginated = getPaginatedNotifications(mockNotifications, 1, 2);
            expect(paginated).toHaveLength(2);
            expect(paginated[0].id).toBe('n1');
            expect(paginated[1].id).toBe('n2');
        });

        test('returns remaining items on last page', () => {
            const paginated = getPaginatedNotifications(mockNotifications, 2, 2);
            expect(paginated).toHaveLength(1);
            expect(paginated[0].id).toBe('n3');
        });

        test('handles page beyond range', () => {
            const paginated = getPaginatedNotifications(mockNotifications, 3, 2);
            expect(paginated).toHaveLength(0);
        });
    });
});