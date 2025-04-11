// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordButton = document.querySelector('.toggle-password-visibility');
const formStatus = document.getElementById('formStatus');
let resendVerificationLink = null;

// Check if redirected from signup
document.addEventListener('DOMContentLoaded', () => {
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

<<<<<<< HEAD
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
=======
// Email format validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password rule (adjustable)
function isValidPassword(password) {
  return password.length >= 6; // change this rule if needed
>>>>>>> ab3d0aaa5ca7f5a157fcd32b776740273e7bce24
}

// Form submission
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      alert("Please fill in all fields.");
      formStatus.textContent = 'Please enter both email and password.';
      formStatus.className = 'form-status-message error';
      return;
    }

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address.");
      formStatus.textContent = 'Invalid email format.';
      formStatus.className = 'form-status-message error';
      return;
    }

    if (!isValidPassword(password)) {
      alert("Password must be at least 6 characters.");
      formStatus.textContent = 'Password must be at least 6 characters long.';
      formStatus.className = 'form-status-message error';
      return;
    }

    const submitButton = loginForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Signing In...';
    formStatus.textContent = '';
    formStatus.className = 'form-status-message';
<<<<<<< HEAD
    
    // Remove resend link if it exists
    if (resendVerificationLink) {
      resendVerificationLink.remove();
      resendVerificationLink = null;
    }
    
    try {
      // Send login request to server - Note the correct endpoint '/api/login'
      const response = await fetch('/api/login', {
=======

    try {
      const response = await fetch('/api/auth/login', {
>>>>>>> ab3d0aaa5ca7f5a157fcd32b776740273e7bce24
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
<<<<<<< HEAD
      
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
      
      // Redirect to dashboard or other appropriate page
      setTimeout(() => {
        window.location.href = data.redirectUrl || '/dashboard';
=======

      if (!response.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('authToken', data.session.access_token);
      localStorage.setItem('refreshToken', data.session.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userProfile', JSON.stringify(data.profile));

      formStatus.textContent = 'Login successful! Redirecting...';
      formStatus.className = 'form-status-message success';

      setTimeout(() => {
        const userRole = data.profile?.role || 'researcher';
        if (userRole === 'admin') window.location.href = '/admin';
        else if (userRole === 'researcher') window.location.href = '/researcher';
        else if (userRole === 'reviewer') window.location.href = '/reviewer';
        else window.location.href = '/';
>>>>>>> ab3d0aaa5ca7f5a157fcd32b776740273e7bce24
      }, 1500);

    } catch (error) {
      console.error('Login error:', error);
      formStatus.textContent = error.message || 'An error occurred during login';
      formStatus.className = 'form-status-message error';
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}