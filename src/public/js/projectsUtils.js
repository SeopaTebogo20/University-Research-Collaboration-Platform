// projectsUtil.js

// Helper functions for project data management and display

function getStatusClassForProject(status) {
    if (!status) return 'status-active';
    
    switch(status.toLowerCase()) {
        case 'completed': return 'status-completed';
        case 'active': return 'status-active';
        case 'pending': return 'status-pending';
        case 'delayed': return 'status-delayed';
        case 'cancelled': return 'status-cancelled';
        default: return 'status-active';
    }
}

function formatProjectDate(dateString) {
    if (!dateString) return 'Not specified';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }
        return date.toLocaleDateString();
    } catch (error) {
        return 'Invalid date';
    }
}

function formatProjectDateRange(startDate, endDate) {
    const formattedStart = formatProjectDate(startDate);
    const formattedEnd = formatProjectDate(endDate);
    
    return `${formattedStart} - ${formattedEnd}`;
}

function parseCommaSeparatedValues(value) {
    if (!value) return [];
    
    return value
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
}

function formatCommaSeparatedAsTags(value, tagClass = 'tag') {
    const items = parseCommaSeparatedValues(value);
    
    if (items.length === 0) {
        return `<span class="${tagClass}">None specified</span>`;
    }
    
    return items
        .map(item => `<span class="${tagClass}">${item}</span>`)
        .join('');
}

function formatCommaSeparatedAsText(value, separator = ', ') {
    const items = parseCommaSeparatedValues(value);
    
    if (items.length === 0) {
        return 'None specified';
    }
    
    return items.join(separator);
}

function getExperienceLevelIcon(level) {
    if (!level) return 'fa-user';
    
    switch(level.toLowerCase()) {
        case 'beginner': return 'fa-seedling';
        case 'intermediate': return 'fa-user-graduate';
        case 'advanced': return 'fa-star';
        case 'expert': return 'fa-crown';
        default: return 'fa-user';
    }
}

function validateProjectData(projectData) {
    const errors = [];
    
    if (!projectData.project_title || projectData.project_title.trim().length === 0) {
        errors.push('Project title is required');
    }
    
    if (!projectData.researcher_name || projectData.researcher_name.trim().length === 0) {
        errors.push('Researcher name is required');
    }
    
    if (!projectData.description || projectData.description.trim().length === 0) {
        errors.push('Project description is required');
    }
    
    if (!projectData.start_date) {
        errors.push('Start date is required');
    }
    
    if (!projectData.end_date) {
        errors.push('End date is required');
    }
    
    if (projectData.start_date && projectData.end_date) {
        const startDate = new Date(projectData.start_date);
        const endDate = new Date(projectData.end_date);
        
        if (endDate <= startDate) {
            errors.push('End date must be after start date');
        }
    }
    
    return errors;
}

function sanitizeProjectData(projectData) {
    const sanitized = { ...projectData };
    
    // Trim string fields
    const stringFields = [
        'project_title', 'researcher_name', 'description', 'key_research_area',
        'skills_and_expertise', 'positions_required', 'technical_requirements',
        'status', 'department', 'userName', 'reviewer'
    ];
    
    stringFields.forEach(field => {
        if (sanitized[field] && typeof sanitized[field] === 'string') {
            sanitized[field] = sanitized[field].trim();
        }
    });
    
    // Ensure boolean fields are actual booleans
    if (sanitized.funding_available !== undefined) {
        sanitized.funding_available = Boolean(sanitized.funding_available);
    }
    
    // Set default values
    if (!sanitized.experience_level) {
        sanitized.experience_level = 'Intermediate';
    }
    
    if (!sanitized.status) {
        sanitized.status = 'Active';
    }
    
    return sanitized;
}

function calculateProjectProgress(startDate, endDate, status) {
    if (status && status.toLowerCase() === 'completed') {
        return 100;
    }
    
    if (!startDate || !endDate) {
        return 0;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    if (now < start) {
        return 0; // Project hasn't started yet
    }
    
    if (now > end) {
        return 100; // Project should be completed
    }
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.round((elapsed / totalDuration) * 100);
}

function getProjectDaysRemaining(endDate) {
    if (!endDate) return null;
    
    const end = new Date(endDate);
    const now = new Date();
    
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

function isProjectOverdue(endDate, status) {
    if (!endDate) return false;
    if (status && status.toLowerCase() === 'completed') return false;
    
    const end = new Date(endDate);
    const now = new Date();
    
    return now > end;
}

function generateProjectSummary(project) {
    const summary = {
        title: project.project_title || 'Untitled Project',
        researcher: project.researcher_name || 'Unknown Researcher',
        status: project.status || 'Active',
        statusClass: getStatusClassForProject(project.status),
        dateRange: formatProjectDateRange(project.start_date, project.end_date),
        progress: calculateProjectProgress(project.start_date, project.end_date, project.status),
        daysRemaining: getProjectDaysRemaining(project.end_date),
        isOverdue: isProjectOverdue(project.end_date, project.status),
        researchAreas: parseCommaSeparatedValues(project.key_research_area),
        skills: parseCommaSeparatedValues(project.skills_and_expertise || project.skills),
        positions: parseCommaSeparatedValues(project.positions_required || project.positions),
        hasFunding: Boolean(project.funding_available),
        experienceLevel: project.experience_level || 'Intermediate',
        experienceIcon: getExperienceLevelIcon(project.experience_level)
    };
    
    return summary;
}

function filterProjectsBySearchQuery(projects, query) {
    if (!query || query.trim().length === 0) {
        return projects;
    }
    
    const searchTerm = query.toLowerCase().trim();
    
    return projects.filter(project => {
        // Search in project title
        if (project.project_title && project.project_title.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Search in researcher name
        if (project.researcher_name && project.researcher_name.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Search in description
        if (project.description && project.description.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Search in research areas
        if (project.key_research_area && project.key_research_area.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Search in skills
        const skills = project.skills_and_expertise || project.skills;
        if (skills && skills.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        return false;
    });
}

function sortProjectsByField(projects, field, direction = 'asc') {
    return [...projects].sort((a, b) => {
        let valueA = a[field];
        let valueB = b[field];
        
        // Handle null/undefined values
        if (valueA == null) valueA = '';
        if (valueB == null) valueB = '';
        
        // Handle date fields
        if (field.includes('date')) {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
        }
        
        // Handle string fields
        if (typeof valueA === 'string') {
            valueA = valueA.toLowerCase();
        }
        if (typeof valueB === 'string') {
            valueB = valueB.toLowerCase();
        }
        
        let comparison = 0;
        if (valueA > valueB) {
            comparison = 1;
        } else if (valueA < valueB) {
            comparison = -1;
        }
        
        return direction === 'desc' ? comparison * -1 : comparison;
    });
}

function groupProjectsByStatus(projects) {
    const groups = {
        active: [],
        pending: [],
        completed: [],
        delayed: [],
        cancelled: [],
        other: []
    };
    
    projects.forEach(project => {
        const status = (project.status || 'active').toLowerCase();
        
        if (groups[status]) {
            groups[status].push(project);
        } else {
            groups.other.push(project);
        }
    });
    
    return groups;
}

module.exports = {
    getStatusClassForProject,
    formatProjectDate,
    formatProjectDateRange,
    parseCommaSeparatedValues,
    formatCommaSeparatedAsTags,
    formatCommaSeparatedAsText,
    getExperienceLevelIcon,
    validateProjectData,
    sanitizeProjectData,
    calculateProjectProgress,
    getProjectDaysRemaining,
    isProjectOverdue,
    generateProjectSummary,
    filterProjectsBySearchQuery,
    sortProjectsByField,
    groupProjectsByStatus
};