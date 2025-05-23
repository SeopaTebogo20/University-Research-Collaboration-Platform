// dashboardRevUtils.test.js

const {
    getReviewStatusClass,
    getReviewTypeIcon,
    getPriorityClass,
    formatReviewDeadline,
    calculateReviewProgress,
    getTimeToCompleteColor,
    sortReviewsByPriority,
    formatReviewDuration,
    getDecisionIcon,
    generateReviewSummary,
    capitalizeFirstLetter,
    isValidReviewData
} = require('../src/public/js/dashboardRevUtils');

describe('dashboardRevUtils', () => {
    describe('getReviewStatusClass', () => {
        test('returns correct class for valid statuses', () => {
            expect(getReviewStatusClass('completed')).toBe('status-completed');
            expect(getReviewStatusClass('pending')).toBe('status-pending');
            expect(getReviewStatusClass('urgent')).toBe('status-urgent');
            expect(getReviewStatusClass('APPROVED')).toBe('status-approved');
        });

        test('returns default class for invalid or empty status', () => {
            expect(getReviewStatusClass('')).toBe('status-default');
            expect(getReviewStatusClass(null)).toBe('status-default');
            expect(getReviewStatusClass('unknown')).toBe('status-default');
        });
    });

    describe('getReviewTypeIcon', () => {
        test('returns correct icon for review types', () => {
            expect(getReviewTypeIcon('ethics')).toBe('fa-balance-scale');
            expect(getReviewTypeIcon('technical')).toBe('fa-cogs');
            expect(getReviewTypeIcon('FUNDING')).toBe('fa-dollar-sign');
        });

        test('returns default icon for unknown types', () => {
            expect(getReviewTypeIcon('unknown')).toBe('fa-file-alt');
            expect(getReviewTypeIcon('')).toBe('fa-file-alt');
        });
    });

    describe('getPriorityClass', () => {
        test('returns correct class for priorities', () => {
            expect(getPriorityClass('high')).toBe('priority-high');
            expect(getPriorityClass('CRITICAL')).toBe('priority-critical');
            expect(getPriorityClass('low')).toBe('priority-low');
        });

        test('returns normal class for invalid priorities', () => {
            expect(getPriorityClass('')).toBe('priority-normal');
            expect(getPriorityClass(null)).toBe('priority-normal');
            expect(getPriorityClass('invalid')).toBe('priority-normal');
        });
    });

    describe('formatReviewDeadline', () => {
        const mockDate = new Date('2025-05-23T12:00:00Z');
        
        beforeAll(() => {
            jest.useFakeTimers();
            jest.setSystemTime(mockDate);
        });

        afterAll(() => {
            jest.useRealTimers();
        });

        test('formats future deadlines correctly', () => {
            expect(formatReviewDeadline('2025-05-24')).toBe('Due tomorrow');
            expect(formatReviewDeadline('2025-05-25')).toBe('Due in 2 days');
            expect(formatReviewDeadline('2025-05-30')).toBe('Due in 7 days');
        });

        test('formats overdue deadlines', () => {
            expect(formatReviewDeadline('2025-05-21')).toBe('Overdue by 2 days');
            expect(formatReviewDeadline('2025-05-22')).toBe('Overdue by 1 days');
        });

        test('handles edge cases', () => {
            expect(formatReviewDeadline('2025-05-23')).toBe('Due today');
            expect(formatReviewDeadline('')).toBe('No deadline');
            expect(formatReviewDeadline(null)).toBe('No deadline');
        });
    });

    describe('calculateReviewProgress', () => {
        test('calculates progress correctly', () => {
            expect(calculateReviewProgress(5, 10)).toBe(50);
            expect(calculateReviewProgress(3, 4)).toBe(75);
            expect(calculateReviewProgress(0, 5)).toBe(0);
        });

        test('handles edge cases', () => {
            expect(calculateReviewProgress(5, 0)).toBe(0);
            expect(calculateReviewProgress(5, null)).toBe(0);
            expect(calculateReviewProgress(5, undefined)).toBe(0);
        });
    });

    describe('getTimeToCompleteColor', () => {
        test('returns correct color classes', () => {
            expect(getTimeToCompleteColor(1)).toBe('time-excellent');
            expect(getTimeToCompleteColor(3)).toBe('time-good');
            expect(getTimeToCompleteColor(5)).toBe('time-average');
            expect(getTimeToCompleteColor(10)).toBe('time-slow');
        });
    });

    describe('sortReviewsByPriority', () => {
        test('sorts reviews by priority and deadline', () => {
            const reviews = [
                { id: 1, priority: 'low', deadline: '2025-05-25' },
                { id: 2, priority: 'critical', deadline: '2025-05-26' },
                { id: 3, priority: 'high', deadline: '2025-05-24' },
                { id: 4, priority: 'critical', deadline: '2025-05-23' }
            ];

            const sorted = sortReviewsByPriority(reviews);
            
            expect(sorted[0].id).toBe(4); // critical, earliest deadline
            expect(sorted[1].id).toBe(2); // critical, later deadline
            expect(sorted[2].id).toBe(3); // high priority
            expect(sorted[3].id).toBe(1); // low priority
        });

        test('handles missing priorities and deadlines', () => {
            const reviews = [
                { id: 1 },
                { id: 2, priority: 'high' },
                { id: 3, deadline: '2025-05-24' }
            ];

            const sorted = sortReviewsByPriority(reviews);
            expect(sorted.length).toBe(3);
            expect(sorted[0].id).toBe(2); // Has high priority
        });
    });

    describe('formatReviewDuration', () => {
        test('formats duration correctly', () => {
            expect(formatReviewDuration('2025-05-20', '2025-05-23')).toBe('3 days');
            expect(formatReviewDuration('2025-05-22', '2025-05-23')).toBe('1 day');
            expect(formatReviewDuration('2025-05-23', '2025-05-23')).toBe('Same day');
        });

        test('handles missing dates', () => {
            expect(formatReviewDuration('', '2025-05-23')).toBe('N/A');
            expect(formatReviewDuration('2025-05-20', '')).toBe('N/A');
            expect(formatReviewDuration(null, null)).toBe('N/A');
        });
    });

    describe('getDecisionIcon', () => {
        test('returns correct icons for decisions', () => {
            expect(getDecisionIcon('approved')).toBe('fa-check-circle');
            expect(getDecisionIcon('rejected')).toBe('fa-times-circle');
            expect(getDecisionIcon('REVISIONS')).toBe('fa-edit');
            expect(getDecisionIcon('pending')).toBe('fa-clock');
        });

        test('returns default icon for unknown decisions', () => {
            expect(getDecisionIcon('unknown')).toBe('fa-question-circle');
            expect(getDecisionIcon('')).toBe('fa-question-circle');
            expect(getDecisionIcon(null)).toBe('fa-question-circle');
        });
    });

    describe('generateReviewSummary', () => {
        const mockDate = new Date('2025-05-23T12:00:00Z');
        
        beforeAll(() => {
            jest.useFakeTimers();
            jest.setSystemTime(mockDate);
        });

        afterAll(() => {
            jest.useRealTimers();
        });

        test('generates correct summary', () => {
            const reviews = [
                { 
                    id: 1, 
                    status: 'pending', 
                    deadline: '2025-05-25' 
                },
                { 
                    id: 2, 
                    status: 'completed', 
                    startDate: '2025-05-20', 
                    endDate: '2025-05-22' 
                },
                { 
                    id: 3, 
                    status: 'pending', 
                    deadline: '2025-05-21' // overdue
                },
                { 
                    id: 4, 
                    status: 'approved', 
                    startDate: '2025-05-18', 
                    endDate: '2025-05-20' 
                }
            ];

            const summary = generateReviewSummary(reviews);
            
            expect(summary.total).toBe(4);
            expect(summary.pending).toBe(2);
            expect(summary.completed).toBe(2);
            expect(summary.overdue).toBe(1);
            expect(summary.avgCompletionTime).toBe(2);
        });

        test('handles empty array', () => {
            const summary = generateReviewSummary([]);
            
            expect(summary.total).toBe(0);
            expect(summary.pending).toBe(0);
            expect(summary.completed).toBe(0);
            expect(summary.overdue).toBe(0);
            expect(summary.avgCompletionTime).toBe(0);
        });
    });

    describe('capitalizeFirstLetter', () => {
        test('capitalizes first letter correctly', () => {
            expect(capitalizeFirstLetter('test')).toBe('Test');
            expect(capitalizeFirstLetter('TEST')).toBe('TEST');
            expect(capitalizeFirstLetter('t')).toBe('T');
        });

        test('handles edge cases', () => {
            expect(capitalizeFirstLetter('')).toBe('');
            expect(capitalizeFirstLetter(null)).toBe('');
            expect(capitalizeFirstLetter(undefined)).toBe('');
        });
    });

    describe('isValidReviewData', () => {
        test('validates review objects correctly', () => {
            expect(isValidReviewData({ id: 1, title: 'Test Review' })).toBe(true);
            expect(isValidReviewData({ id: 'abc', title: 'Another Review', status: 'pending' })).toBe(true);
        });

        test('rejects invalid review objects', () => {
            expect(isValidReviewData({})).toBe(false);
            expect(isValidReviewData({ id: 1 })).toBe(false);
            expect(isValidReviewData({ title: 'Test' })).toBe(false);
            expect(isValidReviewData(null)).toBe(false);
            expect(isValidReviewData(undefined)).toBe(false);
            expect(isValidReviewData('string')).toBe(false);
        });
    });
});