// revProposalUtils.js

// Helper functions for proposal details display and processing

/**
 * Gets the appropriate file icon class based on file type
 * @param {string} fileType - The file extension/type
 * @returns {string} Font Awesome icon class
 */
function getFileIconClass(fileType) {
    const iconMap = {
        'pdf': 'fas fa-file-pdf',
        'doc': 'fas fa-file-word',
        'docx': 'fas fa-file-word',
        'xls': 'fas fa-file-excel',
        'xlsx': 'fas fa-file-excel',
        'ppt': 'fas fa-file-powerpoint',
        'pptx': 'fas fa-file-powerpoint',
        'jpg': 'fas fa-file-image',
        'jpeg': 'fas fa-file-image',
        'png': 'fas fa-file-image',
        'gif': 'fas fa-file-image',
        'zip': 'fas fa-file-archive',
        'rar': 'fas fa-file-archive',
        'txt': 'fas fa-file-alt',
        'csv': 'fas fa-file-csv'
    };
    
    return iconMap[fileType.toLowerCase()] || 'fas fa-file';
}

/**
 * Formats a date string into a readable format
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatProposalDate(date) {
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
 * Formats a currency amount into a localized string
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatProposalCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Validates review form data
 * @param {object} reviewData - The review data to validate
 * @returns {object} { isValid: boolean, errors: string[] }
 */
function validateReviewForm(reviewData) {
    const errors = [];
    
    // Validate ratings
    if (!reviewData.criteria?.scientificMerit) errors.push('Please rate Scientific Merit');
    if (!reviewData.criteria?.methodology) errors.push('Please rate Methodology');
    if (!reviewData.criteria?.feasibility) errors.push('Please rate Feasibility');
    if (!reviewData.criteria?.impact) errors.push('Please rate Impact');
    
    // Validate feedback
    if (!reviewData.feedback || reviewData.feedback.trim().length < 50) {
        errors.push('Please provide detailed feedback (minimum 50 characters)');
    }
    
    // Validate recommendation
    if (!reviewData.recommendation) {
        errors.push('Please select a final recommendation');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Extracts proposal ID from URL
 * @param {string} url - The URL to parse
 * @returns {string} The proposal ID or 'demo-proposal' if not found
 */
function getProposalIdFromUrl(url = window.location.href) {
    try {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('id') || 'demo-proposal';
    } catch {
        return 'demo-proposal';
    }
}

/**
 * Formats a recommendation value for display
 * @param {string} recommendation - The recommendation value
 * @returns {string} Formatted recommendation text
 */
function formatRecommendation(recommendation) {
    const recommendationMap = {
        'approve': 'Approve',
        'revise': 'Requires Revision',
        'reject': 'Reject'
    };
    
    return recommendationMap[recommendation?.toLowerCase()] || 'Pending Review';
}

/**
 * Generates a unique ID for draft reviews
 * @param {string} proposalId - The proposal ID
 * @returns {string} A unique draft ID
 */
function generateDraftId(proposalId) {
    return `draft-${proposalId}-${Date.now()}`;
}

module.exports = {
    getFileIconClass,
    formatProposalDate,
    formatProposalCurrency,
    validateReviewForm,
    getProposalIdFromUrl,
    formatRecommendation,
    generateDraftId
};