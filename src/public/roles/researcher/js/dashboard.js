document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' 
        : 'https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net/api';
    
    const DASHBOARD_API = `${API_BASE_URL}/mydashboard`;
    const CURRENT_USER_ID = 'ae3a44c8-562f-4184-9753-931aed14c68d';
    
    const gridContainer = document.querySelector('.grid-stack');
    const addWidgetBtn = document.getElementById('add-widget-btn');
    const addWidgetModal = document.getElementById('add-widget-modal');
    const closeModalBtns = document.querySelectorAll('.modal .close');
    const exportDashboardBtn = document.getElementById('export-dashboard-btn');
    const emptyDashboard = document.getElementById('empty-dashboard');
    const emptyAddWidgetBtn = document.getElementById('empty-add-widget-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    let grid;
    let userWidgets = [];
    let isInitialLoad = true;
    
    initApp();
    
    async function initApp() {
        setupEventListeners();
        
        try {
            // Initialize GridStack with proper configuration
            grid = GridStack.init({
                margin: 10,
                cellHeight: 80,
                minRow: 1,
                disableOneColumnMode: false,
                float: false,
                resizable: { handles: 'e,se,s,sw,w' },
                acceptWidgets: true,
                staticGrid: false
            });
            
            grid.on('change', saveWidgetPositions);
            
            // Load widgets from localStorage first for immediate display
            loadWidgetsFromLocalStorage();
            
            // Then try to load from server
            await loadUserWidgets();
            
            loadingIndicator.style.display = 'none';
            isInitialLoad = false;
        } catch (error) {
            console.error('Initialization error:', error);
            loadingIndicator.style.display = 'none';
            
            // If server load fails, use localStorage data
            if (userWidgets.length === 0) {
                emptyDashboard.classList.remove('hidden');
            }
        }
    }
    
    function setupEventListeners() {
        addWidgetBtn.addEventListener('click', openAddWidgetModal);
        emptyAddWidgetBtn.addEventListener('click', openAddWidgetModal);
        exportDashboardBtn.addEventListener('click', exportDashboardToPDF);
        
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                modal.style.display = 'none';
            });
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === addWidgetModal) {
                addWidgetModal.style.display = 'none';
            }
        });
        
        const widgetOptions = document.querySelectorAll('.widget-option');
        widgetOptions.forEach(option => {
            option.addEventListener('click', () => {
                const widgetType = option.getAttribute('data-widget-type');
                addWidget(widgetType);
                addWidgetModal.style.display = 'none';
            });
        });
    }
    
    function loadWidgetsFromLocalStorage() {
        try {
            const savedWidgets = localStorage.getItem(`dashboard_widgets_${CURRENT_USER_ID}`);
            if (savedWidgets) {
                userWidgets = JSON.parse(savedWidgets);
                if (userWidgets.length > 0) {
                    emptyDashboard.classList.add('hidden');
                    userWidgets.forEach(widget => {
                        addWidgetToGrid(widget);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }
    
    async function loadUserWidgets() {
        try {
            const response = await fetch(`${DASHBOARD_API}/widgets/${CURRENT_USER_ID}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const widgets = await response.json();
            userWidgets = widgets;
            
            // Only update the display if this is the initial load
            if (isInitialLoad) {
                if (widgets.length === 0) {
                    emptyDashboard.classList.remove('hidden');
                    return;
                }
                
                emptyDashboard.classList.add('hidden');
                grid.removeAll();
                
                widgets.forEach(widget => {
                    addWidgetToGrid(widget);
                });
            }
            
            // Save to localStorage for offline use
            localStorage.setItem(`dashboard_widgets_${CURRENT_USER_ID}`, JSON.stringify(userWidgets));
            
        } catch (error) {
            console.error('Error loading user widgets:', error);
            // Don't show error if we have localStorage data
            if (userWidgets.length === 0) {
                showNotification('Error loading dashboard. Using local data.', 'warning');
            }
        }
    }
    
    function addWidgetToGrid(widget) {
        try {
            const widgetElement = document.createElement('div');
            widgetElement.classList.add('grid-stack-item');
            
            const widgetContent = getWidgetTemplate(widget.widget_type);
            
            if (!widgetContent) {
                throw new Error(`No template found for widget type: ${widget.widget_type}`);
            }
            
            widgetElement.innerHTML = widgetContent;
            
            const gridOptions = {
                x: widget.position_x || 0,
                y: widget.position_y || 0,
                w: widget.width || getDefaultWidgetWidth(widget.widget_type),
                h: widget.height || getDefaultWidgetHeight(widget.widget_type),
                id: widget.id?.toString() || `local_${Date.now().toString()}`,
                noMove: false,
                noResize: false,
                locked: false
            };
            
            const gridItem = grid.addWidget(widgetElement, gridOptions);
            
            setupWidgetEventListeners(gridItem, widget.widget_type);
            loadWidgetData(gridItem, widget.widget_type);
            
            return gridItem;
        } catch (error) {
            console.error('Error adding widget to grid:', error);
            return null;
        }
    }
    
    async function loadWidgetData(widgetElement, widgetType) {
        const loadingElement = widgetElement.querySelector('.loading');
        if (loadingElement) {
            loadingElement.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading ${widgetType} data...`;
            
            try {
                let response;
                let data;
                
                switch(widgetType) {
                    case 'projects':
                        response = await fetch(`${API_BASE_URL}/projects?user_id=${CURRENT_USER_ID}`);
                        if (!response.ok) throw new Error('Failed to load projects');
                        data = await response.json();
                        displayProjectsWidgetData(widgetElement, data);
                        break;
                        
                    case 'milestones':
                        response = await fetch(`${API_BASE_URL}/milestones?user_id=${CURRENT_USER_ID}`);
                        if (!response.ok) throw new Error('Failed to load milestones');
                        data = await response.json();
                        displayMilestonesWidgetData(widgetElement, data);
                        break;
                        
                    case 'funding':
                        response = await fetch(`${API_BASE_URL}/funding?user_id=${CURRENT_USER_ID}`);
                        if (!response.ok) throw new Error('Failed to load funding');
                        data = await response.json();
                        displayFundingWidgetData(widgetElement, data);
                        break;
                        
                    case 'calendar':
                        // Fetch all relevant calendar data
                        const [projectsRes, milestonesRes, fundingRes] = await Promise.all([
                            fetch(`${API_BASE_URL}/projects?user_id=${CURRENT_USER_ID}`),
                            fetch(`${API_BASE_URL}/milestones?user_id=${CURRENT_USER_ID}`),
                            fetch(`${API_BASE_URL}/funding?user_id=${CURRENT_USER_ID}`)
                        ]);
                        
                        if (!projectsRes.ok || !milestonesRes.ok || !fundingRes.ok) {
                            throw new Error('Failed to load calendar data');
                        }
                        
                        const projects = await projectsRes.json();
                        const milestones = await milestonesRes.json();
                        const funding = await fundingRes.json();
                        displayCalendarWidgetData(widgetElement, {projects, milestones, funding});
                        break;
                        
                    case 'recent_activity':
                        response = await fetch(`${API_BASE_URL}/activity?user_id=${CURRENT_USER_ID}`);
                        if (!response.ok) throw new Error('Failed to load activity');
                        data = await response.json();
                        displayActivityWidgetData(widgetElement, data);
                        break;
                        
                    case 'ai_suggestions':
                        response = await fetch(`${API_BASE_URL}/ai-suggestions?user_id=${CURRENT_USER_ID}`);
                        if (!response.ok) throw new Error('Failed to load AI suggestions');
                        data = await response.json();
                        displayAISuggestionsWidgetData(widgetElement, data);
                        break;
                        
                    default:
                        throw new Error('Unknown widget type');
                }
                
                loadingElement.style.display = 'none';
                
            } catch (error) {
                console.error(`Error loading ${widgetType} data:`, error);
                loadingElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Error loading data. <button class="retry-btn">Retry</button>`;
                
                // Add retry functionality
                loadingElement.querySelector('.retry-btn').addEventListener('click', () => {
                    loadWidgetData(widgetElement, widgetType);
                });
            }
        }
    }
    
    function displayProjectsWidgetData(widgetElement, projects) {
        const listContainer = widgetElement.querySelector('.projects-list');
        listContainer.innerHTML = '';
        
        if (projects.length === 0) {
            listContainer.innerHTML = '<div class="no-data">No projects found</div>';
            return;
        }
        
        // Show only the most recent 3-5 projects
        const recentProjects = projects.slice(0, 5);
        
        recentProjects.forEach(project => {
            const projectItem = document.createElement('div');
            projectItem.className = 'project-item';
            
            const statusClass = getStatusClass(project.status);
            const startDate = project.start_date ? new Date(project.start_date).toLocaleDateString() : 'No date';
            
            projectItem.innerHTML = `
                <div class="project-header">
                    <span class="project-status ${statusClass}">${project.status || 'Active'}</span>
                    <h4>${project.project_title || 'Untitled Project'}</h4>
                </div>
                <div class="project-meta">
                    <span><i class="fas fa-calendar"></i> ${startDate}</span>
                    <span><i class="fas fa-users"></i> ${project.collaborator_count || 0} collaborators</span>
                </div>
            `;
            
            projectItem.addEventListener('click', () => {
                window.location.href = `projects.html?project_id=${project.id}`;
            });
            
            listContainer.appendChild(projectItem);
        });
    }
    
    function displayMilestonesWidgetData(widgetElement, milestones) {
        const listContainer = widgetElement.querySelector('.milestones-list');
        listContainer.innerHTML = '';
        
        if (milestones.length === 0) {
            listContainer.innerHTML = '<div class="no-data">No milestones found</div>';
            return;
        }
        
        // Sort by upcoming first
        const sortedMilestones = [...milestones].sort((a, b) => {
            return new Date(a.end_date) - new Date(b.end_date);
        });
        
        // Show only the most urgent 3-5 milestones
        const upcomingMilestones = sortedMilestones.slice(0, 5);
        
        upcomingMilestones.forEach(milestone => {
            const milestoneItem = document.createElement('div');
            milestoneItem.className = 'milestone-item';
            
            const statusClass = getStatusClass(milestone.status);
            const endDate = milestone.end_date ? new Date(milestone.end_date).toLocaleDateString() : 'No date';
            
            milestoneItem.innerHTML = `
                <div class="milestone-header">
                    <span class="milestone-status ${statusClass}">${milestone.status || 'Pending'}</span>
                    <h4>${milestone.title || 'Untitled Milestone'}</h4>
                </div>
                <div class="milestone-meta">
                    <span><i class="fas fa-calendar"></i> Due: ${endDate}</span>
                    ${milestone.project_title ? `<span><i class="fas fa-project-diagram"></i> ${milestone.project_title}</span>` : ''}
                </div>
            `;
            
            milestoneItem.addEventListener('click', () => {
                window.location.href = `milestones.html?milestone_id=${milestone.id}`;
            });
            
            listContainer.appendChild(milestoneItem);
        });
    }
    
    function displayFundingWidgetData(widgetElement, fundingRecords) {
        const summaryContainer = widgetElement.querySelector('.funding-summary');
        const chartContainer = widgetElement.querySelector('.funding-chart');
        const ctx = chartContainer.getContext('2d');
        
        if (fundingRecords.length === 0) {
            summaryContainer.innerHTML = '<div class="no-data">No funding records found</div>';
            chartContainer.style.display = 'none';
            return;
        }
        
        // Calculate totals
        const totalFunding = fundingRecords.reduce((sum, record) => sum + parseFloat(record.total_amount || 0), 0);
        const totalSpent = fundingRecords.reduce((sum, record) => sum + parseFloat(record.amount_spent || 0), 0);
        const totalRemaining = totalFunding - totalSpent;
        
        // Update summary
        summaryContainer.innerHTML = `
            <div class="funding-stats">
                <div class="stat-item">
                    <div class="stat-value">R${totalFunding.toLocaleString()}</div>
                    <div class="stat-label">Total Funding</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">R${totalSpent.toLocaleString()}</div>
                    <div class="stat-label">Spent</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">R${totalRemaining.toLocaleString()}</div>
                    <div class="stat-label">Remaining</div>
                </div>
            </div>
        `;
        
        // Create or update chart
        if (widgetElement.fundingChart) {
            widgetElement.fundingChart.destroy();
        }
        
        widgetElement.fundingChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Spent', 'Remaining'],
                datasets: [{
                    data: [totalSpent, totalRemaining],
                    backgroundColor: ['#ef4444', '#10b981'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        chartContainer.style.display = 'block';
    }
    
    function displayCalendarWidgetData(widgetElement, data) {
        const { projects, milestones, funding } = data;
        const calendarContainer = widgetElement.querySelector('.calendar-container');
        calendarContainer.innerHTML = '';
        
        if (projects.length === 0 && milestones.length === 0 && funding.length === 0) {
            calendarContainer.innerHTML = '<div class="no-data">No calendar events found</div>';
            return;
        }
        
        // Create a combined list of all events
        const allEvents = [];
        
        // Add project events
        projects.forEach(project => {
            if (project.start_date) {
                allEvents.push({
                    type: 'project',
                    title: `Project Start: ${project.project_title}`,
                    date: project.start_date,
                    color: '#3b82f6' // blue
                });
            }
            
            if (project.end_date) {
                allEvents.push({
                    type: 'project',
                    title: `Project End: ${project.project_title}`,
                    date: project.end_date,
                    color: '#3b82f6' // blue
                });
            }
        });
        
        // Add milestone events
        milestones.forEach(milestone => {
            if (milestone.end_date) {
                allEvents.push({
                    type: 'milestone',
                    title: `Milestone: ${milestone.title}`,
                    date: milestone.end_date,
                    color: '#f59e0b' // amber
                });
            }
        });
        
        // Add funding events
        funding.forEach(fund => {
            if (fund.expiration_date) {
                allEvents.push({
                    type: 'funding',
                    title: `Funding Expires: ${fund.title}`,
                    date: fund.expiration_date,
                    color: '#10b981' // green
                });
            }
        });
        
        // Sort events by date
        allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Group events by date
        const eventsByDate = {};
        allEvents.forEach(event => {
            const dateStr = new Date(event.date).toLocaleDateString();
            if (!eventsByDate[dateStr]) {
                eventsByDate[dateStr] = [];
            }
            eventsByDate[dateStr].push(event);
        });
        
        // Display upcoming events (next 7 days)
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        const upcomingEvents = allEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= nextWeek;
        });
        
        if (upcomingEvents.length === 0) {
            calendarContainer.innerHTML = '<div class="no-upcoming">No upcoming events in the next 7 days</div>';
            
            // Show all events button
            const showAllBtn = document.createElement('button');
            showAllBtn.className = 'btn btn-secondary show-all-events';
            showAllBtn.innerHTML = '<i class="fas fa-calendar-alt"></i> View All Events';
            showAllBtn.addEventListener('click', () => displayAllCalendarEvents(calendarContainer, eventsByDate));
            calendarContainer.appendChild(showAllBtn);
            
            return;
        }
        
        // Create a list of upcoming events
        const upcomingList = document.createElement('div');
        upcomingList.className = 'upcoming-events';
        
        upcomingEvents.slice(0, 5).forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'calendar-event';
            eventItem.style.borderLeft = `3px solid ${event.color}`;
            
            const eventDate = new Date(event.date);
            const isToday = eventDate.toDateString() === today.toDateString();
            
            eventItem.innerHTML = `
                <div class="event-date ${isToday ? 'today' : ''}">
                    ${isToday ? 'Today' : eventDate.toLocaleDateString()}
                </div>
                <div class="event-title">
                    ${event.title}
                </div>
                <div class="event-type" style="color: ${event.color}">
                    ${event.type}
                </div>
            `;
            
            upcomingList.appendChild(eventItem);
        });
        
        calendarContainer.appendChild(upcomingList);
        
        // Show all events button if there are more
        if (allEvents.length > upcomingEvents.length) {
            const showAllBtn = document.createElement('button');
            showAllBtn.className = 'btn btn-secondary show-all-events';
            showAllBtn.innerHTML = '<i class="fas fa-calendar-alt"></i> View All Events';
            showAllBtn.addEventListener('click', () => displayAllCalendarEvents(calendarContainer, eventsByDate));
            calendarContainer.appendChild(showAllBtn);
        }
    }
    
    function displayAllCalendarEvents(container, eventsByDate) {
        container.innerHTML = '';
        
        const allEventsList = document.createElement('div');
        allEventsList.className = 'all-events';
        
        Object.keys(eventsByDate).forEach(dateStr => {
            const dateHeader = document.createElement('h4');
            dateHeader.className = 'event-date-header';
            dateHeader.textContent = dateStr;
            allEventsList.appendChild(dateHeader);
            
            eventsByDate[dateStr].forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.className = 'calendar-event';
                eventItem.style.borderLeft = `3px solid ${event.color}`;
                
                eventItem.innerHTML = `
                    <div class="event-title">
                        ${event.title}
                    </div>
                    <div class="event-type" style="color: ${event.color}">
                        ${event.type}
                    </div>
                `;
                
                allEventsList.appendChild(eventItem);
            });
        });
        
        container.appendChild(allEventsList);
        
        // Add back button
        const backBtn = document.createElement('button');
        backBtn.className = 'btn btn-secondary back-to-upcoming';
        backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Upcoming';
        backBtn.addEventListener('click', () => {
            // Reload the calendar widget to show upcoming events
            const widgetElement = container.closest('.widget-content');
            const widgetType = widgetElement.closest('.grid-stack-item').getAttribute('data-widget-type');
            loadWidgetData(widgetElement, widgetType);
        });
        container.appendChild(backBtn);
    }
    
    function displayActivityWidgetData(widgetElement, activities) {
        const listContainer = widgetElement.querySelector('.activity-list');
        listContainer.innerHTML = '';
        
        if (activities.length === 0) {
            listContainer.innerHTML = '<div class="no-data">No recent activity</div>';
            return;
        }
        
        // Show only the most recent 5 activities
        const recentActivities = activities.slice(0, 5);
        
        recentActivities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            const activityDate = activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Recently';
            
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas ${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-message">${activity.message}</p>
                    <p class="activity-meta">
                        <span class="activity-type">${activity.type}</span>
                        <span class="activity-date">${activityDate}</span>
                    </p>
                </div>
            `;
            
            listContainer.appendChild(activityItem);
        });
    }
    
    function displayAISuggestionsWidgetData(widgetElement, suggestions) {
        const listContainer = widgetElement.querySelector('.ai-suggestions-list');
        listContainer.innerHTML = '';
        
        if (suggestions.length === 0) {
            listContainer.innerHTML = '<div class="no-data">No AI suggestions available</div>';
            return;
        }
        
        // Show only the top 3 suggestions
        const topSuggestions = suggestions.slice(0, 3);
        
        topSuggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'ai-suggestion-item';
            
            suggestionItem.innerHTML = `
                <div class="suggestion-header">
                    <i class="fas fa-lightbulb"></i>
                    <h4>${suggestion.title}</h4>
                </div>
                <div class="suggestion-content">
                    <p>${suggestion.description}</p>
                    ${suggestion.action ? `<button class="btn btn-small">${suggestion.action}</button>` : ''}
                </div>
            `;
            
            listContainer.appendChild(suggestionItem);
        });
    }
    
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
        if (!template) return null;
        
        return template.innerHTML;
    }
    
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
    
    function setupWidgetEventListeners(widget, widgetType) {
        // Hover effects
        widget.addEventListener('mouseenter', () => {
            widget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.12)';
        });
        
        widget.addEventListener('mouseleave', () => {
            widget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
        });

        // Refresh button
        const refreshBtn = widget.querySelector('.widget-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                refreshBtn.querySelector('i').classList.add('fa-spin');
                showNotification(`Refreshing ${capitalizeFirstLetter(widgetType)}...`, 'info');
                
                // Reload widget data
                loadWidgetData(widget, widgetType).then(() => {
                    refreshBtn.querySelector('i').classList.remove('fa-spin');
                    showNotification(`${capitalizeFirstLetter(widgetType)} refreshed`, 'success');
                });
            });
        }

        // Remove button
        const removeBtn = widget.querySelector('.widget-remove');
        if (removeBtn) {
            removeBtn.addEventListener('click', async () => {
                const gridItem = widget.closest('.grid-stack-item');
                const widgetId = gridItem.getAttribute('gs-id');
                
                // Add animation
                gridItem.style.transform = 'scale(0.95)';
                gridItem.style.opacity = '0.8';
                
                setTimeout(async () => {
                    try {
                        await removeWidgetFromDatabase(widgetId);
                        grid.removeWidget(gridItem, true);
                        
                        // Update local state
                        userWidgets = userWidgets.filter(w => w.id.toString() !== widgetId);
                        localStorage.setItem(`dashboard_widgets_${CURRENT_USER_ID}`, JSON.stringify(userWidgets));
                        
                        showNotification(`Removed ${capitalizeFirstLetter(widgetType)} widget`, 'info');
                        
                        if (grid.engine.nodes.length === 0) {
                            emptyDashboard.classList.remove('hidden');
                        }
                    } catch (error) {
                        console.error(`Error removing ${widgetType} widget:`, error);
                        gridItem.style.transform = '';
                        gridItem.style.opacity = '';
                        showNotification(`Error removing ${widgetType} widget`, 'error');
                    }
                }, 200);
            });
        }
    }
    
    function openAddWidgetModal() {
        addWidgetModal.style.display = 'block';
        
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
    
    function isWidgetAdded(widgetType) {
        return userWidgets.some(widget => widget.widget_type === widgetType);
    }
    
    async function addWidget(widgetType) {
        if (isWidgetAdded(widgetType)) {
            showNotification(`${capitalizeFirstLetter(widgetType)} widget already exists`, 'warning');
            return;
        }
        
        emptyDashboard.classList.add('hidden');
        
        const widget = {
            user_id: CURRENT_USER_ID,
            widget_type: widgetType,
            position_x: 0,
            position_y: 0,
            width: getDefaultWidgetWidth(widgetType),
            height: getDefaultWidgetHeight(widgetType),
            id: `temp_${Date.now().toString()}`
        };
        
        // Add to local state immediately
        userWidgets.push(widget);
        const gridItem = addWidgetToGrid(widget);
        
        if (!gridItem) {
            showNotification('Error creating widget. Please try again.', 'error');
            return;
        }
        
        showNotification(`Added ${capitalizeFirstLetter(widgetType)} widget to dashboard`, 'success');
        localStorage.setItem(`dashboard_widgets_${CURRENT_USER_ID}`, JSON.stringify(userWidgets));
        
        // Try to save to server in background
        try {
            const response = await fetch(`${DASHBOARD_API}/widgets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(widget)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const savedWidget = await response.json();
            
            // Update the local widget with server ID
            const localIndex = userWidgets.findIndex(w => w.id === widget.id);
            if (localIndex !== -1) {
                userWidgets[localIndex] = savedWidget;
                
                // Update the grid item ID
                const gridItemElement = gridItem.el;
                if (gridItemElement) {
                    gridItemElement.setAttribute('gs-id', savedWidget.id.toString());
                }
            }
            
            // Update localStorage with the server data
            localStorage.setItem(`dashboard_widgets_${CURRENT_USER_ID}`, JSON.stringify(userWidgets));
            
        } catch (error) {
            console.error('Error saving widget to server:', error);
            // Widget remains in local state even if server save fails
        }
    }
    
    async function removeWidgetFromDatabase(widgetId) {
        // Skip if it's a local/temporary widget
        if (widgetId.startsWith('temp_') || widgetId.startsWith('local_')) {
            return;
        }
        
        try {
            await fetch(`${DASHBOARD_API}/widgets/${widgetId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error removing widget from server:', error);
            // Continue with local removal even if server fails
        }
    }
    
    async function saveWidgetPositions() {
        const updatedWidgets = grid.engine.nodes.map(node => ({
            id: node.id,
            position_x: node.x,
            position_y: node.y,
            width: node.w,
            height: node.h
        }));
        
        // Update local state
        updatedWidgets.forEach(updated => {
            const index = userWidgets.findIndex(w => w.id.toString() === updated.id.toString());
            if (index !== -1) {
                userWidgets[index] = { ...userWidgets[index], ...updated };
            }
        });
        
        // Save to localStorage immediately
        localStorage.setItem(`dashboard_widgets_${CURRENT_USER_ID}`, JSON.stringify(userWidgets));
        
        // Try to save to server in background
        try {
            await fetch(`${DASHBOARD_API}/widgets/position`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ widgets: updatedWidgets })
            });
        } catch (error) {
            console.error('Error saving widget positions:', error);
        }
    }
    
    function exportDashboardToPDF() {
        const dashboardContainer = document.querySelector('.dashboard-content');
        
        showNotification('Preparing PDF export...', 'info');
        document.body.classList.add('exporting-pdf');
        
        const options = {
            margin: 10,
            filename: `research-dashboard-${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                allowTaint: true,
                logging: true,
                letterRendering: true
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        
        html2pdf()
            .from(dashboardContainer)
            .set(options)
            .save()
            .then(() => {
                document.body.classList.remove('exporting-pdf');
                showNotification('Dashboard exported as PDF', 'success');
            })
            .catch(error => {
                console.error('Error exporting PDF:', error);
                document.body.classList.remove('exporting-pdf');
                showNotification('Error exporting PDF. Please try again.', 'error');
            });
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        toastContainer.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('active');
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                if (notification.parentNode === toastContainer) {
                    toastContainer.removeChild(notification);
                }
            }, 300);
        });
        
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
    
    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Helper functions for widget data display
    function getStatusClass(status) {
        if (!status) return 'status-default';
        
        switch(status.toLowerCase()) {
            case 'completed': return 'status-completed';
            case 'active': return 'status-active';
            case 'pending': return 'status-pending';
            case 'delayed': return 'status-delayed';
            default: return 'status-default';
        }
    }
    
    function getActivityIcon(activityType) {
        switch(activityType.toLowerCase()) {
            case 'project': return 'fa-project-diagram';
            case 'milestone': return 'fa-clipboard-check';
            case 'funding': return 'fa-coins';
            case 'collaboration': return 'fa-users';
            default: return 'fa-info-circle';
        }
    }
    
    // Update the current date in calendar widget
    function updateCurrentDate() {
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = new Date().toLocaleDateString(undefined, options);
        }
    }
    
    // Call this in your init function
    updateCurrentDate();
    setInterval(updateCurrentDate, 60000); // Update every minute
});