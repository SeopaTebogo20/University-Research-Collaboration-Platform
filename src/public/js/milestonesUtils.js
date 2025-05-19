// milestonesUtils.js

// API URL configuration
const getApiBaseUrl = () => {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' 
        : 'https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net/api';
};

// API endpoints
const getApiEndpoints = () => {
    const API_BASE_URL = getApiBaseUrl();
    return {
        projects: `${API_BASE_URL}/projects`,
        milestones: `${API_BASE_URL}/milestones`,
        collaborators: `${API_BASE_URL}/collaborators`
    };
};

// Project related utilities
const loadProjects = async () => {
    try {
        const { projects } = getApiEndpoints();
        const response = await fetch(projects);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error loading projects:', error);
        throw error;
    }
};

// Milestone related utilities
const loadMilestones = async (projectId) => {
    try {
        const { milestones } = getApiEndpoints();
        const response = await fetch(`${milestones}?project_id=${projectId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error loading milestones:', error);
        throw error;
    }
};

const saveMilestone = async (milestoneData, isNewMilestone = true) => {
    try {
        const { milestones } = getApiEndpoints();
        const url = isNewMilestone ? milestones : `${milestones}/${milestoneData.id}`;
        const method = isNewMilestone ? 'POST' : 'PUT';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(milestoneData),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error saving milestone:', error);
        throw error;
    }
};

const deleteMilestoneById = async (milestoneId) => {
    try {
        const { milestones } = getApiEndpoints();
        const response = await fetch(`${milestones}/${milestoneId}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting milestone:', error);
        throw error;
    }
};

// Project details utilities
const loadProjectDetails = async (projectId) => {
    try {
        const { projects } = getApiEndpoints();
        const response = await fetch(`${projects}/${projectId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error loading project details:', error);
        throw error;
    }
};

// Collaborators utilities
const loadCollaborators = async () => {
    try {
        const { collaborators } = getApiEndpoints();
        const response = await fetch(collaborators);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error loading collaborators:', error);
        throw error;
    }
};

// Milestone statistics
const getMilestoneStats = (milestones) => {
    const stats = {
        completed: 0,
        inProgress: 0,
        pending: 0,
        delayed: 0
    };
    
    milestones.forEach(milestone => {
        const status = milestone.status ? milestone.status.toLowerCase() : 'pending';
        
        if (status === 'completed') {
            stats.completed++;
        } else if (status === 'in-progress') {
            stats.inProgress++;
        } else if (status === 'delayed') {
            stats.delayed++;
        } else {
            stats.pending++;
        }
    });
    
    return stats;
};

// Helper functions
const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

module.exports = {
    getApiBaseUrl,
    getApiEndpoints,
    loadProjects,
    loadMilestones,
    saveMilestone,
    deleteMilestoneById,
    loadProjectDetails,
    loadCollaborators,
    getMilestoneStats,
    capitalize
};