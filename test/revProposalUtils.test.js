// revProposalUtils.test.js
const {
    getFileIconClass,
    formatProposalDate,
    formatProposalCurrency,
    validateReviewForm,
    getProposalIdFromUrl,
    formatRecommendation,
    generateDraftId
} = require('../src/public/js/revProposalUtils');

describe('Proposal Utilities', () => {
    describe('getFileIconClass', () => {
        test('returns correct icon for PDF', () => {
            expect(getFileIconClass('pdf')).toBe('fas fa-file-pdf');
        });

        test('returns correct icon for DOCX', () => {
            expect(getFileIconClass('docx')).toBe('fas fa-file-word');
        });

        test('returns correct icon for XLSX', () => {
            expect(getFileIconClass('xlsx')).toBe('fas fa-file-excel');
        });

        test('returns default icon for unknown types', () => {
            expect(getFileIconClass('unknown')).toBe('fas fa-file');
        });
    });

    describe('formatProposalDate', () => {
        test('formats date string correctly', () => {
            expect(formatProposalDate('2025-05-20')).toMatch(/May 20, 2025/);
        });

        test('formats Date object correctly', () => {
            const date = new Date(2025, 4, 20); // May 20, 2025
            expect(formatProposalDate(date)).toMatch(/May 20, 2025/);
        });

        test('returns "N/A" for null/undefined', () => {
            expect(formatProposalDate(null)).toBe('N/A');
            expect(formatProposalDate(undefined)).toBe('N/A');
        });

        test('returns "Invalid Date" for invalid date string', () => {
            expect(formatProposalDate('invalid-date')).toBe('Invalid Date');
        });
    });

    describe('formatProposalCurrency', () => {
        test('formats whole numbers without decimals', () => {
            expect(formatProposalCurrency(1000)).toBe('$1,000');
        });

        test('formats large numbers with commas', () => {
            expect(formatProposalCurrency(250000)).toBe('$250,000');
        });

        test('handles zero', () => {
            expect(formatProposalCurrency(0)).toBe('$0');
        });
    });

    describe('validateReviewForm', () => {
        const validReview = {
            criteria: {
                scientificMerit: '5',
                methodology: '4',
                feasibility: '3',
                impact: '4'
            },
            feedback: 'This is a detailed review with more than 50 characters of feedback.',
            recommendation: 'approve'
        };

        test('returns valid for complete review', () => {
            const result = validateReviewForm(validReview);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('returns invalid for missing ratings', () => {
            const review = { ...validReview, criteria: {} };
            const result = validateReviewForm(review);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(4);
        });

        test('returns invalid for short feedback', () => {
            const review = { ...validReview, feedback: 'Too short' };
            const result = validateReviewForm(review);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Please provide detailed feedback (minimum 50 characters)');
        });

        test('returns invalid for missing recommendation', () => {
            const review = { ...validReview, recommendation: null };
            const result = validateReviewForm(review);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Please select a final recommendation');
        });
    });

    describe('getProposalIdFromUrl', () => {
        test('extracts ID from URL with search param', () => {
            const url = 'https://example.com/proposal?id=quantum-computing';
            expect(getProposalIdFromUrl(url)).toBe('quantum-computing');
        });

        test('returns default when no ID param', () => {
            const url = 'https://example.com/proposal';
            expect(getProposalIdFromUrl(url)).toBe('demo-proposal');
        });

        test('handles invalid URL', () => {
            expect(getProposalIdFromUrl('not-a-url')).toBe('demo-proposal');
        });
    });

    describe('formatRecommendation', () => {
        test('formats "approve" correctly', () => {
            expect(formatRecommendation('approve')).toBe('Approve');
        });

        test('formats "revise" correctly', () => {
            expect(formatRecommendation('revise')).toBe('Requires Revision');
        });

        test('formats "reject" correctly', () => {
            expect(formatRecommendation('reject')).toBe('Reject');
        });

        test('returns default for unknown values', () => {
            expect(formatRecommendation('unknown')).toBe('Pending Review');
        });
    });

    describe('generateDraftId', () => {
        test('generates ID with proposal ID and timestamp', () => {
            const id = generateDraftId('quantum-computing');
            expect(id).toMatch(/^draft-quantum-computing-\d+$/);
        });
    });
});