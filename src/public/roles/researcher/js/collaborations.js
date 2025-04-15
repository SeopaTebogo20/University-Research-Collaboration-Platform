
/**
 * CollabNexus Research Hub - Collaborations Page
 * This file contains the functionality for the collaborations management page.
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeTabNavigation();
    initializeCollaborationButtons();
    initializeModals();
    initializeUserMenu();
    initializeMobileMenu();
    initializeNotifications();
});

/**
 * Initialize tab navigation
 */
function initializeTabNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update ARIA attributes
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Activate current tab
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            const tabId = this.dataset.tab;
            const tabContent = document.getElementById(tabId);
            tabContent.classList.add('active');
            
            // Announce tab change for screen readers
            announceForScreenReaders(`${this.textContent} tab selected`);
        });
    });
}

/**
 * Initialize collaboration action buttons
 */
function initializeCollaborationButtons() {
    // Accept collaboration requests
    document.querySelectorAll('.collab-accept').forEach(btn => {
        btn.addEventListener('click', function() {
            const collabId = this.dataset.collabId;
            const collaborator = this.closest('.collaboration-item');
            const collaboratorName = collaborator.querySelector('h4').textContent;
            
            // Animation for removal
            collaborator.style.transition = 'opacity 0.3s, transform 0.3s';
            collaborator.style.opacity = '0';
            collaborator.style.transform = 'translateX(20px)';
            
            setTimeout(() => {
                collaborator.remove();
                
                // Update request count
                updateTabCount('requests', -1);
                
                // Update active collaborations count
                updateTabCount('active', 1);
                
                // Show toast notification
                showToast(`Collaboration with ${collaboratorName} accepted`, 'success');
            }, 300);
        });
    });
    
    // Decline collaboration requests
    document.querySelectorAll('.collab-decline').forEach(btn => {
        btn.addEventListener('click', function() {
            const collabId = this.dataset.collabId;
            const collaborator = this.closest('.collaboration-item');
            const collaboratorName = collaborator.querySelector('h4').textContent;
            
            // Animation for removal
            collaborator.style.transition = 'opacity 0.3s, transform 0.3s';
            collaborator.style.opacity = '0';
            collaborator.style.transform = 'translateX(20px)';
            
            setTimeout(() => {
                collaborator.remove();
                
                // Update request count
                updateTabCount('requests', -1);
                
                // Show toast notification
                showToast(`Collaboration with ${collaboratorName} declined`, 'info');
            }, 300);
        });
    });
    
    // Connect with suggested collaborators
    document.querySelectorAll('.collab-connect').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const collabId = this.dataset.collabId;
            const collaboratorCard = this.closest('.collaborator-card');
            const collaboratorName = collaboratorCard.querySelector('h4').textContent;
            
            // Visual feedback
            this.textContent = 'Request Sent';
            this.classList.remove('btn-primary');
            this.classList.add('btn-outline');
            this.disabled = true;
            
            // Show toast notification
            showToast(`Connection request sent to ${collaboratorName}`, 'success');
        });
    });
    
    // Message collaborators
    document.querySelectorAll('.collab-message').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const collabId = this.dataset.collabId;
            const collaboratorName = this.closest('.collaborator-card').querySelector('h4').textContent;
            
            // Open message modal
            openMessageModal(collaboratorName, collabId);
        });
    });
    
    // View collaborator profiles
    document.querySelectorAll('.collab-profile').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const collabId = this.dataset.collabId;
            
            let collaboratorName;
            if (this.closest('.collaborator-card')) {
                collaboratorName = this.closest('.collaborator-card').querySelector('h4').textContent;
            } else if (this.closest('.collaboration-item')) {
                collaboratorName = this.closest('.collaboration-item').querySelector('h4').textContent;
            }
            
            // Open profile modal
            openProfileModal(collaboratorName, collabId);
        });
    });
    
    // Find collaborators button
    document.getElementById('findCollabBtn').addEventListener('click', function() {
        // This would typically link to a search page or open a modal
        showToast('Collaborator search feature opening...', 'info');
        // For demo purposes, just activate the suggested tab
        document.querySelector('[data-tab="suggested"]').click();
    });
    
    // View all links
    document.getElementById('viewAllActive').addEventListener('click', function(e) {
        e.preventDefault();
        showToast('Loading all active collaborations...', 'info');
    });
    
    document.getElementById('viewAllSuggestions').addEventListener('click', function(e) {
        e.preventDefault();
        showToast('Loading all suggested collaborations...', 'info');
    });
}

/**
 * Initialize modal functionality
 */
function initializeModals() {
    // Setup for all modals
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.modal-close, .modal-close-btn');
    
    // Close modal when clicking close button
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modal when clicking outside content
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal(modal);
            }
        });
    });
    
    // Message modal send button
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', function() {
            const recipient = document.getElementById('messageRecipient').value;
            const subject = document.getElementById('messageSubject').value;
            const body = document.getElementById('messageBody').value;
            
            if (!subject || !body) {
                showToast('Please fill out all message fields', 'error');
                return;
            }
            
            // Close modal
            closeModal(document.getElementById('messageModal'));
            
            // Clear form
            document.getElementById('messageForm').reset();
            
            // Show success message
            showToast(`Message sent to ${recipient}`, 'success');
        });
    }
    
    // Profile modal connect button
    const profileConnectBtn = document.getElementById('profileConnectBtn');
    if (profileConnectBtn) {
        profileConnectBtn.addEventListener('click', function() {
            const researcherName = document.getElementById('profileModalTitle').textContent.replace('Profile: ', '');
            
            // Close modal
            closeModal(document.getElementById('profileModal'));
            
            // Show success message
            showToast(`Connection request sent to ${researcherName}`, 'success');
        });
    }
}

/**
 * Initialize user menu functionality
 */
function initializeUserMenu() {
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationModal = document.getElementById('notificationModal');
    
    // Toggle profile menu
    if (profileBtn && profileMenu) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const isExpanded = profileBtn.getAttribute('aria-expanded') === 'true';
            
            // Toggle menu visibility
            profileMenu.classList.toggle('active');
            
            // Update ARIA attributes
            profileBtn.setAttribute('aria-expanded', !isExpanded);
            
            // Close notification modal if open
            if (notificationModal && notificationModal.classList.contains('active')) {
                closeModal(notificationModal);
            }
        });
        
        // Close menu when clicking elsewhere
        document.addEventListener('click', function(e) {
            if (profileMenu.classList.contains('active') && !profileMenu.contains(e.target)) {
                profileMenu.classList.remove('active');
                profileBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Open notifications modal
    if (notificationBtn && notificationModal) {
        notificationBtn.addEventListener('click', function() {
            // Close profile menu if open
            if (profileMenu && profileMenu.classList.contains('active')) {
                profileMenu.classList.remove('active');
                profileBtn.setAttribute('aria-expanded', 'false');
            }
            
            // Open notification modal
            openModal(notificationModal);
        });
        
        // Mark all notifications as read
        const markAllReadBtn = document.getElementById('markAllReadBtn');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', function() {
                const unreadItems = document.querySelectorAll('.notification-item.unread');
                unreadItems.forEach(item => {
                    item.classList.remove('unread');
                });
                
                // Update badge count
                const badge = document.querySelector('.badge');
                if (badge) {
                    badge.textContent = '0';
                    badge.style.display = 'none';
                }
                
                showToast('All notifications marked as read', 'info');
            });
        }
        
        // Mark individual notifications as read
        const notificationActions = document.querySelectorAll('.notification-action');
        notificationActions.forEach(button => {
            button.addEventListener('click', function() {
                const notification = this.closest('.notification-item');
                notification.classList.remove('unread');
                
                // Update badge count
                const badge = document.querySelector('.badge');
                if (badge) {
                    const currentCount = parseInt(badge.textContent);
                    const newCount = currentCount - 1;
                    badge.textContent = newCount;
                    
                    if (newCount <= 0) {
                        badge.style.display = 'none';
                    }
                }
            });
        });
    }
}

/**
 * Initialize mobile menu functionality
 */
function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            
            // Toggle menu visibility
            navLinks.classList.toggle('active');
            
            // Update ARIA attributes
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
            
            // Toggle icon
            const icon = mobileMenuToggle.querySelector('i');
            if (icon) {
                if (isExpanded) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                } else {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                }
            }
        });
    }
}

/**
 * Initialize notifications functionality
 */
function initializeNotifications() {
    // For demonstration purposes, we'll set up a notification that appears after 5 seconds
    setTimeout(() => {
        showToast('New collaboration request from Dr. Maria Silva', 'info');
    }, 5000);
}

/**
 * Helper function to update tab counts
 */
function updateTabCount(tabId, change) {
    const tabButton = document.querySelector(`[data-tab="${tabId}"]`);
    if (tabButton) {
        const currentText = tabButton.textContent;
        const countMatch = currentText.match(/\((\d+)\)/);
        
        if (countMatch) {
            const currentCount = parseInt(countMatch[1]);
            const newCount = currentCount + change;
            
            // Update button text
            tabButton.textContent = currentText.replace(/\(\d+\)/, `(${newCount})`);
        }
    }
}

/**
 * Helper function to open a message modal
 */
function openMessageModal(recipientName, collabId) {
    const messageModal = document.getElementById('messageModal');
    if (messageModal) {
        // Set recipient
        const recipientInput = document.getElementById('messageRecipient');
        if (recipientInput) {
            recipientInput.value = recipientName;
        }
        
        // Store collaborator ID if needed
        if (messageModal.dataset) {
            messageModal.dataset.collabId = collabId;
        }
        
        // Open modal
        openModal(messageModal);
        
        // Focus on subject field
        setTimeout(() => {
            const subjectInput = document.getElementById('messageSubject');
            if (subjectInput) {
                subjectInput.focus();
            }
        }, 100);
    }
}

/**
 * Helper function to open a profile modal
 */
function openProfileModal(researcherName, collabId) {
    const profileModal = document.getElementById('profileModal');
    if (profileModal) {
        // Set modal title
        const modalTitle = document.getElementById('profileModalTitle');
        if (modalTitle) {
            modalTitle.textContent = `Profile: ${researcherName}`;
        }
        
        // Store collaborator ID if needed
        if (profileModal.dataset) {
            profileModal.dataset.collabId = collabId;
        }
        
        // Load researcher profile content (simulated)
        const profileContent = document.getElementById('researcherProfileContent');
        if (profileContent) {
            profileContent.innerHTML = generateProfileContent(researcherName, collabId);
        }
        
        // Open modal
        openModal(profileModal);
    }
}

/**
 * Generate profile content for the modal (simulated)
 */
function generateProfileContent(name, id) {
    // In a real application, this would load data from an API
    return `
        <div class="researcher-profile">
            <div class="profile-header">
                <img src="https://i.pravatar.cc/150?img=${parseInt(id) + 20}" alt="${name}" class="profile-avatar">
                <div class="profile-info">
                    <h4>${name}</h4>
                    <p>Research Fellow</p>
                    <p>Publications: 48 | Citations: 1,250</p>
                </div>
            </div>
            <div class="profile-details">
                <h5>Research Areas</h5>
                <div class="research-tags">
                    <span class="project-tag climate-tag">Climate Science</span>
                    <span class="project-tag ai-tag">Machine Learning</span>
                    <span class="project-tag sustainability-tag">Sustainability</span>
                </div>
                
                <h5>Biography</h5>
                <p>Leading researcher in the field of ${getResearchField(id)} with over 15 years of experience. 
                   Published extensively in top journals including Nature and Science. 
                   Currently focused on interdisciplinary approaches to solving global challenges.</p>
                
                <h5>Recent Publications</h5>
                <ul class="publication-list">
                    <li>"Novel Approaches to Climate Prediction Using Neural Networks" (2024)</li>
                    <li>"Interdisciplinary Research Methods for Sustainable Development" (2023)</li>
                    <li>"The Future of Collaborative Science in the Digital Age" (2022)</li>
                </ul>
                
                <h5>Current Projects</h5>
                <div class="project-cards">
                    <div class="mini-project-card">
                        <h6>Climate Prediction Model</h6>
                        <p>Developing advanced models for accurate long-term climate forecasting</p>
                    </div>
                    <div class="mini-project-card">
                        <h6>Sustainable Materials</h6>
                        <p>Researching biodegradable alternatives to conventional plastics</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Helper function to get a research field based on ID (simulated)
 */
function getResearchField(id) {
    const fields = [
        'Climate Science', 
        'Quantum Computing', 
        'Renewable Energy', 
        'Artificial Intelligence', 
        'Marine Biology',
        'Sustainable Architecture',
        'Materials Science',
        'Genomics',
        'Neural Networks',
        'Energy Storage',
        'Environmental Engineering'
    ];
    
    return fields[id % fields.length];
}

/**
 * Helper function to open a modal
 */
function openModal(modal) {
    if (modal) {
        // Show modal
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        // Trap focus inside modal
        trapFocus(modal);
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
        
        // Announce for screen readers
        announceForScreenReaders(`${modal.getAttribute('aria-labelledby')} dialog opened`);
    }
}

/**
 * Helper function to close a modal
 */
function closeModal(modal) {
    if (modal) {
        // Hide modal
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        
        // Restore body scrolling
        document.body.style.overflow = '';
        
        // Announce for screen readers
        announceForScreenReaders('Dialog closed');
    }
}

/**
 * Helper function to trap focus inside a modal
 */
function trapFocus(element) {
    const focusableElements = element.querySelectorAll('a[href], button:not([disabled]), textarea, input, select');
    
    if (focusableElements.length > 0) {
        setTimeout(() => {
            focusableElements[0].focus();
        }, 100);
    }
}

/**
 * Helper function for screen reader announcements
 */
function announceForScreenReaders(message) {
    let srAnnouncement = document.getElementById('sr-announcement');
    
    if (!srAnnouncement) {
        srAnnouncement = document.createElement('div');
        srAnnouncement.id = 'sr-announcement';
        srAnnouncement.setAttribute('aria-live', 'polite');
        srAnnouncement.classList.add('sr-only');
        document.body.appendChild(srAnnouncement);
    }
    
    srAnnouncement.textContent = message;
}

/**
 * Helper function to show toast notifications
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) {
        return;
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    
    // Add icon based on type
    let icon;
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        case 'info':
        default:
            icon = '<i class="fas fa-info-circle"></i>';
            break;
    }
    
    // Set content
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">${message}</div>
        <button class="toast-close" aria-label="Close notification">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Add event listener to close button
    const closeButton = toast.querySelector('.toast-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            removeToast(toast);
        });
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        removeToast(toast);
    }, 5000);
    
    // Slide in animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
}

/**
 * Helper function to remove toast notifications
 */
function removeToast(toast) {
    // Add removing class for animation
    toast.classList.add('removing');
    
    // Remove element after animation
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}
