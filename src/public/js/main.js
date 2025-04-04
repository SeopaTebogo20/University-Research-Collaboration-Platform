
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

//JavaScript for mobile menu toggle 

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
