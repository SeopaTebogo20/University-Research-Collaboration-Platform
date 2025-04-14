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

        // Create a common simulateIntersection method for testing
        const simulateIntersection = function(isIntersecting) {
            if (isIntersecting) {
                // Add fade-in class to ALL animated elements for testing purposes
                animatedElements.forEach(el => {
                    el.classList.add('fade-in');
                    observer.unobserve(el);
                });
            }
        };

        animatedElements.forEach(el => {
            observer.observe(el);
            // Store observer reference for testing purposes
            el.__observer = {
                simulateIntersection: simulateIntersection
            };
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        animatedElements.forEach(el => {
            el.classList.add('fade-in');
        });
    }

    // Mobile navigation setup
    const mobileNavButton = document.getElementById('mobile-menu-button');
    const mobileNavClose = document.getElementById('mobile-nav-close');
    const mobileNav = document.getElementById('mobile-nav');
    
    // Set initial display state for mobile menu button
    checkMobileView();
    
    // Check when window is resized
    window.addEventListener('resize', checkMobileView);
    
    // Open mobile menu
    if (mobileNavButton) {
        mobileNavButton.addEventListener('click', function() {
            if (mobileNav) {
                mobileNav.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
            }
        });
    }
    
    // Close mobile menu
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', function() {
            if (mobileNav) {
                mobileNav.classList.remove('active');
                document.body.style.overflow = ''; // Re-enable scrolling
            }
        });
    }
    
    // Close menu when clicking a link
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (mobileNav) {
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    function checkMobileView() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        if (!mobileMenuButton) return;
        
        const navLinks = document.querySelector('.nav-links');
        const navbar = document.querySelector('.navbar');
        const authButtons = document.querySelector('.navbar .auth-buttons');
        
        // Check if we're on a small screen (mobile view)
        if (window.innerWidth <= 768) {
            mobileMenuButton.style.display = 'block';
            if (navLinks) navLinks.classList.add('hidden-mobile');
            if (authButtons) authButtons.classList.add('hidden-mobile');
        } else {
            // We're on a big screen
            mobileMenuButton.style.display = 'none';
            if (navLinks) navLinks.classList.remove('hidden-mobile');
            if (authButtons) authButtons.classList.remove('hidden-mobile');
        }
    }
});