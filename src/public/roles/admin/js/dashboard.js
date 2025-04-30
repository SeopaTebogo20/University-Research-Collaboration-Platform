document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Refresh button functionality
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            icon.classList.add('fa-spin');
            
            // Simulate refresh delay
            setTimeout(() => {
                icon.classList.remove('fa-spin');
                
                // Show refresh notification
                showToast('Activity log refreshed successfully', 'success');
            }, 1000);
        });
    }
    
    // Sample chart data and initialization (if using charts)
    initializeDashboardCharts();
});

// Toast notification function
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('section');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('article');
    toast.className = `toast toast-${type}`;
    
    // Set icon based on type
    let icon;
    switch(type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'error':
            icon = 'exclamation-circle';
            break;
        case 'warning':
            icon = 'exclamation-triangle';
            break;
        default:
            icon = 'info-circle';
    }
    
    // Build toast content
    toast.innerHTML = `
        <i class="fas fa-${icon} toast-icon"></i>
        <section class="toast-content">
            <p>${message}</p>
        </section>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('active');
    }, 10);
    
    // Add close button functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.classList.remove('active');
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('active');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Initialize dashboard charts (placeholder function)
function initializeDashboardCharts() {
    // This is a placeholder for chart initialization
    // If you want to add charts, you can use libraries like Chart.js
    // Example implementation would go here
    
    // Example: console.log('Charts initialized');
}

// Simulate a logout
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Show logout notification
            showToast('Logging out...', 'info');
            
            // Simulate logout delay and redirect
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }
});