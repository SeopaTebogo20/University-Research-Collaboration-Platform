// admProposalUtils.test.js

const {
    getStatusClass,
    getProposalStatus,
    formatStatus,
    formatDate,
    isValidDate,
    extractKeywords,
    truncateText,
    calculateMatchScore,
    getMatchScoreClass,
    hasCommonKeywords,
    parseSearchTerm,
    filterProposals,
    isProposalAssigned,
    getAssignedReviewers,
    createAssignmentPayload,
    buildApiUrl,
    validateProposal,
    validateReviewer,
    getDisplayIndex,
    createErrorMessage
} = require('../src/public/js/admProposalUtils');

// Mock data for testing
const mockProposal = {
    id: 'proj-123',
    project_title: 'AI Research Project',
    researcher_name: 'Dr. Jane Smith',
    key_research_area: 'Artificial Intelligence',
    description: 'This project focuses on Machine Learning and Neural Networks for advanced AI applications.',
    start_date: '2024-01-15',
    researcher_id: 'RES123'
};

const mockReviewer = {
    id: 'rev-456',
    name: 'Dr. John Doe',
    email: 'john.doe@university.edu',
    research_area: 'Artificial Intelligence',
    research_experience: 12,
    department: 'Computer Science'
};

const mockAssignmentData = [
    { project_id: 'proj-123', reviewerId: 'rev-456' },
    { project_id: 'proj-124', reviewerId: 'rev-457' }
];

describe('Status Utilities', () => {
    test('getStatusClass returns correct CSS class', () => {
        expect(getStatusClass('assigned')).toBe('status-assigned');
        expect(getStatusClass('pending')).toBe('status-pending');
        expect(getStatusClass('completed')).toBe('status-completed');
        expect(getStatusClass('')).toBe('status-default');
        expect(getStatusClass(null)).toBe('status-default');
    });

    test('getProposalStatus determines status correctly', () => {
        expect(getProposalStatus('proj-123', mockAssignmentData)).toBe('assigned');
        expect(getProposalStatus('proj-999', mockAssignmentData)).toBe('pending');
        expect(getProposalStatus(null, mockAssignmentData)).toBe('pending');
        expect(getProposalStatus('proj-123', [])).toBe('pending');
    });

    test('formatStatus capitalizes status correctly', () => {
        expect(formatStatus('assigned')).toBe('Assigned');
        expect(formatStatus('pending')).toBe('Pending');
        expect(formatStatus('')).toBe('N/A');
        expect(formatStatus(null)).toBe('N/A');
    });
});

describe('Date Utilities', () => {
    test('formatDate formats dates correctly', () => {
        expect(formatDate('2024-01-15')).toBe('Jan 15, 2024');
        expect(formatDate('')).toBe('N/A');
        expect(formatDate(null)).toBe('N/A');
        expect(formatDate('invalid-date')).toBe('Invalid Date');
    });

    

    test('isValidDate validates dates correctly', () => {
        expect(isValidDate('2024-01-15')).toBe(true);
        expect(isValidDate('invalid-date')).toBe(false);
        expect(isValidDate('')).toBe(false);
        expect(isValidDate(null)).toBe(false);
    });
});

describe('Text Utilities', () => {
    test('extractKeywords extracts capitalized words', () => {
        const text = 'This project focuses on Machine Learning and Neural Networks for advanced AI applications.';
        const keywords = extractKeywords(text);
        expect(keywords).toContain('Machine');
        expect(keywords).toContain('Learning');
        expect(keywords).toContain('Neural');
        expect(keywords).toContain('Networks');
        expect(keywords.length).toBeLessThanOrEqual(5);
    });

    test('extractKeywords handles empty text', () => {
        expect(extractKeywords('')).toEqual(['No concepts available']);
        expect(extractKeywords(null)).toEqual(['No concepts available']);
    });

    test('truncateText truncates long text', () => {
        const longText = 'This is a very long text that should be truncated at some point to fit within the specified length limit.';
        expect(truncateText(longText, 20)).toBe('This is a very long ...');
        expect(truncateText('Short text', 20)).toBe('Short text');
        expect(truncateText('', 20)).toBe('');
    });
});

describe('Matching Utilities', () => {
    test('calculateMatchScore calculates score correctly', () => {
        const score = calculateMatchScore(mockReviewer, mockProposal);
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(100);
    });

    test('calculateMatchScore handles missing data', () => {
        expect(calculateMatchScore(null, mockProposal)).toBe(0);
        expect(calculateMatchScore(mockReviewer, null)).toBe(0);
    });

    test('getMatchScoreClass returns correct class', () => {
        expect(getMatchScoreClass(90)).toBe('high-match');
        expect(getMatchScoreClass(60)).toBe('medium-match');
        expect(getMatchScoreClass(30)).toBe('low-match');
    });

    test('hasCommonKeywords detects common words', () => {
        expect(hasCommonKeywords('Machine Learning', 'Learning Algorithms')).toBe(true);
        expect(hasCommonKeywords('Artificial Intelligence', 'Computer Vision')).toBe(false);
    });
});

describe('Search Utilities', () => {
    test('parseSearchTerm parses search patterns', () => {
        expect(parseSearchTerm('department:Computer')).toEqual({ department: 'Computer' });
        expect(parseSearchTerm('area:AI')).toEqual({ research_area: 'AI' });
        expect(parseSearchTerm('experience:5')).toEqual({ min_experience: 5 });
        expect(parseSearchTerm('general search')).toEqual({ search: 'general search' });
        expect(parseSearchTerm('')).toEqual({});
    });

    test('filterProposals filters by status', () => {
        const proposals = [mockProposal, { ...mockProposal, id: 'proj-999' }];
        const filters = { status: 'assigned' };
        const filtered = filterProposals(proposals, filters, mockAssignmentData);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe('proj-123');
    });

    test('filterProposals handles empty input', () => {
        expect(filterProposals(null, {})).toEqual([]);
        expect(filterProposals([], {})).toEqual([]);
    });
});

describe('Assignment Utilities', () => {
    test('isProposalAssigned checks assignment correctly', () => {
        expect(isProposalAssigned('proj-123', mockAssignmentData)).toBe(true);
        expect(isProposalAssigned('proj-999', mockAssignmentData)).toBe(false);
        expect(isProposalAssigned(null, mockAssignmentData)).toBe(false);
    });

    test('getAssignedReviewers returns reviewer info', () => {
        const reviewers = getAssignedReviewers('proj-123', mockAssignmentData, [mockReviewer]);
        expect(reviewers).toHaveLength(1);
        expect(reviewers[0].name).toBe('Dr. John Doe');
    });

    test('createAssignmentPayload creates valid payload', () => {
        const payload = createAssignmentPayload(mockProposal, mockReviewer);
        expect(payload.project_id).toBe('proj-123');
        expect(payload.reviewerId).toBe('rev-456');
        expect(payload.project_name).toBe('AI Research Project');
        expect(payload.created_at).toBeDefined();
    });

    test('createAssignmentPayload throws error for missing data', () => {
        expect(() => createAssignmentPayload(null, mockReviewer)).toThrow('Proposal and reviewer are required');
    });
});

describe('API Utilities', () => {
    // Mock window.location for testing
    const originalLocation = window.location;
    
    beforeEach(() => {
        delete window.location;
        window.location = { hostname: 'localhost' };
    });
    
    afterEach(() => {
        window.location = originalLocation;
    });

    test('buildApiUrl constructs URL with parameters', () => {
        const url = buildApiUrl('http://localhost:3000', '/api/test', { param1: 'value1', param2: 'value2' });
        expect(url).toContain('param1=value1');
        expect(url).toContain('param2=value2');
    });

    test('buildApiUrl handles empty parameters', () => {
        const url = buildApiUrl('http://localhost:3000', '/api/test', {});
        expect(url).toBe('http://localhost:3000/api/test');
    });
});

describe('Validation Utilities', () => {
    test('validateProposal validates required fields', () => {
        const errors = validateProposal(mockProposal);
        expect(errors).toHaveLength(0);
    });

    test('validateProposal catches missing fields', () => {
        const invalidProposal = { id: 'test' };
        const errors = validateProposal(invalidProposal);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors).toContain('Project title is required');
    });

    test('validateReviewer validates required fields', () => {
        const errors = validateReviewer(mockReviewer);
        expect(errors).toHaveLength(0);
    });

    test('validateReviewer catches missing fields', () => {
        const invalidReviewer = { id: 'test' };
        const errors = validateReviewer(invalidReviewer);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors).toContain('Reviewer name is required');
    });
});

describe('Display Utilities', () => {
    test('getDisplayIndex returns correct index', () => {
        const proposals = [mockProposal, { ...mockProposal, id: 'proj-124' }];
        expect(getDisplayIndex(mockProposal, proposals)).toBe(1);
        expect(getDisplayIndex({ id: 'proj-124' }, proposals)).toBe(2);
        expect(getDisplayIndex({ id: 'nonexistent' }, proposals)).toBe(0);
    });

    test('createErrorMessage creates message object', () => {
        const error = createErrorMessage('Test error');
        expect(error.message).toBe('Test error');
        expect(error.type).toBe('error');
        expect(error.timestamp).toBeDefined();
    });

    test('createErrorMessage accepts custom type', () => {
        const warning = createErrorMessage('Test warning', 'warning');
        expect(warning.type).toBe('warning');
    });
});

// Integration test
describe('Integration Tests', () => {
    test('complete workflow simulation', () => {
        // 1. Check if proposal is assigned
        const isAssigned = isProposalAssigned(mockProposal.id, mockAssignmentData);
        expect(isAssigned).toBe(true);
        
        // 2. Get status
        const status = getProposalStatus(mockProposal.id, mockAssignmentData);
        expect(status).toBe('assigned');
        
        // 3. Format status for display
        const displayStatus = formatStatus(status);
        expect(displayStatus).toBe('Assigned');
        
        // 4. Get status class
        const statusClass = getStatusClass(status);
        expect(statusClass).toBe('status-assigned');
        
        // 5. Calculate match score
        const matchScore = calculateMatchScore(mockReviewer, mockProposal);
        expect(matchScore).toBeGreaterThan(0);
    });
});

// Performance tests
describe('Performance Tests', () => {
    test('filterProposals handles large datasets efficiently', () => {
        const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
            ...mockProposal,
            id: `proj-${i}`,
            project_title: `Project ${i}`
        }));
        
        const start = performance.now();
        const filtered = filterProposals(largeDataset, { search: 'Project 1' }, []);
        const end = performance.now();
        
        expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
        expect(filtered.length).toBeGreaterThan(0);
    });
});