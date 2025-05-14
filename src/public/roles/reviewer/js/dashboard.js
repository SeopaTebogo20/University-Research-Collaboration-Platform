document.addEventListener('DOMContentLoaded', function() {
    // Initialize reviewer dashboard
    initializeDashboard();

    // Set up event listeners
    setupEventListeners();
    
    // Initialize calendar
    initializeCalendar();
});

// Initialize the dashboard with data and components
function initializeDashboard() {
    // Update current date
    updateCurrentDate();
    
    // Load dashboard data
    loadDashboardData();
    
    // Initialize charts
    initializeReviewsChart();
    initializeDecisionsChart();
    
    // Set up timeframe buttons
    setupTimeframeButtons();
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
        // Get user data directly from session storage
        const userData = sessionStorage.getItem('user');
        
        // Parse the user data from session storage
        const userJson = JSON.parse(userData);
        // Get user name from auth data
        const reviewerName = userJson?.name || 'Reviewer';
        
        // Update reviewer name display
        document.getElementById('reviewer-name').textContent = reviewerName;
        
        // Store reviewer name for future use
        localStorage.setItem('reviewerName', reviewerName);
        
        // Simulate loading other dashboard data (replace with actual API calls)
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Update dashboard statistics with mock data
        updateDashboardStats({
            totalAssigned: 12,
            pendingReviews: 5,
            completedReviews: 7,
            avgTime: '3.5 days'
        });
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Failed to load dashboard data. Please refresh the page.', 'error');
        
        // Fallback to stored name if available
        const storedName = localStorage.getItem('reviewerName');
        if (storedName) {
            document.getElementById('reviewer-name').textContent = storedName;
        }
        
        // Use default stats if API fails
        updateDashboardStats({
            totalAssigned: 0,
            pendingReviews: 0,
            completedReviews: 0,
            avgTime: '0 days'
        });
    }
}

// Update dashboard statistics
function updateDashboardStats(stats) {
    document.getElementById('total-assigned').textContent = stats.totalAssigned;
    document.getElementById('pending-reviews').textContent = stats.pendingReviews;
    document.getElementById('completed-reviews').textContent = stats.completedReviews;
    document.getElementById('avg-time').textContent = stats.avgTime;
}

// Initialize flatpickr calendar with events
function initializeCalendar() {
    // Sample events data - in a real app, this would come from an API
    const calendarEvents = [
        { date: '2025-05-10', title: 'AI Ethics Proposal Review', category: 'pending' },
        { date: '2025-05-15', title: 'Quantum Computing Proposal Review', category: 'urgent' },
        { date: '2025-05-22', title: 'Machine Learning Ethics Study', category: 'upcoming' },
        { date: '2025-05-30', title: 'Renewable Energy Innovation', category: 'upcoming' }
    ];
    
    // Update calendar month display
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('calendar-month').textContent = currentMonth;

    // Initialize flatpickr
    const calendar = flatpickr('#calendar-widget', {
        inline: true,
        dateFormat: 'Y-m-d',
        minDate: 'today',
        enable: calendarEvents.map(event => event.date),
        onDayCreate: function(dObj, dStr, fp, dayElem) {
            // Find the events for this day
            const dayDate = dayElem.dateObj.toISOString().split('T')[0];
            const eventsForDay = calendarEvents.filter(event => event.date === dayDate);
            
            if (eventsForDay.length > 0) {
                // Add event marker to the day element
                const eventMarker = document.createElement('span');
                eventMarker.className = `event-marker ${eventsForDay[0].category}`;
                dayElem.appendChild(eventMarker);
                
                // Add tooltip with event title
                dayElem.title = eventsForDay.map(event => event.title).join('\n');
            }
        }
    });

    // Populate upcoming deadlines
    populateUpcomingDeadlines(calendarEvents);
}

// Populate upcoming deadlines list
function populateUpcomingDeadlines(events) {
    const deadlinesList = document.getElementById('deadlines-list');
    deadlinesList.innerHTML = '';
    
    // Sort events by date
    const sortedEvents = events.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Add each event to the deadlines list
    sortedEvents.forEach(event => {
        const date = new Date(event.date);
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const daysUntil = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
        
        const deadlineItem = document.createElement('li');
        deadlineItem.className = 'deadline-item';
        
        deadlineItem.innerHTML = `
            <div class="deadline-date">
                <span class="day">${day}</span>
                <span class="month">${month}</span>
            </div>
            <div class="deadline-info">
                <h4>${event.title}</h4>
                <p>Due in ${daysUntil} days</p>
            </div>
            <div class="deadline-status ${event.category}">
                <i class="fas fa-${event.category === 'urgent' ? 'exclamation-circle' : 'clock'}"></i>
                ${event.category === 'urgent' ? 'Urgent' : 'Upcoming'}
            </div>
        `;
        
        deadlinesList.appendChild(deadlineItem);
    });
}

// Initialize reviews chart
function initializeReviewsChart() {
    const ctx = document.getElementById('reviewsCompletedChart').getContext('2d');
    
    // Sample data - in a real app, this would come from an API
    const monthlyData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Reviews Completed',
                data: [8, 10, 6, 12, 9, 11, 7, 5, 8, 13, 10, 9],
                borderColor: '#6D28D9',
                backgroundColor: 'rgba(109, 40, 217, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }
        ]
    };
    
    const reviewsChart = new Chart(ctx, {
        type: 'line',
        data: monthlyData,
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
                    displayColors: false,
                    callbacks: {
                        title: function(tooltipItem) {
                            return tooltipItem[0].label;
                        },
                        label: function(tooltipItem) {
                            return `${tooltipItem.formattedValue} Reviews Completed`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 15,
                    ticks: {
                        stepSize: 5
                    }
                }
            }
        }
    });

    // Store chart reference for later use
    window.reviewsChart = reviewsChart;
}

// Initialize review decisions chart
function initializeDecisionsChart() {
    const ctx = document.getElementById('reviewDecisionsChart').getContext('2d');
    
    // Sample data - in a real app, this would come from an API
    const decisionsData = {
        labels: ['Approved', 'Revisions', 'Rejected'],
        datasets: [
            {
                data: [60, 30, 10],
                backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
                borderColor: '#ffffff',
                borderWidth: 2
            }
        ]
    };
    
    const decisionsChart = new Chart(ctx, {
        type: 'doughnut',
        data: decisionsData,
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
                    displayColors: false,
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.label}: ${tooltipItem.formattedValue}%`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

// Set up timeframe buttons for the reviews chart
function setupTimeframeButtons() {
    const timeframeButtons = document.querySelectorAll('.timeframe-btn');
    
    timeframeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            timeframeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update chart data based on selected timeframe
            const period = this.getAttribute('data-period');
            updateChartData(period);
        });
    });
}

// Update chart data based on selected timeframe
function updateChartData(period) {
    // Sample data for different timeframes - in a real app, this would come from an API
    let labels, data;
    
    switch(period) {
        case 'week':
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            data = [2, 1, 3, 0, 2, 1, 0];
            break;
        case 'month':
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            data = [6, 8, 7, 5];
            break;
        case 'year':
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            data = [8, 10, 6, 12, 9, 11, 7, 5, 8, 13, 10, 9];
            break;
        default:
            return;
    }
    
    // Update chart data
    if (window.reviewsChart) {
        window.reviewsChart.data.labels = labels;
        window.reviewsChart.data.datasets[0].data = data;
        window.reviewsChart.update();
    }
}

// Set up calendar navigation
function setupCalendarNavigation() {
    const prevButton = document.querySelector('.calendar-nav.prev');
    const nextButton = document.querySelector('.calendar-nav.next');
    
    prevButton.addEventListener('click', function() {
        navigateCalendar(-1);
    });
    
    nextButton.addEventListener('click', function() {
        navigateCalendar(1);
    });
}

// Navigate calendar by specified number of months
function navigateCalendar(monthsToAdd) {
    // Get current displayed month
    const currentMonthDisplay = document.getElementById('calendar-month').textContent;
    const [monthName, year] = currentMonthDisplay.split(' ');
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    let monthIndex = months.indexOf(monthName);
    let yearNum = parseInt(year);
    
    // Calculate new month and year
    monthIndex += monthsToAdd;
    
    if (monthIndex < 0) {
        monthIndex = 11;
        yearNum--;
    } else if (monthIndex > 11) {
        monthIndex = 0;
        yearNum++;
    }
    
    // Update calendar month display
    document.getElementById('calendar-month').textContent = `${months[monthIndex]} ${yearNum}`;
    
    // In a real app, this would update the calendar widget and fetch new events for the month
    // For this demo, we'll just simulate an update
    setTimeout(() => {
        showToast(`Calendar updated to ${months[monthIndex]} ${yearNum}`, 'info');
    }, 100);
}

// Set up event listeners
function setupEventListeners() {
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to log out?')) {
            // Clear session/local storage
            localStorage.removeItem('reviewerName');
            localStorage.removeItem('reviewerToken');

            // Redirect to login
            window.location.href = '/login';
        }
    });
    
    // Chart download button
    document.querySelector('.chart-download').addEventListener('click', function() {
        // In a real app, this would download the chart as an image
        showToast('Chart downloaded successfully', 'success');
    });
}

// Toast notification function
function showToast(message, type = 'info', duration = 5000) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
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
    
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('active');
    }, 10);
    
    const timeout = setTimeout(() => {
        removeToast(toast);
    }, duration);
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(timeout);
        removeToast(toast);
    });
}

// Remove toast notification
function removeToast(toast) {
    toast.classList.remove('active');
    setTimeout(() => {
        toast.remove();
    }, 300);
}

// Utility function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
