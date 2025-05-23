// admUserManagementUtils.test.js

// Import the utility functions
const {
    getStatusClass,
    getRoleBadgeClass,
    capitalizeFirstLetter,
    getInitials,
    formatDate,
    filterUsersByRole,
    searchUsers,
    sortUsers,
    validateUserData,
    isValidEmail,
    getUserStats,
    canPromoteUser,
    canActivateReviewer,
    getPromoteButtonText,
    shouldShowPromoteButton,
    formatResearchAreas,
    createUserDisplayData
} = require('../src/public/js/admUserManagementUtils');

// Test data
const mockUsers = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'researcher',
        'promoted-role': 'pending',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-20T14:45:00Z',
        research_experience: 5,
        projects_created: 3,
        department: 'Computer Science',
        research_area: 'machine learning, artificial intelligence'
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'reviewer',
        'promoted-role': 'reviewer',
        created_at: '2024-01-10T09:15:00Z',
        updated_at: '2024-01-25T16:20:00Z',
        research_experience: 8,
        projects_created: 7,
        department: 'Biology'
    },
    {
        id: 3,
        name: 'bob wilson',
        email: 'bob@example.com',
        role: 'researcher',
        'promoted-role': 'reviewer',
        created_at: '2024-01-12T11:00:00Z',
        updated_at: '2024-01-22T13:30:00Z',
        research_experience: 3,
        projects_created: 2
    }
];

// Test Suite
describe('admUserManagementUtils', () => {
    
    // Test getStatusClass
    describe('getStatusClass', () => {
        test('should return correct class for reviewer status', () => {
            expect(getStatusClass('reviewer')).toBe('status-active');
            expect(getStatusClass('Reviewer')).toBe('status-active');
        });
        
        test('should return correct class for pending status', () => {
            expect(getStatusClass('pending')).toBe('status-pending');
        });
        
        test('should return correct class for inactive status', () => {
            expect(getStatusClass('inactive')).toBe('status-inactive');
        });
        
        test('should return default class for unknown or null status', () => {
            expect(getStatusClass('unknown')).toBe('status-default');
            expect(getStatusClass(null)).toBe('status-default');
            expect(getStatusClass('')).toBe('status-default');
        });
    });
    
    // Test getRoleBadgeClass
    describe('getRoleBadgeClass', () => {
        test('should return correct class for different roles', () => {
            expect(getRoleBadgeClass('researcher')).toBe('role-researcher');
            expect(getRoleBadgeClass('reviewer')).toBe('role-reviewer');
            expect(getRoleBadgeClass('admin')).toBe('role-admin');
            expect(getRoleBadgeClass('RESEARCHER')).toBe('role-researcher');
        });
        
        test('should return default class for unknown or null role', () => {
            expect(getRoleBadgeClass('unknown')).toBe('role-default');
            expect(getRoleBadgeClass(null)).toBe('role-default');
            expect(getRoleBadgeClass('')).toBe('role-default');
        });
    });
    
    // Test capitalizeFirstLetter
    describe('capitalizeFirstLetter', () => {
        test('should capitalize first letter and lowercase the rest', () => {
            expect(capitalizeFirstLetter('hello')).toBe('Hello');
            expect(capitalizeFirstLetter('WORLD')).toBe('World');
            expect(capitalizeFirstLetter('jOhN')).toBe('John');
        });
        
        test('should handle empty or null strings', () => {
            expect(capitalizeFirstLetter('')).toBe('');
            expect(capitalizeFirstLetter(null)).toBe('');
            expect(capitalizeFirstLetter(undefined)).toBe('');
        });
    });
    
    // Test getInitials
    describe('getInitials', () => {

        
        test('should handle empty or null names', () => {
            expect(getInitials('')).toBe('?');
            expect(getInitials(null)).toBe('?');
            expect(getInitials(undefined)).toBe('?');
        });
    });
    
    // Test formatDate
    describe('formatDate', () => {
        test('should format valid dates correctly', () => {
            const result = formatDate('2024-01-15T10:30:00Z');
            expect(result).toContain('Jan 15, 2024');
        });
        
        test('should format dates without time when specified', () => {
            const result = formatDate('2024-01-15T10:30:00Z', false);
            expect(result).toBe('Jan 15, 2024');
        });
        
        test('should handle invalid dates', () => {
            expect(formatDate('invalid-date')).toBe('Invalid Date');
            expect(formatDate(null)).toBe('N/A');
            expect(formatDate('')).toBe('N/A');
        });
    });
    
    // Test filterUsersByRole
    describe('filterUsersByRole', () => {
        test('should filter users by allowed roles', () => {
            const result = filterUsersByRole(mockUsers, ['researcher']);
            expect(result).toHaveLength(2);
            expect(result.every(user => user.role === 'researcher')).toBe(true);
        });
        
        test('should return empty array for invalid input', () => {
            expect(filterUsersByRole(null)).toEqual([]);
            expect(filterUsersByRole('not-an-array')).toEqual([]);
        });
        
        test('should use default allowed roles', () => {
            const result = filterUsersByRole(mockUsers);
            expect(result).toHaveLength(3); // All users are researcher or reviewer
        });
    });
    
    // Test searchUsers
    describe('searchUsers', () => {
        test('should search users by name', () => {
            const result = searchUsers(mockUsers, 'john');
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('John Doe');
        });
        
        test('should search users by email', () => {
            const result = searchUsers(mockUsers, 'jane@example');
            expect(result).toHaveLength(1);
            expect(result[0].email).toBe('jane@example.com');
        });
        
        test('should search users by department', () => {
            const result = searchUsers(mockUsers, 'computer');
            expect(result).toHaveLength(1);
            expect(result[0].department).toBe('Computer Science');
        });
        
        test('should return all users for empty search term', () => {
            const result = searchUsers(mockUsers, '');
            expect(result).toHaveLength(3);
        });
        
        test('should handle invalid input', () => {
            expect(searchUsers(null, 'test')).toBeNull();
            expect(searchUsers(mockUsers, null)).toBe(mockUsers);
        });
    });
    
    // Test sortUsers
    describe('sortUsers', () => {
        test('should sort users by name ascending', () => {
            const result = sortUsers(mockUsers, 'name', 'asc');
            expect(result[0].name).toBe('bob wilson');
            expect(result[1].name).toBe('Jane Smith');
            expect(result[2].name).toBe('John Doe');
        });
        
        test('should sort users by name descending', () => {
            const result = sortUsers(mockUsers, 'name', 'desc');
            expect(result[0].name).toBe('John Doe');
            expect(result[2].name).toBe('bob wilson');
        });
        
        test('should sort users by date fields', () => {
            const result = sortUsers(mockUsers, 'created_at', 'asc');
            expect(result[0].name).toBe('Jane Smith'); // Earliest date
        });
        
        test('should handle invalid input', () => {
            expect(sortUsers(null)).toEqual([]);
            expect(sortUsers('not-an-array')).toEqual([]);
        });
    });
    
    // Test validateUserData
    describe('validateUserData', () => {
        test('should validate correct user data', () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'researcher'
            };
            const result = validateUserData(userData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        
        test('should catch missing name', () => {
            const userData = {
                email: 'john@example.com',
                role: 'researcher'
            };
            const result = validateUserData(userData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Name is required');
        });
        
        test('should catch invalid email', () => {
            const userData = {
                name: 'John Doe',
                email: 'invalid-email',
                role: 'researcher'
            };
            const result = validateUserData(userData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Valid email is required');
        });
        
        test('should catch missing role', () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com'
            };
            const result = validateUserData(userData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Role is required');
        });
    });
    
    // Test isValidEmail
    describe('isValidEmail', () => {
        test('should validate correct email formats', () => {
            expect(isValidEmail('user@example.com')).toBe(true);
            expect(isValidEmail('test.email@domain.co.uk')).toBe(true);
            expect(isValidEmail('user+tag@example.org')).toBe(true);
        });
        
        test('should reject invalid email formats', () => {
            expect(isValidEmail('invalid-email')).toBe(false);
            expect(isValidEmail('@example.com')).toBe(false);
            expect(isValidEmail('user@')).toBe(false);
            expect(isValidEmail('')).toBe(false);
        });
    });
    
    // Test getUserStats
    describe('getUserStats', () => {
        test('should calculate correct user statistics', () => {
            const stats = getUserStats(mockUsers);
            expect(stats.total).toBe(3);
            expect(stats.researchers).toBe(2);
            expect(stats.reviewers).toBe(1);
            expect(stats.activeReviewers).toBe(2);
            expect(stats.pendingPromotions).toBe(1);
            expect(stats.avgResearchExperience).toBe(5.3); // (5+8+3)/3
            expect(stats.totalProjectsCreated).toBe(12); // 3+7+2
        });
        
        test('should handle invalid input', () => {
            const stats = getUserStats(null);
            expect(stats).toEqual({});
        });
    });
    
    // Test canPromoteUser
    describe('canPromoteUser', () => {
        test('should return true for researcher with pending promotion', () => {
            expect(canPromoteUser(mockUsers[0])).toBe(true); // John Doe
        });
        
        test('should return false for already promoted user', () => {
            expect(canPromoteUser(mockUsers[2])).toBe(false); // Bob Wilson
        });
        
        test('should return false for reviewer', () => {
            expect(canPromoteUser(mockUsers[1])).toBe(false); // Jane Smith
        });
        
        test('should handle null user', () => {
            expect(canPromoteUser(null)).toBe(false);
        });
    });
    
    // Test canActivateReviewer
    describe('canActivateReviewer', () => {
        test('should return true for reviewer not yet activated', () => {
            const inactiveReviewer = {
                role: 'reviewer',
                'promoted-role': 'pending'
            };
            expect(canActivateReviewer(inactiveReviewer)).toBe(true);
        });
        
        test('should return false for already active reviewer', () => {
            expect(canActivateReviewer(mockUsers[1])).toBe(false); // Jane Smith
        });
        
        test('should return false for researcher', () => {
            expect(canActivateReviewer(mockUsers[0])).toBe(false); // John Doe
        });
    });
    
    // Test getPromoteButtonText
    describe('getPromoteButtonText', () => {
        test('should return correct text for researcher', () => {
            expect(getPromoteButtonText(mockUsers[0])).toBe('Promote to Reviewer');
        });
        
        test('should return correct text for reviewer', () => {
            expect(getPromoteButtonText(mockUsers[1])).toBe('Activate Reviewer');
        });
        
        test('should handle null user', () => {
            expect(getPromoteButtonText(null)).toBe('Promote User');
        });
    });
    
    // Test formatResearchAreas
    describe('formatResearchAreas', () => {
        test('should format comma-separated research areas', () => {
            const result = formatResearchAreas('machine learning, artificial intelligence, data science');
            expect(result).toEqual(['Machine learning', 'Artificial intelligence', 'Data science']);
        });
        
        test('should handle empty or null input', () => {
            expect(formatResearchAreas('')).toEqual([]);
            expect(formatResearchAreas(null)).toEqual([]);
        });
        
        test('should filter out empty areas', () => {
            const result = formatResearchAreas('ai, , machine learning,  ');
            expect(result).toEqual(['Ai', 'Machine learning']);
        });
    });
    
    // Test createUserDisplayData
    describe('createUserDisplayData', () => {
        test('should create correct display data for user', () => {
            const result = createUserDisplayData(mockUsers[0], 0);
            expect(result.displayId).toBe(1);
            expect(result.name).toBe('John Doe');
            expect(result.email).toBe('john@example.com');
            expect(result.role).toBe('Researcher');
            expect(result.promotedRole).toBe('Pending');
            expect(result.statusClass).toBe('status-pending');
            expect(result.canPromote).toBe(true);
            expect(result.promoteButtonText).toBe('Promote to Reviewer');
        });
        
        test('should handle user with missing data', () => {
            const incompleteUser = { id: 99 };
            const result = createUserDisplayData(incompleteUser, 5);
            expect(result.displayId).toBe(6);
            expect(result.name).toBe('N/A');
            expect(result.email).toBe('N/A');
            expect(result.role).toBe('');
            expect(result.joinDate).toBe('N/A');
        });
    });
});

// Mock console for testing
console.log('Running admUserManagementUtils tests...');

// Simple test runner for browser environment
if (typeof window !== 'undefined') {
    // Browser test runner
    function runTests() {
        const testResults = {
            passed: 0,
            failed: 0,
            errors: []
        };
        
        try {
            // Run basic tests that don't require Jest
            console.log('Testing getStatusClass...');
            if (getStatusClass('reviewer') === 'status-active') testResults.passed++;
            else testResults.failed++;
            
            console.log('Testing capitalizeFirstLetter...');
            if (capitalizeFirstLetter('hello') === 'Hello') testResults.passed++;
            else testResults.failed++;
            
            console.log('Testing getInitials...');
            if (getInitials('John Doe') === 'JD') testResults.passed++;
            else testResults.failed++;
            
            console.log('Testing isValidEmail...');
            if (isValidEmail('test@example.com') === true) testResults.passed++;
            else testResults.failed++;
            
            console.log('Testing filterUsersByRole...');
            const filtered = filterUsersByRole(mockUsers, ['researcher']);
            if (filtered.length === 2) testResults.passed++;
            else testResults.failed++;
            
            console.log(`Tests completed: ${testResults.passed} passed, ${testResults.failed} failed`);
            
        } catch (error) {
            testResults.errors.push(error.message);
            console.error('Test error:', error);
        }
        
        return testResults;
    }
    
    // Auto-run tests in browser
    document.addEventListener('DOMContentLoaded', runTests);
}