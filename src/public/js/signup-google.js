// signup-google.js - Handles completion of Google authentication signup
document.addEventListener('DOMContentLoaded', async function() {
    // Elements
    const form = document.getElementById('googleSignupForm');
    const roleInputs = document.querySelectorAll('input[name="role"]');
    const formStatus = document.getElementById('formStatus');
    const googleProfileInfo = document.getElementById('googleProfileInfo');
    const errorMessage = document.getElementById('error-message');
    
    // Step navigation buttons
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const steps = document.querySelectorAll('.form-step');
    
    let currentStep = 0;
    let googleProfile = null;
    
    // Store token for reuse in API calls
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    /**
     * Get dashboard URL based on user role
     * @param {string} role - User role (admin, reviewer, researcher)
     * @returns {string} - URL path to appropriate dashboard
     */
    function getDashboardUrlByRole(role) {
        // Normalize role to lowercase for case-insensitive comparison
        const normalizedRole = role ? role.toLowerCase() : 'researcher';
        
        switch (normalizedRole) {
            case 'admin':
                return '/roles/admin/dashboard.html';
            case 'reviewer':
                return '/roles/reviewer/dashboard.html';
            case 'researcher':
                return '/roles/researcher/dashboard.html';
            default:
                return '/roles/researcher/dashboard.html';
        }
    }
    
    /**
     * Fetch Google profile data from server
     * Tries both session and token approaches
     */
    async function fetchGoogleProfile() {
        try {
            // Construct URL with token if available
            let url = '/api/auth/google-profile';
            if (token) {
                url += `?token=${token}`;
            }
            
            console.log('Fetching Google profile from:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch Google profile: ${response.status}`);
            }
            
            const data = await response.json();
            googleProfile = data.profile;
            
            if (googleProfile) {
                // Display profile information to user
                displayGoogleProfile(googleProfile);
                return googleProfile;
            } else {
                throw new Error('No profile data returned from server');
            }
        } catch (error) {
            console.error('Error fetching Google profile:', error);
            if (errorMessage) {
                errorMessage.textContent = 'Error loading your Google profile. Please try logging in again.';
                errorMessage.style.display = 'block';
            }
            return null;
        }
    }
    
    /**
     * Display Google profile information on the page
     */
    function displayGoogleProfile(profile) {
        if (!googleProfileInfo || !profile) return;
        
        // Create profile information display
        const profileHTML = `
            <div class="google-profile">
                <div class="profile-image">
                    <img src="${profile.picture}" alt="${profile.name}" class="profile-pic">
                </div>
                <div class="profile-info">
                    <h3>${profile.name}</h3>
                    <p>${profile.email}</p>
                </div>
            </div>
        `;
        
        googleProfileInfo.innerHTML = profileHTML;
        
        // Pre-fill email field if it exists
        const emailField = document.getElementById('email');
        if (emailField && profile.email) {
            emailField.value = profile.email;
            if (emailField.readOnly !== true) {
                emailField.readOnly = true;
            }
        }
        
        // Pre-fill name field if it exists
        const nameField = document.getElementById('name');
        if (nameField && profile.name) {
            nameField.value = profile.name;
        }
    }
    
    // Helper functions for validation - based on signup.js
    function showError(input, message) {
        const errorOutput = form.querySelector(`output[for="${input.id}"]`);
        if (errorOutput) {
            errorOutput.textContent = message;
            errorOutput.style.display = 'block';
        } else {
            // Create error element if it doesn't exist
            const errorElement = document.createElement('output');
            errorElement.setAttribute('for', input.id);
            errorElement.className = 'error-message';
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            input.parentNode.insertBefore(errorElement, input.nextSibling);
        }
        input.classList.add('error');
    }
    
    function clearError(input) {
        const errorOutput = form.querySelector(`output[for="${input.id}"]`);
        if (errorOutput) {
            errorOutput.textContent = '';
            errorOutput.style.display = 'none';
        }
        input.classList.remove('error');
    }
    
    function validateSouthAfricanPhone(phone) {
        // Empty is not valid but will be caught by required attribute
        if (!phone) return { valid: true, message: '' };
        
        // Check for +27 format
        if (phone.startsWith('+27')) {
            // +27 should be followed by 9 digits
            if (phone.length !== 12) {
                return { valid: false, message: 'Phone number must be +27 followed by 9 digits' };
            }
            
            // Check if the digit after +27 is 6, 7 or 8
            const thirdDigit = phone.charAt(3);
            if (!['6', '7', '8'].includes(thirdDigit)) {
                return { valid: false, message: 'After +27, number must start with 6, 7, or 8' };
            }
            
            return { valid: true, message: '' };
        } 
        // Check for 0 format (must be 10 digits starting with 06, 07, or 08)
        else if (phone.startsWith('0')) {
            if (phone.length !== 10) {
                return { valid: false, message: 'Phone number must be 10 digits' };
            }
            
            // Check if starts with 06, 07 or 08
            const secondDigit = phone.charAt(1);
            if (!['6', '7', '8'].includes(secondDigit)) {
                return { valid: false, message: 'Number must start with 06, 07, or 08' };
            }
            
            return { valid: true, message: '' };
        } 
        else {
            return { valid: false, message: 'Must start with +27 or 0' };
        }
    }
    
    function validateWitsEmail(input, email) {
        if (!email) return true; // Empty will be caught by required attribute
        
        // Must match pattern: digits@students.wits.ac.za
        const witsEmailRegex = /^(\d+)@students\.wits\.ac\.za$/;
        
        if (!witsEmailRegex.test(email)) {
            showError(input, 'Email must be in format: studentnumber@students.wits.ac.za');
            return false;
        } else {
            clearError(input);
            return true;
        }
    }
    
    // Handle step navigation
    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });
        currentStep = stepIndex;
        
        // Update button visibility
        if (prevBtn) prevBtn.style.display = currentStep === 0 ? 'none' : 'inline-block';
        if (nextBtn) nextBtn.style.display = currentStep === steps.length - 1 ? 'none' : 'inline-block';
    }
    
    // Next button click
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            // Get current step
            const currentStepEl = document.querySelector('.form-step.active');
            
            // Basic validation for current step
            const inputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    showError(input, 'This field is required');
                } else {
                    // Additional validation for specific field types
                    if (input.id === 'email' && !input.readOnly) {
                        if (!validateWitsEmail(input, input.value.trim())) {
                            isValid = false;
                        }
                    } else if (input.type === 'tel' || input.id.includes('phone') || input.id.includes('contact')) {
                        const phoneValid = validateSouthAfricanPhone(input.value.trim());
                        if (!phoneValid.valid) {
                            showError(input, phoneValid.message);
                            isValid = false;
                        }
                    } else if (input.id.includes('name')) {
                        // Name validation - only letters, spaces, hyphens, and apostrophes
                        const value = input.value.trim();
                        if (/[^a-zA-Z\s\-']/.test(value)) {
                            showError(input, 'Only letters, spaces, hyphens and apostrophes are allowed');
                            isValid = false;
                        } else {
                            clearError(input);
                        }
                    } else {
                        clearError(input);
                    }
                }
            });
            
            if (!isValid) {
                return;
            }
            
            const roleFields = document.querySelectorAll(`[data-role]`);
            const selectedRole = document.querySelector('input[name="role"]:checked')?.value || 'researcher';
            
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
                    // Remove required attribute from hidden fields
                    const inputs = field.querySelectorAll('input, select, textarea');
                    inputs.forEach(input => input.removeAttribute('required'));
                }
            });
            
            showStep(currentStep + 1);
            window.scrollTo(0, 0); // Scroll to top
        });
    }
    
    // Previous button click
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            showStep(currentStep - 1);
            window.scrollTo(0, 0); // Scroll to top
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
            
            const activeStep = document.querySelector('.form-step.active');
            const requiredFields = activeStep.querySelectorAll('input[required], select[required], textarea[required]');
            
            requiredFields.forEach(field => {
                // Only validate fields that are currently displayed
                const fieldGroup = field.closest('.form-group');
                if (!fieldGroup || getComputedStyle(fieldGroup).display !== 'none') {
                    if (!field.value.trim()) {
                        showError(field, `${field.name || field.id} is required`);
                        isValid = false;
                    } else if (field.type === 'tel' || field.id.includes('phone') || field.id.includes('contact')) {
                        const phoneValid = validateSouthAfricanPhone(field.value.trim());
                        if (!phoneValid.valid) {
                            showError(field, phoneValid.message);
                            isValid = false;
                        }
                    } else if (field.id.includes('name')) {
                        // Name validation
                        if (/[^a-zA-Z\s\-']/.test(field.value)) {
                            showError(field, 'Only letters, spaces, hyphens and apostrophes are allowed');
                            isValid = false;
                        }
                    }
                }
            });
            
            // Check terms agreement
            const termsCheck = document.getElementById('termsAgree');
            if (termsCheck && !termsCheck.checked) {
                showError(termsCheck, 'You must agree to the terms and conditions');
                isValid = false;
            }
            
            if (!isValid) {
                formStatus.innerHTML = `<div class="error">Please correct the errors before submitting.</div>`;
                return;
            }
            
            // Show loading status
            formStatus.innerHTML = `<div class="info">Processing your information...</div>`;
            
            // Gather form data from all steps
            const formData = new FormData(form);
            const userData = {};
            
            for (const [key, value] of formData.entries()) {
                userData[key] = value;
            }
            
            // Additional fields from Google profile
            if (googleProfile) {
                if (!userData.email && googleProfile.email) {
                    userData.email = googleProfile.email;
                }
                if (!userData.name && googleProfile.name) {
                    userData.name = googleProfile.name;
                }
                if (googleProfile.picture) {
                    userData.picture = googleProfile.picture;
                }
                if (googleProfile.given_name) {
                    userData.firstName = googleProfile.given_name;
                }
                if (googleProfile.family_name) {
                    userData.lastName = googleProfile.family_name;
                }
                
                // Include Google ID for linking account
                userData.googleId = googleProfile.sub || googleProfile.id;
            }
            
            // Include selected role or default to researcher
            const selectedRole = document.querySelector('input[name="role"]:checked')?.value;
            if (selectedRole) {
                userData.role = selectedRole;
            } else {
                userData.role = 'researcher';
            }
            
            // Log form data for debugging
            console.log("Form data being sent:", userData);
            
            try {
                // Construct URL with token if available
                let url = '/api/signup-google';
                if (token) {
                    url += `?token=${token}`;
                }
                
                // Send form data to server
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                if (!response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const result = await response.json();
                        
                        // Handle validation errors
                        if (result.errors) {
                            Object.entries(result.errors).forEach(([field, message]) => {
                                const fieldElement = document.getElementById(field);
                                if (fieldElement) {
                                    showError(fieldElement, message);
                                    
                                    // If field is in a hidden step, show that step
                                    const fieldStep = fieldElement.closest('.form-step');
                                    if (fieldStep && !fieldStep.classList.contains('active')) {
                                        document.querySelector('.form-step.active').classList.remove('active');
                                        fieldStep.classList.add('active');
                                    }
                                }
                            });
                        }
                        
                        formStatus.innerHTML = `<div class="error">${result.message || 'An error occurred'}</div>`;
                    } else {
                        // Handle non-JSON responses
                        const errorText = await response.text();
                        formStatus.innerHTML = `<div class="error">Server error: ${response.status} ${response.statusText}</div>`;
                        console.error('Server error response:', errorText);
                    }
                    return;
                }
                
                // Parse JSON response
                const result = await response.json();
                
                // Success - show success message and redirect
                formStatus.innerHTML = `<div class="success">${result.message || 'Account created successfully!'}</div>`;
                
                // Save authentication data - Store user in a consistent way to match auth.js
                if (result.user) {
                    localStorage.setItem('supabaseUser', JSON.stringify(result.user));
                    
                    // Also store session or token if provided
                    if (result.session) {
                        localStorage.setItem('supabaseSession', JSON.stringify(result.session));
                    }
                    if (result.token) {
                        localStorage.setItem('authToken', result.token);
                    }
                }
                
                // Get the user's role to redirect to the appropriate dashboard
                const userRole = result.user?.user_metadata?.role || selectedRole || 'researcher';
                
                // Get the appropriate dashboard URL based on role
                const dashboardUrl = result.redirectUrl || getDashboardUrlByRole(userRole);
                
                // Redirect to dashboard after successful signup
                setTimeout(() => {
                    window.location.href = dashboardUrl;
                }, 1500);
                
            } catch (error) {
                console.error('Error submitting form:', error);
                formStatus.innerHTML = `<div class="error">An unexpected error occurred. Please try again.</div>`;
            }
        });
    }
    
    // Initialize page - fetch Google profile first thing
    try {
        await fetchGoogleProfile();
        
        if (!googleProfile) {
            formStatus.innerHTML = `
                <div class="error">
                    Unable to retrieve your Google profile information. 
                    <a href="/auth/google">Try logging in with Google again</a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    }
    
    // Initialize step visibility
    showStep(0);
});
