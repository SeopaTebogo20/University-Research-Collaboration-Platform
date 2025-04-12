/**
 * @jest-environment jsdom
 */

// First, setup the HTML structure needed for tests
document.body.innerHTML = `
  <div class="auth-buttons"></div>
  <div class="mobile-auth-buttons"></div>
  
  <div class="researcher-only">Researcher content</div>
  <div class="reviewer-only">Reviewer content</div>
  <div class="admin-only">Admin content</div>
  
  <h1 class="dashboard-title">Dashboard</h1>
  <p class="welcome-message">Welcome</p>
  
  <form id="loginForm"></form>
`;

// Mock local storage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    store
  };
})();

// Apply mocks
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

global.fetch = jest.fn(() => 
  Promise.resolve({
    json: () => Promise.resolve({ message: 'Success' })
  })
);

// Mock toast notifications
window.toast = {
  success: jest.fn(),
  error: jest.fn()
};

// Mock location
const originalLocation = window.location;
delete window.location;
window.location = { 
  href: '/',
  pathname: '/',
  search: '',
  reload: jest.fn()
};

// Setup URLSearchParams mock
global.URLSearchParams = jest.fn().mockImplementation(searchStr => {
  const params = {};
  return {
    has: jest.fn(key => key in params),
    get: jest.fn(key => params[key] || null)
  };
});

// Import the code under test (inline it for testing)
const setupAuthJS = () => {
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize with global authManager if available
    const auth = window.authManager || {
      // Check if user is logged in
      isLoggedIn: function() {
        return localStorage.getItem('supabaseUser') !== null;
      },
      
      // Get current user
      getCurrentUser: function() {
        const userData = localStorage.getItem('supabaseUser');
        return userData ? JSON.parse(userData) : null;
      },
      
      // Get user's role
      getUserRole: function() {
        const user = this.getCurrentUser();
        return user?.user_metadata?.role || null;
      },
      
      // Handle logout
      logout: async function() {
        try {
          const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          localStorage.removeItem('supabaseUser');
          console.log('User logged out successfully');
          
          // Show logout success message
          if (window.toast) {
            window.toast.success('You have been signed out successfully');
          }
          
          // Redirect to home page if on a protected page
          const currentPage = window.location.pathname;
          const protectedPages = ['/dashboard', '/projects', '/profile'];
          
          if (protectedPages.some(page => currentPage.includes(page))) {
            window.location.href = '/';
          } else {
            // Just reload the current page
            window.location.reload();
          }
        } catch (error) {
          console.error('Logout error:', error);
          if (window.toast) {
            window.toast.error('An error occurred during logout');
          }
        }
      }
    };
    
    // Update UI based on login status
    function updateLoginUI() {
      const authButtons = document.querySelectorAll('.auth-buttons, .mobile-auth-buttons');
      
      if (auth.isLoggedIn()) {
        const userData = auth.getCurrentUser();
        const name = userData.user_metadata?.name || 'User';
        const role = userData.user_metadata?.role || '';
        const roleDisplay = role ? ` (${role.charAt(0).toUpperCase() + role.slice(1)})` : '';
        
        console.log(`User logged in: ${name}, Role: ${role}`);
        
        authButtons.forEach(container => {
          container.innerHTML = `
            <div class="user-profile">
              <span class="user-greeting">Welcome, ${name}${roleDisplay}</span>
              <button class="btn btn-outline logout-btn">Sign Out</button>
            </div>
          `;
        });
        
        // Add logout functionality
        document.querySelectorAll('.logout-btn').forEach(btn => {
          btn.addEventListener('click', auth.logout);
        });
        
        // Check for role-specific UI updates
        updateRoleSpecificUI(role);
      } else {
        authButtons.forEach(container => {
          container.innerHTML = `
            <button class="btn btn-outline" onclick="location.href='/login'">Sign In</button>
            <button class="btn btn-primary" onclick="location.href='/signup'">Register</button>
          `;
        });
      }
    }
    
    // Update UI based on user role
    function updateRoleSpecificUI(role) {
      console.log(`Updating UI for user role: ${role}`);
      
      // Hide/show elements based on user role
      const researcherElements = document.querySelectorAll('.researcher-only');
      const reviewerElements = document.querySelectorAll('.reviewer-only');
      const adminElements = document.querySelectorAll('.admin-only');
      
      researcherElements.forEach(el => {
        el.style.display = role === 'researcher' ? '' : 'none';
      });
      
      reviewerElements.forEach(el => {
        el.style.display = role === 'reviewer' ? '' : 'none';
      });
      
      adminElements.forEach(el => {
        el.style.display = role === 'admin' ? '' : 'none';
      });
    }
    
    // Initialize UI
    updateLoginUI();
    
    // Check for URL parameters (for example, after successful login)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('registered') && urlParams.get('registered') === 'success') {
      if (window.toast) {
        window.toast.success('Registration successful! You can now sign in.');
      }
    }
    
    // Check if email verification was successful
    if (urlParams.has('verified') && urlParams.get('verified') === 'true') {
      if (window.toast) {
        window.toast.success('Email verified successfully! You can now sign in.', 5000);
      }
      
      // Highlight the login form if on login page
      const loginForm = document.getElementById('loginForm');
      if (loginForm) {
        loginForm.classList.add('verified');
        setTimeout(() => {
          loginForm.classList.remove('verified');
        }, 2000);
      }
    }
    
    // Check if on login page and there was an auth error
    if (window.location.pathname.includes('/login') && urlParams.has('error')) {
      const errorMessage = urlParams.get('error');
      if (window.toast) {
        window.toast.error(decodeURIComponent(errorMessage));
      }
    }
    
    // Check if dashboard and apply role-specific customization
    if (window.location.pathname.includes('/dashboard')) {
      customizeDashboard();
    }
    
    // Customize dashboard based on user role
    function customizeDashboard() {
      if (!auth.isLoggedIn()) return;
      
      const userData = auth.getCurrentUser();
      const role = userData.user_metadata?.role;
      const name = userData.user_metadata?.name || 'User';
      const dashboardTitle = document.querySelector('.dashboard-title');
      const welcomeMessage = document.querySelector('.welcome-message');
      
      console.log(`Customizing dashboard for user: ${name}, role: ${role}`);
      
      if (dashboardTitle && role) {
        dashboardTitle.textContent = `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`;
      }
      
      if (welcomeMessage && userData) {
        welcomeMessage.textContent = `Welcome back, ${name}!`;
      }
    }
    
    // Make auth object globally available
    window.auth = auth;
  });
};

// Helper function to simulate a DOM content loaded event
function triggerDOMContentLoaded() {
  const event = new Event('DOMContentLoaded');
  document.dispatchEvent(event);
}

describe('Auth JS Functionality', () => {
  // Set up before each test
  beforeEach(() => {
    // Reset the DOM
    document.body.innerHTML = document.body.innerHTML;
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset window location
    window.location.pathname = '/';
    window.location.search = '';
    
    // Set up the code
    setupAuthJS();
    
    // Clear local storage
    localStorage.clear();
  });

  test('should show login/register buttons when user is not logged in', () => {
    // Make sure no user in localStorage
    localStorage.getItem.mockReturnValue(null);
    
    triggerDOMContentLoaded();
    
    const authButtons = document.querySelector('.auth-buttons');
    
    // Check that login/register buttons were rendered
    expect(authButtons.innerHTML).toContain('Sign In');
    expect(authButtons.innerHTML).toContain('Register');
  });

  test('should show user profile and logout button when user is logged in', () => {
    // Mock logged in user
    const mockUser = JSON.stringify({
      user_metadata: {
        name: 'Test User',
        role: 'researcher'
      }
    });
    localStorage.getItem.mockReturnValue(mockUser);
    
    triggerDOMContentLoaded();
    
    const authButtons = document.querySelector('.auth-buttons');
    
    // Check that user profile and logout were rendered
    expect(authButtons.innerHTML).toContain('Welcome, Test User');
    expect(authButtons.innerHTML).toContain('Sign Out');
  });

  test('should handle logout correctly', async () => {
    // Mock logged in user
    const mockUser = JSON.stringify({
      user_metadata: {
        name: 'Test User',
        role: 'researcher'
      }
    });
    localStorage.getItem.mockReturnValue(mockUser);
    
    triggerDOMContentLoaded();
    
    // Get logout button and click it
    const logoutBtn = document.querySelector('.logout-btn');
    await logoutBtn.click();
    
    // Check that logout API was called
    expect(fetch).toHaveBeenCalledWith('/api/logout', expect.anything());
    
    // Check that localStorage item was removed
    expect(localStorage.removeItem).toHaveBeenCalledWith('supabaseUser');
    
    // Check toast notification was shown
    expect(window.toast.success).toHaveBeenCalledWith('You have been signed out successfully');
    
    // Check that page was reloaded
    expect(window.location.reload).toHaveBeenCalled();
  });

  test('should redirect to home page when logging out from a protected page', async () => {
    // Mock logged in user
    const mockUser = JSON.stringify({
      user_metadata: {
        name: 'Test User',
        role: 'researcher'
      }
    });
    localStorage.getItem.mockReturnValue(mockUser);
    
    // Set current page to a protected page
    window.location.pathname = '/dashboard/profile';
    
    triggerDOMContentLoaded();
    
    // Get logout button and click it
    const logoutBtn = document.querySelector('.logout-btn');
    await logoutBtn.click();
    
    // Check that we were redirected to home page
    expect(window.location.href).toBe('/');
    
    // Reload should not have been called
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  test('should handle error during logout', async () => {
    // Mock logged in user
    const mockUser = JSON.stringify({
      user_metadata: {
        name: 'Test User',
        role: 'researcher'
      }
    });
    localStorage.getItem.mockReturnValue(mockUser);
    
    // Mock fetch to throw an error
    global.fetch.mockImplementationOnce(() => Promise.reject('Network error'));
    
    // Mock console.error to avoid output during tests
    console.error = jest.fn();
    
    triggerDOMContentLoaded();
    
    // Get logout button and click it
    const logoutBtn = document.querySelector('.logout-btn');
    await logoutBtn.click();
    
    // Check error was logged
    expect(console.error).toHaveBeenCalledWith('Logout error:', 'Network error');
    
    // Check error toast was shown
    expect(window.toast.error).toHaveBeenCalledWith('An error occurred during logout');
  });

  test('should show researcher-only elements for researcher role', () => {
    // Mock logged in user with researcher role
    const mockUser = JSON.stringify({
      user_metadata: {
        name: 'Test User',
        role: 'researcher'
      }
    });
    localStorage.getItem.mockReturnValue(mockUser);
    
    triggerDOMContentLoaded();
    
    // Check that researcher elements are displayed
    const researcherElement = document.querySelector('.researcher-only');
    const reviewerElement = document.querySelector('.reviewer-only');
    const adminElement = document.querySelector('.admin-only');
    
    expect(researcherElement.style.display).toBe('');
    expect(reviewerElement.style.display).toBe('none');
    expect(adminElement.style.display).toBe('none');
  });

  test('should show reviewer-only elements for reviewer role', () => {
    // Mock logged in user with reviewer role
    const mockUser = JSON.stringify({
      user_metadata: {
        name: 'Test User',
        role: 'reviewer'
      }
    });
    localStorage.getItem.mockReturnValue(mockUser);
    
    triggerDOMContentLoaded();
    
    // Check that reviewer elements are displayed
    const researcherElement = document.querySelector('.researcher-only');
    const reviewerElement = document.querySelector('.reviewer-only');
    const adminElement = document.querySelector('.admin-only');
    
    expect(researcherElement.style.display).toBe('none');
    expect(reviewerElement.style.display).toBe('');
    expect(adminElement.style.display).toBe('none');
  });

  test('should show admin-only elements for admin role', () => {
    // Mock logged in user with admin role
    const mockUser = JSON.stringify({
      user_metadata: {
        name: 'Test User',
        role: 'admin'
      }
    });
    localStorage.getItem.mockReturnValue(mockUser);
    
    triggerDOMContentLoaded();
    
    // Check that admin elements are displayed
    const researcherElement = document.querySelector('.researcher-only');
    const reviewerElement = document.querySelector('.reviewer-only');
    const adminElement = document.querySelector('.admin-only');
    
    expect(researcherElement.style.display).toBe('none');
    expect(reviewerElement.style.display).toBe('none');
    expect(adminElement.style.display).toBe('');
  });

  test('should customize dashboard for logged in user', () => {
    // Mock logged in user
    const mockUser = JSON.stringify({
      user_metadata: {
        name: 'Test User',
        role: 'researcher'
      }
    });
    localStorage.getItem.mockReturnValue(mockUser);
    
    // Set current page to dashboard
    window.location.pathname = '/dashboard';
    
    triggerDOMContentLoaded();
    
    // Check that dashboard elements are customized
    const dashboardTitle = document.querySelector('.dashboard-title');
    const welcomeMessage = document.querySelector('.welcome-message');
    
    expect(dashboardTitle.textContent).toBe('Researcher Dashboard');
    expect(welcomeMessage.textContent).toBe('Welcome back, Test User!');
  });

  test('should handle registration success URL parameter', () => {
    // Mock URL search params
    global.URLSearchParams = jest.fn().mockImplementation(() => {
      return {
        has: jest.fn(key => key === 'registered'),
        get: jest.fn(key => key === 'registered' ? 'success' : null)
      };
    });
    
    triggerDOMContentLoaded();
    
    // Check that success toast was shown
    expect(window.toast.success).toHaveBeenCalledWith('Registration successful! You can now sign in.');
  });

  test('should handle email verification success URL parameter', () => {
    // Mock URL search params
    global.URLSearchParams = jest.fn().mockImplementation(() => {
      return {
        has: jest.fn(key => key === 'verified'),
        get: jest.fn(key => key === 'verified' ? 'true' : null)
      };
    });
    
    triggerDOMContentLoaded();
    
    // Check that success toast was shown
    expect(window.toast.success).toHaveBeenCalledWith('Email verified successfully! You can now sign in.', 5000);
    
    // Check that login form was highlighted
    const loginForm = document.getElementById('loginForm');
    expect(loginForm.classList.contains('verified')).toBeTruthy();
  });

  test('should handle login page error URL parameter', () => {
    // Set current page to login
    window.location.pathname = '/login';
    
    // Mock URL search params
    global.URLSearchParams = jest.fn().mockImplementation(() => {
      return {
        has: jest.fn(key => key === 'error'),
        get: jest.fn(key => key === 'error' ? 'Invalid credentials' : null)
      };
    });
    
    global.decodeURIComponent = jest.fn(str => str);
    
    triggerDOMContentLoaded();
    
    // Check that error toast was shown
    expect(window.toast.error).toHaveBeenCalledWith('Invalid credentials');
  });

  test('should make auth object available globally', () => {
    triggerDOMContentLoaded();
    
    // Check that auth object is attached to window
    expect(window.auth).toBeDefined();
    expect(typeof window.auth.isLoggedIn).toBe('function');
    expect(typeof window.auth.getCurrentUser).toBe('function');
    expect(typeof window.auth.getUserRole).toBe('function');
    expect(typeof window.auth.logout).toBe('function');
  });
});