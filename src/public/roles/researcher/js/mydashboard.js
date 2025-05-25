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
    const widgetConfigModal = document.getElementById('widget-config-modal');
    const saveConfigBtn = document.getElementById('save-widget-config');
    const cancelConfigBtn = document.getElementById('cancel-widget-config');
    const widgetSizeSelect = document.getElementById('widget-size');
    const customSizeFields = document.getElementById('custom-size-fields');
    const widgetSpecificConfigArea = document.getElementById('widget-specific-config');
    
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
            if (e.target === addWidgetModal || e.target === widgetConfigModal) {
                e.target.style.display = 'none';
            }
        });
        
        const widgetOptions = document.querySelectorAll('.widget-option');
        widgetOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const widgetType = option.getAttribute('data-widget-type');
                // Allow duplicate if Ctrl/Cmd key is pressed
                if (e.ctrlKey || e.metaKey) {
                    addWidget(widgetType);
                    addWidgetModal.style.display = 'none';
                } else if (!option.classList.contains('disabled')) {
                    addWidget(widgetType);
                    addWidgetModal.style.display = 'none';
                }
            });
        });

        // Widget configuration modal events
        saveConfigBtn.addEventListener('click', saveWidgetConfig);
        cancelConfigBtn.addEventListener('click', () => widgetConfigModal.style.display = 'none');
        widgetSizeSelect.addEventListener('change', toggleCustomSizeFields);
    }
    
    function toggleCustomSizeFields() {
        if (widgetSizeSelect.value === 'custom') {
            customSizeFields.classList.remove('hidden');
        } else {
            customSizeFields.classList.add('hidden');
        }
    }

    function openAddWidgetModal() {
        addWidgetModal.style.display = 'block';
        
        // Remove any existing help text
        const existingHelp = addWidgetModal.querySelector('.duplicate-help');
        if (existingHelp) {
            existingHelp.remove();
        }
        
        const widgetOptions = document.querySelectorAll('.widget-option');
        widgetOptions.forEach(option => {
            const widgetType = option.getAttribute('data-widget-type');
            if (isWidgetOnDashboard(widgetType)) {
                option.classList.add('disabled');
                option.title = 'This widget is already on your dashboard (hold Ctrl/Cmd to add another)';
            } else {
                option.classList.remove('disabled');
                option.title = '';
            }
        });
        
        // Add help text about duplicates
        const helpText = document.createElement('p');
        helpText.className = 'duplicate-help';
        helpText.textContent = 'Tip: Hold Ctrl/Cmd while clicking to add duplicate widgets';
        addWidgetModal.querySelector('.modal-body').appendChild(helpText);
    }

    function isWidgetOnDashboard(widgetType) {
        return grid.engine.nodes.some(node => 
            node.el && node.el.getAttribute('data-widget-type') === widgetType
        );
    }

    function getWidgetSpecificFields(widgetType) {
        // Return different fields based on widget type
        switch(widgetType) {
            case 'projects':
                return `
                    <fieldset class="form-group">
                        <label>Display Options</label>
                        <label class="checkbox-group">
                            <input type="checkbox" id="show-project-status" checked>
                            Show project status
                        </label>
                        <label class="checkbox-group">
                            <input type="checkbox" id="show-collaborators" checked>
                            Show collaborators
                        </label>
                    </fieldset>
                `;
            case 'milestones':
                return `
                    <fieldset class="form-group">
                        <label for="milestone-range">Time Range</label>
                        <select id="milestone-range" class="styled-input">
                            <option value="upcoming">Upcoming</option>
                            <option value="recent">Recent</option>
                            <option value="all">All</option>
                        </select>
                    </fieldset>
                `;
            case 'funding':
                return `
                    <fieldset class="form-group">
                        <label for="funding-chart-type">Chart Type</label>
                        <select id="funding-chart-type" class="styled-input">
                            <option value="doughnut">Doughnut</option>
                            <option value="pie">Pie</option>
                            <option value="bar">Bar</option>
                        </select>
                    </fieldset>
                `;
            case 'calendar':
                return `
                    <fieldset class="form-group">
                        <label for="calendar-view">View Type</label>
                        <select id="calendar-view" class="styled-input">
                            <option value="upcoming">Upcoming Events</option>
                            <option value="month">Month View</option>
                            <option value="list">List View</option>
                        </select>
                    </fieldset>
                `;
            default:
                return '<p>No additional options for this widget type.</p>';
        }
    }

    function openWidgetConfigModal(widgetElement, widgetType) {
        widgetConfigModal.currentWidget = widgetElement;
        
        // Set current title
        const titleElement = widgetElement.querySelector('.widget-header h3');
        const titleText = titleElement.textContent.trim();
        document.getElementById('widget-title').value = titleText.replace(/^[^a-zA-Z0-9]+/, '').trim();
        
        // Set current size
        const node = grid.engine.nodes.find(n => n.el === widgetElement);
        if (node) {
            const width = node.w;
            const height = node.h;
            
            // Set size preset or custom
            if (width === 4 && height === 3) {
                widgetSizeSelect.value = 'small';
            } else if (width === 6 && height === 4) {
                widgetSizeSelect.value = 'medium';
            } else if (width === 8 && height === 6) {
                widgetSizeSelect.value = 'large';
            } else {
                widgetSizeSelect.value = 'custom';
                document.getElementById('widget-width').value = width;
                document.getElementById('widget-height').value = height;
                customSizeFields.classList.remove('hidden');
            }
        }
        
        // Set widget-specific configuration
        widgetSpecificConfigArea.innerHTML = getWidgetSpecificFields(widgetType);
        
        // Set current values for widget-specific config
        switch(widgetType) {
            case 'projects':
                document.getElementById('show-project-status').checked = widgetElement.dataset.showStatus !== 'false';
                document.getElementById('show-collaborators').checked = widgetElement.dataset.showCollaborators !== 'false';
                break;
            case 'milestones':
                document.getElementById('milestone-range').value = widgetElement.dataset.timeRange || 'upcoming';
                break;
            case 'funding':
                document.getElementById('funding-chart-type').value = widgetElement.dataset.chartType || 'doughnut';
                break;
            case 'calendar':
                document.getElementById('calendar-view').value = widgetElement.dataset.viewType || 'upcoming';
                break;
        }
        
        widgetConfigModal.style.display = 'block';
    }

    function saveWidgetConfig() {
        const widgetElement = widgetConfigModal.currentWidget;
        if (!widgetElement) return;
        
        const newTitle = document.getElementById('widget-title').value;
        const sizePreset = document.getElementById('widget-size').value;
        
        let width, height;
        if (sizePreset === 'custom') {
            width = parseInt(document.getElementById('widget-width').value) || 6;
            height = parseInt(document.getElementById('widget-height').value) || 4;
        } else {
            // Set dimensions based on preset
            switch(sizePreset) {
                case 'small':
                    width = 4;
                    height = 3;
                    break;
                case 'medium':
                    width = 6;
                    height = 4;
                    break;
                case 'large':
                    width = 8;
                    height = 6;
                    break;
            }
        }
        
        // Update widget title (preserve icon)
        const titleElement = widgetElement.querySelector('.widget-header h3');
        const icon = titleElement.querySelector('i');
        if (icon) {
            titleElement.innerHTML = `${icon.outerHTML} ${newTitle}`;
        } else {
            titleElement.textContent = newTitle;
        }
        
        // Update widget size
        grid.update(widgetElement, { w: width, h: height });
        
        // Save widget-specific config
        const widgetType = widgetElement.getAttribute('data-widget-type');
        saveWidgetSpecificConfig(widgetElement, widgetType);
        
        widgetConfigModal.style.display = 'none';
        showNotification('Widget configuration saved', 'success');
    }

    function saveWidgetSpecificConfig(widgetElement, widgetType) {
        // Save widget-specific configuration
        switch(widgetType) {
            case 'projects':
                widgetElement.dataset.showStatus = document.getElementById('show-project-status').checked;
                widgetElement.dataset.showCollaborators = document.getElementById('show-collaborators').checked;
                break;
            case 'milestones':
                widgetElement.dataset.timeRange = document.getElementById('milestone-range').value;
                break;
            case 'funding':
                widgetElement.dataset.chartType = document.getElementById('funding-chart-type').value;
                break;
            case 'calendar':
                widgetElement.dataset.viewType = document.getElementById('calendar-view').value;
                break;
        }
        
        // Reload widget data to apply changes
        loadWidgetData(widgetElement, widgetType);
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
        }
    }
    
    function addWidgetToGrid(widget) {
        try {
            const widgetElement = document.createElement('section');
            widgetElement.classList.add('grid-stack-item');
            widgetElement.setAttribute('data-widget-type', widget.widget_type);
            
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
    
    function setupWidgetEventListeners(widget, widgetType) {
        // Hover effects
        widget.addEventListener('mouseenter', () => {
            widget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.12)';
        });
        
        widget.addEventListener('mouseleave', () => {
            widget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
        });

        // Add configuration button to widget actions
        const actionsMenu = widget.querySelector('.widget-actions');
        if (actionsMenu) {
            const configBtn = document.createElement('button');
            configBtn.className = 'widget-config';
            configBtn.title = 'Configure Widget';
            configBtn.innerHTML = '<i class="fas fa-cog"></i>';
            configBtn.addEventListener('click', () => openWidgetConfigModal(widget, widgetType));
            actionsMenu.insertBefore(configBtn, actionsMenu.firstChild);
        }

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
            listContainer.innerHTML = '<p class="no-data">No projects found</p>';
            return;
        }
        
        // Show only the most recent 3-5 projects
        const recentProjects = projects.slice(0, 5);
        
        recentProjects.forEach(project => {
            const projectItem = document.createElement('li');
            projectItem.className = 'project-item';
            
            const statusClass = getStatusClass(project.status);
            const startDate = project.start_date ? new Date(project.start_date).toLocaleDateString() : 'No date';
            
            let html = `
                <section class="project-header">
                    ${widgetElement.dataset.showStatus !== 'false' ? 
                        `<mark class="project-status ${statusClass}">${project.status || 'Active'}</mark>` : ''}
                    <h4>${project.project_title || 'Untitled Project'}</h4>
                </section>
                <section class="project-meta">
                    <time datetime="${project.start_date}"><i class="fas fa-calendar"></i> ${startDate}</time>
            `;
            
            if (widgetElement.dataset.showCollaborators !== 'false') {
                html += `<data value="${project.collaborator_count || 0}"><i class="fas fa-users"></i> ${project.collaborator_count || 0} collaborators</data>`;
            }
            
            html += `</section>`;
            
            projectItem.innerHTML = html;
            
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
            listContainer.innerHTML = '<p class="no-data">No milestones found</p>';
            return;
        }
        
        // Filter milestones based on time range setting
        let filteredMilestones = [...milestones];
        const timeRange = widgetElement.dataset.timeRange || 'upcoming';
        const today = new Date();
        
        if (timeRange === 'upcoming') {
            filteredMilestones = filteredMilestones.filter(m => new Date(m.end_date) >= today);
        } else if (timeRange === 'recent') {
            filteredMilestones = filteredMilestones.filter(m => new Date(m.end_date) < today);
        }
        
        // Sort by date
        filteredMilestones.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
        
        // Show only the most urgent 3-5 milestones
        const displayMilestones = filteredMilestones.slice(0, 5);
        
        displayMilestones.forEach(milestone => {
            const milestoneItem = document.createElement('li');
            milestoneItem.className = 'milestone-item';
            
            const statusClass = getStatusClass(milestone.status);
            const endDate = milestone.end_date ? new Date(milestone.end_date).toLocaleDateString() : 'No date';
            
            milestoneItem.innerHTML = `
                <section class="milestone-header">
                    <mark class="milestone-status ${statusClass}">${milestone.status || 'Pending'}</mark>
                    <h4>${milestone.title || 'Untitled Milestone'}</h4>
                </section>
                <section class="milestone-meta">
                    <time datetime="${milestone.end_date}"><i class="fas fa-calendar"></i> Due: ${endDate}</time>
                    ${milestone.project_title ? `<data value="${milestone.project_title}"><i class="fas fa-project-diagram"></i> ${milestone.project_title}</data>` : ''}
                </section>
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
            summaryContainer.innerHTML = '<p class="no-data">No funding records found</p>';
            chartContainer.style.display = 'none';
            return;
        }
        
        // Calculate totals
        const totalFunding = fundingRecords.reduce((sum, record) => sum + parseFloat(record.total_amount || 0), 0);
        const totalSpent = fundingRecords.reduce((sum, record) => sum + parseFloat(record.amount_spent || 0), 0);
        const totalRemaining = totalFunding - totalSpent;
        
        // Update summary
        summaryContainer.innerHTML = `
            <section class="funding-stats">
                <section class="stat-item">
                    <output class="stat-value">R${totalFunding.toLocaleString()}</output>
                    <label class="stat-label">Total Funding</label>
                </section>
                <section class="stat-item">
                    <output class="stat-value">R${totalSpent.toLocaleString()}</output>
                    <label class="stat-label">Spent</label>
                </section>
                <section class="stat-item">
                    <output class="stat-value">R${totalRemaining.toLocaleString()}</output>
                    <label class="stat-label">Remaining</label>
                </section>
            </section>
        `;
        
        // Create or update chart
        if (widgetElement.fundingChart) {
            widgetElement.fundingChart.destroy();
        }
        
        const chartType = widgetElement.dataset.chartType || 'doughnut';
        
        widgetElement.fundingChart = new Chart(ctx, {
            type: chartType,
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
            calendarContainer.innerHTML = '<p class="no-data">No calendar events found</p>';
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
        
        const viewType = widgetElement.dataset.viewType || 'upcoming';
        
        if (viewType === 'upcoming') {
            // Display upcoming events (next 7 days)
            const today = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7);
            
            const upcomingEvents = allEvents.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= today && eventDate <= nextWeek;
            });
            
            if (upcomingEvents.length === 0) {
                calendarContainer.innerHTML = '<p class="no-upcoming">No upcoming events in the next 7 days</p>';
                
                // Show all events button
                const showAllBtn = document.createElement('button');
                showAllBtn.className = 'btn btn-secondary show-all-events';
                showAllBtn.innerHTML = '<i class="fas fa-calendar-alt"></i> View All Events';
                showAllBtn.addEventListener('click', () => displayAllCalendarEvents(calendarContainer, eventsByDate));
                calendarContainer.appendChild(showAllBtn);
                
                return;
            }
            
            // Create a list of upcoming events
            const upcomingList = document.createElement('section');
            upcomingList.className = 'upcoming-events';
            
            upcomingEvents.slice(0, 5).forEach(event => {
                const eventItem = document.createElement('article');
                eventItem.className = 'calendar-event';
                eventItem.style.borderLeft = `3px solid ${event.color}`;
                
                const eventDate = new Date(event.date);
                const isToday = eventDate.toDateString() === today.toDateString();
                
                eventItem.innerHTML = `
                    <time class="event-date ${isToday ? 'today' : ''}" datetime="${event.date}">
                        ${isToday ? 'Today' : eventDate.toLocaleDateString()}
                    </time>
                    <h4 class="event-title">
                        ${event.title}
                    </h4>
                    <data class="event-type" value="${event.type}" style="color: ${event.color}">
                        ${event.type}
                    </data>
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
        } else if (viewType === 'list') {
            displayAllCalendarEvents(calendarContainer, eventsByDate);
        } else if (viewType === 'month') {
            // Simple month view implementation
            calendarContainer.innerHTML = '<p class="no-data">Month view coming soon</p>';
        }
    }
    
    function displayAllCalendarEvents(container, eventsByDate) {
        container.innerHTML = '';
        
        const allEventsList = document.createElement('section');
        allEventsList.className = 'all-events';
        
        Object.keys(eventsByDate).forEach(dateStr => {
            const dateHeader = document.createElement('h4');
            dateHeader.className = 'event-date-header';
            dateHeader.textContent = dateStr;
            allEventsList.appendChild(dateHeader);
            
            eventsByDate[dateStr].forEach(event => {
                const eventItem = document.createElement('article');
                eventItem.className = 'calendar-event';
                eventItem.style.borderLeft = `3px solid ${event.color}`;
                
                eventItem.innerHTML = `
                    <h4 class="event-title">
                        ${event.title}
                    </h4>
                    <data class="event-type" value="${event.type}" style="color: ${event.color}">
                        ${event.type}
                    </data>
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
            listContainer.innerHTML = '<p class="no-data">No recent activity</p>';
            return;
        }
        
        // Show only the most recent 5 activities
        const recentActivities = activities.slice(0, 5);
        
        recentActivities.forEach(activity => {
            const activityItem = document.createElement('li');
            activityItem.className = 'activity-item';
            
            const activityDate = activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Recently';
            
            activityItem.innerHTML = `
                <figure class="activity-icon">
                    <i class="fas ${getActivityIcon(activity.type)}"></i>
                </figure>
                <section class="activity-content">
                    <p class="activity-message">${activity.message}</p>
                    <section class="activity-meta">
                        <data class="activity-type" value="${activity.type}">${activity.type}</data>
                        <time class="activity-date" datetime="${activity.timestamp}">${activityDate}</time>
                    </section>
                </section>
            `;
            
            listContainer.appendChild(activityItem);
        });
    }
    
    function displayAISuggestionsWidgetData(widgetElement, suggestions) {
        const listContainer = widgetElement.querySelector('.ai-suggestions-list');
        listContainer.innerHTML = '';
        
        if (suggestions.length === 0) {
            listContainer.innerHTML = '<p class="no-data">No AI suggestions available</p>';
            return;
        }
        
        // Show only the top 3 suggestions
        const topSuggestions = suggestions.slice(0, 3);
        
        topSuggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('li');
            suggestionItem.className = 'ai-suggestion-item';
            
            suggestionItem.innerHTML = `
                <header class="suggestion-header">
                    <i class="fas fa-lightbulb"></i>
                    <h4>${suggestion.title}</h4>
                </header>
                <section class="suggestion-content">
                    <p>${suggestion.description}</p>
                    ${suggestion.action ? `<button class="btn btn-small">${suggestion.action}</button>` : ''}
                </section>
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
    
    async function addWidget(widgetType) {
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
                
                const gridItemElement = gridItem.el;
                if (gridItemElement) {
                    gridItemElement.setAttribute('gs-id', savedWidget.id.toString());
                }
            }
            
            localStorage.setItem(`dashboard_widgets_${CURRENT_USER_ID}`, JSON.stringify(userWidgets));
            
        } catch (error) {
            console.error('Error saving widget to server:', error);
        }
    }
    
    async function removeWidgetFromDatabase(widgetId) {
        if (widgetId.startsWith('temp_') || widgetId.startsWith('local_')) {
            return;
        }
        
        try {
            await fetch(`${DASHBOARD_API}/widgets/${widgetId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error removing widget from server:', error);
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
        const notification = document.createElement('article');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <section class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <output>${message}</output>
            </section>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('aside');
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