/**
 * @jest-environment jsdom
 */

// First, setup the HTML structure needed for tests
document.body.innerHTML = `
  <nav class="navbar">
    <div class="logo">Logo</div>
    <div class="nav-links">
      <a href="#">Home</a>
      <a href="#">About</a>
      <a href="#">Services</a>
    </div>
    <div class="auth-buttons">
      <button>Sign In</button>
      <button>Register</button>
    </div>
    <button id="mobile-menu-button">
      <span></span>
      <span></span>
      <span></span>
    </button>
  </nav>
  <div id="mobile-nav">
    <div id="mobile-nav-close">✕</div>
    <div class="mobile-nav-links">
      <a href="#">Home</a>
      <a href="#">About</a>
      <a href="#">Services</a>
    </div>
  </div>
  <div class="animate-on-scroll">Animated Element 1</div>
  <div class="animate-on-scroll">Animated Element 2</div>
`;

// Mock window functions
window.IntersectionObserver = jest.fn(function(callback, options) {
  this.observe = jest.fn();
  this.unobserve = jest.fn();
  this.disconnect = jest.fn();
  this.callback = callback;
  this.options = options;
});

// Import the code under test (inline it for testing)
const setupMainJS = () => {
  // Mobile menu functionality
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu toggle if it exists
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    if (mobileMenuButton) {
      mobileMenuButton.addEventListener('click', function() {
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.toggle('show');
      });
    }

    // Add animation classes to elements when they come into view
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      animatedElements.forEach(el => {
        observer.observe(el);
      });
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      animatedElements.forEach(el => {
        el.classList.add('fade-in');
      });
    }
  });

  // JavaScript for mobile menu toggle
  document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileNavClose = document.getElementById('mobile-nav-close');
    const mobileNav = document.getElementById('mobile-nav');
    
    // Hide mobile menu button by default
    mobileMenuButton.style.display = 'none';
    
    function checkMobileView() {
      // Check if we should show the mobile menu button based on screen width
      // or if the nav items are overflowing
      const navLinks = document.querySelector('.nav-links');
      const navbar = document.querySelector('.navbar');
      
      // Get total width of all nav elements
      const logoWidth = document.querySelector('.logo').offsetWidth;
      const navLinksWidth = navLinks ? navLinks.offsetWidth : 0;
      const authButtonsWidth = document.querySelector('.auth-buttons').offsetWidth;
      const totalContentWidth = logoWidth + navLinksWidth + authButtonsWidth + 60; // Adding some padding
      
      // Get available width
      const availableWidth = navbar.offsetWidth;
      
      if (window.innerWidth <= 768 || totalContentWidth > availableWidth) {
        mobileMenuButton.style.display = 'block';
        if (navLinks) navLinks.classList.add('hidden-mobile');
        document.querySelector('.navbar .auth-buttons').classList.add('hidden-mobile');
      } else {
        mobileMenuButton.style.display = 'none';
        if (navLinks) navLinks.classList.remove('hidden-mobile');
        document.querySelector('.navbar .auth-buttons').classList.remove('hidden-mobile');
      }
    }
    
    // Check on page load
    checkMobileView();
    
    // Check when window is resized
    window.addEventListener('resize', checkMobileView);
    
    // Open mobile menu
    mobileMenuButton.addEventListener('click', function() {
      mobileNav.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    });
    
    // Close mobile menu
    mobileNavClose.addEventListener('click', function() {
      mobileNav.classList.remove('active');
      document.body.style.overflow = ''; // Re-enable scrolling
    });
    
    // Close menu when clicking a link
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  });
};

// Helper function to simulate a DOM content loaded event
function triggerDOMContentLoaded() {
  const event = new Event('DOMContentLoaded');
  document.dispatchEvent(event);
}

describe('Main JS Functionality', () => {
  // Set up before each test
  beforeEach(() => {
    // Reset the DOM
    document.body.innerHTML = document.body.innerHTML;
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Set initial window inner width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
    
    // Mock element dimensions
    Element.prototype.offsetWidth = 100;
    
    // Set up the code
    setupMainJS();
  });
  
  test('should apply fallback animation when IntersectionObserver is not available', () => {
    // Remove IntersectionObserver
    const originalIntersectionObserver = window.IntersectionObserver;
    delete window.IntersectionObserver;
    
    triggerDOMContentLoaded();
    
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => {
      expect(el.classList.contains('fade-in')).toBeTruthy();
    });
    
    // Restore IntersectionObserver
    window.IntersectionObserver = originalIntersectionObserver;
  });

  test('should toggle mobile menu when button is clicked', () => {
    triggerDOMContentLoaded();
    
    const mobileNav = document.getElementById('mobile-nav');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    
    // Simulate click on mobile menu button
    mobileMenuButton.click();
    
    // Check that the mobile nav got the active class
    expect(mobileNav.classList.contains('active')).toBeTruthy();
    // Check that body overflow is hidden
    expect(document.body.style.overflow).toBe('hidden');
  });

  test('should close mobile menu when close button is clicked', () => {
    triggerDOMContentLoaded();
    
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavClose = document.getElementById('mobile-nav-close');
    
    // First activate the menu
    mobileNav.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Simulate click on close button
    mobileNavClose.click();
    
    // Check that the active class was removed
    expect(mobileNav.classList.contains('active')).toBeFalsy();
    // Check that body overflow is restored
    expect(document.body.style.overflow).toBe('');
  });

  test('should close mobile menu when a link is clicked', () => {
    triggerDOMContentLoaded();
    
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavLink = document.querySelector('.mobile-nav-links a');
    
    // First activate the menu
    mobileNav.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Simulate click on a nav link
    mobileNavLink.click();
    
    // Check that the active class was removed
    expect(mobileNav.classList.contains('active')).toBeFalsy();
    // Check that body overflow is restored
    expect(document.body.style.overflow).toBe('');
  });

  test('should switch to mobile view when window width is small', () => {
    // Set window width to mobile size
    window.innerWidth = 480;
    
    triggerDOMContentLoaded();
    
    // Manually call checkMobileView to simulate resize
    const event = new Event('resize');
    window.dispatchEvent(event);
    
    // Check that menu button is shown
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    expect(mobileMenuButton.style.display).toBe('block');
    
    // Check that nav links have mobile class
    const navLinks = document.querySelector('.nav-links');
    expect(navLinks.classList.contains('hidden-mobile')).toBeTruthy();
    
    // Check that auth buttons have mobile class
    const authButtons = document.querySelector('.navbar .auth-buttons');
    expect(authButtons.classList.contains('hidden-mobile')).toBeTruthy();
  });
});