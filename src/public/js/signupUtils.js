// Utility to fetch Google profile data
async function fetchGoogleProfile(token) {
    try {
        let url = '/api/auth/google-profile';
        if (token) {
            url += `?token=${token}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch Google profile: ${response.status}`);
        }
        
        const data = await response.json();
        return data.profile || null;
    } catch (error) {
        console.error('Error fetching Google profile:', error);
        return null;
    }
}

// Utility to handle form submission logic
async function handleFormSubmission(form, token, selectedRole) {
    const formData = new FormData(form);
    const userData = {};
    for (const [key, value] of formData.entries()) {
        userData[key] = value;
    }

    try {
        let url = '/api/signup-google';
        if (token) {
            url += `?token=${token}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const result = await response.json();
            return { success: false, message: result.message, errors: result.errors };
        }

        const result = await response.json();
        return { success: true, message: result.message, user: result.user, redirectUrl: result.redirectUrl };
    } catch (error) {
        console.error('Error submitting form:', error);
        return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
}

// Utility to get the dashboard URL based on the role
function getDashboardUrlByRole(role = 'researcher') {
    const normalizedRole = role.toLowerCase();
    switch (normalizedRole) {
        case 'admin':
            return '/roles/admin/dashboard.html';
        case 'reviewer':
            return '/roles/reviewer/dashboard.html';
        case 'researcher':
        default:
            return '/roles/researcher/dashboard.html';
    }
}

module.exports = { fetchGoogleProfile, handleFormSubmission, getDashboardUrlByRole };
