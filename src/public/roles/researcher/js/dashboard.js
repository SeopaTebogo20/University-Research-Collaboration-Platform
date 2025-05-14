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
            
            // Simulate data loading
            setTimeout(() => {
                loadingElement.innerHTML = `<i class="fas fa-check-circle"></i> ${capitalizeFirstLetter(widgetType)} data loaded`;
                setTimeout(() => {
                    loadingElement.style.display = 'none';
                }, 1000);
            }, 1500);
        }
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
        const refreshBtn = widget.querySelector('.widget-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                showNotification(`Refreshing ${capitalizeFirstLetter(widgetType)} widget...`, 'info');
                loadWidgetData(widget, widgetType);
            });
        }
        
        const removeBtn = widget.querySelector('.widget-remove');
        if (removeBtn) {
            removeBtn.addEventListener('click', async () => {
                const gridItem = widget.closest('.grid-stack-item');
                const widgetId = gridItem.getAttribute('gs-id');
                
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
                    showNotification(`Error removing ${widgetType} widget`, 'error');
                }
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
});