// revDashUtils.js

// Helper functions for reviewer dashboard

/**
 * Gets the appropriate CSS class for a review status
 * @param {string} status - The review status (pending, approved, revision, rejected)
 * @returns {string} The CSS class name
 */
function getReviewStatusClass(status) {
    if (!status) return 'status-default';
    
    switch(status.toLowerCase()) {
        case 'approved': return 'status-approved';
        case 'revision': return 'status-revision';
        case 'rejected': return 'status-rejected';
        case 'pending':
        default:
            return 'status-pending';
    }
}

/**
 * Formats a date string into a relative time string (e.g., "2 days ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted relative time string
 */
function formatRelativeDate(date) {
    if (!date) return 'N/A';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    const now = new Date();
    const seconds = Math.floor((now - dateObj) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
        }
    }
    
    return 'Just now';
}

/**
 * Determines the appropriate button text and class based on review status
 * @param {string} status - The review status
 * @returns {object} { text: string, class: string }
 */
function getReviewButtonConfig(status) {
    const config = {
        text: 'View Details',
        class: 'btn btn-outline'
    };
    
    if (!status || status.toLowerCase() === 'pending') {
        config.text = 'Evaluate';
        config.class = 'btn btn-primary';
    }
    
    return config;
}

/**
 * Filters proposals based on status
 * @param {Array} proposals - Array of proposal objects
 * @param {string} filter - The filter to apply ('all', 'pending', 'approved', 'revision', 'rejected')
 * @param {Array} evaluations - Array of evaluation objects
 * @returns {Array} Filtered array of proposals
 */
function filterProposals(proposals, filter, evaluations) {
    if (filter === 'all') return [...proposals];
    
    return proposals.filter(proposal => {
        const evaluation = evaluations.find(e => e.project_id === proposal.id);
        const status = evaluation?.status || 'pending';
        
        return (filter === 'pending' && status === 'pending') ||
               (filter === 'approved' && status === 'approved') ||
               (filter === 'revision' && status === 'revision') ||
               (filter === 'rejected' && status === 'rejected');
    });
}

/**
 * Counts reviews by status
 * @param {Array} proposals - Array of proposal objects
 * @param {Array} evaluations - Array of evaluation objects
 * @returns {object} Counts by status { pending: number, completed: number }
 */
function countReviews(proposals, evaluations) {
    const counts = {
        pending: 0,
        completed: 0
    };
    
    proposals.forEach(proposal => {
        const evaluation = evaluations.find(e => e.project_id === proposal.id);
        if (!evaluation || evaluation.status === 'pending') {
            counts.pending++;
        } else {
            counts.completed++;
        }
    });
    
    return counts;
}

/**
 * Determines the API base URL based on the current environment
 * @returns {string} The base API URL
 */
function getApiBaseUrl() {
    const isLocalEnvironment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1';
    
    return isLocalEnvironment
        ? 'http://localhost:3000'
        : 'https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net';
}

module.exports = {
    getReviewStatusClass,
    formatRelativeDate,
    getReviewButtonConfig,
    filterProposals,
    countReviews,
    getApiBaseUrl
};