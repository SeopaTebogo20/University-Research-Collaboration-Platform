
// Store for invitations
let receivedInvitations = [];
let sentInvitations = [];
let currentInvitation = null;

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the page
  loadInvitations();
  
  // Event Listeners
  document.querySelectorAll('.invitation-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      switchTab(this.getAttribute('data-tab'));
    });
  });
  
  document.getElementById('status-filter-received').addEventListener('change', filterReceivedInvitations);
  document.getElementById('status-filter-sent').addEventListener('change', filterSentInvitations);
  document.getElementById('refresh-received').addEventListener('click', refreshReceivedInvitations);
  document.getElementById('refresh-sent').addEventListener('click', refreshSentInvitations);
  
  document.getElementById('close-view-modal').addEventListener('click', closeViewModal);
  document.getElementById('close-view-btn').addEventListener('click', closeViewModal);
  
  document.getElementById('close-researcher-modal').addEventListener('click', closeResearcherModal);
  document.getElementById('close-researcher-btn').addEventListener('click', closeResearcherModal);
  document.getElementById('message-researcher-btn').addEventListener('click', messageResearcher);
  
  document.getElementById('close-cancel-modal').addEventListener('click', closeCancelModal);
  document.getElementById('cancel-cancel-invitation').addEventListener('click', closeCancelModal);
  document.getElementById('confirm-cancel-invitation').addEventListener('click', cancelInvitation);
});

// Load invitations
async function loadInvitations() {
  try {
    // In a real application, this would fetch from an API
    // For demo, we'll use mock data
    const mockReceivedInvitations = [
      {
        id: "i1",
        projectId: "p1",
        projectTitle: "Neural Networks for Medical Diagnosis",
        senderId: "u1",
        senderName: "Dr. James Wilson",
        senderTitle: "Professor of Computer Science",
        senderInstitution: "Tech University",
        message: "Hi there! I'm impressed by your work in medical imaging and would love to have you join our project on neural networks for medical diagnosis. Your expertise would be invaluable to our research team.",
        sentDate: "2025-04-15T10:30:00",
        status: "pending",
        role: "AI Researcher"
      },
      {
        id: "i2",
        projectId: "p2",
        projectTitle: "Climate Change Impact on Marine Ecosystems",
        senderId: "u2",
        senderName: "Prof. Michael Rodriguez",
        senderTitle: "Associate Professor of Marine Biology",
        senderInstitution: "Coastal Science Institute",
        message: "We're building a multidisciplinary team to study the effects of climate change on marine ecosystems. Your background in ecological modeling would be a great addition to our project. Would you be interested in joining us?",
        sentDate: "2025-04-10T14:45:00",
        status: "accepted",
        role: "Data Analyst"
      },
      {
        id: "i3",
        projectId: "p3",
        projectTitle: "Genomic Analysis of Drug Resistance",
        senderId: "u3",
        senderName: "Dr. Lisa Martinez",
        senderTitle: "Associate Professor of Genetics",
        senderInstitution: "State University Medical Center",
        message: "I've been following your publications on genomic analysis and would like to invite you to collaborate on our project studying drug resistance mechanisms. We need someone with your expertise in bioinformatics.",
        sentDate: "2025-04-05T09:15:00",
        status: "declined",
        role: "Bioinformatician"
      }
    ];
    
    const mockSentInvitations = [
      {
        id: "i4",
        projectId: "p4",
        projectTitle: "Gene Expression Analysis in Cancer Cells",
        recipientId: "u4",
        recipientName: "Dr. Emily Chen",
        recipientTitle: "Assistant Professor of Bioinformatics",
        recipientInstitution: "Pacific University",
        message: "I'm excited about your work in RNA sequencing and would like to invite you to join our project on gene expression analysis in cancer cells. Your expertise would be a valuable addition to our team.",
        sentDate: "2025-04-16T11:20:00",
        status: "pending",
        role: "Computational Biologist"
      },
      {
        id: "i5",
        projectId: "p5",
        projectTitle: "Neural Networks for Medical Diagnosis",
        recipientId: "u5",
        recipientName: "Dr. Sarah Kim",
        recipientTitle: "Research Scientist",
        recipientInstitution: "Medical Research Foundation",
        message: "Your work in deep learning for medical imaging is impressive. We're working on a neural network-based diagnostic tool and would love to have you on board as a collaborator.",
        sentDate: "2025-04-12T15:30:00",
        status: "accepted",
        role: "AI Specialist"
      },
      {
        id: "i6",
        projectId: "p6",
        projectTitle: "Quantum Computing Applications in Drug Discovery",
        recipientId: "u6",
        recipientName: "Dr. Robert Adams",
        recipientTitle: "Quantum Computing Researcher",
        recipientInstitution: "Quantum Technologies Institute",
        message: "We're exploring quantum computing applications in drug discovery and would like to invite you to collaborate. Your expertise in quantum algorithms would be invaluable to our research.",
        sentDate: "2025-04-08T13:45:00",
        status: "declined",
        role: "Quantum Algorithm Developer"
      }
    ];
    
    receivedInvitations = mockReceivedInvitations;
    sentInvitations = mockSentInvitations;
    
    renderReceivedInvitations();
    renderSentInvitations();
  } catch (error) {
    console.error('Error loading invitations:', error);
    showToast('error', 'Error', 'Failed to load invitations. Please try again.');
  }
}

// Render received invitations
function renderReceivedInvitations(filteredInvitations = null) {
  const container = document.getElementById('received-invitations');
  const invitations = filteredInvitations || receivedInvitations;
  container.innerHTML = '';
  
  if (invitations.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <div class="text-6xl mb-4 text-gray-300">
          <i class="fas fa-inbox"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-500">No Invitations Received</h3>
        <p class="text-gray-400 mt-2">You haven't received any collaboration invitations yet</p>
      </div>
    `;
    return;
  }
  
  invitations.forEach(invitation => {
    const invitationCard = document.createElement('div');
    invitationCard.className = 'invitation-card';
    invitationCard.innerHTML = `
      <div class="invitation-header">
        <h3 class="invitation-title">Invitation to Collaborate</h3>
        <div class="flex items-center gap-2">
          <span class="invitation-date">${formatDate(invitation.sentDate)}</span>
          <span class="invitation-status status-${invitation.status}">${capitalizeFirstLetter(invitation.status)}</span>
        </div>
      </div>
      
      <h3 class="invitation-project">Project: ${invitation.projectTitle}</h3>
      <h4 class="text-sm text-gray-600 mb-2">Role: ${invitation.role}</h4>
      
      <div class="invitation-user">
        <div class="invitation-user-avatar">
          ${getInitials(invitation.senderName)}
        </div>
        <div>
          <div class="invitation-user-name">${invitation.senderName}</div>
          <div class="invitation-user-info">${invitation.senderTitle}, ${invitation.senderInstitution}</div>
        </div>
      </div>
      
      <div class="invitation-message">
        "${invitation.message}"
      </div>
      
      <div class="invitation-actions">
        ${invitation.status === 'pending' ? `
          <button class="invitation-action accept" data-id="${invitation.id}">
            <i class="fas fa-check mr-2"></i> Accept
          </button>
          <button class="invitation-action decline" data-id="${invitation.id}">
            <i class="fas fa-times mr-2"></i> Decline
          </button>
        ` : ''}
        <button class="invitation-action view" data-id="${invitation.projectId}">
          <i class="fas fa-eye mr-2"></i> View Project
        </button>
        <button class="invitation-action view-profile" data-id="${invitation.senderId}">
          <i class="fas fa-user mr-2"></i> View Researcher
        </button>
      </div>
    `;
    
    container.appendChild(invitationCard);
    
    // Add event listeners
    if (invitation.status === 'pending') {
      invitationCard.querySelector('.invitation-action.accept').addEventListener('click', () => {
        acceptInvitation(invitation.id);
      });
      
      invitationCard.querySelector('.invitation-action.decline').addEventListener('click', () => {
        declineInvitation(invitation.id);
      });
    }
    
    invitationCard.querySelector('.invitation-action.view').addEventListener('click', () => {
      viewProject(invitation.projectId);
    });
    
    invitationCard.querySelector('.invitation-action.view-profile').addEventListener('click', () => {
      viewResearcherProfile(invitation.senderId);
    });
  });
}

// Render sent invitations
function renderSentInvitations(filteredInvitations = null) {
  const container = document.getElementById('sent-invitations');
  const invitations = filteredInvitations || sentInvitations;
  container.innerHTML = '';
  
  if (invitations.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <div class="text-6xl mb-4 text-gray-300">
          <i class="fas fa-paper-plane"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-500">No Invitations Sent</h3>
        <p class="text-gray-400 mt-2">You haven't sent any collaboration invitations yet</p>
      </div>
    `;
    return;
  }
  
  invitations.forEach(invitation => {
    const invitationCard = document.createElement('div');
    invitationCard.className = 'invitation-card';
    invitationCard.innerHTML = `
      <div class="invitation-header">
        <h3 class="invitation-title">Invitation Sent</h3>
        <div class="flex items-center gap-2">
          <span class="invitation-date">${formatDate(invitation.sentDate)}</span>
          <span class="invitation-status status-${invitation.status}">${capitalizeFirstLetter(invitation.status)}</span>
        </div>
      </div>
      
      <h3 class="invitation-project">Project: ${invitation.projectTitle}</h3>
      <h4 class="text-sm text-gray-600 mb-2">Role: ${invitation.role}</h4>
      
      <div class="invitation-user">
        <div class="invitation-user-avatar">
          ${getInitials(invitation.recipientName)}
        </div>
        <div>
          <div class="invitation-user-name">${invitation.recipientName}</div>
          <div class="invitation-user-info">${invitation.recipientTitle}, ${invitation.recipientInstitution}</div>
        </div>
      </div>
      
      <div class="invitation-message">
        "${invitation.message}"
      </div>
      
      <div class="invitation-actions">
        ${invitation.status === 'pending' ? `
          <button class="invitation-action cancel" data-id="${invitation.id}">
            <i class="fas fa-ban mr-2"></i> Cancel Invitation
          </button>
        ` : ''}
        <button class="invitation-action view" data-id="${invitation.projectId}">
          <i class="fas fa-eye mr-2"></i> View Project
        </button>
        <button class="invitation-action view-profile" data-id="${invitation.recipientId}">
          <i class="fas fa-user mr-2"></i> View Researcher
        </button>
      </div>
    `;
    
    container.appendChild(invitationCard);
    
    // Add event listeners
    if (invitation.status === 'pending') {
      invitationCard.querySelector('.invitation-action.cancel').addEventListener('click', () => {
        showCancelInvitationModal(invitation.id);
      });
    }
    
    invitationCard.querySelector('.invitation-action.view').addEventListener('click', () => {
      viewProject(invitation.projectId);
    });
    
    invitationCard.querySelector('.invitation-action.view-profile').addEventListener('click', () => {
      viewResearcherProfile(invitation.recipientId);
    });
  });
}

// Switch between tabs
function switchTab(tabName) {
  // Update active tab
  document.querySelectorAll('.invitation-tab').forEach(tab => {
    if (tab.getAttribute('data-tab') === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  // Show/hide corresponding sections
  if (tabName === 'received') {
    document.getElementById('invitations-received-section').classList.remove('hidden');
    document.getElementById('invitations-sent-section').classList.add('hidden');
  } else {
    document.getElementById('invitations-received-section').classList.add('hidden');
    document.getElementById('invitations-sent-section').classList.remove('hidden');
  }
}

// Filter received invitations
function filterReceivedInvitations() {
  const status = document.getElementById('status-filter-received').value;
  
  if (status === 'all') {
    renderReceivedInvitations();
    return;
  }
  
  const filteredInvitations = receivedInvitations.filter(invitation => invitation.status === status);
  renderReceivedInvitations(filteredInvitations);
}

// Filter sent invitations
function filterSentInvitations() {
  const status = document.getElementById('status-filter-sent').value;
  
  if (status === 'all') {
    renderSentInvitations();
    return;
  }
  
  const filteredInvitations = sentInvitations.filter(invitation => invitation.status === status);
  renderSentInvitations(filteredInvitations);
}

// Refresh invitations
function refreshReceivedInvitations() {
  showToast('info', 'Refreshing', 'Refreshing received invitations...');
  
  // In a real application, this would fetch from an API
  // For demo, we'll just re-render the current invitations
  setTimeout(() => {
    renderReceivedInvitations();
    showToast('success', 'Refreshed', 'Received invitations refreshed successfully!');
  }, 1000);
}

function refreshSentInvitations() {
  showToast('info', 'Refreshing', 'Refreshing sent invitations...');
  
  // In a real application, this would fetch from an API
  // For demo, we'll just re-render the current invitations
  setTimeout(() => {
    renderSentInvitations();
    showToast('success', 'Refreshed', 'Sent invitations refreshed successfully!');
  }, 1000);
}

// Accept invitation
function acceptInvitation(invitationId) {
  const invitation = receivedInvitations.find(inv => inv.id === invitationId);
  if (!invitation) return;
  
  // In a real application, this would call an API
  invitation.status = 'accepted';
  
  renderReceivedInvitations();
  showToast('success', 'Invitation Accepted', `You have accepted the invitation to join "${invitation.projectTitle}"`);
}

// Decline invitation
function declineInvitation(invitationId) {
  const invitation = receivedInvitations.find(inv => inv.id === invitationId);
  if (!invitation) return;
  
  // In a real application, this would call an API
  invitation.status = 'declined';
  
  renderReceivedInvitations();
  showToast('info', 'Invitation Declined', `You have declined the invitation to join "${invitation.projectTitle}"`);
}

// Show cancel invitation modal
function showCancelInvitationModal(invitationId) {
  const invitation = sentInvitations.find(inv => inv.id === invitationId);
  if (!invitation) return;
  
  currentInvitation = invitation;
  
  document.getElementById('cancel-invitation-details').innerHTML = `
    <div>
      <p><strong>Project:</strong> ${invitation.projectTitle}</p>
      <p><strong>Recipient:</strong> ${invitation.recipientName}</p>
      <p><strong>Role:</strong> ${invitation.role}</p>
      <p><strong>Sent:</strong> ${formatDate(invitation.sentDate)}</p>
    </div>
  `;
  
  document.getElementById('cancel-invitation-modal').classList.add('active');
}

// Cancel invitation
function cancelInvitation() {
  if (!currentInvitation) return;
  
  // In a real application, this would call an API
  const index = sentInvitations.findIndex(inv => inv.id === currentInvitation.id);
  if (index !== -1) {
    sentInvitations.splice(index, 1);
    showToast('success', 'Invitation Cancelled', `The invitation to ${currentInvitation.recipientName} has been cancelled.`);
    renderSentInvitations();
    closeCancelModal();
  }
}

// View project details
function viewProject(projectId) {
  // In a real application, this would fetch project details from an API
  // For demo, we'll use mock data
  const mockProject = {
    id: projectId,
    title: "Gene Expression Analysis in Cancer Cells",
    researchGoal: "Investigating the effects of novel drug compounds on gene expression patterns in various cancer cell lines using RNA sequencing and bioinformatics analysis.",
    researchArea: "Cancer Biology",
    startDate: "2025-01-15",
    endDate: "2025-07-30",
    fundingAvailable: true,
    collaborationRequirements: "Looking for collaborators with experience in RNA sequencing and bioinformatics analysis.",
    skillsExpertise: "RNA-seq, Cancer Biology, Bioinformatics",
    experienceLevel: "intermediate",
    positionsRequired: "Bioinformatician, Lab Technician, Research Assistant",
    technicalRequirements: "Experience with R, Python, and RNA-seq data analysis",
    collaborators: [
      { id: "u1", name: "Jane Doe" },
      { id: "u2", name: "Alex Smith" },
      { id: "u3", name: "Maria Kim" }
    ]
  };
  
  document.getElementById('view-project-title').textContent = mockProject.title;
  
  const detailsContainer = document.getElementById('project-details');
  detailsContainer.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 class="font-semibold mb-2">Research Goal</h3>
        <p class="mb-4">${mockProject.researchGoal}</p>
        
        <h3 class="font-semibold mb-2">Research Area</h3>
        <p class="mb-4">${mockProject.researchArea}</p>
        
        <h3 class="font-semibold mb-2">Timeline</h3>
        <p class="mb-4">
          <span class="block"><i class="fas fa-calendar-day mr-2"></i> Start: ${formatDate(mockProject.startDate)}</span>
          <span class="block"><i class="fas fa-calendar-check mr-2"></i> End: ${formatDate(mockProject.endDate)}</span>
        </p>
        
        <h3 class="font-semibold mb-2">Funding Status</h3>
        <p class="mb-4">
          ${mockProject.fundingAvailable 
            ? '<span class="text-green-600"><i class="fas fa-check-circle mr-2"></i> Funding Available</span>' 
            : '<span class="text-red-600"><i class="fas fa-times-circle mr-2"></i> No Funding Available</span>'}
        </p>
      </div>
      
      <div>
        <h3 class="font-semibold mb-2">Requirements for Collaboration</h3>
        <p class="mb-4">${mockProject.collaborationRequirements}</p>
        
        <h3 class="font-semibold mb-2">Skills & Expertise</h3>
        <div class="flex flex-wrap gap-2 mb-4">
          ${mockProject.skillsExpertise.split(',').map(skill => 
            `<div class="project-tag">${skill.trim()}</div>`
          ).join('')}
        </div>
        
        <h3 class="font-semibold mb-2">Experience Level</h3>
        <p class="mb-4">
          <span class="capitalize">${mockProject.experienceLevel}</span>
        </p>
        
        <h3 class="font-semibold mb-2">Positions Required</h3>
        <ul class="list-disc list-inside mb-4">
          ${mockProject.positionsRequired.split(',').map(position => 
            `<li>${position.trim()}</li>`
          ).join('')}
        </ul>
        
        <h3 class="font-semibold mb-2">Technical Requirements</h3>
        <p>${mockProject.technicalRequirements}</p>
      </div>
    </div>
  `;
  
  const collaboratorsContainer = document.getElementById('project-collaborators');
  collaboratorsContainer.innerHTML = '';
  
  mockProject.collaborators.forEach(collaborator => {
    const collaboratorElement = document.createElement('div');
    collaboratorElement.className = 'flex items-center p-3 bg-gray-50 rounded-lg';
    collaboratorElement.innerHTML = `
      <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-research-primary text-white font-semibold">
        ${getInitials(collaborator.name)}
      </div>
      <div>
        <div class="font-medium">${collaborator.name}</div>
      </div>
    `;
    collaboratorsContainer.appendChild(collaboratorElement);
  });
  
  document.getElementById('view-project-modal').classList.add('active');
}

// View researcher profile
function viewResearcherProfile(researcherId) {
  // In a real application, this would fetch researcher details from an API
  // For demo, we'll use mock data
  const mockResearcher = {
    id: researcherId,
    name: "Dr. Emily Chen",
    title: "Assistant Professor of Bioinformatics",
    institution: "Pacific University",
    department: "Computational Biology",
    email: "e.chen@pacific.edu",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "Dr. Chen specializes in developing computational methods for analyzing high-throughput genomic data with applications in cancer research and personalized medicine.",
    skills: ["RNA-seq", "Bioinformatics", "Python", "R", "Machine Learning", "Single-cell Analysis"],
    publications: 28,
    citations: 450,
    projects: 8,
    collaborations: 12
  };
  
  const profileContainer = document.getElementById('researcher-profile');
  profileContainer.innerHTML = `
    <div class="flex items-center mb-6">
      <div class="w-16 h-16 rounded-full flex items-center justify-center mr-4 bg-research-primary text-white text-xl font-semibold">
        ${getInitials(mockResearcher.name)}
      </div>
      <div>
        <h3 class="text-xl font-semibold">${mockResearcher.name}</h3>
        <p class="text-gray-600">${mockResearcher.title}</p>
        <p class="text-gray-500 text-sm">${mockResearcher.institution}</p>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <h4 class="font-medium mb-2">Contact Information</h4>
        <p class="mb-1"><i class="fas fa-envelope mr-2 text-gray-500"></i> ${mockResearcher.email}</p>
        <p class="mb-1"><i class="fas fa-phone mr-2 text-gray-500"></i> ${mockResearcher.phone}</p>
        <p><i class="fas fa-map-marker-alt mr-2 text-gray-500"></i> ${mockResearcher.location}</p>
      </div>
      
      <div>
        <h4 class="font-medium mb-2">Department</h4>
        <p class="mb-4">${mockResearcher.department}</p>
        
        <div class="flex space-x-4">
          <div class="text-center">
            <div class="text-xl font-semibold text-research-primary">${mockResearcher.publications}</div>
            <div class="text-sm text-gray-500">Publications</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-semibold text-research-primary">${mockResearcher.citations}</div>
            <div class="text-sm text-gray-500">Citations</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-semibold text-research-primary">${mockResearcher.projects}</div>
            <div class="text-sm text-gray-500">Projects</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mb-6">
      <h4 class="font-medium mb-2">Biography</h4>
      <p class="text-gray-700">${mockResearcher.bio}</p>
    </div>
    
    <div class="mb-6">
      <h4 class="font-medium mb-2">Skills & Expertise</h4>
      <div class="flex flex-wrap gap-2">
        ${mockResearcher.skills.map(skill => 
          `<div class="bg-research-neutral text-research-primary rounded-full px-3 py-1 text-sm">${skill}</div>`
        ).join('')}
      </div>
    </div>
  `;
  
  document.getElementById('view-researcher-modal').classList.add('active');
}

// Message researcher
function messageResearcher() {
  // Redirect to messaging page
  window.location.href = '/messaging';
}

// Helper functions
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

function getInitials(name) {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('');
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Modal control functions
function closeViewModal() {
  document.getElementById('view-project-modal').classList.remove('active');
}

function closeResearcherModal() {
  document.getElementById('view-researcher-modal').classList.remove('active');
}

function closeCancelModal() {
  document.getElementById('cancel-invitation-modal').classList.remove('active');
  currentInvitation = null;
}

// Toast notification function
function showToast(type, title, message) {
  const toastContainer = document.querySelector('.toast-container');
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas ${getToastIcon(type)}"></i>
    </div>
    <div class="toast-content">
      <h3 class="toast-title">${title}</h3>
      <p class="toast-message">${message}</p>
    </div>
    <button class="toast-close">&times;</button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Activate toast with a slight delay for animation
  setTimeout(() => {
    toast.classList.add('active');
  }, 10);
  
  // Set up event listener for close button
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.remove('active');
    setTimeout(() => {
      toast.remove();
    }, 300); // Wait for animation to complete
  });
  
  // Auto-remove toast after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) { // Check if toast is still in the DOM
      toast.classList.remove('active');
      setTimeout(() => {
        if (toast.parentNode) { // Check again before removing
          toast.remove();
        }
      }, 300);
    }
  }, 5000);
}

// Get icon class for toast type
function getToastIcon(type) {
  switch (type) {
    case 'success': return 'fa-check-circle';
    case 'error': return 'fa-times-circle';
    case 'warning': return 'fa-exclamation-triangle';
    case 'info': return 'fa-info-circle';
    default: return 'fa-info-circle';
  }
}
