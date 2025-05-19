// mydashboardUtils.js

// Helper functions for widget data display
function getStatusClass(status) {
    if (!status) return 'status-default';
    
    switch(status.toLowerCase()) {
        case 'completed': return 'status-completed';
        case 'active': return 'status-active';
        case 'pending': return 'status-pending';
        case 'delayed': return 'status-delayed';
        default: return 'status-default';
    }
}

function getActivityIcon(activityType) {
    switch(activityType.toLowerCase()) {
        case 'project': return 'fa-project-diagram';
        case 'milestone': return 'fa-clipboard-check';
        case 'funding': return 'fa-coins';
        case 'collaboration': return 'fa-users';
        default: return 'fa-info-circle';
    }
}

function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getDefaultWidgetWidth(widgetType) {
    const widthMap = {
        'projects': 6,
        'milestones': 6,
        'funding': 12,
        'calendar': 6,
        'recent_activity': 6,
        'ai_suggestions': 6
    };
    return widthMap[widgetType] || 6;
}

function getDefaultWidgetHeight(widgetType) {
    const heightMap = {
        'projects': 4,
        'milestones': 4,
        'funding': 8,
        'calendar': 6,
        'recent_activity': 4,
        'ai_suggestions': 5
    };
    return heightMap[widgetType] || 4;
}

function isWidgetOnDashboard(grid, widgetType) {
    return grid.engine.nodes.some(node => 
        node.el && node.el.getAttribute('data-widget-type') === widgetType
    );
}

module.exports = {
    getStatusClass,
    getActivityIcon,
    capitalizeFirstLetter,
    getDefaultWidgetWidth,
    getDefaultWidgetHeight,
    isWidgetOnDashboard
};