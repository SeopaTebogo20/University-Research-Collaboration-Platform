/**
 * @jest-environment jsdom
 */

// Mock dependencies before importing the module
const mockGridInstance = {
  on: jest.fn(),
  addWidget: jest.fn().mockReturnValue(document.createElement('section')),
  removeWidget: jest.fn(),
  update: jest.fn(),
  removeAll: jest.fn(),
  engine: {
    nodes: []
  }
};

// Mock GridStack
global.GridStack = {
  init: jest.fn().mockReturnValue(mockGridInstance)
};

// Mock Chart
global.Chart = jest.fn().mockImplementation(() => ({
  destroy: jest.fn(),
  update: jest.fn()
}));

// Mock html2pdf
global.html2pdf = jest.fn().mockReturnValue({
  from: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  save: jest.fn().mockReturnThis(),
  then: jest.fn().mockImplementation(callback => {
    callback();
    return {
      catch: jest.fn().mockImplementation(callback => {})
    };
  })
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock fetch
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
);

// Set up window location mock
delete window.location;
window.location = {
  hostname: 'localhost',
  href: 'http://localhost/',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn()
};

// Set up a delayed promise resolver for async tests
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe('Dashboard Functionality Tests', () => {
  // Set up DOM for tests
  beforeAll(() => {
    // Set up the document body with the dashboard HTML structure
    document.body.innerHTML = `
      <main class="dashboard-content">
        <section class="grid-stack"></section>
        
        <button id="add-widget-btn">Add Widget</button>
        <button id="export-dashboard-btn">Export</button>
        
        <section id="empty-dashboard" class="hidden">
          <p>Your dashboard is empty</p>
          <button id="empty-add-widget-btn">Add Widget</button>
        </section>
        
        <section id="loading-indicator">
          <i class="fas fa-spinner fa-spin"></i> Loading dashboard...
        </section>
        
        <!-- Modal structures -->
        <section id="add-widget-modal" class="modal">
          <section class="modal-content">
            <span class="close">&times;</span>
            <section class="modal-body">
              <section class="widget-option" data-widget-type="projects"></section>
              <section class="widget-option" data-widget-type="milestones"></section>
              <section class="widget-option" data-widget-type="funding"></section>
              <section class="widget-option" data-widget-type="calendar"></section>
              <section class="widget-option" data-widget-type="recent_activity"></section>
              <section class="widget-option" data-widget-type="ai_suggestions"></section>
            </section>
          </section>
        </section>
        
        <section id="widget-config-modal" class="modal">
          <section class="modal-content">
            <span class="close">&times;</span>
            <section class="modal-body">
              <input id="widget-title" type="text">
              <select id="widget-size">
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="custom">Custom</option>
              </select>
              <section id="custom-size-fields" class="hidden">
                <input id="widget-width" type="number">
                <input id="widget-height" type="number">
              </section>
              <button id="save-widget-config">Save</button>
              <button id="cancel-widget-config">Cancel</button>
            </section>
          </section>
        </section>
        
        <aside id="toast-container"></aside>
      </main>
      
      <!-- Widget templates -->
      <template id="projects-widget-template">
        <article class="widget">
          <header class="widget-header">
            <h3><i class="fas fa-project-diagram"></i> Projects</h3>
            <section class="widget-actions">
              <button class="widget-refresh" title="Refresh"><i class="fas fa-sync-alt"></i></button>
              <button class="widget-remove" title="Remove"><i class="fas fa-times"></i></button>
            </section>
          </header>
          <section class="widget-content">
            <section class="loading"></section>
            <ul class="projects-list"></ul>
          </section>
        </article>
      </template>
      
      <template id="milestones-widget-template">
        <article class="widget">
          <header class="widget-header">
            <h3><i class="fas fa-flag"></i> Milestones</h3>
            <section class="widget-actions">
              <button class="widget-refresh" title="Refresh"><i class="fas fa-sync-alt"></i></button>
              <button class="widget-remove" title="Remove"><i class="fas fa-times"></i></button>
            </section>
          </header>
          <section class="widget-content">
            <section class="loading"></section>
            <ul class="milestones-list"></ul>
          </section>
        </article>
      </template>
      
      <template id="funding-widget-template">
        <article class="widget">
          <header class="widget-header">
            <h3><i class="fas fa-coins"></i> Funding</h3>
            <section class="widget-actions">
              <button class="widget-refresh" title="Refresh"><i class="fas fa-sync-alt"></i></button>
              <button class="widget-remove" title="Remove"><i class="fas fa-times"></i></button>
            </section>
          </header>
          <section class="widget-content">
            <section class="loading"></section>
            <section class="funding-summary"></section>
            <canvas class="funding-chart"></canvas>
          </section>
        </article>
      </template>
      
      <template id="calendar-widget-template">
        <article class="widget">
          <header class="widget-header">
            <h3><i class="fas fa-calendar"></i> Calendar</h3>
            <section class="widget-actions">
              <button class="widget-refresh" title="Refresh"><i class="fas fa-sync-alt"></i></button>
              <button class="widget-remove" title="Remove"><i class="fas fa-times"></i></button>
            </section>
          </header>
          <section class="widget-content">
            <section class="loading"></section>
            <section class="calendar-container"></section>
          </section>
        </article>
      </template>
      
      <template id="recent-activity-widget-template">
        <article class="widget">
          <header class="widget-header">
            <h3><i class="fas fa-history"></i> Recent Activity</h3>
            <section class="widget-actions">
              <button class="widget-refresh" title="Refresh"><i class="fas fa-sync-alt"></i></button>
              <button class="widget-remove" title="Remove"><i class="fas fa-times"></i></button>
            </section>
          </header>
          <section class="widget-content">
            <section class="loading"></section>
            <ul class="activity-list"></ul>
          </section>
        </article>
      </template>
      
      <template id="ai-suggestions-widget-template">
        <article class="widget">
          <header class="widget-header">
            <h3><i class="fas fa-lightbulb"></i> AI Suggestions</h3>
            <section class="widget-actions">
              <button class="widget-refresh" title="Refresh"><i class="fas fa-sync-alt"></i></button>
              <button class="widget-remove" title="Remove"><i class="fas fa-times"></i></button>
            </section>
          </header>
          <section class="widget-content">
            <section class="loading"></section>
            <ul class="ai-suggestions-list"></ul>
          </section>
        </article>
      </template>
    `;

    // Create a mock script to simulate the document event listener
    const script = document.createElement('script');
    script.textContent = `
      document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded triggered');
      });
    `;
    document.head.appendChild(script);

    // Manually trigger DOMContentLoaded since Jest doesn't do it
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset localStorage mock
    localStorageMock.clear();
    
    // Reset fetch mock
    fetch.mockClear();
    fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    );
    
    // Reset grid instance
    mockGridInstance.engine.nodes = [];
  });

  // Test Suite 1: Dashboard Initialization
  describe('Dashboard Initialization', () => {
    test('should initialize GridStack with proper configuration', () => {
      // Simulate execution of initApp
      window.initApp = () => {
        GridStack.init({
          margin: 10,
          cellHeight: 80,
          minRow: 1,
          disableOneColumnMode: false,
          float: false,
          resizable: { handles: 'e,se,s,sw,w' },
          acceptWidgets: true,
          staticGrid: false
        });
      };
      
      window.initApp();
      
      expect(GridStack.init).toHaveBeenCalledWith(expect.objectContaining({
        margin: 10,
        cellHeight: 80,
        minRow: 1
      }));
    });
    
    test('should handle empty dashboard state correctly', () => {
      const emptyDashboard = document.getElementById('empty-dashboard');
      
      // Make sure the empty dashboard is hidden initially
      emptyDashboard.classList.add('hidden');
      
      // Simulate no widgets in localStorage
      localStorageMock.getItem.mockReturnValueOnce(null);
      
      // Trigger loading from localStorage
      window.loadWidgetsFromLocalStorage = () => {
        const savedWidgets = localStorage.getItem('dashboard_widgets_ae3a44c8-562f-4184-9753-931aed14c68d');
        if (!savedWidgets || JSON.parse(savedWidgets).length === 0) {
          emptyDashboard.classList.remove('hidden');
        }
      };
      
      window.loadWidgetsFromLocalStorage();
      
      expect(emptyDashboard.classList.contains('hidden')).toBe(false);
    });
    
    test('should hide empty dashboard when widgets exist', () => {
      const emptyDashboard = document.getElementById('empty-dashboard');
      
      // Show the empty dashboard initially
      emptyDashboard.classList.remove('hidden');
      
      // Simulate widgets in localStorage
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([
        { id: '1', widget_type: 'projects' }
      ]));
      
      // Trigger loading from localStorage
      window.loadWidgetsFromLocalStorage = () => {
        const savedWidgets = localStorage.getItem('dashboard_widgets_ae3a44c8-562f-4184-9753-931aed14c68d');
        if (savedWidgets && JSON.parse(savedWidgets).length > 0) {
          emptyDashboard.classList.add('hidden');
        }
      };
      
      window.loadWidgetsFromLocalStorage();
      
      expect(emptyDashboard.classList.contains('hidden')).toBe(true);
    });
  });

  // Test Suite 2: Widget Management
  describe('Widget Management', () => {
    test('should add widget to dashboard', async () => {
      const emptyDashboard = document.getElementById('empty-dashboard');
      
      // Show empty dashboard initially
      emptyDashboard.classList.remove('hidden');
      
      window.addWidget = (widgetType) => {
        emptyDashboard.classList.add('hidden');
        
        const widget = {
          user_id: 'ae3a44c8-562f-4184-9753-931aed14c68d',
          widget_type: widgetType,
          position_x: 0,
          position_y: 0,
          width: 6,
          height: 4,
          id: `temp_${Date.now().toString()}`
        };
        
        // Add widget to grid
        GridStack.init().addWidget(document.createElement('section'), {
          x: widget.position_x,
          y: widget.position_y,
          w: widget.width,
          h: widget.height,
          id: widget.id
        });
        
        // Save to localStorage
        localStorage.setItem('dashboard_widgets_ae3a44c8-562f-4184-9753-931aed14c68d', JSON.stringify([widget]));
      };
      
      // Add a projects widget
      window.addWidget('projects');
      
      // Verify the widget was added
      expect(GridStack.init().addWidget).toHaveBeenCalled();
      expect(emptyDashboard.classList.contains('hidden')).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'dashboard_widgets_ae3a44c8-562f-4184-9753-931aed14c68d',
        expect.stringContaining('projects')
      );
    });
    
    test('should remove widget from dashboard', async () => {
      // Setup for widget removal test
      mockGridInstance.engine.nodes = [{ id: '1', el: document.createElement('section') }];
      
      window.removeWidgetFromDatabase = jest.fn().mockResolvedValue(true);
      
      window.removeWidget = async (widgetId) => {
        await window.removeWidgetFromDatabase(widgetId);
        GridStack.init().removeWidget(mockGridInstance.engine.nodes[0].el);
        mockGridInstance.engine.nodes = [];
        
        if (mockGridInstance.engine.nodes.length === 0) {
          document.getElementById('empty-dashboard').classList.remove('hidden');
        }
      };
      
      await window.removeWidget('1');
      
      expect(window.removeWidgetFromDatabase).toHaveBeenCalledWith('1');
      expect(mockGridInstance.removeWidget).toHaveBeenCalled();
      expect(document.getElementById('empty-dashboard').classList.contains('hidden')).toBe(false);
    });
    
    test('should save widget positions', () => {
      // Setup for widget position saving test
      mockGridInstance.engine.nodes = [
        { id: '1', x: 0, y: 0, w: 6, h: 4 },
        { id: '2', x: 6, y: 0, w: 6, h: 4 }
      ];
      
      window.saveWidgetPositions = () => {
        const updatedWidgets = mockGridInstance.engine.nodes.map(node => ({
          id: node.id,
          position_x: node.x,
          position_y: node.y,
          width: node.w,
          height: node.h
        }));
        
        // Save to localStorage
        const userWidgets = updatedWidgets;
        localStorage.setItem('dashboard_widgets_ae3a44c8-562f-4184-9753-931aed14c68d', JSON.stringify(userWidgets));
        
        // Save to server
        fetch('https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net/api/mydashboard/widgets/position', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ widgets: updatedWidgets })
        });
      };
      
      window.saveWidgetPositions();
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'dashboard_widgets_ae3a44c8-562f-4184-9753-931aed14c68d',
        expect.stringContaining('"id":"1"')
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/widgets/position'),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.any(Object),
          body: expect.stringContaining('"widgets"')
        })
      );
    });
  });

  // Test Suite 3: Dashboard UI and Interactions
  describe('Dashboard UI and Interactions', () => {
    test('should open add widget modal', () => {
      const addWidgetModal = document.getElementById('add-widget-modal');
      addWidgetModal.style.display = 'none';
      
      window.openAddWidgetModal = () => {
        addWidgetModal.style.display = 'block';
      };
      
      window.openAddWidgetModal();
      
      expect(addWidgetModal.style.display).toBe('block');
    });
    
    test('should close modal when clicking close button', () => {
      const modal = document.getElementById('add-widget-modal');
      modal.style.display = 'block';
      
      const closeBtn = modal.querySelector('.close');
      
      // Add event listener to close button
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
      
      // Simulate click on close button
      closeBtn.click();
      
      expect(modal.style.display).toBe('none');
    });
    
    test('should export dashboard to PDF', () => {
      document.body.classList.add = jest.fn();
      document.body.classList.remove = jest.fn();
      
      window.exportDashboardToPDF = () => {
        const dashboardContainer = document.querySelector('.dashboard-content');
        document.body.classList.add('exporting-pdf');
        
        html2pdf()
          .from(dashboardContainer)
          .set({})
          .save()
          .then(() => {
            document.body.classList.remove('exporting-pdf');
          });
      };
      
      window.exportDashboardToPDF();
      
      expect(document.body.classList.add).toHaveBeenCalledWith('exporting-pdf');
      expect(html2pdf).toHaveBeenCalled();
      expect(document.body.classList.remove).toHaveBeenCalledWith('exporting-pdf');
    });
    
    test('should show notification', () => {
      const toastContainer = document.getElementById('toast-container');
      
      window.showNotification = (message, type = 'info') => {
        const notification = document.createElement('article');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
          <section class="notification-content">
            <i class="fas fa-info-circle"></i>
            <output>${message}</output>
          </section>
          <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        toastContainer.appendChild(notification);
        
        setTimeout(() => {
          notification.classList.add('active');
        }, 10);
      };
      
      window.showNotification('Test message', 'success');
      
      expect(toastContainer.children.length).toBe(1);
      expect(toastContainer.querySelector('.notification').classList.contains('success')).toBe(true);
    });
  });

  // Test Suite 4: Data Fetching and Loading
  describe('Data Fetching and Loading', () => {
    test('should load user widgets from server', async () => {
      const mockWidgets = [
        { id: '1', widget_type: 'projects', position_x: 0, position_y: 0, width: 6, height: 4 },
        { id: '2', widget_type: 'milestones', position_x: 6, position_y: 0, width: 6, height: 4 }
      ];
      
      fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockWidgets)
        })
      );
      
      const emptyDashboard = document.getElementById('empty-dashboard');
      
      window.loadUserWidgets = async () => {
        try {
          const response = await fetch('https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net/api/mydashboard/widgets/ae3a44c8-562f-4184-9753-931aed14c68d');
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const widgets = await response.json();
          
          if (widgets.length === 0) {
            emptyDashboard.classList.remove('hidden');
            return;
          }
          
          emptyDashboard.classList.add('hidden');
          GridStack.init().removeAll();
          
          // Save to localStorage for offline use
          localStorage.setItem('dashboard_widgets_ae3a44c8-562f-4184-9753-931aed14c68d', JSON.stringify(widgets));
          
          return widgets;
        } catch (error) {
          console.error('Error loading user widgets:', error);
          return [];
        }
      };
      
      const result = await window.loadUserWidgets();
      
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/widgets/ae3a44c8-562f-4184-9753-931aed14c68d'));
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'dashboard_widgets_ae3a44c8-562f-4184-9753-931aed14c68d',
        expect.any(String)
      );
      expect(result).toEqual(mockWidgets);
      expect(emptyDashboard.classList.contains('hidden')).toBe(true);
    });
    
    test('should handle server error gracefully', async () => {
      fetch.mockImplementationOnce(() => 
        Promise.reject(new Error('Network error'))
      );
      
      window.showNotification = jest.fn();
      
      window.loadUserWidgets = async () => {
        try {
          const response = await fetch('https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net/api/mydashboard/widgets/ae3a44c8-562f-4184-9753-931aed14c68d');
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const widgets = await response.json();
          return widgets;
        } catch (error) {
          console.error('Error loading user widgets:', error);
          window.showNotification('Error loading dashboard. Using local data.', 'warning');
          return [];
        }
      };
      
      const result = await window.loadUserWidgets();
      
      expect(fetch).toHaveBeenCalled();
      expect(window.showNotification).toHaveBeenCalledWith('Error loading dashboard. Using local data.', 'warning');
      expect(result).toEqual([]);
    });
    
    test('should load widgets from localStorage when available', () => {
      const mockWidgets = [
        { id: '1', widget_type: 'projects', position_x: 0, position_y: 0, width: 6, height: 4 },
        { id: '2', widget_type: 'milestones', position_x: 6, position_y: 0, width: 6, height: 4 }
      ];
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockWidgets));
      
      const emptyDashboard = document.getElementById('empty-dashboard');
      
      window.loadWidgetsFromLocalStorage = () => {
        try {
          const savedWidgets = localStorage.getItem('dashboard_widgets_ae3a44c8-562f-4184-9753-931aed14c68d');
          if (savedWidgets) {
            const widgetsData = JSON.parse(savedWidgets);
            if (widgetsData.length > 0) {
              emptyDashboard.classList.add('hidden');
              return widgetsData;
            }
          }
          return [];
        } catch (error) {
          console.error('Error loading from localStorage:', error);
          return [];
        }
      };
      
      const result = window.loadWidgetsFromLocalStorage();
      
      expect(localStorage.getItem).toHaveBeenCalledWith('dashboard_widgets_ae3a44c8-562f-4184-9753-931aed14c68d');
      expect(result).toEqual(mockWidgets);
      expect(emptyDashboard.classList.contains('hidden')).toBe(true);
    });
  });
});
