// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordButton = document.querySelector('.toggle-password-visibility');
const formStatus = document.getElementById('formStatus');
let resendVerificationLink = null;

// Check if redirected from signup
document.addEventListener('DOMContentLoaded', () => {
  // Display message if coming from successful signup
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('from') === 'signup') {
    if (formStatus) {
      formStatus.textContent = 'You have successfully registered. Please check your email for verification link.';
      formStatus.className = 'form-status-message success';
    }
  }
  
  // Check if email verification was successful
  if (urlParams.has('verified') && urlParams.get('verified') === 'true') {
    if (formStatus) {
      formStatus.textContent = 'Email verified successfully! You can now sign in.';
      formStatus.className = 'form-status-message success';
    }
    
    // Highlight the login form
    if (loginForm) {
      loginForm.classList.add('verified');
      setTimeout(() => {
        loginForm.classList.remove('verified');
      }, 2000);
    }
  }
});

// Toggle password visibility
if (togglePasswordButton) {
  togglePasswordButton.addEventListener('click', () => {
    const icon = togglePasswordButton.querySelector('i');
    
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
  });
}

// Create a resend verification email function
function createResendLink(email) {
  // First remove any existing link
  if (resendVerificationLink) {
    resendVerificationLink.remove();
  }
  
  // Create new link
  resendVerificationLink = document.createElement('div');
  resendVerificationLink.className = 'resend-verification';
  resendVerificationLink.innerHTML = `
    <p>Didn't receive verification email? <a href="#" id="resendLink">Resend it</a></p>
  `;
  
  // Insert after form status
  formStatus.parentNode.insertBefore(resendVerificationLink, formStatus.nextSibling);
  
  // Add event listener to resend link
  document.getElementById('resendLink').addEventListener('click', async (e) => {
    e.preventDefault();
    
    try {
      // Show loading state
      document.getElementById('resendLink').textContent = 'Sending...';
      
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
      }
      
      formStatus.textContent = 'Verification email resent. Please check your inbox.';
      formStatus.className = 'form-status-message success';
      
      // Reset link text
      document.getElementById('resendLink').textContent = 'Resend it';
    } catch (error) {
      console.error('Resend verification error:', error);
      formStatus.textContent = error.message;
      formStatus.className = 'form-status-message error';
      
      // Reset link text
      document.getElementById('resendLink').textContent = 'Resend it';
    }
  });
}

/**
 * Get dashboard URL based on user role
 * @param {string} role - User role (admin, reviewer, researcher)
 * @returns {string} - URL path to appropriate dashboard
 */
function getDashboardUrlByRole(role) {
  // Normalize role to lowercase for case-insensitive comparison
  const normalizedRole = role.toLowerCase();
  
  switch (normalizedRole) {
    case 'admin':
      return '/roles/admin/dashboard.html';
    case 'reviewer':
      return '/roles/reviewer/dashboard.html';
    case 'researcher':
      return '/roles/researcher/dashboard.html';
  }
}

// Form submission
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate fields
    if (!emailInput.value || !passwordInput.value) {
      formStatus.textContent = 'Please enter both email and password';
      formStatus.className = 'form-status-message error';
      return;
    }
    
    // Show loading state
    const submitButton = loginForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Signing In...';
    formStatus.textContent = '';
    formStatus.className = 'form-status-message';
    
    // Remove resend link if it exists
    if (resendVerificationLink) {
      resendVerificationLink.remove();
      resendVerificationLink = null;
    }
    
    try {
      // Send login request to server
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailInput.value,
          password: passwordInput.value
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Check if this is an email verification issue
        if (response.status === 403 && data.emailVerified === false) {
          // Create resend verification link
          createResendLink(emailInput.value);
        }
        throw new Error(data.message || 'Login failed');
      }
      
      // Save authentication data - Store user in a consistent way to match auth.js
      localStorage.setItem('supabaseUser', JSON.stringify(data.user));
      
      // Show success message
      formStatus.textContent = 'Login successful! Redirecting...';
      formStatus.className = 'form-status-message success';
      
      // Get the user's role from the user metadata
      // Supabase stores custom user data in the user.user_metadata object
      const userRole = data.user?.user_metadata?.role || 'researcher';
      
      // Get the appropriate dashboard URL based on role
      const dashboardUrl = getDashboardUrlByRole(userRole);
      
      // Redirect to the appropriate dashboard
      setTimeout(() => {
        window.location.href = dashboardUrl;
      }, 1500);
      
    } catch (error) {
      console.error('Login error:', error);
      formStatus.textContent = error.message || 'An error occurred during login';
      formStatus.className = 'form-status-message error';
      
      // Reset submit button
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}