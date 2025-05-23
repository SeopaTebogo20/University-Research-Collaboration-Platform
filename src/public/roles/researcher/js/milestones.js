document.addEventListener('DOMContentLoaded', () => {
    // API URL configuration - supports both local development and production
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' 
        : 'https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net/api';
    
    const PROJECTS_API = `${API_BASE_URL}/projects`;
    const MILESTONES_API = `${API_BASE_URL}/milestones`;
    const COLLABORATORS_API = `${API_BASE_URL}/collaborators`;
    
    // DOM Elements
    const projectSelect = document.getElementById('project-select');
    const milestonesTimeline = document.getElementById('milestones-timeline');
    const milestoneModal = document.getElementById('milestone-modal');
    const deleteModal = document.getElementById('delete-modal');
    const milestoneForm = document.getElementById('milestone-form');
    const addMilestoneBtn = document.getElementById('add-milestone-btn');
    const cancelMilestoneBtn = document.getElementById('cancel-milestone-btn');
    const collapseAllBtn = document.getElementById('collapse-all-btn');
    const expandAllBtn = document.getElementById('expand-all-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    
    // Initial state
    let currentProjectId = null;
    let milestones = [];
    let currentProject = null;
    
    // Close buttons for modals
    document.querySelectorAll('.close, #cancel-milestone-btn, #cancel-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            milestoneModal.style.display = 'none';
            deleteModal.style.display = 'none';
        });
    });
    
    // Event Listeners
    addMilestoneBtn.addEventListener('click', openAddMilestoneModal);
    milestoneForm.addEventListener('submit', handleMilestoneFormSubmit);
    projectSelect.addEventListener('change', handleProjectChange);
    document.getElementById('confirm-delete-btn').addEventListener('click', deleteMilestone);
    collapseAllBtn.addEventListener('click', collapseAllMilestones);
    expandAllBtn.addEventListener('click', expandAllMilestones);
    
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportMilestonesPDF);
    }
    
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }
    
    // Load projects on page load
    loadProjects();
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === milestoneModal) {
            milestoneModal.style.display = 'none';
        } else if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    });
    
    // Functions
    async function loadProjects() {
        try {
            const response = await fetch(PROJECTS_API);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const projects = await response.json();
            
            if (projects.length === 0) {
                projectSelect.innerHTML = '<option value="">No projects available</option>';
                return;
            }
            
            // Populate project dropdown
            projectSelect.innerHTML = '<option value="">Select a project</option>';
            
            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.project_title;
                projectSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading projects:', error);
            showNotification('Error loading projects. Please try again later.', 'error');
        }
    }
    
    async function handleProjectChange() {
        const projectId = projectSelect.value;
        
        if (!projectId) {
            resetMilestoneDashboard();
            return;
        }
        
        currentProjectId = projectId;
        await loadProjectDetails(projectId);
        await loadMilestones(projectId);
        loadProjectChart(projectId);
    }
    
    function resetMilestoneDashboard() {
        currentProjectId = null;
        currentProject = null;
        
        // Reset overview
        document.getElementById('project-status').textContent = 'N/A';
        document.getElementById('project-status').className = 'status';
        document.getElementById('project-timeline').textContent = 'N/A';
        document.getElementById('project-lead').textContent = 'N/A';
        document.getElementById('project-department').textContent = 'N/A';
        document.getElementById('project-collaborators').textContent = 'N/A';
        
        // Reset timeline
        milestonesTimeline.innerHTML = `
            <div class="timeline-placeholder">
                <i class="fas fa-tasks"></i>
                <p>Select a project to view milestones</p>
            </div>
        `;
        
        // Reset chart
        if (window.milestoneChart) {
            window.milestoneChart.destroy();
            window.milestoneChart = null;
        }
    }
    
async function loadProjectDetails(projectId) {
    try {
        const response = await fetch(`${PROJECTS_API}/${projectId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const project = await response.json();
        currentProject = project;
        
        // Update project overview
        const startDate = new Date(project.start_date).toLocaleDateString();
        const endDate = new Date(project.end_date).toLocaleDateString();
        
        // Update status class
        let statusClass = 'status-active';
        let statusText = project.status || 'Active';
        
        switch (statusText.toLowerCase()) {
            case 'completed':
                statusClass = 'status-completed';
                break;
            case 'pending':
                statusClass = 'status-pending';
                break;
            case 'active':
                statusClass = 'status-active';
                break;
            default:
                statusClass = 'status-active';
        }
        
        document.getElementById('project-status').textContent = statusText;
        document.getElementById('project-status').className = `status ${statusClass}`;
        document.getElementById('project-timeline').textContent = `${startDate} - ${endDate}`;
        document.getElementById('project-lead').textContent = project.researcher_name || 'Not specified';
        document.getElementById('project-department').textContent = project.department || 'Not specified';
        
        // Get actual number of collaborators from project data
        let collaboratorCount = 0;
        if (project.Collaborators) {
            try {
                const collaborators = Array.isArray(project.Collaborators) ? 
                    project.Collaborators : 
                    JSON.parse(project.Collaborators);
                collaboratorCount = collaborators.length;
            } catch (e) {
                console.error("Error parsing collaborators:", e);
            }
        }
        document.getElementById('project-collaborators').textContent = collaboratorCount;
        
        // Load collaborators for milestone assignees from project data
        loadCollaborators(project);
        
    } catch (error) {
        console.error('Error loading project details:', error);
        showNotification('Error loading project details.', 'error');
    }
}
    
async function loadCollaborators(project) {
    try {
        const assigneeSelect = document.getElementById('milestone-assignee');
        
        // Clear previous options
        assigneeSelect.innerHTML = '<option value="">Select Assignee</option>';
        
        // Add "Unassigned" option
        const unassignedOption = document.createElement('option');
        unassignedOption.value = '';
        unassignedOption.textContent = 'Unassigned';
        assigneeSelect.appendChild(unassignedOption);
        
        // Add project lead as first option
        if (project.researcher_name) {
            const leadOption = document.createElement('option');
            leadOption.value = 'lead';
            leadOption.textContent = `${project.researcher_name} (Project Lead)`;
            assigneeSelect.appendChild(leadOption);
        }
        
        // Add collaborators from project data if available
        if (project.Collaborators) {
            let collaborators = [];
            try {
                collaborators = Array.isArray(project.Collaborators) ? 
                    project.Collaborators : 
                    JSON.parse(project.Collaborators);
                
                collaborators.forEach(collaborator => {
                    const option = document.createElement('option');
                    option.value = collaborator.id;
                    option.textContent = `${collaborator.name} (${collaborator.position || 'Collaborator'})`;
                    assigneeSelect.appendChild(option);
                });
            } catch (e) {
                console.error("Error parsing collaborators:", e);
            }
        }
        
    } catch (error) {
        console.error('Error loading collaborators:', error);
        const assigneeSelect = document.getElementById('milestone-assignee');
        assigneeSelect.innerHTML = '<option value="">Error loading assignees</option>';
    }
}
    async function loadMilestones(projectId) {
        try {
            // Show loading state
            milestonesTimeline.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading milestones...</div>';
            
            // Fetch milestones for the selected project
            const response = await fetch(`${MILESTONES_API}?project_id=${projectId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            milestones = await response.json();
            
            if (milestones.length === 0) {
                milestonesTimeline.innerHTML = `
                    <div class="timeline-placeholder">
                        <i class="fas fa-clipboard-list"></i>
                        <p>No milestones found for this project. Create a milestone to get started.</p>
                    </div>
                `;
                return;
            }
            
            // Sort milestones by start date
            milestones.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
            
            // Display milestones
            displayMilestones(milestones);
            
        } catch (error) {
            console.error('Error loading milestones:', error);
            milestonesTimeline.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i> Error loading milestones. Please try again later.
                </div>
            `;
        }
    }
    
function displayMilestones(milestones) {
    milestonesTimeline.innerHTML = '';
    
    milestones.forEach(milestone => {
        const startDate = new Date(milestone.start_date).toLocaleDateString();
        const endDate = new Date(milestone.end_date).toLocaleDateString();
        
        // Determine milestone status class
        let statusClass = '';
        
        switch (milestone.status?.toLowerCase()) {
            case 'completed':
                statusClass = 'milestone-completed';
                break;
            case 'in-progress':
                statusClass = 'milestone-in-progress';
                break;
            case 'pending':
                statusClass = 'milestone-pending';
                break;
            case 'delayed':
                statusClass = 'milestone-delayed';
                break;
            default:
                statusClass = 'milestone-pending';
        }
        
        // Format assignee name
        let assigneeDisplay = milestone.assignee_name || 'Unassigned';
        if (milestone.assignee_id === 'lead') {
            assigneeDisplay = `${currentProject.researcher_name || 'Project Lead'} (Lead)`;
        }
        
        const milestoneElement = document.createElement('div');
        milestoneElement.className = `timeline-milestone ${statusClass}`;
        milestoneElement.dataset.id = milestone.id;
        
        milestoneElement.innerHTML = `
            <div class="timeline-milestone-header">
                <h3 class="milestone-title">${milestone.title}</h3>
                <div class="milestone-actions">
                    <button class="action-btn edit-btn" title="Edit Milestone">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" title="Delete Milestone">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="milestone-content">
                <p class="milestone-description">${milestone.description || 'No description provided.'}</p>
                <div class="milestone-meta">
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${startDate} - ${endDate}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-check"></i>
                        <span>Status: ${capitalize(milestone.status || 'Pending')}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-user"></i>
                        <span>Assignee: ${assigneeDisplay}</span>
                    </div>
                </div>
            </div>
        `;
        
        milestonesTimeline.appendChild(milestoneElement);
        
        // Add event listeners to action buttons
        milestoneElement.querySelector('.edit-btn').addEventListener('click', () => {
            openEditMilestoneModal(milestone.id);
        });
        
        milestoneElement.querySelector('.delete-btn').addEventListener('click', () => {
            confirmDeleteMilestone(milestone.id, milestone.title);
        });
    });
}
    
    function loadProjectChart(projectId) {
        // Get milestone stats for the current project
        const stats = getMilestoneStats();
        
        // Create or update chart
        const ctx = document.getElementById('milestone-progress-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.milestoneChart) {
            window.milestoneChart.destroy();
        }
        
        window.milestoneChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Completed', 'In Progress', 'Pending', 'Delayed'],
                datasets: [{
                    data: [stats.completed, stats.inProgress, stats.pending, stats.delayed],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',  // Completed - Green
                        'rgba(59, 130, 246, 0.8)',  // In Progress - Blue
                        'rgba(245, 158, 11, 0.8)',  // Pending - Amber
                        'rgba(239, 68, 68, 0.8)'    // Delayed - Red
                    ],
                    borderColor: [
                        'rgba(16, 185, 129, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)'
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
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    function getMilestoneStats() {
        // Count milestones by status
        const stats = {
            completed: 0,
            inProgress: 0,
            pending: 0,
            delayed: 0
        };
        
        milestones.forEach(milestone => {
            const status = milestone.status ? milestone.status.toLowerCase() : 'pending';
            
            if (status === 'completed') {
                stats.completed++;
            } else if (status === 'in-progress') {
                stats.inProgress++;
            } else if (status === 'delayed') {
                stats.delayed++;
            } else {
                stats.pending++;
            }
        });
        
        return stats;
    }
    
    function openAddMilestoneModal() {
        if (!currentProjectId) {
            showNotification('Please select a project first.', 'warning');
            return;
        }
        
        document.getElementById('modal-title').textContent = 'Add New Milestone';
        milestoneForm.reset();
        
        // Set project ID
        document.getElementById('milestone-id').value = '';
        document.getElementById('milestone-project-id').value = currentProjectId;
        
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        document.getElementById('milestone-start-date').value = today;
        document.getElementById('milestone-end-date').value = nextMonth.toISOString().split('T')[0];
        
        milestoneModal.style.display = 'block';
    }
    
    async function openEditMilestoneModal(milestoneId) {
        try {
            document.getElementById('modal-title').textContent = 'Edit Milestone';
            
            // Find milestone in current array
            const milestone = milestones.find(m => m.id.toString() === milestoneId.toString());
            
            if (!milestone) {
                // Fetch from API if not found in current array
                const response = await fetch(`${MILESTONES_API}/${milestoneId}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                milestone = await response.json();
            }
            
            // Fill form with milestone data
            document.getElementById('milestone-id').value = milestone.id;
            document.getElementById('milestone-project-id').value = milestone.project_id;
            document.getElementById('milestone-title').value = milestone.title || '';
            document.getElementById('milestone-description').value = milestone.description || '';
            document.getElementById('milestone-start-date').value = milestone.start_date ? new Date(milestone.start_date).toISOString().split('T')[0] : '';
            document.getElementById('milestone-end-date').value = milestone.end_date ? new Date(milestone.end_date).toISOString().split('T')[0] : '';
            document.getElementById('milestone-status').value = milestone.status || 'pending';
            
            // Set assignee if available
            if (milestone.assignee_id) {
                document.getElementById('milestone-assignee').value = milestone.assignee_id;
            }
            
            milestoneModal.style.display = 'block';
            
        } catch (error) {
            console.error('Error loading milestone for editing:', error);
            showNotification('Error loading milestone data.', 'error');
        }
    }
    
async function handleMilestoneFormSubmit(e) {
    e.preventDefault();
    
    const milestoneId = document.getElementById('milestone-id').value;
    const isNewMilestone = !milestoneId;
    const assigneeSelect = document.getElementById('milestone-assignee');
    
    // Get the selected assignee name (for display purposes)
    let assigneeName = null;
    let assigneeId = null;
    
    if (assigneeSelect.value === 'lead') {
        assigneeName = currentProject.researcher_name || 'Project Lead';
        assigneeId = 'lead';
    } else if (assigneeSelect.value) {
        const selectedOption = assigneeSelect.options[assigneeSelect.selectedIndex];
        assigneeName = selectedOption.textContent.split(' (')[0]; // Remove the position part
        assigneeId = assigneeSelect.value;
    }
    
    // Collect form data
    const milestoneData = {
        project_id: document.getElementById('milestone-project-id').value,
        title: document.getElementById('milestone-title').value,
        description: document.getElementById('milestone-description').value,
        start_date: document.getElementById('milestone-start-date').value,
        end_date: document.getElementById('milestone-end-date').value,
        status: document.getElementById('milestone-status').value,
        assignee_id: assigneeId,
        assignee_name: assigneeName
    };
    
    try {
        let response;
        
        if (isNewMilestone) {
            // Create new milestone
            response = await fetch(MILESTONES_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(milestoneData),
            });
        } else {
            // Update existing milestone
            response = await fetch(`${MILESTONES_API}/${milestoneId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(milestoneData),
            });
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Close modal and reload milestones
        milestoneModal.style.display = 'none';
        await loadMilestones(currentProjectId);
        loadProjectChart(currentProjectId);
        
        // Show success notification
        showNotification(
            isNewMilestone ? 'Milestone created successfully!' : 'Milestone updated successfully!',
            'success'
        );
        
    } catch (error) {
        console.error('Error saving milestone:', error);
        showNotification('Error saving milestone. Please try again.', 'error');
    }
}
    
    function confirmDeleteMilestone(milestoneId, milestoneTitle) {
        document.getElementById('confirm-delete-btn').dataset.id = milestoneId;
        document.querySelector('.milestone-to-delete').innerHTML = `
            <div class="delete-milestone-info">
                <h3>${milestoneTitle || 'Unnamed Milestone'}</h3>
                <p>Milestone ID: ${milestoneId}</p>
            </div>
        `;
        
        deleteModal.style.display = 'block';
    }
    
    async function deleteMilestone() {
        const milestoneId = document.getElementById('confirm-delete-btn').dataset.id;
        
        try {
            const response = await fetch(`${MILESTONES_API}/${milestoneId}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // Close modal and reload milestones
            deleteModal.style.display = 'none';
            await loadMilestones(currentProjectId);
            loadProjectChart(currentProjectId);
            
            // Show success notification
            showNotification('Milestone deleted successfully!', 'success');
            
        } catch (error) {
            console.error('Error deleting milestone:', error);
            showNotification('Error deleting milestone. Please try again.', 'error');
        }
    }
    
    function collapseAllMilestones() {
        const milestoneElements = document.querySelectorAll('.timeline-milestone');
        milestoneElements.forEach(milestone => {
            const content = milestone.querySelector('.milestone-content');
            content.style.display = 'none';
        });
    }
    
    function expandAllMilestones() {
        const milestoneElements = document.querySelectorAll('.timeline-milestone');
        milestoneElements.forEach(milestone => {
            const content = milestone.querySelector('.milestone-content');
            content.style.display = 'block';
        });
    }
    
    // PDF Export Functionality
    function exportMilestonesPDF() {
        if (!currentProject || !milestones.length) {
            showNotification('Please select a project with milestones first.', 'warning');
            return;
        }
        
        // Load jsPDF library if not already loaded
        if (typeof jsPDF === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
                // Load html2canvas after jsPDF
                const canvasScript = document.createElement('script');
                canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                canvasScript.onload = generatePDF;
                document.head.appendChild(canvasScript);
            };
            document.head.appendChild(script);
        } else {
            generatePDF();
        }
    }
    
    function generatePDF() {
        const { jsPDF } = window.jspdf;
        
        // Create PDF
        const doc = new jsPDF('p', 'pt', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Set report metadata
        doc.setProperties({
            title: `Milestones Report - ${currentProject.project_title}`,
            subject: 'Project Milestones Report',
            author: currentProject.researcher_name || 'CollabNexus',
            creator: 'CollabNexus Research Platform'
        });
        
        // Add header
        doc.setFontSize(22);
        doc.setTextColor(44, 62, 80);
        doc.text('Project Milestones Report', pageWidth/2, 40, { align: 'center' });
        
        // Add project info
        doc.setFontSize(14);
        doc.setTextColor(52, 73, 94);
        doc.text(`Project: ${currentProject.project_title}`, 40, 70);
        doc.setFontSize(12);
        doc.text(`Researcher: ${currentProject.researcher_name || 'Not specified'}`, 40, 90);
        doc.text(`Department: ${currentProject.department || 'Not specified'}`, 40, 110);
        
        // Timeline
        const startDate = new Date(currentProject.start_date).toLocaleDateString();
        const endDate = new Date(currentProject.end_date).toLocaleDateString();
        doc.text(`Timeline: ${startDate} - ${endDate}`, 40, 130);
        doc.text(`Status: ${currentProject.status || 'Active'}`, 40, 150);
        
        // Add milestone stats
        const stats = getMilestoneStats();
        doc.setFillColor(44, 62, 80);
        doc.rect(40, 170, pageWidth - 80, 2, 'F');
        
        doc.setFontSize(16);
        doc.text('Milestone Statistics', 40, 190);
        
        doc.setFontSize(12);
        doc.text(`Total Milestones: ${milestones.length}`, 40, 220);
        doc.text(`Completed: ${stats.completed}`, 40, 240);
        doc.text(`In Progress: ${stats.inProgress}`, 40, 260);
        doc.text(`Pending: ${stats.pending}`, 40, 280);
        doc.text(`Delayed: ${stats.delayed}`, 40, 300);
        
        // Add milestones list
        doc.setFillColor(44, 62, 80);
        doc.rect(40, 320, pageWidth - 80, 2, 'F');
        
        doc.setFontSize(16);
        doc.text('Milestones', 40, 340);
        
        let yPosition = 370;
        
        // Sort milestones by start date
        const sortedMilestones = [...milestones].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        
        sortedMilestones.forEach((milestone, index) => {
            // Check if we need to add a new page
            if (yPosition > pageHeight - 100) {
                doc.addPage();
                yPosition = 40;
            }
            
            const startDate = new Date(milestone.start_date).toLocaleDateString();
            const endDate = new Date(milestone.end_date).toLocaleDateString();
            
            // Set background color based on status
            let statusColor;
            switch (milestone.status?.toLowerCase()) {
                case 'completed':
                    statusColor = [22, 160, 133];
                    break;
                case 'in-progress':
                    statusColor = [41, 128, 185];
                    break;
                case 'delayed':
                    statusColor = [231, 76, 60];
                    break;
                default:
                    statusColor = [243, 156, 18];
            }
            
            // Add milestone box
            doc.setFillColor(...statusColor, 0.1);
            doc.setDrawColor(...statusColor);
            doc.roundedRect(40, yPosition, pageWidth - 80, 80, 3, 3, 'FD');
            
            // Title with status indicator
            doc.setFontSize(13);
            doc.setTextColor(44, 62, 80);
            doc.text(`${index + 1}. ${milestone.title}`, 50, yPosition + 20);
            
            // Status
            doc.setFontSize(10);
            doc.setTextColor(...statusColor);
            doc.text(`Status: ${capitalize(milestone.status || 'Pending')}`, 50, yPosition + 35);
            
            // Date range
            doc.setTextColor(52, 73, 94);
            doc.text(`Timeline: ${startDate} - ${endDate}`, 50, yPosition + 50);
            
            // Assignee
            doc.text(`Assignee: ${milestone.assignee_name || 'Unassigned'}`, 50, yPosition + 65);
            
            // Move to the next milestone position
            yPosition += 90;
        });
        
        // Add footer
        const reportDate = new Date().toLocaleDateString();
        const reportTime = new Date().toLocaleTimeString();
        
        doc.setFontSize(8);
        doc.setTextColor(127, 140, 141);
        doc.text(`Report generated on ${reportDate} at ${reportTime} via CollabNexus Research Platform`, pageWidth/2, pageHeight - 20, { align: 'center' });
        
        // Save the PDF
        doc.save(`milestones_${currentProject.project_title.replace(/\s+/g, '_')}.pdf`);
        
        // Show success notification
        showNotification('PDF report generated successfully!', 'success');
    }
    
    // Helper function to capitalize first letter
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Utility function for notifications
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Add close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                document.body.removeChild(notification);
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
