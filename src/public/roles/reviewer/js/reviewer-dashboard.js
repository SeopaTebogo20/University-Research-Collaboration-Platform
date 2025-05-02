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

    // Load evaluations from localStorage or use default
    let evaluations = JSON.parse(localStorage.getItem('evaluations')) || [
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

    // Initialize the UI with saved evaluations
    function initializeUI() {
        evaluations.forEach(evaluation => {
            if (evaluation.status !== 'pending') {
                const row = document.querySelector(`.evaluate-btn[data-proposal="${evaluation.proposalId}"]`)?.closest('tr');
                if (row) {
                    const statusCell = row.querySelector('.status-badge');
                    const evaluateBtn = row.querySelector('.evaluate-btn');
                    
                    // Update status badge
                    switch(evaluation.status) {
                        case 'approved':
                            statusCell.textContent = 'Approved';
                            statusCell.className = 'status-badge status-approved';
                            break;
                        case 'revision':
                            statusCell.textContent = 'Needs Revision';
                            statusCell.className = 'status-badge status-revision';
                            break;
                        case 'rejected':
                            statusCell.textContent = 'Rejected';
                            statusCell.className = 'status-badge status-rejected';
                            break;
                    }
                    
                    // Update button to view mode
                    if (evaluateBtn) {
                        evaluateBtn.textContent = 'View';
                        evaluateBtn.className = 'btn btn-outline view-btn';
                        evaluateBtn.setAttribute('data-proposal', evaluation.proposalId);
                    }
                }
            }
        });
    }

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

    // Function to show evaluation in view mode
    function showEvaluation(proposalId) {
        const evaluation = evaluations.find(e => e.proposalId === proposalId);
        if (!evaluation) return;
        
        proposalTitle.textContent = evaluation.title;
        proposalAuthor.textContent = evaluation.author;
        proposalDate.textContent = evaluation.date;
        
        // Set feedback (readonly)
        const feedbackField = document.getElementById('feedback');
        feedbackField.value = evaluation.feedback || "No feedback available";
        feedbackField.readOnly = true;
        
        // Set rating
        currentRating = evaluation.rating || 0;
        document.getElementById('rating-value').value = currentRating;
        ratingStars.forEach((star, index) => {
            const icon = star.querySelector('i');
            if (icon) {
                if (index < currentRating) {
                    icon.classList.add('selected');
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                } else {
                    icon.classList.remove('selected');
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                }
            }
            // Disable star interaction in view mode
            star.style.pointerEvents = 'none';
        });
        document.getElementById('rating-display').textContent = currentRating + '/5';
        
        // Set recommendation (disabled)
        if (evaluation.recommendation) {
            const recommendationEl = document.getElementById(evaluation.recommendation);
            if (recommendationEl) {
                recommendationEl.checked = true;
            }
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
    initializeUI();

    // Open modal when evaluate button is clicked
    evaluateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const proposalId = this.getAttribute('data-proposal');
            currentProposalId = proposalId;
            
            // Get existing evaluation data if it exists
            const existingEvaluation = evaluations.find(e => e.proposalId === proposalId);
            const proposal = proposals[proposalId];
            
            proposalTitle.textContent = proposal.title;
            proposalAuthor.textContent = proposal.author;
            proposalDate.textContent = proposal.date;
            
            // Reset form in case it was previously used
            evaluationForm.reset();
            resetStarRating();
            
            // If there's existing data, populate the form with it
            if (existingEvaluation && existingEvaluation.feedback) {
                document.getElementById('feedback').value = existingEvaluation.feedback;
                
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
            }
            
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
    
    // Update existing evaluate buttons converted to view buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-btn')) {
            const proposalId = e.target.getAttribute('data-proposal');
            if (proposalId) {
                currentProposalId = proposalId;
                showEvaluation(proposalId);
            }
        }
    });

    // Close modal when X button is clicked
    closeModalButton.addEventListener('click', closeModal);

    // Close modal when Cancel button is clicked
    cancelButton.addEventListener('click', closeModal);

    // Save form data in case of accidental closure
    let tempFormData = {};
    
    // Monitor for form changes and save to temporary storage
    evaluationForm.addEventListener('input', function(e) {
        if (currentProposalId) {
            tempFormData[currentProposalId] = tempFormData[currentProposalId] || {};
            
            if (e.target.id === 'feedback') {
                tempFormData[currentProposalId].feedback = e.target.value;
            } else if (e.target.name === 'recommendation') {
                tempFormData[currentProposalId].recommendation = e.target.value;
            }
            
            // Rating is handled separately via the star rating system
            
            // Save to session storage (persists while browser is open)
            sessionStorage.setItem('tempFormData', JSON.stringify(tempFormData));
        }
    });

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
            
            // Save to localStorage
            localStorage.setItem('evaluations', JSON.stringify(evaluations));
            
            // Clear the temporary form data for this proposal
            if (tempFormData[currentProposalId]) {
                delete tempFormData[currentProposalId];
                sessionStorage.setItem('tempFormData', JSON.stringify(tempFormData));
            }
            
            // Show success message with feedback confirmation
            const feedbackPreview = feedback.length > 50 ? feedback.substring(0, 50) + '...' : feedback;
            alert(`Evaluation submitted successfully!\n\nFeedback saved: "${feedbackPreview}"\nRating: ${currentRating}/5\nRecommendation: ${recommendation.value}`);
            
            // Update the UI to reflect the new status
            const row = document.querySelector(`.evaluate-btn[data-proposal="${currentProposalId}"]`)?.closest('tr');
            if (row) {
                const statusCell = row.querySelector('.status-badge');
                const evalButton = row.querySelector('.evaluate-btn');
                
                // Update status
                const status = evaluations.find(e => e.proposalId === currentProposalId)?.status;
                if (status) {
                    // Update status badge
                    switch(status) {
                        case 'approved':
                            statusCell.textContent = 'Approved';
                            statusCell.className = 'status-badge status-approved';
                            break;
                        case 'revision':
                            statusCell.textContent = 'Needs Revision';
                            statusCell.className = 'status-badge status-revision';
                            break;
                        case 'rejected':
                            statusCell.textContent = 'Rejected';
                            statusCell.className = 'status-badge status-rejected';
                            break;
                    }
                    
                    // Update button
                    if (evalButton) {
                        evalButton.textContent = 'View';
                        evalButton.className = 'btn btn-outline view-btn';
                    }
                }
            }
            
            // Close the modal
            closeModal();
            
        } catch (error) {
            // If there's an error, restore from backup
            console.error("Error saving evaluation:", error);
            alert("There was an error saving your evaluation. Please try again.");
            localStorage.setItem('evaluations', evaluationsBackup);
        }
    });

    // Refresh button functionality with data verification
    refreshButton.addEventListener('click', function() {
        // Check if there's saved data first
        const savedData = localStorage.getItem('evaluations');
        if (savedData) {
            try {
                // Try to parse the data to verify it's valid JSON
                const parsedData = JSON.parse(savedData);
                if (Array.isArray(parsedData)) {
                    // Valid data, reload the page
                    window.location.reload();
                } else {
                    throw new Error("Saved data is not in expected format");
                }
            } catch (e) {
                console.error("Error parsing saved evaluations:", e);
                alert("There was an issue with the saved evaluation data. Restoring default data.");
                localStorage.removeItem('evaluations');
                window.location.reload();
            }
        } else {
            // No saved data, just reload
            window.location.reload();
        }
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

    // Check for unsaved form data on page load
    try {
        const savedTemp = sessionStorage.getItem('tempFormData');
        if (savedTemp) {
            tempFormData = JSON.parse(savedTemp);
        }
    } catch (e) {
        console.error("Error loading temporary form data:", e);
        sessionStorage.removeItem('tempFormData');
    }
    
    // Window beforeunload event - warn user if they have unsaved changes
    window.addEventListener('beforeunload', function(e) {
        // Check if there's any unsaved form data
        if (Object.keys(tempFormData).length > 0) {
            // Standard way to show confirmation dialog when leaving page
            const confirmationMessage = 'You have unsaved evaluation feedback. Are you sure you want to leave?';
            e.returnValue = confirmationMessage;
            return confirmationMessage;
        }
    });
});