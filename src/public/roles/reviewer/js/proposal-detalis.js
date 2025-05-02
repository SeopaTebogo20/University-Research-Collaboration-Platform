document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const evaluationModal = document.querySelector('.evaluation-modal');
    const editButtons = document.querySelectorAll('.edit-btn');
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
    let tempFormData = {};

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

    // Load evaluations from localStorage or data.json
    let evaluations = [];
    loadEvaluations().then(loadedEvaluations => {
        evaluations = loadedEvaluations;
        initializeUI();
    });

    // Toast notification system
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = '';
        if (type === 'success') {
            icon = '<i class="fas fa-check-circle" style="margin-right: 8px;"></i>';
        } else if (type === 'error') {
            icon = '<i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i>';
        } else if (type === 'warning') {
            icon = '<i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>';
        } else {
            icon = '<i class="fas fa-info-circle" style="margin-right: 8px;"></i>';
        }
        
        const contentContainer = document.createElement('div');
        contentContainer.style.flex = '1';
        contentContainer.innerHTML = icon + message;
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            margin-left: 8px;
            padding: 0 4px;
        `;
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });
        
        toast.appendChild(contentContainer);
        toast.appendChild(closeBtn);
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode === toastContainer) {
                toast.remove();
            }
        }, 3000);
    }

    // Function to load evaluations from localStorage or data.json
    async function loadEvaluations() {
        try {
            // First try to load from localStorage
            const saved = localStorage.getItem('evaluations');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
            
            // If not in localStorage, try to load from data.json
            const response = await fetch('data.json');
            if (response.ok) {
                const data = await response.json();
                if (data.evaluations && Array.isArray(data.evaluations)) {
                    // Save to localStorage for future use
                    localStorage.setItem('evaluations', JSON.stringify(data.evaluations));
                    return data.evaluations;
                }
            }
        } catch (e) {
            console.error("Error loading evaluations:", e);
            showToast("Error loading saved evaluations. Using default data.", "error");
        }

        // Default evaluations if none found or error occurred
        return [
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
    }

    // Initialize the UI with saved evaluations
    function initializeUI() {
        evaluations.forEach(evaluation => {
            const row = document.querySelector(`.edit-btn[data-proposal="${evaluation.proposalId}"]`)?.closest('tr');
            if (row) {
                const statusCell = row.querySelector('.status-badge');
                let feedbackCell = row.querySelector('.feedback-preview');
                
                if (!feedbackCell) {
                    feedbackCell = document.createElement('td');
                    feedbackCell.className = 'feedback-preview';
                    const actionCell = row.querySelector('td:last-child');
                    row.insertBefore(feedbackCell, actionCell);
                }
                
                feedbackCell.textContent = evaluation.feedback 
                    ? (evaluation.feedback.length > 50 
                        ? evaluation.feedback.substring(0, 50) + '...' 
                        : evaluation.feedback)
                    : "";
                
                if (statusCell) {
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
                        default:
                            statusCell.textContent = 'Pending';
                            statusCell.className = 'status-badge status-pending';
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
        document.getElementById('feedback').readOnly = false;
        document.querySelectorAll('input[name="recommendation"]').forEach(radio => {
            radio.disabled = false;
        });
        ratingStars.forEach(star => {
            star.style.pointerEvents = 'auto';
        });
    }

    // Handle star rating system
    function setupStarRating() {
        ratingStars.forEach((star, index) => {
            star.addEventListener('mouseover', () => {
                if (star.style.pointerEvents !== 'none') {
                    for (let i = 0; i <= index; i++) {
                        ratingStars[i].querySelector('i').classList.add('hovered');
                    }
                }
            });
            
            star.addEventListener('mouseout', () => {
                ratingStars.forEach(s => {
                    const icon = s.querySelector('i');
                    if (icon) {
                        icon.classList.remove('hovered');
                    }
                });
            });
            
            star.addEventListener('click', () => {
                if (star.style.pointerEvents !== 'none') {
                    currentRating = parseInt(star.getAttribute('data-value'));
                    document.getElementById('rating-value').value = currentRating;
                    
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
                    
                    document.getElementById('rating-display').textContent = currentRating + '/5';
                    updateTempFormData('rating', currentRating);
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

    // Update temporary form data
    function updateTempFormData(field, value) {
        if (currentProposalId) {
            tempFormData[currentProposalId] = tempFormData[currentProposalId] || {};
            tempFormData[currentProposalId][field] = value;
            sessionStorage.setItem('tempFormData', JSON.stringify(tempFormData));
        }
    }

    // Initialize star rating system
    setupStarRating();

    // Open modal when edit button is clicked
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const proposalId = this.getAttribute('data-proposal');
            currentProposalId = proposalId;
            
            const existingEvaluation = evaluations.find(e => e.proposalId === proposalId);
            const proposal = proposals[proposalId];
            
            proposalTitle.textContent = proposal.title;
            proposalAuthor.textContent = proposal.author;
            proposalDate.textContent = proposal.date;
            
            evaluationForm.reset();
            resetStarRating();
            
            if (existingEvaluation) {
                document.getElementById('feedback').value = existingEvaluation.feedback || '';
                
                if (existingEvaluation.rating > 0) {
                    currentRating = existingEvaluation.rating;
                    document.getElementById('rating-value').value = currentRating;
                    
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
            
            ratingStars.forEach(star => {
                star.style.pointerEvents = 'auto';
            });
            
            const submitBtn = document.querySelector('.modal-footer .btn-primary');
            submitBtn.textContent = 'Save Changes';
            submitBtn.type = 'submit';
            
            showModal();
        });
    });

    // Close modal when X button is clicked
    closeModalButton.addEventListener('click', closeModal);

    // Close modal when Cancel button is clicked
    cancelButton.addEventListener('click', () => {
        const hasUnsavedChanges = tempFormData[currentProposalId] && Object.keys(tempFormData[currentProposalId]).length > 0;
        
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to discard them?')) {
                delete tempFormData[currentProposalId];
                sessionStorage.setItem('tempFormData', JSON.stringify(tempFormData));
                closeModal();
            }
        } else {
            closeModal();
        }
    });

    // Try to load unsaved form data
    try {
        const savedTemp = sessionStorage.getItem('tempFormData');
        if (savedTemp) {
            tempFormData = JSON.parse(savedTemp);
        }
    } catch (e) {
        console.error("Error loading temporary form data:", e);
        sessionStorage.removeItem('tempFormData');
        tempFormData = {};
    }
    
    // Monitor for form changes and save to temporary storage
    evaluationForm.addEventListener('input', function(e) {
        if (currentProposalId) {
            if (e.target.id === 'feedback') {
                updateTempFormData('feedback', e.target.value);
            } else if (e.target.name === 'recommendation') {
                updateTempFormData('recommendation', e.target.value);
            }
        }
    });

    // Handle form submission
    evaluationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const feedback = document.getElementById('feedback').value;
        const recommendation = document.querySelector('input[name="recommendation"]:checked');
        
        if (!feedback) {
            showToast('Please provide feedback', 'error');
            return;
        }
        
        if (currentRating === 0) {
            showToast('Please provide a rating', 'error');
            return;
        }
        
        if (!recommendation) {
            showToast('Please select a recommendation', 'error');
            return;
        }
        
        const evaluationsBackup = JSON.stringify(evaluations);
        
        try {
            const evaluationIndex = evaluations.findIndex(e => e.proposalId === currentProposalId);
            const status = recommendation.value === 'approve' ? 'approved' : 
                          recommendation.value === 'revision' ? 'revision' : 'rejected';
                          
            if (evaluationIndex !== -1) {
                evaluations[evaluationIndex] = {
                    ...evaluations[evaluationIndex],
                    feedback,
                    rating: currentRating,
                    recommendation: recommendation.value,
                    status
                };
            } else {
                evaluations.push({
                    proposalId: currentProposalId,
                    title: proposalTitle.textContent,
                    author: proposalAuthor.textContent,
                    date: proposalDate.textContent,
                    feedback,
                    rating: currentRating,
                    recommendation: recommendation.value,
                    status
                });
            }
            
            localStorage.setItem('evaluations', JSON.stringify(evaluations));
            
            try {
                const response = await fetch('/api/save-evaluations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ evaluations })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to save to server');
                }
            } catch (serverError) {
                console.error("Error saving to server:", serverError);
            }
            
            if (tempFormData[currentProposalId]) {
                delete tempFormData[currentProposalId];
                sessionStorage.setItem('tempFormData', JSON.stringify(tempFormData));
            }
            
            initializeUI();
            showToast('Evaluation saved successfully!', 'success');
            closeModal();
            
        } catch (error) {
            console.error("Error saving evaluation:", error);
            showToast('There was an error saving your evaluation. Please try again.', 'error');
            localStorage.setItem('evaluations', evaluationsBackup);
        }
    });

    // Refresh button functionality
    refreshButton.addEventListener('click', async function() {
        try {
            evaluations = await loadEvaluations();
            initializeUI();
            showToast('Data refreshed successfully', 'info');
        } catch (error) {
            console.error("Error refreshing data:", error);
            showToast('Error refreshing data', 'error');
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
    
    // Window beforeunload event
    window.addEventListener('beforeunload', function(e) {
        if (Object.keys(tempFormData).length > 0) {
            const confirmationMessage = 'You have unsaved evaluation feedback. Are you sure you want to leave?';
            e.returnValue = confirmationMessage;
            return confirmationMessage;
        }
    });
});