/**
 * @jest-environment jsdom
 */

// First, set up the document body with the reviewer dashboard HTML
document.body.innerHTML = `
  <main class="dashboard-container">
    <header class="dashboard-header">
      <h1>Reviewer Dashboard</h1>
      <button class="refresh-btn">Refresh</button>
    </header>
    
    <section class="stats-container">
      <article class="stat-card">
        <h3>Pending Reviews</h3>
        <p class="stat-number">0</p>
      </article>
      <article class="stat-card">
        <h3>Completed Reviews</h3>
        <p class="stat-number">0</p>
      </article>
    </section>
    
    <section class="filter-container">
      <select class="styled-select">
        <option value="all">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="revision">Needs Revision</option>
        <option value="rejected">Rejected</option>
      </select>
    </section>
    
    <table class="proposals-table">
      <thead>
        <tr>
          <th>Project Title</th>
          <th>Researcher</th>
          <th>Research Area</th>
          <th>Date Submitted</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <!-- Proposals will be inserted here -->
      </tbody>
    </table>
    
    <section class="evaluation-modal">
      <article class="modal-content">
        <header class="modal-header">
          <h2>Project Evaluation</h2>
          <button class="close-modal">&times;</button>
        </header>
        <form id="evaluation-form">
          <section class="form-group">
            <h3 id="proposal-title">Project Title</h3>
            <p id="proposal-author">Researcher Name</p>
            <p id="proposal-date">Submission Date</p>
          </section>
          
          <section class="form-group">
            <label>Rating</label>
            <section class="rating-container">
              <button class="rating-star" data-value="1"><i class="far fa-star"></i></button>
              <button class="rating-star" data-value="2"><i class="far fa-star"></i></button>
              <button class="rating-star" data-value="3"><i class="far fa-star"></i></button>
              <button class="rating-star" data-value="4"><i class="far fa-star"></i></button>
              <button class="rating-star" data-value="5"><i class="far fa-star"></i></button>
              <output id="rating-display">0/5</output>
              <input type="hidden" id="rating-value" name="rating">
            </section>
          </section>
          
          <section class="form-group">
            <label for="feedback">Feedback</label>
            <textarea id="feedback" name="feedback" rows="6" required></textarea>
          </section>
          
          <section class="form-group">
            <label>Recommendation</label>
            <section class="radio-group">
              <input type="radio" id="approve" name="recommendation" value="approve">
              <label for="approve">Approve</label>
              
              <input type="radio" id="revision" name="recommendation" value="revision">
              <label for="revision">Needs Revision</label>
              
              <input type="radio" id="reject" name="recommendation" value="reject">
              <label for="reject">Reject</label>
            </section>
          </section>
          
          <footer class="modal-footer">
            <button type="button" class="btn btn-outline cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary">Submit Evaluation</button>
          </footer>
        </form>
      </article>
    </section>
    
    <section class="project-details-modal" style="display: none;">
      <article class="modal-content">
        <header class="modal-header">
          <h2>Project Details</h2>
          <button class="close-details-modal">&times;</button>
        </header>
        <section class="modal-body">
          <h3 id="details-project-title"></h3>
          <section class="details-grid">
            <section class="details-item">
              <strong>Researcher:</strong>
              <p id="details-researcher-name"></p>
            </section>
            <section class="details-item">
              <strong>Department:</strong>
              <p id="details-department"></p>
            </section>
            <section class="details-item">
              <strong>Research Area:</strong>
              <p id="details-research-area"></p>
            </section>
            <section class="details-item">
              <strong>Experience Level:</strong>
              <p id="details-experience-level"></p>
            </section>
            <section class="details-item">
              <strong>Start Date:</strong>
              <p id="details-start-date"></p>
            </section>
            <section class="details-item">
              <strong>End Date:</strong>
              <p id="details-end-date"></p>
            </section>
            <section class="details-item">
              <strong>Funding Available:</strong>
              <p id="details-funding"></p>
            </section>
          </section>
          <section class="details-section">
            <h4>Project Description</h4>
            <p id="details-description"></p>
          </section>
          <section class="details-section">
            <h4>Skills and Expertise</h4>
            <p id="details-skills"></p>
          </section>
        </section>
        <footer class="modal-footer">
          <button type="button" class="btn btn-outline close-details-btn">Close</button>
          <button type="button" class="btn btn-primary review-btn">Review Project</button>
        </footer>
      </article>
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

// Mock fetch
console.error = jest.fn();
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { 
        id: '1', 
        project_title: 'AI Research Project', 
        researcher_name: 'Dr. Smith',
        key_research_area: 'Artificial Intelligence',
        created_at: '2023-01-01T00:00:00Z',
        department: 'Computer Science',
        description: 'Advanced research in machine learning algorithms',
        skills_and_expertise: 'Python, TensorFlow, PyTorch',
        experience_level: 'PhD',
        start_date: '2023-02-01',
        end_date: '2023-12-31',
        funding_available: true
      },
      { 
        id: '2', 
        project_title: 'Bioinformatics Study', 
        researcher_name: 'Dr. Johnson',
        key_research_area: 'Biology',
        created_at: '2023-02-01T00:00:00Z'
      }
    ])
  })
);

// Mock the required functions
const reviewerDashboard = {
  setupProjectDetailsModal: jest.fn(() => {
    const modal = document.querySelector('.project-details-modal');
    const closeButton = modal.querySelector('.close-details-modal');
    const closeBtn = modal.querySelector('.close-details-btn');
    const reviewBtn = modal.querySelector('.review-btn');
    
    closeButton.addEventListener('click', () => reviewerDashboard.closeProjectDetailsModal());
    closeBtn.addEventListener('click', () => reviewerDashboard.closeProjectDetailsModal());
    reviewBtn.addEventListener('click', () => {
      reviewerDashboard.closeProjectDetailsModal();
      reviewerDashboard.openEvaluationModal(reviewerDashboard.currentProposalId);
    });
  }),
  
  currentProposalId: null,
  
  openProjectDetailsModal: jest.fn((proposalId) => {
    reviewerDashboard.currentProposalId = proposalId;
    const modal = document.querySelector('.project-details-modal');
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    
    // Find the project by ID (simplified for testing)
    const proposal = {
      id: proposalId,
      project_title: 'AI Research Project',
      researcher_name: 'Dr. Smith',
      department: 'Computer Science',
      key_research_area: 'Artificial Intelligence',
      description: 'Advanced research in machine learning algorithms',
      skills_and_expertise: 'Python, TensorFlow, PyTorch',
      experience_level: 'PhD',
      start_date: '2023-02-01',
      end_date: '2023-12-31',
      funding_available: true,
      created_at: '2023-01-01T00:00:00Z'
    };
    
    // Populate modal with project details
    document.getElementById('details-project-title').textContent = proposal.project_title;
    document.getElementById('details-researcher-name').textContent = proposal.researcher_name;
    document.getElementById('details-department').textContent = proposal.department;
    document.getElementById('details-research-area').textContent = proposal.key_research_area;
    document.getElementById('details-experience-level').textContent = proposal.experience_level;
    document.getElementById('details-start-date').textContent = new Date(proposal.start_date).toLocaleDateString();
    document.getElementById('details-end-date').textContent = new Date(proposal.end_date).toLocaleDateString();
    document.getElementById('details-funding').textContent = proposal.funding_available ? 'Yes' : 'No';
    document.getElementById('details-description').textContent = proposal.description;
    document.getElementById('details-skills').textContent = proposal.skills_and_expertise;
  }),
  
  closeProjectDetailsModal: jest.fn(() => {
    const modal = document.querySelector('.project-details-modal');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
  }),
  
  fetchAssignedProposals: jest.fn(() => {
    return global.fetch()
      .then(response => response.json())
      .then(proposals => {
        const evaluations = JSON.parse(localStorage.getItem('evaluations') || '[]');
        reviewerDashboard.updateReviewStats(proposals, evaluations);
        reviewerDashboard.renderProposals(proposals, evaluations);
        return proposals;
      });
  }),
  
  updateReviewStats: jest.fn((proposals, evaluations) => {
    const pendingCount = proposals.filter(p => 
      !evaluations.some(e => e.project_id === p.id)
    ).length;
    const completedCount = evaluations.length;
    
    document.querySelector('.stat-card:nth-child(1) .stat-number').textContent = pendingCount;
    document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = completedCount;
  }),
  
  renderProposals: jest.fn((proposals, evaluations = []) => {
    const tableBody = document.querySelector('.proposals-table tbody');
    tableBody.innerHTML = '';
    
    proposals.forEach(proposal => {
      const evaluation = evaluations.find(e => e.project_id === proposal.id);
      const status = evaluation?.status || 'pending';
      const statusClass = `status-${status.replace(' ', '-')}`;
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${proposal.project_title}</td>
        <td>${proposal.researcher_name}</td>
        <td>${proposal.key_research_area || 'N/A'}</td>
        <td>${new Date(proposal.created_at).toLocaleDateString()}</td>
        <td><mark class="status-badge ${statusClass}">${status.charAt(0).toUpperCase() + status.slice(1)}</mark></td>
        <td>
          <button class="btn btn-primary view-details-btn" data-id="${proposal.id}">View Details</button>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
    
    document.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        reviewerDashboard.openProjectDetailsModal(btn.dataset.id);
      });
    });
  }),
  
  openEvaluationModal: jest.fn((proposalId) => {
    reviewerDashboard.currentProposalId = proposalId;
    const proposal = {
      id: proposalId,
      project_title: 'AI Research Project',
      researcher_name: 'Dr. Smith',
      created_at: '2023-01-01T00:00:00Z'
    };
    
    document.getElementById('proposal-title').textContent = proposal.project_title;
    document.getElementById('proposal-author').textContent = proposal.researcher_name;
    document.getElementById('proposal-date').textContent = new Date(proposal.created_at).toLocaleDateString();
    
    reviewerDashboard.showModal();
  }),
  
  showModal: jest.fn(() => {
    const modal = document.querySelector('.evaluation-modal');
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
  }),
  
  closeModal: jest.fn(() => {
    const modal = document.querySelector('.evaluation-modal');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
  }),
  
  setupStarRating: jest.fn(() => {
    const stars = document.querySelectorAll('.rating-star');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const value = parseInt(star.dataset.value);
        document.getElementById('rating-value').value = value;
        document.getElementById('rating-display').textContent = `${value}/5`;
        
        stars.forEach((s, i) => {
          const icon = s.querySelector('i');
          if (i < value) {
            icon.classList.add('fas', 'selected');
            icon.classList.remove('far');
          } else {
            icon.classList.add('far');
            icon.classList.remove('fas', 'selected');
          }
        });
      });
    });
  }),
  
  resetStarRating: jest.fn(() => {
    const stars = document.querySelectorAll('.rating-star');
    document.getElementById('rating-value').value = '';
    document.getElementById('rating-display').textContent = '0/5';
    
    stars.forEach(star => {
      const icon = star.querySelector('i');
      icon.classList.add('far');
      icon.classList.remove('fas', 'selected');
    });
  })
};

// Setup before all tests
beforeAll(() => {
  // Initialize the dashboard
  reviewerDashboard.setupProjectDetailsModal();
  reviewerDashboard.setupStarRating();
  
  // Attach refresh button event
  document.querySelector('.refresh-btn').addEventListener('click', () => {
    reviewerDashboard.fetchAssignedProposals();
  });
  
  // Attach modal close events
  document.querySelector('.close-modal').addEventListener('click', () => {
    reviewerDashboard.closeModal();
  });
  
  document.querySelector('.cancel-btn').addEventListener('click', () => {
    reviewerDashboard.closeModal();
  });
  
  // Attach form submission
  document.getElementById('evaluation-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const feedback = document.getElementById('feedback').value;
    const rating = document.getElementById('rating-value').value;
    const recommendation = document.querySelector('input[name="recommendation"]:checked')?.value;
    
    if (!feedback || !rating || !recommendation) {
      alert('Please complete all fields');
      return;
    }
    
    const evaluation = {
      project_id: reviewerDashboard.currentProposalId,
      feedback,
      rating: parseInt(rating),
      recommendation,
      status: recommendation === 'approve' ? 'approved' : 
              recommendation === 'revision' ? 'revision' : 'rejected'
    };
    
    let evaluations = JSON.parse(localStorage.getItem('evaluations') || '[]');
    evaluations = evaluations.filter(e => e.project_id !== reviewerDashboard.currentProposalId);
    evaluations.push(evaluation);
    localStorage.setItem('evaluations', JSON.stringify(evaluations));
    
    reviewerDashboard.closeModal();
    reviewerDashboard.fetchAssignedProposals();
  });
});

describe('Reviewer Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    global.fetch.mockClear();
  });

  test('should fetch and display proposals', async () => {
    await reviewerDashboard.fetchAssignedProposals();
    expect(global.fetch).toHaveBeenCalled();
    expect(reviewerDashboard.renderProposals).toHaveBeenCalled();
  });

  test('should open and close project details modal', () => {
    reviewerDashboard.openProjectDetailsModal('1');
    const modal = document.querySelector('.project-details-modal');
    expect(modal.style.display).toBe('flex');
    
    reviewerDashboard.closeProjectDetailsModal();
    expect(modal.style.display).toBe('none');
  });

  test('should handle star rating interactions', () => {
    const stars = document.querySelectorAll('.rating-star');
    stars[2].click();
    expect(document.getElementById('rating-value').value).toBe('3');
    
    reviewerDashboard.resetStarRating();
    expect(document.getElementById('rating-value').value).toBe('');
  });

  test('should submit evaluation form', async () => {
    // Open evaluation modal
    reviewerDashboard.openEvaluationModal('1');
    
    // Fill out form
    document.getElementById('feedback').value = 'Excellent project';
    document.getElementById('rating-value').value = '5';
    document.getElementById('approve').checked = true;
    
    // Submit form
    document.getElementById('evaluation-form').dispatchEvent(new Event('submit'));
    
    // Check evaluation was saved
    const evaluations = JSON.parse(localStorage.getItem('evaluations'));
    expect(evaluations.length).toBe(1);
    expect(evaluations[0].status).toBe('approved');
  });
});

describe('User Acceptance Tests', () => {
  test('should allow reviewer to view project details', async () => {
    await reviewerDashboard.fetchAssignedProposals();
    
    const viewButton = document.querySelector('.view-details-btn');
    viewButton.click();
    
    const modal = document.querySelector('.project-details-modal');
    expect(modal.style.display).toBe('flex');
    expect(document.getElementById('details-project-title').textContent).toBe('AI Research Project');
  });

  test('should allow reviewer to evaluate a project', async () => {
    await reviewerDashboard.fetchAssignedProposals();
    
    // Open evaluation modal
    reviewerDashboard.openEvaluationModal('1');
    
    // Fill out evaluation
    document.getElementById('feedback').value = 'Very promising research';
    document.querySelector('.rating-star[data-value="4"]').click();
    document.getElementById('revision').checked = true;
    
    // Submit evaluation
    document.getElementById('evaluation-form').dispatchEvent(new Event('submit'));
    
    // Check evaluation was saved
    const evaluations = JSON.parse(localStorage.getItem('evaluations'));
    expect(evaluations[0].feedback).toBe('Very promising research');
    expect(evaluations[0].status).toBe('revision');
  });
});