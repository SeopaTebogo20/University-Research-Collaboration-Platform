/**
 * Admin Dashboard JavaScript
 * Manages the display and interaction with research proposals using API
 */
document.addEventListener('DOMContentLoaded', function() {
    // API endpoint
    const API_URL = 'http://localhost:3000/api/projects';
    
    // Store for proposals and reviewers
    let projectsData = [];
    let reviewersData = [];
    
    // DOM elements
    const proposalsList = document.getElementById('proposals-list');
    const proposalModal = document.getElementById('proposal-modal');
    const assignReviewerModal = document.getElementById('assign-reviewer-modal');
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
    
    // Current selected proposal for operations
    let currentProposal = null;
    let currentFilters = {
        status: 'all',
        researchArea: 'all'
    };

    // Initialize the dashboard
    function initDashboard() {
        fetchProjects();
        setupEventListeners();
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
    
    // Fetch reviewers from API (assuming a reviewers endpoint exists)
    async function fetchReviewers() {
        try {
            const response = await fetch(`${API_URL}/reviewers`);
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

    // Load proposals based on filters
    function loadProposals() {
        proposalsList.innerHTML = '';
        
        const filteredProposals = projectsData.filter(project => {
            // Map the database fields to our UI fields
            const status = project.reviewer ? 'in-review' : 'pending';
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
        
        filteredProposals.forEach(project => {
            const row = document.createElement('tr');
            row.dataset.id = project.id;
            
            const startDate = project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }) : 'N/A';
            
            const status = project.reviewer ? 'in-review' : 'pending';
            const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
            const statusClass = `status-${status}`;
            
            row.innerHTML = `
                <td>${project.id}</td>
                <td>${project.project_title}</td>
                <td>${project.researcher_name}</td>
                <td>${startDate}</td>
                <td>${project.key_research_area || 'N/A'}</td>
                <td><span class="status-badge ${statusClass}">${displayStatus}</span></td>
                <td class="table-actions">
                    <button class="btn btn-icon view-btn" title="View Details"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-icon assign-btn" title="Assign Reviewers"><i class="fas fa-user-plus"></i></button>
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
                const proposalId = e.target.closest('tr').dataset.id;
                openProposalDetails(proposalId);
            });
        });
        
        document.querySelectorAll('.assign-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                const proposalId = e.target.closest('tr').dataset.id;
                openAssignReviewers(proposalId);
            });
        });
    }
    
    // Open proposal details modal
    function openProposalDetails(proposalId) {
        currentProposal = projectsData.find(p => p.id === proposalId);
        
        if (!currentProposal) return;
        
        const startDate = currentProposal.start_date ? new Date(currentProposal.start_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) : 'N/A';
        
        const status = currentProposal.reviewer ? 'in-review' : 'pending';
        const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
        
        // Extract concepts from description (assuming they might be stored there)
        const concepts = currentProposal.description ? 
            extractKeywords(currentProposal.description) : 
            ['No concepts available'];
        
        // Update modal content
        modalElements.title.textContent = currentProposal.project_title;
        modalElements.id.textContent = currentProposal.id;
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
        modalElements.reviewers.innerHTML = '';
        if (!currentProposal.reviewer) {
            const li = document.createElement('li');
            li.textContent = 'No reviewers assigned yet.';
            modalElements.reviewers.appendChild(li);
        } else {
            const li = document.createElement('li');
            li.textContent = currentProposal.reviewer;
            modalElements.reviewers.appendChild(li);
        }
        
        // Show the modal
        proposalModal.showModal();
    }
    
    // Helper function to extract keywords/concepts from text
    function extractKeywords(text) {
        if (!text) return ['N/A'];
        
        // Simple keyword extraction (can be improved)
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
    function openAssignReviewers(proposalId) {
        currentProposal = projectsData.find(p => p.id === proposalId);
        
        if (!currentProposal) return;
        
        // Update modal content
        assignModalElements.title.textContent = currentProposal.project_title;
        assignModalElements.reviewersList.innerHTML = '';
        assignModalElements.searchInput.value = '';
        
        // Show the modal
        assignReviewerModal.showModal();
    }
    
    // Search for available reviewers
    async function searchReviewers(searchTerm) {
        assignModalElements.reviewersList.innerHTML = '';
        
        if (!searchTerm.trim()) {
            const message = document.createElement('li');
            message.textContent = 'Please enter expertise keywords to search for reviewers.';
            message.classList.add('info-message');
            assignModalElements.reviewersList.appendChild(message);
            return;
        }
        
        // Try to fetch users who could be reviewers
        try {
            const response = await fetch(`${API_URL}/users?expertise=${encodeURIComponent(searchTerm)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const availableReviewers = await response.json();
            
            if (availableReviewers.length === 0) {
                const message = document.createElement('li');
                message.textContent = 'No matching reviewers found. Try different keywords.';
                message.classList.add('info-message');
                assignModalElements.reviewersList.appendChild(message);
                return;
            }
            
            // Display matched reviewers
            availableReviewers.forEach(reviewer => {
                // Skip if already assigned
                if (currentProposal.reviewer === reviewer.userName) return;
                
                const li = document.createElement('li');
                li.classList.add('reviewer-item');
                li.dataset.id = reviewer.userID;
                
                li.innerHTML = `
                    <input type="checkbox" id="reviewer-${reviewer.userID}" class="styled-checkbox">
                    <label for="reviewer-${reviewer.userID}">
                        <strong>${reviewer.userName}</strong>
                        <p>Department: ${reviewer.department || 'Not specified'}</p>
                    </label>
                `;
                
                assignModalElements.reviewersList.appendChild(li);
            });
            
        } catch (error) {
            console.error('Error searching reviewers:', error);
            
            // Fallback to dummy data for prototype purposes
            const dummyReviewers = [
                { userID: 'R001', userName: 'Dr. Elena Rodriguez', department: 'Computer Science' },
                { userID: 'R002', userName: 'Dr. James Wilson', department: 'Data Science' },
                { userID: 'R003', userName: 'Dr. Michelle Chen', department: 'Engineering' }
            ];
            
            dummyReviewers.forEach(reviewer => {
                const li = document.createElement('li');
                li.classList.add('reviewer-item');
                li.dataset.id = reviewer.userID;
                
                li.innerHTML = `
                    <input type="checkbox" id="reviewer-${reviewer.userID}" class="styled-checkbox">
                    <label for="reviewer-${reviewer.userID}">
                        <strong>${reviewer.userName}</strong>
                        <p>Department: ${reviewer.department || 'Not specified'}</p>
                    </label>
                `;
                
                assignModalElements.reviewersList.appendChild(li);
            });
        }
    }
    
    // Assign selected reviewers to the current proposal
    async function assignSelectedReviewers() {
        const selectedCheckboxes = assignModalElements.reviewersList.querySelectorAll('input[type="checkbox"]:checked');
        
        if (selectedCheckboxes.length === 0) {
            alert('Please select at least one reviewer to assign.');
            return;
        }
        
        // Get the first selected reviewer (assuming one reviewer per project)
        const firstCheckbox = selectedCheckboxes[0];
        const reviewerId = firstCheckbox.id.replace('reviewer-', '');
        
        try {
            // Get the reviewer name from the label
            const reviewerName = firstCheckbox.nextElementSibling.querySelector('strong').textContent;
            
            // Update project with reviewer information
            const response = await fetch(`${API_URL}/${currentProposal.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reviewer: reviewerName
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Update local data
            currentProposal.reviewer = reviewerName;
            
            // Close the modal and refresh the proposal list
            assignReviewerModal.close();
            
            // Refetch data to ensure we have the latest
            await fetchProjects();
            
            // Show a success message
            alert(`Reviewer "${reviewerName}" successfully assigned to "${currentProposal.project_title}"`);
            
        } catch (error) {
            console.error('Error assigning reviewer:', error);
            alert('Failed to assign reviewer. Please try again later.');
            
            // For prototype purposes, update the UI even if the API call fails
            const reviewerName = firstCheckbox.nextElementSibling.querySelector('strong').textContent;
            currentProposal.reviewer = reviewerName;
            assignReviewerModal.close();
            loadProposals();
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Filter form submission
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            currentFilters.status = statusFilter.value;
            currentFilters.researchArea = researchAreaFilter.value;
            
            loadProposals();
        });
        
        // Close modals when clicking the close button
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', function() {
                proposalModal.close();
                assignReviewerModal.close();
            });
        });
        
        // Close modals when clicking outside the content
        window.addEventListener('click', function(e) {
            if (e.target === proposalModal) {
                proposalModal.close();
            }
            if (e.target === assignReviewerModal) {
                assignReviewerModal.close();
            }
        });
        
        // Assign reviewers button in proposal details modal
        modalElements.assignBtn.addEventListener('click', function() {
            proposalModal.close();
            openAssignReviewers(currentProposal.id);
        });
        
        // Search reviewers button
        assignModalElements.searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            searchReviewers(assignModalElements.searchInput.value);
        });
        
        // Confirm reviewer assignment button
        assignModalElements.confirmBtn.addEventListener('click', assignSelectedReviewers);
        
        // Logout button functionality
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