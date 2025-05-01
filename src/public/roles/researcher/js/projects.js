document.addEventListener('DOMContentLoaded', () => {
    // API URL configuration - supports both local development and production
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' 
        : 'https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net/api';
    
    const PROJECTS_API = `${API_BASE_URL}/projects`;
    
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
                </div>
            `;
            
            // Show the modal
            detailsModal.style.display = 'block';
            
        } catch (error) {
            console.error('Error loading project details:', error);
            showNotification('Error loading project details. Please try again later.', 'error');
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
    
    // Function to ensure all database fields are represented in the form
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
        
        const projectId = document.getElementById('project-id').value;
        const isNewProject = !projectId;
        
        // Get references to fields (using either original or renamed IDs)
        const skillsField = document.getElementById('skills-and-expertise') || document.getElementById('skills');
        const positionsField = document.getElementById('positions-required') || document.getElementById('positions');
        
        // Collect form data and match it to database fields
        const projectData = {
            // Primary fields
            researcher_name: document.getElementById('researcher-name').value,
            project_title: document.getElementById('project-title').value,
            description: document.getElementById('description').value,
            key_research_area: document.getElementById('key-research-area').value,
            start_date: document.getElementById('start-date').value,
            end_date: document.getElementById('end-date').value,
            funding_available: document.getElementById('funding-available').checked,
            experience_level: document.getElementById('experience-level').value,
            technical_requirements: document.getElementById('technical-requirements').value,
            
            // Fields that might be renamed to match DB schema
            skills_and_expertise: skillsField ? skillsField.value : '',
            positions_required: positionsField ? positionsField.value : '',
            
            // Additional fields from schema
            status: document.getElementById('status') ? document.getElementById('status').value : 'Active'
        };
        
        // Add optional fields if they exist
        if (document.getElementById('userId')) {
            projectData.userId = document.getElementById('userId').value;
        }
        
        if (document.getElementById('department')) {
            projectData.department = document.getElementById('department').value;
        }
        
        if (document.getElementById('userName')) {
            projectData.userName = document.getElementById('userName').value;
        }
        
        if (document.getElementById('reviewer')) {
            projectData.reviewer = document.getElementById('reviewer').value;
        }
        
        try {
            let response;
            
            if (isNewProject) {
                // Create new project
                response = await fetch(PROJECTS_API, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(projectData),
                });
            } else {
                // Update existing project
                response = await fetch(`${PROJECTS_API}/${projectId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(projectData),
                });
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // Close modal and reload projects
            projectModal.style.display = 'none';
            loadProjects();
            
            // Show success notification
            showNotification(isNewProject ? 'Project created successfully!' : 'Project updated successfully!', 'success');
            
        } catch (error) {
            console.error('Error saving project:', error);
            showNotification('Error saving project. Please try again later.', 'error');
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
    
    function loadAvailableCollaborators(projectId) {
        const collaboratorsList = document.getElementById('collaborators-list');
        
        // In a real application, you would fetch available collaborators from the server
        // For demonstration, we'll show placeholder data
        collaboratorsList.innerHTML = `
            <div class="collaborator-card">
                <div class="collaborator-info">
                    <h4>Dr. Jane Smith</h4>
                    <p>Biology Department</p>
                    <div class="skills">
                        <span class="tag">Genetics</span>
                        <span class="tag">Molecular Biology</span>
                    </div>
                </div>
                <div class="collaborator-actions">
                    <button class="btn view-profile-btn" data-id="user123"><i class="fas fa-id-card"></i> View Profile</button>
                    <button class="btn invite-user-btn" data-id="user123" data-name="Dr. Jane Smith"><i class="fas fa-paper-plane"></i> Invite</button>
                </div>
            </div>
            
            <div class="collaborator-card">
                <div class="collaborator-info">
                    <h4>Prof. Michael Chen</h4>
                    <p>Computer Science Department</p>
                    <div class="skills">
                        <span class="tag">Machine Learning</span>
                        <span class="tag">Data Analysis</span>
                    </div>
                </div>
                <div class="collaborator-actions">
                    <button class="btn view-profile-btn" data-id="user456"><i class="fas fa-id-card"></i> View Profile</button>
                    <button class="btn invite-user-btn" data-id="user456" data-name="Prof. Michael Chen"><i class="fas fa-paper-plane"></i> Invite</button>
                </div>
            </div>
            
            <div class="collaborator-card">
                <div class="collaborator-info">
                    <h4>Dr. Sarah Johnson</h4>
                    <p>Chemistry Department</p>
                    <div class="skills">
                        <span class="tag">Organic Chemistry</span>
                        <span class="tag">Spectroscopy</span>
                    </div>
                </div>
                <div class="collaborator-actions">
                    <button class="btn view-profile-btn" data-id="user789"><i class="fas fa-id-card"></i> View Profile</button>
                    <button class="btn invite-user-btn" data-id="user789" data-name="Dr. Sarah Johnson"><i class="fas fa-paper-plane"></i> Invite</button>
                </div>
            </div>
        `;
        
        // Add event listeners to buttons
        document.querySelectorAll('.view-profile-btn').forEach(btn => {
            btn.addEventListener('click', () => viewCollaboratorProfile(btn.dataset.id));
        });
        
        document.querySelectorAll('.invite-user-btn').forEach(btn => {
            btn.addEventListener('click', () => sendInvitation(projectId, btn.dataset.id, btn.dataset.name));
        });
    }
    function viewCollaboratorProfile(userId) {
        const profileContent = document.getElementById('collaborator-profile');
        
        // In a real app, you would fetch profile data from the server
        // For demonstration, we'll show placeholder data
        profileContent.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="profile-title">
                    <h3>Dr. Jane Smith</h3>
                    <p>Biology Department</p>
                </div>
            </div>
            
            <div class="profile-section">
                <h4>Research Areas</h4>
                <div class="profile-tags">
                    <span class="tag">Genetics</span>
                    <span class="tag">Molecular Biology</span>
                    <span class="tag">Cell Culture</span>
                    <span class="tag">PCR Techniques</span>
                </div>
            </div>
            
            <div class="profile-section">
                <h4>Experience</h4>
                <ul class="profile-list">
                    <li>10+ years in molecular genetics research</li>
                    <li>Published 25+ peer-reviewed papers</li>
                    <li>Led 5 major research projects</li>
                </ul>
            </div>
            
            <div class="profile-section">
                <h4>Education</h4>
                <ul class="profile-list">
                    <li>Ph.D. in Molecular Biology, Stanford University</li>
                    <li>M.Sc. in Genetics, MIT</li>
                    <li>B.Sc. in Biology, UC Berkeley</li>
                </ul>
            </div>
            
            <div class="profile-section">
                <h4>Recent Publications</h4>
                <ul class="profile-list">
                    <li>"Novel Gene Expression Patterns in Human Cancer Cells", Journal of Molecular Biology, 2024</li>
                    <li>"A Comparative Study of CRISPR Applications", Nature Genetics, 2023</li>
                </ul>
            </div>
        `;
        
        document.getElementById('invite-from-profile-btn').dataset.userId = userId;
        document.getElementById('invite-from-profile-btn').addEventListener('click', () => {
            profileModal.style.display = 'none';
            // Get current project ID from the invite modal
            const projectId = document.getElementById('invite-project-id').value;
            sendInvitation(projectId, userId, 'Dr. Jane Smith');
        });
        
        profileModal.style.display = 'block';
    }
    
    function sendInvitation(projectId, userId, userName) {
        // In a real app, you would send the invitation to the server
        alert(`Invitation sent to ${userName} for collaboration!`);
        
        // Close the invite modal
        inviteModal.style.display = 'none';
    }
    
    document.getElementById('invite-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const projectId = document.getElementById('invite-project-id').value;
        const email = document.getElementById('collaborator-email').value;
        const position = document.getElementById('collaborator-position').value;
        
        // In a real app, you would send this invitation to the server
        alert(`Invitation sent to ${email} for position: ${position}`);
        
        // Close the invite modal
        inviteModal.style.display = 'none';
    });
    
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
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // Close modal and reload projects
            deleteModal.style.display = 'none';
            loadProjects();
            
            // Show success notification
            showNotification('Project deleted successfully!', 'success');
            
        } catch (error) {
            console.error('Error deleting project:', error);
            showNotification('Error deleting project. Please try again later.', 'error');
        }
    }
    
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
    // Add this updated viewProjectDetails function to your projects.js file

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
        if (project.skills) {
            skillsList = project.skills
                .split(',')
                .map(skill => `<span class="skill-item">${skill.trim()}</span>`)
                .join(', ');
        }
        
        // Format positions
        let positionsList = '<span>None specified</span>';
        if (project.positions) {
            positionsList = project.positions
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
                        <div class="details-label">Project Timeline:</div>
                        <div class="details-value">${startDate} - ${endDate}</div>
                    </div>
                    <div class="details-row">
                        <div class="details-label">Funding Available:</div>
                        <div class="details-value">${project.funding_available ? 'Yes' : 'No'}</div>
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
            </div>
        `;
        
        // Show the modal
        detailsModal.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading project details:', error);
        showNotification('Error loading project details. Please try again later.', 'error');
    }
}

// Add this code to your DOMContentLoaded event handler
document.addEventListener('DOMContentLoaded', () => {
    // Existing code...
    
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
});
