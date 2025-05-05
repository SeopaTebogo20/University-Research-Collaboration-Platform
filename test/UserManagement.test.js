/**
 * @jest-environment jsdom
 */

// First, set up the document body with the admin user management HTML
document.body.innerHTML = `
  <section class="search-form-container">
    <form class="search-form">
      <input type="text" id="search-input" placeholder="Search users..." class="styled-input">
      <button type="submit" class="btn btn-primary">Search</button>
    </form>
  </section>
  
  <section class="users-table-container">
    <table class="users-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Promoted Role</th>
          <th>Join Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="users-list">
        <!-- User rows will be populated here -->
      </tbody>
    </table>
  </section>
  
  <button id="logout-btn" class="btn btn-secondary">Logout</button>
`;

// Mock necessary DOM APIs and functions
window.location = {
  href: '',
  search: '',
  replace: jest.fn(),
  hostname: 'localhost'
};

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn().mockImplementation(key => store[key] || null),
    setItem: jest.fn().mockImplementation((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn().mockImplementation(key => {
      delete store[key];
    }),
    clear: jest.fn().mockImplementation(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock console.error
console.error = jest.fn();

// Mock fetch API
global.fetch = jest.fn();

// Mock confirm function
window.confirm = jest.fn();

// Create a mock for the toast container
const toastContainer = document.createElement('section');
toastContainer.id = 'toast-container';
document.body.appendChild(toastContainer);

// Define our test users data
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'researcher',
    'promoted-role': 'pending',
    created_at: '2024-01-15T12:00:00Z',
    updated_at: '2024-01-15T12:00:00Z',
    department: 'Computer Science',
    academic_role: 'Professor',
    qualifications: 'PhD in Computer Science',
    research_experience: '10',
    projects_created: '5',
    research_area: 'Artificial Intelligence, Machine Learning',
    current_project: 'Neural Network Research'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'reviewer',
    'promoted-role': 'reviewer',
    created_at: '2023-10-10T09:00:00Z',
    updated_at: '2023-12-01T10:00:00Z',
    department: 'Biology',
    academic_role: 'Associate Professor',
    qualifications: 'PhD in Biology',
    research_experience: '8',
    projects_created: '3',
    research_area: 'Molecular Biology',
    current_project: 'Gene Therapy Research'
  },
  {
    id: '3',
    name: 'Sam Wilson',
    email: 'sam.wilson@example.com',
    role: 'researcher',
    'promoted-role': 'reviewer',
    created_at: '2024-02-20T14:00:00Z',
    updated_at: '2024-04-01T16:00:00Z',
    department: 'Physics',
    academic_role: 'Assistant Professor',
    qualifications: 'PhD in Theoretical Physics',
    research_experience: '5',
    projects_created: '2',
    research_area: 'Quantum Physics, Particle Physics',
    current_project: 'Quantum Computing Research'
  }
];

// Helper function to setup modal for tests
function setupModal() {
  const viewProfileModal = document.createElement('section');
  viewProfileModal.id = 'view-profile-modal';
  viewProfileModal.className = 'modal';
  viewProfileModal.innerHTML = `
      <section class="modal-content">
          <button class="close-modal">&times;</button>
          <section id="profile-content" class="profile-content"></section>
          <section class="modal-actions">
              <button id="promote-user-btn" class="btn btn-primary">Promote to Reviewer</button>
          </section>
      </section>
  `;
  document.body.appendChild(viewProfileModal);
  
  return viewProfileModal;
}

// Import the functions from the admin user management script
let adminUserManagement;

// Define our initialization function
function initAdminUserManagement() {
  // Simulate the initialization of the admin user management script
  adminUserManagement = (function() {
    // DOM Elements
    const usersListElement = document.getElementById('users-list');
    const searchInputElement = document.getElementById('search-input');
    const searchForm = document.querySelector('.search-form');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Setup modal if not already present
    let viewProfileModal = document.getElementById('view-profile-modal');
    if (!viewProfileModal) {
      viewProfileModal = setupModal();
    }
    
    const profileContent = document.getElementById('profile-content');
    const promoteUserBtn = document.getElementById('promote-user-btn');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
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

    // Store users data
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

    // Render the users list
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
        const statusClass = promotedRole === 'reviewer' ? 'status-active' : 
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
      // Search form submission
      searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        searchUsers();
      });
      
      // Close modal buttons
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
        if (confirm('Are you sure you want to log out?')) {
          // Clear session/local storage
          localStorage.removeItem('adminName');
          localStorage.removeItem('adminToken');

          // Replace current history state so user can't go "back"
          window.location.replace('../../../login.html');
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
    
    // Search users
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
    
    // Open the view profile modal
    function openViewProfileModal(userId) {
      const user = currentUsers.find(u => u.id == userId);
      
      if (!user) return;
      
      // Store the user ID for the promote button
      viewProfileModal.dataset.userId = user.id;
      
      // Format the promoted-role with appropriate styling
      const promotedRole = user['promoted-role'] || 'pending';
      const statusClass = promotedRole === 'reviewer' ? 'status-active' : 
                        promotedRole === 'pending' ? 'status-pending' : 'status-inactive';
      
      // Format research areas if available
      let researchAreasHtml = '';
      if (user.research_area) {
        const researchAreas = user.research_area.split(',').map(area => area.trim());
        researchAreasHtml = `
            <section class="profile-section">
                <h3>Research Areas</h3>
                <ul class="profile-list">
                    ${researchAreas.map(area => `<li>${capitalizeFirstLetter(area)}</li>`).join('')}
                </ul>
            </section>
        `;
      }
      
      // Format qualifications if available
      let qualificationsHtml = '';
      if (user.qualifications) {
        qualificationsHtml = `
            <section class="profile-section">
                <h3>Qualifications</h3>
                <p>${user.qualifications}</p>
            </section>
        `;
      }
      
      // Format current project if available
      let currentProjectHtml = '';
      if (user.current_project) {
        currentProjectHtml = `
            <section class="profile-section">
                <h3>Current Project</h3>
                <p>${user.current_project}</p>
            </section>
        `;
      }
      
      // Combine all sections
      profileContent.innerHTML = `
        <section class="profile-header">
            <section class="profile-avatar">
                <section class="avatar-placeholder">${getInitials(user.name)}</section>
            </section>
            <section class="profile-header-content">
                <h2>${user.name || 'Unnamed User'}</h2>
                <section class="user-meta">
                    <span class="role-badge">${capitalizeFirstLetter(user.role || 'User')}</span>
                    <span class="status-badge ${statusClass}">${capitalizeFirstLetter(promotedRole)}</span>
                </section>
                <p class="join-date">Member since ${formatDate(user.created_at)}</p>
            </section>
        </section>
        
        <section class="profile-section">
            <h3>Contact Information</h3>
            <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
            ${user.phone ? `<p><strong>Phone:</strong> ${user.phone}</p>` : ''}
        </section>
        
        <section class="profile-section">
            <h3>Academic Information</h3>
            ${user.department ? `<p><strong>Department:</strong> ${user.department}</p>` : ''}
            ${user.academic_role ? `<p><strong>Academic Role:</strong> ${user.academic_role}</p>` : ''}
        </section>
        
        ${qualificationsHtml}
        
        <section class="profile-section">
            <h3>Research Experience</h3>
            <p>${user.research_experience || '0'} years</p>
            <p><strong>Projects Created:</strong> ${user.projects_created || '0'}</p>
        </section>
        
        ${researchAreasHtml}
        
        ${currentProjectHtml}
        
        <section class="profile-section">
            <h3>Account Information</h3>
            <p><strong>User ID:</strong> ${user.id}</p>
            <p><strong>Last Updated:</strong> ${formatDate(user.updated_at)}</p>
        </section>
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
    
    // Promote user to Reviewer
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
      const toast = document.createElement('section');
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
        <section class="toast-icon">${icon}</section>
        <section class="toast-content">
            <section class="toast-message">${message}</section>
        </section>
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

    // Public API
    return {
      init,
      fetchUsers,
      renderUsersList,
      searchUsers,
      openViewProfileModal,
      promoteToReviewer,
      handleLogout,
      showToast,
      formatDate,
      capitalizeFirstLetter,
      getInitials,
      // For testing
      get allUsers() { return allUsers; },
      get currentUsers() { return currentUsers; },
      set allUsers(users) { allUsers = users; },
      set currentUsers(users) { currentUsers = users; }
    };
  })();

  // Initialize the application
  adminUserManagement.init();
  
  return adminUserManagement;
}

// Setup before all tests
beforeAll(() => {
  // Setup mocks for fetch API
  global.fetch.mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockUsers)
    })
  );
  
  // Initialize admin user management
  adminUserManagement = initAdminUserManagement();
});

describe('Admin User Management', () => {
  beforeEach(() => {
    // Reset mocks and DOM state
    jest.clearAllMocks();
    document.getElementById('search-input').value = '';
    document.getElementById('users-list').innerHTML = '';
    
    // Reset admin user management state
    adminUserManagement.allUsers = [];
    adminUserManagement.currentUsers = [];
  });

  test('should fetch and render users list', async () => {
    // Arrange
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUsers)
      })
    );
    
    // Act
    await adminUserManagement.fetchUsers();
    
    // Assert
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
    );
    
    const userRows = document.querySelectorAll('#users-list tr');
    expect(userRows.length).toBe(mockUsers.length);
    
    // Check if first user data is rendered correctly
    expect(userRows[0].innerHTML).toContain(mockUsers[0].name);
    expect(userRows[0].innerHTML).toContain(mockUsers[0].email);
  });

  test('should search users based on search term', async () => {
    // Arrange
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUsers)
      })
    ).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([mockUsers[0]])
      })
    );
    
    // First load all users
    await adminUserManagement.fetchUsers();
    
    // Act - Set search term and perform search
    const searchInput = document.getElementById('search-input');
    searchInput.value = 'John';
    
    const searchForm = document.querySelector('.search-form');
    searchForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    
    // Assert
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users?search=John',
      expect.anything()
    );
  });

  test('should open user profile modal when view button is clicked', async () => {
    // Arrange
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUsers)
      })
    );
    
    await adminUserManagement.fetchUsers();
    
    // Act
    const viewButton = document.querySelector('.view-btn');
    viewButton.click();
    
    // Assert
    const modal = document.getElementById('view-profile-modal');
    expect(modal.classList.contains('active')).toBeTruthy();
    
    const profileContent = document.getElementById('profile-content');
    expect(profileContent.innerHTML).toContain(mockUsers[0].name);
    expect(profileContent.innerHTML).toContain(mockUsers[0].email);
  });

  test('should close modal when close button is clicked', async () => {
    // Arrange
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUsers)
      })
    );
    
    await adminUserManagement.fetchUsers();
    
    const viewButton = document.querySelector('.view-btn');
    viewButton.click();
    
    const modal = document.getElementById('view-profile-modal');
    expect(modal.classList.contains('active')).toBeTruthy();
    
    // Act
    const closeButton = document.querySelector('.close-modal');
    closeButton.click();
    
    // Assert
    expect(modal.classList.contains('active')).toBeFalsy();
  });

  test('should promote user to reviewer', async () => {
    // Arrange
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUsers)
      })
    ).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'User updated successfully' })
      })
    ).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUsers.map(user => 
          user.id === '1' ? { ...user, 'promoted-role': 'reviewer' } : user
        ))
      })
    );
    
    window.confirm.mockImplementation(() => true);
    
    await adminUserManagement.fetchUsers();
    
    // Open modal for the first user
    adminUserManagement.openViewProfileModal('1');
    
    // Act
    const promoteButton = document.getElementById('promote-user-btn');
    promoteButton.click();
    
    // Assert
    expect(window.confirm).toHaveBeenCalledWith(
      `Are you sure you want to promote ${mockUsers[0].name} to Reviewer?`
    );
    
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users/1',
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: expect.stringContaining('"promoted-role":"reviewer"'),
        credentials: 'include'
      })
    );
    
    // Check if toast was shown
    const toast = document.querySelector('.toast');
    expect(toast).toBeTruthy();
    expect(toast.innerHTML).toContain(`${mockUsers[0].name} has been promoted to Reviewer`);
  });

  test('should handle logout', async () => {
    // Arrange
    window.confirm.mockImplementation(() => true);
    
    // Act
    adminUserManagement.handleLogout();
    
    // Assert
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to log out?');
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('adminName');
    expect(localStorage.removeItem).toHaveBeenCalledWith('adminToken');
    expect(window.location.replace).toHaveBeenCalledWith('../../../login.html');
  });

  test('should cancel promotion when user rejects confirmation', async () => {
    // Arrange
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUsers)
      })
    );
    
    window.confirm.mockImplementation(() => false);
    
    await adminUserManagement.fetchUsers();
    
    // Open modal for the first user
    adminUserManagement.openViewProfileModal('1');
    
    // Act
    const promoteButton = document.getElementById('promote-user-btn');
    promoteButton.click();
    
    // Assert
    expect(window.confirm).toHaveBeenCalledWith(
      `Are you sure you want to promote ${mockUsers[0].name} to Reviewer?`
    );
    
    // Check that the fetch was not called for promotion
    expect(global.fetch).not.toHaveBeenCalledWith(
      'http://localhost:3000/api/users/1',
      expect.objectContaining({
        method: 'PUT'
      })
    );
  });

  test('should handle API errors during user fetch', async () => {
    // Arrange
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })
    );
    
    // Act & Assert
    await expect(adminUserManagement.fetchUsers()).rejects.toThrow('API error: 500');
    
    // Check if error toast was shown
    const toast = document.querySelector('.toast');
    expect(toast).toBeTruthy();
    expect(toast.className).toContain('toast-error');
    expect(toast.innerHTML).toContain('Error fetching user data');
  });
});