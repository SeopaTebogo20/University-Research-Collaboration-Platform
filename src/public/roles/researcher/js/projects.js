// Global variables
let projects = [];
let currentProjectId = null;
let currentUser = {
  id: "RES001",
  name: "Dr. Sarah Johnson",
  email: "sarah.johnson@example.edu",
  role: "Researcher"
};

// DOM Elements
const projectsContainer = document.getElementById('projects-container');
const projectModal = document.getElementById('project-modal');
const projectForm = document.getElementById('project-form');
const deleteModal = document.getElementById('delete-modal');
const viewProjectModal = document.getElementById('view-project-modal');
const inviteModal = document.getElementById('invite-modal');
const projectSort = document.getElementById('project-sort');

// Event Listeners
document.addEventListener('DOMContentLoaded', initProjects);
document.getElementById('create-project-btn').addEventListener('click', showCreateProjectModal);
document.getElementById('save-project').addEventListener('click', saveProject);
document.getElementById('cancel-project').addEventListener('click', closeProjectModal);
document.getElementById('close-modal').addEventListener('click', closeProjectModal);
document.getElementById('confirm-delete').addEventListener('click', deleteProject);
document.getElementById('cancel-delete').addEventListener('click', closeDeleteModal);
document.getElementById('close-delete-modal').addEventListener('click', closeDeleteModal);
document.getElementById('close-view-modal').addEventListener('click', closeViewModal);
document.getElementById('close-view-btn').addEventListener('click', closeViewModal);
document.getElementById('invite-collaborators').addEventListener('click', showInviteModal);
document.getElementById('close-invite-modal').addEventListener('click', closeInviteModal);
document.getElementById('cancel-invite').addEventListener('click', closeInviteModal);
document.getElementById('send-invites').addEventListener('click', sendInvitations);
projectSort.addEventListener('change', sortProjects);

// Initialize projects
async function initProjects() {
  try {
    // Fetch projects from JSON file
    const response = await fetch('data/projects.json');
    const data = await response.json();
    projects = data.projects;
    
    // Display projects
    renderProjects();
    
    // Populate project select in invite modal
    populateProjectSelect();
  } catch (error) {
    showToast('Error loading projects: ' + error.message, 'error');
    console.error('Error loading projects:', error);
  }
}

// Render projects grid
function renderProjects() {
  projectsContainer.innerHTML = '';
  
  if (projects.length === 0) {
    projectsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-flask empty-icon"></i>
        <h3>No Projects Yet</h3>
        <p>Create your first research project to get started.</p>
        <button class="btn btn-primary" onclick="showCreateProjectModal()">
          <i class="fas fa-plus mr-2"></i> Create New Project
        </button>
      </div>
    `;
    return;
  }
  
  projects.forEach(project => {
    const fundingBadge = project.projectDetails.fundingAvailable ? 
      '<span class="badge badge-success"><i class="fas fa-dollar-sign mr-1"></i> Funded</span>' : 
      '<span class="badge badge-neutral"><i class="fas fa-info-circle mr-1"></i> No Funding</span>';
    
    const daysRemaining = calculateDaysRemaining(project.projectDetails.endDate);
    const statusBadge = getStatusBadge(daysRemaining);
    
    const card = document.createElement('article');
    card.className = 'project-card';
    card.innerHTML = `
      <header class="project-card-header">
        <h3 class="project-title">${project.projectDetails.projectTitle}</h3>
        <div class="project-badges">
          ${fundingBadge}
          ${statusBadge}
        </div>
      </header>
      <section class="project-card-body">
        <p class="project-description">${truncateText(project.projectDetails.description, 120)}</p>
        <div class="project-meta">
          <span><i class="fas fa-microscope mr-1"></i> ${project.projectDetails.keyResearchArea}</span>
          <span><i class="fas fa-calendar mr-1"></i> ${formatDate(project.projectDetails.startDate)} - ${formatDate(project.projectDetails.endDate)}</span>
        </div>
        <div class="project-skills">
          <h4>Key Skills Required:</h4>
          <div class="skill-tags">
            ${project.collaborationRequirements.skillsAndExpertise.slice(0, 3).map(skill => 
              `<span class="skill-tag">${skill}</span>`
            ).join('')}
            ${project.collaborationRequirements.skillsAndExpertise.length > 3 ? 
              `<span class="skill-tag">+${project.collaborationRequirements.skillsAndExpertise.length - 3} more</span>` : ''}
          </div>
        </div>
      </section>
      <footer class="project-card-footer">
        <button class="btn btn-text" onclick="viewProject('${project.id}')">
          <i class="fas fa-eye mr-1"></i> View Details
        </button>
        <div class="project-actions">
          <button class="btn btn-icon" onclick="editProject('${project.id}')" title="Edit Project">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-icon btn-icon-danger" onclick="showDeleteModal('${project.id}')" title="Delete Project">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </footer>
    `;
    
    projectsContainer.appendChild(card);
  });
}

// Utility functions
function calculateDaysRemaining(endDate) {
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getStatusBadge(daysRemaining) {
  if (daysRemaining < 0) {
    return '<span class="badge badge-danger"><i class="fas fa-times-circle mr-1"></i> Completed</span>';
  } else if (daysRemaining < 30) {
    return '<span class="badge badge-warning"><i class="fas fa-clock mr-1"></i> Ending Soon</span>';
  } else {
    return '<span class="badge badge-info"><i class="fas fa-check-circle mr-1"></i> Active</span>';
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

// Sort projects
function sortProjects() {
  const sortValue = projectSort.value;
  
  switch (sortValue) {
    case 'date-desc':
      projects.sort((a, b) => new Date(b.projectDetails.startDate) - new Date(a.projectDetails.startDate));
      break;
    case 'date-asc':
      projects.sort((a, b) => new Date(a.projectDetails.startDate) - new Date(b.projectDetails.startDate));
      break;
    case 'title-asc':
      projects.sort((a, b) => a.projectDetails.projectTitle.localeCompare(b.projectDetails.projectTitle));
      break;
    case 'title-desc':
      projects.sort((a, b) => b.projectDetails.projectTitle.localeCompare(a.projectDetails.projectTitle));
      break;
  }
  
  renderProjects();
}

// Modal Functions
function showCreateProjectModal() {
  document.getElementById('modal-title').textContent = 'Create New Project';
  document.getElementById('project-id').value = '';
  projectForm.reset();
  
  // Set default dates
  const today = new Date();
  const startDate = today.toISOString().split('T')[0];
  const endDate = new Date(today.setMonth(today.getMonth() + 6)).toISOString().split('T')[0];
  
  document.getElementById('start-date').value = startDate;
  document.getElementById('end-date').value = endDate;
  
  currentProjectId = null;
  projectModal.showModal();
}

function closeProjectModal() {
  projectModal.close();
}

function editProject(projectId) {
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  
  document.getElementById('modal-title').textContent = 'Edit Project';
  document.getElementById('project-id').value = project.id;
  document.getElementById('project-title').value = project.projectDetails.projectTitle;
  document.getElementById('research-goal').value = project.projectDetails.description;
  document.getElementById('research-area').value = project.projectDetails.keyResearchArea;
  document.getElementById('start-date').value = project.projectDetails.startDate;
  document.getElementById('end-date').value = project.projectDetails.endDate;
  document.getElementById('funding-available').checked = project.projectDetails.fundingAvailable;
  document.getElementById('skills-expertise').value = project.collaborationRequirements.skillsAndExpertise.join(', ');
  document.getElementById('experience-level').value = project.collaborationRequirements.experienceLevel;
  document.getElementById('positions-required').value = project.collaborationRequirements.positionsRequired.join(', ');
  document.getElementById('technical-requirements').value = project.collaborationRequirements.technicalRequirements.join(', ');
  
  currentProjectId = projectId;
  projectModal.showModal();
}

function saveProject() {
  // Get form values
  const projectId = document.getElementById('project-id').value || `PRJ${String(projects.length + 1).padStart(3, '0')}`;
  const projectTitle = document.getElementById('project-title').value;
  const researchGoal = document.getElementById('research-goal').value;
  const researchArea = document.getElementById('research-area').value;
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  const fundingAvailable = document.getElementById('funding-available').checked;
  const skillsExpertise = document.getElementById('skills-expertise').value.split(',').map(item => item.trim()).filter(Boolean);
  const experienceLevel = document.getElementById('experience-level').value;
  const positionsRequired = document.getElementById('positions-required').value.split(',').map(item => item.trim()).filter(Boolean);
  const technicalRequirements = document.getElementById('technical-requirements').value.split(',').map(item => item.trim()).filter(Boolean);
  
  // Form validation
  if (!projectTitle || !researchGoal || !researchArea || !startDate || !endDate) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  // Create project object
  const project = {
    id: projectId,
    projectDetails: {
      researcherName: currentUser.name,
      projectTitle,
      description: researchGoal,
      keyResearchArea: researchArea,
      startDate,
      endDate,
      fundingAvailable
    },
    collaborationRequirements: {
      skillsAndExpertise: skillsExpertise,
      experienceLevel,
      positionsRequired,
      technicalRequirements
    }
  };
  
  // Add or update project
  if (currentProjectId) {
    // Update existing project
    const index = projects.findIndex(p => p.id === currentProjectId);
    if (index !== -1) {
      projects[index] = project;
      showToast('Project updated successfully', 'success');
    }
  } else {
    // Add new project
    projects.push(project);
    showToast('Project created successfully', 'success');
  }
  
  // Close modal and refresh view
  closeProjectModal();
  renderProjects();
  populateProjectSelect();
  
  // In a real app, save to server
  saveProjectsToServer();
}

function showDeleteModal(projectId) {
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  
  document.getElementById('delete-project-title').textContent = project.projectDetails.projectTitle;
  currentProjectId = projectId;
  deleteModal.showModal();
}

function closeDeleteModal() {
  deleteModal.close();
}

function deleteProject() {
  if (!currentProjectId) return;
  
  // Remove project
  projects = projects.filter(p => p.id !== currentProjectId);
  
  // Close modal and refresh view
  closeDeleteModal();
  renderProjects();
  populateProjectSelect();
  showToast('Project deleted successfully', 'success');
  
  // In a real app, save to server
  saveProjectsToServer();
}

function viewProject(projectId) {
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  
  document.getElementById('view-project-title').textContent = project.projectDetails.projectTitle;
  
  const projectDetails = document.getElementById('project-details');
  projectDetails.innerHTML = `
    <div class="project-detail-grid">
      <div class="detail-item">
        <h4>Research Goal</h4>
        <p>${project.projectDetails.description}</p>
      </div>
      <div class="detail-item">
        <h4>Key Research Area</h4>
        <p>${project.projectDetails.keyResearchArea}</p>
      </div>
      <div class="detail-item">
        <h4>Timeline</h4>
        <p>${formatDate(project.projectDetails.startDate)} - ${formatDate(project.projectDetails.endDate)}</p>
      </div>
      <div class="detail-item">
        <h4>Funding</h4>
        <p>${project.projectDetails.fundingAvailable ? 'Funding Available' : 'No Funding Available'}</p>
      </div>
      <div class="detail-item">
        <h4>Principal Researcher</h4>
        <p>${project.projectDetails.researcherName}</p>
      </div>
      <div class="detail-item">
        <h4>Experience Level</h4>
        <p class="capitalize">${project.collaborationRequirements.experienceLevel}</p>
      </div>
    </div>
    
    <div class="mt-4">
      <h4>Skills and Expertise Needed</h4>
      <div class="skill-tags mt-2">
        ${project.collaborationRequirements.skillsAndExpertise.map(skill => 
          `<span class="skill-tag">${skill}</span>`
        ).join('')}
      </div>
    </div>
    
    <div class="mt-4">
      <h4>Positions Required</h4>
      <div class="skill-tags mt-2">
        ${project.collaborationRequirements.positionsRequired.map(position => 
          `<span class="skill-tag">${position}</span>`
        ).join('')}
      </div>
    </div>
    
    <div class="mt-4">
      <h4>Technical Requirements</h4>
      <div class="skill-tags mt-2">
        ${project.collaborationRequirements.technicalRequirements.map(tech => 
          `<span class="skill-tag">${tech}</span>`
        ).join('')}
      </div>
    </div>
  `;
  
  // Populate collaborators (this would be dynamic in a real app)
  const collaboratorsContainer = document.getElementById('project-collaborators');
  collaboratorsContainer.innerHTML = `
    <li class="collaborator-item">
      <img src="https://via.placeholder.com/50" alt="Profile" class="collaborator-avatar">
      <div class="collaborator-info">
        <span class="collaborator-name">${project.projectDetails.researcherName}</span>
        <span class="collaborator-role">Principal Investigator</span>
      </div>
    </li>
  `;
  
  currentProjectId = projectId;
  viewProjectModal.showModal();
}

function closeViewModal() {
  viewProjectModal.close();
}

// Invite Modal Functions
function showInviteModal() {
  populateProjectSelect(currentProjectId);
  inviteModal.showModal();
}

function closeInviteModal() {
  inviteModal.close();
}

function populateProjectSelect(selectedId = null) {
  const projectSelect = document.getElementById('project-select');
  projectSelect.innerHTML = '';
  
  projects.forEach(project => {
    const option = document.createElement('option');
    option.value = project.id;
    option.textContent = project.projectDetails.projectTitle;
    if (project.id === selectedId) {
      option.selected = true;
    }
    projectSelect.appendChild(option);
  });
}

function sendInvitations() {
  // In a real app, this would send invitations to the selected researchers
  const projectSelect = document.getElementById('project-select');
  const projectId = projectSelect.value;
  const invitationMessage = document.getElementById('invitation-message').value;
  
  // Simulate sending invitations
  setTimeout(() => {
    closeInviteModal();
    showToast('Invitations sent successfully', 'success');
  }, 1000);
}

// Toast notification system
function showToast(message, type = 'info') {
  const toastContainer = document.querySelector('.toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'exclamation-circle';
  if (type === 'warning') icon = 'exclamation-triangle';
  
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas fa-${icon}"></i>
    </div>
    <div class="toast-content">
      <p class="toast-message">${message}</p>
    </div>
    <button class="toast-close">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });
  
  toastContainer.appendChild(toast);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 5000);
}

// Save to server (simulated)
function saveProjectsToServer() {
  // In a real app, this would use fetch to save to a backend
  console.log('Saving projects to server:', projects);
  // For demo purposes, we'll just log the data
  localStorage.setItem('projects', JSON.stringify({ projects }));
}