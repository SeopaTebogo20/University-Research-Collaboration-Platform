/**
 * Tests for main.js functionality
 */

// Import the JavaScript file directly
const fs = require('fs');
const path = require('path');

// Define a function to load the JavaScript code
function loadJavaScript(filePath) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  const code = fs.readFileSync(fullPath, 'utf8');
  
  // Create a function to execute the code in the current scope
  const executeCode = new Function('document', 'window', code);
  
  // Clear any existing event listeners before running the code
  document.removeEventListener('DOMContentLoaded', executeCode);
  
  // Execute the code with the mocked document and window
  return executeCode(document, window);
}

describe('Mobile Menu Functionality (main.js)', () => {
  beforeEach(() => {
    // Reset DOM elements before each test
    document.querySelector('.nav-links')?.classList.remove('show');
    document.querySelector('.nav-links')?.classList.remove('hidden-mobile');
    document.querySelector('.navbar .auth-buttons')?.classList.remove('hidden-mobile');
    
    if (document.getElementById('mobile-nav')) {
      document.getElementById('mobile-nav').classList.remove('active');
    }
    
    document.body.style.overflow = '';
    
    // Reset animation classes
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      el.classList.remove('fade-in');
    });
    
    // Load the JavaScript file for each test
    loadJavaScript('src/public/js/main.js');
    
    // Trigger DOMContentLoaded to initialize functionality
    const domContentLoadedEvent = new Event('DOMContentLoaded');
    document.dispatchEvent(domContentLoadedEvent);
  });
  
  describe('Mobile Menu Button Toggle', () => {
    test('mobile menu button should toggle nav-links show class', () => {
      const mobileMenuButton = document.getElementById('mobile-menu-button');
      const navLinks = document.querySelector('.nav-links');
      
      expect(navLinks.classList.contains('show')).toBe(false);
      
      mobileMenuButton.click();
      expect(navLinks.classList.contains('show')).toBe(true);
      
      mobileMenuButton.click();
      expect(navLinks.classList.contains('show')).toBe(false);
    });
  });
  
  describe('Animation on Scroll', () => {
    test('elements with animate-on-scroll class should get fade-in class when intersecting', () => {
      // Get all animated elements
      const animatedElements = document.querySelectorAll('.animate-on-scroll');
      
      // Verify initial state
      animatedElements.forEach(el => {
        expect(el.classList.contains('fade-in')).toBe(false);
      });
      
      // Find the IntersectionObserver instance
      const observers = IntersectionObserver.mock.observe.mock.calls.map(call => call[0]);
      
      // Verify elements are being observed
      animatedElements.forEach(el => {
        expect(observers).toContain(el);
      });
      
      // Now simulate intersection
      const observer = document.querySelector('.animate-on-scroll').__observer;
      observer.simulateIntersection(true);
      
      // Verify elements now have fade-in class
      animatedElements.forEach(el => {
        expect(el.classList.contains('fade-in')).toBe(true);
      });
    });
    
    test('should apply fade-in class as fallback when IntersectionObserver is not available', () => {
      // Save original IntersectionObserver
      const OriginalIntersectionObserver = window.IntersectionObserver;
      
      try {
        // Set IntersectionObserver to undefined
        delete window.IntersectionObserver;
        
        // Get animated elements before reloading the script
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        // Remove any existing fade-in classes
        animatedElements.forEach(el => el.classList.remove('fade-in'));
        
        // Reload the script and trigger DOMContentLoaded
        loadJavaScript('src/public/js/main.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));
        
        // Verify all elements have the fade-in class (fallback behavior)
        animatedElements.forEach(el => {
          expect(el.classList.contains('fade-in')).toBe(true);
        });
      } finally {
        // Restore IntersectionObserver
        window.IntersectionObserver = OriginalIntersectionObserver;
      }
    });
  });
  
  describe('Mobile Navigation', () => {
    test('mobile menu button should be hidden on large screens', () => {
      // Set large screen size
      window.resizeTo(1024, 768);
      
      // Trigger the resize event handlers manually (some browsers need this)
      window.dispatchEvent(new Event('resize'));
      
      const mobileMenuButton = document.getElementById('mobile-menu-button');
      expect(mobileMenuButton.style.display).toBe('none');
    });
    
    test('mobile menu button should be visible on small screens', () => {
      // Set small screen size
      window.resizeTo(767, 600);
      
      // Trigger resize handlers
      window.dispatchEvent(new Event('resize'));
      
      const mobileMenuButton = document.getElementById('mobile-menu-button');
      expect(mobileMenuButton.style.display).toBe('block');
    });
    
    test('should show mobile menu when button is clicked', () => {
      // Ensure mobile navigation is available
      if (!document.getElementById('mobile-nav')) {
        document.body.innerHTML += `
          <div id="mobile-nav">
            <button id="mobile-nav-close">Close</button>
            <div class="mobile-nav-links">
              <a href="#">Link 1</a>
              <a href="#">Link 2</a>
            </div>
          </div>
        `;
      }
      
      const mobileMenuButton = document.getElementById('mobile-menu-button');
      const mobileNav = document.getElementById('mobile-nav');
      
      // Ensure mobile view is active
      window.resizeTo(767, 600);
      window.dispatchEvent(new Event('resize'));
      
      // Make sure mobile nav is initially closed
      expect(mobileNav.classList.contains('active')).toBe(false);
      
      // Click the menu button
      mobileMenuButton.click();
      
      // Verify mobile nav is now open
      expect(mobileNav.classList.contains('active')).toBe(true);
      expect(document.body.style.overflow).toBe('hidden');
    });
    
    test('should close mobile menu when close button is clicked', () => {
      const mobileMenuButton = document.getElementById('mobile-menu-button');
      const mobileNavClose = document.getElementById('mobile-nav-close');
      const mobileNav = document.getElementById('mobile-nav');
      
      // Open menu first
      mobileMenuButton.click();
      expect(mobileNav.classList.contains('active')).toBe(true);
      
      // Click close button
      mobileNavClose.click();
      
      // Verify menu is closed
      expect(mobileNav.classList.contains('active')).toBe(false);
      expect(document.body.style.overflow).toBe('');
    });
    
    test('should close mobile menu when a nav link is clicked', () => {
      const mobileMenuButton = document.getElementById('mobile-menu-button');
      const mobileNav = document.getElementById('mobile-nav');
      const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');
      
      // Open menu first
      mobileMenuButton.click();
      expect(mobileNav.classList.contains('active')).toBe(true);
      
      // Click a nav link
      mobileNavLinks[0].click();
      
      // Verify menu is closed
      expect(mobileNav.classList.contains('active')).toBe(false);
      expect(document.body.style.overflow).toBe('');
    });
  });
});