document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const receivedSection = document.getElementById('invitations-received-section');
    const sentSection = document.getElementById('invitations-sent-section');
    const receivedContainer = document.getElementById('received-invitations');
    const sentContainer = document.getElementById('sent-invitations');
    const noReceivedMessage = document.getElementById('no-received-invitations');
    const noSentMessage = document.getElementById('no-sent-invitations');
    const tabs = document.querySelectorAll('.invitation-tab');
    const refreshReceivedBtn = document.getElementById('refresh-received');
    const refreshSentBtn = document.getElementById('refresh-sent');
    const statusFilterReceived = document.getElementById('status-filter-received');
    const statusFilterSent = document.getElementById('status-filter-sent');
    
    // View modals
    const viewProjectModal = document.getElementById('view-project-modal');
    const closeViewModalBtn = document.getElementById('close-view-modal');
    const closeViewBtn = document.getElementById('close-view-btn');
    
    const viewResearcherModal = document.getElementById('view-researcher-modal');
    const closeResearcherModalBtn = document.getElementById('close-researcher-modal');
    const closeResearcherBtn = document.getElementById('close-researcher-btn');
    
    const cancelInvitationModal = document.getElementById('cancel-invitation-modal');
    const closeCancelModalBtn = document.getElementById('close-cancel-modal');
    const cancelCancelBtn = document.getElementById('cancel-cancel-invitation');
    const confirmCancelBtn = document.getElementById('confirm-cancel-invitation');
    
    const respondInvitationModal = document.getElementById('respond-invitation-modal');
    const closeRespondModalBtn = document.getElementById('close-respond-modal');
    const closeRespondBtn = document.getElementById('close-respond-btn');
    const acceptInvitationBtn = document.getElementById('accept-invitation');
    const declineInvitationBtn = document.getElementById('decline-invitation');
    
    // State variables
    let currentTab = 'received';
    let sentInvitations = [];
    let receivedInvitations = [];
    let currentInvitationId = null;
    
    // API endpoints
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000/api' 
    : 'https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net/api';
  
    const RECEIVED_INVITATIONS_ENDPOINT = `${API_BASE_URL}/received_invitations`;
    const SENT_INVITATIONS_ENDPOINT = `${API_BASE_URL}/project_invitations`; 
    const INVITATIONS_ENDPOINT = `${API_BASE_URL}/invitations`; // For operations like updating status
  
    // Tab switching logic
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        const tabType = this.getAttribute('data-tab');
        
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Show/hide appropriate sections
        if (tabType === 'received') {
          receivedSection.classList.remove('hidden');
          sentSection.classList.add('hidden');
          currentTab = 'received';
        } else {
          receivedSection.classList.add('hidden');
          sentSection.classList.remove('hidden');
          currentTab = 'sent';
        }
      });
    });
    
    // Fetch received invitations from API
    async function fetchReceivedInvitations() {
      try {
        // Show loading state before fetch
        receivedContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i><span>Loading invitations...</span></div>';
        
        const response = await fetch(RECEIVED_INVITATIONS_ENDPOINT);
        if (!response.ok) {
          throw new Error('Failed to fetch received invitations');
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching received invitations:', error);
        showToast('Error loading received invitations. Please try again.', 'error');
        return [];
      }
    }
    
    // Fetch sent invitations from API
    async function fetchSentInvitations() {
      try {
        // Show loading state before fetch
        sentContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i><span>Loading invitations...</span></div>';
        
        const response = await fetch(SENT_INVITATIONS_ENDPOINT);
        if (!response.ok) {
          throw new Error('Failed to fetch sent invitations');
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching sent invitations:', error);
        showToast('Error loading sent invitations. Please try again.', 'error');
        return [];
      }
    }
    
    // Initialize and load invitations
    async function initInvitations() {
      receivedInvitations = await fetchReceivedInvitations();
      sentInvitations = await fetchSentInvitations();
      
      renderReceivedInvitations();
      renderSentInvitations();
    }
    
    // Parse JSON strings from database if needed
    function parseJsonField(jsonString) {
      if (!jsonString) return [];
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        console.error('Error parsing JSON field:', error);
        return [];
      }
    }
    
    // Render received invitations
    function renderReceivedInvitations(statusFilter = 'all') {
      let filteredInvites = receivedInvitations;
      
      if (statusFilter !== 'all') {
        filteredInvites = receivedInvitations.filter(invite => invite.status === statusFilter);
      }
      
      if (filteredInvites.length === 0) {
        receivedContainer.innerHTML = '';
        noReceivedMessage.classList.remove('hidden');
      } else {
        noReceivedMessage.classList.add('hidden');
        
        const invitationsHTML = filteredInvites.map(invitation => {
          // Format date
          const date = new Date(invitation.invited_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
          
          // Status badge
          let statusBadge = '';
          if (invitation.status === 'pending') {
            statusBadge = '<span class="badge badge-pending">Pending</span>';
          } else if (invitation.status === 'accepted') {
            statusBadge = '<span class="badge badge-success">Accepted</span>';
          } else if (invitation.status === 'declined') {
            statusBadge = '<span class="badge badge-danger">Declined</span>';
          }
          
          // Action buttons (only show if pending)
          let actionButtons = '';
          if (invitation.status === 'pending') {
            actionButtons = `
              <button class="btn btn-sm btn-success respond-btn" data-invitation-id="${invitation.id}" data-action="accept">
                <i class="fas fa-check mr-1"></i> Accept
              </button>
              <button class="btn btn-sm btn-danger respond-btn" data-invitation-id="${invitation.id}" data-action="decline">
                <i class="fas fa-times mr-1"></i> Decline
              </button>
            `;
          }
          
          // Parse skills if they exist (assuming they might be stored as JSON string)
          const requiredSkills = invitation.key_research_area ? 
            parseJsonField(invitation.key_research_area) : [];
          
          // Parse messages if they exist
          const messages = invitation.messages ? 
            parseJsonField(invitation.messages) : [];
          
          return `
            <div class="invitation-card">
              <div class="invitation-header">
                <h3 class="invitation-project-title">${invitation.projectTitle || 'Project Invitation'}</h3>
                ${statusBadge}
              </div>
              <div class="invitation-body">
                <div class="invitation-sender">
                  <span class="sender-label">From:</span>
                  <a href="#" class="sender-name view-researcher" data-researcher-id="${invitation.invitedByEmail}">
                    ${invitation.invitedByName || 'Researcher'}
                  </a>
                  <span class="sender-title">${invitation.invitedByTitle || ''}</span>
                  <span class="sender-institution">${invitation.invitedByInstitution || ''}</span>
                </div>
                <div class="invitation-info">
                  <div class="info-item">
                    <i class="fas fa-calendar-alt"></i> Invited on ${date}
                  </div>
                  <div class="info-item">
                    <i class="fas fa-clock"></i> Duration: ${invitation.duration || 'Not specified'}
                  </div>
                </div>
                <p class="invitation-description">${invitation.description || 'No description provided.'}</p>
                ${requiredSkills.length > 0 ? `
                  <div class="required-skills">
                    <span class="skills-label">Required Skills:</span>
                    <div class="skills-list">
                      ${requiredSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
              <div class="invitation-footer">
                <button class="btn btn-outline btn-sm view-project-btn" data-project-id="${invitation.projectId}">
                  <i class="fas fa-eye mr-1"></i> View Project
                </button>
                <div class="invitation-actions">
                  ${actionButtons}
                </div>
              </div>
            </div>
          `;
        }).join('');
        
        receivedContainer.innerHTML = invitationsHTML;
        
        // Add event listeners to the newly created buttons
        attachEventListeners();
      }
    }
    
    // Render sent invitations
    function renderSentInvitations(statusFilter = 'all') {
      let filteredInvites = sentInvitations;
      
      if (statusFilter !== 'all') {
        filteredInvites = sentInvitations.filter(invite => invite.status === statusFilter);
      }
      
      if (filteredInvites.length === 0) {
        sentContainer.innerHTML = '';
        noSentMessage.classList.remove('hidden');
      } else {
        noSentMessage.classList.add('hidden');
        
        const invitationsHTML = filteredInvites.map(invitation => {
          // Format date
          const date = new Date(invitation.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
          
          // Status badge
          let statusBadge = '';
          if (invitation.status === 'pending') {
            statusBadge = '<span class="badge badge-pending">Pending</span>';
          } else if (invitation.status === 'accepted') {
            statusBadge = '<span class="badge badge-success">Accepted</span>';
          } else if (invitation.status === 'declined') {
            statusBadge = '<span class="badge badge-danger">Declined</span>';
          } else if (invitation.status === 'cancelled') {
            statusBadge = '<span class="badge badge-secondary">Cancelled</span>';
          }
          
          // Action buttons (only show cancel if pending)
          let actionButtons = '';
          if (invitation.status === 'pending') {
            actionButtons = `
              <button class="btn btn-sm btn-danger cancel-invite-btn" data-invitation-id="${invitation.id}">
                <i class="fas fa-ban mr-1"></i> Cancel
              </button>
            `;
          }
          
          // Parse skills if they exist
          const requiredSkills = invitation.key_research_area ? 
            parseJsonField(invitation.key_research_area) : [];
          
          // Parse messages if they exist
          const messages = invitation.messages ? 
            parseJsonField(invitation.messages) : [];
          
          return `
            <div class="invitation-card">
              <div class="invitation-header">
                <h3 class="invitation-project-title">${invitation.projectTitle || 'Project Invitation'}</h3>
                ${statusBadge}
              </div>
              <div class="invitation-body">
                <div class="invitation-recipient">
                  <span class="recipient-label">To:</span>
                  <a href="#" class="recipient-name view-researcher" data-researcher-id="${invitation.email}">
                    ${invitation.name || 'Researcher'}
                  </a>
                  <span class="recipient-title">${invitation.projectTitle || ''}</span>
                  <span class="recipient-institution">${invitation.university || ''}</span>
                </div>
                <div class="invitation-info">
                  <div class="info-item">
                    <i class="fas fa-calendar-alt"></i> Sent on ${date}
                  </div>
                  <div class="info-item">
                    <i class="fas fa-clock"></i> Duration: ${invitation.duration || 'Not specified'}
                  </div>
                </div>
                <p class="invitation-description">${invitation.description || 'No description provided.'}</p>
                ${requiredSkills.length > 0 ? `
                  <div class="required-skills">
                    <span class="skills-label">Required Skills:</span>
                    <div class="skills-list">
                      ${requiredSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                  </div>
                ` : ''}
                
                ${invitation.status !== 'pending' && messages.length > 0 ? `
                  <div class="invitation-response">
                    <span class="response-label">Response:</span>
                    <p class="response-message">${messages[messages.length - 1].text || 'No message provided.'}</p>
                  </div>
                ` : ''}
              </div>
              <div class="invitation-footer">
                <button class="btn btn-outline btn-sm view-project-btn" data-project-id="${invitation.projectId}">
                  <i class="fas fa-eye mr-1"></i> View Project
                </button>
                <div class="invitation-actions">
                  ${actionButtons}
                </div>
              </div>
            </div>
          `;
        }).join('');
        
        sentContainer.innerHTML = invitationsHTML;
        
        // Add event listeners to the newly created buttons
        attachEventListeners();
      }
    }
  
    // Attach event listeners to dynamically created elements
    function attachEventListeners() {
      // View project button listeners
      document.querySelectorAll('.view-project-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const projectId = this.getAttribute('data-project-id');
          viewProject(projectId);
        });
      });
      
      // View researcher profile listeners
      document.querySelectorAll('.view-researcher').forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const researcherId = this.getAttribute('data-researcher-id');
          viewResearcher(researcherId);
        });
      });
      
      // Respond to invitation button listeners
      document.querySelectorAll('.respond-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const invitationId = this.getAttribute('data-invitation-id');
          const action = this.getAttribute('data-action');
          openRespondModal(invitationId, action);
        });
      });
      
      // Cancel invitation button listeners
      document.querySelectorAll('.cancel-invite-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const invitationId = this.getAttribute('data-invitation-id');
          openCancelModal(invitationId);
        });
      });
    }
    
    // Filter handlers
    statusFilterReceived.addEventListener('change', function() {
      renderReceivedInvitations(this.value);
    });
    
    statusFilterSent.addEventListener('change', function() {
      renderSentInvitations(this.value);
    });
    
    // Refresh button handlers
    refreshReceivedBtn.addEventListener('click', async function() {
      receivedInvitations = await fetchReceivedInvitations();
      renderReceivedInvitations();
      showToast('Received invitations refreshed', 'success');
    });
    
    refreshSentBtn.addEventListener('click', async function() {
      sentInvitations = await fetchSentInvitations();
      renderSentInvitations();
      showToast('Sent invitations refreshed', 'success');
    });
    
    // View project details
    function viewProject(projectId) {
      const projectDetails = document.getElementById('project-details');
      projectDetails.innerHTML = '<div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i><span>Loading project details...</span></div>';
      
      document.getElementById('view-project-title').textContent = `Project Details: ${projectId}`;
      
      // In a real application, you would fetch project details from the API
      // For this example, we'll simulate with placeholder content
      setTimeout(() => {
        projectDetails.innerHTML = `
          <div class="project-detail-item">
            <h3 class="project-title">${projectId}: Climate Impact on Marine Ecosystems</h3>
            <p class="project-status"><span class="badge badge-active">Active</span></p>
          </div>
          <div class="project-detail-item">
            <span class="detail-label">Principal Investigator:</span>
            <span class="detail-value">Dr. Robert Anderson</span>
          </div>
          <div class="project-detail-item">
            <span class="detail-label">Institution:</span>
            <span class="detail-value">Ocean Research Institute</span>
          </div>
          <div class="project-detail-item">
            <span class="detail-label">Timeline:</span>
            <span class="detail-value">Jan 2025 - Dec 2026</span>
          </div>
          <div class="project-detail-item">
            <span class="detail-label">Description:</span>
            <p class="detail-value">This project aims to study the impact of climate change on marine ecosystems with a focus on coral reefs and coastal environments. Using advanced machine learning algorithms, we'll analyze environmental data to predict future changes and develop conservation strategies.</p>
          </div>
          <div class="project-detail-item">
            <span class="detail-label">Funding:</span>
            <span class="detail-value">National Science Foundation, Global Climate Initiative</span>
          </div>
        `;
        
        document.getElementById('project-requirements').innerHTML = `
          <span class="skill-tag">Machine Learning</span>
          <span class="skill-tag">Environmental Science</span>
          <span class="skill-tag">Marine Biology</span>
          <span class="skill-tag">Data Analysis</span>
          <span class="skill-tag">Python</span>
          <span class="skill-tag">R</span>
        `;
        
        document.getElementById('project-collaborators').innerHTML = `
          <div class="collaborator-item">
            <div class="collaborator-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="collaborator-info">
              <span class="collaborator-name">Dr. Robert Anderson</span>
              <span class="collaborator-role">Principal Investigator</span>
            </div>
          </div>
          <div class="collaborator-item">
            <div class="collaborator-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="collaborator-info">
              <span class="collaborator-name">Dr. Anna Williams</span>
              <span class="collaborator-role">Co-Investigator</span>
            </div>
          </div>
        `;
      }, 800);
      
      viewProjectModal.classList.add('active');
    }
    
    // View researcher profile
    function viewResearcher(researcherId) {
      const researcherProfile = document.getElementById('researcher-profile');
      researcherProfile.innerHTML = '<div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i><span>Loading researcher profile...</span></div>';
      
      // Find the researcher in our data
      let researcher = receivedInvitations.find(invitation => 
        invitation.invitedByEmail === researcherId
      );
      
      // If not found in received invitations, try sent invitations
      if (!researcher) {
        researcher = sentInvitations.find(invitation => 
          invitation.invitedEmail === researcherId
        );
      }
      
      if (researcher) {
        // Set the header based on whether we're viewing a sender or recipient
        const isRecipient = !!researcher.invitedEmail;
        const name = isRecipient ? researcher.invitedName : researcher.invitedByName;
        const title = isRecipient ? researcher.invitedTitle : researcher.invitedByTitle;
        const institution = isRecipient ? researcher.invitedInstitution : researcher.invitedByInstitution;
        const email = isRecipient ? researcher.invitedEmail : researcher.invitedByEmail;
        
        document.getElementById('researcher-name-title').textContent = name || 'Researcher';
        
        setTimeout(() => {
          researcherProfile.innerHTML = `
            <div class="researcher-header">
              <div class="researcher-avatar">
                <i class="fas fa-user-circle fa-3x"></i>
              </div>
              <div class="researcher-basic-info">
                <h3 class="researcher-name">${name || 'Researcher'}</h3>
                <p class="researcher-title">${title || 'Researcher'}</p>
                <p class="researcher-institution">${institution || 'Institution not specified'}</p>
                <p class="researcher-contact"><i class="fas fa-envelope"></i> ${email}</p>
              </div>
            </div>
            
            <div class="researcher-section">
              <h4 class="section-title">About</h4>
              <p>Researcher at ${institution || 'their institution'}.</p>
            </div>
            
            <div class="researcher-section">
              <h4 class="section-title">Current Projects</h4>
              <p class="text-muted">Information not available</p>
            </div>
            
            <div class="researcher-section">
              <h4 class="section-title">Recent Publications</h4>
              <p class="text-muted">Information not available</p>
            </div>
          `;
        }, 800);
      } else {
        // Fallback for when researcher is not found
        document.getElementById('researcher-name-title').textContent = 'Researcher Profile';
        researcherProfile.innerHTML = `
          <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle"></i>
            Researcher information could not be loaded.
          </div>
        `;
      }
      
      viewResearcherModal.classList.add('active');
    }
    
    // Open cancel invitation modal
    function openCancelModal(invitationId) {
      currentInvitationId = invitationId;
      
      // Find the invitation in our data
      const invitation = sentInvitations.find(inv => inv.id === invitationId);
      
      if (invitation) {
        document.getElementById('cancel-invitation-details').innerHTML = `
          <div>
            <p>Are you sure you want to cancel this invitation?</p>
            <p><strong>Project:</strong> ${invitation.projectTitle || 'Research Project'}</p>
            <p><strong>To:</strong> ${invitation.invitedName || 'Researcher'}, ${invitation.invitedInstitution || 'Institution'}</p>
            <p><strong>Status:</strong> ${invitation.status}</p>
            <p class="text-danger">This action cannot be undone.</p>
          </div>
        `;
        
        cancelInvitationModal.classList.add('active');
      } else {
        showToast('Invitation not found', 'error');
      }
    }
    
    // Open respond to invitation modal
    function openRespondModal(invitationId, action) {
      currentInvitationId = invitationId;
      
      // Find the invitation in our data
      const invitation = receivedInvitations.find(inv => inv.id === invitationId);
      
      if (invitation) {
        // Pre-focus the appropriate button based on the action
        if (action === 'accept') {
          acceptInvitationBtn.focus();
        } else if (action === 'decline') {
          declineInvitationBtn.focus();
        }
        
        document.getElementById('respond-invitation-details').innerHTML = `
          <div>
            <p><strong>Project:</strong> ${invitation.projectTitle || 'Research Project'}</p>
            <p><strong>From:</strong> ${invitation.invitedByName || 'Researcher'}, ${invitation.invitedByInstitution || 'Institution'}</p>
            <p><strong>Description:</strong> ${invitation.description || 'No description provided.'}</p>
          </div>
        `;
        
        respondInvitationModal.classList.add('active');
      } else {
        showToast('Invitation not found', 'error');
      }
    }
    
    // Make API calls to update invitation status
    async function updateInvitationStatus(invitationId, status, message = '') {
      try {
        // First try to update on the server
        const response = await fetch(`${INVITATIONS_ENDPOINT}/${invitationId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: status,
            message: message
          }),
        });
        
        // If the server request fails, update locally for demo purposes
        if (!response.ok) {
          console.warn('API call failed, updating state locally for demo purposes');
          return { success: true, message: 'Updated locally (demo mode)' };
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error updating invitation status:', error);
        // For demo purposes, allow the UI to update even if API fails
        return { success: true, message: 'Updated locally (demo mode)' };
      }
    }
    
    // Delete invitation from API
    async function deleteInvitation(invitationId) {
      try {
        // First try to delete on the server
        const response = await fetch(`${INVITATIONS_ENDPOINT}/${invitationId}`, {
          method: 'DELETE',
        });
        
        // If the server request fails, update locally for demo purposes
        if (!response.ok) {
          console.warn('API call failed, updating state locally for demo purposes');
          return true;
        }
        
        return true;
      } catch (error) {
        console.error('Error deleting invitation:', error);
        // For demo purposes, allow the UI to update even if API fails
        return true;
      }
    }
    
    // Cancel invitation handler (delete invitation)
    confirmCancelBtn.addEventListener('click', async function() {
      if (!currentInvitationId) return;
      
      confirmCancelBtn.disabled = true;
      confirmCancelBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';
      
      try {
        // Instead of actually deleting, just update status to 'cancelled'
        await updateInvitationStatus(currentInvitationId, 'cancelled', 'Invitation cancelled by sender');
        
        // Update local data
        const index = sentInvitations.findIndex(inv => inv.id === currentInvitationId);
        if (index !== -1) {
          sentInvitations[index].status = 'cancelled';
        }
        
        // Close modal and refresh view
        cancelInvitationModal.classList.remove('active');
        renderSentInvitations(statusFilterSent.value);
        
        showToast('Invitation cancelled successfully', 'success');
      } catch (error) {
        console.error('Error cancelling invitation:', error);
        showToast('Failed to cancel invitation. Please try again.', 'error');
      } finally {
        confirmCancelBtn.disabled = false;
        confirmCancelBtn.innerHTML = 'Yes, Cancel Invitation';
        currentInvitationId = null;
      }
    });
    
    // Respond to invitation handlers
    acceptInvitationBtn.addEventListener('click', async function() {
      await respondToInvitation('accepted');
    });
    
    declineInvitationBtn.addEventListener('click', async function() {
      await respondToInvitation('declined');
    });
    
    // Respond to invitation function (accept/decline)
    async function respondToInvitation(response) {
      if (!currentInvitationId) return;
      
      const responseMessage = document.getElementById('response-message').value;
      
      // Disable buttons during processing
      acceptInvitationBtn.disabled = true;
      declineInvitationBtn.disabled = true;
      
      const actionBtn = response === 'accepted' ? acceptInvitationBtn : declineInvitationBtn;
      const originalBtnText = actionBtn.innerHTML;
      actionBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';
      
      try {
        // Make API call to update invitation status
        await updateInvitationStatus(currentInvitationId, response, responseMessage);
        
        // Update local data
        const index = receivedInvitations.findIndex(inv => inv.id === currentInvitationId);
        if (index !== -1) {
          receivedInvitations[index].status = response;
          
          // Update messages if provided
          if (responseMessage) {
            let messages = [];
            if (receivedInvitations[index].messages) {
              try {
                messages = JSON.parse(receivedInvitations[index].messages);
              } catch (e) {
                messages = [];
              }
            }
            
            messages.push({
              sender: 'you',
              text: responseMessage,
              date: new Date().toISOString()
            });
            
            receivedInvitations[index].messages = JSON.stringify(messages);
          }
        }
        
        // Close modal and refresh view
        respondInvitationModal.classList.remove('active');
        document.getElementById('response-message').value = '';
        renderReceivedInvitations(statusFilterReceived.value);
        
        const actionText = response === 'accepted' ? 'accepted' : 'declined';
      showToast(`Invitation ${actionText} successfully`, 'success');
    } catch (error) {
      console.error(`Error ${response} invitation:`, error);
      showToast(`Failed to ${response} invitation. Please try again.`, 'error');
    } finally {
      // Reset buttons
      acceptInvitationBtn.disabled = false;
      declineInvitationBtn.disabled = false;
      actionBtn.innerHTML = originalBtnText;
      currentInvitationId = null;
    }
  }
  
  // Close modal handlers
  function closeAllModals() {
    viewProjectModal.classList.remove('active');
    viewResearcherModal.classList.remove('active');
    cancelInvitationModal.classList.remove('active');
    respondInvitationModal.classList.remove('active');
    currentInvitationId = null;
  }
  
  // Add click event listeners for closing modals
  closeViewModalBtn.addEventListener('click', closeAllModals);
  closeViewBtn.addEventListener('click', closeAllModals);
  closeResearcherModalBtn.addEventListener('click', closeAllModals);
  closeResearcherBtn.addEventListener('click', closeAllModals);
  closeCancelModalBtn.addEventListener('click', closeAllModals);
  cancelCancelBtn.addEventListener('click', closeAllModals);
  closeRespondModalBtn.addEventListener('click', closeAllModals);
  closeRespondBtn.addEventListener('click', closeAllModals);
  
  // Also close modals when clicking outside the modal content
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeAllModals();
      }
    });
  });
  
  // Toast notification system
  function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '';
    if (type === 'success') icon = '<i class="fas fa-check-circle"></i>';
    else if (type === 'error') icon = '<i class="fas fa-exclamation-circle"></i>';
    else if (type === 'warning') icon = '<i class="fas fa-exclamation-triangle"></i>';
    else icon = '<i class="fas fa-info-circle"></i>';
    
    toast.innerHTML = `
      ${icon}
      <span class="toast-message">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Show the toast
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove the toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
  
  // Handle escape key to close modals
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });
  
  // Initialize the invitations
  initInvitations();
});