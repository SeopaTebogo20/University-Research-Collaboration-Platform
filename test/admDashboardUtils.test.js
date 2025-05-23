// admDashboardUtils.test.js

const {
    getEventStatusClass,
    getEventIcon,
    getNotificationTypeClass,
    getSystemHealthStatus,
    formatUserCount,
    getReportTypeIcon,
    getFileFormatIcon,
    validateTimeframe,
    generateMockChartData,
    formatDateForCalendar,
    getMonthName,
    calculateGaugeProgress,
    generateEventCategories,
    generateEventTitles,
    validateNotificationData,
    validateReportData,
    capitalizeFirstLetter,
    getDaysInMonth,
    getRandomEventTitle,
    getRandomEventCategory
} = require('../src/public/js/admDashboardUtils');

describe('admDashboardUtils', () => {
    
    describe('getEventStatusClass', () => {
        test('should return correct status class for valid categories', () => {
            expect(getEventStatusClass('important')).toBe('status-important');
            expect(getEventStatusClass('deadline')).toBe('status-deadline');
            expect(getEventStatusClass('standard')).toBe('status-standard');
        });
        
        test('should be case insensitive', () => {
            expect(getEventStatusClass('IMPORTANT')).toBe('status-important');
            expect(getEventStatusClass('DeadLine')).toBe('status-deadline');
        });
        
        test('should return default for invalid or null inputs', () => {
            expect(getEventStatusClass('invalid')).toBe('status-default');
            expect(getEventStatusClass(null)).toBe('status-default');
            expect(getEventStatusClass('')).toBe('status-default');
        });
    });
    
    describe('getEventIcon', () => {
        test('should return correct icons for event categories', () => {
            expect(getEventIcon('important')).toBe('fa-star');
            expect(getEventIcon('deadline')).toBe('fa-clock');
            expect(getEventIcon('standard')).toBe('fa-calendar-check');
        });
        
        test('should return default icon for unknown category', () => {
            expect(getEventIcon('unknown')).toBe('fa-calendar');
        });
    });
    
    describe('getNotificationTypeClass', () => {
        test('should return correct notification classes', () => {
            expect(getNotificationTypeClass('urgent')).toBe('notification-urgent');
            expect(getNotificationTypeClass('warning')).toBe('notification-warning');
            expect(getNotificationTypeClass('info')).toBe('notification-info');
            expect(getNotificationTypeClass('success')).toBe('notification-success');
        });
        
        test('should return default for invalid types', () => {
            expect(getNotificationTypeClass('invalid')).toBe('notification-info');
            expect(getNotificationTypeClass(null)).toBe('notification-info');
        });
    });
    
    describe('getSystemHealthStatus', () => {
        test('should return correct health status based on percentage', () => {
            expect(getSystemHealthStatus(98)).toBe('excellent');
            expect(getSystemHealthStatus(90)).toBe('good');
            expect(getSystemHealthStatus(75)).toBe('fair');
            expect(getSystemHealthStatus(60)).toBe('poor');
            expect(getSystemHealthStatus(30)).toBe('critical');
        });
        
        test('should handle edge cases', () => {
            expect(getSystemHealthStatus(95)).toBe('excellent');
            expect(getSystemHealthStatus(85)).toBe('good');
            expect(getSystemHealthStatus(70)).toBe('fair');
            expect(getSystemHealthStatus(50)).toBe('poor');
        });
    });
    
    describe('formatUserCount', () => {
        test('should format numbers correctly', () => {
            expect(formatUserCount(0)).toBe('0');
            expect(formatUserCount(500)).toBe('500');
            expect(formatUserCount(1500)).toBe('1.5K');
            expect(formatUserCount(1000000)).toBe('1.0M');
        });
        
        test('should handle null and undefined', () => {
            expect(formatUserCount(null)).toBe('0');
            expect(formatUserCount(undefined)).toBe('0');
        });
    });
    
    describe('getReportTypeIcon', () => {
        test('should return correct icons for report types', () => {
            expect(getReportTypeIcon('user_activity')).toBe('fa-users');
            expect(getReportTypeIcon('proposals')).toBe('fa-file-alt');
            expect(getReportTypeIcon('system_performance')).toBe('fa-chart-line');
            expect(getReportTypeIcon('financial')).toBe('fa-dollar-sign');
        });
        
        test('should return default icon for unknown type', () => {
            expect(getReportTypeIcon('unknown')).toBe('fa-file');
        });
    });
    
    describe('getFileFormatIcon', () => {
        test('should return correct icons for file formats', () => {
            expect(getFileFormatIcon('pdf')).toBe('fa-file-pdf');
            expect(getFileFormatIcon('excel')).toBe('fa-file-excel');
            expect(getFileFormatIcon('csv')).toBe('fa-file-csv');
            expect(getFileFormatIcon('json')).toBe('fa-file-code');
        });
        
        test('should return default icon for unknown format', () => {
            expect(getFileFormatIcon('unknown')).toBe('fa-file');
        });
    });
    
    describe('validateTimeframe', () => {
        test('should validate correct timeframes', () => {
            expect(validateTimeframe('week')).toBe(true);
            expect(validateTimeframe('month')).toBe(true);
            expect(validateTimeframe('year')).toBe(true);
        });
        
        test('should be case insensitive', () => {
            expect(validateTimeframe('WEEK')).toBe(true);
            expect(validateTimeframe('Month')).toBe(true);
        });
        
        test('should reject invalid timeframes', () => {
            expect(validateTimeframe('day')).toBe(false);
            expect(validateTimeframe('invalid')).toBe(false);
        });
    });
    
    describe('generateMockChartData', () => {
        test('should generate correct data structure for valid periods', () => {
            const weekData = generateMockChartData('week');
            expect(weekData).toHaveProperty('labels');
            expect(weekData).toHaveProperty('researcherData');
            expect(weekData).toHaveProperty('reviewerData');
            expect(weekData.labels).toHaveLength(7);
        });
        
        test('should handle invalid periods', () => {
            const invalidData = generateMockChartData('invalid');
            expect(invalidData.labels).toHaveLength(0);
            expect(invalidData.researcherData).toHaveLength(0);
            expect(invalidData.reviewerData).toHaveLength(0);
        });
    });
    
    describe('formatDateForCalendar', () => {
        test('should format date correctly', () => {
            const date = new Date('2025-05-23');
            expect(formatDateForCalendar(date)).toBe('2025-05-23');
        });
        
        test('should handle string dates', () => {
            expect(formatDateForCalendar('2025-05-23')).toBe('2025-05-23');
        });
        
        test('should handle null/undefined', () => {
            expect(formatDateForCalendar(null)).toBe('');
            expect(formatDateForCalendar(undefined)).toBe('');
        });
    });
    
    describe('getMonthName', () => {
        test('should return correct month names', () => {
            expect(getMonthName(0)).toBe('January');
            expect(getMonthName(11)).toBe('December');
            expect(getMonthName(5)).toBe('June');
        });
        
        test('should handle invalid indices', () => {
            expect(getMonthName(-1)).toBe('');
            expect(getMonthName(12)).toBe('');
        });
    });
    
    describe('calculateGaugeProgress', () => {
        test('should calculate correct progress', () => {
            expect(calculateGaugeProgress(50, 100)).toBe(0.5);
            expect(calculateGaugeProgress(75, 100)).toBe(0.75);
            expect(calculateGaugeProgress(100, 100)).toBe(1);
        });
        
        test('should handle edge cases', () => {
            expect(calculateGaugeProgress(0)).toBe(0);
            expect(calculateGaugeProgress(-10)).toBe(0);
            expect(calculateGaugeProgress(150, 100)).toBe(1);
            expect(calculateGaugeProgress(null)).toBe(0);
        });
    });
    
    describe('generateEventCategories', () => {
        test('should return array of event categories', () => {
            const categories = generateEventCategories();
            expect(Array.isArray(categories)).toBe(true);
            expect(categories).toContain('important');
            expect(categories).toContain('deadline');
            expect(categories).toContain('standard');
        });
    });
    
    describe('generateEventTitles', () => {
        test('should return array of event titles', () => {
            const titles = generateEventTitles();
            expect(Array.isArray(titles)).toBe(true);
            expect(titles.length).toBeGreaterThan(0);
            expect(titles).toContain('Team Meeting');
        });
    });
    
    describe('validateNotificationData', () => {
        test('should validate correct notification data', () => {
            const validNotification = {
                title: 'Test Title',
                message: 'Test Message',
                type: 'info',
                recipients: 'all'
            };
            
            const result = validateNotificationData(validNotification);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        
        test('should detect missing required fields', () => {
            const invalidNotification = {
                title: '',
                message: 'Test Message'
            };
            
            const result = validateNotificationData(invalidNotification);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
        
        test('should validate notification type', () => {
            const invalidTypeNotification = {
                title: 'Test',
                message: 'Test',
                type: 'invalid',
                recipients: 'all'
            };
            
            const result = validateNotificationData(invalidTypeNotification);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Invalid notification type');
        });
    });
    
    describe('validateReportData', () => {
        test('should validate correct report data', () => {
            const validReport = {
                reportType: 'user_activity',
                dateRange: 'last_week',
                fileFormat: 'pdf'
            };
            
            const result = validateReportData(validReport);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        
        test('should detect invalid file format', () => {
            const invalidReport = {
                reportType: 'user_activity',
                dateRange: 'last_week',
                fileFormat: 'invalid'
            };
            
            const result = validateReportData(invalidReport);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Invalid file format');
        });
    });
    
    describe('capitalizeFirstLetter', () => {
        test('should capitalize first letter', () => {
            expect(capitalizeFirstLetter('hello')).toBe('Hello');
            expect(capitalizeFirstLetter('WORLD')).toBe('WORLD');
        });
        
        test('should handle empty strings', () => {
            expect(capitalizeFirstLetter('')).toBe('');
            expect(capitalizeFirstLetter(null)).toBe('');
            expect(capitalizeFirstLetter(undefined)).toBe('');
        });
    });
    
    describe('getDaysInMonth', () => {
        test('should return correct number of days', () => {
            expect(getDaysInMonth(2025, 1)).toBe(31); // January
            expect(getDaysInMonth(2025, 2)).toBe(28); // February (non-leap year)
            expect(getDaysInMonth(2024, 2)).toBe(29); // February (leap year)
            expect(getDaysInMonth(2025, 4)).toBe(30); // April
        });
    });
    
    describe('getRandomEventTitle', () => {
        test('should return a string', () => {
            const title = getRandomEventTitle();
            expect(typeof title).toBe('string');
            expect(title.length).toBeGreaterThan(0);
        });
        
        test('should return a title from the predefined list', () => {
            const titles = generateEventTitles();
            const randomTitle = getRandomEventTitle();
            expect(titles).toContain(randomTitle);
        });
    });
    
    describe('getRandomEventCategory', () => {
        test('should return a valid category', () => {
            const category = getRandomEventCategory();
            const validCategories = generateEventCategories();
            expect(validCategories).toContain(category);
        });
    });
});