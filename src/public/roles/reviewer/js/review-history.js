/**
 * review-history.js
 * Handles the functionality for the review history page in the CollabNexus Research Hub
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize review activity chart
    initReviewActivityChart();
    
    // Set up filtering for completed reviews
    setupFiltering();
    
    // Setup view report modal functionality
    setupReportViewers();
});

/**
 * Initialize the review activity chart
 */
function initReviewActivityChart() {
    const ctx = document.getElementById('reviewActivityChart').getContext('2d');
    
    // Sample data for the chart
    const reviewData = {
        labels: ['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May'],
        datasets: [
            {
                label: 'Reviews Completed',
                data: [3, 2, 5, 4, 6, 8, 7, 9, 10, 8, 11, 12],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                tension: 0.4,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)'
            },
            {
                label: 'Average Review Time (Days)',
                data: [8, 9, 7, 8, 7, 6, 6, 5, 6, 7, 6, 5],
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2,
                tension: 0.4,
                pointBackgroundColor: 'rgba(153, 102, 255, 1)',
                yAxisID: 'y1'
            }
        ]
    };
    
    // Create the chart
    const chart = new Chart(ctx, {
        type: 'line',
        data: reviewData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Reviews'
                    },
                    grid: {
                        drawBorder: false
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Days'
                    },
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        drawBorder: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Review Activity (Last 12 Months)'
                },
                tooltip: {
                    usePointStyle: true
                }
            }
        }
    });
    
    // Store chart reference for later use
    window.reviewChart = chart;
}

/**
 * Set up filtering functionality for completed reviews
 */
function setupFiltering() {
    const timeFilter = document.getElementById('time-filter');
    const statusFilter = document.getElementById('status-filter');
    const refreshBtn = document.querySelector('.refresh-btn');
    
    // Function to apply filters
    const applyFilters = () => {
        const timeValue = timeFilter.value;
        const statusValue = statusFilter.value;
        
        // In a real application, this would fetch filtered data from an API
        // For demonstration, we'll simulate this with a loading indicator
        
        // Show loading state
        const tbody = document.querySelector('.proposals-table tbody');
        tbody.innerHTML = '<tr><td colnav="6" class="loading-text">Loading filtered results...</td></tr>';
        
        // Simulate API delay
        setTimeout(() => {
            // Apply filters to mock data
            const filteredData = filterReviewData(getMockReviewData(), timeValue, statusValue);
            
            // Update table
            updateReviewTable(filteredData);
        }, 800);
    };
    
    // Set up event listeners
    timeFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    refreshBtn.addEventListener('click', applyFilters);
}

/**
 * Filter review data based on selected filters
 */
function filterReviewData(data, timeFilter, statusFilter) {
    let filteredData = [...data];
    
    // Apply time filter
    if (timeFilter !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (timeFilter) {
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
                break;
        }
        
        filteredData = filteredData.filter(item => {
            const reviewDate = new Date(item.reviewDate);
            return reviewDate >= startDate;
        });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
        filteredData = filteredData.filter(item => item.decision.toLowerCase() === statusFilter);
    }
    
    return filteredData;
}

/**
 * Update the review table with filtered data
 */
function updateReviewTable(data) {
    const tbody = document.querySelector('.proposals-table tbody');
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colnav = 6;
        emptyCell.textContent = 'No reviews match the selected filters';
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);
        return;
    }
    
    data.forEach(review => {
        const row = document.createElement('tr');
        
        // Title cell
        const titleCell = document.createElement('td');
        titleCell.textContent = review.title;
        row.appendChild(titleCell);
        
        // Researcher cell
        const researcherCell = document.createElement('td');
        researcherCell.textContent = review.researcher;
        row.appendChild(researcherCell);
        
        // Submitted date cell
        const submittedCell = document.createElement('td');
        submittedCell.textContent = formatDate(review.submittedDate);
        row.appendChild(submittedCell);
        
        // Review date cell
        const reviewDateCell = document.createElement('td');
        reviewDateCell.textContent = formatDate(review.reviewDate);
        row.appendChild(reviewDateCell);
        
        // Decision cell
        const decisionCell = document.createElement('td');
        const statusBadge = document.createElement('nav');
        statusBadge.className = `status-badge status-${review.decision.toLowerCase()}`;
        statusBadge.textContent = review.decision;
        decisionCell.appendChild(statusBadge);
        row.appendChild(decisionCell);
        
        // Actions cell
        const actionsCell = document.createElement('td');
        const viewButton = document.createElement('button');
        viewButton.className = 'btn-outline view-btn';
        viewButton.textContent = 'View Report';
        viewButton.setAttribute('data-proposal', review.id);
        actionsCell.appendChild(viewButton);
        row.appendChild(actionsCell);
        
        tbody.appendChild(row);
    });
    
    // Reattach event listeners to new buttons
    setupReportViewers();
}

/**
 * Set up functionality for viewing review reports
 */
function setupReportViewers() {
    const viewButtons = document.querySelectorAll('.view-btn');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const proposalId = button.getAttribute('data-proposal');
            openReportModal(proposalId);
        });
    });
}

/**
 * Format criterion name for display
 */
function formatCriterionName(criterion) {
    // Convert camelCase to Title Case with spaces
    return criterion
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
}

/**
 * Format date to readable string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Open a modal to display the review report
 */
function openReportModal(proposalId) {
    // Get review data (in a real app, this would be fetched from an API)
    const reviewData = getMockReviewReportData(proposalId);
    
    // Create modal elements
    const modalOverlay = document.createElement('section');
    modalOverlay.className = 'modal-overlay';
    
    const modalContent = document.createElement('article');
    modalContent.className = 'modal-content report-modal';
    
    // Create modal header
    const modalHeader = document.createElement('header');
    modalHeader.className = 'modal-header';
    
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = `Review Report: ${reviewData.title}`;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'modal-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        modalOverlay.remove();
    });
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    // Create modal body
    const modalBody = document.createElement('section');
    modalBody.className = 'modal-body';
    
    // Meta information
    const metaInfo = document.createElement('section');
    metaInfo.className = 'report-meta';
    metaInfo.innerHTML = `
        <p><strong>Researcher:</strong> ${reviewData.researcher}</p>
        <p><strong>Submitted:</strong> ${formatDate(reviewData.submittedDate)}</p>
        <p><strong>Reviewed:</strong> ${formatDate(reviewData.reviewDate)}</p>
        <p><strong>Decision:</strong> <nav class="status-badge status-${reviewData.decision.toLowerCase()}">${reviewData.decision}</nav></p>
    `;
    
    // Scores
    const scoresSection = document.createElement('section');
    scoresSection.className = 'report-scores';
    
    const scoresTitle = document.createElement('h3');
    scoresTitle.textContent = 'Evaluation Scores';
    
    const scoresList = document.createElement('ul');
    scoresList.className = 'scores-list';
    
    Object.entries(reviewData.scores).forEach(([criterion, score]) => {
        const scoreItem = document.createElement('li');
        
        const criterionName = document.createElement('nav');
        criterionName.className = 'criterion-name';
        criterionName.textContent = formatCriterionName(criterion);
        
        const scoreValue = document.createElement('nav');
        scoreValue.className = 'score-value';
        
        // Create score stars
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('i');
            star.className = i <= score ? 'fas fa-star' : 'far fa-star';
            scoreValue.appendChild(star);
        }
        
        scoreItem.appendChild(criterionName);
        scoreItem.appendChild(scoreValue);
        scoresList.appendChild(scoreItem);
    });
    
    scoresSection.appendChild(scoresTitle);
    scoresSection.appendChild(scoresList);
    
    // Feedback
    const feedbackSection = document.createElement('section');
    feedbackSection.className = 'report-feedback';
    
    const feedbackTitle = document.createElement('h3');
    feedbackTitle.textContent = 'Reviewer Feedback';
    
    const feedbackText = document.createElement('p');
    feedbackText.textContent = reviewData.feedback;
    
    feedbackSection.appendChild(feedbackTitle);
    feedbackSection.appendChild(feedbackText);
    
    // Add all sections to modal body
    modalBody.appendChild(metaInfo);
    modalBody.appendChild(scoresSection);
    modalBody.appendChild(feedbackSection);
    
    // Create modal footer
    const modalFooter = document.createElement('footer');
    modalFooter.className = 'modal-footer';
    
    const printButton = document.createElement('button');
    printButton.className = 'btn-outline';
    printButton.innerHTML = '<i class="fas fa-print"></i> Print Report';
    printButton.addEventListener('click', () => {
        window.print();
    });
    
    const closeModalButton = document.createElement('button');
    closeModalButton.className = 'btn-primary';
    closeModalButton.textContent = 'Close';
    closeModalButton.addEventListener('click', () => {
        modalOverlay.remove();
    });
    
    modalFooter.appendChild(printButton);
    modalFooter.appendChild(closeModalButton);
    
    // Assemble modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    modalOverlay.appendChild(modalContent);
    
    // Add modal to document
    document.body.appendChild(modalOverlay);
    
    // Add event listener to close modal when clicking outside
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
        }
    });
    
    // Prevent scrolling on body when modal is open
    document.body.style.overflow = 'hidden';
    
    // Restore scrolling when modal closes
    closeButton.addEventListener('click', () => {
        document.body.style.overflow = '';
    });
    closeModalButton.addEventListener('click', () => {
        document.body.style.overflow = '';
    });
}

/**
 * Mock review data for demonstration purposes
 * In a real application, this would be fetched from an API
 */
function getMockReviewData() {
    return [
        {
            id: 'climate-change',
            title: 'Climate Change Impact on Marine Ecosystems',
            researcher: 'Prof. James Wilson',
            submittedDate: '2025-04-25T10:15:00',
            reviewDate: '2025-04-30T14:20:00',
            decision: 'Approved'
        },
        {
            id: 'neural-networks',
            title: 'Neural Networks for Disease Detection',
            researcher: 'Dr. Aisha Patel',
            submittedDate: '2025-04-18T08:30:00',
            reviewDate: '2025-04-24T11:45:00',
            decision: 'Revision'
        },
        {
            id: 'sustainable-materials',
            title: 'Sustainable Materials for Construction',
            researcher: 'Dr. Marcus Lee',
            submittedDate: '2025-04-15T09:20:00',
            reviewDate: '2025-04-20T16:10:00',
            decision: 'Approved'
        },
        {
            id: 'microplastics',
            title: 'Effects of Microplastics on Soil Health',
            researcher: 'Dr. Lisa Morgan',
            submittedDate: '2025-04-10T11:05:00',
            reviewDate: '2025-04-17T09:30:00',
            decision: 'Rejected'
        },
        {
            id: 'urban-planning',
            title: 'Urban Planning for Climate Resilience',
            researcher: 'Prof. David Ng',
            submittedDate: '2025-04-05T14:40:00',
            reviewDate: '2025-04-12T13:15:00',
            decision: 'Approved'
        },
        {
            id: 'quantum-computing',
            title: 'Quantum Computing in Financial Modeling',
            researcher: 'Dr. Elena Sorokina',
            submittedDate: '2025-03-28T10:30:00',
            reviewDate: '2025-04-05T15:20:00',
            decision: 'Approved'
        },
        {
            id: 'ai-ethics',
            title: 'Ethical Frameworks for AI Decision Systems',
            researcher: 'Prof. Michael Chang',
            submittedDate: '2025-03-22T09:15:00',
            reviewDate: '2025-03-30T11:40:00',
            decision: 'Revision'
        },
        {
            id: 'renewable-energy',
            title: 'Renewable Energy Integration in Urban Grids',
            researcher: 'Dr. Sarah Johnson',
            submittedDate: '2025-03-15T13:45:00',
            reviewDate: '2025-03-25T10:10:00',
            decision: 'Approved'
        },
        {
            id: 'vaccine-delivery',
            title: 'Novel Vaccine Delivery Systems',
            researcher: 'Dr. Raj Patel',
            submittedDate: '2025-03-10T08:50:00',
            reviewDate: '2025-03-18T14:30:00',
            decision: 'Rejected'
        },
        {
            id: 'biosectionersity',
            title: 'Biosectionersity Conservation Strategies',
            researcher: 'Prof. Laura Martinez',
            submittedDate: '2025-03-05T11:25:00',
            reviewDate: '2025-03-14T09:15:00',
            decision: 'Approved'
        }
    ];
}

/**
 * Mock review report data for a specific proposal
 * In a real application, this would be fetched from an API
 */
function getMockReviewReportData(proposalId) {
    // Base review data - find the basic info first
    const baseReview = getMockReviewData().find(review => review.id === proposalId);
    if (!baseReview) return null;
    
    // Detailed reports by ID
    const detailedReports = {
        'climate-change': {
            scores: {
                scientificMerit: 5,
                methodology: 4,
                feasibility: 5,
                impact: 5
            },
            feedback: `This proposal presents a well-conceived and timely study on climate change impacts on marine ecosystems. The approach is comprehensive, combining field observations with advanced modeling techniques. The multi-disciplinary team brings excellent expertise to address the complex questions posed.

The methodology is sound, though I would suggest adding more details on the statistical analysis of temporal data series. The timeline is realistic and the budget justification is thorough.

This research addresses a critical knowledge gap and has significant potential for informing marine conservation policies. I strongly recommend approval of this proposal.`
        },
        'neural-networks': {
            scores: {
                scientificMerit: 4,
                methodology: 3,
                feasibility: 4,
                impact: 5
            },
            feedback: `The proposal on neural networks for disease detection shows significant promise and addresses an important healthcare challenge. The scientific foundation is strong and the potential impact is substantial.

However, there are several methodological concerns that need addressing:
1. The validation approach lacks sufficient control for potential biases in the training dataset
2. The explanation of how the system will handle rare disease presentations is inadequate
3. More detail is needed on patient privacy safeguards in the data collection phase

I recommend revisions to address these concerns before approval.`
        },
        'sustainable-materials': {
            scores: {
                scientificMerit: 5,
                methodology: 5,
                feasibility: 4,
                impact: 4
            },
            feedback: `This proposal on sustainable materials for construction demonstrates exceptional scientific rigor and a clear methodology. The research team has extensive experience in materials science and has outlined a comprehensive testing protocol.

The work builds appropriately on existing literature while exploring innovative approaches to improving durability and reducing environmental impact. The timeline and budget are well-justified.

While there are some minor concerns about scalability beyond the laboratory phase, the potential contribution to sustainable construction practices is significant. I recommend approval with enthusiasm.`
        },
        'microplastics': {
            scores: {
                scientificMerit: 3,
                methodology: 2,
                feasibility: 2,
                impact: 3
            },
            feedback: `While the topic of microplastics in soil health is undeniably important, this proposal has significant weaknesses that prevent me from recommending approval. The scientific foundation lacks depth, with minimal engagement with recent literature on the subject.

The methodology has several critical flaws:
- The sampling design is inadequate to capture spatial variability
- The analytical methods proposed are outdated and lack sensitivity
- There is no clear plan for controlling confounding variables

The budget appears inflated for the scope of work, and the timeline is unrealistic given the complexity of the analyses required. I recommend rejection but would encourage a substantially revised submission in the future.`
        },
        'urban-planning': {
            scores: {
                scientificMerit: 4,
                methodology: 5,
                feasibility: 4,
                impact: 5
            },
            feedback: `This urban planning proposal demonstrates excellent scientific merit and exceptional methodology. The mixed-methods approach combining quantitative climate modeling with qualitative community engagement is particularly strong.

The research addresses a critical need in urban adaptation to climate change, with clear pathways to implementation through partnerships with local governments. The interdisciplinary team is well-qualified to execute the project.

I particularly appreciate the attention to equity considerations in climate resilience planning. The budget is appropriate for the scope of work. I strongly recommend approval of this well-crafted proposal.`
        }
    };
    
    // For IDs without specific detailed reports, generate a generic one
    const defaultReport = {
        scores: {
            scientificMerit: Math.floor(Math.random() * 3) + 3, // 3-5
            methodology: Math.floor(Math.random() * 3) + 3,    // 3-5
            feasibility: Math.floor(Math.random() * 3) + 2,     // 2-4
            impact: Math.floor(Math.random() * 3) + 3          // 3-5
        },
        feedback: `This is a standard review report for proposal ID ${proposalId}. In a real application, this would contain detailed feedback on the proposal's strengths and weaknesses, methodological considerations, and suggestions for improvement.

The proposal shows good potential but would benefit from additional refinement in certain areas. The timeline and budget appear reasonable for the scope of work proposed.`
    };
    
    // Combine base review with detailed report
    return {
        ...baseReview,
        ...((detailedReports[proposalId]) ? detailedReports[proposalId] : defaultReport)
    };
}