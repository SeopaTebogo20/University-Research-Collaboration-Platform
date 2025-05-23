
document.addEventListener('DOMContentLoaded', () => {
    // API URL configuration - supports both local development and production
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' 
        : 'https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net/api';
    
    const PROJECTS_API = `${API_BASE_URL}/projects`;
    const FUNDING_API = `${API_BASE_URL}/funding`;
    
    // DOM Elements
    const projectsGrid = document.getElementById('projects-grid');
    const projectDetailsSection = document.getElementById('project-details-section');
    const projectTitle = document.getElementById('project-title');
    const addFundingBtn = document.getElementById('add-funding-btn');
    const backToOverviewBtn = document.getElementById('back-to-overview-btn');
    const fundingModal = document.getElementById('funding-modal');
    const deleteModal = document.getElementById('delete-modal');
    const fundingForm = document.getElementById('funding-form');
    const fundingStatusFilter = document.getElementById('status-filter');
    const exportOverviewBtn = document.getElementById('export-overview-btn');
    const exportDetailsBtn = document.getElementById('export-details-btn');
    
    // Global variables
    let currentProjectId = null;
    let currentProjectData = null;
    let fundingRecords = [];
    let fundingPieChart = null;
    let categoryBudgetChart = null;
    
    // Initialize the app
    init();
    
    function init() {
        // Set up event listeners
        setupEventListeners();
        
        // Load all projects
        loadProjects();
    }
    
    function setupEventListeners() {
        // Add funding button
        addFundingBtn.addEventListener('click', openAddFundingModal);
        
        // Back to overview button
        backToOverviewBtn.addEventListener('click', showProjectsOverview);
        
        // Funding form submission
        fundingForm.addEventListener('submit', handleFundingFormSubmit);
        
        // Status filter change
        fundingStatusFilter.addEventListener('change', filterFundingRecords);
        
        // Close modal buttons
        document.querySelectorAll('.close, #cancel-funding-btn, #cancel-delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                fundingModal.style.display = 'none';
                deleteModal.style.display = 'none';
            });
        });
        
        // Delete confirmation button
        document.getElementById('confirm-delete-btn').addEventListener('click', deleteFundingRecord);
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === fundingModal) {
                fundingModal.style.display = 'none';
            } else if (e.target === deleteModal) {
                deleteModal.style.display = 'none';
            }
        });
        
        // Export buttons
        exportOverviewBtn.addEventListener('click', () => exportToPDF('overview'));
        exportDetailsBtn.addEventListener('click', () => exportToPDF('details'));
        
        // Add event listeners for budget calculation
        document.querySelectorAll('#funding-personnel-budget, #funding-equipment-budget, #funding-consumables-budget, #funding-other-budget, ' +
                                 '#funding-personnel-spent, #funding-equipment-spent, #funding-consumables-spent, #funding-other-spent').forEach(input => {
            input.addEventListener('input', calculateFundingTotals);
        });
    }
    
    function calculateFundingTotals() {
        // Calculate total budget
        const personnelBudget = parseFloat(document.getElementById('funding-personnel-budget').value) || 0;
        const equipmentBudget = parseFloat(document.getElementById('funding-equipment-budget').value) || 0;
        const consumablesBudget = parseFloat(document.getElementById('funding-consumables-budget').value) || 0;
        const otherBudget = parseFloat(document.getElementById('funding-other-budget').value) || 0;
        
        const totalBudget = personnelBudget + equipmentBudget + consumablesBudget + otherBudget;
        document.getElementById('funding-amount').value = totalBudget.toFixed(2);
        
        // Calculate total spent
        const personnelSpent = parseFloat(document.getElementById('funding-personnel-spent').value) || 0;
        const equipmentSpent = parseFloat(document.getElementById('funding-equipment-spent').value) || 0;
        const consumablesSpent = parseFloat(document.getElementById('funding-consumables-spent').value) || 0;
        const otherSpent = parseFloat(document.getElementById('funding-other-spent').value) || 0;
        
        const totalSpent = personnelSpent + equipmentSpent + consumablesSpent + otherSpent;
        document.getElementById('funding-spent').value = totalSpent.toFixed(2);
        
        // Validate that spent doesn't exceed budget in each category
        validateCategorySpending('personnel', personnelBudget, personnelSpent);
        validateCategorySpending('equipment', equipmentBudget, equipmentSpent);
        validateCategorySpending('consumables', consumablesBudget, consumablesSpent);
        validateCategorySpending('other', otherBudget, otherSpent);
    }
    
    function validateCategorySpending(category, budget, spent) {
        const spentInput = document.getElementById(`funding-${category}-spent`);
        if (spent > budget) {
            spentInput.classList.add('input-error');
            showNotification(`${capitalize(category)} spent cannot exceed budget`, 'error');
        } else {
            spentInput.classList.remove('input-error');
        }
    }
    
    async function loadProjects() {
        try {
            projectsGrid.innerHTML = `
                <nav class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading project data...</p>
                </nav>
            `;
            
            const response = await fetch(PROJECTS_API);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const projects = await response.json();
            
            if (projects.length === 0) {
                projectsGrid.innerHTML = `
                    <nav class="no-records-message">
                        <i class="fas fa-folder-open"></i>
                        <p>No projects found. Create a project to get started.</p>
                    </nav>
                `;
                return;
            }
            
            // Get funding summary for all projects
            const summaryResponse = await fetch(`${FUNDING_API}/summary/projects`);
            
            if (!summaryResponse.ok) {
                throw new Error(`HTTP error! Status: ${summaryResponse.status}`);
            }
            
            const projectSummaries = await summaryResponse.json();
            
            displayProjects(projects, projectSummaries);
            
        } catch (error) {
            console.error('Error loading projects:', error);
            projectsGrid.innerHTML = `
                <nav class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading projects. Please try again later.</p>
                </nav>
            `;
        }
    }
    
    function displayProjects(projects, summaries) {
        projectsGrid.innerHTML = '';
        
        projects.forEach(project => {
            // Find matching summary, if it exists
            const summary = summaries.find(s => s.project_id === project.id) || {
                total_funding: 0,
                total_spent: 0,
                total_remaining: 0,
                funding_count: 0
            };
            
            // Calculate percentage spent
            const totalFunding = parseFloat(summary.total_funding) || 0;
            const totalSpent = parseFloat(summary.total_spent) || 0;
            const percentSpent = totalFunding > 0 ? Math.round((totalSpent / totalFunding) * 100) : 0;
            
            // Determine project status display
            let statusClass = "status-active";
            let statusText = project.status || "Active";
            
            switch (statusText.toLowerCase()) {
                case "completed":
                    statusClass = "status-completed";
                    break;
                case "pending":
                    statusClass = "status-pending";
                    break;
                case "active":
                    statusClass = "status-active";
                    break;
            }
            
            const card = document.createElement('nav');
            card.className = 'project-card';
            card.dataset.id = project.id;
            
            card.innerHTML = `
                <nav class="project-card-header">
                    <nav class="project-status ${statusClass}">${statusText}</nav>
                    <h3>${project.project_title}</h3>
                </nav>
                <nav class="project-card-content">
                    <nav class="project-stats">
                        <nav class="stat-item">
                            <p class="stat-value">R${totalFunding.toLocaleString()}</p>
                            <p class="stat-label">Total Funding</p>
                        </nav>
                        <nav class="stat-item">
                            <p class="stat-value">R${totalSpent.toLocaleString()}</p>
                            <p class="stat-label">Spent</p>
                        </nav>
                    </nav>
                    <nav class="funding-progress">
                        <nav class="progress-label">
                            <nav>Funding Spent</nav>
                            <nav>${percentSpent}%</nav>
                        </nav>
                        <nav class="progress-bar">
                            <nav class="progress-fill" style="width: ${percentSpent}%"></nav>
                        </nav>
                    </nav>
                </nav>
                <nav class="project-card-footer">
                    <nav class="project-funding-count">
                        <nav>${summary.funding_count}</nav> funding sources
                    </nav>
                    <nav class="project-action">
                        View Details <i class="fas fa-arrow-right"></i>
                    </nav>
                </nav>
            `;
            
            // Add event listener to the card
            card.addEventListener('click', () => {
                showProjectDetails(project.id, project.project_title);
            });
            
            projectsGrid.appendChild(card);
        });
    }
    
    function showProjectsOverview() {
        // Hide project details section
        projectDetailsSection.style.display = 'none';
        
        // Show projects grid
        document.querySelector('.projects-overview').style.display = 'block';
        
        // Clear current project
        currentProjectId = null;
        currentProjectData = null;
    }
    
    async function showProjectDetails(projectId, projectName) {
        try {
            // Set current project
            currentProjectId = projectId;
            
            // Update project title
            projectTitle.textContent = `Project: ${projectName}`;
            
            // Show project details section
            projectDetailsSection.style.display = 'block';
            
            // Hide projects grid
            document.querySelector('.projects-overview').style.display = 'none';
            
            // Load funding records for this project
            await loadFundingRecords(projectId);
            
        } catch (error) {
            console.error('Error showing project details:', error);
            showNotification('Error loading project details. Please try again later.', 'error');
        }
    }
    
    async function loadFundingRecords(projectId) {
        try {
            // Display loading state
            document.getElementById('funding-records-body').innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center;">
                        <nav class="loading-indicator" style="min-height: 100px;">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Loading funding records...</p>
                        </nav>
                    </td>
                </tr>
            `;
            
            // Fetch funding records for the selected project
            const response = await fetch(`${FUNDING_API}?project_id=${projectId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            fundingRecords = await response.json();
            
            // Display funding records
            displayFundingRecords(fundingRecords);
            
            // Update summary data
            updateSummaryData(fundingRecords);
            
            // Update charts
            updateCharts(fundingRecords);
            
            // Update category breakdown
            updateCategoryBreakdown(fundingRecords);
            
        } catch (error) {
            console.error('Error loading funding records:', error);
            document.getElementById('funding-records-body').innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center;">
                        <nav class="error-message" style="padding: 2rem;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Error loading funding records. Please try again later.</p>
                        </nav>
                    </td>
                </tr>
            `;
        }
    }
    
    function displayFundingRecords(records) {
        const tbody = document.getElementById('funding-records-body');
        const noRecordsMessage = document.getElementById('no-records-message');
        
        if (records.length === 0) {
            tbody.innerHTML = '';
            noRecordsMessage.style.display = 'block';
            return;
        }
        
        noRecordsMessage.style.display = 'none';
        tbody.innerHTML = '';
        
        records.forEach(record => {
            const expirationDate = new Date(record.expiration_date).toLocaleDateString();
            const remaining = parseFloat(record.total_amount) - parseFloat(record.amount_spent);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.title}</td>
                <td>${record.funder}</td>
                <td>R${parseFloat(record.total_amount).toLocaleString()}</td>
                <td>R${parseFloat(record.amount_spent).toLocaleString()}</td>
                <td>R${remaining.toLocaleString()}</td>
                <td>${expirationDate}</td>
                <td><nav class="funding-status status-${record.status}">${capitalize(record.status)}</nav></td>
                <td>
                    <nav class="table-actions">
                        <button class="action-btn edit-btn" title="Edit" data-id="${record.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" title="Delete" data-id="${record.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </nav>
                </td>
            `;
            
            // Add event listeners to action buttons
            const editBtn = row.querySelector('.edit-btn');
            const deleteBtn = row.querySelector('.delete-btn');
            
            editBtn.addEventListener('click', () => openEditFundingModal(record.id));
            deleteBtn.addEventListener('click', () => confirmDeleteFunding(record.id, record.title));
            
            tbody.appendChild(row);
        });
    }
    
    function filterFundingRecords() {
        const status = fundingStatusFilter.value;
        
        if (status === 'all') {
            displayFundingRecords(fundingRecords);
            return;
        }
        
        const filteredRecords = fundingRecords.filter(record => record.status === status);
        displayFundingRecords(filteredRecords);
    }
    
    function updateSummaryData(records) {
        // Calculate summary values
        const totalFunding = records.reduce((sum, record) => sum + parseFloat(record.total_amount), 0);
        const totalSpent = records.reduce((sum, record) => sum + parseFloat(record.amount_spent), 0);
        const totalRemaining = totalFunding - totalSpent;
        const activeGrantsCount = records.filter(record => record.status === 'active').length;
        
        // Update DOM elements
        document.getElementById('total-funding-amount').textContent = `R${totalFunding.toLocaleString()}`;
        document.getElementById('spent-funding-amount').textContent = `R${totalSpent.toLocaleString()}`;
        document.getElementById('remaining-funding-amount').textContent = `R${totalRemaining.toLocaleString()}`;
        document.getElementById('active-grants-count').textContent = activeGrantsCount;
    }
    
    function updateCharts(records) {
        // Calculate values for pie chart
        const totalFunding = records.reduce((sum, record) => sum + parseFloat(record.total_amount), 0);
        const totalSpent = records.reduce((sum, record) => sum + parseFloat(record.amount_spent), 0);
        const totalRemaining = totalFunding - totalSpent;
        
        // Calculate values for category chart
        const personnelBudget = records.reduce((sum, record) => sum + parseFloat(record.personnel_budget || 0), 0);
        const equipmentBudget = records.reduce((sum, record) => sum + parseFloat(record.equipment_budget || 0), 0);
        const consumablesBudget = records.reduce((sum, record) => sum + parseFloat(record.consumables_budget || 0), 0);
        const otherBudget = records.reduce((sum, record) => sum + parseFloat(record.other_budget || 0), 0);
        
        // Destroy existing charts if they exist
        if (fundingPieChart) {
            fundingPieChart.destroy();
        }
        
        if (categoryBudgetChart) {
            categoryBudgetChart.destroy();
        }
        
        // Create funding pie chart
        const pieCtx = document.getElementById('funding-pie-chart').getContext('2d');
        fundingPieChart = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: ['Spent', 'Remaining'],
                datasets: [{
                    data: [totalSpent, totalRemaining],
                    backgroundColor: [
                        '#ef4444',  // Red - Spent
                        '#10b981'   // Green - Remaining
                    ],
                    borderColor: [
                        '#ef4444',
                        '#10b981'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: R${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        // Create category budget chart
        const categoryCtx = document.getElementById('category-budget-chart').getContext('2d');
        categoryBudgetChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: ['Personnel', 'Equipment', 'Consumables', 'Other'],
                datasets: [{
                    data: [personnelBudget, equipmentBudget, consumablesBudget, otherBudget],
                    backgroundColor: [
                        '#3b82f6',  // Blue - Personnel
                        '#f97316',  // Orange - Equipment
                        '#8b5cf6',  // Purple - Consumables
                        '#64748b'   // Gray - Other
                    ],
                    borderColor: [
                        '#3b82f6',
                        '#f97316',
                        '#8b5cf6',
                        '#64748b'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${context.label}: R${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    function updateCategoryBreakdown(records) {
        // Calculate category values
        const personnelBudget = records.reduce((sum, record) => sum + parseFloat(record.personnel_budget || 0), 0);
        const personnelSpent = records.reduce((sum, record) => sum + parseFloat(record.personnel_spent || 0), 0);
        const personnelPercent = personnelBudget > 0 ? Math.round((personnelSpent / personnelBudget) * 100) : 0;
        
        const equipmentBudget = records.reduce((sum, record) => sum + parseFloat(record.equipment_budget || 0), 0);
        const equipmentSpent = records.reduce((sum, record) => sum + parseFloat(record.equipment_spent || 0), 0);
        const equipmentPercent = equipmentBudget > 0 ? Math.round((equipmentSpent / equipmentBudget) * 100) : 0;
        
        const consumablesBudget = records.reduce((sum, record) => sum + parseFloat(record.consumables_budget || 0), 0);
        const consumablesSpent = records.reduce((sum, record) => sum + parseFloat(record.consumables_spent || 0), 0);
        const consumablesPercent = consumablesBudget > 0 ? Math.round((consumablesSpent / consumablesBudget) * 100) : 0;
        
        const otherBudget = records.reduce((sum, record) => sum + parseFloat(record.other_budget || 0), 0);
        const otherSpent = records.reduce((sum, record) => sum + parseFloat(record.other_spent || 0), 0);
        const otherPercent = otherBudget > 0 ? Math.round((otherSpent / otherBudget) * 100) : 0;
        
        // Update personnel category
        document.getElementById('personnel-progress').style.width = `${personnelPercent}%`;
        document.getElementById('personnel-spent').textContent = `R${personnelSpent.toLocaleString()}`;
        document.getElementById('personnel-budget').textContent = `R${personnelBudget.toLocaleString()}`;
        document.getElementById('personnel-percent').textContent = `${personnelPercent}%`;
        
        // Update equipment category
        document.getElementById('equipment-progress').style.width = `${equipmentPercent}%`;
        document.getElementById('equipment-spent').textContent = `R${equipmentSpent.toLocaleString()}`;
        document.getElementById('equipment-budget').textContent = `R${equipmentBudget.toLocaleString()}`;
        document.getElementById('equipment-percent').textContent = `${equipmentPercent}%`;
        
        // Update consumables category
        document.getElementById('consumables-progress').style.width = `${consumablesPercent}%`;
        document.getElementById('consumables-spent').textContent = `R${consumablesSpent.toLocaleString()}`;
        document.getElementById('consumables-budget').textContent = `R${consumablesBudget.toLocaleString()}`;
        document.getElementById('consumables-percent').textContent = `${consumablesPercent}%`;
        
        // Update other category
        document.getElementById('other-progress').style.width = `${otherPercent}%`;
        document.getElementById('other-spent').textContent = `R${otherSpent.toLocaleString()}`;
        document.getElementById('other-budget').textContent = `R${otherBudget.toLocaleString()}`;
        document.getElementById('other-percent').textContent = `${otherPercent}%`;
    }
    
    function openAddFundingModal() {
        // Set modal title
        document.getElementById('funding-modal-title').textContent = 'Add New Funding';
        
        // Reset form
        fundingForm.reset();
        
        // Set hidden fields
        document.getElementById('funding-id').value = '';
        document.getElementById('funding-project-id').value = currentProjectId;
        
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        
        document.getElementById('funding-start-date').value = today;
        document.getElementById('funding-expiration-date').value = nextYear.toISOString().split('T')[0];
        
        // Calculate totals
        calculateFundingTotals();
        
        // Show modal
        fundingModal.style.display = 'flex';
    }
    
    async function openEditFundingModal(fundingId) {
        try {
            // Set modal title
            document.getElementById('funding-modal-title').textContent = 'Edit Funding';
            
            // Find funding record in current array
            const record = fundingRecords.find(r => r.id.toString() === fundingId.toString());
            
            if (!record) {
                // Fetch from API if not found in current array
                const response = await fetch(`${FUNDING_API}/${fundingId}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const fetchedRecord = await response.json();
                populateFundingForm(fetchedRecord);
            } else {
                populateFundingForm(record);
            }
            
            // Show modal
            fundingModal.style.display = 'flex';
            
        } catch (error) {
            console.error('Error loading funding record for editing:', error);
            showNotification('Error loading funding data.', 'error');
        }
    }
    
    function populateFundingForm(record) {
        // Set form fields
        document.getElementById('funding-id').value = record.id;
        document.getElementById('funding-project-id').value = record.project_id;
        document.getElementById('funding-title').value = record.title || '';
        document.getElementById('funding-description').value = record.description || '';
        document.getElementById('funding-funder').value = record.funder || '';
        document.getElementById('funding-status').value = record.status || 'active';
        document.getElementById('funding-start-date').value = record.start_date ? new Date(record.start_date).toISOString().split('T')[0] : '';
        document.getElementById('funding-expiration-date').value = record.expiration_date ? new Date(record.expiration_date).toISOString().split('T')[0] : '';
        document.getElementById('funding-amount').value = record.total_amount || '0';
        document.getElementById('funding-spent').value = record.amount_spent || '0';
        document.getElementById('funding-notes').value = record.notes || '';
        
        // Set budget category fields
        document.getElementById('funding-personnel-budget').value = record.personnel_budget || '0';
        document.getElementById('funding-personnel-spent').value = record.personnel_spent || '0';
        document.getElementById('funding-equipment-budget').value = record.equipment_budget || '0';
        document.getElementById('funding-equipment-spent').value = record.equipment_spent || '0';
        document.getElementById('funding-consumables-budget').value = record.consumables_budget || '0';
        document.getElementById('funding-consumables-spent').value = record.consumables_spent || '0';
        document.getElementById('funding-other-budget').value = record.other_budget || '0';
        document.getElementById('funding-other-spent').value = record.other_spent || '0';
        
        // Calculate totals
        calculateFundingTotals();
    }
    
    async function handleFundingFormSubmit(e) {
        e.preventDefault();
        
        // Validate category spending first
        const personnelBudget = parseFloat(document.getElementById('funding-personnel-budget').value) || 0;
        const personnelSpent = parseFloat(document.getElementById('funding-personnel-spent').value) || 0;
        const equipmentBudget = parseFloat(document.getElementById('funding-equipment-budget').value) || 0;
        const equipmentSpent = parseFloat(document.getElementById('funding-equipment-spent').value) || 0;
        const consumablesBudget = parseFloat(document.getElementById('funding-consumables-budget').value) || 0;
        const consumablesSpent = parseFloat(document.getElementById('funding-consumables-spent').value) || 0;
        const otherBudget = parseFloat(document.getElementById('funding-other-budget').value) || 0;
        const otherSpent = parseFloat(document.getElementById('funding-other-spent').value) || 0;
        
        if (personnelSpent > personnelBudget || 
            equipmentSpent > equipmentBudget || 
            consumablesSpent > consumablesBudget || 
            otherSpent > otherBudget) {
            showNotification('Spent amount cannot exceed budget in any category', 'error');
            return;
        }
        
        const fundingId = document.getElementById('funding-id').value;
        const isNewFunding = !fundingId;
        
        try {
            // Collect form data
            const fundingData = {
                project_id: document.getElementById('funding-project-id').value,
                title: document.getElementById('funding-title').value,
                description: document.getElementById('funding-description').value,
                funder: document.getElementById('funding-funder').value,
                status: document.getElementById('funding-status').value,
                start_date: document.getElementById('funding-start-date').value,
                expiration_date: document.getElementById('funding-expiration-date').value,
                total_amount: parseFloat(document.getElementById('funding-amount').value) || 0,
                amount_spent: parseFloat(document.getElementById('funding-spent').value) || 0,
                notes: document.getElementById('funding-notes').value,
                
                // Budget categories
                personnel_budget: personnelBudget,
                personnel_spent: personnelSpent,
                equipment_budget: equipmentBudget,
                equipment_spent: equipmentSpent,
                consumables_budget: consumablesBudget,
                consumables_spent: consumablesSpent,
                other_budget: otherBudget,
                other_spent: otherSpent
            };
            
            let response;
            
            if (isNewFunding) {
                // Create new funding
                response = await fetch(FUNDING_API, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(fundingData),
                });
            } else {
                // Update existing funding
                response = await fetch(`${FUNDING_API}/${fundingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(fundingData),
                });
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // Close modal
            fundingModal.style.display = 'none';
            
            // Reload funding records
            await loadFundingRecords(currentProjectId);
            
            // Show success message
            showNotification(
                isNewFunding ? 'Funding record created successfully!' : 'Funding record updated successfully!',
                'success'
            );
            
        } catch (error) {
            console.error('Error saving funding record:', error);
            showNotification('Error saving funding record. Please try again.', 'error');
        }
    }
    
    function confirmDeleteFunding(fundingId, fundingTitle) {
        document.getElementById('confirm-delete-btn').dataset.id = fundingId;
        
        const fundingToDelete = document.querySelector('.funding-to-delete');
        fundingToDelete.innerHTML = `
            <nav class="delete-funding-info">
                <h4>${fundingTitle || 'Unnamed Funding'}</h4>
                <p>ID: ${fundingId}</p>
            </nav>
        `;
        
        deleteModal.style.display = 'flex';
    }
    
    async function deleteFundingRecord() {
        const fundingId = document.getElementById('confirm-delete-btn').dataset.id;
        
        try {
            const response = await fetch(`${FUNDING_API}/${fundingId}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // Close modal
            deleteModal.style.display = 'none';
            
            // Reload funding records
            await loadFundingRecords(currentProjectId);
            
            // Show success message
            showNotification('Funding record deleted successfully!', 'success');
            
        } catch (error) {
            console.error('Error deleting funding record:', error);
            showNotification('Error deleting funding record. Please try again.', 'error');
        }
    }
    
    // PDF Export Functionality
    async function exportToPDF(type) {
        if (!window.jspdf || !window.html2canvas) {
            showNotification('PDF export libraries not loaded. Please try again later.', 'error');
            return;
        }
        
        try {
            showNotification('Preparing PDF export...', 'info');
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // Add title
            pdf.setFontSize(16);
            pdf.setTextColor(0, 0, 128);
            
            if (type === 'overview') {
                pdf.text('Research Funding Overview', pageWidth / 2, 20, { align: 'center' });
                
                // Add date
                pdf.setFontSize(10);
                pdf.setTextColor(100, 100, 100);
                pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 25, { align: 'center' });
                
                // Create a temporary canvas to render all project cards
                const projectCards = document.querySelectorAll('.project-card');
                let yPosition = 35;
                
                for (let i = 0; i < projectCards.length; i++) {
                    const card = projectCards[i];
                    
                    // Check if we need a new page
                    if (i > 0 && yPosition > pageHeight - 60) {
                        pdf.addPage();
                        yPosition = 20;
                    }
                    
                    // Clone the node to avoid modifying the original
                    const cardClone = card.cloneNode(true);
                    cardClone.style.width = '500px';
                    document.body.appendChild(cardClone);
                    
                    // Render to canvas
                    const canvas = await html2canvas(cardClone, {
                        scale: 1,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#ffffff'
                    });
                    
                    // Remove the clone
                    document.body.removeChild(cardClone);
                    
                    // Calculate dimensions to fit in PDF
                    const imgData = canvas.toDataURL('image/png');
                    const imgWidth = pageWidth - 40;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;
                    
                    pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
                    
                    // Move position down for next element
                    yPosition += imgHeight + 10;
                }
                
            } else if (type === 'details' && currentProjectId) {
                // Get project name
                const projectName = document.getElementById('project-title').textContent.replace('Project: ', '');
                
                pdf.text(`Funding Details: ${projectName}`, pageWidth / 2, 20, { align: 'center' });
                
                // Add date
                pdf.setFontSize(10);
                pdf.setTextColor(100, 100, 100);
                pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 25, { align: 'center' });
                
                // Summary section
                pdf.setFontSize(14);
                pdf.setTextColor(0, 0, 128);
                pdf.text('Summary', 20, 35);
                
                pdf.setFontSize(11);
                pdf.setTextColor(0, 0, 0);
                
                // Get summary data
                const totalFunding = document.getElementById('total-funding-amount').textContent;
                const spentFunding = document.getElementById('spent-funding-amount').textContent;
                const remainingFunding = document.getElementById('remaining-funding-amount').textContent;
                const activeGrants = document.getElementById('active-grants-count').textContent;
                
                pdf.text(`Total Funding: ${totalFunding}`, 20, 45);
                pdf.text(`Amount Spent: ${spentFunding}`, 20, 52);
                pdf.text(`Remaining: ${remainingFunding}`, 20, 59);
                pdf.text(`Active Grants: ${activeGrants}`, 20, 66);
                
                // Chart section
                pdf.setFontSize(14);
                pdf.setTextColor(0, 0, 128);
                pdf.text('Funding Chart', 20, 80);
                
                // Render pie chart to canvas
                const chartCanvas = await html2canvas(document.getElementById('funding-pie-chart'), {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff'
                });
                
                const chartImgData = chartCanvas.toDataURL('image/png');
                pdf.addImage(chartImgData, 'PNG', 50, 85, 100, 50);
                
                // Category Breakdown section
                pdf.setFontSize(14);
                pdf.setTextColor(0, 0, 128);
                pdf.text('Category Breakdown', 20, 145);
                
                // Render category cards
                const categorySection = document.querySelector('.category-breakdown-section');
                const categoryCanvas = await html2canvas(categorySection, {
                    scale: 1.5,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff'
                });
                
                const categoryImgData = categoryCanvas.toDataURL('image/png');
                const categoryImgWidth = pageWidth - 40;
                const categoryImgHeight = (categoryCanvas.height * categoryImgWidth) / categoryCanvas.width;
                
                // Check if we need a new page
                if (145 + categoryImgHeight > pageHeight - 20) {
                    pdf.addPage();
                    pdf.addImage(categoryImgData, 'PNG', 20, 20, categoryImgWidth, categoryImgHeight);
                    
                    // Funding records on a new page
                    pdf.addPage();
                    pdf.setFontSize(14);
                    pdf.setTextColor(0, 0, 128);
                    pdf.text('Funding Records', 20, 20);
                    
                    // Create a table for funding records
                    createFundingTable(pdf, 30);
                } else {
                    pdf.addImage(categoryImgData, 'PNG', 20, 155, categoryImgWidth, categoryImgHeight);
                    
                    // Add a new page for funding records
                    pdf.addPage();
                    pdf.setFontSize(14);
                    pdf.setTextColor(0, 0, 128);
                    pdf.text('Funding Records', 20, 20);
                    
                    // Create a table for funding records
                    createFundingTable(pdf, 30);
                }
            }
            
            // Save the PDF
            const fileName = type === 'overview' 
                ? 'funding-overview.pdf' 
                : `funding-details-${currentProjectId}.pdf`;
                
            pdf.save(fileName);
            
            showNotification('PDF exported successfully!', 'success');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            showNotification('Error generating PDF. Please try again.', 'error');
        }
    }
    
    function createFundingTable(pdf, startY) {
        // Set font
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margins = { left: 10, right: 10 };
        const tableWidth = pageWidth - margins.left - margins.right;
        
        // Table columns
        const columns = [
            { header: 'Title', width: 40 },
            { header: 'Funder', width: 35 },
            { header: 'Total Amount', width: 25, align: 'right' },
            { header: 'Spent', width: 25, align: 'right' },
            { header: 'Remaining', width: 25, align: 'right' },
            { header: 'Expiration', width: 25, align: 'center' },
            { header: 'Status', width: 20, align: 'center' }
        ];
        
        // Calculate column positions
        let currentX = margins.left;
        columns.forEach(col => {
            col.x = currentX;
            currentX += col.width;
        });
        
        // Draw header
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margins.left, startY, tableWidth, 8, 'F');
        
        pdf.setFont(undefined, 'bold');
        currentX = margins.left;
        
        columns.forEach(col => {
            const align = col.align || 'left';
            let xPos = col.x;
            
            if (align === 'center') {
                xPos = col.x + col.width / 2;
            } else if (align === 'right') {
                xPos = col.x + col.width - 2;
            } else {
                xPos = col.x + 2;
            }
            
            pdf.text(col.header, xPos, startY + 5, { align });
        });
        
        // Draw rows
        pdf.setFont(undefined, 'normal');
        let currentY = startY + 8;
        const rowHeight = 7;
        
        for (const record of fundingRecords) {
            // Check if we need a new page
            if (currentY > pdf.internal.pageSize.getHeight() - 20) {
                pdf.addPage();
                currentY = 20;
                
                // Redraw header on new page
                pdf.setFillColor(240, 240, 240);
                pdf.rect(margins.left, currentY, tableWidth, 8, 'F');
                
                pdf.setFont(undefined, 'bold');
                
                columns.forEach(col => {
                    const align = col.align || 'left';
                    let xPos = col.x;
                    
                    if (align === 'center') {
                        xPos = col.x + col.width / 2;
                    } else if (align === 'right') {
                        xPos = col.x + col.width - 2;
                    } else {
                        xPos = col.x + 2;
                    }
                    
                    pdf.text(col.header, xPos, currentY + 5, { align });
                });
                
                pdf.setFont(undefined, 'normal');
                currentY += 8;
            }
            
            // Draw row background (alternating)
            if ((fundingRecords.indexOf(record) % 2) === 1) {
                pdf.setFillColor(250, 250, 250);
                pdf.rect(margins.left, currentY, tableWidth, rowHeight, 'F');
            }
            
            // Draw data
            const expirationDate = new Date(record.expiration_date).toLocaleDateString();
            const remaining = parseFloat(record.total_amount) - parseFloat(record.amount_spent);
            
            const rowData = [
                record.title.substring(0, 25) + (record.title.length > 25 ? '...' : ''),
                record.funder.substring(0, 20) + (record.funder.length > 20 ? '...' : ''),
                `R${parseFloat(record.total_amount).toLocaleString()}`,
                `R${parseFloat(record.amount_spent).toLocaleString()}`,
                `R${remaining.toLocaleString()}`,
                expirationDate,
                capitalize(record.status)
            ];
            
            rowData.forEach((text, i) => {
                const col = columns[i];
                const align = col.align || 'left';
                let xPos = col.x;
                
                if (align === 'center') {
                    xPos = col.x + col.width / 2;
                } else if (align === 'right') {
                    xPos = col.x + col.width - 2;
                } else {
                    xPos = col.x + 2;
                }
                
                pdf.text(text, xPos, currentY + 5, { align });
            });
            
            currentY += rowHeight;
        }
    }
    
    // Helper function to capitalize first letter
    function capitalize(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Notification function
    function showNotification(message, type = 'info') {
        const notification = document.createElement('nav');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <nav class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <p>${message}</p>
            </nav>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Add close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.add('notification-hiding');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
});
