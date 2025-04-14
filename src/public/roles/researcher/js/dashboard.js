
// Dashboard JavaScript

// DOM Elements
const profileBtn = document.getElementById('profileBtn');
const profileMenu = document.getElementById('profileMenu');
const notificationBtn = document.getElementById('notificationBtn');
const notificationsModal = document.getElementById('notificationsModal');
const modalClose = document.querySelector('.modal-close');
const currentDateElement = document.getElementById('currentDate');
const chartContainer = document.getElementById('researchOutputChart');
const periodBtns = document.querySelectorAll('.period-btn');
const mobileMenuToggle = document.createElement('button');

// Set up mobile menu toggle
function setupMobileMenu() {
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.setAttribute('aria-label', 'Toggle menu');
    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    
    document.querySelector('.dashboard-nav').prepend(mobileMenuToggle);
    
    mobileMenuToggle.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
        document.querySelector('.nav-links').classList.toggle('active');
    });
}

// Display current date
function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = now.toLocaleDateString('en-US', options);
}

// Toggle profile dropdown
function toggleProfileMenu() {
    profileMenu.classList.toggle('active');
    // Close notifications if open
    notificationsModal.classList.remove('active');
}

// Toggle notifications modal
function toggleNotifications() {
    notificationsModal.classList.toggle('active');
    // Close profile menu if open
    profileMenu.classList.remove('active');
}

// Close modals when clicking outside
function handleDocumentClick(event) {
    // Close profile menu if open and clicked outside
    if (profileMenu.classList.contains('active') && 
        !profileBtn.contains(event.target) && 
        !profileMenu.contains(event.target)) {
        profileMenu.classList.remove('active');
    }
    
    // Close notifications if open and clicked outside
    if (notificationsModal.classList.contains('active') && 
        !notificationBtn.contains(event.target) && 
        !notificationsModal.contains(event.target)) {
        notificationsModal.classList.remove('active');
    }
}

// Research Output Chart
function initResearchOutputChart() {
    // Chart configuration
    const monthlyData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Publications',
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 2,
                data: [2, 1, 0, 3, 1, 2, 0, 1, 0, 1, 0, 1],
                tension: 0.4
            },
            {
                label: 'Collaborations',
                backgroundColor: 'rgba(124, 58, 237, 0.2)',
                borderColor: 'rgba(124, 58, 237, 1)',
                borderWidth: 2,
                data: [4, 3, 5, 2, 1, 3, 4, 2, 5, 3, 2, 4],
                tension: 0.4
            },
            {
                label: 'Grants',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                data: [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
                tension: 0.4
            }
        ]
    };
    
    const quarterlyData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
            {
                label: 'Publications',
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 2,
                data: [3, 6, 1, 2],
                tension: 0.4
            },
            {
                label: 'Collaborations',
                backgroundColor: 'rgba(124, 58, 237, 0.2)',
                borderColor: 'rgba(124, 58, 237, 1)',
                borderWidth: 2,
                data: [12, 6, 11, 9],
                tension: 0.4
            },
            {
                label: 'Grants',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                data: [1, 1, 1, 1],
                tension: 0.4
            }
        ]
    };
    
    const yearlyData = {
        labels: ['2021', '2022', '2023', '2024', '2025'],
        datasets: [
            {
                label: 'Publications',
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 2,
                data: [5, 8, 10, 12, 9],
                tension: 0.4
            },
            {
                label: 'Collaborations',
                backgroundColor: 'rgba(124, 58, 237, 0.2)',
                borderColor: 'rgba(124, 58, 237, 1)',
                borderWidth: 2,
                data: [12, 18, 22, 30, 36],
                tension: 0.4
            },
            {
                label: 'Grants',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                data: [1, 2, 3, 4, 3],
                tension: 0.4
            }
        ]
    };
    
    // Create chart with responsive options
    const ctx = chartContainer.getContext('2d');
    let researchChart = new Chart(ctx, {
        type: 'line',
        data: monthlyData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        // Make legend responsive
                        boxWidth: window.innerWidth < 768 ? 8 : 12,
                        padding: window.innerWidth < 768 ? 10 : 15,
                        font: {
                            size: window.innerWidth < 768 ? 10 : 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1F2937',
                    bodyColor: '#1F2937',
                    borderColor: '#E5E7EB',
                    borderWidth: 1,
                    bodyFont: {
                        family: "'Inter', sans-serif"
                    },
                    titleFont: {
                        family: "'Inter', sans-serif",
                        weight: 'bold'
                    },
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        precision: 0,
                        // Responsive font size
                        font: {
                            size: window.innerWidth < 768 ? 10 : 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        // Responsive font size
                        font: {
                            size: window.innerWidth < 768 ? 10 : 12
                        }
                    }
                }
            }
        }
    });
    
    // Handle period button clicks
    periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            periodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const period = btn.dataset.period;
            
            // Update chart data based on period
            if (period === 'monthly') {
                researchChart.data = monthlyData;
            } else if (period === 'quarterly') {
                researchChart.data = quarterlyData;
            } else if (period === 'yearly') {
                researchChart.data = yearlyData;
            }
            
            researchChart.update();
        });
    });
    
    // Handle window resize for responsive chart
    window.addEventListener('resize', () => {
        researchChart.options.plugins.legend.labels.boxWidth = window.innerWidth < 768 ? 8 : 12;
        researchChart.options.plugins.legend.labels.padding = window.innerWidth < 768 ? 10 : 15;
        researchChart.options.plugins.legend.labels.font.size = window.innerWidth < 768 ? 10 : 12;
        researchChart.options.scales.y.ticks.font.size = window.innerWidth < 768 ? 10 : 12;
        researchChart.options.scales.x.ticks.font.size = window.innerWidth < 768 ? 10 : 12;
        researchChart.update();
    });
    
    return researchChart;
}

// Initialize dashboard
function initDashboard() {
    updateCurrentDate();
    setupMobileMenu();
    
    // Event listeners
    profileBtn.addEventListener('click', toggleProfileMenu);
    notificationBtn.addEventListener('click', toggleNotifications);
    document.addEventListener('click', handleDocumentClick);
    
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            notificationsModal.classList.remove('active');
        });
    }
    
    // Initialize charts
    if (chartContainer) {
        initResearchOutputChart();
    }
    
    // Set up project interaction
    setupProjectInteractions();
    
    // Set up collaboration request handlers
    setupCollaborationHandlers();
    
    // Handle keyboard accessibility
    setupKeyboardAccessibility();
    
    // Set up responsive behaviors
    setupResponsiveBehaviors();
}

// Set up keyboard accessibility
function setupKeyboardAccessibility() {
    // Make profile menu keyboard accessible
    profileBtn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleProfileMenu();
        }
    });
    
    // Make notification button keyboard accessible
    notificationBtn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleNotifications();
        }
    });
    
    // Close modals on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            notificationsModal.classList.remove('active');
            profileMenu.classList.remove('active');
        }
    });
}

// Set up project interactions
function setupProjectInteractions() {
    const projectItems = document.querySelectorAll('.project-item');
    
    projectItems.forEach(item => {
        item.addEventListener('click', function() {
            // In a real app, we would navigate to the project detail page
            // For now, we'll just add a simple highlight effect
            projectItems.forEach(p => p.classList.remove('active-project'));
            this.classList.add('active-project');
        });
        
        // Ensure keyboard accessibility for project items
        item.setAttribute('tabindex', '0');
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// Set up collaboration request handlers
function setupCollaborationHandlers() {
    const acceptButtons = document.querySelectorAll('.collaboration-actions .btn-primary');
    const declineButtons = document.querySelectorAll('.collaboration-actions .btn-outline');
    
    // Handle accept buttons
    acceptButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const collaborationItem = this.closest('.collaboration-item');
            const collaboratorName = collaborationItem.querySelector('h4').textContent;
            
            // Show acceptance feedback
            this.innerHTML = '<i class="fas fa-check"></i> Accepted';
            this.disabled = true;
            this.nextElementSibling.style.display = 'none';
            
            // In a real app, we would send this to the server
            console.log(`Accepted collaboration with ${collaboratorName}`);
            
            // Simulate removing the item after a delay
            setTimeout(() => {
                collaborationItem.style.opacity = '0.5';
                collaborationItem.style.pointerEvents = 'none';
            }, 1500);
        });
    });
    
    // Handle decline buttons
    declineButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const collaborationItem = this.closest('.collaboration-item');
            const collaboratorName = collaborationItem.querySelector('h4').textContent;
            
            // Show decline feedback
            this.innerHTML = '<i class="fas fa-times"></i> Declined';
            this.disabled = true;
            this.previousElementSibling.style.display = 'none';
            
            // In a real app, we would send this to the server
            console.log(`Declined collaboration with ${collaboratorName}`);
            
            // Simulate removing the item after a delay
            setTimeout(() => {
                collaborationItem.style.opacity = '0.5';
                collaborationItem.style.pointerEvents = 'none';
            }, 1500);
        });
    });
}

// Set up responsive behaviors
function setupResponsiveBehaviors() {
    // Handle window resize to update UI
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            // Reset sidebar visibility on larger screens
            document.querySelector('.sidebar').classList.remove('active');
            // Reset menu visibility on larger screens
            document.querySelector('.nav-links').classList.remove('active');
        }
    });
    
    // Add swipe gestures for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    });
    
    function handleSwipeGesture() {
        const sidebar = document.querySelector('.sidebar');
        
        // Swipe right to open sidebar
        if (touchEndX - touchStartX > 100) {
            sidebar.classList.add('active');
        }
        
        // Swipe left to close sidebar
        if (touchStartX - touchEndX > 100) {
            sidebar.classList.remove('active');
        }
    }
}

// Initialize everything when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initDashboard);

// Simulate notifications and new messages coming in
function simulateActivity() {
    // Variables to hold our timeout IDs
    let notificationTimeout;
    let projectUpdateTimeout;
    
    // Simulate a new notification after random interval
    function scheduleNotification() {
        const delay = Math.floor(Math.random() * 60000) + 30000; // 30-90 seconds
        notificationTimeout = setTimeout(() => {
            const badge = document.querySelector('.badge');
            if (badge) {
                let count = parseInt(badge.textContent);
                badge.textContent = count + 1;
                
                // Flash the notification button
                notificationBtn.classList.add('notification-highlight');
                setTimeout(() => {
                    notificationBtn.classList.remove('notification-highlight');
                }, 2000);
            }
            
            // Schedule the next notification
            scheduleNotification();
        }, delay);
    }
    
    // Simulate project updates after random interval
    function scheduleProjectUpdate() {
        const delay = Math.floor(Math.random() * 120000) + 60000; // 1-3 minutes
        projectUpdateTimeout = setTimeout(() => {
            // Update a random project progress
            const projectItems = document.querySelectorAll('.project-item');
            if (projectItems.length > 0) {
                const randomIndex = Math.floor(Math.random() * projectItems.length);
                const randomProject = projectItems[randomIndex];
                
                const progressValue = randomProject.querySelector('.progress-value');
                const progressFilled = randomProject.querySelector('.progress-filled');
                
                // Get current progress and increase it slightly
                if (progressValue && progressFilled) {
                    let currentProgress = parseInt(progressValue.textContent);
                    if (currentProgress < 100) {
                        currentProgress = Math.min(currentProgress + Math.floor(Math.random() * 5) + 1, 100);
                        progressValue.textContent = currentProgress + '%';
                        progressFilled.style.width = currentProgress + '%';
                        
                        // Flash the progress bar
                        progressFilled.classList.add('progress-update');
                        setTimeout(() => {
                            progressFilled.classList.remove('progress-update');
                        }, 2000);
                    }
                }
            }
            
            // Schedule the next update
            scheduleProjectUpdate();
        }, delay);
    }
    
    // Start the simulation
    scheduleNotification();
    scheduleProjectUpdate();
    
    // Return a cleanup function
    return function cleanup() {
        clearTimeout(notificationTimeout);
        clearTimeout(projectUpdateTimeout);
    };
}

// Start the activity simulation after a short delay
setTimeout(simulateActivity, 5000);

// Function to adjust sidebar height to not overlap footer
function adjustSidebarHeight() {
    const sidebar = document.querySelector('.sidebar');
    const footer = document.querySelector('.footer');
    
    if (sidebar && footer) {
        // Get the position of the footer relative to the viewport
        const footerRect = footer.getBoundingClientRect();
        const footerTop = footerRect.top;
        
        // Calculate the maximum height for the sidebar
        const sidebarMaxHeight = footerTop - 64; // 64px is the navbar height (4rem)
        
        // Update the sidebar height
        sidebar.style.height = `${sidebarMaxHeight}px`;
    }
}

// Run the adjustment on page load
document.addEventListener('DOMContentLoaded', adjustSidebarHeight);

// Also run it when the window is resized
window.addEventListener('resize', adjustSidebarHeight);