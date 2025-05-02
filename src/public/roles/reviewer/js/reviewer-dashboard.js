document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const evaluationModal = document.querySelector('.evaluation-modal');
    const evaluateButtons = document.querySelectorAll('.evaluate-btn');
    const viewButtons = document.querySelectorAll('.view-btn');
    const closeModalButton = document.querySelector('.close-modal');
    const cancelButton = document.querySelector('.cancel-btn');
    const evaluationForm = document.getElementById('evaluation-form');
    const proposalTitle = document.getElementById('proposal-title');
    const proposalAuthor = document.getElementById('proposal-author');
    const proposalDate = document.getElementById('proposal-date');
    const refreshButton = document.querySelector('.refresh-btn');
    const statusFilter = document.querySelector('.styled-select');
    const ratingStars = document.querySelectorAll('.rating-star');
    
    // Track the current proposal ID and rating
    let currentProposalId = '';
    let currentRating = 0;

    // Sample proposal data
    const proposals = {
        'quantum-computing': {
            title: 'Novel Approaches to Quantum Computing',
            author: 'Dr. Sarah Chen',
            date: 'April 28, 2025'
        },
        'ai-medical': {
            title: 'AI Applications in Medical Diagnostics',
            author: 'Dr. Michael Johnson',
            date: 'April 21, 2025'
        },
        'sustainable-ag': {
            title: 'Sustainable Agriculture Techniques',
            author: 'Dr. Elena Rodriguez',
            date: 'April 23, 2025'
        },
        'climate-change': {
            title: 'Climate Change Impact on Marine Ecosystems',
            author: 'Prof. James Wilson',
            date: 'April 25, 2025'
        },
        'renewable-energy': {
            title: 'Renewable Energy Integration in Urban Infrastructure',
            author: 'Dr. Lisa Morgan',
            date: 'April 20, 2025'
        }
    };

    // Evaluations data (would normally be loaded from evaluations.json)
    let evaluations = [
        {
            proposalId: "quantum-computing",
            title: "Novel Approaches to Quantum Computing",
            author: "Dr. Sarah Chen",
            date: "April 28, 2025",
            feedback: "",
            rating: 0,
            recommendation: "",
            status: "pending"
        },
        {
            proposalId: "ai-medical",
            title: "AI Applications in Medical Diagnostics",
            author: "Dr. Michael Johnson",
            date: "April 21, 2025",
            feedback: "",
            rating: 0,
            recommendation: "",
            status: "pending"
        },
        {
            proposalId: "sustainable-ag",
            title: "Sustainable Agriculture Techniques",
            author: "Dr. Elena Rodriguez",
            date: "April 23, 2025",
            feedback: "",
            rating: 0,
            recommendation: "",
            status: "pending"
        },
        {
            proposalId: "climate-change",
            title: "Climate Change Impact on Marine Ecosystems",
            author: "Prof. James Wilson",
            date: "April 25, 2025",
            feedback: "",
            rating: 0,
            recommendation: "",
            status: "pending"
        },
        {
            proposalId: "renewable-energy",
            title: "Renewable Energy Integration in Urban Infrastructure",
            author: "Dr. Lisa Morgan",
            date: "April 20, 2025",
            feedback: "Excellent proposal with clear methodology and significant potential impact. The research design is robust and well-articulated.",
            rating: 5,
            recommendation: "approve",
            status: "approved"
        }
    ];

    // Function to show modal
    function showModal() {
        evaluationModal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }

    // Function to close modal
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
                // Highlight this star and all previous stars
                for (let i = 0; i <= index; i++) {
                    ratingStars[i].querySelector('i').classList.add('hovered');
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

    // Function to show evaluation in view mode
    function showEvaluation(proposalId) {
        const evaluation = evaluations.find(e => e.proposalId === proposalId);
        if (!evaluation) return;
        
        proposalTitle.textContent = evaluation.title;
        proposalAuthor.textContent = evaluation.author;
        proposalDate.textContent = evaluation.date;
        
        // Set feedback (readonly)
        const feedbackField = document.getElementById('feedback');
        feedbackField.value = evaluation.feedback;
        feedbackField.readOnly = true;
        
        // Set rating
        currentRating = evaluation.rating;
        document.getElementById('rating-value').value = currentRating;
        ratingStars.forEach((star, index) => {
            const icon = star.querySelector('i');
            if (index < currentRating) {
                icon.classList.add('selected');
                icon.classList.remove('far');
                icon.classList.add('fas');
            } else {
                icon.classList.remove('selected');
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        });
        document.getElementById('rating-display').textContent = currentRating + '/5';
        
        // Set recommendation (disabled)
        if (evaluation.recommendation) {
            document.getElementById(evaluation.recommendation).checked = true;
            document.querySelectorAll('input[name="recommendation"]').forEach(radio => {
                radio.disabled = true;
            });
        }
        
        // Change submit button to close button
        const submitBtn = document.querySelector('.modal-footer .btn-primary');
        submitBtn.textContent = 'Close';
        submitBtn.type = 'button';
        submitBtn.onclick = closeModal;
        
        // Hide cancel button
        document.querySelector('.cancel-btn').style.display = 'none';
        
        showModal();
    }

    // Initialize star rating system
    setupStarRating();

    // Open modal when evaluate button is clicked
    evaluateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const proposalId = this.getAttribute('data-proposal');
            currentProposalId = proposalId;
            const proposal = proposals[proposalId];
            
            proposalTitle.textContent = proposal.title;
            proposalAuthor.textContent = proposal.author;
            proposalDate.textContent = proposal.date;
            
            // Reset form in case it was previously used
            evaluationForm.reset();
            resetStarRating();
            document.getElementById('feedback').readOnly = false;
            document.querySelectorAll('input[name="recommendation"]').forEach(radio => {
                radio.disabled = false;
            });
            
            // Reset submit button
            const submitBtn = document.querySelector('.modal-footer .btn-primary');
            submitBtn.textContent = 'Submit Evaluation';
            submitBtn.type = 'submit';
            document.querySelector('.cancel-btn').style.display = '';
            
            // Show the modal
            showModal();
        });
    });

    // Handle view buttons
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const proposalId = this.getAttribute('data-proposal');
            currentProposalId = proposalId;
            showEvaluation(proposalId);
        });
    });

    // Close modal when X button is clicked
    closeModalButton.addEventListener('click', closeModal);

    // Close modal when Cancel button is clicked
    cancelButton.addEventListener('click', closeModal);

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
        
        // Update evaluations data
        const evaluationIndex = evaluations.findIndex(e => e.proposalId === currentProposalId);
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
            // If not found, add new evaluation (shouldn't happen in this case)
            evaluations.push({
                proposalId: currentProposalId,
                title: proposalTitle.textContent,
                author: proposalAuthor.textContent,
                date: proposalDate.textContent,
                feedback,
                rating: currentRating,
                recommendation: recommendation.value,
                status: recommendation.value === 'approve' ? 'approved' : 
                       recommendation.value === 'revision' ? 'revision' : 'rejected'
            });
        }
        
        // Show success message
        alert('Evaluation submitted successfully!');
        
        // Close modal
        closeModal();
        
        // Update the UI to reflect the new status
        const row = document.querySelector(`.evaluate-btn[data-proposal="${currentProposalId}"]`).closest('tr');
        const statusCell = row.querySelector('.status-badge');
        
        switch(recommendation.value) {
            case 'approve':
                statusCell.textContent = 'Approved';
                statusCell.className = 'status-badge status-approved';
                break;
            case 'revision':
                statusCell.textContent = 'Needs Revision';
                statusCell.className = 'status-badge status-revision';
                break;
            case 'reject':
                statusCell.textContent = 'Rejected';
                statusCell.className = 'status-badge status-rejected';
                break;
        }
        
        // Change evaluate button to view button
        const evaluateBtn = row.querySelector('.evaluate-btn');
        evaluateBtn.textContent = 'View';
        evaluateBtn.className = 'btn btn-outline view-btn';
        evaluateBtn.setAttribute('data-proposal', currentProposalId);
        
        // Update event listener for the new view button
        evaluateBtn.addEventListener('click', function() {
            showEvaluation(currentProposalId);
        });
    });

    // Filter proposals by status
    statusFilter.addEventListener('change', function() {
        const status = this.value;
        const rows = document.querySelectorAll('.proposals-table tbody tr');
        
        rows.forEach(row => {
            const rowStatus = row.querySelector('.status-badge').textContent.toLowerCase();
            
            if (status === 'all' || rowStatus.includes(status)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Refresh button
    refreshButton.addEventListener('click', function() {
        // In a real app, this would fetch updated data from the server
        console.log('Refreshing data...');
        this.querySelector('i').classList.add('fa-spin');
        
        setTimeout(() => {
            this.querySelector('i').classList.remove('fa-spin');
        }, 1000);
    });
    
    // Prevent closing when clicking inside the modal content
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        modalContent.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
});