
document.addEventListener('DOMContentLoaded', function() {
    // Initialize date display
    updateCurrentDate();

    // Get reviewer data from localStorage or use defaults
    const reviewerName = localStorage.getItem('reviewerName') || 'Dr. Smith';
    document.getElementById('reviewer-name').textContent = reviewerName;

    // Dashboard statistics
    const dashboardStats = {
        totalAssigned: localStorage.getItem('totalAssigned') || 12,
        pendingReviews: localStorage.getItem('pendingReviews') || 5,
        completedReviews: localStorage.getItem('completedReviews') || 7,
        avgTime: localStorage.getItem('avgTime') || '3.5 days'
    };

    // Update dashboard statistics
    document.getElementById('total-assigned').textContent = dashboardStats.totalAssigned;
    document.getElementById('pending-reviews').textContent = dashboardStats.pendingReviews;
    document.getElementById('completed-reviews').textContent = dashboardStats.completedReviews;
    document.getElementById('avg-time').textContent = dashboardStats.avgTime;

    // Initialize calendar
    initializeCalendar();

    // Initialize charts
    initializeReviewsChart();
    initializeDecisionsChart();

    // Set up event listeners
    setupTimeframeButtons();
    setupCalendarNavigation();
});

// Update current date display
function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
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
        alert(`Calendar would navigate to ${months[monthIndex]} ${yearNum}`);
    }, 100);
}

// Chart download functionality (simulated)
document.querySelector('.chart-download').addEventListener('click', function() {
    // In a real app, this would generate and download a chart image or data
    alert('Chart download feature would save the chart as an image or export data as CSV');
});
