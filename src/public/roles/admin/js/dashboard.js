document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin dashboard
    initializeDashboard();

    // Set up event listeners
    setupEventListeners();
    
    // Initialize modals
    initializeModals();
});

// Initialize the dashboard with data and components
function initializeDashboard() {
    // Update current date
    updateCurrentDate();
    
    // Load dashboard data
    loadDashboardData();
    
    // Initialize charts
    initializeUserActivityChart();
    initializeProposalDistributionChart();
    
    // Initialize calendar
    initializeCalendar();
    
    // Initialize gauge animations
    initializeGauges();
    
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
        const userJson = sessionStorage.getItem('user');
        
        if (!userJson) {
            // Redirect to login if not authenticated
            window.location.href = '/login';
            return;
        }
        
        // Parse the user data from session storage
        const userData = JSON.parse(userJson);
        
        // Get user name from user data
        const adminName = userData?.name || 'Administrator';
        
        // Update admin name display
        document.getElementById('admin-name').textContent = adminName;
        
        // Store admin name for future use
        localStorage.setItem('adminName', adminName);
        
        // Simulate loading other dashboard data (replace with actual API calls)
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Update dashboard statistics with mock data
        updateDashboardStats({
            totalUsers: 248,
            activeProposals: 42,
            pendingReviews: 17,
            systemHealth: 98
        });
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        
        // Use window.toast if available, otherwise fall back to alert
        if (window.toast) {
            window.toast.error('Failed to load dashboard data. Please refresh the page.');
        } else {
            alert('Failed to load dashboard data. Please refresh the page.');
        }
        
        // Fallback to stored name if available
        const storedName = localStorage.getItem('adminName');
        if (storedName) {
            document.getElementById('admin-name').textContent = storedName;
        }
    }
}

// Update dashboard statistics
function updateDashboardStats(stats) {
    // Use CountUp animation for statistics
    animateCounter('total-users', stats.totalUsers);
    animateCounter('active-proposals', stats.activeProposals);
    animateCounter('pending-reviews', stats.pendingReviews);
    animateCounter('system-health', stats.systemHealth);
}

// Animate counter from 0 to target value
function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
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

// Initialize user activity chart
function initializeUserActivityChart() {
    const ctx = document.getElementById('userActivityChart').getContext('2d');
    
    // Sample data - in a real app, this would come from an API
    const userData = {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [
            {
                label: 'Researchers',
                data: [28, 32, 25, 37, 41, 22, 15],
                borderColor: '#6D28D9',
                backgroundColor: 'rgba(109, 40, 217, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Reviewers',
                data: [15, 17, 12, 19, 22, 18, 10],
                borderColor: '#2563EB',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }
        ]
    };
    
    const userActivityChart = new Chart(ctx, {
        type: 'line',
        data: userData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 6
                    }
                },
                tooltip: {
                    backgroundColor: '#1F2937',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 10,
                    displayColors: true
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
                    suggestedMax: 50,
                    ticks: {
                        stepSize: 10
                    }
                }
            }
        }
    });
    
    // Store chart reference for later use
    window.userActivityChart = userActivityChart;
}

// Initialize proposal distribution chart
function initializeProposalDistributionChart() {
    const ctx = document.getElementById('proposalDistributionChart').getContext('2d');
    
    // Sample data - in a real app, this would come from an API
    const proposalData = {
        labels: ['AI Ethics', 'Climate Science', 'Healthcare', 'Renewable Energy', 'Other'],
        datasets: [
            {
                data: [25, 20, 30, 15, 10],
                backgroundColor: ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#6B7280'],
                borderColor: '#ffffff',
                borderWidth: 2
            }
        ]
    };
    
    const proposalDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: proposalData,
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

// Initialize flatpickr calendar with events
function initializeCalendar() {
    // Sample events data - in a real app, this would come from an API
    const calendarEvents = [
        { date: '2025-05-10', title: 'Quarterly Review Meeting', category: 'important' },
        { date: '2025-05-12', title: 'System Maintenance', category: 'standard' },
        { date: '2025-05-15', title: 'Research Grant Deadline', category: 'deadline' },
        { date: '2025-05-20', title: 'New Reviewer Onboarding', category: 'standard' },
        { date: '2025-05-25', title: 'Database Backup', category: 'standard' }
    ];
    
    // Update calendar month display
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('calendar-month').textContent = currentMonth;

    // Initialize flatpickr
    const calendar = flatpickr('#calendar-widget', {
        inline: true,
        dateFormat: 'Y-m-d',
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

    // Populate upcoming events
    populateUpcomingEvents(calendarEvents);
    
    // Setup calendar navigation
    setupCalendarNavigation();
}

// Populate upcoming events list
function populateUpcomingEvents(events) {
    const eventsList = document.getElementById('events-list');
    eventsList.innerHTML = '';
    
    // Sort events by date
    const sortedEvents = events.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Add each event to the events list
    sortedEvents.forEach(event => {
        const date = new Date(event.date);
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        
        const eventItem = document.createElement('li');
        eventItem.className = 'event-item';
        
        eventItem.innerHTML = `
            <div class="event-date">
                <span class="day">${day}</span>
                <span class="month">${month}</span>
            </div>
            <div class="event-info">
                <h4>${event.title}</h4>
                <p>Time details will appear here</p>
            </div>
            <div class="event-status ${event.category}">
                <i class="fas fa-${event.category === 'important' ? 'star' : 
                               event.category === 'deadline' ? 'clock' : 'calendar-check'}"></i>
                ${capitalizeFirstLetter(event.category)}
            </div>
        `;
        
        eventsList.appendChild(eventItem);
    });
}

// Set up timeframe buttons for the user activity chart
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
    
    let researcherData, reviewerData, labels;
    
    switch(period) {
        case 'week':
            labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            researcherData = [28, 32, 25, 37, 41, 22, 15];
            reviewerData = [15, 17, 12, 19, 22, 18, 10];
            break;
        case 'month':
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            researcherData = [120, 145, 132, 150];
            reviewerData = [65, 72, 70, 82];
            break;
        case 'year':
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            researcherData = [450, 420, 480, 470, 540, 560, 490, 420, 510, 530, 580, 610];
            reviewerData = [210, 200, 220, 215, 240, 260, 230, 200, 220, 250, 270, 290];
            break;
        default:
            return;
    }
    
    // Update chart data if chart exists
    if (window.userActivityChart) {
        window.userActivityChart.data.labels = labels;
        window.userActivityChart.data.datasets[0].data = researcherData;
        window.userActivityChart.data.datasets[1].data = reviewerData;
        window.userActivityChart.update();
    }
}

// Setup calendar navigation
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
    
    // In a real app, this would fetch new events for the month
    // For this demo, we'll simulate a fetch
    fetchEventsForMonth(monthIndex, yearNum);
}

// Fetch events for specified month
function fetchEventsForMonth(monthIndex, year) {
    // In a real app, this would make an API request
    // For this demo, we'll generate mock data
    
    const month = monthIndex + 1; // JavaScript months are 0-indexed
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Generate random events
    const events = [];
    const categories = ['important', 'deadline', 'standard'];
    const eventTitles = [
        'Team Meeting',
        'System Maintenance',
        'Grant Deadline',
        'User Training',
        'Database Backup',
        'Security Audit',
        'Performance Review',
        'Budget Planning'
    ];
    
    // Generate 3-5 random events for the month
    const numEvents = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numEvents; i++) {
        const day = 1 + Math.floor(Math.random() * daysInMonth);
        const paddedDay = day.toString().padStart(2, '0');
        const paddedMonth = month.toString().padStart(2, '0');
        
        events.push({
            date: `${year}-${paddedMonth}-${paddedDay}`,
            title: eventTitles[Math.floor(Math.random() * eventTitles.length)],
            category: categories[Math.floor(Math.random() * categories.length)]
        });
    }
    
    // Update calendar with new events
    if (window.calendar) {
        window.calendar.destroy();
    }
    
    // Initialize flatpickr with new events
    window.calendar = flatpickr('#calendar-widget', {
        inline: true,
        dateFormat: 'Y-m-d',
        defaultDate: new Date(year, monthIndex, 1),
        onDayCreate: function(dObj, dStr, fp, dayElem) {
            // Find the events for this day
            const dayDate = dayElem.dateObj.toISOString().split('T')[0];
            const eventsForDay = events.filter(event => event.date === dayDate);
            
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
    
    // Update upcoming events list
    populateUpcomingEvents(events);
}

// Initialize gauge animations
function initializeGauges() {
    document.querySelectorAll('.gauge-value').forEach(gauge => {
        const value = gauge.style.getPropertyValue('--gauge-value');
        animateGauge(gauge, parseFloat(value));
    });
}

// Animate gauge from 0 to target value
function animateGauge(element, targetValue) {
    const duration = 1500;
    const startTime = performance.now();
    
    function updateGauge(currentTime) {
        const elapsedTime = currentTime - startTime;
        if (elapsedTime < duration) {
            const progress = elapsedTime / duration;
            const currentValue = progress * targetValue;
            const dashArray = 314.16; // 2 * PI * 50 (circle radius)
            const dashOffset = dashArray * (1 - currentValue);
            
            element.style.strokeDasharray = dashArray;
            element.style.strokeDashoffset = dashOffset;
            
            requestAnimationFrame(updateGauge);
        } else {
            const dashArray = 314.16;
            const dashOffset = dashArray * (1 - targetValue);
            
            element.style.strokeDasharray = dashArray;
            element.style.strokeDashoffset = dashOffset;
        }
    }
    
    requestAnimationFrame(updateGauge);
}

// Set up event listeners
function setupEventListeners() {
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to log out?')) {
            // Clear session/local storage
            localStorage.removeItem('adminName');
            localStorage.removeItem('adminToken');

            // Redirect to login
            window.location.href = '/login';
        }
    });
    
    // Send notification button
    document.getElementById('send-notification').addEventListener('click', function(e) {
        e.preventDefault();
        openModal('notification-modal');
    });
    
    // Export report button
    document.getElementById('export-report').addEventListener('click', function(e) {
        e.preventDefault();
        openModal('export-modal');
    });
    
    // Chart download button
    document.querySelector('.chart-download').addEventListener('click', function() {
        // In a real app, this would download the chart as an image
        showToast('Chart downloaded successfully', 'success');
    });
    
    // Date range change handler for export modal
    document.getElementById('date-range').addEventListener('change', function() {
        const customRange = this.value === 'custom';
        document.querySelector('.date-picker-group').style.display = customRange ? 'block' : 'none';
    });
    
    // Notification form submission
    document.getElementById('notification-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('notification-title').value;
        const message = document.getElementById('notification-message').value;
        const type = document.getElementById('notification-type').value;
        const recipients = document.getElementById('notification-recipients').value;
        
        // In a real app, this would send the notification via API
        console.log('Sending notification:', { title, message, type, recipients });
        
        // Simulate API call with timeout
        setTimeout(() => {
            closeModal('notification-modal');
            showToast(`Notification "${title}" sent successfully to ${recipients}`, 'success');
        }, 800);
    });
    
    // Export form submission
    document.getElementById('export-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const reportType = document.getElementById('report-type').value;
        const dateRange = document.getElementById('date-range').value;
        const fileFormat = document.getElementById('file-format').value;
        
        // In a real app, this would generate and download the report
        console.log('Generating report:', { reportType, dateRange, fileFormat });
        
        // Simulate report generation with timeout
        setTimeout(() => {
            closeModal('export-modal');
            showToast(`${capitalizeFirstLetter(reportType)} report generated successfully in ${fileFormat.toUpperCase()} format`, 'success');
        }, 1200);
    });
}

// Initialize modals
function initializeModals() {
    // Setup date pickers
    flatpickr('.date-picker', {
        dateFormat: 'Y-m-d',
        maxDate: 'today'
    });
    
    // Close modals when X button is clicked
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            closeModal(this.closest('.modal').id);
        });
    });
    
    // Close modals when cancel button is clicked
    document.querySelectorAll('.cancel-btn').forEach(button => {
        button.addEventListener('click', function() {
            closeModal(this.closest('.modal').id);
        });
    });
    
    // Close modals when clicking outside the content
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
}

// Open modal by ID
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

// Close modal by ID
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
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