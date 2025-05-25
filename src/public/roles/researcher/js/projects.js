document.addEventListener('DOMContentLoaded', () => {
    // API URL configuration - supports both local development and production
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' 
        : 'https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net/api';
    
    const PROJECTS_API = `${API_BASE_URL}/projects`;
    const SENT_INVITATIONS_API = `${API_BASE_URL}/project_invitations`;
    const USERS_API = `${API_BASE_URL}/users`;
    
    // DOM Elements
    const projectsContainer = document.getElementById('projects-container');
    const projectModal = document.getElementById('project-modal');
    const inviteModal = document.getElementById('invite-modal');
    const profileModal = document.getElementById('profile-modal');
    const deleteModal = document.getElementById('delete-modal');
    const projectForm = document.getElementById('project-form');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const createProjectBtn = document.getElementById('create-project-btn');
    
    // Close buttons
    document.querySelectorAll('.close, #cancel-btn, #cancel-invite-btn, #close-profile-btn, #cancel-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            projectModal.style.display = 'none';
            inviteModal.style.display = 'none';
            profileModal.style.display = 'none';
            deleteModal.style.display = 'none';
        });
    });
    
    // Load projects when the page loads
    loadProjects();
    
    // Event Listeners
    createProjectBtn.addEventListener('click', openCreateProjectModal);
    searchBtn.addEventListener('click', searchProjects);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            searchProjects();
        }
    });
    
    projectForm.addEventListener('submit', handleProjectFormSubmit);
    document.getElementById('confirm-delete-btn').addEventListener('click', deleteProject);
    
    // Tab functionality for invites
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all tabs
            document.querySelectorAll('.tab-btn').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Add active class to clicked tab
            e.target.classList.add('active');
            
            // Hide all tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            // Show selected tab content
            const tabId = e.target.getAttribute('data-tab');
            document.getElementById(tabId).classList.remove('hidden');
        });
    });
    
    // Functions
    async function loadProjects(searchQuery = '') {
        try {
            projectsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading projects...</div>';
            
            let url = PROJECTS_API;
            if (searchQuery) {
                url += `?search=${encodeURIComponent(searchQuery)}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const projects = await response.json();
            
            if (projects.length === 0) {
                projectsContainer.innerHTML = '<div class="no-results">No projects found. Create a new project to get started.</div>';
                return;
            }
            
            displayProjects(projects);
        } catch (error) {
            console.error('Error loading projects:', error);
            projectsContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i> Error loading projects. Please try again later.</div>`;
        }
    }
    
    function displayProjects(projects) {
        projectsContainer.innerHTML = '';
        
        projects.forEach(project => {
            const startDate = new Date(project.start_date).toLocaleDateString();
            const endDate = new Date(project.end_date).toLocaleDateString();
            const keyResearchAreas = project.key_research_area ? project.key_research_area.split(',').map(area => `<span class="tag">${area.trim()}</span>`).join('') : '';
            
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.dataset.id = project.id;
            
            let statusClass = '';
            let statusText = project.status || 'Active';
            
            switch (statusText.toLowerCase()) {
                case 'completed':
                    statusClass = 'status-completed';
                    break;
                case 'active':
                    statusClass = 'status-active';
                    break;
                case 'pending':
                    statusClass = 'status-pending';
                    break;
                default:
                    statusClass = 'status-active';
            }
            
            projectCard.innerHTML = `
                <div class="project-header">
                    <h3 class="project-title">${project.project_title}</h3>
                    <div class="project-status ${statusClass}">${statusText}</div>
                </div>
                <div class="project-info">
                    <p class="project-dates"><i class="fas fa-calendar"></i> ${startDate} - ${endDate}</p>
                </div>
                <div class="project-description">${project.description}</div>
                <div class="project-tags">
                    ${keyResearchAreas}
                    ${project.funding_available ? '<span class="tag funding">Funding Available</span>' : ''}
                </div>
                <div class="experience-level">
                    <span class="label">Experience Level:</span>
                    <span class="value">${project.experience_level}</span>
                </div>
                <div class="project-actions">
                    <button class="btn view-btn" data-id="${project.id}"><i class="fas fa-eye"></i> View Details</button>
                    <button class="btn edit-btn" data-id="${project.id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn invite-btn" data-id="${project.id}" data-title="${project.project_title}"><i class="fas fa-user-plus"></i> Invite</button>
                    <button class="btn delete-btn" data-id="${project.id}" data-title="${project.project_title}"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;
            
            projectsContainer.appendChild(projectCard);
            
            // Add event listeners to action buttons
            projectCard.querySelector('.view-btn').addEventListener('click', () => viewProjectDetails(project.id));
            projectCard.querySelector('.edit-btn').addEventListener('click', () => openEditProjectModal(project.id));
            projectCard.querySelector('.invite-btn').addEventListener('click', () => openInviteModal(project.id, project.project_title));
            projectCard.querySelector('.delete-btn').addEventListener('click', () => confirmDeleteProject(project.id, project.project_title));
        });
    }
    
    function searchProjects() {
        const query = searchInput.value.trim();
        loadProjects(query);
    }
    
async function viewProjectDetails(projectId) {
    try {
        const response = await fetch(`${PROJECTS_API}/${projectId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const project = await response.json();
        const detailsModal = document.getElementById('details-modal');
        const detailsContainer = document.getElementById('details-container');
        
        // Format dates
        const startDate = new Date(project.start_date).toLocaleDateString();
        const endDate = new Date(project.end_date).toLocaleDateString();
        
        // Format research areas as tags
        let keyResearchAreas = '<span class="tag">None specified</span>';
        if (project.key_research_area) {
            keyResearchAreas = project.key_research_area
                .split(',')
                .map(area => `<span class="tag">${area.trim()}</span>`)
                .join('');
        }
        
        // Format skills
        let skillsList = '<span>None specified</span>';
        if (project.skills_and_expertise || project.skills) {
            const skillsData = project.skills_and_expertise || project.skills;
            skillsList = skillsData
                .split(',')
                .map(skill => `<span class="skill-item">${skill.trim()}</span>`)
                .join(', ');
        }
        
        // Format positions
        let positionsList = '<span>None specified</span>';
        if (project.positions_required || project.positions) {
            const positionsData = project.positions_required || project.positions;
            positionsList = positionsData
                .split(',')
                .map(position => `<span>${position.trim()}</span>`)
                .join(', ');
        }
        
        // Format technical requirements
        let technicalReqs = '<span>None specified</span>';
        if (project.technical_requirements) {
            technicalReqs = project.technical_requirements
                .split(',')
                .map(req => `<span>${req.trim()}</span>`)
                .join(', ');
        }
        
        // Format collaborators
        let collaboratorsHtml = '<div class="no-results">No collaborators yet</div>';
        if (project.Collaborators) {
            try {
                const collaborators = Array.isArray(project.Collaborators) ? 
                    project.Collaborators : 
                    JSON.parse(project.Collaborators);
                
                if (collaborators.length > 0) {
                    collaboratorsHtml = `
                        <div class="collaborators-list">
                            ${collaborators.map(collaborator => `
                                <div class="collaborator-item">
                                    <div class="collaborator-info">
                                        <h4>${collaborator.name || 'Unknown'}</h4>
                                        <p>Position: ${collaborator.position || 'Not specified'}</p>
                                        <p>Status: <span class="tag ${collaborator.status === 'accepted' ? 'status-active' : 'status-pending'}">
                                            ${collaborator.status || 'pending'}
                                        </span></p>
                                        <p>Invited on: ${new Date(collaborator.invitationDate).toLocaleDateString()}</p>
                                    </div>
                                    <div class="collaborator-actions">
                                        <button class="btn remove-collaborator-btn" data-project-id="${projectId}" data-user-id="${collaborator.id}">
                                            <i class="fas fa-user-minus"></i> Remove
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }
            } catch (e) {
                console.error("Error parsing collaborators:", e);
                collaboratorsHtml = '<div class="error">Error loading collaborators</div>';
            }
        }
        
        // Set status class
        let statusClass = '';
        let statusText = project.status || 'Active';
        
        switch (statusText.toLowerCase()) {
            case 'completed':
                statusClass = 'status-completed';
                break;
            case 'active':
                statusClass = 'status-active';
                break;
            case 'pending':
                statusClass = 'status-pending';
                break;
            default:
                statusClass = 'status-active';
        }
        
        // Update modal title
        document.getElementById('details-project-title').textContent = project.project_title;
        
        // Setup edit button
        const editFromDetailsBtn = document.getElementById('edit-from-details-btn');
        editFromDetailsBtn.dataset.id = projectId;
        editFromDetailsBtn.addEventListener('click', () => {
            detailsModal.style.display = 'none';
            openEditProjectModal(projectId);
        });
        
        // Get username and department
        const userName = project.userName || 'Not specified';
        const department = project.department || 'Not specified';
        
        // Build the details HTML
        detailsContainer.innerHTML = `
            <div class="project-details">
                <div class="details-section">
                    <div class="details-header">
                        <h3>Project Overview</h3>
                        <div class="project-status ${statusClass}">${statusText}</div>
                    </div>
                    <div class="details-row">
                        <div class="details-label">Researcher:</div>
                        <div class="details-value">${project.researcher_name || 'Not specified'}</div>
                    </div>
                    <div class="details-row">
                        <div class="details-label">Department:</div>
                        <div class="details-value">${department}</div>
                    </div>
                    <div class="details-row">
                        <div class="details-label">User Name:</div>
                        <div class="details-value">${userName}</div>
                    </div>
                    <div class="details-row">
                        <div class="details-label">Project Timeline:</div>
                        <div class="details-value">${startDate} - ${endDate}</div>
                    </div>
                    <div class="details-row">
                        <div class="details-label">Funding Available:</div>
                        <div class="details-value">${project.funding_available ? 'Yes' : 'No'}</div>
                    </div>
                    <div class="details-row">
                        <div class="details-label">Reviewer:</div>
                        <div class="details-value">${project.reviewer || 'Not assigned'}</div>
                    </div>
                </div>
                
                <div class="details-section">
                    <h3>Description</h3>
                    <div class="details-description">${project.description || 'No description provided.'}</div>
                </div>
                
                <div class="details-section">
                    <h3>Research Areas</h3>
                    <div class="details-tags">
                        ${keyResearchAreas}
                    </div>
                </div>
                
                <div class="details-section">
                    <h3>Collaboration Requirements</h3>
                    <div class="details-row">
                        <div class="details-label">Experience Level:</div>
                        <div class="details-value">${project.experience_level || 'Not specified'}</div>
                    </div>
                    <div class="details-row">
                        <div class="details-label">Required Skills:</div>
                        <div class="details-value">${skillsList}</div>
                    </div>
                    <div class="details-row">
                        <div class="details-label">Open Positions:</div>
                        <div class="details-value">${positionsList}</div>
                    </div>
                    <div class="details-row">
                        <div class="details-label">Technical Requirements:</div>
                        <div class="details-value">${technicalReqs}</div>
                    </div>
                </div>
                
                <div class="details-section">
                    <div class="section-header">
                        <h3>Collaborators</h3>
                        <button class="btn invite-btn" data-id="${projectId}" data-title="${project.project_title}">
                            <i class="fas fa-user-plus"></i> Invite Collaborator
                        </button>
                    </div>
                    ${collaboratorsHtml}
                </div>
            </div>
            
            <div class="modal-footer">
                <button id="close-details-btn" class="btn secondary-btn">
                    <i class="fas fa-times"></i> Close
                </button>
                <button id="edit-from-details-btn" class="btn primary-btn" data-id="${projectId}">
                    <i class="fas fa-edit"></i> Edit Project
                </button>
            </div>
        `;
        
        // Add event listeners for remove collaborator buttons
        detailsContainer.querySelectorAll('.remove-collaborator-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const projectId = e.target.closest('button').dataset.projectId;
                const userId = e.target.closest('button').dataset.userId;
                await removeCollaborator(projectId, userId);
            });
        });
        
        // Add event listener for invite button in details
        detailsContainer.querySelector('.invite-btn').addEventListener('click', (e) => {
            detailsModal.style.display = 'none';
            openInviteModal(projectId, project.project_title);
        });
        
        // Show the modal
        detailsModal.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading project details:', error);
        showNotification('Error loading project details. Please try again later.', 'error');
    }
}

async function removeCollaborator(projectId, userId) {
    try {
        // Get current project data
        const response = await fetch(`${PROJECTS_API}/${projectId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch project: ${response.status}`);
        }
        
        const project = await response.json();
        
        // Get current collaborators
        let collaborators = [];
        if (project.Collaborators) {
            try {
                collaborators = Array.isArray(project.Collaborators) ? 
                    project.Collaborators : 
                    JSON.parse(project.Collaborators);
            } catch (e) {
                console.error("Error parsing collaborators:", e);
                collaborators = [];
            }
        }
        
        // Find the collaborator to remove (to get their details)
        const collaboratorToRemove = collaborators.find(c => c.id === userId);
        
        // Filter out the collaborator to remove
        const updatedCollaborators = collaborators.filter(c => c.id !== userId);
        
        // Update the project
        const updateResponse = await fetch(`${PROJECTS_API}/${projectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...project,
                Collaborators: updatedCollaborators
            }),
        });
        
        if (!updateResponse.ok) {
            throw new Error(`Failed to update project: ${updateResponse.status}`);
        }
        
        // Also update the invitations API (optional - depends on your requirements)
        try {
            // This assumes you have an endpoint to delete invitations
            const deleteInviteResponse = await fetch(`${SENT_INVITATIONS_API}/${projectId}/${userId}`, {
                method: 'DELETE'
            });
            
            if (!deleteInviteResponse.ok) {
                console.warn("Couldn't delete invitation record, but project was updated");
            }
        } catch (inviteError) {
            console.error("Error updating invitations API:", inviteError);
        }
        
        // Refresh the details view
        viewProjectDetails(projectId);
        showNotification('Collaborator removed successfully', 'success');
        
    } catch (error) {
        console.error('Error removing collaborator:', error);
        showNotification('Error removing collaborator. Please try again later.', 'error');
    }
}
    
    function openCreateProjectModal() {
        document.getElementById('modal-title').textContent = 'Add New Project';
        projectForm.reset();
        document.getElementById('project-id').value = '';
        
        // Set default dates for new project
        const today = new Date().toISOString().split('T')[0];
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        
        document.getElementById('start-date').value = today;
        document.getElementById('end-date').value = nextYear.toISOString().split('T')[0];
        
        // Add userId field if not present
        ensureAdditionalFields();
        
        projectModal.style.display = 'block';
    }
    
    function ensureAdditionalFields() {
        const form = document.getElementById('project-form');
        const formBody = form.querySelector('.modal-body');
        
        // Check if additional fields section exists
        let additionalFieldsSection = form.querySelector('.additional-fields');
        
        if (!additionalFieldsSection) {
            // Create section for additional fields from DB schema
            additionalFieldsSection = document.createElement('div');
            additionalFieldsSection.className = 'additional-fields';
            additionalFieldsSection.innerHTML = `
                <h3>Update Status</h3>
                
                <div class="form-group">
                    <label for="status">Status</label>
                    <select id="status">
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
            `;
            
            // Insert before form-actions
            const formActions = form.querySelector('.form-actions');
            form.insertBefore(additionalFieldsSection, formActions);
        }
        
        // Rename fields to match DB schema
        const skillsField = document.getElementById('skills');
        if (skillsField) {
            skillsField.id = 'skills-and-expertise';
            const skillsLabel = skillsField.previousElementSibling;
            if (skillsLabel) {
                skillsLabel.setAttribute('for', 'skills-and-expertise');
            }
        }
        
        const positionsField = document.getElementById('positions');
        if (positionsField) {
            positionsField.id = 'positions-required';
            const positionsLabel = positionsField.previousElementSibling;
            if (positionsLabel) {
                positionsLabel.setAttribute('for', 'positions-required');
            }
        }
    }
    
    async function openEditProjectModal(projectId) {
        try {
            document.getElementById('modal-title').textContent = 'Edit Project';
            
            const response = await fetch(`${PROJECTS_API}/${projectId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const project = await response.json();
            
            // Ensure additional fields exist before populating
            ensureAdditionalFields();
            
            // Fill the form with project data
            document.getElementById('project-id').value = project.id;
            document.getElementById('researcher-name').value = project.researcher_name || '';
            document.getElementById('project-title').value = project.project_title || '';
            document.getElementById('description').value = project.description || '';
            document.getElementById('key-research-area').value = project.key_research_area || '';
            document.getElementById('start-date').value = project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '';
            document.getElementById('end-date').value = project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '';
            document.getElementById('funding-available').checked = project.funding_available || false;
            
            // Fill DB schema specific fields
            const skillsField = document.getElementById('skills-and-expertise') || document.getElementById('skills');
            skillsField.value = project.skills_and_expertise || project.skills || '';
            
            const positionsField = document.getElementById('positions-required') || document.getElementById('positions');
            positionsField.value = project.positions_required || project.positions || '';
            
            document.getElementById('technical-requirements').value = project.technical_requirements || '';
            document.getElementById('experience-level').value = project.experience_level || 'Intermediate';
            
            // Additional fields
            if (document.getElementById('status')) {
                document.getElementById('status').value = project.status || 'Active';
            }
            
            projectModal.style.display = 'block';
            
        } catch (error) {
            console.error('Error loading project for editing:', error);
            showNotification('Error loading project data. Please try again later.', 'error');
        }
    }
    
async function handleProjectFormSubmit(e) {
    e.preventDefault();
    
    // First ensure all additional fields are present
    ensureAdditionalFields();
    
    const projectId = document.getElementById('project-id').value;
    const isNewProject = !projectId;
    
    try {
        // Get form values - using null-safe operators
        const projectData = {
            researcher_name: document.getElementById('researcher-name').value,
            project_title: document.getElementById('project-title').value,
            description: document.getElementById('description').value,
            key_research_area: document.getElementById('key-research-area').value,
            start_date: document.getElementById('start-date').value,
            end_date: document.getElementById('end-date').value,
            funding_available: document.getElementById('funding-available').checked,
            experience_level: document.getElementById('experience-level').value,
            skills_and_expertise: document.getElementById('skills-and-expertise')?.value || '',
            positions_required: document.getElementById('positions-required')?.value || '',
            technical_requirements: document.getElementById('technical-requirements').value,
            status: document.getElementById('status')?.value || 'Active',
            userID: document.getElementById('userID')?.value || '',
            department: document.getElementById('department')?.value || '',
            userName: document.getElementById('userName')?.value || '',
            reviewer: document.getElementById('reviewer')?.value || null,
            assigned_proposal_status: 'pending',
            Collaborators: [] // Initialize empty array for collaborators
        };

        let response;
        let url = PROJECTS_API;
        let method = 'POST';
        
        if (!isNewProject) {
            url = `${PROJECTS_API}/${projectId}`;
            method = 'PUT';
            
            // For updates, get the existing project first to preserve collaborators
            const existingResponse = await fetch(url);
            if (existingResponse.ok) {
                const existingProject = await existingResponse.json();
                if (existingProject.Collaborators) {
                    projectData.Collaborators = existingProject.Collaborators;
                }
            }
        }

        response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData); // Debug log
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        
        // Close modal and reload projects
        projectModal.style.display = 'none';
        loadProjects();
        
        showNotification(isNewProject ? 'Project created successfully!' : 'Project updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error saving project:', error);
        showNotification(`Error saving project: ${error.message}`, 'error');
    }
}
    function openInviteModal(projectId, projectTitle) {
        document.getElementById('invite-project-id').value = projectId;
        document.getElementById('invite-project-title').textContent = projectTitle;
        
        // Populate positions dropdown from the project's required positions
        populatePositionsDropdown(projectId);
        
        // Set a default invitation message
        document.getElementById('collaboration-message').value = `Hi there,\n\nI would like to invite you to collaborate on my research project "${projectTitle}". Your expertise would be valuable for this project.\n\nLooking forward to your response.\n\nBest regards`;
        
        // Reset and show the first tab
        document.querySelector('.tab-btn[data-tab="available-collaborators"]').click();
        
        // Load available collaborators
        loadAvailableCollaborators(projectId);
        
        inviteModal.style.display = 'block';
    }
    
    async function populatePositionsDropdown(projectId) {
        try {
            const response = await fetch(`${PROJECTS_API}/${projectId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const project = await response.json();
            const positionsSelect = document.getElementById('collaborator-position');
            
            // Clear previous options
            positionsSelect.innerHTML = '';
            
            // Add positions based on project data - check both field names
            const positionsData = project.positions_required || project.positions;
            
            if (positionsData) {
                const positions = positionsData.split(',');
                
                positions.forEach(position => {
                    const option = document.createElement('option');
                    option.value = position.trim();
                    option.textContent = position.trim();
                    positionsSelect.appendChild(option);
                });
            } else {
                // Add a default option if no positions defined
                const option = document.createElement('option');
                option.value = 'Collaborator';
                option.textContent = 'Collaborator';
                positionsSelect.appendChild(option);
            }
            
        } catch (error) {
            console.error('Error loading positions:', error);
            
            // Add a default option on error
            const positionsSelect = document.getElementById('collaborator-position');
            positionsSelect.innerHTML = '<option value="Collaborator">Collaborator</option>';
        }
    }
    
    async function loadAvailableCollaborators(projectId) {
        const collaboratorsList = document.getElementById('collaborators-list');
        collaboratorsList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading collaborators...</div>';
        
        try {
            const response = await fetch(USERS_API);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const users = await response.json();
            
            if (users.length === 0) {
                collaboratorsList.innerHTML = '<div class="no-results">No users found.</div>';
                return;
            }
            
            // Clear loading message
            collaboratorsList.innerHTML = '';
            
            // Display each user as a potential collaborator
            users.forEach(user => {
                const userCard = document.createElement('div');
                userCard.className = 'collaborator-card';
                
                // Format research area as tags
                let researchAreaTags = '<span class="tag">No research area specified</span>';
                if (user.research_area) {
                    researchAreaTags = user.research_area
                        .split(',')
                        .map(area => `<span class="tag">${area.trim()}</span>`)
                        .join('');
                }
                
                userCard.innerHTML = `
                    <div class="collaborator-info">
                        <h4>${user.name || 'No name provided'}</h4>
                        <p>${user.department || 'No department specified'}</p>
                        <p>${user.role || 'No role specified'}</p>
                        <div class="skills">
                            ${researchAreaTags}
                        </div>
                    </div>
                    <div class="collaborator-actions">
                        <button class="btn view-profile-btn" data-id="${user.id}" data-name="${user.name}">
                            <i class="fas fa-id-card"></i> View Profile
                        </button>
                        <button class="btn invite-user-btn" data-id="${user.id}" data-name="${user.name}">
                            <i class="fas fa-paper-plane"></i> Invite
                        </button>
                    </div>
                `;
                
                collaboratorsList.appendChild(userCard);
                
                // Add event listeners to buttons
                userCard.querySelector('.view-profile-btn').addEventListener('click', () => 
                    viewCollaboratorProfile(user.id, user.name));
                userCard.querySelector('.invite-user-btn').addEventListener('click', () => 
                    sendInvitation(projectId, user.id, user.name));
            });
            
        } catch (error) {
            console.error('Error loading users:', error);
            collaboratorsList.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i> Error loading users. Please try again later.
                </div>
            `;
        }
    }
    
    async function viewCollaboratorProfile(userId, userName) {
        const profileContent = document.getElementById('collaborator-profile');
        profileContent.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading profile...</div>';
        
        try {
            // Trim the userId to remove any whitespace or newline characters
            const trimmedUserId = userId.trim();
            
            const response = await fetch(`${USERS_API}/${trimmedUserId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const user = await response.json();
            
            // Format research areas as tags
            let researchAreas = '<span class="tag">None specified</span>';
            if (user.research_area) {
                researchAreas = user.research_area
                    .split(',')
                    .map(area => `<span class="tag">${area.trim()}</span>`)
                    .join('');
            }
            
            // Format qualifications as list items
            let qualificationsList = '<li>No qualifications information</li>';
            if (user.qualifications) {
                qualificationsList = user.qualifications
                    .split('\n')
                    .filter(item => item.trim())
                    .map(item => `<li>${item.trim()}</li>`)
                    .join('');
            }
            
            // Build the profile HTML using the user data from profiles table
            profileContent.innerHTML = `
                <div class="profile-header">
                    <div class="profile-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="profile-title">
                        <h3>${user.name || userName || 'User'}</h3>
                        <p>${user.role || ''}</p>
                        <p>${user.department || 'No department specified'}</p>
                    </div>
                </div>
                
                <div class="profile-section">
                    <h4>Contact Information</h4>
                    <div class="profile-contact">
                        <p><i class="fas fa-envelope"></i> ${user.email || 'No email provided'}</p>
                        <p><i class="fas fa-phone"></i> ${user.phone || 'No phone provided'}</p>
                    </div>
                </div>
                
                <div class="profile-section">
                    <h4>Academic Information</h4>
                    <div class="profile-row">
                        <span class="label">Academic Role:</span>
                        <span class="value">${user.academic_role || 'Not specified'}</span>
                    </div>
                    <div class="profile-row">
                        <span class="label">Research Experience:</span>
                        <span class="value">${user.research_experience ? `${user.research_experience} years` : 'Not specified'}</span>
                    </div>
                </div>
                
                <div class="profile-section">
                    <h4>Research Areas</h4>
                    <div class="profile-tags">
                        ${researchAreas}
                    </div>
                </div>
                
                <div class="profile-section">
                    <h4>Qualifications</h4>
                    <ul class="profile-list">
                        ${qualificationsList}
                    </ul>
                </div>
                
                <div class="profile-section">
                    <h4>Current Project</h4>
                    <p>${user.current_project || 'No current project specified'}</p>
                </div>
                
                <div class="profile-stats">
                    <div class="stat-item">
                        <div class="stat-value">${user.research_experience || 0}</div>
                        <div class="stat-label">Years Experience</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${user.projects_created || 0}</div>
                        <div class="stat-label">Projects Created</div>
                    </div>
                </div>
            `;
            
            // Setup invite button
            const inviteFromProfileBtn = document.getElementById('invite-from-profile-btn');
            inviteFromProfileBtn.dataset.userId = trimmedUserId;
            inviteFromProfileBtn.addEventListener('click', () => {
                profileModal.style.display = 'none';
                const projectId = document.getElementById('invite-project-id').value;
                sendInvitation(projectId, trimmedUserId, user.name || userName);
            });
            
            profileModal.style.display = 'block';
            
        } catch (error) {
            console.error('Error loading user profile:', error);
            profileContent.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i> Error loading profile: ${error.message}
                </div>
            `;
        }
    }
async function sendInvitation(projectId, userId, userName) {
    try {
        const position = document.getElementById('collaborator-position').value;
        const message = document.getElementById('collaboration-message').value;
        
        // First, get the current project data to check existing collaborators
        const projectResponse = await fetch(`${PROJECTS_API}/${projectId}`);
        if (!projectResponse.ok) {
            throw new Error(`Failed to fetch project data: ${projectResponse.status}`);
        }
        const project = await projectResponse.json();
        
        // Prepare the new collaborator data
        const newCollaborator = {
            id: userId,
            name: userName,
            position: position,
            invitationDate: new Date().toISOString(),
            status: "pending",
            message: message
        };
        
        // Get existing collaborators or initialize empty array
        let collaborators = [];
        if (project.Collaborators) {
            try {
                collaborators = Array.isArray(project.Collaborators) ? 
                    project.Collaborators : 
                    JSON.parse(project.Collaborators);
            } catch (e) {
                console.error("Error parsing existing collaborators:", e);
                collaborators = [];
            }
        }
        
        // Check if this user is already a collaborator
        const existingIndex = collaborators.findIndex(c => c.id === userId);
        if (existingIndex >= 0) {
            // Update existing entry
            collaborators[existingIndex] = newCollaborator;
        } else {
            // Add new collaborator
            collaborators.push(newCollaborator);
        }
        
        // Update the project with new collaborators data
        const updateResponse = await fetch(`${PROJECTS_API}/${projectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...project,
                Collaborators: collaborators
            }),
        });
        
        if (!updateResponse.ok) {
            throw new Error(`Failed to update project: ${updateResponse.status}`);
        }
        
        // Also send the invitation to the invitations API
        const invitationData = {
            projectId: projectId,
            created_at: new Date().toISOString().split('T')[0],
            description: project.description || "No description",
            key_research_area: project.key_research_area || "Not specified",
            name: userName,
            start_date: project.start_date,
            end_date: project.end_date,
            funding_available: project.funding_available ? "true" : "false",
            experience_level: project.experience_level || "Not specified",
            messages: message,
            email: "", // Will be populated from user data
            university: "", // Will be populated from user data
            projectTitle: project.project_title
        };
        
        // Get user data to populate email and university
        try {
            const userResponse = await fetch(`${USERS_API}/${userId}`);
            if (userResponse.ok) {
                const userData = await userResponse.json();
                invitationData.email = userData.email || "";
                invitationData.university = userData.university || "";
            }
        } catch (userError) {
            console.error("Couldn't fetch user details:", userError);
        }
        
        // Send to invitations API
        const inviteResponse = await fetch(SENT_INVITATIONS_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invitationData),
        });
        
        if (!inviteResponse.ok) {
            throw new Error(`Failed to create invitation record: ${inviteResponse.status}`);
        }
        
        showNotification(`Invitation sent to ${userName} successfully!`, 'success');
        inviteModal.style.display = 'none';
        
    } catch (error) {
        console.error('Error sending invitation:', error);
        showNotification(`Error sending invitation: ${error.message}`, 'error');
    }
}
    
    function confirmDeleteProject(projectId, projectTitle) {
        document.getElementById('confirm-delete-btn').dataset.id = projectId;
        document.querySelector('.project-to-delete').innerHTML = `
            <div class="delete-project-info">
                <h3>${projectTitle}</h3>
                <p>Project ID: ${projectId}</p>
            </div>
        `;
        
        deleteModal.style.display = 'block';
    }
    
async function deleteProject() {
    const projectId = document.getElementById('confirm-delete-btn').dataset.id;
    
    try {
        const response = await fetch(`${PROJECTS_API}/${projectId}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        
        // Close modal and reload projects
        deleteModal.style.display = 'none';
        loadProjects();
        
        showNotification('Project deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting project:', error);
        showNotification(`Error deleting project: ${error.message}`, 'error');
    }
}

// Update the event listener setup to ensure proper 'this' binding
document.getElementById('confirm-delete-btn').addEventListener('click', deleteProject);

// Update the event listener setup to ensure proper 'this' binding
document.getElementById('confirm-delete-btn').addEventListener('click', deleteProject);
    
    // Utility function for notifications
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Add close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.add('notification-hiding');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // Close modals when clicking outside content
    window.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            projectModal.style.display = 'none';
        } else if (e.target === inviteModal) {
            inviteModal.style.display = 'none';
        } else if (e.target === profileModal) {
            profileModal.style.display = 'none';
        } else if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    });
    
    // Details modal event listeners
    const detailsModal = document.getElementById('details-modal');
    
    // Close button in header
    detailsModal.querySelector('.close').addEventListener('click', () => {
        detailsModal.style.display = 'none';
    });
    
    // Close button in footer
    document.getElementById('close-details-btn').addEventListener('click', () => {
        detailsModal.style.display = 'none';
    });
    
    // Close when clicking outside modal
    window.addEventListener('click', (e) => {
        if (e.target === detailsModal) {
            detailsModal.style.display = 'none';
        }
    });
});
