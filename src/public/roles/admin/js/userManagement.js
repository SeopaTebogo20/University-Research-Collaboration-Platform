// Admin User Management JavaScript - Updated to match dashboard style
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const usersListElement = document.getElementById('users-list');
    const roleFilterElement = document.getElementById('role-filter');
    const statusFilterElement = document.getElementById('status-filter');
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

    // Mock User Data
    const mockUsers = [
        { 
            id: 1, 
            name: 'Dr. Sarah Johnson', 
            email: 'sarah.johnson@university.edu', 
            role: 'researcher', 
            status: 'active', 
            joinDate: '2024-09-15',
            expertise: []
        },
        { 
            id: 2, 
            name: 'Prof. Michael Chen', 
            email: 'mchen@research.org', 
            role: 'reviewer', 
            status: 'active', 
            joinDate: '2024-08-23',
            expertise: ['computer-science', 'medicine']
        },
        { 
            id: 3, 
            name: 'Dr. Emily Rodriguez', 
            email: 'rodriguez@science.edu', 
            role: 'researcher', 
            status: 'active', 
            joinDate: '2024-10-05',
            expertise: []
        },
        { 
            id: 4, 
            name: 'Dr. James Wilson', 
            email: 'jwilson@institute.org', 
            role: 'reviewer', 
            status: 'active', 
            joinDate: '2024-09-10',
            expertise: ['biology', 'medicine']
        },
        { 
            id: 5, 
            name: 'Admin User', 
            email: 'admin@collabnexus.com', 
            role: 'admin', 
            status: 'active', 
            joinDate: '2024-01-01',
            expertise: []
        },
        { 
            id: 6, 
            name: 'Dr. Lisa Martinez', 
            email: 'lmartinez@university.edu', 
            role: 'researcher', 
            status: 'pending', 
            joinDate: '2024-10-18',
            expertise: []
        },
        { 
            id: 7, 
            name: 'Prof. Robert Taylor', 
            email: 'rtaylor@research.org', 
            role: 'reviewer', 
            status: 'inactive', 
            joinDate: '2024-07-12',
            expertise: ['physics', 'economics']
        }
    ];

    // Store the current filtered users
    let currentUsers = [...mockUsers];

    // Initialize the page
    function init() {
        renderUsersList(currentUsers);
        setupEventListeners();
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
        
        users.forEach(user => {
            const userRow = document.createElement('tr');
            userRow.dataset.userId = user.id;
            
            // Format the status with appropriate styling
            const statusClass = user.status === 'active' ? 'status-active' : 
                              user.status === 'pending' ? 'status-pending' : 'status-inactive';
            
            // Capitalize the first letter of the role and status
            const formattedRole = capitalizeFirstLetter(user.role);
            const formattedStatus = capitalizeFirstLetter(user.status);
            
            userRow.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${formattedRole}</td>
                <td><span class="status-badge ${statusClass}">${formattedStatus}</span></td>
                <td>${formatDate(user.joinDate)}</td>
                <td class="table-actions">
                    <button class="btn btn-icon edit-user-btn" data-user-id="${user.id}" title="Edit User">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${user.status !== 'inactive' ? 
                    `<button class="btn btn-icon deactivate-user-btn" data-user-id="${user.id}" title="Deactivate User">
                        <i class="fas fa-user-slash"></i>
                    </button>` : 
                    `<button class="btn btn-icon activate-user-btn" data-user-id="${user.id}" title="Activate User">
                        <i class="fas fa-user-check"></i>
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
                const userId = parseInt(this.dataset.userId);
                openEditUserModal(userId);
            });
        });
        
        // Deactivate user buttons
        document.querySelectorAll('.deactivate-user-btn').forEach(button => {
            button.addEventListener('click', function() {
                const userId = parseInt(this.dataset.userId);
                deactivateUser(userId);
            });
        });
        
        // Activate user buttons
        document.querySelectorAll('.activate-user-btn').forEach(button => {
            button.addEventListener('click', function() {
                const userId = parseInt(this.dataset.userId);
                activateUser(userId);
            });
        });
    }
    
    // Filter users based on selected criteria
    function filterUsers() {
        const roleFilter = roleFilterElement.value;
        const statusFilter = statusFilterElement.value;
        
        let filteredUsers = [...mockUsers];
        
        // Apply role filter if not 'all'
        if (roleFilter !== 'all') {
            filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
        }
        
        // Apply status filter if not 'all'
        if (statusFilter !== 'all') {
            filteredUsers = filteredUsers.filter(user => user.status === statusFilter);
        }
        
        currentUsers = filteredUsers;
        renderUsersList(currentUsers);
    }
    
    // Search users by name or email
    function searchUsers() {
        const searchTerm = searchInputElement.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            currentUsers = [...mockUsers];
        } else {
            currentUsers = mockUsers.filter(user => 
                user.name.toLowerCase().includes(searchTerm) || 
                user.email.toLowerCase().includes(searchTerm)
            );
        }
        
        renderUsersList(currentUsers);
    }
    
    // Open the edit user modal with the user's data
    function openEditUserModal(userId) {
        const user = mockUsers.find(u => u.id === userId);
        
        if (!user) return;
        
        // Populate form fields
        document.getElementById('edit-user-id').value = user.id;
        document.getElementById('edit-user-name').value = user.name;
        document.getElementById('edit-user-email').value = user.email;
        document.getElementById('edit-user-role').value = user.role;
        document.getElementById('edit-user-status').value = user.status;
        
        // Clear all expertise checkboxes first
        document.querySelectorAll('#expertise-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Check the user's expertise areas
        user.expertise.forEach(expertiseArea => {
            const checkbox = document.querySelector(`#expertise-options input[value="${expertiseArea}"]`);
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
    function saveUserChanges() {
        const userId = parseInt(document.getElementById('edit-user-id').value);
        const user = mockUsers.find(u => u.id === userId);
        
        if (!user) return;
        
        // Update user data
        user.name = document.getElementById('edit-user-name').value;
        user.email = document.getElementById('edit-user-email').value;
        user.role = document.getElementById('edit-user-role').value;
        user.status = document.getElementById('edit-user-status').value;
        
        // Update expertise areas if user is a reviewer
        if (user.role === 'reviewer') {
            user.expertise = [];
            document.querySelectorAll('#expertise-options input[type="checkbox"]:checked').forEach(checkbox => {
                user.expertise.push(checkbox.value);
            });
        } else {
            user.expertise = [];
        }
        
        // Close the modal and update the UI
        editUserModal.classList.remove('active');
        renderUsersList(currentUsers);
        
        // Show success message
        showToast('User updated successfully', 'success');
    }
    
    // Deactivate a user
    function deactivateUser(userId) {
        const user = mockUsers.find(u => u.id === userId);
        
        if (!user) return;
        
        // Confirm before deactivating
        if (confirm(`Are you sure you want to deactivate ${user.name}?`)) {
            user.status = 'inactive';
            renderUsersList(currentUsers);
            showToast(`${user.name} has been deactivated`, 'info');
        }
    }
    
    // Activate a user
    function activateUser(userId) {
        const user = mockUsers.find(u => u.id === userId);
        
        if (!user) return;
        
        user.status = 'active';
        renderUsersList(currentUsers);
        showToast(`${user.name} has been activated`, 'success');
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
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Initialize the page
    init();
});