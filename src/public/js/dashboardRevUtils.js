// dashboardRevUtils.js

// Helper functions for reviewer dashboard data display
function getReviewStatusClass(status) {
    if (!status) return 'status-default';
    
    switch(status.toLowerCase()) {
        case 'completed': return 'status-completed';
        case 'pending': return 'status-pending';
        case 'in-review': return 'status-in-review';
        case 'urgent': return 'status-urgent';
        case 'overdue': return 'status-overdue';
        case 'approved': return 'status-approved';
        case 'rejected': return 'status-rejected';
        case 'revisions-needed': return 'status-revisions';
        default: return 'status-default';
    }
}

function getReviewTypeIcon(reviewType) {
    switch(reviewType.toLowerCase()) {
        case 'ethics': return 'fa-balance-scale';
        case 'technical': return 'fa-cogs';
        case 'funding': return 'fa-dollar-sign';
        case 'proposal': return 'fa-file-alt';
        case 'grant': return 'fa-award';
        case 'manuscript': return 'fa-scroll';
        case 'protocol': return 'fa-clipboard-list';
        case 'data': return 'fa-database';
        default: return 'fa-file-alt';
    }
}

function getPriorityClass(priority) {
    if (!priority) return 'priority-normal';
    
    switch(priority.toLowerCase()) {
        case 'high': return 'priority-high';
        case 'urgent': return 'priority-urgent';
        case 'critical': return 'priority-critical';
        case 'medium': return 'priority-medium';
        case 'low': return 'priority-low';
        default: return 'priority-normal';
    }
}

function formatReviewDeadline(date) {
    if (!date) return 'No deadline';
    
    const deadlineDate = new Date(date);
    const now = new Date();
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
        return 'Due today';
    } else if (diffDays === 1) {
        return 'Due tomorrow';
    } else if (diffDays <= 7) {
        return `Due in ${diffDays} days`;
    } else {
        return deadlineDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: deadlineDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
}

function calculateReviewProgress(completedReviews, totalReviews) {
    if (!totalReviews || totalReviews === 0) return 0;
    return Math.round((completedReviews / totalReviews) * 100);
}

function getTimeToCompleteColor(days) {
    if (days <= 1) return 'time-excellent';
    if (days <= 3) return 'time-good';
    if (days <= 7) return 'time-average';
    return 'time-slow';
}

function sortReviewsByPriority(reviews) {
    const priorityOrder = {
        'critical': 0,
        'urgent': 1,
        'high': 2,
        'medium': 3,
        'normal': 4,
        'low': 5
    };
    
    return reviews.sort((a, b) => {
        const priorityA = priorityOrder[a.priority?.toLowerCase()] ?? 4;
        const priorityB = priorityOrder[b.priority?.toLowerCase()] ?? 4;
        
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        
        // Secondary sort by deadline
        const deadlineA = new Date(a.deadline || '9999-12-31');
        const deadlineB = new Date(b.deadline || '9999-12-31');
        return deadlineA - deadlineB;
    });
}

function formatReviewDuration(startDate, endDate) {
    if (!startDate || !endDate) return 'N/A';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Same day';
    if (diffDays === 1) return '1 day';
    return `${diffDays} days`;
}

function getDecisionIcon(decision) {
    switch(decision?.toLowerCase()) {
        case 'approved': return 'fa-check-circle';
        case 'rejected': return 'fa-times-circle';
        case 'revisions': return 'fa-edit';
        case 'pending': return 'fa-clock';
        default: return 'fa-question-circle';
    }
}

function generateReviewSummary(reviews) {
    const summary = {
        total: reviews.length,
        pending: 0,
        completed: 0,
        overdue: 0,
        avgCompletionTime: 0
    };
    
    let totalCompletionTime = 0;
    let completedCount = 0;
    const now = new Date();
    
    reviews.forEach(review => {
        const status = review.status?.toLowerCase();
        
        if (status === 'pending' || status === 'in-review') {
            summary.pending++;
            
            // Check if overdue
            if (review.deadline && new Date(review.deadline) < now) {
                summary.overdue++;
            }
        } else if (status === 'completed' || status === 'approved' || status === 'rejected') {
            summary.completed++;
            completedCount++;
            
            // Calculate completion time if dates are available
            if (review.startDate && review.endDate) {
                const start = new Date(review.startDate);
                const end = new Date(review.endDate);
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                totalCompletionTime += days;
            }
        }
    });
    
    if (completedCount > 0) {
        summary.avgCompletionTime = Math.round(totalCompletionTime / completedCount * 10) / 10;
    }
    
    return summary;
}

function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function isValidReviewData(review) {
    return !!(review && 
              typeof review === 'object' && 
              review.id && 
              review.title);
}

module.exports = {
    getReviewStatusClass,
    getReviewTypeIcon,
    getPriorityClass,
    formatReviewDeadline,
    calculateReviewProgress,
    getTimeToCompleteColor,
    sortReviewsByPriority,
    formatReviewDuration,
    getDecisionIcon,
    generateReviewSummary,
    capitalizeFirstLetter,
    isValidReviewData
};