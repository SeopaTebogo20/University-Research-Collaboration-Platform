// revReviewUtils.js

// Helper functions for review history display and processing

/**
 * Gets the appropriate CSS class for a review decision status
 * @param {string} decision - The review decision (Approved, Revision, Rejected)
 * @returns {string} The CSS class name
 */
function getReviewStatusClass(decision) {
    if (!decision) return 'status-default';
    
    switch(decision.toLowerCase()) {
        case 'approved': return 'status-approved';
        case 'revision': return 'status-revision';
        case 'rejected': return 'status-rejected';
        default: return 'status-default';
    }
}

/**
 * Formats a date string into a readable format
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatReviewDate(date) {
    if (!date) return 'N/A';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Formats a criterion name from camelCase to Title Case
 * @param {string} criterion - The criterion name in camelCase
 * @returns {string} Formatted criterion name
 */
function formatCriterionName(criterion) {
    if (!criterion) return '';
    
    return criterion
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

/**
 * Generates star rating HTML for a score
 * @param {number} score - The score (1-5)
 * @returns {string} HTML string with star icons
 */
function generateScoreStars(score) {
    if (score < 1 || score > 5) return '';
    
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<i class="${i <= score ? 'fas' : 'far'} fa-star"></i>`;
    }
    return stars;
}

/**
 * Filters review data based on time period and status
 * @param {Array} reviews - Array of review objects
 * @param {string} timePeriod - Time period filter ('all', 'month', 'quarter', 'year')
 * @param {string} status - Status filter ('all', 'approved', 'revision', 'rejected')
 * @returns {Array} Filtered array of reviews
 */
function filterReviews(reviews, timePeriod, status) {
    if (!reviews || !Array.isArray(reviews)) return [];
    
    let filtered = [...reviews];
    
    // Apply time filter
    if (timePeriod !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (timePeriod) {
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
                break;
            default:
                startDate = new Date(0); // Beginning of time
        }
        
        filtered = filtered.filter(review => {
            const reviewDate = new Date(review.reviewDate);
            return reviewDate >= startDate;
        });
    }
    
    // Apply status filter
    if (status !== 'all') {
        filtered = filtered.filter(review => 
            review.decision.toLowerCase() === status.toLowerCase()
        );
    }
    
    return filtered;
}

/**
 * Sorts reviews by date (newest first by default)
 * @param {Array} reviews - Array of review objects
 * @param {string} direction - 'asc' or 'desc' (default)
 * @returns {Array} Sorted array of reviews
 */
function sortReviewsByDate(reviews, direction = 'desc') {
    if (!reviews || !Array.isArray(reviews)) return [];
    
    return [...reviews].sort((a, b) => {
        const dateA = new Date(a.reviewDate);
        const dateB = new Date(b.reviewDate);
        return direction === 'asc' 
            ? dateA - dateB 
            : dateB - dateA;
    });
}

module.exports = {
    getReviewStatusClass,
    formatReviewDate,
    formatCriterionName,
    generateScoreStars,
    filterReviews,
    sortReviewsByDate
};