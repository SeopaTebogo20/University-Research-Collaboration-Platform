// aipageUtils.test.js
const {
    currentUserId,
    getApiBaseUrl,
    userResearchProfile,
    mockProjects,
    generateUniqueId,
    capitalizeFirstLetter,
    formatDate,
    formatTimeframe,
    getSuggestionTypeIcon,
    generateRelevanceDots,
    fetchUserProjects,
    generateMockSuggestions,
    generateCollaborationSuggestions,
    generateFundingSuggestions,
    generatePaperSuggestions,
    generateResourceSuggestions,
    generateEventSuggestions
} = require('../src/public/js/aipageUtils');

describe('aipageUtils', () => {
    describe('Constants', () => {
        test('currentUserId should be defined', () => {
            expect(currentUserId).toBeDefined();
            expect(typeof currentUserId).toBe('string');
        });

        test('userResearchProfile should contain expected properties', () => {
            expect(userResearchProfile).toBeDefined();
            expect(userResearchProfile.areas).toBeInstanceOf(Array);
            expect(userResearchProfile.publications).toBeDefined();
        });

        test('mockProjects should contain 3 projects', () => {
            expect(mockProjects).toBeDefined();
            expect(mockProjects.length).toBe(3);
        });
    });


    describe('API Functions', () => {
        test('fetchUserProjects should return mock projects', async () => {
            const projects = await fetchUserProjects();
            expect(projects).toEqual(mockProjects);
        });
    });

    describe('Suggestion Generation', () => {
        test('generateMockSuggestions should return suggestions', () => {
            const suggestions = generateMockSuggestions(mockProjects, userResearchProfile);
            expect(suggestions).toBeInstanceOf(Array);
            expect(suggestions.length).toBeGreaterThan(0);
        });

        test('generateCollaborationSuggestions should return collaborations', () => {
            const keywords = ['quantum computing', 'machine learning'];
            const collaborations = generateCollaborationSuggestions(keywords);
            expect(collaborations).toBeInstanceOf(Array);
            expect(collaborations.length).toBe(4);
            expect(collaborations[0].type).toBe('collaboration');
        });

        test('generateFundingSuggestions should return funding opportunities', () => {
            const keywords = ['quantum computing', 'artificial intelligence'];
            const funding = generateFundingSuggestions(keywords);
            expect(funding).toBeInstanceOf(Array);
            expect(funding.length).toBe(2);
            expect(funding[0].type).toBe('funding');
        });

        test('generatePaperSuggestions should return papers', () => {
            const keywords = ['quantum computing', 'machine learning'];
            const papers = generatePaperSuggestions(keywords);
            expect(papers).toBeInstanceOf(Array);
            expect(papers.length).toBe(2);
            expect(papers[0].type).toBe('paper');
        });

        test('generateResourceSuggestions should return resources', () => {
            const keywords = ['quantum computing', 'machine learning'];
            const resources = generateResourceSuggestions(keywords);
            expect(resources).toBeInstanceOf(Array);
            expect(resources.length).toBe(2);
            expect(resources[0].type).toBe('resource');
        });

        test('generateEventSuggestions should return events', () => {
            const keywords = ['quantum computing', 'medical AI'];
            const events = generateEventSuggestions(keywords);
            expect(events).toBeInstanceOf(Array);
            expect(events.length).toBe(2);
            expect(events[0].type).toBe('event');
        });
    });
});