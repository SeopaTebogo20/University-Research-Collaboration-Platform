// projectsUtil.test.js

const {
    getStatusClassForProject,
    formatProjectDate,
    formatProjectDateRange,
    parseCommaSeparatedValues,
    formatCommaSeparatedAsTags,
    formatCommaSeparatedAsText,
    getExperienceLevelIcon,
    validateProjectData,
    sanitizeProjectData,
    calculateProjectProgress,
    getProjectDaysRemaining,
    isProjectOverdue,
    generateProjectSummary,
    filterProjectsBySearchQuery,
    sortProjectsByField,
    groupProjectsByStatus
} = require('../src/public/js/projectsUtils');

// Mock Date for consistent testing
const originalDate = Date;
const mockDate = (dateString) => {
    global.Date = class extends originalDate {
        constructor(...args) {
            if (args.length === 0) {
                return new originalDate(dateString);
            }
            return new originalDate(...args);
        }
        static now() {
            return new originalDate(dateString).getTime();
        }
    };
};

const resetDate = () => {
    global.Date = originalDate;
};

describe('projectsUtil', () => {
    afterEach(() => {
        resetDate();
    });

    describe('getStatusClassForProject', () => {
        test('should return default class for null/undefined status', () => {
            expect(getStatusClassForProject(null)).toBe('status-active');
            expect(getStatusClassForProject(undefined)).toBe('status-active');
            expect(getStatusClassForProject('')).toBe('status-active');
        });

        test('should return correct classes for known statuses', () => {
            expect(getStatusClassForProject('completed')).toBe('status-completed');
            expect(getStatusClassForProject('ACTIVE')).toBe('status-active');
            expect(getStatusClassForProject('Pending')).toBe('status-pending');
            expect(getStatusClassForProject('delayed')).toBe('status-delayed');
            expect(getStatusClassForProject('cancelled')).toBe('status-cancelled');
        });

        test('should return default class for unknown status', () => {
            expect(getStatusClassForProject('unknown')).toBe('status-active');
        });
    });

    describe('formatProjectDate', () => {
        test('should format valid date strings', () => {
            const result = formatProjectDate('2024-01-15');
            expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Format varies by locale
        });

        test('should handle null/undefined dates', () => {
            expect(formatProjectDate(null)).toBe('Not specified');
            expect(formatProjectDate(undefined)).toBe('Not specified');
            expect(formatProjectDate('')).toBe('Not specified');
        });

        test('should handle invalid dates', () => {
            expect(formatProjectDate('invalid-date')).toBe('Invalid date');
        });
    });

    describe('formatProjectDateRange', () => {
        test('should format date range', () => {
            const result = formatProjectDateRange('2024-01-15', '2024-12-15');
            expect(result).toContain(' - ');
        });

        test('should handle null dates in range', () => {
            const result = formatProjectDateRange(null, null);
            expect(result).toBe('Not specified - Not specified');
        });
    });

    describe('parseCommaSeparatedValues', () => {
        test('should parse comma-separated string', () => {
            const result = parseCommaSeparatedValues('item1, item2, item3');
            expect(result).toEqual(['item1', 'item2', 'item3']);
        });

        test('should trim whitespace', () => {
            const result = parseCommaSeparatedValues('  item1  ,  item2  ,  item3  ');
            expect(result).toEqual(['item1', 'item2', 'item3']);
        });

        test('should filter empty items', () => {
            const result = parseCommaSeparatedValues('item1, , item3, ');
            expect(result).toEqual(['item1', 'item3']);
        });

        test('should handle null/undefined values', () => {
            expect(parseCommaSeparatedValues(null)).toEqual([]);
            expect(parseCommaSeparatedValues(undefined)).toEqual([]);
            expect(parseCommaSeparatedValues('')).toEqual([]);
        });
    });

    describe('formatCommaSeparatedAsTags', () => {
        test('should format items as HTML tags', () => {
            const result = formatCommaSeparatedAsTags('item1, item2');
            expect(result).toBe('<span class="tag">item1</span><span class="tag">item2</span>');
        });

        test('should use custom tag class', () => {
            const result = formatCommaSeparatedAsTags('item1', 'custom-tag');
            expect(result).toBe('<span class="custom-tag">item1</span>');
        });

        test('should handle empty values', () => {
            const result = formatCommaSeparatedAsTags('');
            expect(result).toBe('<span class="tag">None specified</span>');
        });
    });

    describe('formatCommaSeparatedAsText', () => {
        test('should format items as text', () => {
            const result = formatCommaSeparatedAsText('item1, item2, item3');
            expect(result).toBe('item1, item2, item3');
        });

        test('should use custom separator', () => {
            const result = formatCommaSeparatedAsText('item1, item2', ' | ');
            expect(result).toBe('item1 | item2');
        });

        test('should handle empty values', () => {
            const result = formatCommaSeparatedAsText('');
            expect(result).toBe('None specified');
        });
    });

    describe('getExperienceLevelIcon', () => {
        test('should return correct icons for experience levels', () => {
            expect(getExperienceLevelIcon('beginner')).toBe('fa-seedling');
            expect(getExperienceLevelIcon('INTERMEDIATE')).toBe('fa-user-graduate');
            expect(getExperienceLevelIcon('Advanced')).toBe('fa-star');
            expect(getExperienceLevelIcon('expert')).toBe('fa-crown');
        });

        test('should return default icon for unknown level', () => {
            expect(getExperienceLevelIcon('unknown')).toBe('fa-user');
            expect(getExperienceLevelIcon(null)).toBe('fa-user');
        });
    });

    describe('validateProjectData', () => {
        const validProject = {
            project_title: 'Test Project',
            researcher_name: 'John Doe',
            description: 'Test description',
            start_date: '2024-01-01',
            end_date: '2024-12-31'
        };

        test('should return no errors for valid project', () => {
            const errors = validateProjectData(validProject);
            expect(errors).toEqual([]);
        });

        test('should return error for missing title', () => {
            const project = { ...validProject, project_title: '' };
            const errors = validateProjectData(project);
            expect(errors).toContain('Project title is required');
        });

        test('should return error for missing researcher name', () => {
            const project = { ...validProject, researcher_name: '' };
            const errors = validateProjectData(project);
            expect(errors).toContain('Researcher name is required');
        });

        test('should return error for invalid date range', () => {
            const project = { 
                ...validProject, 
                start_date: '2024-12-31', 
                end_date: '2024-01-01' 
            };
            const errors = validateProjectData(project);
            expect(errors).toContain('End date must be after start date');
        });

        test('should return multiple errors', () => {
            const project = {
                project_title: '',
                researcher_name: '',
                description: '',
                start_date: '',
                end_date: ''
            };
            const errors = validateProjectData(project);
            expect(errors.length).toBeGreaterThan(1);
        });
    });

    describe('sanitizeProjectData', () => {
        test('should trim string fields', () => {
            const project = {
                project_title: '  Test Project  ',
                researcher_name: '  John Doe  '
            };
            const sanitized = sanitizeProjectData(project);
            expect(sanitized.project_title).toBe('Test Project');
            expect(sanitized.researcher_name).toBe('John Doe');
        });

        test('should set default values', () => {
            const project = {};
            const sanitized = sanitizeProjectData(project);
            expect(sanitized.experience_level).toBe('Intermediate');
            expect(sanitized.status).toBe('Active');
        });

        test('should ensure boolean values', () => {
            const project = { funding_available: 'true' };
            const sanitized = sanitizeProjectData(project);
            expect(sanitized.funding_available).toBe(true);
        });
    });

    describe('calculateProjectProgress', () => {
        beforeEach(() => {
            mockDate('2024-06-15'); // Mock current date to middle of year
        });

        test('should return 100 for completed projects', () => {
            const progress = calculateProjectProgress('2024-01-01', '2024-12-31', 'completed');
            expect(progress).toBe(100);
        });

        test('should return 0 for projects not yet started', () => {
            const progress = calculateProjectProgress('2024-07-01', '2024-12-31', 'active');
            expect(progress).toBe(0);
        });

        test('should calculate progress for active projects', () => {
            const progress = calculateProjectProgress('2024-01-01', '2024-12-31', 'active');
            expect(progress).toBeGreaterThan(0);
            expect(progress).toBeLessThan(100);
        });

        test('should return 0 for missing dates', () => {
            expect(calculateProjectProgress(null, null, 'active')).toBe(0);
        });
    });

    describe('getProjectDaysRemaining', () => {
        beforeEach(() => {
            mockDate('2024-06-15');
        });

        test('should calculate days remaining', () => {
            const days = getProjectDaysRemaining('2024-06-20');
            expect(days).toBe(5);
        });

        test('should return negative for past dates', () => {
            const days = getProjectDaysRemaining('2024-06-10');
            expect(days).toBeLessThan(0);
        });

        test('should return null for invalid date', () => {
            const days = getProjectDaysRemaining(null);
            expect(days).toBe(null);
        });
    });

    describe('isProjectOverdue', () => {
        beforeEach(() => {
            mockDate('2024-06-15');
        });

        test('should return true for overdue projects', () => {
            expect(isProjectOverdue('2024-06-10', 'active')).toBe(true);
        });

        test('should return false for future end dates', () => {
            expect(isProjectOverdue('2024-06-20', 'active')).toBe(false);
        });

        test('should return false for completed projects', () => {
            expect(isProjectOverdue('2024-06-10', 'completed')).toBe(false);
        });

        test('should return false for missing end date', () => {
            expect(isProjectOverdue(null, 'active')).toBe(false);
        });
    });

    describe('generateProjectSummary', () => {
        const project = {
            project_title: 'Test Project',
            researcher_name: 'John Doe',
            status: 'active',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            key_research_area: 'AI, Machine Learning',
            skills_and_expertise: 'Python, JavaScript',
            funding_available: true,
            experience_level: 'Advanced'
        };

        test('should generate complete project summary', () => {
            const summary = generateProjectSummary(project);
            
            expect(summary.title).toBe('Test Project');
            expect(summary.researcher).toBe('John Doe');
            expect(summary.status).toBe('active');
            expect(summary.statusClass).toBe('status-active');
            expect(summary.researchAreas).toEqual(['AI', 'Machine Learning']);
            expect(summary.skills).toEqual(['Python', 'JavaScript']);
            expect(summary.hasFunding).toBe(true);
            expect(summary.experienceLevel).toBe('Advanced');
            expect(summary.experienceIcon).toBe('fa-star');
        });

        test('should handle missing project data', () => {
            const summary = generateProjectSummary({});
            
            expect(summary.title).toBe('Untitled Project');
            expect(summary.researcher).toBe('Unknown Researcher');
            expect(summary.status).toBe('Active');
            expect(summary.experienceLevel).toBe('Intermediate');
        });
    });

    describe('filterProjectsBySearchQuery', () => {
        const projects = [
            { project_title: 'AI Research', researcher_name: 'John Doe', description: 'Machine learning project' },
            { project_title: 'Web Development', researcher_name: 'Jane Smith', description: 'React application' },
            { project_title: 'Data Analysis', researcher_name: 'Bob Johnson', key_research_area: 'Statistics, AI' }
        ];

        test('should return all projects for empty query', () => {
            const result = filterProjectsBySearchQuery(projects, '');
            expect(result).toEqual(projects);
        });

        test('should filter by project title', () => {
            const result = filterProjectsBySearchQuery(projects, 'AI');
            expect(result).toHaveLength(2); // "AI Research" and "Data Analysis" (contains AI in research area)
        });

        test('should filter by researcher name', () => {
    const result = filterProjectsBySearchQuery(projects, 'John');
    expect(result).toHaveLength(2); // Now expecting both "John Doe" and "Bob Johnson"
    expect(result[0].researcher_name).toBe('John Doe');
});

        test('should be case insensitive', () => {
            const result = filterProjectsBySearchQuery(projects, 'ai');
            expect(result.length).toBeGreaterThan(0);
        });
    });

    describe('sortProjectsByField', () => {
        const projects = [
            { project_title: 'B Project', start_date: '2024-02-01' },
            { project_title: 'A Project', start_date: '2024-01-01' },
            { project_title: 'C Project', start_date: '2024-03-01' }
        ];

        test('should sort by string field ascending', () => {
            const result = sortProjectsByField(projects, 'project_title', 'asc');
            expect(result[0].project_title).toBe('A Project');
            expect(result[2].project_title).toBe('C Project');
        });

        test('should sort by string field descending', () => {
            const result = sortProjectsByField(projects, 'project_title', 'desc');
            expect(result[0].project_title).toBe('C Project');
            expect(result[2].project_title).toBe('A Project');
        });

        test('should sort by date field', () => {
            const result = sortProjectsByField(projects, 'start_date', 'asc');
            expect(result[0].start_date).toBe('2024-01-01');
            expect(result[2].start_date).toBe('2024-03-01');
        });

        test('should not mutate original array', () => {
            const originalOrder = projects.map(p => p.project_title);
            sortProjectsByField(projects, 'project_title', 'asc');
            const currentOrder = projects.map(p => p.project_title);
            expect(currentOrder).toEqual(originalOrder);
        });
    });

    describe('groupProjectsByStatus', () => {
        const projects = [
            { status: 'active' },
            { status: 'completed' },
            { status: 'Active' },
            { status: 'pending' },
            { status: 'unknown' },
            { status: null }
        ];

        test('should group projects by status', () => {
    const groups = groupProjectsByStatus(projects);
    
    expect(groups.active).toHaveLength(3); // 'active', 'Active' and null (defaults to active)
    expect(groups.completed).toHaveLength(1);
    expect(groups.pending).toHaveLength(1);
    expect(groups.other).toHaveLength(1); // 'unknown' status
});

        test('should handle case insensitive grouping', () => {
    const groups = groupProjectsByStatus(projects);
    expect(groups.active).toHaveLength(3); // 'active', 'Active' and null
});

        test('should create all status groups even if empty', () => {
            const groups = groupProjectsByStatus([]);
            expect(groups).toHaveProperty('active');
            expect(groups).toHaveProperty('pending');
            expect(groups).toHaveProperty('completed');
            expect(groups).toHaveProperty('delayed');
            expect(groups).toHaveProperty('cancelled');
            expect(groups).toHaveProperty('other');
        });
    });
});