// signup-google.js - Handles completion of Google authentication signup
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const form = document.getElementById('googleSignupForm');
    const roleInputs = document.querySelectorAll('input[name="role"]');
    const formStatus = document.getElementById('formStatus');
    const googleProfileInfo = document.getElementById('googleProfileInfo');
    
    // Step navigation buttons
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const steps = document.querySelectorAll('.form-step');
    
    let currentStep = 0;
    
    /**
     * Get dashboard URL based on user role
     * @param {string} role - User role (admin, reviewer, researcher)
     * @returns {string} - URL path to appropriate dashboard
     */
    function getDashboardUrlByRole(role) {
        // Normalize role to lowercase for case-insensitive comparison
        const normalizedRole = role.toLowerCase();
        
        switch (normalizedRole) {
            case 'admin':
                return '/roles/admin/dashboard.html';
            case 'reviewer':
                return '/roles/reviewer/dashboard.html';
            case 'researcher':
                return '/roles/researcher/dashboard.html';
        }
    }
    
    // Fetch Google profile information from session
    async function fetchGoogleProfile() {
        try {
            const response = await fetch('/api/auth/google-profile');
            const data = await response.json();
            
            if (!data.profile) {
                window.location.href = '/login?error=missing_google_profile';
                return;
            }
            
            // Display Google profile info
            const profile = data.profile;
            googleProfileInfo.innerHTML = `
                <div class="google-profile">
                    <div class="profile-header">
                        <div class="profile-avatar">
                            ${profile.picture ? `<img src="${profile.picture}" alt="Profile">` : `<div class="avatar-placeholder"><i class="fas fa-user"></i></div>`}
                        </div>
                        <div class="profile-details">
                            <h3>${profile.name}</h3>
                            <p>${profile.email}</p>
                        </div>
                    </div>
                    <div class="profile-message">
                        <p><i class="fas fa-info-circle"></i> You're signing up with Google. Just fill in a few more details to complete your profile.</p>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error fetching Google profile:', error);
            formStatus.innerHTML = `<div class="error">Error loading profile information. Please try again.</div>`;
        }
    }
    
    // Handle step navigation
    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });
        currentStep = stepIndex;
    }
    
    // Next button click
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            const roleFields = document.querySelectorAll(`[data-role]`);
            const selectedRole = document.querySelector('input[name="role"]:checked').value;
            
            // Show/hide fields based on selected role
            roleFields.forEach(field => {
                const roles = field.getAttribute('data-role').split(' ');
                if (roles.includes(selectedRole)) {
                    field.style.display = 'block';
                    const inputs = field.querySelectorAll('input, select, textarea');
                    inputs.forEach(input => {
                        if (roles.includes(selectedRole)) {
                            input.setAttribute('required', '');
                        } else {
                            input.removeAttribute('required');
                        }
                    });
                } else {
                    field.style.display = 'none';
                }
            });
            
            showStep(currentStep + 1);
        });
    }
    
    // Previous button click
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            showStep(currentStep - 1);
        });
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
            
            // Basic validation
            let isValid = true;
            const selectedRole = document.querySelector('input[name="role"]:checked').value;
            const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
            
            requiredFields.forEach(field => {
                // Only validate fields that are currently displayed
                const fieldGroup = field.closest('.form-group');
                if (!fieldGroup || fieldGroup.style.display !== 'none') {
                    if (!field.value.trim()) {
                        const errorOutput = form.querySelector(`output[for="${field.id}"]`);
                        if (errorOutput) {
                            errorOutput.textContent = `${field.name} is required`;
                        }
                        isValid = false;
                    }
                }
            });
            
            // Check terms agreement
            const termsCheck = document.getElementById('termsAgree');
            if (!termsCheck.checked) {
                const errorOutput = form.querySelector('output[for="termsAgree"]');
                if (errorOutput) {
                    errorOutput.textContent = 'You must agree to the terms and conditions';
                }
                isValid = false;
            }
            
            if (!isValid) {
                formStatus.innerHTML = `<div class="error">Please correct the errors before submitting.</div>`;
                return;
            }
            
            // Show loading status
            formStatus.innerHTML = `<div class="info">Processing your information...</div>`;
            
            // Gather form data
            const formData = new FormData(form);
            const userData = {};
            
            for (const [key, value] of formData.entries()) {
                userData[key] = value;
            }
            
            try {
                // Send form data to server
                const response = await fetch('/api/signup-google', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                const result = await response.json();
                
                if (!response.ok) {
                    // Handle validation errors
                    if (result.errors) {
                        Object.entries(result.errors).forEach(([field, message]) => {
                            const errorOutput = form.querySelector(`output[for="${field}"]`);
                            if (errorOutput) {
                                errorOutput.textContent = message;
                            }
                        });
                        formStatus.innerHTML = `<div class="error">${result.message}</div>`;
                    } else {
                        formStatus.innerHTML = `<div class="error">${result.message || 'An error occurred'}</div>`;
                    }
                    return;
                }
                
                // Success - show success message and redirect
                formStatus.innerHTML = `<div class="success">${result.message}</div>`;
                
                // Save authentication data - Store user in a consistent way to match auth.js
                if (result.user) {
                    localStorage.setItem('supabaseUser', JSON.stringify(result.user));
                }
                
                // Get the user's role to redirect to the appropriate dashboard
                const userRole = result.user?.user_metadata?.role || selectedRole || 'researcher';
                
                // Get the appropriate dashboard URL based on role
                const dashboardUrl = getDashboardUrlByRole(userRole);
                
                // Redirect to dashboard after successful signup
                setTimeout(() => {
                    window.location.href = dashboardUrl || '/dashboard';
                }, 1500);
                
            } catch (error) {
                console.error('Error submitting form:', error);
                formStatus.innerHTML = `<div class="error">An unexpected error occurred. Please try again.</div>`;
            }
        });
    }
    
    // Add API endpoint to get Google profile data from session
    fetchGoogleProfile();
});