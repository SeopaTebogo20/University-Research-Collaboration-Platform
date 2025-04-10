
// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordButton = document.querySelector('.toggle-password-visibility');
const formStatus = document.getElementById('formStatus');

// Check if redirected from signup
document.addEventListener('DOMContentLoaded', () => {
  // Display message if coming from successful signup
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('from') === 'signup') {
    if (formStatus) {
      formStatus.textContent = 'You have successfully registered. Please sign in to continue.';
      formStatus.className = 'form-status-message success';
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
    
    try {
      // Send login request to server
      const response = await fetch('/api/auth/login', {
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
        throw new Error(data.message || 'Login failed');
      }
      
      // Save authentication data
      localStorage.setItem('authToken', data.session.access_token);
      localStorage.setItem('refreshToken', data.session.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userProfile', JSON.stringify(data.profile));
      
      // Show success message
      formStatus.textContent = 'Login successful! Redirecting...';
      formStatus.className = 'form-status-message success';
      
      // Redirect based on user role
      setTimeout(() => {
        const userRole = data.profile?.role || 'researcher';
        
        if (userRole === 'admin') {
          window.location.href = '/admin';
        } else if (userRole === 'researcher') {
          window.location.href = '/researcher';
        } else if (userRole === 'reviewer') {
          window.location.href = '/reviewer';
        } else {
          window.location.href = '/';
        }
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
