
document.addEventListener('DOMContentLoaded', function() {
    // API URL configuration - supports both local development and production
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' 
        : 'https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net/api';
    
    const PROJECTS_API = `${API_BASE_URL}/projects`;
    const MILESTONES_API = `${API_BASE_URL}/milestones`;
    const FUNDING_API = `${API_BASE_URL}/funding`;
    const DASHBOARD_API = `${API_BASE_URL}/mydashboard`;
    const COLLABORATORS_API = `${API_BASE_URL}/collaborators`;
    
    // Mock user ID - in a real app, this would come from authentication
    const CURRENT_USER_ID = 'ae3a44c8-562f-4184-9753-931aed14c68d';
    
    // DOM elements
    const gridContainer = document.querySelector('.grid-stack');
    const addWidgetBtn = document.getElementById('add-widget-btn');
    const addWidgetModal = document.getElementById('add-widget-modal');
    const closeModalBtns = document.querySelectorAll('.modal .close');
    const exportDashboardBtn = document.getElementById('export-dashboard-btn');
    const emptyDashboard = document.getElementById('empty-dashboard');
    const emptyAddWidgetBtn = document.getElementById('empty-add-widget-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // Initialize GridStack
    let grid;
    let userWidgets = [];
    
    // Initialize application
    initApp();
    
    // Main initialization function
    async function initApp() {
        setupEventListeners();
        
        // Initialize grid
        grid = GridStack.init({
            margin: 10,
            cellHeight: 80,
            minRow: 1,
            disableOneColumnMode: false,
            float: false,
            resizable: { handles: 'e,se,s,sw,w' }
        });
        
        // Register change events to save layout
        grid.on('change', saveWidgetPositions);
        
        // Load user widgets
        await loadUserWidgets();
        
        // Hide loading indicator
        loadingIndicator.style.display = 'none';
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Add widget button
        addWidgetBtn.addEventListener('click', () => {
            openAddWidgetModal();
        });
        
        // Empty dashboard add widget button
        emptyAddWidgetBtn.addEventListener('click', () => {
            openAddWidgetModal();
        });
        
        // Export dashboard button
        exportDashboardBtn.addEventListener('click', () => {
            exportDashboardToPDF();
        });
        
        // Close modal buttons
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                modal.style.display = 'none';
            });
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === addWidgetModal) {
                addWidgetModal.style.display = 'none';
            }
        });
        
        // Add widget options
        const widgetOptions = document.querySelectorAll('.widget-option');
        widgetOptions.forEach(option => {
            option.addEventListener('click', () => {
                const widgetType = option.getAttribute('data-widget-type');
                addWidget(widgetType);
                addWidgetModal.style.display = 'none';
            });
        });

        // Update current date in footer
        const currentDateEl = document.getElementById('current-date');
        if (currentDateEl) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);
        }
    }
    
    // Load user's widgets from API
    async function loadUserWidgets() {
        try {
            console.log('Loading user widgets from:', `${DASHBOARD_API}/widgets/${CURRENT_USER_ID}`);
            // In a real app, use proper error handling and loading states
            const response = await fetch(`${DASHBOARD_API}/widgets/${CURRENT_USER_ID}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const widgets = await response.json();
            console.log('Loaded widgets:', widgets);
            userWidgets = widgets;
            
            if (widgets.length === 0) {
                // Show empty dashboard state
                emptyDashboard.classList.remove('hidden');
                return;
            }
            
            // Hide empty dashboard state
            emptyDashboard.classList.add('hidden');
            
            // Add widgets to grid
            widgets.forEach(widget => {
                addWidgetToGrid(widget);
            });
            
        } catch (error) {
            console.error('Error loading user widgets:', error);
            showNotification('Error loading dashboard. Please try again later.', 'error');
            
            // Show empty dashboard as fallback
            emptyDashboard.classList.remove('hidden');
        }
    }
    
    // Load AI-powered collaboration suggestions
    async function loadCollaborationSuggestions() {
        // Check if AI suggestions widget exists, if not, don't load
        const aiSuggestionWidgets = document.querySelectorAll('.ai-suggestions-widget');
        if (aiSuggestionWidgets.length === 0) return;
        
        aiSuggestionWidgets.forEach(async widget => {
            const suggestionsList = widget.querySelector('.ai-suggestions-list');
            if (!suggestionsList) return;
            
            suggestionsList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Generating AI suggestions...</div>';
            
            try {
                // In a real app, this would call an AI API
                // Here we'll simulate AI-generated suggestions
                await simulateAIProcessing();
                
                // Generate suggestions based on user's projects and milestones
                const suggestions = await generateCollaborationSuggestions();
                
                if (suggestions.length === 0) {
                    suggestionsList.innerHTML = '<div class="empty-widget">No suggestions available at this time. Add more projects to get personalized recommendations.</div>';
                    return;
                }
                
                suggestionsList.innerHTML = '';
                
                // Display suggestions
                suggestions.forEach(suggestion => {
                    const suggestionElement = document.createElement('div');
                    suggestionElement.className = 'suggestion-item';
                    
                    suggestionElement.innerHTML = `
                        <div class="suggestion-header">
                            <div class="suggestion-icon ${suggestion.type}">
                                <i class="fas ${getSuggestionIcon(suggestion.type)}"></i>
                            </div>
                            <div class="suggestion-content">
                                <div class="suggestion-title">${suggestion.title}</div>
                                <div class="suggestion-type">${capitalizeFirstLetter(suggestion.type)}</div>
                            </div>
                        </div>
                        <p class="suggestion-description">${suggestion.description}</p>
                        <div class="suggestion-tags">
                            ${suggestion.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    `;
                    
                    suggestionsList.appendChild(suggestionElement);
                });
                
            } catch (error) {
                console.error('Error loading AI suggestions:', error);
                suggestionsList.innerHTML = '<div class="error-state">Error generating suggestions.</div>';
            }
        });
    }
    
    // Simulate AI processing delay
    function simulateAIProcessing() {
        return new Promise(resolve => setTimeout(resolve, 1200));
    }
    
    // Generate collaboration suggestions based on user data
    async function generateCollaborationSuggestions() {
        try {
            // In a real app, these would come from an AI service
            // Here we'll create simulated suggestions
            const milestoneResponse = await fetch(`${MILESTONES_API}/upcoming/30`);
            const projectsResponse = await fetch(PROJECTS_API);
            const collaboratorsResponse = await fetch(COLLABORATORS_API);
            
            if (!milestoneResponse.ok || !projectsResponse.ok || !collaboratorsResponse.ok) {
                throw new Error('Failed to fetch data for suggestions');
            }
            
            const upcomingMilestones = await milestoneResponse.json();
            const projects = await projectsResponse.json();
            const collaborators = await collaboratorsResponse.json();
            
            // Generate suggestions
            const suggestions = [
                {
                    type: 'collaboration',
                    title: 'Potential research synergy detected',
                    description: 'Dr. Emily Chen\'s work on quantum computing aligns with your current research goals. Consider reaching out for a potential collaboration.',
                    tags: ['Quantum Computing', 'Research Synergy', 'Networking']
                },
                {
                    type: 'milestone',
                    title: 'Upcoming milestone risk identified',
                    description: 'Your "Literature Review" milestone is at risk based on current progress. Consider allocating more resources or extending the timeline.',
                    tags: ['Risk Management', 'Timeline Adjustment']
                },
                {
                    type: 'funding',
                    title: 'Grant opportunity detected',
                    description: 'The National Science Foundation has a new grant program that matches your research profile. Application deadline is in 30 days.',
                    tags: ['NSF Grant', 'Funding Opportunity']
                },
                {
                    type: 'project',
                    title: 'Project efficiency improvement',
                    description: 'Consolidating your "Data Collection" phases across projects could save an estimated 45 hours of work.',
                    tags: ['Efficiency', 'Resource Optimization']
                },
                {
                    type: 'resource',
                    title: 'Relevant research paper found',
                    description: 'New paper published in Nature that cites your work and extends on your methodology. May provide insights for your current project.',
                    tags: ['Recent Publication', 'Citation', 'Methodology']
                }
            ];
            
            // Add project-specific and milestone-specific suggestions when available
            if (projects.length > 0) {
                const randomProject = projects[Math.floor(Math.random() * projects.length)];
                
                suggestions.push({
                    type: 'collaboration',
                    title: `Team expansion for "${randomProject.project_title}"`,
                    description: `Based on project scope, adding a data scientist to your team could accelerate progress on "${randomProject.project_title}".`,
                    tags: ['Team Composition', 'Data Science', 'Project Acceleration']
                });
            }
            
            if (upcomingMilestones.length > 0) {
                const randomMilestone = upcomingMilestones[Math.floor(Math.random() * upcomingMilestones.length)];
                
                suggestions.push({
                    type: 'milestone',
                    title: `Resource allocation for "${randomMilestone.title}"`,
                    description: `Milestone "${randomMilestone.title}" may require additional computational resources based on similar past milestones.`,
                    tags: ['Resource Planning', 'Computational Resources']
                });
            }
            
            // Shuffle and limit suggestions
            return shuffleArray(suggestions).slice(0, 5);
            
        } catch (error) {
            console.error('Error generating suggestions:', error);
            return [];
        }
    }
    
    // Shuffle array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // Get icon based on suggestion type
    function getSuggestionIcon(type) {
        switch(type) {
            case 'collaboration': return 'fa-users';
            case 'milestone': return 'fa-clipboard-list';
            case 'funding': return 'fa-coins';
            case 'project': return 'fa-project-diagram';
            case 'resource': return 'fa-book';
            default: return 'fa-lightbulb';
        }
    }
    
    // Add widget to grid
    function addWidgetToGrid(widget) {
        const widgetElement = document.createElement('div');
        const widgetContent = getWidgetTemplate(widget.widget_type);
        
        if (!widgetContent) {
            console.error(`No template found for widget type: ${widget.widget_type}`);
            return;
        }
        
        // Set grid properties
        const gridOptions = {
            x: widget.position_x || 0,
            y: widget.position_y || 0,
            w: widget.width || getDefaultWidgetWidth(widget.widget_type),
            h: widget.height || getDefaultWidgetHeight(widget.widget_type),
            id: widget.id?.toString() || Date.now().toString(),
            content: widgetContent
        };
        
        console.log(`Adding widget to grid:`, gridOptions);
        
        // Add widget to grid
        const gridItem = grid.addWidget(widgetElement, gridOptions);
        
        // Setup widget event listeners
        setupWidgetEventListeners(widgetElement, widget.widget_type);
        
        // Load widget data
        loadWidgetData(widgetElement, widget.widget_type);
    }
    
    // Get widget template by type
    function getWidgetTemplate(widgetType) {
        const templates = {
            'projects': document.getElementById('projects-widget-template'),
            'milestones': document.getElementById('milestones-widget-template'),
            'funding': document.getElementById('funding-widget-template'),
            'calendar': document.getElementById('calendar-widget-template'),
            'recent_activity': document.getElementById('recent-activity-widget-template'),
            'ai_suggestions': document.getElementById('ai-suggestions-widget-template')
        };
        
        const template = templates[widgetType];
        if (!template) {
            console.error(`Widget template not found for type: ${widgetType}`);
            return null;
        }
        
        return template.content.cloneNode(true).firstElementChild.outerHTML;
    }
    
    // Get default widget width
    function getDefaultWidgetWidth(widgetType) {
        const widthMap = {
            'projects': 6,
            'milestones': 6,
            'funding': 12,
            'calendar': 6,
            'recent_activity': 6,
            'ai_suggestions': 6
        };
        
        return widthMap[widgetType] || 6;
    }
    
    // Get default widget height
    function getDefaultWidgetHeight(widgetType) {
        const heightMap = {
            'projects': 4,
            'milestones': 4,
            'funding': 8,
            'calendar': 6,
            'recent_activity': 4,
            'ai_suggestions': 5
        };
        
        return heightMap[widgetType] || 4;
    }
    
    // Setup widget event listeners
    function setupWidgetEventListeners(widget, widgetType) {
        // Refresh button
        const refreshBtn = widget.querySelector('.widget-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                loadWidgetData(widget, widgetType);
                showNotification(`Refreshed ${capitalizeFirstLetter(widgetType)} widget`, 'info');
            });
        }
        
        // Remove button
        const removeBtn = widget.querySelector('.widget-remove');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                const gridItem = widget.closest('.grid-stack-item');
                const widgetId = gridItem.getAttribute('gs-id');
                
                // Remove from UI
                grid.removeWidget(gridItem);
                
                // Remove from database
                removeWidgetFromDatabase(widgetId);
                
                showNotification(`Removed ${capitalizeFirstLetter(widgetType)} widget`, 'info');
                
                // Check if grid is empty and show empty state
                if (grid.engine.nodes.length === 0) {
                    emptyDashboard.classList.remove('hidden');
                }
            });
        }
    }
    
    // Load widget data based on type
    function loadWidgetData(widget, widgetType) {
        console.log(`Loading data for widget type: ${widgetType}`);
        
        switch(widgetType) {
            case 'projects':
                loadProjectsData(widget);
                break;
            case 'milestones':
                loadMilestonesData(widget);
                break;
            case 'funding':
                loadFundingData(widget);
                break;
            case 'calendar':
                loadCalendarData(widget);
                break;
            case 'recent_activity':
                loadActivityData(widget);
                break;
            case 'ai_suggestions':
                loadAISuggestionsData(widget);
                break;
            default:
                console.error(`Unknown widget type: ${widgetType}`);
        }
    }
    
    // Load AI suggestions data
    function loadAISuggestionsData(widget) {
        const suggestionsList = widget.querySelector('.ai-suggestions-list');
        if (!suggestionsList) {
            console.error('AI suggestions list not found in widget');
            return;
        }
        
        suggestionsList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Generating AI suggestions...</div>';
        
        // Use the existing function to load suggestions
        loadCollaborationSuggestions();
    }
    
    // Load projects data
    async function loadProjectsData(widget) {
        const projectsList = widget.querySelector('.projects-list');
        if (!projectsList) return;
        
        projectsList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading projects...</div>';
        
        try {
            const response = await fetch(PROJECTS_API);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const projects = await response.json();
            
            // Limit to 5 most recent projects
            const recentProjects = projects.slice(0, 5);
            
            if (recentProjects.length === 0) {
                projectsList.innerHTML = '<div class="empty-widget">No projects found.</div>';
                return;
            }
            
            projectsList.innerHTML = '';
            
            recentProjects.forEach(project => {
                const startDate = new Date(project.start_date).toLocaleDateString();
                const endDate = new Date(project.end_date).toLocaleDateString();
                
                const projectElement = document.createElement('div');
                projectElement.className = 'project-item';
                
                projectElement.innerHTML = `
                    <div class="project-name">${project.project_title}</div>
                    <div class="project-meta">
                        <span><i class="fas fa-clock"></i> ${startDate} - ${endDate}</span>
                        <span><i class="fas fa-user"></i> ${project.researcher_name}</span>
                    </div>
                `;
                
                projectsList.appendChild(projectElement);
            });
            
        } catch (error) {
            console.error('Error loading projects:', error);
            projectsList.innerHTML = '<div class="error-state">Error loading projects.</div>';
        }
    }
    
    // Load milestones data
    async function loadMilestonesData(widget) {
        const milestonesList = widget.querySelector('.milestones-list');
        if (!milestonesList) return;
        
        milestonesList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading milestones...</div>';
        
        try {
            // Get upcoming milestones (due in the next 30 days)
            const response = await fetch(`${MILESTONES_API}/upcoming/30`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const milestones = await response.json();
            
            if (milestones.length === 0) {
                milestonesList.innerHTML = '<div class="empty-widget">No upcoming milestones.</div>';
                return;
            }
            
            milestonesList.innerHTML = '';
            
            // Display up to 5 upcoming milestones
            milestones.slice(0, 5).forEach(milestone => {
                const dueDate = new Date(milestone.end_date).toLocaleDateString();
                
                const milestoneElement = document.createElement('div');
                milestoneElement.className = 'milestone-item';
                
                let statusClass;
                switch (milestone.status?.toLowerCase()) {
                    case 'completed': statusClass = 'status-completed'; break;
                    case 'in-progress': statusClass = 'status-in-progress'; break;
                    case 'delayed': statusClass = 'status-delayed'; break;
                    default: statusClass = 'status-pending';
                }
                
                milestoneElement.innerHTML = `
                    <div class="milestone-title">${milestone.title}</div>
                    <div class="milestone-meta">
                        <span><i class="fas fa-calendar-day"></i> Due: ${dueDate}</span>
                        <span class="milestone-status ${statusClass}">
                            ${capitalizeFirstLetter(milestone.status || 'pending')}
                        </span>
                    </div>
                `;
                
                milestonesList.appendChild(milestoneElement);
            });
            
        } catch (error) {
            console.error('Error loading milestones:', error);
            milestonesList.innerHTML = '<div class="error-state">Error loading milestones.</div>';
        }
    }
    
    // Load funding data
    async function loadFundingData(widget) {
        const fundingSummary = widget.querySelector('.funding-summary');
        const chartContainer = widget.querySelector('.funding-chart');
        
        if (!fundingSummary || !chartContainer) return;
        
        fundingSummary.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading funding data...</div>';
        
        try {
            const response = await fetch(`${DASHBOARD_API}/summary/${CURRENT_USER_ID}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const summary = await response.json();
            const fundingStats = summary.funding;
            
            fundingSummary.innerHTML = '';
            
            // Create funding stats
            const statsContainer = document.createElement('div');
            statsContainer.className = 'funding-stats';
            
            // Format currency values
            const formatCurrency = (value) => {
                return new Intl.NumberFormat('en-US', { 
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0
                }).format(value);
            };
            
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value">${formatCurrency(fundingStats.total || 0)}</div>
                    <div class="stat-label">Total Funding</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${formatCurrency(fundingStats.spent || 0)}</div>
                    <div class="stat-label">Spent</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${formatCurrency(fundingStats.remaining || 0)}</div>
                    <div class="stat-label">Remaining</div>
                </div>
            `;
            
            fundingSummary.appendChild(statsContainer);
            
            // Create funding chart
            const ctx = chartContainer.getContext('2d');
            
            if (window.fundingChart) {
                window.fundingChart.destroy();
            }
            
            window.fundingChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Spent', 'Remaining'],
                    datasets: [{
                        data: [fundingStats.spent || 0, fundingStats.remaining || 0],
                        backgroundColor: [
                            'rgba(239, 68, 68, 0.8)',  // Red for spent
                            'rgba(16, 185, 129, 0.8)'  // Green for remaining
                        ],
                        borderColor: [
                            'rgba(239, 68, 68, 1)',
                            'rgba(16, 185, 129, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                    return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
            
        } catch (error) {
            console.error('Error loading funding data:', error);
            fundingSummary.innerHTML = '<div class="error-state">Error loading funding data.</div>';
        }
    }
    
    // Load calendar data
    async function loadCalendarData(widget) {
        const calendarContainer = widget.querySelector('.calendar-container');
        if (!calendarContainer) return;
        
        calendarContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading calendar...</div>';
        
        try {
            // Simulate loading milestones for calendar
            const milestonesResponse = await fetch(MILESTONES_API);
            
            if (!milestonesResponse.ok) {
                throw new Error(`HTTP error! Status: ${milestonesResponse.status}`);
            }
            
            const milestones = await milestonesResponse.json();
            
            // Create a simple calendar view
            calendarContainer.innerHTML = '';
            
            // Get current date
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            
            // Create calendar header
            const calendarHeader = document.createElement('div');
            calendarHeader.className = 'calendar-header';
            calendarHeader.innerHTML = `
                <h3>${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} ${currentYear}</h3>
            `;
            
            // Create calendar grid
            const calendarGrid = document.createElement('div');
            calendarGrid.className = 'calendar-grid';
            
            // Add day headers
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            dayNames.forEach(day => {
                const dayHeader = document.createElement('div');
                dayHeader.className = 'calendar-day-header';
                dayHeader.textContent = day;
                calendarGrid.appendChild(dayHeader);
            });
            
            // Get days in month
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            
            // Get first day of month
            const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
            
            // Add blank days for start of month
            for (let i = 0; i < firstDayOfMonth; i++) {
                const blankDay = document.createElement('div');
                blankDay.className = 'calendar-day empty';
                calendarGrid.appendChild(blankDay);
            }
            
            // Prepare milestone dates
            const milestoneDates = {};
            milestones.forEach(milestone => {
                const startDate = new Date(milestone.start_date);
                const endDate = new Date(milestone.end_date);
                
                // Only include milestones in current month
                if (startDate.getMonth() === currentMonth || endDate.getMonth() === currentMonth) {
                    const dayKey = startDate.getDate().toString();
                    if (!milestoneDates[dayKey]) milestoneDates[dayKey] = [];
                    milestoneDates[dayKey].push(milestone);
                }
            });
            
            // Add days of month
            for (let day = 1; day <= daysInMonth; day++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                if (day === currentDate.getDate()) {
                    dayElement.classList.add('today');
                }
                
                dayElement.innerHTML = `<span class="day-number">${day}</span>`;
                
                // Add milestone indicators
                if (milestoneDates[day]) {
                    const indicators = document.createElement('div');
                    indicators.className = 'day-indicators';
                    
                    milestoneDates[day].slice(0, 2).forEach(milestone => {
                        const indicator = document.createElement('div');
                        indicator.className = `day-indicator ${milestone.status || 'pending'}`;
                        indicator.title = milestone.title;
                        indicators.appendChild(indicator);
                    });
                    
                    if (milestoneDates[day].length > 2) {
                        const more = document.createElement('span');
                        more.className = 'more-indicators';
                        more.textContent = `+${milestoneDates[day].length - 2}`;
                        indicators.appendChild(more);
                    }
                    
                    dayElement.appendChild(indicators);
                }
                
                calendarGrid.appendChild(dayElement);
            }
            
            calendarContainer.appendChild(calendarHeader);
            calendarContainer.appendChild(calendarGrid);
            
            // Add calendar styles (inline for simplicity)
            const calendarStyles = document.createElement('style');
            calendarStyles.textContent = `
                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 2px;
                    margin-top: 1rem;
                }
                .calendar-day-header {
                    text-align: center;
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #6b7280;
                    padding: 0.25rem;
                }
                .calendar-day {
                    aspect-ratio: 1/1;
                    background-color: #f9fafb;
                    border-radius: 4px;
                    padding: 0.25rem;
                    position: relative;
                    min-height: 2.5rem;
                }
                .calendar-day.empty {
                    background-color: transparent;
                }
                .calendar-day.today {
                    background-color: rgba(99, 102, 241, 0.1);
                    border: 1px solid #6366f1;
                }
                .day-number {
                    font-size: 0.75rem;
                    font-weight: 500;
                }
                .day-indicators {
                    position: absolute;
                    bottom: 0.25rem;
                    left: 0.25rem;
                    right: 0.25rem;
                    display: flex;
                    gap: 2px;
                    align-items: center;
                }
                .day-indicator {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background-color: #6366f1;
                }
                .day-indicator.completed {
                    background-color: #10b981;
                }
                .day-indicator.in-progress {
                    background-color: #6366f1;
                }
                .day-indicator.delayed {
                    background-color: #ef4444;
                }
                .day-indicator.pending {
                    background-color: #f59e0b;
                }
                .more-indicators {
                    font-size: 0.625rem;
                    color: #6b7280;
                    margin-left: auto;
                }
            `;
            calendarContainer.appendChild(calendarStyles);
            
        } catch (error) {
            console.error('Error loading calendar:', error);
            calendarContainer.innerHTML = '<div class="error-state">Error loading calendar.</div>';
        }
    }
    
    // Load activity data
    async function loadActivityData(widget) {
        const activityList = widget.querySelector('.activity-list');
        if (!activityList) return;
        
        activityList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading activity...</div>';
        
        try {
            // In a real app, we'd fetch from an activity log API
            // Here we'll simulate some recent activity
            
            const activities = [
                {
                    type: 'project',
                    title: 'Quantum Computing Research',
                    message: 'Project created',
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
                },
                {
                    type: 'milestone',
                    title: 'Literature Review',
                    message: 'Milestone completed',
                    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
                },
                {
                    type: 'funding',
                    title: 'Research Grant',
                    message: 'New funding added: $50,000',
                    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
                },
                {
                    type: 'milestone',
                    title: 'Data Collection',
                    message: 'Milestone updated to In Progress',
                    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
                },
                {
                    type: 'project',
                    title: 'AI Ethics Framework',
                    message: 'New collaborator added',
                    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
                }
            ];
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            activityList.innerHTML = '';
            
            activities.forEach(activity => {
                const activityElement = document.createElement('div');
                activityElement.className = 'activity-item';
                
                const timestamp = new Date(activity.timestamp);
                const timeAgo = getTimeAgo(timestamp);
                
                activityElement.innerHTML = `
                    <div class="activity-header">
                        <div class="activity-icon ${activity.type}">
                            <i class="fas ${getActivityIcon(activity.type)}"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-title">${activity.title}</div>
                            <div class="activity-timestamp">${timeAgo}</div>
                        </div>
                    </div>
                    <div class="activity-message">${activity.message}</div>
                `;
                
                activityList.appendChild(activityElement);
            });
            
        } catch (error) {
            console.error('Error loading activity:', error);
            activityList.innerHTML = '<div class="error-state">Error loading activity.</div>';
        }
    }
    
    // Get activity icon based on type
    function getActivityIcon(type) {
        switch(type) {
            case 'project': return 'fa-users';
            case 'milestone': return 'fa-clipboard-list';
            case 'funding': return 'fa-coins';
            default: return 'fa-bell';
        }
    }
    
    // Get time ago string
    function getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffDay > 0) {
            return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
        } else if (diffHour > 0) {
            return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
        } else if (diffMin > 0) {
            return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }
    
    // Open add widget modal
    function openAddWidgetModal() {
        addWidgetModal.style.display = 'block';
        
        // Highlight already added widgets
        const widgetOptions = document.querySelectorAll('.widget-option');
        widgetOptions.forEach(option => {
            const widgetType = option.getAttribute('data-widget-type');
            if (isWidgetAdded(widgetType)) {
                option.classList.add('disabled');
                option.title = 'Widget already added';
            } else {
                option.classList.remove('disabled');
                option.title = '';
            }
        });
    }
    
    // Check if widget is already added
    function isWidgetAdded(widgetType) {
        return userWidgets.some(widget => widget.widget_type === widgetType);
    }
    
    // Add widget
    async function addWidget(widgetType) {
        console.log(`Adding widget of type: ${widgetType}`);
        
        // Hide empty dashboard state if visible
        emptyDashboard.classList.add('hidden');
        
        // Prepare widget data
        const widget = {
            user_id: CURRENT_USER_ID,
            widget_type: widgetType,
            position_x: 0,
            position_y: 0,
            width: getDefaultWidgetWidth(widgetType),
            height: getDefaultWidgetHeight(widgetType)
        };
        
        try {
            console.log('Saving widget to database:', widget);
            
            // Save widget to database
            const response = await fetch(`${DASHBOARD_API}/widgets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(widget)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! Status: ${response.status}, Error: ${JSON.stringify(errorData)}`);
            }
            
            const savedWidget = await response.json();
            console.log('Widget saved successfully:', savedWidget);
            
            // Add to local widgets array
            userWidgets.push(savedWidget);
            
            // Add to grid
            addWidgetToGrid(savedWidget);
            
            showNotification(`Added ${capitalizeFirstLetter(widgetType)} widget to dashboard`, 'success');
            
        } catch (error) {
            console.error('Error adding widget:', error);
            showNotification('Error adding widget. Please try again.', 'error');
        }
    }
    
    // Remove widget from database
    async function removeWidgetFromDatabase(widgetId) {
        try {
            // Remove from API
            await fetch(`${DASHBOARD_API}/widgets/${widgetId}`, {
                method: 'DELETE'
            });
            
            // Remove from local array
            userWidgets = userWidgets.filter(w => w.id.toString() !== widgetId);
            
        } catch (error) {
            console.error('Error removing widget from database:', error);
            // No need to show notification as widget is already removed from UI
        }
    }
    
    // Save widget positions to database
    async function saveWidgetPositions() {
        try {
            // Get current widget positions from grid
            const updatedWidgets = [];
            
            grid.engine.nodes.forEach(node => {
                updatedWidgets.push({
                    id: node.id,
                    position_x: node.x,
                    position_y: node.y,
                    width: node.w,
                    height: node.h
                });
            });
            
            // Update local widgets
            updatedWidgets.forEach(updated => {
                const index = userWidgets.findIndex(w => w.id.toString() === updated.id.toString());
                if (index !== -1) {
                    userWidgets[index].position_x = updated.position_x;
                    userWidgets[index].position_y = updated.position_y;
                    userWidgets[index].width = updated.width;
                    userWidgets[index].height = updated.height;
                }
            });
            
            // Save to API
            await fetch(`${DASHBOARD_API}/widgets/position`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ widgets: updatedWidgets })
            });
            
        } catch (error) {
            console.error('Error saving widget positions:', error);
            // Silent fail, don't distrupt user experience
        }
    }
    
    // Export dashboard to PDF
    function exportDashboardToPDF() {
        const dashboardContainer = document.querySelector('.dashboard-content');
        
        // Show loading notification
        showNotification('Preparing PDF export...', 'info');
        
        // Add print class to body to apply print styles
        document.body.classList.add('exporting-pdf');
        
        // Configure pdf options
        const options = {
            margin: 10,
            filename: `research-dashboard-${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        
        // Generate PDF
        html2pdf()
            .from(dashboardContainer)
            .set(options)
            .save()
            .then(() => {
                // Remove print class
                document.body.classList.remove('exporting-pdf');
                showNotification('Dashboard exported as PDF', 'success');
            })
            .catch(error => {
                console.error('Error exporting PDF:', error);
                document.body.classList.remove('exporting-pdf');
                showNotification('Error exporting PDF. Please try again.', 'error');
            });
    }
    
    // Utility function for notifications
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Get or create toast container
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Add to container
        toastContainer.appendChild(notification);
        
        // Add active class for animation
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);
        
        // Add close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('active');
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                if (notification.parentNode === toastContainer) {
                    toastContainer.removeChild(notification);
                }
            }, 300);
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (notification.parentNode === toastContainer) {
                notification.classList.remove('active');
                notification.classList.add('notification-hiding');
                setTimeout(() => {
                    if (notification.parentNode === toastContainer) {
                        toastContainer.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // Utility function to capitalize first letter
    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});
