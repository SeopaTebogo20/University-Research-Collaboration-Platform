
document.addEventListener('DOMContentLoaded', function() {
    // Initialize researcher dashboard
    initializeDashboard();

    // Set up event listeners
    setupEventListeners();
});

// Initialize the dashboard with data and components
function initializeDashboard() {
    // Update current date
    updateCurrentDate();
    
    // Initialize charts
    initializeResearchActivityChart();
    initializeResearchAreasChart();
    
    // Initialize calendar
    initializeResearchCalendar();
    
    // Set up timeframe buttons
    setupTimeframeButtons();
    
    // Load dashboard data
    loadDashboardData();
    
    // Add fade-in animations
    addAnimations();
}

// Update current date display
function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
}

// Load dashboard data from API or use mock data
async function loadDashboardData() {
    try {
        // Simulate API call with setTimeout
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Update dashboard statistics with mock data
        animateMetricCounters({
            activeProjects: 14,
            collaborators: 27,
            publications: 8,
            pendingInvitations: 5
        });
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Failed to load dashboard data. Please refresh the page.', 'error');
    }
}

// Animate metric counters from 0 to target value
function animateMetricCounters(data) {
    // Find all metric values
    const metricElements = document.querySelectorAll('.metric-value');
    
    metricElements.forEach(element => {
        // Get the value from the element
        const targetValue = parseInt(element.textContent);
        if (isNaN(targetValue)) return;
        
        animateCounter(element, targetValue);
    });
}

// Animate counter from 0 to target value
function animateCounter(element, targetValue) {
    const duration = 1500;
    const startTime = performance.now();
    const startValue = 0;
    
    function updateCounter(currentTime) {
        const elapsedTime = currentTime - startTime;
        if (elapsedTime < duration) {
            const progress = elapsedTime / duration;
            const currentValue = Math.floor(progress * targetValue);
            element.textContent = currentValue;
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = targetValue;
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Initialize research activity chart
function initializeResearchActivityChart() {
    const ctx = document.getElementById('researchActivityChart');
    if (!ctx) return;
    
    // Sample data - in a real app, this would come from an API
    const activityData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Publications',
                data: [1, 0, 2, 0, 1, 0, 0, 1, 1, 0, 2, 0],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Citations',
                data: [5, 8, 6, 9, 12, 10, 13, 15, 18, 21, 25, 28],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Presentations',
                data: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1],
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }
        ]
    };
    
    const activityChart = new Chart(ctx, {
        type: 'line',
        data: activityData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1F2937',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 10,
                    displayColors: true,
                    titleFont: {
                        family: "'Inter', sans-serif",
                        size: 14
                    },
                    bodyFont: {
                        family: "'Inter', sans-serif",
                        size: 12
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        },
                        color: '#4b5563'
                    }
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: 30,
                    ticks: {
                        stepSize: 5,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        },
                        color: '#4b5563'
                    },
                    grid: {
                        color: 'rgba(229, 231, 235, 0.5)'
                    }
                }
            }
        }
    });
    
    // Store chart reference for later use
    window.activityChart = activityChart;
}

// Initialize research areas chart
function initializeResearchAreasChart() {
    const ctx = document.getElementById('researchAreasChart');
    if (!ctx) return;
    
    // Sample data - in a real app, this would come from an API
    const researchData = {
        labels: ['Quantum Computing', 'AI Ethics', 'Climate Science', 'Genomics', 'Renewable Energy'],
        datasets: [
            {
                data: [35, 25, 20, 15, 5],
                backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'],
                borderColor: '#ffffff',
                borderWidth: 2
            }
        ]
    };
    
    const researchAreasChart = new Chart(ctx, {
        type: 'doughnut',
        data: researchData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        },
                        color: '#4b5563',
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: '#1F2937',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 10,
                    displayColors: true,
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.label}: ${tooltipItem.formattedValue}%`;
                        }
                    },
                    titleFont: {
                        family: "'Inter', sans-serif",
                        size: 14
                    },
                    bodyFont: {
                        family: "'Inter', sans-serif",
                        size: 12
                    }
                }
            }
        }
    });
    
    // Store chart reference for later use
    window.researchAreasChart = researchAreasChart;
}

// Initialize research calendar
function initializeResearchCalendar() {
    const calendarEl = document.getElementById('research-calendar');
    if (!calendarEl) return;
    
    // Initialize flatpickr calendar with events
    const calendar = flatpickr(calendarEl, {
        inline: true,
        dateFormat: 'Y-m-d',
        minDate: 'today',
        maxDate: new Date().fp_incr(180), // 6 months ahead
        locale: {
            firstDayOfWeek: 1 // Start week on Monday
        },
        onMonthChange: function(selectedDates, dateStr, instance) {
            // Handle month change if needed
        },
        onYearChange: function(selectedDates, dateStr, instance) {
            // Handle year change if needed
        },
        onDayCreate: function(dObj, dStr, fp, dayElem) {
            // Add event markers to specific days
            const dateStr = dayElem.dateObj.toISOString().split('T')[0];
            
            // Sample events data - in a real app, this would come from an API
            const events = [
                { date: '2025-05-15', type: 'conference' },
                { date: '2025-05-21', type: 'deadline' },
                { date: '2025-06-04', type: 'presentation' },
                { date: '2025-05-10', type: 'meeting' },
                { date: '2025-06-15', type: 'deadline' }
            ];
            
            const event = events.find(event => event.date === dateStr);
            
            if (event) {
                const eventMarker = document.createElement('span');
                eventMarker.classList.add('event-marker', event.type);
                
                // Style the event marker based on type
                let markerColor = '#6366f1'; // Default color
                switch (event.type) {
                    case 'conference':
                        markerColor = '#6366f1'; // Primary color
                        break;
                    case 'deadline':
                        markerColor = '#ef4444'; // Error color
                        break;
                    case 'presentation':
                        markerColor = '#10b981'; // Success color
                        break;
                    case 'meeting':
                        markerColor = '#f59e0b'; // Warning color
                        break;
                }
                
                // Apply event marker styling
                eventMarker.style.cssText = `
                    display: block;
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background-color: ${markerColor};
                    position: absolute;
                    bottom: 2px;
                    left: 50%;
                    transform: translateX(-50%);
                `;
                
                dayElem.appendChild(eventMarker);
            }
        }
    });
    
    // Store calendar reference for later use
    window.researchCalendar = calendar;
}

// Set up timeframe buttons for the research activity chart
function setupTimeframeButtons() {
    const timeframeButtons = document.querySelectorAll('.timeframe-btn');
    
    timeframeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            timeframeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update chart data based on selected timeframe
            updateChartData(this.getAttribute('data-period'));
        });
    });
}

// Update chart data based on selected timeframe
function updateChartData(period) {
    // In a real app, this would fetch new data from an API
    // For this demo, we'll use predefined data sets
    
    if (!window.activityChart) return;
    
    let publicationsData, citationsData, presentationsData, labels;
    
    switch(period) {
        case 'week':
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            publicationsData = [0, 0, 1, 0, 0, 0, 0];
            citationsData = [2, 3, 2, 4, 3, 1, 2];
            presentationsData = [0, 0, 0, 1, 0, 0, 0];
            break;
        case 'month':
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            publicationsData = [0, 1, 0, 1];
            citationsData = [8, 10, 7, 12];
            presentationsData = [0, 1, 0, 1];
            break;
        case 'year':
            // Use the existing yearly data
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            publicationsData = [1, 0, 2, 0, 1, 0, 0, 1, 1, 0, 2, 0];
            citationsData = [5, 8, 6, 9, 12, 10, 13, 15, 18, 21, 25, 28];
            presentationsData = [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1];
            break;
        default:
            return;
    }
    
    // Update chart data
    window.activityChart.data.labels = labels;
    window.activityChart.data.datasets[0].data = publicationsData;
    window.activityChart.data.datasets[1].data = citationsData;
    window.activityChart.data.datasets[2].data = presentationsData;
    window.activityChart.update();
}

// Set up event listeners
function setupEventListeners() {
    // Chart download button
    const chartDownloadBtn = document.querySelector('.chart-download');
    if (chartDownloadBtn) {
        chartDownloadBtn.addEventListener('click', function() {
            // In a real app, this would download the chart as an image
            showToast('Chart data downloaded as CSV', 'success');
        });
    }
    
    // Notifications button
    const notificationsBtn = document.querySelector('.notifications-btn');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('You have 3 new notifications', 'info');
            // In a real app, this would open a notifications panel
        });
    }
    
    // Profile button
    const profileBtn = document.querySelector('.profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', function(e) {
            // This would navigate to the profile page
            // For demo, we'll just show a toast
            if (e.target.tagName !== 'A') {
                e.preventDefault();
                showToast('Navigating to profile page...', 'info');
            }
        });
    }
    
    // Navigation links highlighting
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                
                // Remove active class from all links
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                
                // Add active class to clicked link
                this.classList.add('active');
            }
        });
    });
}

// Add animations to elements
function addAnimations() {
    const animateElements = [
        '.welcome-banner', 
        '.metrics-overview',
        '.dashboard-charts',
        '.calendar-goals-section',
        '.project-status-section'
    ];
    
    animateElements.forEach((selector, index) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.classList.add('fade-in');
            element.style.animationDelay = `${index * 0.1}s`;
        });
    });
}

// Toast notification function
function showToast(message, type = 'info', duration = 5000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `toast ${type}`;
    
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    notification.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to document
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
        toastContainer.appendChild(notification);
        
        // Allow DOM to update before adding active class for animation
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);
        
        const timeout = setTimeout(() => {
            removeToast(notification);
        }, duration);
        
        const closeBtn = notification.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(timeout);
            removeToast(notification);
        });
    }
}

// Remove toast notification
function removeToast(toast) {
    toast.classList.remove('active');
    toast.classList.add('notification-hiding');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// Utility function to format dates
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Utility function to capitalize first letter
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
