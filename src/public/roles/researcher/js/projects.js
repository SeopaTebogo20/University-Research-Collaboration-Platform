// DOM Elements
const projectsContainer = document.getElementById('projects-container');
const projectModal = document.getElementById('project-modal');
const deleteModal = document.getElementById('delete-modal');
const inviteModal = document.getElementById('invite-modal');
const profileModal = document.getElementById('profile-modal');
const projectForm = document.getElementById('project-form');
const inviteForm = document.getElementById('invite-form');
const modalTitle = document.getElementById('modal-title');
const createProjectBtn = document.getElementById('create-project-btn');
const cancelBtn = document.getElementById('cancel-btn');
const cancelInviteBtn = document.getElementById('cancel-invite-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const collaboratorSearch = document.getElementById('collaborator-search');
const searchCollaboratorBtn = document.getElementById('search-collaborator-btn');
const collaboratorsList = document.getElementById('collaborators-list');
const closeProfileBtn = document.getElementById('close-profile-btn');
const inviteFromProfileBtn = document.getElementById('invite-from-profile-btn');

// API URLs
const API_URL = 'http://localhost:3000/api/projects';
const COLLABORATORS_API_URL = 'http://localhost:3000/api/collaborators';

// State variables
let projects = [];
let collaborators = [];
let currentProjectId = null;
let inviteProjectId = null;
let currentCollaboratorId = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchProjects();
    setupTabNavigation();
});
createProjectBtn.addEventListener('click', openCreateModal);
projectForm.addEventListener('submit', handleFormSubmit);
inviteForm?.addEventListener('submit', handleInviteSubmit);
cancelBtn.addEventListener('click', closeModal);
cancelInviteBtn?.addEventListener('click', closeInviteModal);
confirmDeleteBtn.addEventListener('click', deleteProject);
cancelDeleteBtn.addEventListener('click', closeDeleteModal);
searchBtn.addEventListener('click', searchProjects);
searchCollaboratorBtn?.addEventListener('click', searchCollaborators);
closeProfileBtn?.addEventListener('click', closeProfileModal);
inviteFromProfileBtn?.addEventListener('click', inviteFromProfile);

// Search event listeners
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') searchProjects();
});
collaboratorSearch?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') searchCollaborators();
});

// Close modals when clicking on span (×)
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        projectModal.style.display = 'none';
        deleteModal.style.display = 'none';
        inviteModal.style.display = 'none';
        profileModal.style.display = 'none';
    });
});

// Close modals when clicking outside of modal content
window.addEventListener('click', (e) => {
    if (e.target === projectModal) projectModal.style.display = 'none';
    if (e.target === deleteModal) deleteModal.style.display = 'none';
    if (e.target === inviteModal) inviteModal.style.display = 'none';
    if (e.target === profileModal) profileModal.style.display = 'none';
});

// Setup tabs in invite modal
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and hide all contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.add('hidden'));
            
            // Add active class to clicked button and show its content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.remove('hidden');
        });
    });
}

// Fetch all projects from API
async function fetchProjects() {
    try {
        showLoading(projectsContainer);
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        
        // Debug - log the response structure
        console.log('API Response:', data);
        
        // Check if data is an object with projects property or if it's directly an array
        if (data && data.projects && Array.isArray(data.projects)) {
            projects = data.projects;
        } else if (Array.isArray(data)) {
            projects = data;
        } else {
            console.error('Unexpected data format:', data);
            projects = [];
        }
        
        displayProjects(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        showToast('Error loading projects. Please try again.', 'error');
        projectsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Unable to load projects. Please check your connection and try again.</p>
                <button class="btn primary" onclick="fetchProjects()">
                    <i class="fas fa-sync"></i> Retry
                </button>
            </div>
        `;
    }
}

// Fetch collaborators from API
async function fetchCollaborators() {
    try {
        showLoading(collaboratorsList);
        const response = await fetch(COLLABORATORS_API_URL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch collaborators');
        }
        
        const data = await response.json();
        console.log('Collaborators API Response:', data);
        
        // Check data structure and extract collaborators
        if (data && data.collaborators && Array.isArray(data.collaborators)) {
            collaborators = data.collaborators;
        } else if (Array.isArray(data)) {
            collaborators = data;
        } else {
            console.error('Unexpected collaborators data format:', data);
            collaborators = [];
        }
        
        displayCollaborators(collaborators);
    } catch (error) {
        console.error('Error fetching collaborators:', error);
        showToast('Error loading collaborators. Please try again.', 'error');
        collaboratorsList.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Unable to load collaborators. Please check your connection and try again.</p>
                <button class="btn primary" onclick="fetchCollaborators()">
                    <i class="fas fa-sync"></i> Retry
                </button>
            </div>
        `;
    }
}

// Get a single collaborator by ID
async function fetchCollaboratorById(collaboratorId) {
    try {
        const response = await fetch(`${COLLABORATORS_API_URL}/${collaboratorId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch collaborator details');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching collaborator details:', error);
        throw error;
    }
}

// Display projects in the UI
function displayProjects(projectsToDisplay) {
    // Debug - log projects being displayed
    console.log('Projects to display:', projectsToDisplay);
    
    if (!projectsToDisplay || projectsToDisplay.length === 0) {
        projectsContainer.innerHTML = `
            <div class="no-projects">
                <i class="fas fa-folder-open"></i>
                <p>No projects found. Create a new project to get started.</p>
            </div>
        `;
        return;
    }

    projectsContainer.innerHTML = projectsToDisplay.map(project => {
        console.log('Processing project:', project); // Debug individual project
        
        // Check if project has the expected structure
        if (!project || !project.projectDetails) {
            console.error('Invalid project structure:', project);
            return '';
        }
        
        // Format skills and requirements arrays
        const skills = Array.isArray(project.collaborationRequirements?.skillsAndExpertise) 
            ? project.collaborationRequirements.skillsAndExpertise.join(', ')
            : '';
            
        const researchAreas = project.projectDetails.keyResearchArea ? 
            project.projectDetails.keyResearchArea.split(',').map(area => 
                `<span class="tag">${area.trim()}</span>`
            ).join('') : '';
        
        return `
            <div class="project-card" data-id="${project.id}">
                <div class="project-header">
                    <h3 class="project-title">${project.projectDetails.projectTitle}</h3>
                    <p class="project-researcher">${project.projectDetails.researcherName}</p>
                </div>
                ${project.projectDetails.fundingAvailable ? '<span class="funding-badge">Funding Available</span>' : ''}
                <div class="project-body">
                    <p class="project-description">${project.projectDetails.description}</p>
                    
                    <div class="project-dates">
                        <div>
                            <span>Start Date</span>
                            <strong>${formatDate(project.projectDetails.startDate)}</strong>
                        </div>
                        <div>
                            <span>End Date</span>
                            <strong>${formatDate(project.projectDetails.endDate)}</strong>
                        </div>
                    </div>
                    
                    <div class="project-tags">
                        ${researchAreas}
                    </div>
                    
                    <div class="project-requirements">
                        <div class="requirement-section">
                            <h4>Experience Level</h4>
                            <p>${project.collaborationRequirements?.experienceLevel || 'Not specified'}</p>
                        </div>
                        
                        <div class="requirement-section">
                            <h4>Skills Required</h4>
                            <p>${skills}</p>
                        </div>
                    </div>
                </div>
                
                <div class="project-footer">
                    <div class="project-actions">
                        <button class="edit-btn" onclick="openEditModal('${project.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-btn" onclick="openDeleteModal('${project.id}')">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    </div>
                    <button class="invite-btn" onclick="openInviteModal('${project.id}')">
                        <i class="fas fa-user-plus"></i> Invite Collaborators
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // After projects are displayed, update with invited collaborators
    setTimeout(() => {
        updateProjectDisplayWithInvitedCollaborators();
    }, 0);
}

// Display collaborators in the UI
function displayCollaborators(collaboratorsToDisplay) {
    if (!collaboratorsToDisplay || collaboratorsToDisplay.length === 0) {
        collaboratorsList.innerHTML = `
            <div class="no-collaborators">
                <i class="fas fa-users"></i>
                <p>No collaborators found.</p>
            </div>
        `;
        return;
    }

    collaboratorsList.innerHTML = collaboratorsToDisplay.map(collaborator => {
        // Extract key information
        const name = collaborator.name || 'Unknown';
        const title = collaborator.title || '';
        const institution = collaborator.institution || 'Not specified';
        
        // Format skills/expertise
        let skillsHTML = 'Not specified';
        if (collaborator.skills && Array.isArray(collaborator.skills)) {
            skillsHTML = collaborator.skills.slice(0, 3).join(', ');
            if (collaborator.skills.length > 3) {
                skillsHTML += ` (+${collaborator.skills.length - 3} more)`;
            }
        }
        
        // Add recommendation badge if applicable
        const recommendedBadge = collaborator.isRecommended ? 
            '<span class="recommended-badge"><i class="fas fa-star"></i> Recommended</span>' : '';
        
        // Add same field/institution badges if applicable
        const sameFieldBadge = collaborator.isSameField ? 
            '<span class="field-badge"><i class="fas fa-microscope"></i> Same Field</span>' : '';
        const sameInstitutionBadge = collaborator.isSameInstitution ? 
            '<span class="institution-badge"><i class="fas fa-university"></i> Same Institution</span>' : '';
        
        return `
            <div class="collaborator-card" data-id="${collaborator.id}">
                <div class="collaborator-header">
                    <div class="collaborator-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="collaborator-info">
                        <h4>${name}</h4>
                        <p>${title} at ${institution}</p>
                        <div class="collaborator-badges">
                            ${recommendedBadge}
                            ${sameFieldBadge}
                            ${sameInstitutionBadge}
                        </div>
                    </div>
                </div>
                <div class="collaborator-body">
                    <div class="expertise">
                        <h5>Expertise:</h5>
                        <p>${skillsHTML}</p>
                    </div>
                </div>
                <div class="collaborator-footer">
                    <button class="btn secondary" onclick="viewCollaboratorProfile('${collaborator.id}')">
                        <i class="fas fa-id-card"></i> View Profile
                    </button>
                    <button class="btn primary" onclick="inviteCollaborator('${collaborator.id}')">
                        <i class="fas fa-user-plus"></i> Invite
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// View collaborator profile
async function viewCollaboratorProfile(collaboratorId) {
    try {
        currentCollaboratorId = collaboratorId;
        
        // Show profile modal with loading state
        profileModal.style.display = 'block';
        const profileContainer = document.getElementById('collaborator-profile');
        showLoading(profileContainer);
        
        // Fetch collaborator details
        const collaborator = await fetchCollaboratorById(collaboratorId);
        
        // Format education data
        let educationHTML = '<p>Education not specified</p>';
        if (collaborator.education && Array.isArray(collaborator.education)) {
            educationHTML = collaborator.education.map(edu => 
                `<div class="education-item">
                    <strong>${edu.degree}</strong>
                    <p>${edu.institution}, ${edu.year}</p>
                </div>`
            ).join('');
        }
        
        // Format experience data
        let experienceHTML = '<p>Experience not specified</p>';
        if (collaborator.experience && Array.isArray(collaborator.experience)) {
            experienceHTML = collaborator.experience.map(exp => 
                `<div class="experience-item">
                    <strong>${exp.title}</strong>
                    <p>${exp.organization}, ${exp.period}</p>
                </div>`
            ).join('');
        }
        
        // Format skills/expertise
        let skillsHTML = '<p>Expertise not specified</p>';
        if (collaborator.skills && Array.isArray(collaborator.skills)) {
            skillsHTML = collaborator.skills.map(skill => 
                `<span class="tag">${skill}</span>`
            ).join('');
        }
        
        // Format projects
        let projectsHTML = '<p>No projects listed</p>';
        if (collaborator.projects && Array.isArray(collaborator.projects)) {
            projectsHTML = collaborator.projects.map(project => 
                `<div class="project-item">
                    <p>${project}</p>
                </div>`
            ).join('');
        }
        
        // Publications and citation metrics
        const publicationsInfo = collaborator.publications ? 
            `<p>Publications: ${collaborator.publications}</p>` : '';
        const citationsInfo = collaborator.citations ? 
            `<p>Citations: ${collaborator.citations}</p>` : '';
        
        // Display profile
        profileContainer.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    <i class="fas fa-user-circle fa-4x"></i>
                </div>
                <div class="profile-title">
                    <h3>${collaborator.name || 'Unknown'}</h3>
                    <p>${collaborator.title || 'Position not specified'} at ${collaborator.institution || 'Institution not specified'}</p>
                    <p>${collaborator.department || ''}</p>
                </div>
            </div>
            
            <div class="profile-section">
                <h4><i class="fas fa-user"></i> Bio</h4>
                <p>${collaborator.bio || 'Bio not available'}</p>
            </div>
            
            <div class="profile-section">
                <h4><i class="fas fa-graduation-cap"></i> Education</h4>
                <div class="education-container">
                    ${educationHTML}
                </div>
            </div>
            
            <div class="profile-section">
                <h4><i class="fas fa-briefcase"></i> Experience</h4>
                <div class="experience-container">
                    ${experienceHTML}
                </div>
            </div>
            
            <div class="profile-section">
                <h4><i class="fas fa-brain"></i> Skills & Expertise</h4>
                <div class="tags">
                    ${skillsHTML}
                </div>
            </div>
            
            <div class="profile-section">
                <h4><i class="fas fa-flask"></i> Projects</h4>
                <div class="projects-container">
                    ${projectsHTML}
                </div>
            </div>
            
            <div class="profile-section">
                <h4><i class="fas fa-chart-line"></i> Research Metrics</h4>
                ${publicationsInfo}
                ${citationsInfo}
                <p>Collaborations: ${collaborator.collaborations || 'Not specified'}</p>
            </div>
            
            <div class="profile-section">
                <h4><i class="fas fa-envelope"></i> Contact</h4>
                <p>Email: ${collaborator.email || 'Email not provided'}</p>
                <p>Phone: ${collaborator.phone || 'Phone not provided'}</p>
                <p>Location: ${collaborator.location || 'Location not provided'}</p>
            </div>
        `;
    } catch (error) {
        console.error('Error viewing collaborator profile:', error);
        showToast('Error loading collaborator profile. Please try again.', 'error');
    }
}
// Close the profile modal
function closeProfileModal() {
    profileModal.style.display = 'none';
}

// Invite collaborator directly from the collaborator list
async function inviteCollaborator(collaboratorId) {
    try {
        // First fetch the collaborator details
        const collaborator = await fetchCollaboratorById(collaboratorId);
        
        // Find the current project
        const project = projects.find(p => p.id === inviteProjectId);
        if (!project) {
            throw new Error('Project not found');
        }
        
        // Get the project title from the modal
        const projectTitle = document.getElementById('invite-project-title').textContent;
        
        // Create invitation data with appropriate skills
        const skillsList = Array.isArray(collaborator.skills) ? 
            collaborator.skills.slice(0, 3).join(', ') : 
            'your field';
        
        const invitationData = {
            projectId: inviteProjectId,
            collaboratorId: collaboratorId,
            collaboratorName: collaborator.name,
            collaboratorEmail: collaborator.email,
            position: collaborator.title || 'Collaborator', // Use title as default position
            message: `Hi ${collaborator.name},

I would like to invite you to collaborate on my research project "${projectTitle}". Your expertise in ${skillsList} would be valuable for this work.

Looking forward to your response.`
        };
        
        console.log('Sending invitation:', invitationData);
        
        // Simulate API call for sending invitation
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Create a collaborator info object to store in the project
        const collaboratorInfo = {
            id: collaborator.id,
            name: collaborator.name,
            title: collaborator.title || 'Researcher',
            institution: collaborator.institution || '',
            email: collaborator.email || '',
            status: 'invited', // Status could be 'invited', 'accepted', 'declined'
            invitedDate: new Date().toISOString(),
            skills: collaborator.skills || []
        };
        
        // Initialize invitedCollaborators array if it doesn't exist
        if (!project.invitedCollaborators) {
            project.invitedCollaborators = [];
        }
        
        // Check if collaborator is already invited to avoid duplicates
        const alreadyInvited = project.invitedCollaborators.some(
            invited => invited.id === collaborator.id
        );
        
        if (!alreadyInvited) {
            // Add to project's invitedCollaborators array
            project.invitedCollaborators.push(collaboratorInfo);
            
            // Update the project in the API
            await updateProjectInAPI(project);
            
            showToast(`Invitation sent to ${collaborator.name} successfully!`, 'success');
        } else {
            showToast(`${collaborator.name} has already been invited to this project.`, 'info');
        }
    } catch (error) {
        console.error('Error inviting collaborator:', error);
        showToast('Error sending invitation. Please try again.', 'error');
    }
}

// Add a function to update project in the API
async function updateProjectInAPI(project) {
    try {
        const response = await fetch(`${API_URL}/${project.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(project)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update project');
        }
        
        // Update the local projects array
        const index = projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
            projects[index] = project;
        }
        
        return true;
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
}
// Invite collaborator from profile modal
async function inviteFromProfile() {
    if (!currentCollaboratorId || !inviteProjectId) {
        showToast('Invalid project or collaborator selection.', 'error');
        return;
    }
    
    try {
        await inviteCollaborator(currentCollaboratorId);
        closeProfileModal();
    } catch (error) {
        console.error('Error inviting from profile:', error);
    }
}

// Search collaborators based on input
function searchCollaborators() {
    const searchTerm = collaboratorSearch.value.toLowerCase();
    
    if (!searchTerm.trim()) {
        displayCollaborators(collaborators);
        return;
    }
    
    const filteredCollaborators = collaborators.filter(collaborator => {
        // Search in name, institution, department, skills, and bio
        return (
            (collaborator.name && collaborator.name.toLowerCase().includes(searchTerm)) ||
            (collaborator.institution && collaborator.institution.toLowerCase().includes(searchTerm)) ||
            (collaborator.department && collaborator.department.toLowerCase().includes(searchTerm)) ||
            (collaborator.bio && collaborator.bio.toLowerCase().includes(searchTerm)) ||
            (collaborator.skills && Array.isArray(collaborator.skills) && 
                collaborator.skills.some(skill => skill.toLowerCase().includes(searchTerm)))
        );
    });
    
    displayCollaborators(filteredCollaborators);
}
// Open modal for creating a new project
function openCreateModal() {
    resetForm();
    modalTitle.textContent = 'Add New Project';
    currentProjectId = null;
    projectModal.style.display = 'block';
}

// Open modal for editing an existing project
function openEditModal(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    resetForm();
    modalTitle.textContent = 'Edit Project';
    currentProjectId = projectId;
    // Fill form with project data
    document.getElementById('project-id').value = project.id;
    document.getElementById('researcher-name').value = project.projectDetails.researcherName;
    document.getElementById('project-title').value = project.projectDetails.projectTitle;
    document.getElementById('description').value = project.projectDetails.description;
    document.getElementById('key-research-area').value = project.projectDetails.keyResearchArea;
    document.getElementById('start-date').value = formatDateForInput(project.projectDetails.startDate);
    document.getElementById('end-date').value = formatDateForInput(project.projectDetails.endDate);
    document.getElementById('funding-available').checked = project.projectDetails.fundingAvailable;
    
    if (project.collaborationRequirements) {
        const skills = Array.isArray(project.collaborationRequirements.skillsAndExpertise) 
            ? project.collaborationRequirements.skillsAndExpertise.join(', ')
            : project.collaborationRequirements.skillsAndExpertise || '';
            
        const positions = Array.isArray(project.collaborationRequirements.positionsRequired)
            ? project.collaborationRequirements.positionsRequired.join(', ')
            : project.collaborationRequirements.positionsRequired || '';
            
        const techReqs = Array.isArray(project.collaborationRequirements.technicalRequirements)
            ? project.collaborationRequirements.technicalRequirements.join(', ')
            : project.collaborationRequirements.technicalRequirements || '';
            
        document.getElementById('skills').value = skills;
        document.getElementById('experience-level').value = project.collaborationRequirements.experienceLevel || '';
        document.getElementById('positions').value = positions;
        document.getElementById('technical-requirements').value = techReqs;
    }
    
    projectModal.style.display = 'block';
}

// Open invite collaborators modal
function openInviteModal(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    inviteProjectId = projectId;
    
    // Display project details in the invite modal
    document.getElementById('invite-project-title').textContent = project.projectDetails.projectTitle;
    document.getElementById('invite-project-id').value = projectId;
    
    // Set default tab to available collaborators
    document.querySelector('.tab-btn[data-tab="available-collaborators"]').click();
    
    // Clear previous form inputs for manual invite
    document.getElementById('collaborator-email').value = '';
    document.getElementById('collaboration-message').value = 
        `Hi there,\n\nI'd like to invite you to collaborate on my research project "${project.projectDetails.projectTitle}". Your expertise would be valuable for this work.\n\nLooking forward to your response.`;

    // Clear previous position selection and populate with project positions
    const positionSelect = document.getElementById('collaborator-position');
    positionSelect.innerHTML = '';
    
    if (project.collaborationRequirements && project.collaborationRequirements.positionsRequired) {
        const positions = Array.isArray(project.collaborationRequirements.positionsRequired) 
            ? project.collaborationRequirements.positionsRequired 
            : project.collaborationRequirements.positionsRequired.split(',').map(p => p.trim());
            
        positions.forEach(position => {
            const option = document.createElement('option');
            option.value = position;
            option.textContent = position;
            positionSelect.appendChild(option);
        });
    }
    
    // Load available collaborators
    fetchCollaborators();
    
    inviteModal.style.display = 'block';
}

// Open delete confirmation modal
function openDeleteModal(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    currentProjectId = projectId;
    document.querySelector('.project-to-delete').innerHTML = `
        <strong>${project.projectDetails.projectTitle}</strong>
        <p>ID: ${project.id}</p>
        <p>Researcher: ${project.projectDetails.researcherName}</p>
    `;
    
    deleteModal.style.display = 'block';
}

// Close the project modal
function closeModal() {
    projectModal.style.display = 'none';
}

// Close the invite modal
function closeInviteModal() {
    inviteModal.style.display = 'none';
}

// Close the delete confirmation modal
function closeDeleteModal() {
    deleteModal.style.display = 'none';
}

// Handle form submission for creating/editing projects
async function handleFormSubmit(e) {
    e.preventDefault();
    
    try {
        const projectData = getFormData();
        const isEditing = currentProjectId !== null;
        
        const url = isEditing ? `${API_URL}/${currentProjectId}` : API_URL;
        const method = isEditing ? 'PUT' : 'POST';
        
        console.log('Submitting data:', JSON.stringify(projectData));
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });
        
        if (!response.ok) {
            throw new Error(`Failed to ${isEditing ? 'update' : 'create'} project`);
        }
        
        closeModal();
        fetchProjects();
        showToast(`Project ${isEditing ? 'updated' : 'created'} successfully!`, 'success');
    } catch (error) {
        console.error(`Error ${currentProjectId ? 'updating' : 'creating'} project:`, error);
        showToast(`Error ${currentProjectId ? 'updating' : 'creating'} project. Please try again.`, 'error');
    }
}

// Handle invite collaborator form submission (manual invite)
async function handleInviteSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('collaborator-email').value;
    const position = document.getElementById('collaborator-position').value;
    const message = document.getElementById('collaboration-message').value;
    
    if (!email || !position) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }
    
    try {
        // Find the current project
        const project = projects.find(p => p.id === inviteProjectId);
        if (!project) {
            throw new Error('Project not found');
        }
        
        // Manual invitation data
        const manualInviteData = {
            projectId: inviteProjectId,
            email,
            position,
            message
        };
        
        console.log('Sending manual invitation:', manualInviteData);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Create a collaborator info object for manual invites
        const collaboratorInfo = {
            id: `manual-${Date.now()}`, // Generate a temporary ID for manual invites
            name: email.split('@')[0], // Use part of email as name
            title: position,
            email: email,
            status: 'invited',
            invitedDate: new Date().toISOString(),
            isManualInvite: true
        };
        
        // Initialize invitedCollaborators array if it doesn't exist
        if (!project.invitedCollaborators) {
            project.invitedCollaborators = [];
        }
        
        // Check if email is already invited
        const alreadyInvited = project.invitedCollaborators.some(
            invited => invited.email === email
        );
        
        if (!alreadyInvited) {
            // Add to project's invitedCollaborators array
            project.invitedCollaborators.push(collaboratorInfo);
            
            // Update the project in the API
            await updateProjectInAPI(project);
            
            closeInviteModal();
            showToast(`Invitation sent to ${email} successfully!`, 'success');
        } else {
            showToast(`An invitation has already been sent to ${email}.`, 'info');
        }
    } catch (error) {
        console.error('Error sending invitation:', error);
        showToast('Error sending invitation. Please try again.', 'error');
    }
}

// Add a function to display invited collaborators in the project card
function updateProjectDisplayWithInvitedCollaborators() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        const projectId = card.getAttribute('data-id');
        const project = projects.find(p => p.id === projectId);
        
        if (project && project.invitedCollaborators && project.invitedCollaborators.length > 0) {
            // Create or update the collaborators section
            let collaboratorsSection = card.querySelector('.invited-collaborators');
            
            if (!collaboratorsSection) {
                collaboratorsSection = document.createElement('div');
                collaboratorsSection.className = 'invited-collaborators';
                
                // Find the project-body to insert before the footer
                const projectBody = card.querySelector('.project-body');
                const footer = card.querySelector('.project-footer');
                
                if (projectBody && footer) {
                    card.insertBefore(collaboratorsSection, footer);
                }
            }
            
            // Update the content of the collaborators section
            collaboratorsSection.innerHTML = `
                <h4 class="collaborators-title">
                    <i class="fas fa-users"></i> Invited Collaborators (${project.invitedCollaborators.length})
                </h4>
                <div class="collaborators-list">
                    ${project.invitedCollaborators.slice(0, 3).map(collaborator => `
                        <div class="collaborator-chip">
                            <i class="fas fa-user-circle"></i>
                            <span>${collaborator.name || collaborator.email}</span>
                            <span class="status ${collaborator.status}">${collaborator.status}</span>
                        </div>
                    `).join('')}
                    ${project.invitedCollaborators.length > 3 ? 
                        `<div class="collaborator-chip more">+${project.invitedCollaborators.length - 3} more</div>` : 
                        ''}
                </div>
            `;
        }
    });
}

// Delete a project
async function deleteProject() {
    if (!currentProjectId) return;
    
    try {
        const response = await fetch(`${API_URL}/${currentProjectId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete project');
        }
        
        closeDeleteModal();
        fetchProjects();
        showToast('Project deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting project:', error);
        showToast('Error deleting project. Please try again.', 'error');
    }
}

// Get form data and structure it for API
function getFormData() {
    const formData = {
        projectDetails: {
            researcherName: document.getElementById('researcher-name').value,
            projectTitle: document.getElementById('project-title').value,
            description: document.getElementById('description').value,
            keyResearchArea: document.getElementById('key-research-area').value,
            startDate: document.getElementById('start-date').value,
            endDate: document.getElementById('end-date').value,
            fundingAvailable: document.getElementById('funding-available').checked
        },
        collaborationRequirements: {
            skillsAndExpertise: document.getElementById('skills').value.split(',').map(item => item.trim()),
            experienceLevel: document.getElementById('experience-level').value,
            positionsRequired: document.getElementById('positions').value.split(',').map(item => item.trim()),
            technicalRequirements: document.getElementById('technical-requirements').value.split(',').map(item => item.trim())
        }
    };
    
    // If editing, include the project ID
    if (currentProjectId) {
        formData.id = currentProjectId;
    } else {
        // For new projects, generate an ID using timestamp and random string
        formData.id = generateProjectId();
    }
    
    return formData;
}

// Reset the form fields
function resetForm() {
    projectForm.reset();
    document.getElementById('project-id').value = '';
}

// Search projects based on input
function searchProjects() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm.trim()) {
        displayProjects(projects);
        return;
    }
    
    const filteredProjects = projects.filter(project => {
        return (
            project.projectDetails.projectTitle.toLowerCase().includes(searchTerm) ||
            project.projectDetails.researcherName.toLowerCase().includes(searchTerm) ||
            project.projectDetails.description.toLowerCase().includes(searchTerm) ||
            project.projectDetails.keyResearchArea.toLowerCase().includes(searchTerm)
        );
    });
    
    displayProjects(filteredProjects);
}

// Format date for display (YYYY-MM-DD to MMM DD, YYYY)
function formatDate(dateString) {
    if (!dateString) return 'Not specified';
    
    try {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

// Format date for input fields (YYYY-MM-DD)
function formatDateForInput(dateString) {
    return dateString || '';
}

// Show loading state in a container
function showLoading(container) {
    container.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> Loading...
        </div>
    `;
}

// Show toast notification
function showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Set message with icon
    toast.innerHTML = type === 'success' ?
        `<i class="fas fa-check-circle"></i> ${message}` :
        `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Generate ID for new projects
function generateProjectId() {
    // Find the highest existing project ID number
    const projectNumbers = projects.map(project => {
        const match = project.id.match(/PRJ(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
    });
    
    const highestNumber = Math.max(0, ...projectNumbers);
    const newNumber = highestNumber + 1;
    
    // Format the number with leading zeros (PRJ001, PRJ002, etc.)
    return `PRJ${String(newNumber).padStart(3, '0')}`;
}