   
// Dashboard.js - JavaScript for the Researcher Dashboard

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const userName = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logout-btn');
    const calendarGrid = document.querySelector('.calendar-grid');
    const calendarMonth = document.querySelector('.calendar-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    
    // Modal elements
    const createProjectBtn = document.getElementById('create-project-btn');
    const createProjectModal = document.getElementById('create-project-modal');
    const closeCreateProjectModal = document.getElementById('close-create-project-modal');
    const cancelCreateProject = document.getElementById('cancel-create-project');
    const submitCreateProject = document.getElementById('submit-create-project');
    
    const projectDetailsModal = document.getElementById('project-details-modal');
    const closeProjectDetailsModal = document.getElementById('close-project-details-modal');
    const projectDetailsContent = document.getElementById('project-details-content');
    const projectDetailsTitle = document.getElementById('project-details-title');
    const projectTeamList = document.getElementById('project-team-list');
    const projectComments = document.getElementById('project-comments');
    
    const deleteConfirmationModal = document.getElementById('delete-confirmation-modal');
    const closeDeleteModal = document.getElementById('close-delete-modal');
    const cancelDelete = document.getElementById('cancel-delete');
    const confirmDelete = document.getElementById('confirm-delete');
    const deleteProjectName = document.getElementById('delete-project-name');
    
    const findCollaboratorsBtn = document.getElementById('find-collaborators-btn');
    const collaboratorSearchModal = document.getElementById('collaborator-search-modal');
    const closeCollaboratorSearchModal = document.getElementById('close-collaborator-search-modal');
    const collaboratorsResults = document.getElementById('collaborators-results');
    
    const inviteCollaboratorModal = document.getElementById('invite-collaborator-modal');
    const closeInviteModal = document.getElementById('close-invite-modal');
    const cancelInvite = document.getElementById('cancel-invite');
    const sendInvite = document.getElementById('send-invite');
    const inviteCollaboratorInfo = document.getElementById('invite-collaborator-info');
    const inviteProject = document.getElementById('invite-project');
    
    const toastContainer = document.getElementById('toast-container');
    
    // Project actions
    const projectActions = document.querySelectorAll('.project-action');
    const projectActionsSecondary = document.querySelectorAll('.project-action-secondary');
    
    // Notification actions
    const notificationActions = document.querySelectorAll('.notification-actions button');
    
    // Invitation actions
    const invitationActions = document.querySelectorAll('.invitation-action');
    
    // Edit/Delete project buttons
    const editProjectBtn = document.getElementById('edit-project-btn');
    const deleteProjectBtn = document.getElementById('delete-project-btn');
    
    // User information
    async function loadUserInfo() {
      try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        if (data.authenticated && data.user) {
          // Display user name
          userName.textContent = data.user.user_metadata?.name || 'Researcher';
        } else {
          // Redirect to login if not authenticated
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        showToast('Error loading user information', 'error');
      }
    }
    
    // Toast notification function
    function showToast(message, type = 'info', duration = 5000) {
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      
      let icon = '';
      switch(type) {
        case 'success':
          icon = '<i class="fas fa-check-circle"></i>';
          break;
        case 'error':
          icon = '<i class="fas fa-exclamation-circle"></i>';
          break;
        case 'warning':
          icon = '<i class="fas fa-exclamation-triangle"></i>';
          break;
        default:
          icon = '<i class="fas fa-info-circle"></i>';
      }
      
      toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
          <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
      `;
      
      toastContainer.appendChild(toast);
      
      // Add active class after a small delay to trigger animation
      setTimeout(() => {
        toast.classList.add('active');
      }, 10);
      
      // Remove toast after duration
      const timeout = setTimeout(() => {
        removeToast(toast);
      }, duration);
      
      // Close button handler
      const closeBtn = toast.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => {
        clearTimeout(timeout);
        removeToast(toast);
      });
    }
    
    function removeToast(toast) {
      toast.classList.remove('active');
      // Remove from DOM after animation completes
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    }
    
    // Calendar functionality
    let currentDate = new Date();
    
    function generateCalendar(date) {
      // Clear previous calendar days
      const dayElements = document.querySelectorAll('.calendar-day');
      dayElements.forEach(day => day.remove());
      
      // Update month display
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
      calendarMonth.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      // Get first day of month and last day
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      // Add empty days for start of month
      const startDayOfWeek = firstDay.getDay();
      for (let i = 0; i < startDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendarGrid.appendChild(emptyDay);
      }
      
      // Add days of the month
      const today = new Date();
      
      // Sample events (dates with events)
      const eventsOnDays = [5, 12, 18, 25];
      
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = i;
        
        // Check if this is today
        if (date.getMonth() === today.getMonth() && 
            date.getFullYear() === today.getFullYear() && 
            i === today.getDate()) {
          dayElement.classList.add('today');
        }
        
        // Check if this day has an event
        if (eventsOnDays.includes(i)) {
          dayElement.classList.add('has-event');
        }
        
        // Add click event
        dayElement.addEventListener('click', () => {
          // Remove active class from all days
          document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('active');
          });
          
          // Add active class to clicked day
          dayElement.classList.add('active');
          
          // Show events for this day (sample implementation)
          if (eventsOnDays.includes(i)) {
            showToast(`${monthNames[date.getMonth()]} ${i}: Project meeting at 10:00 AM`, 'info');
          }
        });
        
        calendarGrid.appendChild(dayElement);
      }
    }
    
    // Mock project data
    const mockProjects = [
      {
        id: 1,
        title: "Gene Expression Analysis in Cancer Cells",
        description: "Investigating the effects of novel drug compounds on gene expression patterns in various cancer cell lines using RNA sequencing and bioinformatics analysis.",
        startDate: "2025-01-15",
        endDate: "2025-07-30",
        researchArea: "biology",
        fundingAvailable: true,
        progress: {
          overall: 65,
          dataCollection: 90,
          analysis: 50,
          documentation: 40
        },
        collaborators: [
          { id: 1, name: "John Doe", initials: "JD", color: "#4F46E5", role: "Lead Researcher" },
          { id: 2, name: "Alice Smith", initials: "AS", color: "#10B981", role: "Data Analyst" },
          { id: 3, name: "Mark Kim", initials: "MK", color: "#F59E0B", role: "Lab Technician" },
          { id: 4, name: "Lisa Wong", initials: "LW", color: "#EF4444", role: "Research Assistant" }
        ],
        comments: [
          {
            id: 1, 
            author: "John Doe", 
            date: "2025-04-10", 
            content: "Weekly update: We've completed the RNA extraction for all cell lines and will begin sequencing next week."
          },
          {
            id: 2, 
            author: "Alice Smith", 
            date: "2025-04-12", 
            content: "I've prepared the initial data processing pipeline. We should discuss the normalization method at our next meeting."
          }
        ]
      },
      {
        id: 2,
        title: "Climate Change Impact on Marine Ecosystems",
        description: "Analyzing the effects of rising ocean temperatures and acidity levels on coral reef biodiversity and ecosystem function through field studies and remote sensing.",
        startDate: "2025-03-10",
        endDate: "2025-12-15",
        researchArea: "earth_science",
        fundingAvailable: false,
        progress: {
          overall: 30,
          dataCollection: 45,
          analysis: 20,
          documentation: 15
        },
        collaborators: [
          { id: 5, name: "Rebecca Lee", initials: "RL", color: "#8B5CF6", role: "Lead Researcher" },
          { id: 6, name: "Kevin Miller", initials: "KM", color: "#10B981", role: "Field Researcher" },
          { id: 7, name: "Paul Thompson", initials: "PT", color: "#3B82F6", role: "Data Analyst" }
        ],
        comments: [
          {
            id: 3, 
            author: "Rebecca Lee", 
            date: "2025-04-05", 
            content: "The first round of field samples has been collected. Initial observations show concerning coral bleaching in the north section."
          },
          {
            id: 4, 
            author: "Paul Thompson", 
            date: "2025-04-08", 
            content: "Satellite data from the past 5 years has been processed. I'll have the visualization ready by Friday."
          }
        ]
      }
    ];
    
    // Mock collaborator data
    const mockCollaborators = [
      {
        id: 101,
        name: "Dr. Emily Chen",
        title: "Associate Professor",
        institution: "Stanford University",
        department: "Biology",
        expertise: ["Molecular Biology", "Genetics", "CRISPR", "Cell Culture"],
        field: "biology",
        publications: 28,
        projects: 5,
        avatar: "EC"
      },
      {
        id: 102,
        name: "Prof. Michael Rodriguez",
        title: "Full Professor",
        institution: "MIT",
        department: "Computer Science",
        expertise: ["Machine Learning", "Bioinformatics", "Data Mining", "Algorithm Design"],
        field: "computer-science",
        publications: 45,
        projects: 8,
        avatar: "MR"
      },
      {
        id: 103,
        name: "Dr. Sarah Williams",
        title: "Research Scientist",
        institution: "Harvard Medical School",
        department: "Oncology",
        expertise: ["Cancer Research", "Immunotherapy", "Drug Development", "Clinical Trials"],
        field: "medicine",
        publications: 32,
        projects: 7,
        avatar: "SW"
      },
      {
        id: 104,
        name: "Dr. James Kumar",
        title: "Assistant Professor",
        institution: "Berkeley",
        department: "Chemistry",
        expertise: ["Organic Chemistry", "Material Science", "Spectroscopy", "Drug Design"],
        field: "chemistry",
        publications: 19,
        projects: 4,
        avatar: "JK"
      },
      {
        id: 105,
        name: "Prof. Alexandra Davis",
        title: "Department Chair",
        institution: "CalTech",
        department: "Physics",
        expertise: ["Quantum Mechanics", "Theoretical Physics", "Computational Physics"],
        field: "physics",
        publications: 52,
        projects: 12,
        avatar: "AD"
      },
      {
        id: 106,
        name: "Dr. Robert Kim",
        title: "Research Lead",
        institution: "National Institute of Health",
        department: "Biomedical Engineering",
        expertise: ["Medical Devices", "Prosthetics", "Biomechanics", "Tissue Engineering"],
        field: "engineering",
        publications: 27,
        projects: 9,
        avatar: "RK"
      }
    ];
    
    // Populate the project details modal
    function populateProjectDetails(projectId) {
      const project = mockProjects.find(p => p.id === projectId);
      
      if (!project) {
        showToast('Project not found', 'error');
        return;
      }
      
      // Set the modal title
      projectDetailsTitle.textContent = project.title;
      
      // Format dates for display
      const startDate = new Date(project.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const endDate = new Date(project.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      
      // Populate project details content
      projectDetailsContent.innerHTML = `
        <div class="project-details">
          <div class="project-details-grid">
            <div class="project-detail-item">
              <div class="project-detail-label">Research Area</div>
              <div class="project-detail-value">${formatResearchArea(project.researchArea)}</div>
            </div>
            <div class="project-detail-item">
              <div class="project-detail-label">Start Date</div>
              <div class="project-detail-value">${startDate}</div>
            </div>
            <div class="project-detail-item">
              <div class="project-detail-label">End Date</div>
              <div class="project-detail-value">${endDate}</div>
            </div>
            <div class="project-detail-item">
              <div class="project-detail-label">Funding Available</div>
              <div class="project-detail-value">${project.fundingAvailable ? 'Yes' : 'No'}</div>
            </div>
          </div>
          
          <div class="project-description">
            <h3>Project Description</h3>
            <p>${project.description}</p>
          </div>
          
          <div class="project-progress">
            <h3>Project Progress</h3>
            
            <div class="progress-item">
              <div class="progress-label">
                <span>Overall Progress</span>
                <span>${project.progress.overall}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-value" style="width: ${project.progress.overall}%; background-color: var(--progress-blue);"></div>
              </div>
            </div>
            
            <div class="progress-item">
              <div class="progress-label">
                <span>Data Collection</span>
                <span>${project.progress.dataCollection}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-value" style="width: ${project.progress.dataCollection}%; background-color: var(--progress-green);"></div>
              </div>
            </div>
            
            <div class="progress-item">
              <div class="progress-label">
                <span>Analysis</span>
                <span>${project.progress.analysis}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-value" style="width: ${project.progress.analysis}%; background-color: var(--progress-yellow);"></div>
              </div>
            </div>
            
            <div class="progress-item">
              <div class="progress-label">
                <span>Documentation</span>
                <span>${project.progress.documentation}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-value" style="width: ${project.progress.documentation}%; background-color: var(--progress-purple);"></div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Populate team members
      projectTeamList.innerHTML = '';
      project.collaborators.forEach(collaborator => {
        const teamMember = document.createElement('div');
        teamMember.className = 'team-member';
        teamMember.innerHTML = `
          <div class="team-avatar" style="background-color: ${collaborator.color};">${collaborator.initials}</div>
          <div class="team-name">${collaborator.name}</div>
          <div class="team-role">${collaborator.role}</div>
        `;
        projectTeamList.appendChild(teamMember);
      });
      
      // Populate comments
      projectComments.innerHTML = '';
      if (project.comments && project.comments.length > 0) {
        project.comments.forEach(comment => {
          const commentElement = document.createElement('div');
          commentElement.className = 'comment';
          commentElement.innerHTML = `
            <div class="comment-header">
              <div class="comment-author">${comment.author}</div>
              <div class="comment-date">${comment.date}</div>
            </div>
            <div class="comment-content">${comment.content}</div>
          `;
          projectComments.appendChild(commentElement);
        });
      } else {
        projectComments.innerHTML = '<p>No comments yet.</p>';
      }
      
      // Set data attribute for delete button
      deleteProjectBtn.setAttribute('data-project-id', project.id);
      
      // Show the modal
      projectDetailsModal.classList.add('active');
    }
    
    // Format research area
    function formatResearchArea(area) {
      const areas = {
        'biology': 'Biology & Life Sciences',
        'chemistry': 'Chemistry',
        'physics': 'Physics',
        'computer_science': 'Computer Science',
        'engineering': 'Engineering',
        'earth_science': 'Earth Science & Environmental Studies',
        'medicine': 'Medicine & Health Sciences',
        'mathematics': 'Mathematics',
        'social_science': 'Social Sciences',
        'humanities': 'Humanities',
        'interdisciplinary': 'Interdisciplinary Studies'
      };
      
      return areas[area] || area;
    }
    
    // Populate the collaborator search results
    function populateCollaboratorResults(collaborators = mockCollaborators) {
      collaboratorsResults.innerHTML = '';
      
      if (collaborators.length === 0) {
        collaboratorsResults.innerHTML = '<p class="text-center">No collaborators found matching your criteria.</p>';
        return;
      }
      
      collaborators.forEach(collaborator => {
        const card = document.createElement('div');
        card.className = 'collaborator-card';
        
        card.innerHTML = `
          <div class="collaborator-header">
            <div class="collaborator-avatar">${collaborator.avatar}</div>
            <div class="collaborator-name">${collaborator.name}</div>
            <div class="collaborator-title">${collaborator.title}</div>
          </div>
          <div class="collaborator-body">
            <div class="collaborator-info">
              <div class="collaborator-info-label">Institution</div>
              <div class="collaborator-info-value">${collaborator.institution}</div>
            </div>
            <div class="collaborator-info">
              <div class="collaborator-info-label">Department</div>
              <div class="collaborator-info-value">${collaborator.department}</div>
            </div>
            <div class="collaborator-info">
              <div class="collaborator-info-label">Publications</div>
              <div class="collaborator-info-value">${collaborator.publications}</div>
            </div>
            <div class="collaborator-skills">
              ${collaborator.expertise.map(skill => `<span class="collaborator-skill">${skill}</span>`).join('')}
            </div>
          </div>
          <div class="collaborator-footer">
            <button class="collaborator-action collaborator-view" data-collaborator-id="${collaborator.id}">View Profile</button>
            <button class="collaborator-action collaborator-invite" data-collaborator-id="${collaborator.id}">Invite</button>
          </div>
        `;
        
        collaboratorsResults.appendChild(card);
      });
      
      // Add event listeners to the newly created buttons
      document.querySelectorAll('.collaborator-view').forEach(button => {
        button.addEventListener('click', function() {
          const collaboratorId = parseInt(this.getAttribute('data-collaborator-id'));
          showToast(`Viewing profile for collaborator ID: ${collaboratorId}`, 'info');
          // Here you would implement opening the collaborator profile
        });
      });
      
      document.querySelectorAll('.collaborator-invite').forEach(button => {
        button.addEventListener('click', function() {
          const collaboratorId = parseInt(this.getAttribute('data-collaborator-id'));
          openInviteModal(collaboratorId);
        });
      });
    }
    
    // Open invite collaborator modal
    function openInviteModal(collaboratorId) {
      const collaborator = mockCollaborators.find(c => c.id === collaboratorId);
      
      if (!collaborator) {
        showToast('Collaborator not found', 'error');
        return;
      }
      
      // Populate collaborator info
      inviteCollaboratorInfo.innerHTML = `
        <div class="invite-collaborator-header">
          <div class="invite-collaborator-avatar">${collaborator.avatar}</div>
          <div>
            <div class="invite-collaborator-name">${collaborator.name}</div>
            <div class="invite-collaborator-title">${collaborator.title} at ${collaborator.institution}</div>
          </div>
        </div>
      `;
      
      // Populate project dropdown
      inviteProject.innerHTML = '<option value="">Select a project</option>';
      mockProjects.forEach(project => {
        inviteProject.innerHTML += `<option value="${project.id}">${project.title}</option>`;
      });
      
      // Show modal
      collaboratorSearchModal.classList.remove('active');
      inviteCollaboratorModal.classList.add('active');
    }
    
    // Event Listeners
    // Logout functionality
    logoutBtn.addEventListener('click', async () => {
      try {
        const response = await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          window.location.href = '/login';
        } else {
          console.error('Logout failed');
          showToast('Logout failed. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Error during logout:', error);
        showToast('Error during logout. Please try again.', 'error');
      }
    });
    
    // Calendar navigation
    prevMonthBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      generateCalendar(currentDate);
    });
    
    nextMonthBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      generateCalendar(currentDate);
    });
    
    // Create Project Modal
    createProjectBtn.addEventListener('click', () => {
      createProjectModal.classList.add('active');
    });
    
    closeCreateProjectModal.addEventListener('click', () => {
      createProjectModal.classList.remove('active');
    });
    
    cancelCreateProject.addEventListener('click', () => {
      createProjectModal.classList.remove('active');
    });
    
    submitCreateProject.addEventListener('click', () => {
      // Here you would handle the form submission logic
      createProjectModal.classList.remove('active');
      showToast('Project created successfully!', 'success');
    });
    
    // Project Details Modal
    projectActions.forEach(button => {
      button.addEventListener('click', function() {
        const projectId = parseInt(this.getAttribute('data-project-id'));
        populateProjectDetails(projectId);
      });
    });
    
    closeProjectDetailsModal.addEventListener('click', () => {
      projectDetailsModal.classList.remove('active');
    });
    
    // Secondary project actions (invite)
    projectActionsSecondary.forEach(button => {
      button.addEventListener('click', function() {
        const projectId = parseInt(this.getAttribute('data-project-id'));
        showToast(`Opening invite dialog for project ID: ${projectId}`, 'info');
        // Here you would implement opening the invite collaborator modal
      });
    });
    
    // Delete Project
    deleteProjectBtn.addEventListener('click', function() {
      const projectId = parseInt(this.getAttribute('data-project-id'));
      const project = mockProjects.find(p => p.id === projectId);
      
      if (project) {
        deleteProjectName.textContent = project.title;
        projectDetailsModal.classList.remove('active');
        deleteConfirmationModal.classList.add('active');
      }
    });
    
    closeDeleteModal.addEventListener('click', () => {
      deleteConfirmationModal.classList.remove('active');
    });
    
    cancelDelete.addEventListener('click', () => {
      deleteConfirmationModal.classList.remove('active');
    });
    
    confirmDelete.addEventListener('click', () => {
      // Here you would handle the project deletion logic
      deleteConfirmationModal.classList.remove('active');
      showToast('Project deleted successfully!', 'success');
    });
    
    // Find Collaborators
    findCollaboratorsBtn.addEventListener('click', () => {
      populateCollaboratorResults();
      collaboratorSearchModal.classList.add('active');
    });
    
    closeCollaboratorSearchModal.addEventListener('click', () => {
      collaboratorSearchModal.classList.remove('active');
    });
    
    // Invite Collaborator Modal
    closeInviteModal.addEventListener('click', () => {
      inviteCollaboratorModal.classList.remove('active');
    });
    
    cancelInvite.addEventListener('click', () => {
      inviteCollaboratorModal.classList.remove('active');
    });
    
    sendInvite.addEventListener('click', () => {
      // Here you would handle the invitation logic
      inviteCollaboratorModal.classList.remove('active');
      showToast('Invitation sent successfully!', 'success');
    });
    
    // Notification actions
    notificationActions.forEach(button => {
      button.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        
        if (action === 'dismiss') {
          const notificationId = this.getAttribute('data-notification-id');
          const notification = this.closest('.notification-item');
          notification.style.height = notification.offsetHeight + 'px';
          
          // Trigger reflow
          notification.offsetHeight;
          
          // Add class for animation
          notification.classList.add('dismissing');
          
          // Remove after animation completes
          setTimeout(() => {
            notification.remove();
            showToast('Notification dismissed', 'info');
          }, 300);
        } else if (action === 'view-comment') {
          const commentId = this.getAttribute('data-comment-id');
          showToast(`Viewing comment ID: ${commentId}`, 'info');
          // Here you would implement showing the comment details
        } else if (action === 'view-details') {
          const grantId = this.getAttribute('data-grant-id');
          showToast(`Viewing grant details ID: ${grantId}`, 'info');
          // Here you would implement showing the grant details
        } else if (action === 'start-task') {
          const taskId = this.getAttribute('data-task-id');
          showToast(`Starting task ID: ${taskId}`, 'info');
          // Here you would implement opening the task
        } else if (action === 'remind-later') {
          const notificationId = this.getAttribute('data-notification-id');
          showToast('You will be reminded again tomorrow', 'info');
          // Here you would implement the reminder logic
        }
      });
    });
    
    // Invitation actions
    invitationActions.forEach(button => {
      button.addEventListener('click', function() {
        const invitationId = this.getAttribute('data-invitation-id');
        const action = this.classList.contains('accept') ? 'accept' : 'decline';
        
        if (action === 'accept') {
          showToast(`Invitation ${invitationId} accepted`, 'success');
        } else {
          showToast(`Invitation ${invitationId} declined`, 'info');
        }
        
        // Remove invitation card
        const invitationCard = this.closest('.invitation-card');
        invitationCard.style.height = invitationCard.offsetHeight + 'px';
        
        // Trigger reflow
        invitationCard.offsetHeight;
        
        // Add class for animation
        invitationCard.classList.add('dismissing');
        
        // Remove after animation completes
        setTimeout(() => {
          invitationCard.remove();
        }, 300);
      });
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
    
    // Initialize
    loadUserInfo();
    generateCalendar(currentDate);
  });
  
      // Get DOM elements
      const userName = document.getElementById('user-name');
      const logoutBtn = document.getElementById('logout-btn');
      const calendarGrid = document.querySelector('.calendar-grid');
      const calendarMonth = document.querySelector('.calendar-month');
      const prevMonthBtn = document.getElementById('prev-month');
      const nextMonthBtn = document.getElementById('next-month');
      
      // User information
      async function loadUserInfo() {
        try {
          const response = await fetch('/api/auth/status');
          const data = await response.json();
          
          if (data.authenticated && data.user) {
            // Display user name
            userName.textContent = data.user.user_metadata?.name || 'Researcher';
          } else {
            // Redirect to login if not authenticated
            window.location.href = '/login';
          }
        } catch (error) {
          console.error('Error checking auth status:', error);
        }
      }
      
      // Logout functionality
      logoutBtn.addEventListener('click', async () => {
        try {
          const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            window.location.href = '/login';
          } else {
            console.error('Logout failed');
          }
        } catch (error) {
          console.error('Error during logout:', error);
        }
      });
      
      // Calendar functionality
      let currentDate = new Date();
      
      function generateCalendar(date) {
        // Clear previous calendar days
        const dayElements = document.querySelectorAll('.calendar-day');
        dayElements.forEach(day => day.remove());
        
        // Update month display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                            'July', 'August', 'September', 'October', 'November', 'December'];
        calendarMonth.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        
        // Get first day of month and last day
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        // Add empty days for start of month
        const startDayOfWeek = firstDay.getDay();
        for (let i = 0; i < startDayOfWeek; i++) {
          const emptyDay = document.createElement('div');
          emptyDay.className = 'calendar-day';
          calendarGrid.appendChild(emptyDay);
        }
        
        // Add days of the month
        const today = new Date();
        
        // Sample events (dates with events)
        const eventsOnDays = [5, 12, 18, 25];
        
        for (let i = 1; i <= lastDay.getDate(); i++) {
          const dayElement = document.createElement('div');
          dayElement.className = 'calendar-day';
          dayElement.textContent = i;
          
          // Check if this is today
          if (date.getMonth() === today.getMonth() && 
              date.getFullYear() === today.getFullYear() && 
              i === today.getDate()) {
            dayElement.classList.add('today');
          }
          
          // Check if this day has an event
          if (eventsOnDays.includes(i)) {
            dayElement.classList.add('has-event');
          }
          
          // Add click event
          dayElement.addEventListener('click', () => {
            // Remove active class from all days
            document.querySelectorAll('.calendar-day').forEach(day => {
              day.classList.remove('active');
            });
            
            // Add active class to clicked day
            dayElement.classList.add('active');
          });
          
          calendarGrid.appendChild(dayElement);
        }
      }
      
      // Initialize the calendar
      generateCalendar(currentDate);
      
      // Calendar navigation
      prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        generateCalendar(currentDate);
      });
      
      nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar(currentDate);
      });
      
      // Mobile menu toggle
      const mobileMenuBtn = document.getElementById('mobile-menu-button');
      const navLinks = document.querySelector('.nav-links');
      
      mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
      
      
      // Initialize
      loadUserInfo();
  
       // Mobile navigation setup
       const mobileNavButton = document.getElementById('mobile-menu-button');
       const mobileNavClose = document.getElementById('mobile-nav-close');
       const mobileNav = document.getElementById('mobile-nav');
       
       // Set initial display state for mobile menu button
       checkMobileView();
       
       // Check when window is resized
       window.addEventListener('resize', checkMobileView);
       
       // Open mobile menu
       if (mobileNavButton) {
           mobileNavButton.addEventListener('click', function() {
               if (mobileNav) {
                   mobileNav.classList.add('active');
                   document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
               }
           });
       }
       
       // Close mobile menu
       if (mobileNavClose) {
           mobileNavClose.addEventListener('click', function() {
               if (mobileNav) {
                   mobileNav.classList.remove('active');
                   document.body.style.overflow = ''; // Re-enable scrolling
               }
           });
       }
       
       // Close menu when clicking a link
       const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');
       mobileNavLinks.forEach(link => {
           link.addEventListener('click', function() {
               if (mobileNav) {
                   mobileNav.classList.remove('active');
                   document.body.style.overflow = '';
               }
           });
       });
   
       function checkMobileView() {
           const mobileMenuButton = document.getElementById('mobile-menu-button');
           if (!mobileMenuButton) return;
           
           const navLinks = document.querySelector('.nav-links');
           const navbar = document.querySelector('.navbar');
           const authButtons = document.querySelector('.navbar .auth-buttons');
           
           // Check if we're on a small screen (mobile view)
           if (window.innerWidth <= 768) {
               mobileMenuButton.style.display = 'block';
               if (navLinks) navLinks.classList.add('hidden-mobile');
               if (authButtons) authButtons.classList.add('hidden-mobile');
           } else {
               // We're on a large screen
               mobileMenuButton.style.display = 'none';
               if (navLinks) navLinks.classList.remove('hidden-mobile');
               if (authButtons) authButtons.classList.remove('hidden-mobile');
           }
       }
  