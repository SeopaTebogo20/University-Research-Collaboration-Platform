/**
 * Admin Dashboard JavaScript
 * Manages the display and interaction with research proposals using API
 * Now properly determines proposal assignment status from the /api/proposals database
 * Modified to hide "Assign Reviewers" button for already assigned proposals
 */
document.addEventListener('DOMContentLoaded', function() {
    // API Endpoints - Dynamically select between local and production URLs
    const isLocalEnvironment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1';
    
    const BASE_URL = isLocalEnvironment
        ? 'http://localhost:3000'
        : 'https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net';
    
    const API_URL = `${BASE_URL}/api/projects`;
    const USERS_API_URL = `${BASE_URL}/api/users`;
    const PROPOSALS_API_URL = `${BASE_URL}/api/proposals`;
    
    // Store for proposals, reviewers, and assignments
    let projectsData = [];
    let reviewersData = [];
    let assignmentData = []; // Track all proposal assignments
    
    // DOM elements
    const proposalsList = document.getElementById('proposals-list');
    const proposalModal = document.getElementById('proposal-modal');
    const assignReviewerModal = document.getElementById('assign-reviewer-modal');
    const reviewerProfileModal = document.getElementById('reviewer-profile-modal') || createReviewerProfileModal();
    const statusFilter = document.getElementById('status-filter');
    const researchAreaFilter = document.getElementById('research-area-filter');
    const filterForm = document.querySelector('.filter-form');
    
    // Modal elements
    const modalElements = {
        title: document.getElementById('modal-proposal-title'),
        id: document.getElementById('modal-proposal-id'),
        researcher: document.getElementById('modal-proposal-researcher'),
        date: document.getElementById('modal-proposal-date'),
        area: document.getElementById('modal-proposal-area'),
        status: document.getElementById('modal-proposal-status'),
        abstract: document.getElementById('modal-proposal-abstract'),
        concepts: document.getElementById('modal-proposal-concepts'),
        reviewers: document.getElementById('modal-assigned-reviewers'),
        assignBtn: document.getElementById('assign-reviewers-btn')
    };
    
    // Assign reviewer modal elements
    const assignModalElements = {
        title: document.getElementById('assign-proposal-title'),
        searchInput: document.getElementById('reviewer-search-input'),
        searchBtn: document.getElementById('search-reviewers-btn'),
        reviewersList: document.getElementById('available-reviewers'),
        confirmBtn: document.getElementById('confirm-assign-btn')
    };

    // Reviewer profile modal elements
    let reviewerProfileElements = {};
    
    // Current selected proposal for operations
    let currentProposal = null;
    let currentReviewer = null;
    let currentFilters = {
        status: 'all',
        researchArea: 'all'
    };

    // Create reviewer profile modal if it doesn't exist
    function createReviewerProfileModal() {
        const modal = document.createElement('dialog');
        modal.id = 'reviewer-profile-modal';
        modal.classList.add('modal');
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Reviewer Profile</h2>
                
                <div class="profile-details">
                    <div class="profile-section">
                        <h3 id="reviewer-name"></h3>
                        <p><strong>Role:</strong> <span id="reviewer-role"></span></p>
                        <p><strong>Department:</strong> <span id="reviewer-department"></span></p>
                        <p><strong>Academic Role:</strong> <span id="reviewer-academic-role"></span></p>
                        <p><strong>Email:</strong> <span id="reviewer-email"></span></p>
                        <p><strong>Phone:</strong> <span id="reviewer-phone"></span></p>
                    </div>
                    
                    <div class="profile-section">
                        <h3>Research Information</h3>
                        <p><strong>Research Area:</strong> <span id="reviewer-research-area"></span></p>
                        <p><strong>Research Experience:</strong> <span id="reviewer-research-experience"></span> years</p>
                        <p><strong>Qualifications:</strong> <span id="reviewer-qualifications"></span></p>
                        <p><strong>Current Project:</strong> <span id="reviewer-current-project"></span></p>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button id="select-reviewer-btn" class="btn primary-btn">Assign as Reviewer</button>
                    <button class="btn secondary-btn close-modal">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }

    // Initialize reviewer profile modal elements
    function initReviewerProfileElements() {
        reviewerProfileElements = {
            name: document.getElementById('reviewer-name'),
            role: document.getElementById('reviewer-role'),
            department: document.getElementById('reviewer-department'),
            academicRole: document.getElementById('reviewer-academic-role'),
            email: document.getElementById('reviewer-email'),
            phone: document.getElementById('reviewer-phone'),
            researchArea: document.getElementById('reviewer-research-area'),
            researchExperience: document.getElementById('reviewer-research-experience'),
            qualifications: document.getElementById('reviewer-qualifications'),
            currentProject: document.getElementById('reviewer-current-project'),
            selectBtn: document.getElementById('select-reviewer-btn')
        };
    }

    // Initialize the dashboard
    function initDashboard() {
        fetchAllProposalAssignments()
            .then(() => fetchProjects())
            .catch(error => {
                console.error('Error initializing dashboard:', error);
                displayErrorMessage('Failed to initialize the dashboard. Please try again later.');
            });
        
        initReviewerProfileElements();
        setupEventListeners();
    }

    // Fetch all proposal assignments from API
    async function fetchAllProposalAssignments() {
        try {
            const response = await fetch(PROPOSALS_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            assignmentData = await response.json();
            return assignmentData;
        } catch (error) {
            console.error('Error fetching proposal assignments:', error);
            assignmentData = [];
            throw error;
        }
    }

    // Fetch projects from API
    async function fetchProjects() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            projectsData = await response.json();
            loadProposals();
        } catch (error) {
            console.error('Error fetching projects:', error);
            displayErrorMessage('Failed to load projects. Please try again later.');
        }
    }
    
    // Fetch reviewers from API
    async function fetchReviewers(searchParams = {}) {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('promoted-role', 'reviewer');
            
            for (const [key, value] of Object.entries(searchParams)) {
                if (value) {
                    queryParams.append(key, value);
                }
            }
            
            const queryString = queryParams.toString();
            const endpoint = `${USERS_API_URL}${queryString ? '?' + queryString : ''}`;
            
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            reviewersData = await response.json();
            return reviewersData;
        } catch (error) {
            console.error('Error fetching reviewers:', error);
            return [];
        }
    }

    // Display error message in the proposals list
    function displayErrorMessage(message) {
        proposalsList.innerHTML = `
            <tr>
                <td colspan="7" class="error-message">${message}</td>
            </tr>
        `;
    }

    // Check if a project has been assigned to reviewers
    function isProjectAssigned(projectId) {
        return assignmentData.some(assignment => assignment.project_id === projectId);
    }

    // Get assignment status for a project
    function getProjectAssignmentStatus(projectId) {
        return isProjectAssigned(projectId) ? 'assigned' : 'pending';
    }

    // Load proposals based on filters
    function loadProposals() {
        proposalsList.innerHTML = '';
        
        const filteredProposals = projectsData.filter(project => {
            // Determine status based on assignments in the database
            const status = getProjectAssignmentStatus(project.id);
            const area = project.key_research_area || '';
            
            const statusMatch = currentFilters.status === 'all' || status === currentFilters.status;
            const areaMatch = currentFilters.researchArea === 'all' || 
                             area.toLowerCase().replace(/\s+/g, '-') === currentFilters.researchArea;
            return statusMatch && areaMatch;
        });
        
        if (filteredProposals.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="7" class="empty-table-message">No proposals match the selected filters.</td>
            `;
            proposalsList.appendChild(emptyRow);
            return;
        }
        
        filteredProposals.forEach((project, index) => {
            const row = document.createElement('tr');
            row.dataset.id = project.id;
            
            const displayIndex = index + 1;
            
            const startDate = project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }) : 'N/A';
            
            // Get status based on actual assignments
            const status = getProjectAssignmentStatus(project.id);
            const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
            const statusClass = `status-${status}`;
            
            row.innerHTML = `
                <td>${displayIndex}</td>
                <td>${project.project_title}</td>
                <td>${project.researcher_name}</td>
                <td>${startDate}</td>
                <td>${project.key_research_area || 'N/A'}</td>
                <td><span class="status-badge ${statusClass}">${displayStatus}</span></td>
                <td class="table-actions">
                     <button class="btn view-btn" data-id="${project.id}"><i class="fas fa-eye"></i> View Details</button>
                </td>
            `;
            
            proposalsList.appendChild(row);
        });
        
        addRowActionListeners();
    }
    
    // Add event listeners to row action buttons
    function addRowActionListeners() {
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                const proposalId = this.getAttribute('data-id');
                openProposalDetails(proposalId);
            });
        });
    }
    
    // Open proposal details modal
    async function openProposalDetails(proposalId) {
        currentProposal = projectsData.find(p => p.id === proposalId);
        
        if (!currentProposal) return;
        
        const startDate = currentProposal.start_date ? new Date(currentProposal.start_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) : 'N/A';
        
        // Get status based on actual assignments
        const status = getProjectAssignmentStatus(proposalId);
        const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
        
        const concepts = currentProposal.description ? 
            extractKeywords(currentProposal.description) : 
            ['No concepts available'];
        
        const filteredProposals = projectsData.filter(project => {
            const status = getProjectAssignmentStatus(project.id);
            const area = project.key_research_area || '';
            
            const statusMatch = currentFilters.status === 'all' || status === currentFilters.status;
            const areaMatch = currentFilters.researchArea === 'all' || 
                             area.toLowerCase().replace(/\s+/g, '-') === currentFilters.researchArea;
            return statusMatch && areaMatch;
        });
        
        const displayIndex = filteredProposals.findIndex(p => p.id === proposalId) + 1;
        
        // Update modal content
        modalElements.title.textContent = currentProposal.project_title;
        modalElements.id.textContent = displayIndex;
        modalElements.researcher.textContent = currentProposal.researcher_name;
        modalElements.date.textContent = startDate;
        modalElements.area.textContent = currentProposal.key_research_area || 'N/A';
        modalElements.status.textContent = displayStatus;
        modalElements.abstract.textContent = currentProposal.description || 'No abstract available';
        
        // Display research concepts
        modalElements.concepts.innerHTML = '';
        concepts.forEach(concept => {
            const li = document.createElement('li');
            li.textContent = concept;
            modalElements.concepts.appendChild(li);
        });
        
        // Display assigned reviewers
        await displayAssignedReviewers(proposalId);
        
        // Show or hide the assign reviewers button based on assignment status
        if (status === 'assigned') {
            modalElements.assignBtn.style.display = 'none';
        } else {
            modalElements.assignBtn.style.display = 'block';
        }
        
        // Show the modal
        proposalModal.showModal();
    }
    
    // Display assigned reviewers for a proposal
    async function displayAssignedReviewers(proposalId) {
        try {
            // Filter assignments for this project from already loaded assignment data
            const projectAssignments = assignmentData.filter(assignment => assignment.project_id === proposalId);
            
            modalElements.reviewers.innerHTML = '';
            
            if (!projectAssignments || projectAssignments.length === 0) {
                const li = document.createElement('li');
                li.textContent = 'No reviewers assigned yet.';
                modalElements.reviewers.appendChild(li);
            } else {
                // Ensure we have reviewer data available
                if (reviewersData.length === 0) {
                    reviewersData = await fetchReviewers();
                }
                
                for (const assignment of projectAssignments) {
                    const li = document.createElement('li');
                    const reviewer = reviewersData.find(r => r.id === assignment.reviewerId);
                    li.textContent = reviewer ? reviewer.name : `Reviewer ID: ${assignment.reviewerId}`;
                    modalElements.reviewers.appendChild(li);
                }
            }
        } catch (error) {
            console.error('Error displaying assigned reviewers:', error);
            const li = document.createElement('li');
            li.textContent = 'Error loading reviewer assignments.';
            modalElements.reviewers.appendChild(li);
        }
    }
    
    // Helper function to extract keywords/concepts from text
    function extractKeywords(text) {
        if (!text) return ['N/A'];
        
        const words = text.split(/\s+/);
        const capitalizedWords = words.filter(word => 
            word.length > 3 && 
            word[0] === word[0].toUpperCase() && 
            word[0] !== word[0].toLowerCase()
        );
        
        return capitalizedWords.length > 0 ? 
            Array.from(new Set(capitalizedWords)).slice(0, 5) : 
            ['No concepts available'];
    }
    
    // Open assign reviewers modal
    async function openAssignReviewers(proposalId) {
        currentProposal = projectsData.find(p => p.id === proposalId);
        
        if (!currentProposal) return;
        
        // Check if proposal is already assigned
        const status = getProjectAssignmentStatus(proposalId);
        if (status === 'assigned') {
            alert('This proposal already has assigned reviewers.');
            return;
        }
        
        assignModalElements.title.textContent = currentProposal.project_title;
        assignModalElements.reviewersList.innerHTML = '';
        assignModalElements.searchInput.value = '';
        
        const loadingItem = document.createElement('li');
        loadingItem.classList.add('info-message');
        loadingItem.textContent = 'Loading reviewers...';
        assignModalElements.reviewersList.appendChild(loadingItem);
        
        assignReviewerModal.showModal();
        
        try {
            // First ensure the reviewers data is loaded
            const reviewers = await fetchReviewers();
            displayReviewersList(reviewers);
        } catch (error) {
            console.error('Error loading reviewers:', error);
            displayReviewersListError('Failed to load reviewers. Please try again.');
        }
    }
    
    // Display reviewers in the list
    function displayReviewersList(reviewers) {
        assignModalElements.reviewersList.innerHTML = '';
        
        if (!reviewers || reviewers.length === 0) {
            const message = document.createElement('li');
            message.textContent = 'No reviewers found. Try different search criteria.';
            message.classList.add('info-message');
            assignModalElements.reviewersList.appendChild(message);
            return;
        }
        
        // Get currently assigned reviewers for this project
        const assignedReviewerIds = assignmentData
            .filter(assignment => assignment.project_id === currentProposal.id)
            .map(assignment => assignment.reviewerId);
        
        reviewers.forEach(reviewer => {
            // Skip already assigned reviewers
            if (assignedReviewerIds.includes(reviewer.id)) return;
            
            const li = document.createElement('li');
            li.classList.add('reviewer-item');
            li.dataset.id = reviewer.id;
            
            const matchScore = calculateMatchScore(reviewer, currentProposal);
            const matchClass = matchScore > 80 ? 'high-match' : 
                             matchScore > 50 ? 'medium-match' : 'low-match';
            
            li.innerHTML = `
                <div class="reviewer-list-item">
                    <div class="reviewer-info">
                        <h4>${reviewer.name}</h4>
                        <p>Department: ${reviewer.department || 'Not specified'}</p>
                        <p>Research Area: ${reviewer.research_area || 'Not specified'}</p>
                    </div>
                    <div class="reviewer-actions">
                        <span class="match-score ${matchClass}">${matchScore}% Match</span>
                        <button class="btn view-profile-btn" data-id="${reviewer.id}">View Profile</button>
                        <button class="btn assign-reviewer-btn" data-id="${reviewer.id}">Assign</button>
                    </div>
                </div>
            `;
            
            assignModalElements.reviewersList.appendChild(li);
        });
        
        document.querySelectorAll('.view-profile-btn').forEach(button => {
            button.addEventListener('click', function() {
                const reviewerId = this.getAttribute('data-id');
                openReviewerProfile(reviewerId);
            });
        });
        
        document.querySelectorAll('.assign-reviewer-btn').forEach(button => {
            button.addEventListener('click', function() {
                const reviewerId = this.getAttribute('data-id');
                const reviewer = reviewersData.find(r => r.id === reviewerId);
                if (reviewer) {
                    assignReviewer(reviewer);
                }
            });
        });
    }
    
    // Display error when loading reviewers
    function displayReviewersListError(message) {
        assignModalElements.reviewersList.innerHTML = '';
        const errorItem = document.createElement('li');
        errorItem.classList.add('error-message');
        errorItem.textContent = message;
        assignModalElements.reviewersList.appendChild(errorItem);
    }
    
    // Calculate match score between reviewer and proposal
    function calculateMatchScore(reviewer, proposal) {
        if (!reviewer || !proposal) return 0;
        
        let score = 0;
        
        if (reviewer.research_area && proposal.key_research_area) {
            if (reviewer.research_area.toLowerCase() === proposal.key_research_area.toLowerCase()) {
                score += 60;
            } else if (reviewer.research_area.toLowerCase().includes(proposal.key_research_area.toLowerCase()) ||
                      proposal.key_research_area.toLowerCase().includes(reviewer.research_area.toLowerCase())) {
                score += 40;
            }
        }
        
        if (reviewer.research_experience) {
            if (reviewer.research_experience > 10) {
                score += 30;
            } else if (reviewer.research_experience > 5) {
                score += 20;
            } else {
                score += 10;
            }
        }
        
        if (reviewer.department && proposal.department) {
            if (reviewer.department.toLowerCase() === proposal.department.toLowerCase()) {
                score += 10;
            }
        }
        
        return Math.min(score, 100);
    }
    
    // Open reviewer profile modal
    function openReviewerProfile(reviewerId) {
        const reviewer = reviewersData.find(r => r.id === reviewerId);
        
        if (!reviewer) {
            console.error('Reviewer not found');
            return;
        }
        
        currentReviewer = reviewer;
        
        reviewerProfileElements.name.textContent = reviewer.name || 'N/A';
        reviewerProfileElements.role.textContent = reviewer.role || 'N/A';
        reviewerProfileElements.department.textContent = reviewer.department || 'N/A';
        reviewerProfileElements.academicRole.textContent = reviewer.academic_role || 'N/A';
        reviewerProfileElements.email.textContent = reviewer.email || 'N/A';
        reviewerProfileElements.phone.textContent = reviewer.phone || 'N/A';
        reviewerProfileElements.researchArea.textContent = reviewer.research_area || 'N/A';
        reviewerProfileElements.researchExperience.textContent = reviewer.research_experience || 'N/A';
        reviewerProfileElements.qualifications.textContent = reviewer.qualifications || 'N/A';
        reviewerProfileElements.currentProject.textContent = reviewer.current_project || 'N/A';
        
        reviewerProfileModal.showModal();
    }
    
    // Assign reviewer to the current proposal
    async function assignReviewer(reviewer) {
        if (!currentProposal || !reviewer) return;
        
        try {
            const assignmentData = {
                project_id: currentProposal.id,
                project_name: currentProposal.project_title,
                reviewerId: reviewer.id,
                researcherId: currentProposal.researcher_id || 'REV456',
                rating: null,
                review_message: null,
                created_at: new Date().toISOString()
            };

            console.log('Sending assignment data:', JSON.stringify(assignmentData, null, 2));
            
            const response = await fetch(PROPOSALS_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(assignmentData)
            });

            const responseText = await response.text();
            let responseData;
            
            try {
                responseData = responseText ? JSON.parse(responseText) : {};
            } catch (e) {
                console.warn('Could not parse JSON response:', responseText);
                responseData = { message: responseText };
            }

            console.log('Server response:', {
                status: response.status,
                data: responseData
            });

            if (!response.ok) {
                throw new Error(responseData.message || `Server responded with status ${response.status}`);
            }
            
            // Refresh assignment data and projects data
            await fetchAllProposalAssignments();
            
            assignReviewerModal.close();
            reviewerProfileModal.close();
            
            alert(`Successfully assigned ${reviewer.name} to review "${currentProposal.project_title}"`);
            
            // Refresh the proposal list
            await fetchProjects();
            
        } catch (error) {
            console.error('Assignment failed:', {
                error: error.toString(),
                stack: error.stack
            });
            alert(`Failed to assign reviewer: ${error.message}`);
        }
    }
    
    // Search for available reviewers
    async function searchReviewers(searchTerm) {
        assignModalElements.reviewersList.innerHTML = '';
        
        const loadingItem = document.createElement('li');
        loadingItem.classList.add('info-message');
        loadingItem.textContent = 'Searching reviewers...';
        assignModalElements.reviewersList.appendChild(loadingItem);
        
        try {
            const searchParams = parseSearchTerm(searchTerm);
            const reviewers = await fetchReviewers(searchParams);
            displayReviewersList(reviewers);
        } catch (error) {
            console.error('Error searching reviewers:', error);
            displayReviewersListError('Failed to search reviewers. Please try again.');
        }
    }
    
    // Parse search term to extract possible filters
    function parseSearchTerm(searchTerm) {
        const params = {};
        
        if (!searchTerm.trim()) {
            return params;
        }
        
        const deptMatch = searchTerm.match(/department:([^\s,]+)/i);
        if (deptMatch) {
            params.department = deptMatch[1].trim();
        }
        
        const areaMatch = searchTerm.match(/area:([^\s,]+)/i);
        if (areaMatch) {
            params.research_area = areaMatch[1].trim();
        }
        
        if (!deptMatch && !areaMatch) {
            params.search = searchTerm.trim();
        }
        
        return params;
    }
    
    // Setup event listeners
    function setupEventListeners() {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            currentFilters.status = statusFilter.value;
            currentFilters.researchArea = researchAreaFilter.value;
            
            loadProposals();
        });
        
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', function() {
                proposalModal.close();
                assignReviewerModal.close();
                reviewerProfileModal.close();
            });
        });
        
        window.addEventListener('click', function(e) {
            if (e.target === proposalModal) {
                proposalModal.close();
            }
            if (e.target === assignReviewerModal) {
                assignReviewerModal.close();
            }
            if (e.target === reviewerProfileModal) {
                reviewerProfileModal.close();
            }
        });
        
        modalElements.assignBtn.addEventListener('click', function() {
            // Double check the current proposal's status before proceeding
            if (getProjectAssignmentStatus(currentProposal.id) === 'assigned') {
                alert('This proposal already has assigned reviewers.');
                return;
            }
            
            proposalModal.close();
            openAssignReviewers(currentProposal.id);
        });
        
        assignModalElements.searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            searchReviewers(assignModalElements.searchInput.value);
        });
        
        assignModalElements.searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchReviewers(assignModalElements.searchInput.value);
            }
        });
        
        reviewerProfileElements.selectBtn.addEventListener('click', function() {
            if (currentReviewer) {
                assignReviewer(currentReviewer);
            }
        });
        
        document.getElementById('logout-btn').addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to log out?')) {
                alert('You have been logged out.');
                window.location.href = 'login.html';
            }
        });
    }
    
    // Initialize the dashboard
    initDashboard();
});