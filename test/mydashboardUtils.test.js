// mydashboardUtils.test.js
const {
    getStatusClass,
    getActivityIcon,
    capitalizeFirstLetter,
    getDefaultWidgetWidth,
    getDefaultWidgetHeight,
    isWidgetOnDashboard
} = require('../src/public/js/mydashboardUtils');

describe('getStatusClass', () => {
    test('returns correct class for completed status', () => {
        expect(getStatusClass('completed')).toBe('status-completed');
    });

    test('returns correct class for active status', () => {
        expect(getStatusClass('active')).toBe('status-active');
    });

    test('returns correct class for pending status', () => {
        expect(getStatusClass('pending')).toBe('status-pending');
    });

    test('returns correct class for delayed status', () => {
        expect(getStatusClass('delayed')).toBe('status-delayed');
    });

    test('returns default class for unknown status', () => {
        expect(getStatusClass('unknown')).toBe('status-default');
    });

    test('returns default class for empty status', () => {
        expect(getStatusClass('')).toBe('status-default');
    });

    test('returns default class for undefined status', () => {
        expect(getStatusClass()).toBe('status-default');
    });
});

describe('getActivityIcon', () => {
    test('returns correct icon for project activity', () => {
        expect(getActivityIcon('project')).toBe('fa-project-diagram');
    });

    test('returns correct icon for milestone activity', () => {
        expect(getActivityIcon('milestone')).toBe('fa-clipboard-check');
    });

    test('returns correct icon for funding activity', () => {
        expect(getActivityIcon('funding')).toBe('fa-coins');
    });

    test('returns correct icon for collaboration activity', () => {
        expect(getActivityIcon('collaboration')).toBe('fa-users');
    });

    test('returns default icon for unknown activity', () => {
        expect(getActivityIcon('unknown')).toBe('fa-info-circle');
    });

    test('returns default icon for empty activity', () => {
        expect(getActivityIcon('')).toBe('fa-info-circle');
    });
});

describe('capitalizeFirstLetter', () => {
    test('capitalizes first letter of a string', () => {
        expect(capitalizeFirstLetter('test')).toBe('Test');
    });

    test('handles empty string', () => {
        expect(capitalizeFirstLetter('')).toBe('');
    });

    test('handles single character', () => {
        expect(capitalizeFirstLetter('a')).toBe('A');
    });

    test('handles already capitalized string', () => {
        expect(capitalizeFirstLetter('Test')).toBe('Test');
    });
});

describe('getDefaultWidgetWidth', () => {
    test('returns correct width for projects widget', () => {
        expect(getDefaultWidgetWidth('projects')).toBe(6);
    });

    test('returns correct width for funding widget', () => {
        expect(getDefaultWidgetWidth('funding')).toBe(12);
    });

    test('returns default width for unknown widget', () => {
        expect(getDefaultWidgetWidth('unknown')).toBe(6);
    });
});

describe('getDefaultWidgetHeight', () => {
    test('returns correct height for projects widget', () => {
        expect(getDefaultWidgetHeight('projects')).toBe(4);
    });

    test('returns correct height for funding widget', () => {
        expect(getDefaultWidgetHeight('funding')).toBe(8);
    });

    test('returns default height for unknown widget', () => {
        expect(getDefaultWidgetHeight('unknown')).toBe(4);
    });
});

describe('isWidgetOnDashboard', () => {
    test('returns true when widget is on dashboard', () => {
        const mockGrid = {
            engine: {
                nodes: [
                    { el: { getAttribute: () => 'projects' } },
                    { el: { getAttribute: () => 'milestones' } }
                ]
            }
        };
        expect(isWidgetOnDashboard(mockGrid, 'projects')).toBe(true);
    });

    test('returns false when widget is not on dashboard', () => {
        const mockGrid = {
            engine: {
                nodes: [
                    { el: { getAttribute: () => 'projects' } },
                    { el: { getAttribute: () => 'milestones' } }
                ]
            }
        };
        expect(isWidgetOnDashboard(mockGrid, 'calendar')).toBe(false);
    });

    test('returns false when grid has no nodes', () => {
        const mockGrid = {
            engine: {
                nodes: []
            }
        };
        expect(isWidgetOnDashboard(mockGrid, 'projects')).toBe(false);
    });
});