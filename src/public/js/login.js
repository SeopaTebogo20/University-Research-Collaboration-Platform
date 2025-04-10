// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordButton = document.querySelector('.toggle-password-visibility');
const formStatus = document.getElementById('formStatus');

// Check if redirected from signup
document.addEventListener('DOMContentLoaded', () => {
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

// Email format validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password rule (adjustable)
function isValidPassword(password) {
  return password.length >= 6; // change this rule if needed
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

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

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
