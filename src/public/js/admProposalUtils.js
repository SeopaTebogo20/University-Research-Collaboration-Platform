// admProposalUtils.js

// Status-related utility functions
function getStatusClass(status) {
    if (!status) return 'status-default';
    
    switch(status.toLowerCase()) {
        case 'assigned': return 'status-assigned';
        case 'pending': return 'status-pending';
        case 'under-review': return 'status-under-review';
        case 'completed': return 'status-completed';
        case 'rejected': return 'status-rejected';
        default: return 'status-default';
    }
}

function getProposalStatus(projectId, assignmentData) {
    if (!projectId || !assignmentData) return 'pending';
    return assignmentData.some(assignment => assignment.project_id === projectId) ? 'assigned' : 'pending';
}

function formatStatus(status) {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1);
}

// Date formatting utilities
function formatDate(dateString, options = {}) {
    if (!dateString) return 'N/A';
    
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    try {
        return new Date(dateString).toLocaleDateString('en-US', formatOptions);
    } catch (error) {
        return 'Invalid Date';
    }
}

function isValidDate(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// Text processing utilities
function extractKeywords(text, maxKeywords = 5) {
    if (!text || typeof text !== 'string') return ['No concepts available'];
    
    const words = text.split(/\s+/);
    const capitalizedWords = words.filter(word => 
        word.length > 3 && 
        word[0] === word[0].toUpperCase() && 
        word[0] !== word[0].toLowerCase() &&
        /^[A-Za-z]/.test(word) // Starts with a letter
    );
    
    return capitalizedWords.length > 0 ? 
        Array.from(new Set(capitalizedWords)).slice(0, maxKeywords) : 
        ['No concepts available'];
}

function truncateText(text, maxLength = 100) {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Reviewer matching utilities
function calculateMatchScore(reviewer, proposal) {
    if (!reviewer || !proposal) return 0;
    
    let score = 0;
    
    // Research area match (highest weight)
    if (reviewer.research_area && proposal.key_research_area) {
        const reviewerArea = reviewer.research_area.toLowerCase();
        const proposalArea = proposal.key_research_area.toLowerCase();
        
        if (reviewerArea === proposalArea) {
            score += 60;
        } else if (reviewerArea.includes(proposalArea) || proposalArea.includes(reviewerArea)) {
            score += 40;
        } else if (hasCommonKeywords(reviewerArea, proposalArea)) {
            score += 20;
        }
    }
    
    // Experience level scoring
    if (reviewer.research_experience) {
        const experience = parseInt(reviewer.research_experience);
        if (experience > 10) {
            score += 30;
        } else if (experience > 5) {
            score += 20;
        } else if (experience > 0) {
            score += 10;
        }
    }
    
    // Department match (lower weight)
    if (reviewer.department && proposal.department) {
        if (reviewer.department.toLowerCase() === proposal.department.toLowerCase()) {
            score += 10;
        }
    }
    
    return Math.min(score, 100);
}

function getMatchScoreClass(score) {
    if (score > 80) return 'high-match';
    if (score > 50) return 'medium-match';
    return 'low-match';
}

function hasCommonKeywords(text1, text2) {
    const words1 = text1.split(/\s+/).filter(word => word.length > 3);
    const words2 = text2.split(/\s+/).filter(word => word.length > 3);
    
    return words1.some(word1 => 
        words2.some(word2 => 
            word1.includes(word2) || word2.includes(word1)
        )
    );
}

// Search and filter utilities
function parseSearchTerm(searchTerm) {
    const params = {};
    
    if (!searchTerm || !searchTerm.trim()) {
        return params;
    }
    
    const cleanTerm = searchTerm.trim();
    
    // Check for specific search patterns
    const deptMatch = cleanTerm.match(/department:([^\s,]+)/i);
    if (deptMatch) {
        params.department = deptMatch[1].trim();
    }
    
    const areaMatch = cleanTerm.match(/area:([^\s,]+)/i);
    if (areaMatch) {
        params.research_area = areaMatch[1].trim();
    }
    
    const expMatch = cleanTerm.match(/experience:(\d+)/i);
    if (expMatch) {
        params.min_experience = parseInt(expMatch[1]);
    }
    
    // If no specific patterns found, treat as general search
    if (!deptMatch && !areaMatch && !expMatch) {
        params.search = cleanTerm;
    }
    
    return params;
}

function filterProposals(proposals, filters, assignmentData = []) {
    if (!proposals || !Array.isArray(proposals)) return [];
    
    return proposals.filter(proposal => {
        // Status filter
        if (filters.status && filters.status !== 'all') {
            const status = getProposalStatus(proposal.id, assignmentData);
            if (status !== filters.status) return false;
        }
        
        // Research area filter
        if (filters.researchArea && filters.researchArea !== 'all') {
            const area = proposal.key_research_area || '';
            const normalizedArea = area.toLowerCase().replace(/\s+/g, '-');
            if (normalizedArea !== filters.researchArea) return false;
        }
        
        // Text search filter
        if (filters.search && filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase();
            const searchableText = [
                proposal.project_title,
                proposal.researcher_name,
                proposal.key_research_area,
                proposal.description
            ].join(' ').toLowerCase();
            
            if (!searchableText.includes(searchTerm)) return false;
        }
        
        return true;
    });
}

// Assignment utilities
function isProposalAssigned(proposalId, assignmentData) {
    if (!proposalId || !assignmentData || !Array.isArray(assignmentData)) return false;
    return assignmentData.some(assignment => assignment.project_id === proposalId);
}

function getAssignedReviewers(proposalId, assignmentData, reviewersData = []) {
    if (!proposalId || !assignmentData || !Array.isArray(assignmentData)) return [];
    
    const assignments = assignmentData.filter(assignment => assignment.project_id === proposalId);
    
    return assignments.map(assignment => {
        const reviewer = reviewersData.find(r => r.id === assignment.reviewerId);
        return {
            id: assignment.reviewerId,
            name: reviewer ? reviewer.name : `Reviewer ID: ${assignment.reviewerId}`,
            assignment: assignment
        };
    });
}

function createAssignmentPayload(proposal, reviewer, additionalData = {}) {
    if (!proposal || !reviewer) {
        throw new Error('Proposal and reviewer are required');
    }
    
    return {
        project_id: proposal.id,
        project_name: proposal.project_title,
        reviewerId: reviewer.id,
        researcherId: proposal.researcher_id || 'REV456',
        rating: null,
        review_message: null,
        created_at: new Date().toISOString(),
        ...additionalData
    };
}

// API utility functions
function buildApiUrl(baseUrl, endpoint, params = {}) {
    const url = new URL(endpoint, baseUrl);
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            url.searchParams.append(key, value);
        }
    });
    
    return url.toString();
}

function determineBaseUrl() {
    const isLocalEnvironment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1';
    
    return isLocalEnvironment
        ? 'http://localhost:3000'
        : 'https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net';
}

// Validation utilities
function validateProposal(proposal) {
    const errors = [];
    
    if (!proposal) {
        errors.push('Proposal object is required');
        return errors;
    }
    
    if (!proposal.id) errors.push('Proposal ID is required');
    if (!proposal.project_title) errors.push('Project title is required');
    if (!proposal.researcher_name) errors.push('Researcher name is required');
    
    return errors;
}

function validateReviewer(reviewer) {
    const errors = [];
    
    if (!reviewer) {
        errors.push('Reviewer object is required');
        return errors;
    }
    
    if (!reviewer.id) errors.push('Reviewer ID is required');
    if (!reviewer.name) errors.push('Reviewer name is required');
    if (!reviewer.email) errors.push('Reviewer email is required');
    
    return errors;
}

// Display utilities
function getDisplayIndex(proposal, filteredProposals) {
    if (!proposal || !filteredProposals || !Array.isArray(filteredProposals)) return 0;
    return filteredProposals.findIndex(p => p.id === proposal.id) + 1;
}

function createErrorMessage(message, type = 'error') {
    return {
        message,
        type,
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    // Status utilities
    getStatusClass,
    getProposalStatus,
    formatStatus,
    
    // Date utilities
    formatDate,
    isValidDate,
    
    // Text utilities
    extractKeywords,
    truncateText,
    
    // Matching utilities
    calculateMatchScore,
    getMatchScoreClass,
    hasCommonKeywords,
    
    // Search utilities
    parseSearchTerm,
    filterProposals,
    
    // Assignment utilities
    isProposalAssigned,
    getAssignedReviewers,
    createAssignmentPayload,
    
    // API utilities
    buildApiUrl,
    determineBaseUrl,
    
    // Validation utilities
    validateProposal,
    validateReviewer,
    
    // Display utilities
    getDisplayIndex,
    createErrorMessage
};