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
    
    initApp();
    
    async function initApp() {
        console.log('Initializing application...');
        setupEventListeners();
        
        try {
            grid = GridStack.init({
                margin: 10,
                cellHeight: 80,
                minRow: 1,
                disableOneColumnMode: false,
                float: false,
                resizable: { handles: 'e,se,s,sw,w' },
                acceptWidgets: true
            });
            
            console.log('GridStack initialized successfully');
            grid.on('change', saveWidgetPositions);
            
            await loadUserWidgets();
            loadingIndicator.style.display = 'none';
        } catch (error) {
            console.error('Error initializing grid:', error);
            showNotification('Error initializing dashboard. Please refresh the page.', 'error');
            loadingIndicator.style.display = 'none';
        }
    }
    
    function setupEventListeners() {
        console.log('Setting up event listeners...');
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
                console.log('Widget option clicked:', widgetType);
                addWidget(widgetType);
                addWidgetModal.style.display = 'none';
            });
        });
    }
    
    async function loadUserWidgets() {
        console.log('Loading user widgets...');
        try {
            const response = await fetch(`${DASHBOARD_API}/widgets/${CURRENT_USER_ID}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const widgets = await response.json();
            console.log('Loaded widgets:', widgets);
            userWidgets = widgets;
            
            if (widgets.length === 0) {
                console.log('No widgets found - showing empty dashboard');
                emptyDashboard.classList.remove('hidden');
                return;
            }
            
            emptyDashboard.classList.add('hidden');
            
            // Clear existing widgets first
            grid.removeAll();
            
            // Add widgets one by one with a small delay to prevent rendering issues
            for (const widget of widgets) {
                await addWidgetToGrid(widget);
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
        } catch (error) {
            console.error('Error loading user widgets:', error);
            showNotification('Error loading dashboard. Please try again later.', 'error');
            emptyDashboard.classList.remove('hidden');
        }
    }
    
    async function addWidgetToGrid(widget) {
        console.log('Adding widget to grid:', widget);
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
                id: widget.id?.toString() || Date.now().toString(),
                noMove: false,
                noResize: false,
                locked: false
            };
            
            console.log('Adding widget with options:', gridOptions);
            const gridItem = grid.addWidget(widgetElement, gridOptions);
            
            if (!gridItem) {
                throw new Error('Failed to add widget to grid');
            }
            
            console.log('Widget added successfully:', gridItem);
            setupWidgetEventListeners(gridItem, widget.widget_type);
            
            // Load widget data after it's added to the grid
            await loadWidgetData(gridItem, widget.widget_type);
            
            return gridItem;
        } catch (error) {
            console.error('Error adding widget to grid:', error);
            showNotification(`Error adding ${widget.widget_type} widget`, 'error');
            throw error;
        }
    }
    
    async function loadWidgetData(widgetElement, widgetType) {
        console.log(`Loading data for ${widgetType} widget`);
        try {
            // Simulate data loading (replace with actual API calls)
            const loadingElement = widgetElement.querySelector('.loading');
            if (loadingElement) {
                setTimeout(() => {
                    loadingElement.innerHTML = `<i class="fas fa-check-circle"></i> ${capitalizeFirstLetter(widgetType)} data loaded`;
                    setTimeout(() => {
                        loadingElement.style.display = 'none';
                        // Here you would populate actual data
                    }, 1000);
                }, 1500);
            }
        } catch (error) {
            console.error(`Error loading data for ${widgetType} widget:`, error);
        }
    }
    
    function getWidgetTemplate(widgetType) {
        console.log(`Getting template for ${widgetType}`);
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
            console.error(`Template not found for ${widgetType}`);
            return null;
        }
        
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
        console.log(`Setting up event listeners for ${widgetType} widget`);
        
        const refreshBtn = widget.querySelector('.widget-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                console.log(`Refreshing ${widgetType} widget`);
                showNotification(`Refreshing ${capitalizeFirstLetter(widgetType)} widget...`, 'info');
                loadWidgetData(widget, widgetType);
            });
        }
        
        const removeBtn = widget.querySelector('.widget-remove');
        if (removeBtn) {
            removeBtn.addEventListener('click', async () => {
                console.log(`Removing ${widgetType} widget`);
                const gridItem = widget.closest('.grid-stack-item');
                const widgetId = gridItem.getAttribute('gs-id');
                
                try {
                    await removeWidgetFromDatabase(widgetId);
                    grid.removeWidget(gridItem, true);
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
        console.log('Opening add widget modal');
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
        console.log(`Adding new ${widgetType} widget`);
        emptyDashboard.classList.add('hidden');
        
        const widget = {
            user_id: CURRENT_USER_ID,
            widget_type: widgetType,
            position_x: 0,
            position_y: 0,
            width: getDefaultWidgetWidth(widgetType),
            height: getDefaultWidgetHeight(widgetType)
        };
        
        try {
            console.log('Saving widget to server:', widget);
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
            console.log('Widget saved to server:', savedWidget);
            
            userWidgets.push(savedWidget);
            await addWidgetToGrid(savedWidget);
            showNotification(`Added ${capitalizeFirstLetter(widgetType)} widget to dashboard`, 'success');
            
        } catch (error) {
            console.error('Error adding widget:', error);
            showNotification('Error adding widget. Please try again.', 'error');
            
            // If API fails, add widget locally for better UX
            if (error.message.includes('Failed to fetch')) {
                console.log('Adding widget locally due to API failure');
                const localWidget = {
                    ...widget,
                    id: Date.now().toString()
                };
                userWidgets.push(localWidget);
                await addWidgetToGrid(localWidget);
                showNotification(`Added ${capitalizeFirstLetter(widgetType)} widget locally`, 'info');
            }
        }
    }
    
    async function removeWidgetFromDatabase(widgetId) {
        console.log(`Removing widget ${widgetId} from database`);
        try {
            const response = await fetch(`${DASHBOARD_API}/widgets/${widgetId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            userWidgets = userWidgets.filter(w => w.id.toString() !== widgetId);
            console.log(`Widget ${widgetId} removed successfully`);
            
        } catch (error) {
            console.error('Error removing widget from database:', error);
            throw error;
        }
    }
    
    async function saveWidgetPositions() {
        console.log('Saving widget positions...');
        try {
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
            
            console.log('Updated widgets:', updatedWidgets);
            
            // Update local state
            updatedWidgets.forEach(updated => {
                const index = userWidgets.findIndex(w => w.id.toString() === updated.id.toString());
                if (index !== -1) {
                    userWidgets[index].position_x = updated.position_x;
                    userWidgets[index].position_y = updated.position_y;
                    userWidgets[index].width = updated.width;
                    userWidgets[index].height = updated.height;
                }
            });
            
            // Save to server
            const response = await fetch(`${DASHBOARD_API}/widgets/position`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ widgets: updatedWidgets })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            console.log('Widget positions saved successfully');
            
        } catch (error) {
            console.error('Error saving widget positions:', error);
        }
    }
    
    function exportDashboardToPDF() {
        console.log('Exporting dashboard to PDF');
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
        
        console.log('Starting PDF export with options:', options);
        html2pdf()
            .from(dashboardContainer)
            .set(options)
            .save()
            .then(() => {
                console.log('PDF export completed successfully');
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
        console.log(`Showing notification: [${type}] ${message}`);
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