/**
 * @jest-environment jsdom
 */

// Set up the document body with the review history page HTML
document.body.innerHTML = `
  <main class="review-history-container">
    <header class="page-header">
      <h1>Review History</h1>
      <section class="filter-controls">
        <select id="time-filter" class="filter-select">
          <option value="all">All Time</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
        <select id="status-filter" class="filter-select">
          <option value="all">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="revision">Revision</option>
          <option value="rejected">Rejected</option>
        </select>
        <button class="refresh-btn">Refresh</button>
      </section>
    </header>

    <section class="chart-section">
      <article class="chart-card">
        <canvas id="reviewActivityChart" height="300"></canvas>
      </article>
    </section>

    <section class="reviews-section">
      <table class="proposals-table">
        <thead>
          <tr>
            <th>Proposal Title</th>
            <th>Researcher</th>
            <th>Submitted</th>
            <th>Reviewed</th>
            <th>Decision</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <!-- Table content will be populated dynamically -->
        </tbody>
      </table>
    </section>
  </main>
`;

// Mock necessary DOM APIs and functions
window.location = {
  href: '',
  search: '',
  assign: jest.fn(),
};

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

// Mock Chart constructor
global.Chart = jest.fn().mockImplementation(() => ({
  update: jest.fn(),
  data: {
    labels: [],
    datasets: []
  },
  destroy: jest.fn()
}));

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: 'Success' })
  })
);

// Mock for print functionality
window.print = jest.fn();

// Mock functions for the review history page
const initReviewActivityChart = jest.fn().mockImplementation(() => {
  const ctx = document.getElementById('reviewActivityChart').getContext('2d');
  window.reviewChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May'],
      datasets: [
        {
          label: 'Reviews Completed',
          data: [3, 2, 5, 4, 6, 8, 7, 9, 10, 8, 11, 12]
        },
        {
          label: 'Average Review Time (Days)',
          data: [8, 9, 7, 8, 7, 6, 6, 5, 6, 7, 6, 5]
        }
      ]
    }
  });
});

const setupFiltering = jest.fn().mockImplementation(() => {
  const timeFilter = document.getElementById('time-filter');
  const statusFilter = document.getElementById('status-filter');
  const refreshBtn = document.querySelector('.refresh-btn');

  const applyFilters = () => {
    const timeValue = timeFilter.value;
    const statusValue = statusFilter.value;
    
    const tbody = document.querySelector('.proposals-table tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading-text">Loading filtered results...</td></tr>';
    
    setTimeout(() => {
      const filteredData = filterReviewData(getMockReviewData(), timeValue, statusValue);
      updateReviewTable(filteredData);
    }, 800);
  };

  timeFilter.addEventListener('change', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  refreshBtn.addEventListener('click', applyFilters);
});

const setupReportViewers = jest.fn().mockImplementation(() => {
  document.querySelectorAll('.view-btn').forEach(button => {
    button.addEventListener('click', () => {
      const proposalId = button.getAttribute('data-proposal');
      openReportModal(proposalId);
    });
  });
});

const filterReviewData = jest.fn().mockImplementation((data, timeFilter, statusFilter) => {
  let filteredData = [...data];
  
  if (timeFilter !== 'all') {
    const now = new Date();
    let startDate;
    
    switch (timeFilter) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
        break;
    }
    
    filteredData = filteredData.filter(item => {
      const reviewDate = new Date(item.reviewDate);
      return reviewDate >= startDate;
    });
  }
  
  if (statusFilter !== 'all') {
    filteredData = filteredData.filter(item => item.decision.toLowerCase() === statusFilter);
  }
  
  return filteredData;
});

const updateReviewTable = jest.fn().mockImplementation((data) => {
  const tbody = document.querySelector('.proposals-table tbody');
  tbody.innerHTML = '';
  
  if (data.length === 0) {
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 6;
    emptyCell.textContent = 'No reviews match the selected filters';
    emptyRow.appendChild(emptyCell);
    tbody.appendChild(emptyRow);
    return;
  }
  
  data.forEach(review => {
    const row = document.createElement('tr');
    
    const titleCell = document.createElement('td');
    titleCell.textContent = review.title;
    row.appendChild(titleCell);
    
    const researcherCell = document.createElement('td');
    researcherCell.textContent = review.researcher;
    row.appendChild(researcherCell);
    
    const submittedCell = document.createElement('td');
    submittedCell.textContent = formatDate(review.submittedDate);
    row.appendChild(submittedCell);
    
    const reviewDateCell = document.createElement('td');
    reviewDateCell.textContent = formatDate(review.reviewDate);
    row.appendChild(reviewDateCell);
    
    const decisionCell = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge status-${review.decision.toLowerCase()}`;
    statusBadge.textContent = review.decision;
    decisionCell.appendChild(statusBadge);
    row.appendChild(decisionCell);
    
    const actionsCell = document.createElement('td');
    const viewButton = document.createElement('button');
    viewButton.className = 'btn-outline view-btn';
    viewButton.textContent = 'View Report';
    viewButton.setAttribute('data-proposal', review.id);
    actionsCell.appendChild(viewButton);
    row.appendChild(actionsCell);
    
    tbody.appendChild(row);
  });
});

const openReportModal = jest.fn().mockImplementation((proposalId) => {
  const modalOverlay = document.createElement('section');
  modalOverlay.className = 'modal-overlay';
  
  const modalContent = document.createElement('article');
  modalContent.className = 'modal-content report-modal';
  
  const modalHeader = document.createElement('header');
  modalHeader.className = 'modal-header';
  
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = `Review Report: ${proposalId}`;
  
  const closeButton = document.createElement('button');
  closeButton.className = 'modal-close';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', () => {
    modalOverlay.remove();
  });
  
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);
  modalContent.appendChild(modalHeader);
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  
  return modalOverlay;
});

const formatDate = jest.fn().mockImplementation((dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const getMockReviewData = jest.fn().mockImplementation(() => [
  {
    id: 'climate-change',
    title: 'Climate Change Impact on Marine Ecosystems',
    researcher: 'Prof. James Wilson',
    submittedDate: '2025-04-25T10:15:00',
    reviewDate: '2025-04-30T14:20:00',
    decision: 'Approved'
  },
  {
    id: 'neural-networks',
    title: 'Neural Networks for Disease Detection',
    researcher: 'Dr. Aisha Patel',
    submittedDate: '2025-04-18T08:30:00',
    reviewDate: '2025-04-24T11:45:00',
    decision: 'Revision'
  }
]);

// Setup before all tests
beforeAll(() => {
  // Mock Date object
  const mockDate = new Date('2025-05-05T12:00:00Z');
  global.Date = class extends Date {
    constructor(...args) {
      if (args.length === 0) {
        return mockDate;
      }
      return new Date(...args);
    }
    
    static now() {
      return mockDate.getTime();
    }
  };
});

describe('Review History Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = `
      <canvas id="reviewActivityChart"></canvas>
      <table class="proposals-table"><tbody></tbody></table>
    `;
  });

  test('should initialize review activity chart', () => {
    initReviewActivityChart();
    expect(Chart).toHaveBeenCalled();
    expect(window.reviewChart).toBeDefined();
  });

  test('should set up report viewers', () => {
    // First add some test data to the table
    const tbody = document.querySelector('.proposals-table tbody');
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    const button = document.createElement('button');
    button.className = 'view-btn';
    button.setAttribute('data-proposal', 'test-id');
    cell.appendChild(button);
    row.appendChild(cell);
    tbody.appendChild(row);
    
    setupReportViewers();
    
    // Test that event listener is set up
    button.click();
    expect(openReportModal).toHaveBeenCalledWith('test-id');
  });
});

describe('Filtering Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getMockReviewData.mockClear();
  });



  test('should filter data by status', () => {
    const testData = getMockReviewData();
    const filteredData = filterReviewData(testData, 'all', 'approved');
    
    expect(filterReviewData).toHaveBeenCalled();
    expect(filteredData.every(item => item.decision === 'Approved')).toBeTruthy();
  });


  test('should show empty state when no matches', () => {
    updateReviewTable([]);
    
    const tbody = document.querySelector('.proposals-table tbody');
    expect(tbody.children.length).toBe(1);
    expect(tbody.firstChild.textContent).toContain('No reviews match');
  });
});

describe('Report Modal', () => {
  test('should open modal with correct proposal ID', () => {
    const modal = openReportModal('test-id');
    expect(modal).toBeDefined();
    expect(document.querySelector('.modal-overlay')).toBeTruthy();
    expect(openReportModal).toHaveBeenCalledWith('test-id');
  });

});

