// Admin User Management JavaScript - Using API data
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const usersListElement = document.getElementById('users-list');
    const roleFilterElement = document.getElementById('role-filter');
    const statusFilterElement = document.getElementById('status-filter');
    const searchInputElement = document.getElementById('search-input');
    const filterForm = document.querySelector('.filter-form');
    const searchForm = document.querySelector('.search-form');
    const editUserModal = document.getElementById('edit-user-modal');
    const viewProfileModal = document.getElementById('view-profile-modal');
    const profileContent = document.getElementById('profile-content');
    const editUserForm = document.getElementById('edit-user-form');
    const saveUserBtn = document.getElementById('save-user-btn');
    const promoteUserBtn = document.getElementById('promote-user-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);

    // API Endpoints - Dynamically select between local and production URLs
    const isLocalEnvironment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1';
    
    const BASE_URL = isLocalEnvironment 
        ? 'http://localhost:3000' 
        : 'https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net';
    
    console.log(`Running in ${isLocalEnvironment ? 'local' : 'production'} environment: ${BASE_URL}`);
    
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
        }
    }

    // Fetch users from API
    async function fetchUsers(filters = {}) {
        try {
            // Build query parameters for filtering
            const queryParams = new URLSearchParams();
            
            if (filters.role && filters.role !== 'all') {
                queryParams.append('role', filters.role);
            }
            
            if (filters.promotedRole && filters.promotedRole !== 'all') {
                queryParams.append('promoted-role', filters.promotedRole);
            }
            
            if (filters.search) {
                queryParams.append('search', filters.search);
            }
            
            // Create URL with query parameters
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
            allUsers = data;
            currentUsers = [...data];
            renderUsersList(currentUsers);
            
            return data;
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
                <td colspan="7" class="text-center">No users found matching your criteria</td>
            `;
            usersListElement.appendChild(noResultsRow);
            return;
        }
        
        // Generate sequential display IDs starting from 1
        users.forEach((user, index) => {
            const userRow = document.createElement('tr');
            const displayId = index + 1; // Sequential ID starting from 1
            userRow.dataset.userId = user.id; // Keep original ID for API operations
            
            // Format the promoted-role with appropriate styling
            const promotedRole = user['promoted-role'] || 'pending'; // Default to pending if not specified
            const statusClass = promotedRole === 'active' ? 'status-active' : 
                              promotedRole === 'pending' ? 'status-pending' : 'status-inactive';
            
            // Capitalize the first letter of the role and promoted-role
            const formattedRole = capitalizeFirstLetter(user.role || '');
            const formattedPromotedRole = capitalizeFirstLetter(promotedRole);
            
            // Format join date based on created_at field
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
        
        // Attach event listeners to the newly created buttons
        attachUserActionListeners();
    }

    // Set up event listeners
    function setupEventListeners() {
        // Filter form submission
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            filterUsers();
        });
        
        // Search form submission
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            searchUsers();
        });
        
        // Close modal buttons
        closeModalButtons.forEach(button => {
            button.addEventListener('click', function() {
                closeModal(editUserModal);
                closeModal(viewProfileModal);
            });
        });
        
        // Save user button
        saveUserBtn.addEventListener('click', saveUserChanges);

        // Promote user button (if exists)
        if (promoteUserBtn) {
            promoteUserBtn.addEventListener('click', promoteToReviewer);
        }
        
        // Logout button
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
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
        // View profile buttons
        document.querySelectorAll('.view-profile-btn').forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.dataset.userId;
                openViewProfileModal(userId);
            });
        });
        
        // Deactivate user buttons
        document.querySelectorAll('.deactivate-user-btn').forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.dataset.userId;
                deactivateUser(userId);
            });
        });
        
        // Activate user buttons
        document.querySelectorAll('.activate-user-btn').forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.dataset.userId;
                activateUser(userId);
            });
        });
    }
    
    // Filter users based on selected criteria
    async function filterUsers() {
        const roleFilter = roleFilterElement.value;
        const promotedRoleFilter = statusFilterElement.value; // Status filter controls promoted-role
        
        try {
            await fetchUsers({
                role: roleFilter,
                promotedRole: promotedRoleFilter
            });
        } catch (error) {
            console.error('Error filtering users:', error);
            showToast('Error applying filters. Please try again.', 'error');
        }
    }
   
    // Search users by name or email
    async function searchUsers() {
        const searchTerm = searchInputElement.value.trim();
        
        if (searchTerm === '') {
            // If search term is empty, reset to all users
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
        
        // Format the data for display
        const promotedRole = user['promoted-role'] || 'pending';
        const statusClass = promotedRole === 'active' ? 'status-active' : 
                          promotedRole === 'pending' ? 'status-pending' : 'status-inactive';
        
        // Create formatted expertise list if available
        let expertiseHtml = '';
        if (user.research_area) {
            const expertiseAreas = user.research_area.split(',').map(area => area.trim());
            expertiseHtml = `
                <div class="profile-section">
                    <h3>Research Areas</h3>
                    <ul class="profile-list">
                        ${expertiseAreas.map(area => `<li>${capitalizeFirstLetter(area)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Create department and academic_role section if available
        let additionalInfoHtml = '';
        if (user.department || user.academic_role) {
            additionalInfoHtml = `
                <div class="profile-section">
                    <h3>Academic Information</h3>
                    ${user.department ? `<p><strong>Department:</strong> ${user.department}</p>` : ''}
                    ${user.academic_role ? `<p><strong>Academic Role:</strong> ${user.academic_role}</p>` : ''}
                </div>
            `;
        }
        
        // Create qualifications section if available
        let qualificationsHtml = '';
        if (user.qualifications) {
            qualificationsHtml = `
                <div class="profile-section">
                    <h3>Qualifications</h3>
                    <p>${user.qualifications}</p>
                </div>
            `;
        }
        
        // Create research experience section if available
        let experienceHtml = '';
        if (user.research_experience) {
            experienceHtml = `
                <div class="profile-section">
                    <h3>Research Experience</h3>
                    <p>${user.research_experience} years</p>
                </div>
            `;
        }
        
        // Create current project section if available
        let projectHtml = '';
        if (user.current_project) {
            projectHtml = `
                <div class="profile-section">
                    <h3>Current Project</h3>
                    <p>${user.current_project}</p>
                </div>
            `;
        }
        
        // Create contact info section
        let contactHtml = `
            <div class="profile-section">
                <h3>Contact Information</h3>
                <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
                ${user.phone ? `<p><strong>Phone:</strong> ${user.phone}</p>` : ''}
            </div>
        `;
        
        // Combine all sections
        profileContent.innerHTML = `
            <div class="profile-header">
                <h2>${user.name || 'Unnamed User'}</h2>
                <div class="user-meta">
                    <span class="role-badge">${capitalizeFirstLetter(user.role || 'User')}</span>
                    <span class="status-badge ${statusClass}">${capitalizeFirstLetter(promotedRole)}</span>
                </div>
                <p class="join-date">Member since ${formatDate(user.created_at)}</p>
            </div>
            
            ${contactHtml}
            ${additionalInfoHtml}
            ${qualificationsHtml}
            ${experienceHtml}
            ${expertiseHtml}
            ${projectHtml}
        `;
        
        // Show or hide promote button based on current role and promoted-role
        const promoteBtn = document.getElementById('promote-user-btn');
        if (promoteBtn) {
            // Only show promote button if user isn't already a reviewer and isn't inactive
            const canPromote = user.role !== 'reviewer' && promotedRole !== 'inactive';
            promoteBtn.style.display = canPromote ? 'block' : 'none';
        }
        
        // Open the modal
        viewProfileModal.classList.add('active');
    }
    
    // Promote user to Reviewer
    async function promoteToReviewer() {
        const userId = viewProfileModal.dataset.userId;
        if (!userId) return;
        
        const user = currentUsers.find(u => u.id == userId);
        if (!user) return;
        
        try {
            // Update the user's promoted-role to reviewer
            const response = await fetch(`${API_ENDPOINTS.USERS}/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 'promoted-role': 'reviewer' }),
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            // Close the modal
            closeModal(viewProfileModal);
            
            // Refresh the user list
            await fetchUsers();
            
            // Show success message
            showToast(`${user.name} has been promoted to Reviewer`, 'success');
        } catch (error) {
            console.error('Error promoting user:', error);
            showToast('Error promoting user. Please try again.', 'error');
        }
    }
    
    // Open the edit user modal with the user's data
    function openEditUserModal(userId) {
        const user = currentUsers.find(u => u.id == userId);
        
        if (!user) return;
        
        // Populate form fields
        document.getElementById('edit-user-id').value = user.id;
        document.getElementById('edit-user-name').value = user.name || '';
        document.getElementById('edit-user-email').value = user.email || '';
        document.getElementById('edit-user-role').value = user.role || 'researcher';
        document.getElementById('edit-user-status').value = user.status || 'active';
        
        // Clear all expertise checkboxes first
        document.querySelectorAll('#expertise-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Check the user's expertise areas if they exist
        const expertise = user.research_area ? user.research_area.split(',') : [];
        expertise.forEach(area => {
            const normalizedArea = area.trim().toLowerCase().replace(/\s+/g, '-');
            const checkbox = document.querySelector(`#expertise-options input[value="${normalizedArea}"]`);
            if (checkbox) checkbox.checked = true;
        });
        
        // Show or hide expertise options based on role
        const expertiseFieldset = document.querySelector('fieldset.form-group:nth-of-type(2)');
        expertiseFieldset.style.display = user.role === 'reviewer' ? 'block' : 'none';
        
        // Add change event listener to role select to show/hide expertise options
        document.getElementById('edit-user-role').addEventListener('change', function() {
            expertiseFieldset.style.display = this.value === 'reviewer' ? 'block' : 'none';
        });
        
        // Open the modal
        editUserModal.classList.add('active');
    }
    
    // Save user changes
    async function saveUserChanges() {
        const userId = document.getElementById('edit-user-id').value;
        
        // Gather updated user data
        const updatedUserData = {
            name: document.getElementById('edit-user-name').value,
            email: document.getElementById('edit-user-email').value,
            role: document.getElementById('edit-user-role').value,
            status: document.getElementById('edit-user-status').value
        };
        
        // Add expertise areas if user is a reviewer
        if (updatedUserData.role === 'reviewer') {
            const expertiseAreas = [];
            document.querySelectorAll('#expertise-options input[type="checkbox"]:checked').forEach(checkbox => {
                expertiseAreas.push(checkbox.value);
            });
            
            updatedUserData.research_area = expertiseAreas.join(',');
        }
        
        try {
            const response = await fetch(`${API_ENDPOINTS.USERS}/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedUserData),
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            // Close the modal
            editUserModal.classList.remove('active');
            
            // Refresh the user list
            await fetchUsers();
            
            // Show success message
            showToast('User updated successfully', 'success');
        } catch (error) {
            console.error('Error updating user:', error);
            showToast('Error updating user. Please try again.', 'error');
        }
    }
    
    // Deactivate a user
    async function deactivateUser(userId) {
        const user = currentUsers.find(u => u.id == userId);
        
        if (!user) return;
        
        // Confirm before deactivating
        if (confirm(`Are you sure you want to deactivate ${user.name}?`)) {
            try {
                const response = await fetch(`${API_ENDPOINTS.USERS}/${userId}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: 'inactive' }),
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                // Refresh the user list
                await fetchUsers();
                
                // Show success message
                showToast(`${user.name} has been deactivated`, 'info');
            } catch (error) {
                console.error('Error deactivating user:', error);
                showToast('Error deactivating user. Please try again.', 'error');
            }
        }
    }
    
    // Activate a user
    async function activateUser(userId) {
        const user = currentUsers.find(u => u.id == userId);
        
        if (!user) return;
        
        try {
            const response = await fetch(`${API_ENDPOINTS.USERS}/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'active' }),
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            // Refresh the user list
            await fetchUsers();
            
            // Show success message
            showToast(`${user.name} has been activated`, 'success');
        } catch (error) {
            console.error('Error activating user:', error);
            showToast('Error activating user. Please try again.', 'error');
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
    
    // Utility Functions
    
    // Format date to a more readable format
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    
    // Capitalize the first letter of a string
    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Error handler for fetch calls
    function handleFetchError(error, message) {
        console.error(error);
        showToast(message, 'error');
    }
    
    // Initialize the page
    init();
});