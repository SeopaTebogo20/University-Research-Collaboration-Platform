// Admin User Management JavaScript - Updated to use API and profiles table schema
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const usersListElement = document.getElementById('users-list');
    const roleFilterElement = document.getElementById('role-filter');
    const promotedFilterElement = document.getElementById('promoted-filter'); // Updated from status to promoted
    const searchInputElement = document.getElementById('search-input');
    const filterForm = document.querySelector('.filter-form');
    const searchForm = document.querySelector('.search-form');
    const editUserModal = document.getElementById('edit-user-modal');
    const editUserForm = document.getElementById('edit-user-form');
    const saveUserBtn = document.getElementById('save-user-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);

    // Store the current filtered users
    let currentUsers = [];

    // Initialize the page
    async function init() {
        try {
            // Fetch users from API
            await fetchUsers();
            setupEventListeners();
        } catch (error) {
            console.error('Error initializing page:', error);
            showToast('Error loading users. Please refresh the page.', 'error');
        }
    }

    // Fetch users from API
    async function fetchUsers() {
        try {
            const response = await fetch('http://localhost:3000/api/users');
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const users = await response.json();
            currentUsers = users;
            renderUsersList(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast('Failed to load users from server', 'error');
            throw error;
        }
    }

    // Render the users list in the table
    function renderUsersList(users) {
        usersListElement.innerHTML = '';
        
        if (users.length === 0) {
            const noResultsRow = document.createElement('tr');
            noResultsRow.innerHTML = `
                <td colspan="8" class="text-center">No users found matching your criteria</td>
            `;
            usersListElement.appendChild(noResultsRow);
            return;
        }
        
        users.forEach((user, index) => {
            const userRow = document.createElement('tr');
            userRow.dataset.userId = user.id;
            
            // Use sequential number (index + 1) instead of database ID for display
            const displayNumber = index + 1;
            
            // Format the promoted status with appropriate styling
            const promotedClass = user.promoted_role ? 'status-active' : 'status-inactive';
            const promotedStatus = user.promoted_role ? 'Promoted' : 'Regular';
            
            // Format timestamps
            const createdDate = new Date(user.created_at);
            const formattedCreatedDate = formatDate(createdDate);
            
            userRow.innerHTML = `
                <td>${displayNumber}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role || 'N/A'}</td>
                <td>${user.department || 'N/A'}</td>
                <td>${user.academic_role || 'N/A'}</td>
                <td><span class="status-badge ${promotedClass}">${promotedStatus}</span></td>
                <td>${formattedCreatedDate}</td>
                <td class="table-actions">
                    <button class="btn btn-icon edit-user-btn" data-user-id="${user.id}" title="Edit User">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${!user.promoted_role ? 
                    `<button class="btn btn-icon promote-user-btn" data-user-id="${user.id}" title="Promote User">
                        <i class="fas fa-arrow-up"></i>
                    </button>` : 
                    `<button class="btn btn-icon demote-user-btn" data-user-id="${user.id}" title="Remove Promotion">
                        <i class="fas fa-arrow-down"></i>
                    </button>`}
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
            });
        });
        
        // Save user button
        saveUserBtn.addEventListener('click', saveUserChanges);
        
        // Logout button
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Handle logout
    async function handleLogout() {
        try {
            const response = await fetch('/api/logout', {
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
        // Edit user buttons
        document.querySelectorAll('.edit-user-btn').forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.dataset.userId;
                openEditUserModal(userId);
            });
        });
        
        // Promote user buttons
        document.querySelectorAll('.promote-user-btn').forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.dataset.userId;
                promoteUser(userId);
            });
        });
        
        // Demote user buttons
        document.querySelectorAll('.demote-user-btn').forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.dataset.userId;
                demoteUser(userId);
            });
        });
    }
    
    // Filter users based on selected criteria
    async function filterUsers() {
        const roleFilter = roleFilterElement.value;
        const promotedFilter = promotedFilterElement.value;
        
        try {
            // Build query parameters
            let queryParams = new URLSearchParams();
            
            if (roleFilter !== 'all') {
                queryParams.append('role', roleFilter);
            }
            
            if (promotedFilter !== 'all') {
                const isPromoted = promotedFilter === 'promoted';
                queryParams.append('promoted', isPromoted);
            }
            
            // Make API request with filters
            const queryString = queryParams.toString();
            const url = `http://localhost:3000/api/users${queryString ? '?' + queryString : ''}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Filter request failed with status ${response.status}`);
            }
            
            const filteredUsers = await response.json();
            currentUsers = filteredUsers;
            renderUsersList(currentUsers);
            
        } catch (error) {
            console.error('Error filtering users:', error);
            showToast('Error applying filters. Please try again.', 'error');
        }
    }
    
    // Search users by name or email
    async function searchUsers() {
        const searchTerm = searchInputElement.value.trim();
        
        if (searchTerm === '') {
            await fetchUsers(); // Reset to all users
            return;
        }
        
        try {
            const url = `http://localhost:3000/api/users?search=${encodeURIComponent(searchTerm)}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Search request failed with status ${response.status}`);
            }
            
            const searchResults = await response.json();
            currentUsers = searchResults;
            renderUsersList(currentUsers);
            
        } catch (error) {
            console.error('Error searching users:', error);
            showToast('Error performing search. Please try again.', 'error');
        }
    }
    
    // Open the edit user modal with the user's data
    async function openEditUserModal(userId) {
        try {
            // Get user details from the API
            const response = await fetch(`http://localhost:3000/api/users/${userId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch user details with status ${response.status}`);
            }
            
            const user = await response.json();
            
            // Populate form fields based on profiles table schema
            document.getElementById('edit-user-id').value = user.id;
            document.getElementById('edit-user-name').value = user.name || '';
            document.getElementById('edit-user-email').value = user.email || '';
            document.getElementById('edit-user-role').value = user.role || '';
            document.getElementById('edit-user-department').value = user.department || '';
            document.getElementById('edit-user-academic-role').value = user.academic_role || '';
            document.getElementById('edit-user-promoted').checked = user.promoted_role ? true : false;
            document.getElementById('edit-user-research-area').value = user.research_area || '';
            document.getElementById('edit-user-research-experience').value = user.research_experience || '';
            document.getElementById('edit-user-qualifications').value = user.qualifications || '';
            document.getElementById('edit-user-current-project').value = user.current_project || '';
            document.getElementById('edit-user-phone').value = user.phone || '';
            
            // Open the modal
            editUserModal.classList.add('active');
            
        } catch (error) {
            console.error('Error opening edit modal:', error);
            showToast('Failed to load user details', 'error');
        }
    }
    
    // Save user changes
    async function saveUserChanges() {
        const userId = document.getElementById('edit-user-id').value;
        
        // Prepare updated user data based on form values
        const updatedUser = {
            name: document.getElementById('edit-user-name').value,
            email: document.getElementById('edit-user-email').value,
            role: document.getElementById('edit-user-role').value,
            department: document.getElementById('edit-user-department').value,
            academic_role: document.getElementById('edit-user-academic-role').value,
            promoted_role: document.getElementById('edit-user-promoted').checked,
            research_area: document.getElementById('edit-user-research-area').value,
            research_experience: parseInt(document.getElementById('edit-user-research-experience').value) || 0,
            qualifications: document.getElementById('edit-user-qualifications').value,
            current_project: document.getElementById('edit-user-current-project').value,
            phone: document.getElementById('edit-user-phone').value
        };
        
        try {
            // Send update request to API
            const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedUser)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update user: ${errorText}`);
            }
            
            // Close the modal
            editUserModal.classList.remove('active');
            
            // Refresh user list to show updated data
            await fetchUsers();
            
            // Show success message
            showToast('User updated successfully', 'success');
            
        } catch (error) {
            console.error('Error updating user:', error);
            showToast('Failed to update user. Please try again.', 'error');
        }
    }
    
    // Promote a user
    async function promoteUser(userId) {
        try {
            const user = currentUsers.find(u => u.id === userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            if (confirm(`Are you sure you want to promote ${user.name || 'this user'}?`)) {
                const response = await fetch(`http://localhost:3000/api/users/${userId}/promote`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to promote user with status ${response.status}`);
                }
                
                // Refresh user list
                await fetchUsers();
                showToast(`User has been promoted`, 'success');
            }
        } catch (error) {
            console.error('Error promoting user:', error);
            showToast('Failed to promote user. Please try again.', 'error');
        }
    }
    
    // Demote a user
    async function demoteUser(userId) {
        try {
            const user = currentUsers.find(u => u.id === userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            if (confirm(`Are you sure you want to remove promotion for ${user.name || 'this user'}?`)) {
                const response = await fetch(`http://localhost:3000/api/users/${userId}/demote`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to demote user with status ${response.status}`);
                }
                
                // Refresh user list
                await fetchUsers();
                showToast(`Promotion has been removed`, 'info');
            }
        } catch (error) {
            console.error('Error demoting user:', error);
            showToast('Failed to remove promotion. Please try again.', 'error');
        }
    }
    
    // Close modal function
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
    function formatDate(dateObj) {
        return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    
    // Initialize the page
    init();
});