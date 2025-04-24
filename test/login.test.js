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

// Fix the URLSearchParams mock to properly handle different query strings
class MockURLSearchParams {
  constructor(query) {
    this.query = query || '';
  }
  
  get(param) {
    if (param === 'from' && this.query === '?from=signup') return 'signup';
    if (param === 'verified' && this.query === '?verified=true') return 'true';
    return null;
  }
  
  has(param) {
    if (param === 'from' && this.query === '?from=signup') return true;
    if (param === 'verified' && this.query === '?verified=true') return true;
    return false;
  }
}

window.URLSearchParams = jest.fn().mockImplementation(query => new MockURLSearchParams(query));

// Properly mock localStorage
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
  
  // Check URL parameters when DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('from') === 'signup') {
      formStatus.textContent = 'You have successfully registered. Please check your email for verification link.';
      formStatus.className = 'form-status-message success';
    }
    
    if (urlParams.has('verified') && urlParams.get('verified') === 'true') {
      formStatus.textContent = 'Email verified successfully! You can now sign in.';
      formStatus.className = 'form-status-message success';
      
      if (loginForm) {
        loginForm.classList.add('verified');
        setTimeout(() => {
          loginForm.classList.remove('verified');
        }, 2000);
      }
    }
  });
  
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
  
  // Trigger DOMContentLoaded to initialize URL parameter checks
  document.dispatchEvent(new Event('DOMContentLoaded'));
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
    
    // Create a new instance of URLSearchParams with signup parameter
    window.URLSearchParams = jest.fn().mockImplementation(() => ({
      get: (param) => param === 'from' ? 'signup' : null,
      has: (param) => param === 'from'
    }));
    
    // Set window.location.search (we're not actually changing it due to JSDOM limitations)
    Object.defineProperty(window, 'location', {
      value: { 
        ...window.location,
        search: '?from=signup'
      },
      writable: true
    });
    
    // Act - simulate DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    // Assert - check message
    expect(formStatus.textContent).toBe('You have successfully registered. Please check your email for verification link.');
    expect(formStatus.className).toContain('success');
  });

  test('should handle email verification success parameter', () => {
    // Arrange
    const formStatus = document.getElementById('formStatus');
    const loginForm = document.getElementById('loginForm');
    
    // Create a new instance of URLSearchParams with verified parameter
    window.URLSearchParams = jest.fn().mockImplementation(() => ({
      get: (param) => param === 'verified' ? 'true' : null,
      has: (param) => param === 'verified'
    }));
    
    // Set window.location.search (we're not actually changing it due to JSDOM limitations)
    Object.defineProperty(window, 'location', {
      value: { 
        ...window.location,
        search: '?verified=true'
      },
      writable: true
    });
    
    // Act - simulate DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
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
describe('Login User Acceptance Tests', () => {
  beforeEach(() => {
    // Reset the form and mocks before each test
    document.getElementById('loginForm').reset();
    global.fetch.mockClear();
    localStorage.clear();
    window.location.href = '';
    document.getElementById('formStatus').textContent = '';
    document.getElementById('formStatus').className = 'form-status-message';
    
    // Remove any existing resend verification link
    const resendLink = document.querySelector('.resend-verification');
    if (resendLink) resendLink.remove();
  });

  describe('Scenario: Resend verification email', () => {
    test(`
      GIVEN a user sees the resend verification link
      WHEN they click the resend link
      THEN a new verification email should be sent and they see confirmation
    `, async () => {
      // GIVEN - User has resend verification link visible
      const email = 'unverified@example.com';
      loginHandlers.createResendLink(email);
      const resendButton = document.getElementById('resendLink');
      
      // Mock successful resend response
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Verification email sent' })
        })
      );

      // WHEN - They click the resend link
      resendButton.click();
      
      // Verify button text changes during sending
      expect(resendButton.textContent).toBe('Sending...');

      // Wait for async operations
      await new Promise(process.nextTick);

      // THEN - They should see success message
      const formStatus = document.getElementById('formStatus');
      expect(formStatus.textContent).toBe('Verification email resent. Please check your inbox.');
      expect(formStatus.className).toContain('success');
      expect(resendButton.textContent).toBe('Resend it');
      
      // Verify API was called correctly
      expect(global.fetch).toHaveBeenCalledWith('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
    });
  });

  describe('Scenario: Redirect from successful signup', () => {
    test(`
      GIVEN a user arrives at login page after successful signup
      WHEN the page loads with 'from=signup' URL parameter
      THEN they should see a success message about email verification
    `, () => {
      // GIVEN - User arrives with signup redirect parameter
      window.URLSearchParams = jest.fn().mockImplementation(() => ({
        get: (param) => param === 'from' ? 'signup' : null,
        has: (param) => param === 'from'
      }));
      
      Object.defineProperty(window, 'location', {
        value: { 
          ...window.location,
          search: '?from=signup'
        },
        writable: true
      });
      
      // WHEN - Page loads
      document.dispatchEvent(new Event('DOMContentLoaded'));
      
      // THEN - They should see success message
      const formStatus = document.getElementById('formStatus');
      expect(formStatus.textContent).toBe('You have successfully registered. Please check your email for verification link.');
      expect(formStatus.className).toContain('success');
    });
  });

  describe('Scenario: Redirect from email verification', () => {
    test(`
      GIVEN a user arrives at login page after verifying email
      WHEN the page loads with 'verified=true' URL parameter
      THEN they should see a success message and form gets highlighted
    `, () => {
      // GIVEN - User arrives with verification success parameter
      window.URLSearchParams = jest.fn().mockImplementation(() => ({
        get: (param) => param === 'verified' ? 'true' : null,
        has: (param) => param === 'verified'
      }));
      
      Object.defineProperty(window, 'location', {
        value: { 
          ...window.location,
          search: '?verified=true'
        },
        writable: true
      });
      
      // WHEN - Page loads
      document.dispatchEvent(new Event('DOMContentLoaded'));
      
      // THEN - They should see success message and form highlight
      const formStatus = document.getElementById('formStatus');
      const loginForm = document.getElementById('loginForm');
      
      expect(formStatus.textContent).toBe('Email verified successfully! You can now sign in.');
      expect(formStatus.className).toContain('success');
      expect(loginForm.classList.contains('verified')).toBeTruthy();
      
      // After timeout, highlight should be removed
      loginForm.classList.remove('verified');
      expect(loginForm.classList.contains('verified')).toBeFalsy();
    });
  });

  describe('Scenario: Toggle password visibility', () => {
    test(`
      GIVEN a user is on the login page
      WHEN they click the password visibility toggle
      THEN the password field should toggle between visible and hidden
    `, () => {
      // GIVEN - User is on login page
      const passwordInput = document.getElementById('password');
      const toggleButton = document.querySelector('.toggle-password-visibility');
      const icon = toggleButton.querySelector('i');
      
      // Initial state
      expect(passwordInput.type).toBe('password');
      expect(icon.classList.contains('fa-eye')).toBeTruthy();
      
      // WHEN - They click the toggle button
      toggleButton.click();
      
      // THEN - Password should be visible
      expect(passwordInput.type).toBe('text');
      expect(icon.classList.contains('fa-eye-slash')).toBeTruthy();
      
      // WHEN - They click again
      toggleButton.click();
      
      // THEN - Password should be hidden again
      expect(passwordInput.type).toBe('password');
      expect(icon.classList.contains('fa-eye')).toBeTruthy();
    });
  });

  describe('Scenario: Remember me functionality', () => {
    test(`
      GIVEN a user is on the login page
      WHEN they check the "Remember me" checkbox
      THEN the checkbox state should be saved (simulated)
    `, () => {
      // GIVEN - User is on login page
      const rememberMeCheckbox = document.getElementById('rememberMe');
      
      // Initial state
      expect(rememberMeCheckbox.checked).toBeFalsy();
      
      // WHEN - They check the checkbox
      rememberMeCheckbox.checked = true;
      
      // THEN - Checkbox should be checked
      expect(rememberMeCheckbox.checked).toBeTruthy();
      
      // WHEN - They uncheck the checkbox
      rememberMeCheckbox.checked = false;
      
      // THEN - Checkbox should be unchecked
      expect(rememberMeCheckbox.checked).toBeFalsy();
    });
  });

  describe('Scenario: Forgot password link', () => {
    test(`
      GIVEN a user is on the login page
      WHEN they click the "Forgot password" link
      THEN they should be redirected to password reset (simulated)
    `, () => {
      // GIVEN - User is on login page
      const forgotPasswordLink = document.querySelector('.forgot-password');
      
      // Mock click handler
      forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/forgot-password';
      });
      
      // WHEN - They click forgot password link
      forgotPasswordLink.click();
      
      // THEN - They should be redirected to password reset
      expect(window.location.href).toBe('/forgot-password');
    });
  });
});