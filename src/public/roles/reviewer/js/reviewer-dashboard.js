document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const evaluationModal = document.querySelector('.evaluation-modal');
    const projectDetailsModal = document.createElement('div');
    projectDetailsModal.className = 'project-details-modal';
    document.body.appendChild(projectDetailsModal);
    
    const closeModalButton = document.querySelector('.close-modal');
    const cancelButton = document.querySelector('.cancel-btn');
    const evaluationForm = document.getElementById('evaluation-form');
    const proposalTitle = document.getElementById('proposal-title');
    const proposalAuthor = document.getElementById('proposal-author');
    const proposalDate = document.getElementById('proposal-date');
    const refreshButton = document.querySelector('.refresh-btn');
    const statusFilter = document.querySelector('.styled-select');
    const ratingStars = document.querySelectorAll('.rating-star');
    const proposalsTable = document.querySelector('.proposals-table tbody');
    
    // Track the current proposal ID and rating
    let currentProposalId = '';
    let currentRating = 0;
    let proposals = [];
    let evaluations = JSON.parse(localStorage.getItem('evaluations')) || [];

    // API Endpoints
    const isLocalEnvironment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1';
    
    const BASE_URL = isLocalEnvironment
        ? 'http://localhost:3000'
        : 'https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net';
    
    const API_URL = `${BASE_URL}/api/projects`;
    const PROPOSALS_API_URL = `${BASE_URL}/api/proposals`;

    // Setup the project details modal
    function setupProjectDetailsModal() {
        projectDetailsModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Project Details</h2>
                    <span class="close-details-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="project-details">
                        <h3 id="details-project-title">Project Title</h3>
                        <div class="details-grid">
                            <div class="details-item">
                                <strong>Researcher:</strong>
                                <span id="details-researcher-name"></span>
                            </div>
                            <div class="details-item">
                                <strong>Department:</strong>
                                <span id="details-department"></span>
                            </div>
                            <div class="details-item">
                                <strong>Research Area:</strong>
                                <span id="details-research-area"></span>
                            </div>
                            <div class="details-item">
                                <strong>Experience Level:</strong>
                                <span id="details-experience-level"></span>
                            </div>
                            <div class="details-item">
                                <strong>Start Date:</strong>
                                <span id="details-start-date"></span>
                            </div>
                            <div class="details-item">
                                <strong>End Date:</strong>
                                <span id="details-end-date"></span>
                            </div>
                            <div class="details-item">
                                <strong>Funding Available:</strong>
                                <span id="details-funding"></span>
                            </div>
                            <div class="details-item">
                                <strong>Created:</strong>
                                <span id="details-created-at"></span>
                            </div>
                        </div>
                        
                        <div class="details-section">
                            <h4>Project Description</h4>
                            <p id="details-description"></p>
                        </div>
                        
                        <div class="details-section">
                            <h4>Skills and Expertise</h4>
                            <p id="details-skills"></p>
                        </div>
                        
                        <div class="details-section">
                            <h4>Positions Required</h4>
                            <p id="details-positions"></p>
                        </div>
                        
                        <div class="details-section">
                            <h4>Technical Requirements</h4>
                            <p id="details-technical"></p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline cancel-details-btn">Close</button>
                    <button type="button" class="btn btn-primary review-btn">Review Project</button>
                </div>
            </div>
        `;
        
        // Add event listeners for the new modal
        const closeDetailsButton = projectDetailsModal.querySelector('.close-details-modal');
        const cancelDetailsButton = projectDetailsModal.querySelector('.cancel-details-btn');
        const reviewButton = projectDetailsModal.querySelector('.review-btn');
        
        closeDetailsButton.addEventListener('click', closeProjectDetailsModal);
        cancelDetailsButton.addEventListener('click', closeProjectDetailsModal);
        
        reviewButton.addEventListener('click', function() {
            // Close details modal and open evaluation modal
            closeProjectDetailsModal();
            openEvaluationModal(currentProposalId);
        });
        
        // Add CSS for the new modal
        const style = document.createElement('style');
        style.textContent = `
            .project-details-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 1000;
                justify-content: center;
                align-items: center;
                overflow-y: auto;
                padding: 20px;
            }
            
            .project-details-modal .modal-content {
                background-color: white;
                border-radius: 8px;
                width: 80%;
                max-width: 900px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            
            .project-details-modal .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid #e6e6e6;
            }
            
            .project-details-modal .modal-body {
                padding: 20px;
            }
            
            .project-details-modal .modal-footer {
                padding: 15px 20px;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                border-top: 1px solid #e6e6e6;
            }
            
            .close-details-modal {
                font-size: 24px;
                cursor: pointer;
            }
            
            .details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 15px;
                margin: 15px 0;
            }
            
            .details-item {
                margin-bottom: 10px;
            }
            
            .details-section {
                margin-top: 20px;
                border-top: 1px solid #eee;
                padding-top: 15px;
            }
            
            .details-section h4 {
                margin-bottom: 10px;
                color: #555;
            }
        `;
        
        document.head.appendChild(style);
    }

    // Function to open the project details modal
    function openProjectDetailsModal(proposalId) {
        const proposal = proposals.find(p => p.id === proposalId);
        if (!proposal) return;
        
        currentProposalId = proposalId;
        
        // Populate the details modal
        document.getElementById('details-project-title').textContent = proposal.project_title;
        document.getElementById('details-researcher-name').textContent = proposal.researcher_name;
        document.getElementById('details-department').textContent = proposal.department || 'Not specified';
        document.getElementById('details-research-area').textContent = proposal.key_research_area || 'Not specified';
        document.getElementById('details-experience-level').textContent = proposal.experience_level || 'Not specified';
        document.getElementById('details-start-date').textContent = proposal.start_date ? new Date(proposal.start_date).toLocaleDateString() : 'Not specified';
        document.getElementById('details-end-date').textContent = proposal.end_date ? new Date(proposal.end_date).toLocaleDateString() : 'Not specified';
        document.getElementById('details-funding').textContent = proposal.funding_available ? 'Yes' : 'No';
        document.getElementById('details-created-at').textContent = new Date(proposal.created_at).toLocaleString();
        document.getElementById('details-description').textContent = proposal.description || 'No description provided';
        document.getElementById('details-skills').textContent = proposal.skills_and_expertise || 'None specified';
        document.getElementById('details-positions').textContent = proposal.positions_required || 'None specified';
        document.getElementById('details-technical').textContent = proposal.technical_requirements || 'None specified';
        
        // Show the modal
        projectDetailsModal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }
    
    // Function to close the project details modal
    function closeProjectDetailsModal() {
        projectDetailsModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }

    // Function to fetch assigned proposals
    async function fetchAssignedProposals() {
        try {
            // First get the list of assigned proposal IDs
            const proposalsResponse = await fetch(PROPOSALS_API_URL);
            if (!proposalsResponse.ok) throw new Error('Failed to fetch assigned proposals');
            const assignedProposals = await proposalsResponse.json();
            
            // Then get the full project details for each assigned proposal
            const projectsResponse = await fetch(API_URL);
            if (!projectsResponse.ok) throw new Error('Failed to fetch projects');
            const allProjects = await projectsResponse.json();
            
            // Filter projects to only those that are assigned
            proposals = allProjects.filter(project => 
                assignedProposals.some(assigned => assigned.project_id === project.id)
            );
            
            renderProposals(proposals);
            updateReviewStats();
        } catch (error) {
            console.error('Error fetching proposals:', error);
            alert('Error loading proposals. Please try again later.');
        }
    }

    // Function to update review statistics
    function updateReviewStats() {
        const pendingReviews = proposals.filter(p => {
            const evaluation = evaluations.find(e => e.project_id === p.id);
            return !evaluation || evaluation.status === 'pending';
        }).length;
        
        const completedReviews = evaluations.filter(e => 
            e.status !== 'pending'
        ).length;
        
        // Update the stats cards
        document.querySelector('.stat-card:nth-child(1) .stat-number').textContent = pendingReviews;
        document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = completedReviews;
    }

    // Function to render proposals in the table
    function renderProposals(proposals) {
        proposalsTable.innerHTML = ''; // Clear existing rows
        
        proposals.forEach(proposal => {
            // Find existing evaluation if it exists
            const evaluation = evaluations.find(e => e.project_id === proposal.id);
            
            const row = document.createElement('tr');
            
            // Determine status and button text/class
            let statusText = 'Pending';
            let statusClass = 'status-pending';
            let buttonText = 'View Details';
            let buttonClass = 'btn btn-primary evaluate-btn';
            
            if (evaluation) {
                switch(evaluation.status) {
                    case 'approved':
                        statusText = 'Approved';
                        statusClass = 'status-approved';
                        buttonText = 'View Details';
                        buttonClass = 'btn btn-outline view-btn';
                        break;
                    case 'revision':
                        statusText = 'Needs Revision';
                        statusClass = 'status-revision';
                        buttonText = 'View Details';
                        buttonClass = 'btn btn-outline view-btn';
                        break;
                    case 'rejected':
                        statusText = 'Rejected';
                        statusClass = 'status-rejected';
                        buttonText = 'View Details';
                        buttonClass = 'btn btn-outline view-btn';
                        break;
                }
            }
            
            row.innerHTML = `
                <td>${proposal.project_title}</td>
                <td>${proposal.researcher_name}</td>
                <td>${proposal.key_research_area || 'N/A'}</td>
                <td>${new Date(proposal.created_at).toLocaleDateString()}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="${buttonClass}" data-proposal="${proposal.id}">${buttonText}</button>
                </td>
            `;
            
            proposalsTable.appendChild(row);
        });
        
        // Reattach event listeners to the new buttons
        attachEventListeners();
    }
    
    // Function to attach event listeners to buttons
    function attachEventListeners() {
        // View details buttons (previously evaluate buttons)
        document.querySelectorAll('.evaluate-btn, .view-btn').forEach(button => {
            button.addEventListener('click', function() {
                const proposalId = this.getAttribute('data-proposal');
                openProjectDetailsModal(proposalId);
            });
        });
    }

    // Function to open the evaluation modal
    function openEvaluationModal(proposalId) {
        currentProposalId = proposalId;
        
        const proposal = proposals.find(p => p.id === proposalId);
        const existingEvaluation = evaluations.find(e => e.project_id === proposalId);
        
        proposalTitle.textContent = proposal.project_title;
        proposalAuthor.textContent = proposal.researcher_name;
        proposalDate.textContent = new Date(proposal.created_at).toLocaleDateString();
        
        // Reset form
        evaluationForm.reset();
        resetStarRating();
        
        // If there's existing data, populate the form with it
        if (existingEvaluation) {
            document.getElementById('feedback').value = existingEvaluation.feedback || '';
            
            if (existingEvaluation.rating > 0) {
                currentRating = existingEvaluation.rating;
                document.getElementById('rating-value').value = currentRating;
                
                // Update stars visual
                ratingStars.forEach((star, i) => {
                    const icon = star.querySelector('i');
                    if (icon) {
                        if (i < currentRating) {
                            icon.classList.add('selected');
                            icon.classList.remove('far');
                            icon.classList.add('fas');
                        }
                    }
                });
                
                document.getElementById('rating-display').textContent = currentRating + '/5';
            }
            
            if (existingEvaluation.recommendation) {
                const recommendationEl = document.getElementById(existingEvaluation.recommendation);
                if (recommendationEl) {
                    recommendationEl.checked = true;
                }
            }
            
            // If already reviewed, show in view mode
            if (existingEvaluation.status !== 'pending') {
                document.getElementById('feedback').readOnly = true;
                document.querySelectorAll('input[name="recommendation"]').forEach(radio => {
                    radio.disabled = true;
                });
                
                // Disable star interaction
                ratingStars.forEach(star => {
                    star.style.pointerEvents = 'none';
                });
                
                // Change submit button to close button
                const submitBtn = document.querySelector('.modal-footer .btn-primary');
                submitBtn.textContent = 'Close';
                submitBtn.type = 'button';
                submitBtn.onclick = closeModal;
                
                // Hide cancel button
                document.querySelector('.cancel-btn').style.display = 'none';
            } else {
                // Enable form for editing
                document.getElementById('feedback').readOnly = false;
                document.querySelectorAll('input[name="recommendation"]').forEach(radio => {
                    radio.disabled = false;
                });
                
                // Enable star interaction
                ratingStars.forEach(star => {
                    star.style.pointerEvents = 'auto';
                });
                
                // Reset submit button
                const submitBtn = document.querySelector('.modal-footer .btn-primary');
                submitBtn.textContent = 'Submit Evaluation';
                submitBtn.type = 'submit';
                document.querySelector('.cancel-btn').style.display = '';
            }
        } else {
            // New evaluation
            document.getElementById('feedback').readOnly = false;
            document.querySelectorAll('input[name="recommendation"]').forEach(radio => {
                radio.disabled = false;
            });
            
            // Enable star interaction
            ratingStars.forEach(star => {
                star.style.pointerEvents = 'auto';
            });
            
            // Reset submit button
            const submitBtn = document.querySelector('.modal-footer .btn-primary');
            submitBtn.textContent = 'Submit Evaluation';
            submitBtn.type = 'submit';
            document.querySelector('.cancel-btn').style.display = '';
        }
        
        // Show the modal
        showModal();
    }

    // Function to show evaluation modal
    function showModal() {
        evaluationModal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }

    // Function to close evaluation modal
    function closeModal() {
        evaluationModal.style.display = 'none';
        evaluationForm.reset();
        resetStarRating();
        document.body.classList.remove('modal-open');
        
        // Reset form fields to editable
        document.getElementById('feedback').readOnly = false;
        document.querySelectorAll('input[name="recommendation"]').forEach(radio => {
            radio.disabled = false;
        });
        
        // Reset star interaction
        ratingStars.forEach(star => {
            star.style.pointerEvents = 'auto';
        });
        
        // Reset submit button
        const submitBtn = document.querySelector('.modal-footer .btn-primary');
        submitBtn.textContent = 'Submit Evaluation';
        submitBtn.type = 'submit';
        document.querySelector('.cancel-btn').style.display = '';
    }

    // Handle star rating system
    function setupStarRating() {
        ratingStars.forEach((star, index) => {
            // Mouseover event
            star.addEventListener('mouseover', () => {
                // Only allow hover if not in view mode
                if (!document.getElementById('feedback').readOnly) {
                    // Highlight this star and all previous stars
                    for (let i = 0; i <= index; i++) {
                        ratingStars[i].querySelector('i').classList.add('hovered');
                    }
                }
            });
            
            // Mouseout event
            star.addEventListener('mouseout', () => {
                // Remove highlight from all stars
                ratingStars.forEach(s => {
                    const icon = s.querySelector('i');
                    if (icon) {
                        icon.classList.remove('hovered');
                    }
                });
            });
            
            // Click event
            star.addEventListener('click', () => {
                // Only allow rating if not in view mode
                if (!document.getElementById('feedback').readOnly) {
                    currentRating = parseInt(star.getAttribute('data-value'));
                    document.getElementById('rating-value').value = currentRating;
                    
                    // Update visual state of stars
                    ratingStars.forEach((s, i) => {
                        const icon = s.querySelector('i');
                        if (icon) {
                            if (i < currentRating) {
                                icon.classList.add('selected');
                                icon.classList.remove('far');
                                icon.classList.add('fas');
                            } else {
                                icon.classList.remove('selected');
                                icon.classList.remove('fas');
                                icon.classList.add('far');
                            }
                        }
                    });
                    
                    // Update rating display
                    document.getElementById('rating-display').textContent = currentRating + '/5';
                }
            });
        });
    }
    
    // Reset star rating
    function resetStarRating() {
        currentRating = 0;
        document.getElementById('rating-value').value = '';
        ratingStars.forEach(star => {
            const icon = star.querySelector('i');
            if (icon) {
                icon.classList.remove('selected', 'hovered');
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        });
        document.getElementById('rating-display').textContent = '0/5';
    }

    // Handle form submission
    evaluationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const feedback = document.getElementById('feedback').value;
        const recommendation = document.querySelector('input[name="recommendation"]:checked');
        
        // Validate form
        if (!feedback || !recommendation || currentRating === 0) {
            alert('Please provide feedback, a recommendation, and a rating');
            return;
        }
        
        // Create a backup of current evaluations
        const evaluationsBackup = JSON.stringify(evaluations);
        
        try {
            const proposal = proposals.find(p => p.id === currentProposalId);
            
            // Update evaluations data
            const evaluationIndex = evaluations.findIndex(e => e.project_id === currentProposalId);
            if (evaluationIndex !== -1) {
                evaluations[evaluationIndex] = {
                    ...evaluations[evaluationIndex],
                    feedback,
                    rating: currentRating,
                    recommendation: recommendation.value,
                    status: recommendation.value === 'approve' ? 'approved' : 
                           recommendation.value === 'revision' ? 'revision' : 'rejected'
                };
            } else {
                // If not found, add new evaluation
                evaluations.push({
                    project_id: currentProposalId,
                    title: proposal.project_title,
                    author: proposal.researcher_name,
                    date: new Date(proposal.created_at).toLocaleDateString(),
                    feedback,
                    rating: currentRating,
                    recommendation: recommendation.value,
                    status: recommendation.value === 'approve' ? 'approved' : 
                           recommendation.value === 'revision' ? 'revision' : 'rejected'
                });
            }
            
            // Save to localStorage
            localStorage.setItem('evaluations', JSON.stringify(evaluations));
            
            // Show success message
            const feedbackPreview = feedback.length > 50 ? feedback.substring(0, 50) + '...' : feedback;
            alert(`Evaluation submitted successfully!\n\nFeedback saved: "${feedbackPreview}"\nRating: ${currentRating}/5\nRecommendation: ${recommendation.value}`);
            
            // Refresh the proposals list to reflect changes
            fetchAssignedProposals();
            
            // Close the modal
            closeModal();
            
        } catch (error) {
            // If there's an error, restore from backup
            console.error("Error saving evaluation:", error);
            alert("There was an error saving your evaluation. Please try again.");
            localStorage.setItem('evaluations', evaluationsBackup);
        }
    });

    // Close modal when X button is clicked
    closeModalButton.addEventListener('click', closeModal);

    // Close modal when Cancel button is clicked
    cancelButton.addEventListener('click', closeModal);

    // Refresh button functionality
    refreshButton.addEventListener('click', function() {
        fetchAssignedProposals();
    });

    // Filter functionality
    statusFilter.addEventListener('change', function() {
        const selectedStatus = this.value;
        const rows = document.querySelectorAll('.proposals-table tbody tr');
        
        rows.forEach(row => {
            const statusBadge = row.querySelector('.status-badge');
            const status = statusBadge ? statusBadge.textContent.toLowerCase() : '';
            
            if (selectedStatus === 'all' || 
                (selectedStatus === 'pending' && status === 'pending') ||
                (selectedStatus === 'approved' && status === 'approved') ||
                (selectedStatus === 'revision' && status === 'needs revision') ||
                (selectedStatus === 'rejected' && status === 'rejected')) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Initialize the page
    setupProjectDetailsModal();
    setupStarRating();
    fetchAssignedProposals();
});