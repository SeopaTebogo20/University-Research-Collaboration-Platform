// admUserManagementUtils.js

// Helper functions for admin user management

function getStatusClass(promotedRole) {
    if (!promotedRole) return 'status-default';
    
    switch(promotedRole.toLowerCase()) {
        case 'reviewer': return 'status-active';
        case 'pending': return 'status-pending';
        case 'inactive': return 'status-inactive';
        default: return 'status-default';
    }
}

function getRoleBadgeClass(role) {
    if (!role) return 'role-default';
    
    switch(role.toLowerCase()) {
        case 'researcher': return 'role-researcher';
        case 'reviewer': return 'role-reviewer';
        case 'admin': return 'role-admin';
        default: return 'role-default';
    }
}

function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

function formatDate(dateString, includeTime = true) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('en-US', options);
}

function filterUsersByRole(users, allowedRoles = ['researcher', 'reviewer']) {
    if (!Array.isArray(users)) return [];
    
    return users.filter(user => {
        const role = (user.role || '').toLowerCase();
        return allowedRoles.includes(role);
    });
}

function searchUsers(users, searchTerm) {
    if (!Array.isArray(users) || !searchTerm) return users;
    
    const term = searchTerm.toLowerCase().trim();
    
    return users.filter(user => {
        const name = (user.name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const role = (user.role || '').toLowerCase();
        const department = (user.department || '').toLowerCase();
        
        return name.includes(term) || 
               email.includes(term) || 
               role.includes(term) ||
               department.includes(term);
    });
}

function sortUsers(users, sortBy = 'name', sortOrder = 'asc') {
    if (!Array.isArray(users)) return [];
    
    return [...users].sort((a, b) => {
        let aValue = a[sortBy] || '';
        let bValue = b[sortBy] || '';
        
        // Handle date sorting
        if (sortBy === 'created_at' || sortBy === 'updated_at') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else {
            // Convert to string and lowercase for text sorting
            aValue = aValue.toString().toLowerCase();
            bValue = bValue.toString().toLowerCase();
        }
        
        if (sortOrder === 'desc') {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
        
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    });
}

function validateUserData(userData) {
    const errors = [];
    
    if (!userData.name || userData.name.trim().length === 0) {
        errors.push('Name is required');
    }
    
    if (!userData.email || !isValidEmail(userData.email)) {
        errors.push('Valid email is required');
    }
    
    if (!userData.role || userData.role.trim().length === 0) {
        errors.push('Role is required');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function getUserStats(users) {
    if (!Array.isArray(users)) return {};
    
    const stats = {
        total: users.length,
        researchers: 0,
        reviewers: 0,
        activeReviewers: 0,
        pendingPromotions: 0,
        avgResearchExperience: 0,
        totalProjectsCreated: 0
    };
    
    let totalExperience = 0;
    let usersWithExperience = 0;
    
    users.forEach(user => {
        const role = (user.role || '').toLowerCase();
        const promotedRole = (user['promoted-role'] || '').toLowerCase();
        
        if (role === 'researcher') stats.researchers++;
        if (role === 'reviewer') stats.reviewers++;
        if (promotedRole === 'reviewer') stats.activeReviewers++;
        if (promotedRole === 'pending') stats.pendingPromotions++;
        
        if (user.research_experience && !isNaN(user.research_experience)) {
            totalExperience += parseInt(user.research_experience);
            usersWithExperience++;
        }
        
        if (user.projects_created && !isNaN(user.projects_created)) {
            stats.totalProjectsCreated += parseInt(user.projects_created);
        }
    });
    
    if (usersWithExperience > 0) {
        stats.avgResearchExperience = Math.round(totalExperience / usersWithExperience * 10) / 10;
    }
    
    return stats;
}

function canPromoteUser(user) {
    if (!user) return false;
    
    const role = (user.role || '').toLowerCase();
    const promotedRole = (user['promoted-role'] || '').toLowerCase();
    
    // Can promote if user is researcher and not already promoted to reviewer
    return role === 'researcher' && promotedRole !== 'reviewer';
}

function canActivateReviewer(user) {
    if (!user) return false;
    
    const role = (user.role || '').toLowerCase();
    const promotedRole = (user['promoted-role'] || '').toLowerCase();
    
    // Can activate if user is reviewer but not currently active
    return role === 'reviewer' && promotedRole !== 'reviewer';
}

function getPromoteButtonText(user) {
    if (!user) return 'Promote User';
    
    const role = (user.role || '').toLowerCase();
    
    if (role === 'reviewer') {
        return 'Activate Reviewer';
    }
    
    return 'Promote to Reviewer';
}

function shouldShowPromoteButton(user) {
    return canPromoteUser(user) || canActivateReviewer(user);
}

function formatResearchAreas(researchArea) {
    if (!researchArea) return [];
    
    return researchArea
        .split(',')
        .map(area => area.trim())
        .filter(area => area.length > 0)
        .map(area => capitalizeFirstLetter(area));
}

function createUserDisplayData(user, index) {
    return {
        displayId: index + 1,
        name: user.name || 'N/A',
        email: user.email || 'N/A',
        role: capitalizeFirstLetter(user.role || ''),
        promotedRole: capitalizeFirstLetter(user['promoted-role'] || 'pending'),
        statusClass: getStatusClass(user['promoted-role']),
        roleBadgeClass: getRoleBadgeClass(user.role),
        joinDate: formatDate(user.created_at),
        canPromote: shouldShowPromoteButton(user),
        promoteButtonText: getPromoteButtonText(user)
    };
}

module.exports = {
    getStatusClass,
    getRoleBadgeClass,
    capitalizeFirstLetter,
    getInitials,
    formatDate,
    filterUsersByRole,
    searchUsers,
    sortUsers,
    validateUserData,
    isValidEmail,
    getUserStats,
    canPromoteUser,
    canActivateReviewer,
    getPromoteButtonText,
    shouldShowPromoteButton,
    formatResearchAreas,
    createUserDisplayData
};