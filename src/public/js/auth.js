
// Updated auth.js with sessionStorage support and Google login handling
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with global authManager if available
    const auth = window.authManager || {
        // Check if user is logged in
        isLoggedIn: function() {
            return sessionStorage.getItem('user') !== null;
        },
        
        // Get current user
        getCurrentUser: function() {
            const userData = sessionStorage.getItem('user');
            return userData ? JSON.parse(userData) : null;
        },
        
        // Get user's role
        getUserRole: function() {
            const user = this.getCurrentUser();
            return user?.role || null;
        },
        
        // Get access token
        getAccessToken: function() {
            return sessionStorage.getItem('access_token');
        },
        
        // Get refresh token
        getRefreshToken: function() {
            return sessionStorage.getItem('refresh_token');
        },
        
        // Handle login (called after successful authentication)
        handleLogin: function(userData) {
            try {
                // Store essential user data in sessionStorage
                sessionStorage.setItem('user', JSON.stringify({
                    id: userData.id,
                    email: userData.email,
                    role: userData.user_metadata?.role || 'researcher',
                    name: userData.user_metadata?.name || '',
                    picture: userData.user_metadata?.picture || ''
                }));
                
                // Store tokens if available
                if (userData.session) {
                    sessionStorage.setItem('access_token', userData.session.access_token);
                    sessionStorage.setItem('refresh_token', userData.session.refresh_token);
                }
                
                // Check for token in URL (from Google login)
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token');
                
                if (token) {
                    try {
                        // Parse the token and merge with existing user data
                        const tokenData = this.parseJwt(token);
                        const currentUser = this.getCurrentUser() || {};
                        
                        // Update sessionStorage with token data
                        sessionStorage.setItem('user', JSON.stringify({
                            ...currentUser,
                            ...tokenData
                        }));
                        
                        // Clean up the URL
                        window.history.replaceState({}, document.title, window.location.pathname);
                    } catch (error) {
                        console.error('Error processing auth token:', error);
                    }
                }
                
                return true;
            } catch (error) {
                console.error('Login handling error:', error);
                return false;
            }
        },
        
        // Parse JWT token
        parseJwt: function(token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                
                return JSON.parse(jsonPayload);
            } catch (error) {
                console.error('Failed to parse JWT:', error);
                return null;
            }
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
                
                // Clear session storage
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('access_token');
                sessionStorage.removeItem('refresh_token');
                
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
        },
        
        // Check authentication status with server
        checkAuthStatus: async function() {
            try {
                const response = await fetch('/api/auth/status');
                const data = await response.json();
                
                if (data.authenticated && data.user) {
                    this.handleLogin(data.user);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Auth status check failed:', error);
                return false;
            }
        }
    };
    
    // Initialize auth state
    (async function initAuth() {
        // First check if we have a token in URL (from Google login)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            try {
                const tokenData = auth.parseJwt(token);
                if (tokenData) {
                    sessionStorage.setItem('user', JSON.stringify({
                        id: tokenData.id,
                        email: tokenData.email,
                        role: tokenData.role || 'researcher',
                        name: tokenData.name || '',
                        picture: tokenData.picture || ''
                    }));
                    
                    if (tokenData.access_token) {
                        sessionStorage.setItem('access_token', tokenData.access_token);
                    }
                    if (tokenData.refresh_token) {
                        sessionStorage.setItem('refresh_token', tokenData.refresh_token);
                    }
                    
                    // Clean up the URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } catch (error) {
                console.error('Token processing error:', error);
            }
        }
        
        // Verify auth status with server if we think we're logged in
        if (auth.isLoggedIn()) {
            await auth.checkAuthStatus();
        }
        
        // Update UI based on final auth state
        updateLoginUI();
    })();
    
    // Update UI based on login status
    function updateLoginUI() {
        const authButtons = document.querySelectorAll('.auth-buttons, .mobile-auth-buttons');
        
        if (auth.isLoggedIn()) {
            const userData = auth.getCurrentUser();
            const name = userData?.name || 'User';
            const role = userData?.role || '';
            const roleDisplay = role ? ` (${role.charAt(0).toUpperCase() + role.slice(1)})` : '';
            
            console.log(`User logged in: ${name}, Role: ${role}`);
            
            authButtons.forEach(container => {
                container.innerHTML = `
                    <div class="user-profile">
                        ${userData?.picture ? `<img src="${userData.picture}" class="user-avatar" alt="User Avatar">` : ''}
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
        const role = userData?.role;
        const name = userData?.name || 'User';
        const dashboardTitle = document.querySelector('.dashboard-title');
        const welcomeMessage = document.querySelector('.welcome-message');
        
        console.log(`Customizing dashboard for user: ${name}, role: ${role}`);
        
        if (dashboardTitle && role) {
            dashboardTitle.textContent = `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`;
        }
        
        if (welcomeMessage && userData) {
            welcomeMessage.textContent = `Welcome back, ${name}!`;
            if (userData.picture) {
                welcomeMessage.insertAdjacentHTML('afterbegin', 
                    `<img src="${userData.picture}" class="welcome-avatar" alt="User Avatar"> `);
            }
        }
    }
    
    // Make auth object globally available
    window.auth = auth;
  });