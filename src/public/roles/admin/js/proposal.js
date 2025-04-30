/**
 * Admin proposal JavaScript
 * Manages the display and interaction with research proposals
 */
document.addEventListener('DOMContentLoaded', function() {
    // Mock data for development purposes
    const mockProposals = [
        {
            id: 'P001',
            title: 'Machine Learning Approaches for Climate Prediction',
            researcher: 'Dr. Sarah Johnson',
            date: '2025-03-15',
            area: 'Computer Science',
            status: 'pending',
            abstract: 'This research explores novel machine learning techniques to improve long-term climate prediction models, focusing on neural network architectures that can better process complex atmospheric data patterns.',
            concepts: ['Machine Learning', 'Climate Science', 'Neural Networks', 'Predictive Modeling'],
            assignedReviewers: []
        },
        // ... (keep the rest of the mockProposals array)
    ];

    const mockReviewers = [
        {
            id: 'R001',
            name: 'Dr. Elena Rodriguez',
            expertise: ['Machine Learning', 'Neural Networks', 'Computer Science'],
            available: true
        },
        // ... (keep the rest of the mockReviewers array)
    ];

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

    // Initialize the proposal
    function initproposal() {
        loadProposals();
        setupEventListeners();
    }

    // Load proposals based on filters
    function loadProposals() {
        proposalsList.innerHTML = '';
        
        const filteredProposals = mockProposals.filter(proposal => {
            const statusMatch = currentFilters.status === 'all' || proposal.status === currentFilters.status;
            const areaMatch = currentFilters.researchArea === 'all' || 
                             proposal.area.toLowerCase().replace(/\s+/g, '-') === currentFilters.researchArea;
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
        
        filteredProposals.forEach(proposal => {
            const row = document.createElement('tr');
            row.dataset.id = proposal.id;
            
            const formattedDate = new Date(proposal.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const displayStatus = proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1);
            const statusClass = `status-${proposal.status}`;
            
            row.innerHTML = `
                <td>${proposal.id}</td>
                <td>${proposal.title}</td>
                <td>${proposal.researcher}</td>
                <td>${formattedDate}</td>
                <td>${proposal.area}</td>
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
        currentProposal = mockProposals.find(p => p.id === proposalId);
        
        if (!currentProposal) return;
        
        const formattedDate = new Date(currentProposal.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const displayStatus = currentProposal.status.charAt(0).toUpperCase() + currentProposal.status.slice(1);
        
        // Update modal content
        modalElements.title.textContent = currentProposal.title;
        modalElements.id.textContent = currentProposal.id;
        modalElements.researcher.textContent = currentProposal.researcher;
        modalElements.date.textContent = formattedDate;
        modalElements.area.textContent = currentProposal.area;
        modalElements.status.textContent = displayStatus;
        modalElements.abstract.textContent = currentProposal.abstract;
        
        // Display research concepts
        modalElements.concepts.innerHTML = '';
        currentProposal.concepts.forEach(concept => {
            const li = document.createElement('li');
            li.textContent = concept;
            modalElements.concepts.appendChild(li);
        });
        
        // Display assigned reviewers
        modalElements.reviewers.innerHTML = '';
        if (currentProposal.assignedReviewers.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No reviewers assigned yet.';
            modalElements.reviewers.appendChild(li);
        } else {
            currentProposal.assignedReviewers.forEach(reviewer => {
                const li = document.createElement('li');
                li.textContent = reviewer;
                modalElements.reviewers.appendChild(li);
            });
        }
        
        // Show the modal
        proposalModal.showModal();
    }
    
    // Open assign reviewers modal
    function openAssignReviewers(proposalId) {
        currentProposal = mockProposals.find(p => p.id === proposalId);
        
        if (!currentProposal) return;
        
        // Update modal content
        assignModalElements.title.textContent = currentProposal.title;
        assignModalElements.reviewersList.innerHTML = '';
        assignModalElements.searchInput.value = '';
        
        // Show the modal
        assignReviewerModal.showModal();
    }
    
    // Search for available reviewers
    function searchReviewers(searchTerm) {
        assignModalElements.reviewersList.innerHTML = '';
        
        if (!searchTerm.trim()) {
            const message = document.createElement('li');
            message.textContent = 'Please enter expertise keywords to search for reviewers.';
            message.classList.add('info-message');
            assignModalElements.reviewersList.appendChild(message);
            return;
        }
        
        const searchTerms = searchTerm.toLowerCase().split(',').map(term => term.trim());
        
        const matchedReviewers = mockReviewers.filter(reviewer => {
            const alreadyAssigned = currentProposal.assignedReviewers.includes(reviewer.name);
            if (alreadyAssigned) return false;
            
            return reviewer.expertise.some(exp => 
                searchTerms.some(term => exp.toLowerCase().includes(term))
            );
        });
        
        if (matchedReviewers.length === 0) {
            const message = document.createElement('li');
            message.textContent = 'No matching reviewers found. Try different keywords.';
            message.classList.add('info-message');
            assignModalElements.reviewersList.appendChild(message);
            return;
        }
        
        // Display matched reviewers
        matchedReviewers.forEach(reviewer => {
            const li = document.createElement('li');
            li.classList.add('reviewer-item');
            li.dataset.id = reviewer.id;
            
            li.innerHTML = `
                <input type="checkbox" id="reviewer-${reviewer.id}" class="styled-checkbox">
                <label for="reviewer-${reviewer.id}">
                    <strong>${reviewer.name}</strong>
                    <p>Expertise: ${reviewer.expertise.join(', ')}</p>
                </label>
            `;
            
            assignModalElements.reviewersList.appendChild(li);
        });
    }
    
    // Assign selected reviewers to the current proposal
    function assignSelectedReviewers() {
        const selectedCheckboxes = assignModalElements.reviewersList.querySelectorAll('input[type="checkbox"]:checked');
        
        if (selectedCheckboxes.length === 0) {
            alert('Please select at least one reviewer to assign.');
            return;
        }
        
        selectedCheckboxes.forEach(checkbox => {
            const reviewerId = checkbox.id.replace('reviewer-', '');
            const reviewer = mockReviewers.find(r => r.id === reviewerId);
            
            if (reviewer && !currentProposal.assignedReviewers.includes(reviewer.name)) {
                currentProposal.assignedReviewers.push(reviewer.name);
            }
        });
        
        // If proposal was pending and now has reviewers, change status to in-review
        if (currentProposal.status === 'pending' && currentProposal.assignedReviewers.length > 0) {
            currentProposal.status = 'in-review';
        }
        
        // Close the modal and refresh the proposal list
        assignReviewerModal.close();
        loadProposals();
        
        // Show a success message
        alert(`Reviewers successfully assigned to "${currentProposal.title}"`);
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
    
    // Initialize the proposal
    initproposal();
});