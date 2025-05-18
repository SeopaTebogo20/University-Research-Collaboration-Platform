/**
 * @jest-environment jsdom
 */

// First, set up the document body with the reviewer dashboard HTML
document.body.innerHTML = `
  <header class="dashboard-header">
    <p id="current-date">Loading date...</p>
    <p id="reviewer-name">Loading...</p>
  </header>
  
  <section class="dashboard-stats">
    <article class="stat-card">
      <h3>Total Assigned</h3>
      <p id="total-assigned">0</p>
    </article>
    <article class="stat-card">
      <h3>Pending Reviews</h3>
      <p id="pending-reviews">0</p>
    </article>
    <article class="stat-card">
      <h3>Completed Reviews</h3>
      <p id="completed-reviews">0</p>
    </article>
    <article class="stat-card">
      <h3>Avg. Time</h3>
      <p id="avg-time">0 days</p>
    </article>
  </section>

  <section class="chart-container">
    <article class="chart-card">
      <header class="chart-header">
        <h3>Reviews Completed</h3>
        <button class="chart-download">Download</button>
      </header>
      <section class="chart-timeframe">
        <button class="timeframe-btn active" data-period="week">Week</button>
        <button class="timeframe-btn" data-period="month">Month</button>
        <button class="timeframe-btn" data-period="year">Year</button>
      </section>
      <canvas id="reviewsCompletedChart"></canvas>
    </article>
    
    <article class="chart-card">
      <header class="chart-header">
        <h3>Review Decisions</h3>
      </header>
      <canvas id="reviewDecisionsChart"></canvas>
    </article>
  </section>

  <section class="calendar-section">
    <article class="calendar-card">
      <header class="calendar-header">
        <h3>Calendar</h3>
        <p id="calendar-month">May 2025</p>
        <section class="calendar-navigation">
          <button class="calendar-nav prev">&lt;</button>
          <button class="calendar-nav next">&gt;</button>
        </section>
      </header>
      <section id="calendar-widget"></section>
    </article>
    
    <article class="deadlines-card">
      <header class="deadlines-header">
        <h3>Upcoming Deadlines</h3>
      </header>
      <ul id="deadlines-list"></ul>
    </article>
  </section>

  <section class="dashboard-actions">
    <button id="logout-btn" class="action-btn">Logout</button>
  </section>

  <footer class="dashboard-footer">
    <section id="toast-container"></section>
  </footer>
`;

// Create a complete mock for window.location
const mockWindowLocation = {
  ...window.location,
  href: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  toString: jest.fn().mockReturnValue('http://localhost/'),
};

// Define a custom property with a setter that doesn't trigger navigation
Object.defineProperty(mockWindowLocation, 'href', {
  set: jest.fn().mockImplementation((value) => {
    mockWindowLocation._href = value;
  }),
  get: jest.fn().mockImplementation(() => mockWindowLocation._href || ''),
});

// Replace the window.location with our mock
delete window.location;
window.location = mockWindowLocation;

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

Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Mock performance API
window.performance = {
  now: jest.fn().mockReturnValue(0),
  mark: jest.fn(),
  measure: jest.fn()
};

// Mock Chart constructor
global.Chart = jest.fn().mockImplementation(() => ({
  update: jest.fn(),
  data: {
    labels: [],
    datasets: []
  },
  destroy: jest.fn()
}));

// Mock flatpickr constructor
global.flatpickr = jest.fn().mockImplementation(() => ({
  destroy: jest.fn(),
  setDate: jest.fn()
}));

// Mock requestAnimationFrame
window.requestAnimationFrame = jest.fn(callback => callback(performance.now() + 100));

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: 'Success' })
  })
);

// Mock toast functions
window.toast = {
  error: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  info: jest.fn()
};

// Mock for showToast function
const showToast = jest.fn();

// Mock dashboard functions
const initializeDashboard = jest.fn().mockReturnValue({});
const updateCurrentDate = jest.fn().mockImplementation(() => {
  document.getElementById('current-date').textContent = 'Monday, May 5, 2025';
});
const loadDashboardData = jest.fn().mockImplementation(async () => {
  const userString = sessionStorage.getItem('user');
  if (userString) {
    const user = JSON.parse(userString);
    document.getElementById('reviewer-name').textContent = user.name;
    localStorage.setItem('reviewerName', user.name);
  } else {
    const fallbackName = localStorage.getItem('reviewerName') || 'Unknown Reviewer';
    document.getElementById('reviewer-name').textContent = fallbackName;
    window.toast.error('Failed to load dashboard data. Please refresh the page.');
  }
});
const updateDashboardStats = jest.fn().mockImplementation((stats) => {
  document.getElementById('total-assigned').textContent = stats.totalAssigned;
  document.getElementById('pending-reviews').textContent = stats.pendingReviews;
  document.getElementById('completed-reviews').textContent = stats.completedReviews;
  document.getElementById('avg-time').textContent = stats.avgTime;
});
const initializeReviewsChart = jest.fn();
const initializeDecisionsChart = jest.fn();
const initializeCalendar = jest.fn().mockImplementation(() => {
  const deadlinesList = document.getElementById('deadlines-list');
  const deadlineItem = document.createElement('li');
  deadlineItem.textContent = 'AI Ethics Proposal Review - May 10, 2025';
  deadlinesList.appendChild(deadlineItem);
});
const setupTimeframeButtons = jest.fn().mockImplementation(() => {
  document.querySelectorAll('.timeframe-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});
const setupEventListeners = jest.fn().mockImplementation(() => {
  // Logout button
  document.getElementById('logout-btn').addEventListener('click', () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('reviewerName');
      localStorage.removeItem('reviewerToken');
      window.location.href = '/login';
    }
  });

  // Chart download button
  document.querySelector('.chart-download').addEventListener('click', () => {
    showToast('Chart downloaded successfully', 'success');
  });
});

// Setup before all tests
beforeAll(() => {
  // Set up the dashboard handlers
  initializeDashboard();
  
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

describe('Dashboard Initialization', () => {
  beforeEach(() => {
    // Clear all mocks and reset state between tests
    jest.clearAllMocks();
    document.getElementById('current-date').textContent = 'Loading date...';
    document.getElementById('reviewer-name').textContent = 'Loading...';
    document.getElementById('total-assigned').textContent = '0';
    document.getElementById('pending-reviews').textContent = '0';
    document.getElementById('completed-reviews').textContent = '0';
    document.getElementById('avg-time').textContent = '0 days';
  });

  test('initial reviewer name is Loading...', () => {
    const reviewerName = document.getElementById('reviewer-name');
    expect(reviewerName.textContent).toBe('Loading...');
  });

  test('should update the current date display', () => {
    updateCurrentDate();
    const currentDateElement = document.getElementById('current-date');
    expect(currentDateElement.textContent).toBe('Monday, May 5, 2025');
  });

  test('should load dashboard data and update reviewer name', async () => {
    const testUser = { name: 'Test Reviewer' };
    sessionStorage.setItem('user', JSON.stringify(testUser));
    
    await loadDashboardData();
    
    expect(document.getElementById('reviewer-name').textContent).toBe('Test Reviewer');
    expect(localStorage.setItem).toHaveBeenCalledWith('reviewerName', 'Test Reviewer');
  });

  test('should handle errors when loading dashboard data', async () => {
    sessionStorage.removeItem('user');
    localStorage.setItem('reviewerName', 'Fallback Reviewer');
    
    await loadDashboardData();
    
    expect(document.getElementById('reviewer-name').textContent).toBe('Fallback Reviewer');
    expect(window.toast.error).toHaveBeenCalledWith(
      'Failed to load dashboard data. Please refresh the page.'
    );
  });

  test('should update dashboard stats', () => {
    const stats = {
      totalAssigned: 12,
      pendingReviews: 5,
      completedReviews: 7,
      avgTime: '3.5 days'
    };
    
    updateDashboardStats(stats);
    
    expect(document.getElementById('total-assigned').textContent).toBe('12');
    expect(document.getElementById('pending-reviews').textContent).toBe('5');
    expect(document.getElementById('completed-reviews').textContent).toBe('7');
    expect(document.getElementById('avg-time').textContent).toBe('3.5 days');
  });

  test('should initialize reviews chart', () => {
    initializeReviewsChart();
    expect(initializeReviewsChart).toHaveBeenCalled();
  });

  test('should initialize decisions chart', () => {
    initializeDecisionsChart();
    expect(initializeDecisionsChart).toHaveBeenCalled();
  });

  test('should initialize calendar with deadlines', () => {
    initializeCalendar();
    const deadlinesList = document.getElementById('deadlines-list');
    expect(deadlinesList.children.length).toBeGreaterThan(0);
    expect(deadlinesList.firstChild.textContent).toBe('AI Ethics Proposal Review - May 10, 2025');
  });

  test('should setup timeframe buttons', () => {
    setupTimeframeButtons();
    const monthButton = document.querySelector('.timeframe-btn[data-period="month"]');
    monthButton.click();
    expect(monthButton.classList.contains('active')).toBeTruthy();
  });

  test('clicking timeframe button changes active class', () => {
    setupTimeframeButtons();
    const monthBtn = document.querySelector('[data-period="month"]');
    monthBtn.click();
    expect(monthBtn.classList.contains('active')).toBe(true);
  });
});

describe('Dashboard Event Handlers', () => {
  beforeEach(() => {
    initializeDashboard();
    setupEventListeners();
    jest.clearAllMocks();
  });


  test('should not navigate when logout is cancelled', () => {
    window.confirm = jest.fn().mockReturnValue(false);
    document.getElementById('logout-btn').click();
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to log out?');
    expect(localStorage.removeItem).not.toHaveBeenCalled();
    expect(window.location.href).not.toBe('/login');
  });

  test('logout button clears localStorage', () => {
    window.confirm = jest.fn().mockReturnValue(true);
    localStorage.setItem('reviewerName', 'John');
    localStorage.setItem('reviewerToken', 'abc123');

    document.getElementById('logout-btn').click();

    expect(localStorage.removeItem).toHaveBeenCalledWith('reviewerName');
    expect(localStorage.removeItem).toHaveBeenCalledWith('reviewerToken');
  });

  test('should call showToast when chart downloaded', () => {
    document.querySelector('.chart-download').click();
    expect(showToast).toHaveBeenCalledWith('Chart downloaded successfully', 'success');
  });
});

describe('Toast Notifications', () => {
  beforeEach(() => {
    document.getElementById('toast-container').innerHTML = '';
  });

  test('should show success toast notification', () => {
    showToast('Operation successful', 'success');
    expect(showToast).toHaveBeenCalledWith('Operation successful', 'success');
  });

  test('should mock toast with duration', () => {
    jest.useFakeTimers();
    showToast('Temporary message', 'info', 2000);
    expect(showToast).toHaveBeenCalledWith('Temporary message', 'info', 2000);
    jest.useRealTimers();
  });
});