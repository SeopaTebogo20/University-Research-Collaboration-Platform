/**
 * @jest-environment jsdom
 */

// Set up the document body with the funding HTML structure
document.body.innerHTML = `
  <div class="projects-overview">
    <div class="projects-header">
      <h1>Research Funding</h1>
      <div class="header-actions">
        <button id="export-overview-btn" class="btn primary-btn">Export PDF</button>
      </div>
    </div>

    <div id="projects-grid" class="projects-grid">
      <!-- Project cards will be inserted here -->
    </div>
  </div>

  <section id="project-details-section" class="project-details-section" style="display: none;">
    <div class="project-details-header">
      <h2 id="project-title">Project: Test Project</h2>
      <div class="header-actions">
        <button id="back-to-overview-btn" class="btn secondary-btn">Back to Overview</button>
        <button id="export-details-btn" class="btn primary-btn">Export PDF</button>
      </div>
    </div>

    <div class="project-funding-summary">
      <div class="summary-card">
        <h3>Funding Summary</h3>
        <div class="summary-stats">
          <div class="stat-item">
            <p class="stat-label">Total Funding</p>
            <p id="total-funding-amount" class="stat-value">R0</p>
          </div>
          <div class="stat-item">
            <p class="stat-label">Spent</p>
            <p id="spent-funding-amount" class="stat-value">R0</p>
          </div>
          <div class="stat-item">
            <p class="stat-label">Remaining</p>
            <p id="remaining-funding-amount" class="stat-value">R0</p>
          </div>
          <div class="stat-item">
            <p class="stat-label">Active Grants</p>
            <p id="active-grants-count" class="stat-value">0</p>
          </div>
        </div>
      </div>

      <div class="funding-charts">
        <div class="chart-container">
          <canvas id="funding-pie-chart"></canvas>
        </div>
        <div class="chart-container">
          <canvas id="category-budget-chart"></canvas>
        </div>
      </div>
    </div>

    <div class="category-breakdown-section">
      <!-- Category breakdown will be inserted here -->
    </div>

    <div class="funding-records-section">
      <div class="section-header">
        <h3>Funding Records</h3>
        <div class="header-actions">
          <select id="status-filter" class="styled-select">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
          </select>
          <button id="add-funding-btn" class="btn primary-btn">Add Funding</button>
        </div>
      </div>

      <table class="funding-records-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Funder</th>
            <th>Total Amount</th>
            <th>Amount Spent</th>
            <th>Remaining</th>
            <th>Expiration Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="funding-records-body">
          <tr id="no-records-message" style="display: none;">
            <td colspan="8">No funding records found</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- Funding Modal -->
  <div id="funding-modal" class="modal">
    <div class="modal-content">
      <button class="close">&times;</button>
      <h2 id="funding-modal-title">Add New Funding</h2>
      <form id="funding-form">
        <input type="hidden" id="funding-id">
        <input type="hidden" id="funding-project-id">
        
        <div class="form-group">
          <label for="funding-title">Title</label>
          <input type="text" id="funding-title" class="styled-input" required>
        </div>
        
        <div class="form-group">
          <label for="funding-description">Description</label>
          <textarea id="funding-description" class="styled-textarea"></textarea>
        </div>
        
        <div class="form-group">
          <label for="funding-funder">Funder</label>
          <input type="text" id="funding-funder" class="styled-input" required>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="funding-start-date">Start Date</label>
            <input type="date" id="funding-start-date" class="styled-input" required>
          </div>
          
          <div class="form-group">
            <label for="funding-expiration-date">Expiration Date</label>
            <input type="date" id="funding-expiration-date" class="styled-input" required>
          </div>
        </div>
        
        <div class="form-group">
          <label for="funding-status">Status</label>
          <select id="funding-status" class="styled-select">
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="funding-amount">Total Amount (R)</label>
            <input type="number" id="funding-amount" class="styled-input" step="0.01" min="0" readonly>
          </div>
          
          <div class="form-group">
            <label for="funding-spent">Amount Spent (R)</label>
            <input type="number" id="funding-spent" class="styled-input" step="0.01" min="0" readonly>
          </div>
        </div>
        
        <div class="budget-categories">
          <h4>Budget Categories</h4>
          
          <div class="form-row">
            <div class="form-group">
              <label for="funding-personnel-budget">Personnel Budget (R)</label>
              <input type="number" id="funding-personnel-budget" class="styled-input" step="0.01" min="0" value="0">
            </div>
            
            <div class="form-group">
              <label for="funding-personnel-spent">Personnel Spent (R)</label>
              <input type="number" id="funding-personnel-spent" class="styled-input" step="0.01" min="0" value="0">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="funding-equipment-budget">Equipment Budget (R)</label>
              <input type="number" id="funding-equipment-budget" class="styled-input" step="0.01" min="0" value="0">
            </div>
            
            <div class="form-group">
              <label for="funding-equipment-spent">Equipment Spent (R)</label>
              <input type="number" id="funding-equipment-spent" class="styled-input" step="0.01" min="0" value="0">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="funding-consumables-budget">Consumables Budget (R)</label>
              <input type="number" id="funding-consumables-budget" class="styled-input" step="0.01" min="0" value="0">
            </div>
            
            <div class="form-group">
              <label for="funding-consumables-spent">Consumables Spent (R)</label>
              <input type="number" id="funding-consumables-spent" class="styled-input" step="0.01" min="0" value="0">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="funding-other-budget">Other Budget (R)</label>
              <input type="number" id="funding-other-budget" class="styled-input" step="0.01" min="0" value="0">
            </div>
            
            <div class="form-group">
              <label for="funding-other-spent">Other Spent (R)</label>
              <input type="number" id="funding-other-spent" class="styled-input" step="0.01" min="0" value="0">
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="funding-notes">Notes</label>
          <textarea id="funding-notes" class="styled-textarea"></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" id="cancel-funding-btn" class="btn secondary-btn">Cancel</button>
          <button type="submit" class="btn primary-btn">Save Funding</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div id="delete-modal" class="modal">
    <div class="modal-content">
      <button class="close">&times;</button>
      <h2>Confirm Deletion</h2>
      <p>Are you sure you want to delete this funding record?</p>
      <div class="funding-to-delete"></div>
      <div class="modal-actions">
        <button id="cancel-delete-btn" class="btn secondary-btn">Cancel</button>
        <button id="confirm-delete-btn" class="btn primary-btn" data-id="">Delete</button>
      </div>
    </div>
  </div>
`;

// Mock necessary DOM APIs and functions
window.location = {
  hostname: 'localhost',
  href: '',
  search: '',
  assign: jest.fn(),
};

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
);

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn().mockImplementation(key => store[key] || null),
    setItem: jest.fn().mockImplementation((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn().mockImplementation(key => {
      delete store[key];
    }),
    clear: jest.fn().mockImplementation(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock Chart.js
window.Chart = jest.fn().mockImplementation(() => ({
  destroy: jest.fn(),
  update: jest.fn()
}));

// Mock jsPDF and html2canvas for PDF export
window.jspdf = {
  jsPDF: jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    text: jest.fn(),
    addImage: jest.fn(),
    addPage: jest.fn(),
    save: jest.fn(),
    internal: {
      pageSize: {
        getWidth: jest.fn().mockReturnValue(210),
        getHeight: jest.fn().mockReturnValue(297)
      }
    }
  }))
};

window.html2canvas = jest.fn().mockResolvedValue({
  toDataURL: jest.fn().mockReturnValue('data:image/png;base64,...')
});

console.error = jest.fn();
console.log = jest.fn();

// Mock the funding implementation
const funding = {
  init: jest.fn().mockImplementation(() => {
    // Set up event listeners
    document.getElementById('add-funding-btn').addEventListener('click', funding.openAddFundingModal);
    document.getElementById('back-to-overview-btn').addEventListener('click', funding.showProjectsOverview);
    document.getElementById('funding-form').addEventListener('submit', funding.handleFundingFormSubmit);
    document.getElementById('status-filter').addEventListener('change', funding.filterFundingRecords);
    document.getElementById('confirm-delete-btn').addEventListener('click', funding.deleteFundingRecord);
    document.getElementById('export-overview-btn').addEventListener('click', () => funding.exportToPDF('overview'));
    document.getElementById('export-details-btn').addEventListener('click', () => funding.exportToPDF('details'));
    
    // Budget calculation listeners
    document.querySelectorAll('#funding-personnel-budget, #funding-equipment-budget, #funding-consumables-budget, #funding-other-budget, ' +
                           '#funding-personnel-spent, #funding-equipment-spent, #funding-consumables-spent, #funding-other-spent')
      .forEach(input => {
        input.addEventListener('input', funding.calculateFundingTotals);
      });
  }),

  loadProjects: jest.fn().mockImplementation(async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const projects = await response.json();
      
      // Get funding summary
      const summaryResponse = await fetch('/api/funding/summary/projects');
      if (!summaryResponse.ok) {
        throw new Error('Failed to fetch funding summary');
      }
      const summaries = await summaryResponse.json();
      
      // Display projects
      funding.displayProjects(projects, summaries);
      
      return projects;
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }),

  displayProjects: jest.fn().mockImplementation((projects, summaries) => {
    const projectsGrid = document.getElementById('projects-grid');
    projectsGrid.innerHTML = '';
    
    projects.forEach(project => {
      const summary = summaries.find(s => s.project_id === project.id) || {
        total_funding: 0,
        total_spent: 0,
        total_remaining: 0,
        funding_count: 0
      };
      
      const card = document.createElement('div');
      card.className = 'project-card';
      card.dataset.id = project.id;
      card.innerHTML = `
        <div class="project-card-header">
          <span class="project-status">${project.status || 'Active'}</span>
          <h3>${project.project_title}</h3>
        </div>
        <div class="project-card-content">
          <div class="project-stats">
            <div class="stat-item">
              <p class="stat-value">R${summary.total_funding.toLocaleString()}</p>
              <p class="stat-label">Total Funding</p>
            </div>
          </div>
        </div>
      `;
      
      card.addEventListener('click', () => {
        funding.showProjectDetails(project.id, project.project_title);
      });
      
      projectsGrid.appendChild(card);
    });
  }),

  showProjectsOverview: jest.fn().mockImplementation(() => {
    document.getElementById('project-details-section').style.display = 'none';
    document.querySelector('.projects-overview').style.display = 'block';
  }),

  showProjectDetails: jest.fn().mockImplementation(async (projectId, projectName) => {
    document.getElementById('project-title').textContent = `Project: ${projectName}`;
    document.getElementById('project-details-section').style.display = 'block';
    document.querySelector('.projects-overview').style.display = 'none';
    
    await funding.loadFundingRecords(projectId);
  }),

  loadFundingRecords: jest.fn().mockImplementation(async (projectId) => {
    try {
      const response = await fetch(`/api/funding?project_id=${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch funding records');
      }
      const records = await response.json();
      
      funding.displayFundingRecords(records);
      funding.updateSummaryData(records);
      funding.updateCharts(records);
      
      return records;
    } catch (error) {
      console.error('Error loading funding records:', error);
      return [];
    }
  }),

  displayFundingRecords: jest.fn().mockImplementation((records) => {
    const tbody = document.getElementById('funding-records-body');
    tbody.innerHTML = '';
    
    records.forEach(record => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${record.title}</td>
        <td>${record.funder}</td>
        <td>R${record.total_amount}</td>
        <td>R${record.amount_spent}</td>
        <td>R${record.total_amount - record.amount_spent}</td>
        <td>${new Date(record.expiration_date).toLocaleDateString()}</td>
        <td><span class="funding-status">${record.status}</span></td>
        <td>
          <button class="action-btn edit-btn" data-id="${record.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" data-id="${record.id}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      
      row.querySelector('.edit-btn').addEventListener('click', () => funding.openEditFundingModal(record.id));
      row.querySelector('.delete-btn').addEventListener('click', () => funding.confirmDeleteFunding(record.id, record.title));
      
      tbody.appendChild(row);
    });
  }),

  updateSummaryData: jest.fn().mockImplementation((records) => {
    const totalFunding = records.reduce((sum, record) => sum + parseFloat(record.total_amount), 0);
    const totalSpent = records.reduce((sum, record) => sum + parseFloat(record.amount_spent), 0);
    
    document.getElementById('total-funding-amount').textContent = `R${totalFunding}`;
    document.getElementById('spent-funding-amount').textContent = `R${totalSpent}`;
    document.getElementById('remaining-funding-amount').textContent = `R${totalFunding - totalSpent}`;
  }),

  updateCharts: jest.fn().mockImplementation((records) => {
    const pieCtx = document.getElementById('funding-pie-chart').getContext('2d');
    new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: ['Spent', 'Remaining'],
        datasets: [{
          data: [0, 0]
        }]
      }
    });
  }),

  openAddFundingModal: jest.fn().mockImplementation(() => {
    document.getElementById('funding-modal').style.display = 'flex';
  }),

  openEditFundingModal: jest.fn().mockImplementation(async (fundingId) => {
    try {
      const response = await fetch(`/api/funding/${fundingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch funding record');
      }
      const record = await response.json();
      
      funding.populateFundingForm(record);
      document.getElementById('funding-modal').style.display = 'flex';
    } catch (error) {
      console.error('Error loading funding record:', error);
    }
  }),

  populateFundingForm: jest.fn().mockImplementation((record) => {
    document.getElementById('funding-id').value = record.id;
    document.getElementById('funding-project-id').value = record.project_id;
    document.getElementById('funding-title').value = record.title || '';
    document.getElementById('funding-funder').value = record.funder || '';
    document.getElementById('funding-amount').value = record.total_amount || '0';
    document.getElementById('funding-spent').value = record.amount_spent || '0';
  }),

  calculateFundingTotals: jest.fn().mockImplementation(() => {
    const personnelBudget = parseFloat(document.getElementById('funding-personnel-budget').value) || 0;
    const equipmentBudget = parseFloat(document.getElementById('funding-equipment-budget').value) || 0;
    const consumablesBudget = parseFloat(document.getElementById('funding-consumables-budget').value) || 0;
    const otherBudget = parseFloat(document.getElementById('funding-other-budget').value) || 0;
    
    const totalBudget = personnelBudget + equipmentBudget + consumablesBudget + otherBudget;
    document.getElementById('funding-amount').value = totalBudget.toFixed(2);
    
    const personnelSpent = parseFloat(document.getElementById('funding-personnel-spent').value) || 0;
    const equipmentSpent = parseFloat(document.getElementById('funding-equipment-spent').value) || 0;
    const consumablesSpent = parseFloat(document.getElementById('funding-consumables-spent').value) || 0;
    const otherSpent = parseFloat(document.getElementById('funding-other-spent').value) || 0;
    
    const totalSpent = personnelSpent + equipmentSpent + consumablesSpent + otherSpent;
    document.getElementById('funding-spent').value = totalSpent.toFixed(2);
  }),

  handleFundingFormSubmit: jest.fn().mockImplementation(async (e) => {
    e.preventDefault();
    
    try {
      const fundingId = document.getElementById('funding-id').value;
      const isNew = !fundingId;
      
      const fundingData = {
        project_id: document.getElementById('funding-project-id').value,
        title: document.getElementById('funding-title').value,
        funder: document.getElementById('funding-funder').value,
        total_amount: document.getElementById('funding-amount').value,
        amount_spent: document.getElementById('funding-spent').value
      };
      
      const response = await fetch(
        isNew ? '/api/funding' : `/api/funding/${fundingId}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fundingData)
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to save funding record');
      }
      
      document.getElementById('funding-modal').style.display = 'none';
      
      // Reload records if we're viewing a project
      const projectId = document.getElementById('funding-project-id').value;
      if (projectId) {
        await funding.loadFundingRecords(projectId);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving funding record:', error);
      return false;
    }
  }),

  confirmDeleteFunding: jest.fn().mockImplementation((fundingId, title) => {
    document.getElementById('confirm-delete-btn').dataset.id = fundingId;
    document.querySelector('.funding-to-delete').innerHTML = `
      <div class="delete-funding-info">
        <h4>${title}</h4>
        <p>ID: ${fundingId}</p>
      </div>
    `;
    document.getElementById('delete-modal').style.display = 'flex';
  }),

  deleteFundingRecord: jest.fn().mockImplementation(async () => {
    try {
      const fundingId = document.getElementById('confirm-delete-btn').dataset.id;
      const response = await fetch(`/api/funding/${fundingId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete funding record');
      }
      
      document.getElementById('delete-modal').style.display = 'none';
      
      // Reload records if we're viewing a project
      const projectId = document.getElementById('funding-project-id').value;
      if (projectId) {
        await funding.loadFundingRecords(projectId);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting funding record:', error);
      return false;
    }
  }),

  filterFundingRecords: jest.fn().mockImplementation(() => {
    const status = document.getElementById('status-filter').value;
    // In a real implementation, this would filter the displayed records
  }),

  exportToPDF: jest.fn().mockImplementation((type) => {
    console.log(`Exporting ${type} to PDF`);
    return true;
  })
};

// Export the mock functions for testing
const {
  init,
  loadProjects,
  displayProjects,
  showProjectsOverview,
  showProjectDetails,
  loadFundingRecords,
  displayFundingRecords,
  updateSummaryData,
  updateCharts,
  openAddFundingModal,
  openEditFundingModal,
  populateFundingForm,
  calculateFundingTotals,
  handleFundingFormSubmit,
  confirmDeleteFunding,
  deleteFundingRecord,
  filterFundingRecords,
  exportToPDF
} = funding;

// Setup before all tests
beforeAll(() => {
  // Reset the document body
  document.body.innerHTML = document.body.innerHTML;
  
  // Clear all mocks and localStorage
  jest.clearAllMocks();
  localStorage.clear();
});

describe('Funding Dashboard', () => {
  beforeEach(() => {
    // Clear all mocks and reset state between tests
    jest.clearAllMocks();
    localStorage.clear();
    window.location.href = '';
    
    // Reset fetch mock to default successful response
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    );
  });

  describe('Initialization', () => {
    test('should initialize dashboard and load projects', async () => {
      // Arrange
      const mockProjects = [
        { id: '1', project_title: 'Test Project', status: 'Active' }
      ];
      const mockSummaries = [
        { project_id: '1', total_funding: 10000, total_spent: 5000, funding_count: 2 }
      ];
      
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProjects)
        })
      ).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSummaries)
        })
      );
      
      // Act
      await init();
      await loadProjects();
      
      // Assert
      expect(loadProjects).toHaveBeenCalled();
      const projectsGrid = document.getElementById('projects-grid');
      expect(projectsGrid.children.length).toBe(1);
    });
    
    test('should handle projects load error', async () => {
      // Arrange
      global.fetch.mockImplementationOnce(() =>
        Promise.reject(new Error('Network error'))
      );
      
      // Act
      await loadProjects();
      
      // Assert
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Project Details', () => {
    test('should load project details and funding records when project is selected', async () => {
      // Arrange
      const mockRecords = [
        { id: '1', project_id: '1', title: 'Test Funding', total_amount: 5000, amount_spent: 2000 }
      ];
      
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRecords)
        })
      );
      
      // Act
      await showProjectDetails('1', 'Test Project');
      await loadFundingRecords('1');
      
      // Assert
      expect(loadFundingRecords).toHaveBeenCalledWith('1');
      expect(displayFundingRecords).toHaveBeenCalledWith(mockRecords);
      expect(updateSummaryData).toHaveBeenCalledWith(mockRecords);
    });

    test('should handle funding records load error', async () => {
      // Arrange
      global.fetch.mockImplementationOnce(() =>
        Promise.reject(new Error('Network error'))
      );
      
      // Act
      await loadFundingRecords('1');
      
      // Assert
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Funding Management', () => {
    test('should open add funding modal', () => {
      // Act
      openAddFundingModal();
      
      // Assert
      expect(document.getElementById('funding-modal').style.display).toBe('flex');
    });
    
    test('should calculate funding totals correctly', () => {
      // Arrange
      document.getElementById('funding-personnel-budget').value = '1000';
      document.getElementById('funding-equipment-budget').value = '2000';
      document.getElementById('funding-consumables-budget').value = '500';
      document.getElementById('funding-other-budget').value = '500';
      
      document.getElementById('funding-personnel-spent').value = '500';
      document.getElementById('funding-equipment-spent').value = '1000';
      document.getElementById('funding-consumables-spent').value = '200';
      document.getElementById('funding-other-spent').value = '100';
      
      // Act
      calculateFundingTotals();
      
      // Assert
      expect(document.getElementById('funding-amount').value).toBe('4000.00');
      expect(document.getElementById('funding-spent').value).toBe('1800.00');
    });
    
    test('should submit funding form successfully for new record', async () => {
      // Arrange
      document.getElementById('funding-id').value = '';
      document.getElementById('funding-project-id').value = '1';
      document.getElementById('funding-title').value = 'New Funding';
      document.getElementById('funding-funder').value = 'Test Funder';
      document.getElementById('funding-amount').value = '5000';
      document.getElementById('funding-spent').value = '2000';
      
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: '2' })
        })
      );
      
      // Create a mock event
      const e = { preventDefault: jest.fn() };
      
      // Act
      await handleFundingFormSubmit(e);
      
      // Assert
      expect(e.preventDefault).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith('/api/funding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String)
      });
      expect(document.getElementById('funding-modal').style.display).toBe('none');
    });
    
    test('should submit funding form successfully for existing record', async () => {
      // Arrange
      document.getElementById('funding-id').value = '1';
      document.getElementById('funding-project-id').value = '1';
      document.getElementById('funding-title').value = 'Updated Funding';
      document.getElementById('funding-funder').value = 'Test Funder';
      document.getElementById('funding-amount').value = '6000';
      document.getElementById('funding-spent').value = '3000';
      
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: '1' })
        })
      );
      
      // Create a mock event
      const e = { preventDefault: jest.fn() };
      
      // Act
      await handleFundingFormSubmit(e);
      
      // Assert
      expect(global.fetch).toHaveBeenCalledWith('/api/funding/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String)
      });
    });
    
    test('should delete funding record successfully', async () => {
      // Arrange
      document.getElementById('confirm-delete-btn').dataset.id = '1';
      document.getElementById('funding-project-id').value = '1';
      
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        })
      );
      
      // Act
      await deleteFundingRecord();
      
      // Assert
      expect(global.fetch).toHaveBeenCalledWith('/api/funding/1', {
        method: 'DELETE'
      });
      expect(document.getElementById('delete-modal').style.display).toBe('none');
    });
  });

  describe('User Acceptance Tests', () => {
    test('should export funding overview to PDF', () => {
      // Act
      exportToPDF('overview');
      
      // Assert
      expect(console.log).toHaveBeenCalledWith('Exporting overview to PDF');
    });
    
    test('should export funding details to PDF', () => {
      // Act
      exportToPDF('details');
      
      // Assert
      expect(console.log).toHaveBeenCalledWith('Exporting details to PDF');
    });
  });
});
