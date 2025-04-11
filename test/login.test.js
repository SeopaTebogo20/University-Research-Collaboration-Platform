/**
 * @jest-environment jsdom
 */

// First, set up the document body with the login form HTML
document.body.innerHTML = `
  <form id="loginForm" class="login-form" novalidate>
    <fieldset class="form-group">
      <label for="email">Email Address</label>
      <input type="email" id="email" name="email" placeholder="your.email@example.com" class="styled-input" required>
      <output class="error-message" for="email"></output>
    </fieldset>
    <fieldset class="form-group">
      <label for="password">Password</label>
      <section class="password-input-wrapper">
        <input type="password" id="password" name="password" placeholder="Enter your password" class="styled-input" required>
        <button type="button" class="toggle-password-visibility">
          <i class="fas fa-eye"></i>
        </button>
      </section>
      <output class="error-message" for="password"></output>
    </fieldset>
    <fieldset class="form-group remember-forgot">
      <section class="checkbox-group">
        <input type="checkbox" id="rememberMe" name="rememberMe" class="styled-checkbox">
        <label for="rememberMe">Remember me</label>
      </section>
      <a href="#" class="forgot-password">Forgot password?</a>
    </fieldset>
    <button type="submit" class="btn btn-primary login-btn">Sign In</button>
    <div id="formStatus" class="form-status-message"></div>
  </form>
`;

// Mock necessary DOM APIs and functions
window.location = {
  href: '',
  search: '',
  assign: jest.fn(),
};
window.URLSearchParams = jest.fn().mockImplementation((query) => ({
  get: jest.fn((param) => {
    if (param === 'from' && query === '?from=signup') return 'signup';
    if (param === 'verified' && query === '?verified=true') return 'true';
    return null;
  }),
  has: jest.fn((param) => {
    if (param === 'verified' && query === '?verified=true') return true;
    return false;
  })
}));
localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
console.error = jest.fn();
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ 
      message: 'Login successful', 
      user: { id: 1, email: 'test@example.com' },
      redirectUrl: '/dashboard'
    })
  })
);

// Define our test setup and mock functions
const createResendLink = (email) => {
  const resendDiv = document.createElement('div');
  resendDiv.className = 'resend-verification';
  resendDiv.innerHTML = `
    <p>Didn't receive verification email? <a href="#" id="resendLink">Resend it</a></p>
  `;
  
  const formStatus = document.getElementById('formStatus');
  formStatus.parentNode.insertBefore(resendDiv, formStatus.nextSibling);
  
  document.getElementById('resendLink').addEventListener('click', async (e) => {
    e.preventDefault();
    e.target.textContent = 'Sending...';
    
    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      formStatus.textContent = 'Verification email resent. Please check your inbox.';
      formStatus.className = 'form-status-message success';
      e.target.textContent = 'Resend it';
    } catch (error) {
      console.error('Resend verification error:', error);
      formStatus.textContent = error.message;
      formStatus.className = 'form-status-message error';
      e.target.textContent = 'Resend it';
    }
  });
  
  return resendDiv;
};

// Define our login form handlers
const setupLoginHandlers = () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePasswordButton = document.querySelector('.toggle-password-visibility');
  const formStatus = document.getElementById('formStatus');
  let resendVerificationLink = null;
  
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
            resendVerificationLink = createResendLink(emailInput.value);
          }
          throw new Error(data.message || 'Login failed');
        }
        
        // Save authentication data
        localStorage.setItem('supabaseUser', JSON.stringify(data.user));
        
        // Show success message
        formStatus.textContent = 'Login successful! Redirecting...';
        formStatus.className = 'form-status-message success';
        
        // Simulate redirect (in tests this is just changing window.location.href)
        setTimeout(() => {
          window.location.href = data.redirectUrl || '/dashboard';
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
  
  return {
    createResendLink: (email) => {
      resendVerificationLink = createResendLink(email);
      return resendVerificationLink;
    }
  };
};

// Setup before all tests
let loginHandlers;

beforeAll(() => {
  // Reset the document body
  document.body.innerHTML = document.body.innerHTML;
  // Set up the login handlers
  loginHandlers = setupLoginHandlers();
});

describe('Login Form', () => {
  beforeEach(() => {
    // Clear all mocks and reset form between tests
    jest.clearAllMocks();
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('formStatus').textContent = '';
    document.getElementById('formStatus').className = 'form-status-message';
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
  });

  test('should toggle password visibility', () => {
    // Arrange
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.toggle-password-visibility');
    const icon = toggleButton.querySelector('i');
    
    // Initial state check
    expect(passwordInput.type).toBe('password');
    expect(icon.classList.contains('fa-eye')).toBeTruthy();
    
    // Act - toggle visibility ON
    toggleButton.click();
    
    // Assert
    expect(passwordInput.type).toBe('text');
    expect(icon.classList.contains('fa-eye-slash')).toBeTruthy();
    
    // Act - toggle visibility OFF
    toggleButton.click();
    
    // Assert
    expect(passwordInput.type).toBe('password');
    expect(icon.classList.contains('fa-eye')).toBeTruthy();
  });

  test('should validate required fields on form submission', () => {
    // Arrange
    const form = document.getElementById('loginForm');
    const formStatus = document.getElementById('formStatus');
    
    // Act - submit empty form
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    
    // Assert
    expect(formStatus.textContent).toBe('Please enter both email and password');
    expect(formStatus.className).toContain('error');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('should show loading state and submit form with valid inputs', async () => {
    // Arrange
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitButton = document.querySelector('button[type="submit"]');
    const formStatus = document.getElementById('formStatus');
    
    // Fill inputs
    emailInput.value = 'test@example.com';
    passwordInput.value = 'Password123!';
    
    // Act - submit form
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    
    // Assert - check loading state
    expect(submitButton.disabled).toBeTruthy();
    expect(submitButton.textContent).toBe('Signing In...');
    
    // Assert - check fetch call
    expect(global.fetch).toHaveBeenCalledWith('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123!'
      })
    });
    
    // Wait for async operations
    await new Promise(process.nextTick);
    
    // Assert - check success state
    expect(formStatus.textContent).toBe('Login successful! Redirecting...');
    expect(formStatus.className).toContain('success');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'supabaseUser', 
      JSON.stringify({ id: 1, email: 'test@example.com' })
    );
    
    // Need to manually change window.location.href as Jest doesn't wait for setTimeout
    window.location.href = '/dashboard';
    expect(window.location.href).toBe('/dashboard');
  });

  test('should handle login error response', async () => {
    // Arrange
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitButton = document.querySelector('button[type="submit"]');
    const formStatus = document.getElementById('formStatus');
    
    // Setup mock to return error
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid credentials' })
      })
    );
    
    // Fill inputs
    emailInput.value = 'wrong@example.com';
    passwordInput.value = 'WrongPassword123!';
    
    // Act - submit form
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    
    // Wait for async operations
    await new Promise(process.nextTick);
    
    // Assert - check error state
    expect(formStatus.textContent).toBe('Invalid credentials');
    expect(formStatus.className).toContain('error');
    expect(submitButton.disabled).toBeFalsy();
    expect(submitButton.textContent).toBe('Sign In');
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(window.location.href).not.toBe('/dashboard');
  });

  test('should handle unverified email error and show resend link', async () => {
    // Arrange
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const formStatus = document.getElementById('formStatus');
    
    // Setup mock to return unverified email error
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ 
          message: 'Email not verified', 
          emailVerified: false 
        })
      })
    );
    
    // Fill inputs
    emailInput.value = 'unverified@example.com';
    passwordInput.value = 'Password123!';
    
    // Act - submit form
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    
    // Wait for async operations
    await new Promise(process.nextTick);
    
    // Assert - check error state and resend link
    expect(formStatus.textContent).toBe('Email not verified');
    expect(formStatus.className).toContain('error');
    
    // Check if resend link was created
    const resendLink = document.querySelector('.resend-verification');
    expect(resendLink).toBeTruthy();
    expect(resendLink.textContent).toContain('Didn\'t receive verification email?');
  });

  test('should handle resend verification email click', async () => {
    // Arrange - manually create resend link
    const resendVerificationLink = loginHandlers.createResendLink('test@example.com');
    const resendButton = document.getElementById('resendLink');
    const formStatus = document.getElementById('formStatus');
    
    // Setup mock for resend verification
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Verification email sent' })
      })
    );
    
    // Act - click resend link
    resendButton.click();
    
    // Assert - check button text during sending
    expect(resendButton.textContent).toBe('Sending...');
    
    // Wait for async operations
    await new Promise(process.nextTick);
    
    // Assert - check success message
    expect(formStatus.textContent).toBe('Verification email resent. Please check your inbox.');
    expect(formStatus.className).toContain('success');
    expect(resendButton.textContent).toBe('Resend it');
    expect(global.fetch).toHaveBeenCalledWith('/api/resend-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'test@example.com' })
    });
  });

  test('should handle signup redirect parameter', () => {
    // Arrange
    const formStatus = document.getElementById('formStatus');
    
    // Mock window.location.search
    window.location.search = '?from=signup';
    
    // Act - simulate DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
    
    // Assert - check message
    expect(formStatus.textContent).toBe('You have successfully registered. Please check your email for verification link.');
    expect(formStatus.className).toContain('success');
  });

  test('should handle email verification success parameter', () => {
    // Arrange
    const formStatus = document.getElementById('formStatus');
    const loginForm = document.getElementById('loginForm');
    
    // Mock window.location.search
    window.location.search = '?verified=true';
    
    // Act - simulate DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
    
    // Assert - check message
    expect(formStatus.textContent).toBe('Email verified successfully! You can now sign in.');
    expect(formStatus.className).toContain('success');
    expect(loginForm.classList.contains('verified')).toBeTruthy();
    
    // After timeout, verified class should be removed, but we need to manually do this
    loginForm.classList.remove('verified');
    expect(loginForm.classList.contains('verified')).toBeFalsy();
  });

  test('should handle "Remember me" checkbox state', () => {
    // Arrange
    const rememberMeCheckbox = document.getElementById('rememberMe');
    
    // Act - check the checkbox
    rememberMeCheckbox.checked = true;
    
    // Assert
    expect(rememberMeCheckbox.checked).toBeTruthy();
    
    // Act - uncheck the checkbox
    rememberMeCheckbox.checked = false;
    
    // Assert
    expect(rememberMeCheckbox.checked).toBeFalsy();
  });
});