// revReviewUtils.test.js
const {
    getReviewStatusClass,
    formatReviewDate,
    formatCriterionName,
    generateScoreStars,
    filterReviews,
    sortReviewsByDate
} = require('../src/public/js/revReviewUtils');

describe('Review Utilities', () => {
    const mockReviews = [
        {
            id: 'review1',
            title: 'Climate Change Research',
            decision: 'Approved',
            reviewDate: '2025-05-01'
        },
        {
            id: 'review2',
            title: 'AI Ethics Framework',
            decision: 'Revision',
            reviewDate: '2025-04-15'
        },
        {
            id: 'review3',
            title: 'Quantum Computing',
            decision: 'Rejected',
            reviewDate: '2025-03-20'
        },
        {
            id: 'review4',
            title: 'Sustainable Materials',
            decision: 'Approved',
            reviewDate: '2025-05-10'
        }
    ];

    describe('getReviewStatusClass', () => {
        test('returns correct class for Approved', () => {
            expect(getReviewStatusClass('Approved')).toBe('status-approved');
        });

        test('returns correct class for Revision', () => {
            expect(getReviewStatusClass('Revision')).toBe('status-revision');
        });

        test('returns correct class for Rejected', () => {
            expect(getReviewStatusClass('Rejected')).toBe('status-rejected');
        });

        test('returns default for unknown status', () => {
            expect(getReviewStatusClass('Unknown')).toBe('status-default');
        });
    });

    describe('formatReviewDate', () => {
        test('formats date string correctly', () => {
            expect(formatReviewDate('2025-05-01')).toMatch(/May 1, 2025/);
        });

        test('formats Date object correctly', () => {
            const date = new Date(2025, 4, 1); // May 1, 2025
            expect(formatReviewDate(date)).toMatch(/May 1, 2025/);
        });

        test('returns "N/A" for null/undefined', () => {
            expect(formatReviewDate(null)).toBe('N/A');
            expect(formatReviewDate(undefined)).toBe('N/A');
        });

        test('returns "Invalid Date" for invalid date string', () => {
            expect(formatReviewDate('invalid-date')).toBe('Invalid Date');
        });
    });

    describe('formatCriterionName', () => {
        test('formats camelCase to Title Case', () => {
            expect(formatCriterionName('scientificMerit')).toBe('Scientific Merit');
        });

        test('handles single word', () => {
            expect(formatCriterionName('impact')).toBe('Impact');
        });

        test('returns empty string for empty input', () => {
            expect(formatCriterionName('')).toBe('');
        });
    });

    describe('generateScoreStars', () => {
        test('generates correct stars for score 3', () => {
            const stars = generateScoreStars(3);
            expect(stars.match(/fas fa-star/g)).toHaveLength(3);
            expect(stars.match(/far fa-star/g)).toHaveLength(2);
        });

        test('returns empty string for invalid score', () => {
            expect(generateScoreStars(0)).toBe('');
            expect(generateScoreStars(6)).toBe('');
        });
    });

    describe('filterReviews', () => {
        test('filters by status', () => {
            const filtered = filterReviews(mockReviews, 'all', 'approved');
            expect(filtered).toHaveLength(2);
            expect(filtered.every(r => r.decision === 'Approved')).toBeTruthy();
        });

       

        test('combines time and status filters', () => {
            jest.useFakeTimers().setSystemTime(new Date('2025-05-15'));
            const filtered = filterReviews(mockReviews, 'month', 'approved');
            expect(filtered).toHaveLength(2);
            jest.useRealTimers();
        });

        test('returns empty array for no matches', () => {
            const filtered = filterReviews(mockReviews, 'month', 'rejected');
            expect(filtered).toHaveLength(0);
        });
    });

    describe('sortReviewsByDate', () => {
        test('sorts reviews newest first by default', () => {
            const sorted = sortReviewsByDate(mockReviews);
            expect(sorted[0].id).toBe('review4');
            expect(sorted[3].id).toBe('review3');
        });

        test('sorts reviews oldest first when specified', () => {
            const sorted = sortReviewsByDate(mockReviews, 'asc');
            expect(sorted[0].id).toBe('review3');
            expect(sorted[3].id).toBe('review4');
        });

        test('handles empty array', () => {
            expect(sortReviewsByDate([])).toEqual([]);
        });
    });
});