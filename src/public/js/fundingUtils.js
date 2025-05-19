// Utility functions for funding management
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000/api' 
    : 'https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net/api';

const PROJECTS_API = `${API_BASE_URL}/projects`;
const FUNDING_API = `${API_BASE_URL}/funding`;

// Helper function to capitalize first letter
function capitalize(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Load all projects with their funding summaries
async function loadProjects() {
    try {
        const response = await fetch(PROJECTS_API);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const projects = await response.json();
        
        if (projects.length === 0) {
            return { projects: [], summaries: [] };
        }
        
        // Get funding summary for all projects
        const summaryResponse = await fetch(`${FUNDING_API}/summary/projects`);
        
        if (!summaryResponse.ok) {
            throw new Error(`HTTP error! Status: ${summaryResponse.status}`);
        }
        
        const projectSummaries = await summaryResponse.json();
        
        return { projects, summaries: projectSummaries };
    } catch (error) {
        console.error('Error loading projects:', error);
        throw error;
    }
}

// Load funding records for a specific project
async function loadFundingRecords(projectId) {
    try {
        const response = await fetch(`${FUNDING_API}?project_id=${projectId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error loading funding records:', error);
        throw error;
    }
}

// Create or update a funding record
async function saveFundingRecord(fundingData, fundingId = null) {
    try {
        let response;
        
        if (!fundingId) {
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
        
        return await response.json();
    } catch (error) {
        console.error('Error saving funding record:', error);
        throw error;
    }
}

// Delete a funding record
async function deleteFundingRecord(fundingId) {
    try {
        const response = await fetch(`${FUNDING_API}/${fundingId}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting funding record:', error);
        throw error;
    }
}

// Calculate funding totals from form inputs
function calculateFundingTotals(inputs) {
    // Calculate total budget
    const personnelBudget = parseFloat(inputs.personnelBudget) || 0;
    const equipmentBudget = parseFloat(inputs.equipmentBudget) || 0;
    const consumablesBudget = parseFloat(inputs.consumablesBudget) || 0;
    const otherBudget = parseFloat(inputs.otherBudget) || 0;
    
    const totalBudget = personnelBudget + equipmentBudget + consumablesBudget + otherBudget;
    
    // Calculate total spent
    const personnelSpent = parseFloat(inputs.personnelSpent) || 0;
    const equipmentSpent = parseFloat(inputs.equipmentSpent) || 0;
    const consumablesSpent = parseFloat(inputs.consumablesSpent) || 0;
    const otherSpent = parseFloat(inputs.otherSpent) || 0;
    
    const totalSpent = personnelSpent + equipmentSpent + consumablesSpent + otherSpent;
    
    // Validate that spent doesn't exceed budget in each category
    const validations = {
        personnel: personnelSpent <= personnelBudget,
        equipment: equipmentSpent <= equipmentBudget,
        consumables: consumablesSpent <= consumablesBudget,
        other: otherSpent <= otherBudget
    };
    
    const allValid = Object.values(validations).every(v => v);
    
    return {
        totalBudget,
        totalSpent,
        validations,
        allValid
    };
}

// Calculate summary data from funding records
function calculateSummaryData(records) {
    const totalFunding = records.reduce((sum, record) => sum + parseFloat(record.total_amount), 0);
    const totalSpent = records.reduce((sum, record) => sum + parseFloat(record.amount_spent), 0);
    const totalRemaining = totalFunding - totalSpent;
    const activeGrantsCount = records.filter(record => record.status === 'active').length;
    
    return {
        totalFunding,
        totalSpent,
        totalRemaining,
        activeGrantsCount
    };
}

// Calculate category breakdown from funding records
function calculateCategoryBreakdown(records) {
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
    
    return {
        personnel: {
            budget: personnelBudget,
            spent: personnelSpent,
            percent: personnelPercent
        },
        equipment: {
            budget: equipmentBudget,
            spent: equipmentSpent,
            percent: equipmentPercent
        },
        consumables: {
            budget: consumablesBudget,
            spent: consumablesSpent,
            percent: consumablesPercent
        },
        other: {
            budget: otherBudget,
            spent: otherSpent,
            percent: otherPercent
        }
    };
}

module.exports = {
    capitalize,
    loadProjects,
    loadFundingRecords,
    saveFundingRecord,
    deleteFundingRecord,
    calculateFundingTotals,
    calculateSummaryData,
    calculateCategoryBreakdown
};