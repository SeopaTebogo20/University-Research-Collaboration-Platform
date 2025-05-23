// revDashUtils.test.js
const {
    getReviewStatusClass,
    formatRelativeDate,
    getReviewButtonConfig,
    filterProposals,
    countReviews,
    getApiBaseUrl
} = require('../src/public/js/revDashUtils');

describe('Reviewer Dashboard Utilities', () => {
    const mockProposals = [
        { id: 'p1', title: 'Proposal 1' },
        { id: 'p2', title: 'Proposal 2' },
        { id: 'p3', title: 'Proposal 3' }
    ];

    const mockEvaluations = [
        { project_id: 'p1', status: 'approved' },
        { project_id: 'p2', status: 'pending' }
    ];

    describe('getReviewStatusClass', () => {
        test('returns correct class for approved', () => {
            expect(getReviewStatusClass('approved')).toBe('status-approved');
        });

        test('returns correct class for revision', () => {
            expect(getReviewStatusClass('revision')).toBe('status-revision');
        });

        test('returns correct class for rejected', () => {
            expect(getReviewStatusClass('rejected')).toBe('status-rejected');
        });

        test('returns pending class for unknown status', () => {
            expect(getReviewStatusClass('unknown')).toBe('status-pending');
        });
    });

    describe('formatRelativeDate', () => {
        beforeAll(() => {
            jest.useFakeTimers().setSystemTime(new Date('2025-05-20T12:00:00Z'));
        });

        afterAll(() => {
            jest.useRealTimers();
        });

        test('formats dates correctly', () => {
            expect(formatRelativeDate('2025-05-19T12:00:00Z')).toBe('1 day ago');
            expect(formatRelativeDate('2025-05-18T12:00:00Z')).toBe('2 days ago');
            expect(formatRelativeDate('2025-05-20T11:59:00Z')).toBe('1 minute ago');
            expect(formatRelativeDate('2025-05-20T11:00:00Z')).toBe('1 hour ago');
        });

        test('returns "Just now" for very recent dates', () => {
            expect(formatRelativeDate(new Date())).toBe('Just now');
        });

        test('returns "N/A" for null/undefined', () => {
            expect(formatRelativeDate(null)).toBe('N/A');
        });

        test('returns "Invalid Date" for invalid date string', () => {
            expect(formatRelativeDate('invalid-date')).toBe('Invalid Date');
        });
    });

    describe('getReviewButtonConfig', () => {
        test('returns evaluate button for pending status', () => {
            const config = getReviewButtonConfig('pending');
            expect(config.text).toBe('Evaluate');
            expect(config.class).toBe('btn btn-primary');
        });

        test('returns view button for approved status', () => {
            const config = getReviewButtonConfig('approved');
            expect(config.text).toBe('View Details');
            expect(config.class).toBe('btn btn-outline');
        });

        test('returns evaluate button for no status', () => {
            const config = getReviewButtonConfig();
            expect(config.text).toBe('Evaluate');
            expect(config.class).toBe('btn btn-primary');
        });
    });


    describe('countReviews', () => {
        test('counts pending and completed reviews', () => {
            const counts = countReviews(mockProposals, mockEvaluations);
            expect(counts.pending).toBe(2); // p2 (explicit pending) + p3 (no evaluation)
            expect(counts.completed).toBe(1); // p1
        });
    });

    describe('getApiBaseUrl', () => {
        test('returns local URL for localhost', () => {
            const originalLocation = window.location;
            delete window.location;
            window.location = { hostname: 'localhost' };
            
            expect(getApiBaseUrl()).toBe('http://localhost:3000');
            window.location = originalLocation;
        });

        test('returns production URL for other hosts', () => {
            const originalLocation = window.location;
            delete window.location;
            window.location = { hostname: 'example.com' };
            
            expect(getApiBaseUrl()).toBe('https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net');
            window.location = originalLocation;
        });
    });
});