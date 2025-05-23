// admDashboardUtils.js

// Helper functions for admin dashboard data display and management

function getEventStatusClass(category) {
    if (!category) return 'status-default';
    
    switch(category.toLowerCase()) {
        case 'important': return 'status-important';
        case 'deadline': return 'status-deadline';
        case 'standard': return 'status-standard';
        default: return 'status-default';
    }
}

function getEventIcon(category) {
    switch(category.toLowerCase()) {
        case 'important': return 'fa-star';
        case 'deadline': return 'fa-clock';
        case 'standard': return 'fa-calendar-check';
        default: return 'fa-calendar';
    }
}

function getNotificationTypeClass(type) {
    if (!type) return 'notification-info';
    
    switch(type.toLowerCase()) {
        case 'urgent': return 'notification-urgent';
        case 'warning': return 'notification-warning';
        case 'info': return 'notification-info';
        case 'success': return 'notification-success';
        default: return 'notification-info';
    }
}

function getSystemHealthStatus(healthPercentage) {
    if (healthPercentage >= 95) return 'excellent';
    if (healthPercentage >= 85) return 'good';
    if (healthPercentage >= 70) return 'fair';
    if (healthPercentage >= 50) return 'poor';
    return 'critical';
}

function formatUserCount(count) {
    if (!count || count === 0) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return (count / 1000).toFixed(1) + 'K';
    return (count / 1000000).toFixed(1) + 'M';
}

function getReportTypeIcon(reportType) {
    switch(reportType.toLowerCase()) {
        case 'user_activity': return 'fa-users';
        case 'proposals': return 'fa-file-alt';
        case 'system_performance': return 'fa-chart-line';
        case 'financial': return 'fa-dollar-sign';
        default: return 'fa-file';
    }
}

function getFileFormatIcon(format) {
    switch(format.toLowerCase()) {
        case 'pdf': return 'fa-file-pdf';
        case 'excel': return 'fa-file-excel';
        case 'csv': return 'fa-file-csv';
        case 'json': return 'fa-file-code';
        default: return 'fa-file';
    }
}

function validateTimeframe(period) {
    const validPeriods = ['week', 'month', 'year'];
    return validPeriods.includes(period.toLowerCase());
}

function generateMockChartData(period) {
    let labels, researcherData, reviewerData;
    
    switch(period.toLowerCase()) {
        case 'week':
            labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            researcherData = [28, 32, 25, 37, 41, 22, 15];
            reviewerData = [15, 17, 12, 19, 22, 18, 10];
            break;
        case 'month':
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            researcherData = [120, 145, 132, 150];
            reviewerData = [65, 72, 70, 82];
            break;
        case 'year':
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            researcherData = [450, 420, 480, 470, 540, 560, 490, 420, 510, 530, 580, 610];
            reviewerData = [210, 200, 220, 215, 240, 260, 230, 200, 220, 250, 270, 290];
            break;
        default:
            labels = [];
            researcherData = [];
            reviewerData = [];
    }
    
    return { labels, researcherData, reviewerData };
}

function formatDateForCalendar(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

function getMonthName(monthIndex) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex] || '';
}

function calculateGaugeProgress(value, maxValue = 100) {
    if (!value || value < 0) return 0;
    if (value > maxValue) return 1;
    return value / maxValue;
}

function generateEventCategories() {
    return ['important', 'deadline', 'standard'];
}

function generateEventTitles() {
    return [
        'Team Meeting',
        'System Maintenance',
        'Grant Deadline',
        'User Training',
        'Database Backup',
        'Security Audit',
        'Performance Review',
        'Budget Planning',
        'Quarterly Review',
        'New User Onboarding'
    ];
}

function validateNotificationData(notification) {
    const requiredFields = ['title', 'message', 'type', 'recipients'];
    const errors = [];
    
    requiredFields.forEach(field => {
        if (!notification[field] || notification[field].trim() === '') {
            errors.push(`${field} is required`);
        }
    });
    
    if (notification.type && !['urgent', 'warning', 'info', 'success'].includes(notification.type.toLowerCase())) {
        errors.push('Invalid notification type');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

function validateReportData(reportData) {
    const requiredFields = ['reportType', 'dateRange', 'fileFormat'];
    const errors = [];
    
    requiredFields.forEach(field => {
        if (!reportData[field] || reportData[field].trim() === '') {
            errors.push(`${field} is required`);
        }
    });
    
    if (reportData.fileFormat && !['pdf', 'excel', 'csv', 'json'].includes(reportData.fileFormat.toLowerCase())) {
        errors.push('Invalid file format');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

function getRandomEventTitle() {
    const titles = generateEventTitles();
    return titles[Math.floor(Math.random() * titles.length)];
}

function getRandomEventCategory() {
    const categories = generateEventCategories();
    return categories[Math.floor(Math.random() * categories.length)];
}

module.exports = {
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
};