
// Auth utilities for CollabNexus
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
                        <nav class="user-greeting">Welcome, ${name}${roleDisplay}</nav>
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
  
  