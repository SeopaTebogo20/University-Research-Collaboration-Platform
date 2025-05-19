const {
    capitalize,
    loadProjects,
    loadFundingRecords,
    saveFundingRecord,
    deleteFundingRecord,
    calculateFundingTotals,
    calculateSummaryData,
    calculateCategoryBreakdown
} = require('../src/public/js/fundingUtils');

// Mock fetch for testing
global.fetch = jest.fn();

describe('capitalize', () => {
    test('capitalizes the first letter of a string', () => {
        expect(capitalize('test')).toBe('Test');
        expect(capitalize('hello world')).toBe('Hello world');
    });

    test('returns empty string for empty input', () => {
        expect(capitalize('')).toBe('');
        expect(capitalize(null)).toBe('');
    });
});

describe('calculateFundingTotals', () => {
    test('calculates correct totals and validations', () => {
        const inputs = {
            personnelBudget: '1000',
            equipmentBudget: '2000',
            consumablesBudget: '500',
            otherBudget: '300',
            personnelSpent: '800',
            equipmentSpent: '2100', // Invalid (over budget)
            consumablesSpent: '500',
            otherSpent: '100'
        };

        const result = calculateFundingTotals(inputs);

        expect(result.totalBudget).toBe(3800);
        expect(result.totalSpent).toBe(3500);
        expect(result.validations).toEqual({
            personnel: true,
            equipment: false,
            consumables: true,
            other: true
        });
        expect(result.allValid).toBe(false);
    });
});

describe('calculateSummaryData', () => {
    test('calculates correct summary data', () => {
        const records = [
            { total_amount: '1000', amount_spent: '500', status: 'active' },
            { total_amount: '2000', amount_spent: '1500', status: 'active' },
            { total_amount: '500', amount_spent: '500', status: 'completed' }
        ];

        const result = calculateSummaryData(records);

        expect(result.totalFunding).toBe(3500);
        expect(result.totalSpent).toBe(2500);
        expect(result.totalRemaining).toBe(1000);
        expect(result.activeGrantsCount).toBe(2);
    });
});

describe('calculateCategoryBreakdown', () => {
    test('calculates correct category breakdowns', () => {
        const records = [
            { 
                personnel_budget: '500', personnel_spent: '300',
                equipment_budget: '1000', equipment_spent: '500',
                consumables_budget: '200', consumables_spent: '200',
                other_budget: '100', other_spent: '50'
            },
            { 
                personnel_budget: '500', personnel_spent: '400',
                equipment_budget: '500', equipment_spent: '600', // Over budget
                consumables_budget: '300', consumables_spent: '100',
                other_budget: '200', other_spent: '100'
            }
        ];

        const result = calculateCategoryBreakdown(records);

        expect(result.personnel.budget).toBe(1000);
        expect(result.personnel.spent).toBe(700);
        expect(result.personnel.percent).toBe(70);

        expect(result.equipment.budget).toBe(1500);
        expect(result.equipment.spent).toBe(1100);
        expect(result.equipment.percent).toBe(73);

        expect(result.consumables.budget).toBe(500);
        expect(result.consumables.spent).toBe(300);
        expect(result.consumables.percent).toBe(60);

        expect(result.other.budget).toBe(300);
        expect(result.other.spent).toBe(150);
        expect(result.other.percent).toBe(50);
    });
});

describe('API functions', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    test('loadProjects success', async () => {
        const mockProjects = [{ id: 1, title: 'Project 1' }];
        const mockSummaries = [{ project_id: 1, total_funding: 1000 }];
        
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockProjects)
            })
        ).mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockSummaries)
            })
        );

        const result = await loadProjects();
        
        expect(result).toEqual({
            projects: mockProjects,
            summaries: mockSummaries
        });
        expect(fetch).toHaveBeenCalledTimes(2);
    });

    test('loadFundingRecords success', async () => {
        const mockRecords = [{ id: 1, title: 'Funding 1' }];
        
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockRecords)
        });

        const result = await loadFundingRecords(1);
        expect(result).toEqual(mockRecords);
    });

    test('saveFundingRecord (create) success', async () => {
        const mockData = { title: 'New Funding' };
        const mockResponse = { id: 1, ...mockData };
        
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponse)
        });

        const result = await saveFundingRecord(mockData);
        expect(result).toEqual(mockResponse);
    });

    test('saveFundingRecord (update) success', async () => {
        const mockData = { title: 'Updated Funding' };
        const mockResponse = { id: 1, ...mockData };
        
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponse)
        });

        const result = await saveFundingRecord(mockData, 1);
        expect(result).toEqual(mockResponse);
    });

    test('deleteFundingRecord success', async () => {
        fetch.mockResolvedValueOnce({
            ok: true
        });

        const result = await deleteFundingRecord(1);
        expect(result).toBe(true);
    });

    test('API functions handle errors', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));
        
        await expect(loadProjects()).rejects.toThrow('Network error');
    });
});