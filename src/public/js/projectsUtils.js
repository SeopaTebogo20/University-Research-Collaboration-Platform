// projectsUtils.js

// API URL configuration - supports both local development and production
const getApiBaseUrl = () => {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' 
        : 'https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net/api';
};

const PROJECTS_API = `${getApiBaseUrl()}/projects`;
const USERS_API = `${getApiBaseUrl()}/users`;

// Project loading functions
async function loadProjects(searchQuery = '') {
    try {
        let url = PROJECTS_API;
        if (searchQuery) {
            url += `?search=${encodeURIComponent(searchQuery)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error loading projects:', error);
        throw error;
    }
}

// Project CRUD operations
async function createProject(projectData) {
    try {
        const response = await fetch(PROJECTS_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
}

async function updateProject(projectId, projectData) {
    try {
        const response = await fetch(`${PROJECTS_API}/${projectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
}

async function deleteProject(projectId) {
    try {
        const response = await fetch(`${PROJECTS_API}/${projectId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
}

// Project details functions
async function getProjectDetails(projectId) {
    try {
        const response = await fetch(`${PROJECTS_API}/${projectId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error loading project details:', error);
        throw error;
    }
}

// User/invitation functions
async function getUsers() {
    try {
        const response = await fetch(USERS_API);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error loading users:', error);
        throw error;
    }
}

async function getUserProfile(userId) {
    try {
        const response = await fetch(`${USERS_API}/${userId.trim()}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error loading user profile:', error);
        throw error;
    }
}

async function sendInvitation(invitationData) {
    try {
        const response = await fetch(`${getApiBaseUrl()}/invitations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invitationData),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error sending invitation:', error);
        throw error;
    }
}

// Utility functions
function formatProjectDates(project) {
    return {
        ...project,
        start_date: new Date(project.start_date).toLocaleDateString(),
        end_date: new Date(project.end_date).toLocaleDateString()
    };
}

function getStatusClass(status) {
    const statusText = status || 'Active';
    switch (statusText.toLowerCase()) {
        case 'completed': return 'status-completed';
        case 'active': return 'status-active';
        case 'pending': return 'status-pending';
        default: return 'status-active';
    }
}

module.exports = {
    getApiBaseUrl,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectDetails,
    getUsers,
    getUserProfile,
    sendInvitation,
    formatProjectDates,
    getStatusClass
};