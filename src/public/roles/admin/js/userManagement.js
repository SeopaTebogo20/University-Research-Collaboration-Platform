// Admin User Management JavaScript - Using API data
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const usersListElement = document.getElementById('users-list');
    const searchInputElement = document.getElementById('search-input');
    const searchForm = document.querySelector('.search-form');
    const viewProfileModal = document.createElement('div');
    viewProfileModal.id = 'view-profile-modal';
    viewProfileModal.className = 'modal';
    viewProfileModal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal">&times;</button>
            <div id="profile-content" class="profile-content"></div>
            <div class="modal-actions">
                <button id="promote-user-btn" class="btn btn-primary">Promote to Reviewer</button>
            </div>
        </div>
    `;
    document.body.appendChild(viewProfileModal);
    
    const profileContent = document.getElementById('profile-content');
    const promoteUserBtn = document.getElementById('promote-user-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);

    // API Endpoints
    const isLocalEnvironment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1';
    
    const BASE_URL = isLocalEnvironment 
        ? 'http://localhost:3000' 
        : 'https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net';
    
    const API_ENDPOINTS = {
        USERS: `${BASE_URL}/api/users`,
        LOGOUT: `${BASE_URL}/api/logout`
    };

    // Store the current users data
    let allUsers = [];
    let currentUsers = [];

    // Initialize the page
    async function init() {
        try {
            await fetchUsers();
            setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize page:', error);
            showToast('Failed to load user data. Please try again.', 'error');
        }
    }

    // Fetch users from API
    async function fetchUsers(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (filters.search) {
                queryParams.append('search', filters.search);
            }
            
            const url = queryParams.toString() 
                ? `${API_ENDPOINTS.USERS}?${queryParams.toString()}` 
                : API_ENDPOINTS.USERS;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Filter users to only include researchers and reviewers
            const filteredUsers = data.filter(user => {
                const role = (user.role || '').toLowerCase();
                return role === 'researcher' || role === 'reviewer';
            });
            
            allUsers = filteredUsers;
            currentUsers = [...filteredUsers];
            renderUsersList(currentUsers);
            
            return filteredUsers;
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast('Error fetching user data. Please try again.', 'error');
            throw error;
        }
    }

    // Render the users list in the table
    function renderUsersList(users) {
        usersListElement.innerHTML = '';
        
        if (users.length === 0) {
            const noResultsRow = document.createElement('tr');
            noResultsRow.innerHTML = `
                <td colspan="7" class="text-center">No researchers or reviewers found matching your criteria</td>
            `;
            usersListElement.appendChild(noResultsRow);
            return;
        }
        
        users.forEach((user, index) => {
            const userRow = document.createElement('tr');
            const displayId = index + 1;
            userRow.dataset.userId = user.id;
            
            const promotedRole = user['promoted-role'] || 'pending';
            const statusClass = promotedRole === 'Reviewer' ? 'status-active' : 
                              promotedRole === 'pending' ? 'status-pending' : 'status-inactive';
            
            const formattedRole = capitalizeFirstLetter(user.role || '');
            const formattedPromotedRole = capitalizeFirstLetter(promotedRole);
            
            const joinDate = user.created_at ? formatDate(user.created_at) : 'N/A';
            
            userRow.innerHTML = `
                <td>${displayId}</td>
                <td>${user.name || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td>${formattedRole}</td>
                <td><span class="status-badge ${statusClass}">${formattedPromotedRole}</span></td>
                <td>${joinDate}</td>
                <td class="table-actions">
                     <button class="btn view-btn" data-id="${user.id}"><i class="fas fa-eye"></i> View Details</button>
                </td>
            `;
            
            usersListElement.appendChild(userRow);
        });
        
        attachUserActionListeners();
    }

    // Set up event listeners
    function setupEventListeners() {
        document.getElementById('logout-btn').addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to log out?')) {
                // Clear session/local storage
                localStorage.removeItem('adminName');
                localStorage.removeItem('adminToken');

                // Replace current history state so user can't go "back"
                window.location.replace('../../../login.html');
            }
        });
    }
    // Set up event listeners
    function setupEventListeners() {
        // Search form submission
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            searchUsers();
        });
        
        // Close modal buttons - ensure we're attaching to all close buttons including dynamically created ones
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('close-modal') || e.target.closest('.close-modal')) {
                closeModal(viewProfileModal);
            }
        });
        
        // Promote user button
        promoteUserBtn.addEventListener('click', promoteToReviewer);
        
        // Logout button
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });

        // Close modal when clicking outside the content
        viewProfileModal.addEventListener('click', function(e) {
            if (e.target === viewProfileModal) {
                closeModal(viewProfileModal);
            }
        });
    }
    
    // Handle logout
    async function handleLogout() {
        try {
            const response = await fetch(API_ENDPOINTS.LOGOUT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                window.location.href = '/login';
            } else {
                showToast('Logout failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error during logout:', error);
            showToast('Error during logout. Please try again.', 'error');
        }
    }
    
    // Attach event listeners to user action buttons
    function attachUserActionListeners() {
        // View details buttons
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.dataset.id;
                openViewProfileModal(userId);
            });
        });
    }
   
    // Search users by name or email
    async function searchUsers() {
        const searchTerm = searchInputElement.value.trim();
        
        if (searchTerm === '') {
            currentUsers = [...allUsers];
            renderUsersList(currentUsers);
            return;
        }
        
        try {
            await fetchUsers({
                search: searchTerm
            });
        } catch (error) {
            console.error('Error searching users:', error);
            showToast('Error searching users. Please try again.', 'error');
        }
    }
    
    // Open the view profile modal with all user data
    function openViewProfileModal(userId) {
        const user = currentUsers.find(u => u.id == userId);
        
        if (!user) return;
        
        // Store the user ID for the promote button
        viewProfileModal.dataset.userId = user.id;
        
        // Format the promoted-role with appropriate styling
        const promotedRole = user['promoted-role'] || 'pending';
        const statusClass = promotedRole === 'Reviewer' ? 'status-active' : 
                          promotedRole === 'pending' ? 'status-pending' : 'status-inactive';
        
        // Format research areas if available
        let researchAreasHtml = '';
        if (user.research_area) {
            const researchAreas = user.research_area.split(',').map(area => area.trim());
            researchAreasHtml = `
                <div class="profile-section">
                    <h3>Research Areas</h3>
                    <ul class="profile-list">
                        ${researchAreas.map(area => `<li>${capitalizeFirstLetter(area)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Format qualifications if available
        let qualificationsHtml = '';
        if (user.qualifications) {
            qualificationsHtml = `
                <div class="profile-section">
                    <h3>Qualifications</h3>
                    <p>${user.qualifications}</p>
                </div>
            `;
        }
        
        // Format current project if available
        let currentProjectHtml = '';
        if (user.current_project) {
            currentProjectHtml = `
                <div class="profile-section">
                    <h3>Current Project</h3>
                    <p>${user.current_project}</p>
                </div>
            `;
        }
        
        // Combine all sections
        profileContent.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    <div class="avatar-placeholder">${getInitials(user.name)}</div>
                </div>
                <div class="profile-header-content">
                    <h2>${user.name || 'Unnamed User'}</h2>
                    <div class="user-meta">
                        <span class="role-badge">${capitalizeFirstLetter(user.role || 'User')}</span>
                        <span class="status-badge ${statusClass}">${capitalizeFirstLetter(promotedRole)}</span>
                    </div>
                    <p class="join-date">Member since ${formatDate(user.created_at)}</p>
                </div>
            </div>
            
            <div class="profile-section">
                <h3>Contact Information</h3>
                <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
                ${user.phone ? `<p><strong>Phone:</strong> ${user.phone}</p>` : ''}
            </div>
            
            <div class="profile-section">
                <h3>Academic Information</h3>
                ${user.department ? `<p><strong>Department:</strong> ${user.department}</p>` : ''}
                ${user.academic_role ? `<p><strong>Academic Role:</strong> ${user.academic_role}</p>` : ''}
            </div>
            
            ${qualificationsHtml}
            
            <div class="profile-section">
                <h3>Research Experience</h3>
                <p>${user.research_experience || '0'} years</p>
                <p><strong>Projects Created:</strong> ${user.projects_created || '0'}</p>
            </div>
            
            ${researchAreasHtml}
            
            ${currentProjectHtml}
            
            <div class="profile-section">
                <h3>Account Information</h3>
                <p><strong>User ID:</strong> ${user.id}</p>
                <p><strong>Last Updated:</strong> ${formatDate(user.updated_at)}</p>
            </div>
        `;
        
        // Update button text based on user role
        const userRole = (user.role || '').toLowerCase();
        const promotedRoleLower = promotedRole.toLowerCase();
        
        if (promoteUserBtn) {
            // Change button text based on user role
            if (userRole === 'reviewer') {
                promoteUserBtn.textContent = 'Activate Reviewer';
            } else {
                promoteUserBtn.textContent = 'Promote to Reviewer';
            }
            
            // Hide button if already promoted
            promoteUserBtn.style.display = promotedRoleLower !== 'reviewer' ? 'block' : 'none';
        }
        
        // Open the modal
        viewProfileModal.classList.add('active');
    }
    
    // Promote user to Reviewer - UPDATED FUNCTION
    async function promoteToReviewer() {
        const userId = viewProfileModal.dataset.userId;
        if (!userId) return;
        
        const user = currentUsers.find(u => u.id == userId);
        if (!user) return;
        
        const userRole = (user.role || '').toLowerCase();
        const confirmMessage = userRole === 'reviewer' 
            ? `Are you sure you want to activate ${user.name} as a Reviewer?` 
            : `Are you sure you want to promote ${user.name} to Reviewer?`;
        
        try {
            if (!confirm(confirmMessage)) {
                return;
            }
            
            // Get all current user data first
            const userData = { ...user };
            
            // Update only the promoted-role field
            userData['promoted-role'] = 'reviewer';
            
            // Use PUT method to update the user
            const response = await fetch(`${API_ENDPOINTS.USERS}/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const successMessage = userRole === 'reviewer'
                ? `${user.name} has been activated as a Reviewer`
                : `${user.name} has been promoted to Reviewer`;
                
            closeModal(viewProfileModal);
            await fetchUsers();
            showToast(successMessage, 'success');
        } catch (error) {
            console.error('Error updating user:', error);
            
            const errorMessage = userRole === 'reviewer'
                ? 'Error activating reviewer. Please try again.'
                : 'Error promoting user. Please try again.';
                
            showToast(errorMessage, 'error');
        }
    }
    
    // Close modal
    function closeModal(modal) {
        modal.classList.remove('active');
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
        
        setTimeout(() => {
            toast.classList.add('active');
        }, 10);
        
        const timeout = setTimeout(() => {
            removeToast(toast);
        }, duration);
        
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(timeout);
            removeToast(toast);
        });
    }
    
    function removeToast(toast) {
        toast.classList.remove('active');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }
    
    // Utility Functions
    
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
    
    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }
    
    // Initialize the page
    init();
});