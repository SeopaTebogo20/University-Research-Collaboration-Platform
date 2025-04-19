// Configuration
const API_URL = 'http://localhost:3000/api/projects';
let currentUser = null;
let currentProject = null;
let currentInvitation = null;
let currentInvitationType = null;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  // Get current user (assume authentication is handled in auth.js)
  // For this implementation, we'll simulate a current user
  getCurrentUser().then(user => {
    currentUser = user;
    initializeInvitations();
  });
});

// Simulate getting current user
async function getCurrentUser() {
  // In a real app, this would come from your auth service
  return {
    id: 'user123',
    name: 'Dr. James Wilson',
    email: 'j.wilson@techu.edu'
  };
}

function initializeInvitations() {
  // Tab switching
  const tabs = document.querySelectorAll('.invitation-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Refresh buttons
  document.getElementById('refresh-received').addEventListener('click', () => loadReceivedInvitations());
  document.getElementById('refresh-sent').addEventListener('click', () => loadSentInvitations());

  // Filter dropdowns
  document.getElementById('status-filter-received').addEventListener('change', filterReceivedInvitations);
  document.getElementById('status-filter-sent').addEventListener('change', filterSentInvitations);

  // Modal buttons
  document.getElementById('close-view-modal').addEventListener('click', closeProjectModal);
  document.getElementById('close-view-btn').addEventListener('click', closeProjectModal);
  document.getElementById('close-researcher-modal').addEventListener('click', closeResearcherModal);
  document.getElementById('close-researcher-btn').addEventListener('click', closeResearcherModal);
  document.getElementById('message-researcher-btn').addEventListener('click', messageResearcher);
  document.getElementById('close-cancel-modal').addEventListener('click', closeCancelModal);
  document.getElementById('cancel-cancel-invitation').addEventListener('click', closeCancelModal);
  document.getElementById('confirm-cancel-invitation').addEventListener('click', deleteInvitation);
  document.getElementById('close-respond-modal').addEventListener('click', closeRespondModal);
  document.getElementById('close-respond-btn').addEventListener('click', closeRespondModal);
  document.getElementById('accept-invitation').addEventListener('click', () => respondToInvitation('accepted'));
  document.getElementById('decline-invitation').addEventListener('click', () => respondToInvitation('declined'));

  // Initial load
  loadReceivedInvitations();
  loadSentInvitations();
}

function switchTab(tabName) {
  // Update active tab
  document.querySelectorAll('.invitation-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    }
  });

  // Show selected section, hide others
  document.getElementById('invitations-received-section').classList.toggle('hidden', tabName !== 'received');
  document.getElementById('invitations-sent-section').classList.toggle('hidden', tabName !== 'sent');
}

// --- API Calls ---

async function fetchProjects() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch projects');
    const data = await response.json();
    return data.projects || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    showToast('error', 'Error', 'Failed to load projects. Please try again later.');
    return [];
  }
}

async function updateProject(projectId, projectData) {
  try {
    const response = await fetch(`${API_URL}/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    
    if (!response.ok) throw new Error('Failed to update project');
    return await response.json();
  } catch (error) {
    console.error('Error updating project:', error);
    showToast('error', 'Error', 'Failed to update project. Please try again later.');
    return null;
  }
}

// --- Load Invitations ---

async function loadReceivedInvitations() {
  const container = document.getElementById('received-invitations');
  const emptyState = document.getElementById('no-received-invitations');
  
  container.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>Loading invitations...</span>
    </div>
  `;
  
  const projects = await fetchProjects();
  
  // Find all received invitations from all projects
  let receivedInvitations = [];
  
  projects.forEach(project => {
    if (project.receivedInvitations && project.receivedInvitations.length > 0) {
      receivedInvitations = [...receivedInvitations, ...project.receivedInvitations.map(inv => ({
        ...inv,
        projectData: {
          id: project.id,
          title: project.projectDetails?.projectTitle || 'Untitled Project'
        }
      }))];
    }
  });
  
  if (receivedInvitations.length === 0) {
    container.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }
  
  container.classList.remove('hidden');
  emptyState.classList.add('hidden');
  
  container.innerHTML = receivedInvitations.map(invitation => createReceivedInvitationCard(invitation)).join('');
  
  // Add event listeners to the newly created cards
  attachReceivedInvitationEventListeners();
  
  // Apply current filter
  filterReceivedInvitations();
}

async function loadSentInvitations() {
  const container = document.getElementById('sent-invitations');
  const emptyState = document.getElementById('no-sent-invitations');
  
  container.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>Loading invitations...</span>
    </div>
  `;
  
  const projects = await fetchProjects();
  
  // Find all sent invitations across all projects
  let sentInvitations = [];
  
  projects.forEach(project => {
    if (project.invitedCollaborators && project.invitedCollaborators.length > 0) {
      sentInvitations = [...sentInvitations, ...project.invitedCollaborators.map(inv => ({
        ...inv,
        projectData: {
          id: project.id,
          title: project.projectDetails?.projectTitle || 'Untitled Project',
          description: project.projectDetails?.description,
          keyResearchArea: project.projectDetails?.keyResearchArea,
          startDate: project.projectDetails?.startDate,
          endDate: project.projectDetails?.endDate,
          requirements: project.collaborationRequirements?.skillsAndExpertise || []
        }
      }))];
    }
  });
  
  if (sentInvitations.length === 0) {
    container.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }
  
  container.classList.remove('hidden');
  emptyState.classList.add('hidden');
  
  container.innerHTML = sentInvitations.map(invitation => createSentInvitationCard(invitation)).join('');
  
  // Add event listeners to the newly created cards
  attachSentInvitationEventListeners();
  
  // Apply current filter
  filterSentInvitations();
}

// --- Create Invitation Cards ---

function createReceivedInvitationCard(invitation) {
  const statusClass = `status-${invitation.status || 'pending'}`;
  const statusLabel = getStatusLabel(invitation.status || 'pending');
  const date = formatDate(invitation.invitedDate);
  
  return `
    <div class="invitation-card" data-invitation-id="${invitation.id}" data-status="${invitation.status || 'pending'}">
      <div class="invitation-header">
        <div class="invitation-title">${escapeHtml(invitation.projectTitle)}</div>
        <div class="invitation-from">
          From: <span class="researcher-link" data-researcher-id="${invitation.invitedBy.email}">${escapeHtml(invitation.invitedBy.name)}</span>
        </div>
      </div>
      <div class="invitation-content">
        <div class="invitation-details">
          <div class="invitation-detail">
            <div class="detail-label">Institution:</div>
            <div class="detail-value">${escapeHtml(invitation.invitedBy.institution)}</div>
          </div>
          <div class="invitation-detail">
            <div class="detail-label">Position:</div>
            <div class="detail-value">${escapeHtml(invitation.invitedBy.title)}</div>
          </div>
          <div class="invitation-detail">
            <div class="detail-label">Duration:</div>
            <div class="detail-value">${escapeHtml(invitation.duration || 'Not specified')}</div>
          </div>
          <div class="invitation-detail">
            <div class="detail-label">Status:</div>
            <div class="detail-value">
              <span class="status-badge ${statusClass}">${statusLabel}</span>
            </div>
          </div>
        </div>
        <div class="invitation-skills">
          <div class="skills-label">Required Skills:</div>
          <div class="skills-tags">
            ${(invitation.requiredSkills || []).map(skill => 
              `<span class="skill-tag">${escapeHtml(skill)}</span>`
            ).join('')}
          </div>
        </div>
      </div>
      <div class="invitation-actions">
        <div class="invitation-date">
          <i class="far fa-clock mr-1"></i> ${date}
        </div>
        <div class="action-buttons">
          <button class="btn btn-sm btn-outline view-project-btn" data-project-id="${invitation.projectId}">
            <i class="fas fa-eye"></i> View Project
          </button>
          ${invitation.status === 'pending' ? `
            <button class="btn btn-sm btn-primary respond-btn" data-invitation-id="${invitation.id}">
              <i class="fas fa-reply"></i> Respond
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function createSentInvitationCard(invitation) {
  const statusClass = `status-${invitation.status || 'invited'}`;
  const statusLabel = getStatusLabel(invitation.status || 'invited');
  const date = formatDate(invitation.invitedDate);
  
  return `
    <div class="invitation-card" data-invitation-id="${invitation.id}" data-status="${invitation.status || 'invited'}">
      <div class="invitation-header">
        <div class="invitation-title">${escapeHtml(invitation.projectData.title)}</div>
        <div class="invitation-from">
          To: <span class="researcher-link" data-researcher-id="${invitation.email}">${escapeHtml(invitation.name)}</span>
        </div>
      </div>
      <div class="invitation-content">
        <div class="invitation-details">
          <div class="invitation-detail">
            <div class="detail-label">Institution:</div>
            <div class="detail-value">${escapeHtml(invitation.institution)}</div>
          </div>
          <div class="invitation-detail">
            <div class="detail-label">Position:</div>
            <div class="detail-value">${escapeHtml(invitation.title)}</div>
          </div>
          <div class="invitation-detail">
            <div class="detail-label">Status:</div>
            <div class="detail-value">
              <span class="status-badge ${statusClass}">${statusLabel}</span>
            </div>
          </div>
        </div>
        <div class="invitation-skills">
          <div class="skills-label">Researcher Skills:</div>
          <div class="skills-tags">
            ${(invitation.skills || []).slice(0, 5).map(skill => 
              `<span class="skill-tag">${escapeHtml(skill)}</span>`
            ).join('')}
            ${invitation.skills && invitation.skills.length > 5 ? `<span class="skill-tag">+${invitation.skills.length - 5} more</span>` : ''}
          </div>
        </div>
      </div>
      <div class="invitation-actions">
        <div class="invitation-date">
          <i class="far fa-clock mr-1"></i> ${date}
        </div>
        <div class="action-buttons">
          <button class="btn btn-sm btn-outline view-project-btn" data-project-id="${invitation.projectData.id}">
            <i class="fas fa-eye"></i> Project
          </button>
          ${invitation.status === 'invited' ? `
            <button class="btn btn-sm btn-danger cancel-invitation-btn" data-invitation-id="${invitation.id}" data-project-id="${invitation.projectData.id}">
              <i class="fas fa-times"></i> Cancel
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// --- Event Listeners ---

function attachReceivedInvitationEventListeners() {
  // View project buttons
  document.querySelectorAll('#received-invitations .view-project-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const projectId = this.dataset.projectId;
      viewProject(projectId);
    });
  });
  
  // Respond buttons
  document.querySelectorAll('#received-invitations .respond-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const invitationId = this.dataset.invitationId;
      openRespondModal(invitationId);
    });
  });
  
  // Researcher links
  document.querySelectorAll('#received-invitations .researcher-link').forEach(link => {
    link.addEventListener('click', function() {
      const researcherId = this.dataset.researcherId;
      viewResearcher(researcherId);
    });
  });
}

function attachSentInvitationEventListeners() {
  // View project buttons
  document.querySelectorAll('#sent-invitations .view-project-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const projectId = this.dataset.projectId;
      viewProject(projectId);
    });
  });
  
  // Cancel invitation buttons
  document.querySelectorAll('#sent-invitations .cancel-invitation-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const invitationId = this.dataset.invitationId;
      const projectId = this.dataset.projectId;
      openCancelModal(invitationId, projectId);
    });
  });
  
  // Researcher links
  document.querySelectorAll('#sent-invitations .researcher-link').forEach(link => {
    link.addEventListener('click', function() {
      const researcherId = this.dataset.researcherId;
      viewResearcher(researcherId);
    });
  });
}

// --- Filters ---

function filterReceivedInvitations() {
  const statusFilter = document.getElementById('status-filter-received').value;
  const cards = document.querySelectorAll('#received-invitations .invitation-card');
  
  cards.forEach(card => {
    const status = card.dataset.status;
    if (statusFilter === 'all' || status === statusFilter) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

function filterSentInvitations() {
  const statusFilter = document.getElementById('status-filter-sent').value;
  const cards = document.querySelectorAll('#sent-invitations .invitation-card');
  
  cards.forEach(card => {
    const status = card.dataset.status;
    if (statusFilter === 'all' || status === statusFilter) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

// --- Invitation Actions ---

async function viewProject(projectId) {
  const modalOverlay = document.getElementById('view-project-modal');
  const projectDetails = document.getElementById('project-details');
  const projectRequirements = document.getElementById('project-requirements');
  const projectCollaborators = document.getElementById('project-collaborators');
  
  // Show loading state
  projectDetails.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>Loading project details...</span>
    </div>
  `;
  
  modalOverlay.classList.add('active');
  
  try {
    const projects = await fetchProjects();
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    currentProject = project;
    
    // Update project title in modal
    document.getElementById('view-project-title').textContent = project.projectDetails?.projectTitle || 'Project Details';
    
    // Fill project details
    projectDetails.innerHTML = `
      <div class="detail-group">
        <div class="detail-group-label">Project Title</div>
        <div class="detail-group-value">${escapeHtml(project.projectDetails?.projectTitle || 'Not specified')}</div>
      </div>
      <div class="detail-group">
        <div class="detail-group-label">Description</div>
        <div class="detail-group-value">${escapeHtml(project.projectDetails?.description || 'No description provided')}</div>
      </div>
      <div class="detail-group">
        <div class="detail-group-label">Key Research Area</div>
        <div class="detail-group-value">${escapeHtml(project.projectDetails?.keyResearchArea || 'Not specified')}</div>
      </div>
      <div class="detail-group">
        <div class="detail-group-label">Timeline</div>
        <div class="detail-group-value">
          ${project.projectDetails?.startDate ? formatDateSimple(project.projectDetails.startDate) : 'TBD'} - 
          ${project.projectDetails?.endDate ? formatDateSimple(project.projectDetails.endDate) : 'TBD'}
        </div>
      </div>
      <div class="detail-group">
        <div class="detail-group-label">Funding Available</div>
        <div class="detail-group-value">${project.projectDetails?.fundingAvailable ? 'Yes' : 'No'}</div>
      </div>
    `;
    
    // Fill requirements
    const skills = project.collaborationRequirements?.technicalRequirements || [];
    const positions = project.collaborationRequirements?.positionsRequired || [];
    const experience = project.collaborationRequirements?.experienceLevel || 'Not specified';
    
    projectRequirements.innerHTML = `
      <div class="tags-container">
        ${skills.map(skill => `<span class="tag">${escapeHtml(skill)}</span>`).join('')}
      </div>
      <div class="mt-4">
        <div class="detail-group-label">Positions Needed</div>
        <div class="tags-container">
          ${positions.map(position => `<span class="tag">${escapeHtml(position)}</span>`).join('')}
        </div>
      </div>
      <div class="mt-4">
        <div class="detail-group-label">Experience Level</div>
        <div class="detail-group-value">${escapeHtml(experience)}</div>
      </div>
    `;
    
    // Fill collaborators
    const collaborators = project.invitedCollaborators || [];
    
    if (collaborators.length === 0) {
      projectCollaborators.innerHTML = '<p>No collaborators added to this project yet.</p>';
    } else {
      projectCollaborators.innerHTML = collaborators.map(collab => `
        <div class="collaborator-card">
          <div class="collaborator-name">${escapeHtml(collab.name)}</div>
          <div class="collaborator-title">${escapeHtml(collab.title)}</div>
          <div class="collaborator-title">${escapeHtml(collab.institution)}</div>
          <div class="collaborator-skills">
            ${(collab.skills || []).slice(0, 3).map(skill => 
              `<span class="collaborator-skill">${escapeHtml(skill)}</span>`
            ).join('')}
            ${collab.skills && collab.skills.length > 3 ? 
              `<span class="collaborator-skill">+${collab.skills.length - 3}</span>` : ''}
          </div>
        </div>
      `).join('');
    }
    
  } catch (error) {
    console.error('Error loading project details:', error);
    projectDetails.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to load project details. Please try again later.</p>
      </div>
    `;
  }
}

function closeProjectModal() {
  document.getElementById('view-project-modal').classList.remove('active');
}

function viewResearcher(researcherId) {
  const modalOverlay = document.getElementById('view-researcher-modal');
  const researcherProfile = document.getElementById('researcher-profile');
  
  // Show loading state
  researcherProfile.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>Loading researcher profile...</span>
    </div>
  `;
  
  modalOverlay.classList.add('active');
  
  // Find researcher in projects data
  fetchProjects().then(projects => {
    let researcher = null;
    
    // Search in invited collaborators
    for (const project of projects) {
      if (project.invitedCollaborators) {
        const found = project.invitedCollaborators.find(c => c.email === researcherId);
        if (found) {
          researcher = found;
          break;
        }
      }
    }
    
    // If not found, check in received invitations
    if (!researcher) {
      for (const project of projects) {
        if (project.receivedInvitations) {
          const found = project.receivedInvitations.find(inv => inv.invitedBy.email === researcherId);
          if (found) {
            researcher = found.invitedBy;
            researcher.skills = found.requiredSkills || [];
            break;
          }
        }
      }
    }
    
    if (researcher) {
      // Update researcher name in modal title
      document.getElementById('researcher-name-title').textContent = researcher.name;
      
      // Fill researcher profile
      researcherProfile.innerHTML = `
        <div class="researcher-info">
          <div class="detail-group">
            <div class="detail-group-label">Name</div>
            <div class="detail-group-value">${escapeHtml(researcher.name)}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-label">Title</div>
            <div class="detail-group-value">${escapeHtml(researcher.title || 'Not specified')}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-label">Institution</div>
            <div class="detail-group-value">${escapeHtml(researcher.institution || 'Not specified')}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-label">Email</div>
            <div class="detail-group-value">${escapeHtml(researcher.email)}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-label">Skills & Expertise</div>
            <div class="tags-container">
              ${(researcher.skills || []).map(skill => 
                `<span class="tag">${escapeHtml(skill)}</span>`
              ).join('')}
              ${!researcher.skills || researcher.skills.length === 0 ? 
                '<span class="text-gray-500">No skills listed</span>' : ''}
            </div>
          </div>
        </div>
      `;
    } else {
      researcherProfile.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-user-slash"></i>
          <p>Researcher profile not found.</p>
        </div>
      `;
    }
  }).catch(error => {
    console.error('Error fetching researcher:', error);
    researcherProfile.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to load researcher profile. Please try again later.</p>
      </div>
    `;
  });
}

function closeResearcherModal() {
  document.getElementById('view-researcher-modal').classList.remove('active');
}

function messageResearcher() {
  // This would redirect to messaging page or open a message compose modal
  showToast('info', 'Coming Soon', 'Messaging functionality will be available soon.');
  closeResearcherModal();
}

function openCancelModal(invitationId, projectId) {
  const modalOverlay = document.getElementById('cancel-invitation-modal');
  const cancelDetails = document.getElementById('cancel-invitation-details');
  
  fetchProjects().then(projects => {
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    
    const invitation = project.invitedCollaborators.find(inv => inv.id === invitationId);
    if (!invitation) throw new Error('Invitation not found');
    
    currentInvitation = invitation;
    currentProject = project;
    currentInvitationType = 'sent';
    
    cancelDetails.innerHTML = `
      <p><strong>Project:</strong> ${escapeHtml(project.projectDetails?.projectTitle || 'Untitled Project')}</p>
      <p><strong>Researcher:</strong> ${escapeHtml(invitation.name)}</p>
      <p><strong>Institution:</strong> ${escapeHtml(invitation.institution)}</p>
      <p><strong>Invited on:</strong> ${formatDate(invitation.invitedDate)}</p>
    `;
    
    modalOverlay.classList.add('active');
  }).catch(error => {
    console.error('Error loading invitation details:', error);
    showToast('error', 'Error', 'Failed to load invitation details.');
  });
}

function closeCancelModal() {
  document.getElementById('cancel-invitation-modal').classList.remove('active');
}

async function deleteInvitation() {
  if (!currentInvitation || !currentProject) {
    showToast('error', 'Error', 'No invitation selected to cancel.');
    return;
  }
  
  try {
    // Remove the invitation from the project
    const updatedInvitations = currentProject.invitedCollaborators.filter(
      inv => inv.id !== currentInvitation.id
    );
    
    currentProject.invitedCollaborators = updatedInvitations;
    
    const result = await updateProject(currentProject.id, currentProject);
    
    if (result) {
      showToast('success', 'Success', 'Invitation cancelled successfully.');
      loadSentInvitations(); // Refresh the list
      closeCancelModal();
    } else {
      throw new Error('Failed to update project');
    }
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    showToast('error', 'Error', 'Failed to cancel invitation. Please try again.');
  }
}

function openRespondModal(invitationId) {
  const modalOverlay = document.getElementById('respond-invitation-modal');
  const responseDetails = document.getElementById('respond-invitation-details');
  document.getElementById('response-message').value = ''; // Clear previous message
  
  fetchProjects().then(projects => {
    let foundInvitation = null;
    let foundProject = null;
    
    // Find the invitation in received invitations
    for (const project of projects) {
      if (project.receivedInvitations) {
        const invitation = project.receivedInvitations.find(inv => inv.id === invitationId);
        if (invitation) {
          foundInvitation = invitation;
          foundProject = project;
          break;
        }
      }
    }
    
    if (!foundInvitation || !foundProject) {
      throw new Error('Invitation not found');
    }
    
    currentInvitation = foundInvitation;
    currentProject = foundProject;
    currentInvitationType = 'received';
    
    responseDetails.innerHTML = `
      <p><strong>Project:</strong> ${escapeHtml(foundInvitation.projectTitle)}</p>
      <p><strong>From:</strong> ${escapeHtml(foundInvitation.invitedBy.name)}</p>
      <p><strong>Institution:</strong> ${escapeHtml(foundInvitation.invitedBy.institution)}</p>
      <p><strong>Description:</strong> ${escapeHtml(foundInvitation.description || 'No description provided')}</p>
      <p><strong>Duration:</strong> ${escapeHtml(foundInvitation.duration || 'Not specified')}</p>
      ${foundInvitation.requiredSkills && foundInvitation.requiredSkills.length > 0 ? `
        <p><strong>Required Skills:</strong></p>
        <div class="tags-container">
          ${foundInvitation.requiredSkills.map(skill => 
            `<span class="tag">${escapeHtml(skill)}</span>`
          ).join('')}
        </div>
      ` : ''}
    `;
    
    modalOverlay.classList.add('active');
  }).catch(error => {
    console.error('Error loading invitation details:', error);
    showToast('error', 'Error', 'Failed to load invitation details.');
  });
}

function closeRespondModal() {
  document.getElementById('respond-invitation-modal').classList.remove('active');
}
