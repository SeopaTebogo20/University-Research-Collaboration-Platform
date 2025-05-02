/**
 * proposal-details.js
 * Handles the functionality for the proposal details page in the CollabNexus Research Hub
 * Updated for Sprint 3 requirements
 */

document.addEventListener('DOMContentLoaded', () => {
    // Load proposal data
    loadProposalData();
    
    // Set up tab navigation
    setupTabNavigation();
    
    // Set up form handling
    setupReviewForm();
    
    // Set up evaluate button
    setupEvaluateButton();
});

/**
 * Load and display proposal data
 */
function loadProposalData() {
    // Get proposal data (from API in production)
    const proposalData = getMockProposalData();
    
    // Populate basic proposal info
    document.getElementById('details-title').textContent = proposalData.title;
    document.getElementById('details-author').textContent = proposalData.author;
    document.getElementById('details-date').textContent = formatDate(proposalData.submissionDate);
    document.getElementById('proposal-abstract').textContent = proposalData.abstract;
    
    // Populate research areas
    populateResearchAreas(proposalData.researchAreas);
    
    // Populate methodology
    document.getElementById('methodology-content').innerHTML = proposalData.methodology;
    
    // Populate objectives
    populateObjectives(proposalData.objectives);
    
    // Populate timeline
    populateTimeline(proposalData.timeline);
    
    // Populate budget
    populateBudget(proposalData.budget);
    
    // Populate attachments
    populateAttachments(proposalData.attachments);
}

/**
 * Populate research areas section
 */
function populateResearchAreas(areas) {
    const researchTags = document.getElementById('research-tags');
    researchTags.innerHTML = '';
    areas.forEach(area => {
        const li = document.createElement('li');
        li.textContent = area;
        researchTags.appendChild(li);
    });
}

/**
 * Populate objectives list
 */
function populateObjectives(objectives) {
    const objectivesList = document.getElementById('objectives-list');
    objectivesList.innerHTML = '';
    objectives.forEach(objective => {
        const li = document.createElement('li');
        li.textContent = objective;
        objectivesList.appendChild(li);
    });
}

/**
 * Populate timeline table
 */
function populateTimeline(timeline) {
    const timelineContent = document.getElementById('timeline-content');
    timelineContent.innerHTML = '';
    timeline.forEach(phase => {
        const row = document.createElement('tr');
        
        const phaseCell = document.createElement('td');
        phaseCell.textContent = phase.phase;
        row.appendChild(phaseCell);
        
        const startCell = document.createElement('td');
        startCell.textContent = formatDate(phase.startDate);
        row.appendChild(startCell);
        
        const endCell = document.createElement('td');
        endCell.textContent = formatDate(phase.endDate);
        row.appendChild(endCell);
        
        const deliverablesCell = document.createElement('td');
        deliverablesCell.textContent = phase.deliverables;
        row.appendChild(deliverablesCell);
        
        timelineContent.appendChild(row);
    });
}

/**
 * Populate budget table
 */
function populateBudget(budget) {
    const budgetContent = document.getElementById('budget-content');
    budgetContent.innerHTML = '';
    budget.forEach(item => {
        const row = document.createElement('tr');
        
        const categoryCell = document.createElement('td');
        categoryCell.textContent = item.category;
        row.appendChild(categoryCell);
        
        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = item.description;
        row.appendChild(descriptionCell);
        
        const amountCell = document.createElement('td');
        amountCell.textContent = formatCurrency(item.amount);
        row.appendChild(amountCell);
        
        budgetContent.appendChild(row);
    });
}

/**
 * Populate attachments list
 */
function populateAttachments(attachments) {
    const attachmentsList = document.getElementById('attachments-list');
    attachmentsList.innerHTML = '';
    attachments.forEach(attachment => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = attachment.url;
        link.textContent = attachment.name;
        link.setAttribute('download', '');
        
        const icon = document.createElement('i');
        icon.className = getFileIconClass(attachment.type);
        link.prepend(icon);
        
        const fileSize = document.createElement('span');
        fileSize.className = 'file-size';
        fileSize.textContent = attachment.size;
        
        li.appendChild(link);
        li.appendChild(fileSize);
        attachmentsList.appendChild(li);
    });
}

/**
 * Set up tab navigation
 */
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and content
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

/**
 * Set up evaluate button
 */
function setupEvaluateButton() {
    const evaluateBtn = document.getElementById('evaluate-btn');
    evaluateBtn.addEventListener('click', () => {
        document.querySelector('.evaluation-sidebar').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    });
}

/**
 * Set up review form handling
 */
function setupReviewForm() {
    const saveDraftBtn = document.querySelector('.save-draft-btn');
    const submitReviewBtn = document.querySelector('.submit-review-btn');
    
    saveDraftBtn.addEventListener('click', (e) => {
        e.preventDefault();
        saveReviewDraft();
    });
    
    submitReviewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        submitReview();
    });
    
    loadReviewDraft();
}

/**
 * Save review draft
 */
function saveReviewDraft() {
    const reviewData = collectReviewData();
    
    // In production, this would be sent to a server
    localStorage.setItem('reviewDraft', JSON.stringify(reviewData));
    
    showNotification('Draft saved successfully', 'success');
}

/**
 * Submit final review
 */
function submitReview() {
    const reviewData = collectReviewData();
    
    if (!validateReviewForm(reviewData)) {
        return;
    }
    
    if (confirm('Are you sure you want to submit this review? This action cannot be undone.')) {
        // Simulate API call
        setTimeout(() => {
            localStorage.removeItem('reviewDraft');
            showNotification('Review submitted successfully', 'success');
            
            setTimeout(() => {
                window.location.href = 'reviewer-dashboard.html';
            }, 2000);
        }, 1000);
    }
}

/**
 * Collect review form data
 */
function collectReviewData() {
    return {
        criteria: {
            scientificMerit: document.querySelector('input[name="scientific-merit"]:checked')?.value,
            methodology: document.querySelector('input[name="methodology"]:checked')?.value,
            feasibility: document.querySelector('input[name="feasibility"]:checked')?.value,
            impact: document.querySelector('input[name="impact"]:checked')?.value
        },
        feedback: document.getElementById('reviewer-feedback').value,
        recommendation: document.querySelector('input[name="recommendation"]:checked')?.value,
        proposalId: getProposalIdFromUrl(),
        timestamp: new Date().toISOString()
    };
}

/**
 * Validate review form
 */
function validateReviewForm(reviewData) {
    const errors = [];
    
    // Validate ratings
    if (!reviewData.criteria.scientificMerit) errors.push('Please rate Scientific Merit');
    if (!reviewData.criteria.methodology) errors.push('Please rate Methodology');
    if (!reviewData.criteria.feasibility) errors.push('Please rate Feasibility');
    if (!reviewData.criteria.impact) errors.push('Please rate Impact');
    
    // Validate feedback
    if (!reviewData.feedback || reviewData.feedback.trim().length < 50) {
        errors.push('Please provide detailed feedback (minimum 50 characters)');
    }
    
    // Validate recommendation
    if (!reviewData.recommendation) {
        errors.push('Please select a final recommendation');
    }
    
    // Show errors if any
    if (errors.length > 0) {
        const errorMessage = 'Please correct the following issues:\n• ' + errors.join('\n• ');
        alert(errorMessage);
        return false;
    }
    
    return true;
}

/**
 * Load review draft
 */
function loadReviewDraft() {
    const savedDraft = localStorage.getItem('reviewDraft');
    if (!savedDraft) return;
    
    try {
        const draftData = JSON.parse(savedDraft);
        
        // Only load if it's for the current proposal
        if (draftData.proposalId !== getProposalIdFromUrl()) return;
        
        // Populate form fields
        if (draftData.criteria.scientificMerit) {
            document.querySelector(`input[name="scientific-merit"][value="${draftData.criteria.scientificMerit}"]`).checked = true;
        }
        if (draftData.criteria.methodology) {
            document.querySelector(`input[name="methodology"][value="${draftData.criteria.methodology}"]`).checked = true;
        }
        if (draftData.criteria.feasibility) {
            document.querySelector(`input[name="feasibility"][value="${draftData.criteria.feasibility}"]`).checked = true;
        }
        if (draftData.criteria.impact) {
            document.querySelector(`input[name="impact"][value="${draftData.criteria.impact}"]`).checked = true;
        }
        if (draftData.feedback) {
            document.getElementById('reviewer-feedback').value = draftData.feedback;
        }
        if (draftData.recommendation) {
            document.querySelector(`input[name="recommendation"][value="${draftData.recommendation}"]`).checked = true;
        }
        
        showNotification('Draft review loaded', 'info');
    } catch (error) {
        console.error('Error loading review draft:', error);
    }
}

/**
 * Get proposal ID from URL
 */
function getProposalIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || 'demo-proposal';
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('section');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    const notification = document.createElement('article');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => notification.remove());
    notification.appendChild(closeBtn);
    
    notificationContainer.appendChild(notification);
    
    setTimeout(() => notification.remove(), 5000);
}

/**
 * Format date
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * Get file icon class
 */
function getFileIconClass(fileType) {
    const iconMap = {
        'pdf': 'fas fa-file-pdf',
        'doc': 'fas fa-file-word',
        'docx': 'fas fa-file-word',
        'xls': 'fas fa-file-excel',
        'xlsx': 'fas fa-file-excel',
        'ppt': 'fas fa-file-powerpoint',
        'pptx': 'fas fa-file-powerpoint',
        'jpg': 'fas fa-file-image',
        'jpeg': 'fas fa-file-image',
        'png': 'fas fa-file-image',
        'zip': 'fas fa-file-archive',
        'txt': 'fas fa-file-alt'
    };
    
    return iconMap[fileType.toLowerCase()] || 'fas fa-file';
}

/**
 * Mock proposal data
 */
function getMockProposalData() {
    return {
        id: 'demo-proposal',
        title: 'Quantum Computing Applications in Climate Modeling',
        author: 'Dr. Sophia Rodriguez',
        submissionDate: '2025-04-20T12:30:00',
        abstract: 'This study proposes a novel approach to climate modeling using quantum computing algorithms. By leveraging quantum parallelism, we aim to develop more accurate and computationally efficient models for predicting climate change effects at regional scales.',
        methodology: `<p>Our research methodology combines theoretical quantum algorithm development with practical implementation on existing quantum processing units (QPUs). The research will proceed through four distinct phases:</p>
                     <p><strong>Phase 1:</strong> Theoretical framework development for quantum-accelerated climate models.</p>
                     <p><strong>Phase 2:</strong> Algorithm development and simulation on classical quantum simulators.</p>
                     <p><strong>Phase 3:</strong> Implementation and testing on available quantum hardware platforms.</p>
                     <p><strong>Phase 4:</strong> Comparative analysis between classical and quantum approaches.</p>`,
        objectives: [
            'Develop quantum algorithms for atmospheric models',
            'Achieve 20% improvement in computational efficiency',
            'Demonstrate increased spatial resolution',
            'Create framework for environmental modeling challenges'
        ],
        researchAreas: [
            "Quantum Computing",
            "Climate Modeling", 
            "Environmental Science"
        ],
        timeline: [
            {
                phase: 'Theoretical Framework',
                startDate: '2025-08-01',
                endDate: '2025-11-30',
                deliverables: 'Framework documentation'
            },
            {
                phase: 'Algorithm Development',
                startDate: '2025-12-01',
                endDate: '2026-04-30',
                deliverables: 'Simulation results'
            }
        ],
        budget: [
            {
                category: 'Personnel',
                description: 'Research team',
                amount: 285000
            },
            {
                category: 'Equipment',
                description: 'Computing resources',
                amount: 120000
            }
        ],
        attachments: [
            {
                name: 'Full Research Proposal.pdf',
                url: '#',
                type: 'pdf',
                size: '2.4 MB'
            },
            {
                name: 'Preliminary Results.xlsx',
                url: '#',
                type: 'xlsx',
                size: '1.1 MB'
            }
        ]
    };
}