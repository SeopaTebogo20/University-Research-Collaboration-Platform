document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupForm');
    const steps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.next-btn');
    const prevButtons = document.querySelectorAll('.prev-btn');
    const roleRadios = document.querySelectorAll('input[name="role"]');
    const researchFields = document.querySelectorAll('.research-fields');
    const formStatus = document.getElementById('formStatus');
    const passwordToggles = document.querySelectorAll('.toggle-password-visibility');
    
    // Password visibility toggle
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
    
    // Password validation
    const password = document.getElementById('password');
    const lengthReq = document.getElementById('length');
    const uppercaseReq = document.getElementById('uppercase');
    const lowercaseReq = document.getElementById('lowercase');
    const numberReq = document.getElementById('number');
    const specialReq = document.getElementById('special');
    
    if (password) {
        password.addEventListener('input', function() {
            const value = this.value;
            
            // Length check
            if (value.length >= 8) {
                lengthReq.classList.add('valid');
            } else {
                lengthReq.classList.remove('valid');
            }
            
            // Uppercase check
            if (/[A-Z]/.test(value)) {
                uppercaseReq.classList.add('valid');
            } else {
                uppercaseReq.classList.remove('valid');
            }
            
            // Lowercase check
            if (/[a-z]/.test(value)) {
                lowercaseReq.classList.add('valid');
            } else {
                lowercaseReq.classList.remove('valid');
            }
            
            // Number check
            if (/\d/.test(value)) {
                numberReq.classList.add('valid');
            } else {
                numberReq.classList.remove('valid');
            }
            
            // Special character check
            if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
                specialReq.classList.add('valid');
            } else {
                specialReq.classList.remove('valid');
            }
        });
    }
    
    // Show/hide research fields based on selected role
    if (roleRadios && roleRadios.length > 0) {
        roleRadios.forEach(radio => {
            radio.addEventListener('change', updateResearchFields);
        });
        
        function updateResearchFields() {
            const selectedRole = document.querySelector('input[name="role"]:checked')?.value;
            if (!selectedRole) return;
            
            researchFields.forEach(field => {
                const roles = field.dataset.role.split(' ');
                if (roles.includes(selectedRole)) {
                    field.style.display = 'block';
                    const inputs = field.querySelectorAll('input, textarea, select');
                    inputs.forEach(input => input.required = true);
                } else {
                    field.style.display = 'none';
                    const inputs = field.querySelectorAll('input, textarea, select');
                    inputs.forEach(input => {
                        input.required = false;
                        // Remove the next line to prevent clearing values when hiding fields
                        // input.value = ''; // Clear values when hiding fields
                    });
                }
            });
        }
        
        // Initialize research fields visibility
        updateResearchFields();
    }
    
    // Form step navigation
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get current step
            const currentStep = this.closest('.form-step');
            const currentStepIndex = Array.from(steps).indexOf(currentStep);
            
            // Basic validation for current step
            const inputs = currentStep.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    showError(input, 'This field is required');
                } else {
                    clearError(input);
                }
            });
            
            // If email field exists in current step, validate email format
            const emailInput = currentStep.querySelector('#email');
            if (emailInput && emailInput.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailInput.value)) {
                    isValid = false;
                    showError(emailInput, 'Please enter a valid email address');
                }
            }
            
            // If password and confirm password fields exist, check if they match
            const passwordInput = currentStep.querySelector('#password');
            const confirmPasswordInput = currentStep.querySelector('#confirmPassword');
            if (passwordInput && confirmPasswordInput && passwordInput.value && confirmPasswordInput.value) {
                if (passwordInput.value !== confirmPasswordInput.value) {
                    isValid = false;
                    showError(confirmPasswordInput, 'Passwords do not match');
                }
            }
            
            if (!isValid) {
                return;
            }
            
            // Hide current step
            currentStep.classList.remove('active');
            
            // Show next step
            const nextStep = steps[currentStepIndex + 1];
            nextStep.classList.add('active');
            
            // Scroll to top
            window.scrollTo(0, 0);
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get current step
            const currentStep = this.closest('.form-step');
            const currentStepIndex = Array.from(steps).indexOf(currentStep);
            
            // Hide current step
            currentStep.classList.remove('active');
            
            // Show previous step
            const prevStep = steps[currentStepIndex - 1];
            prevStep.classList.add('active');
            
            // Scroll to top
            window.scrollTo(0, 0);
        });
    });
    
    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Final validation
            const activeStep = document.querySelector('.form-step.active');
            const inputs = activeStep.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    showError(input, 'This field is required');
                } else {
                    clearError(input);
                }
            });
            
            // Check if terms are agreed
            const termsAgree = document.getElementById('termsAgree');
            if (termsAgree && !termsAgree.checked) {
                isValid = false;
                showError(termsAgree, 'You must agree to the terms and conditions');
            } else if (termsAgree) {
                clearError(termsAgree);
            }
            
            if (!isValid) {
                return;
            }
            
            // Show loading state
            const submitButton = document.querySelector('.submit-btn');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.classList.add('loading');
            }
            
            // Clear any previous status messages
            if (formStatus) {
                formStatus.textContent = '';
                formStatus.className = 'form-status-message';
                formStatus.style.display = 'none';
            }
            
            // Collect form data from ALL steps, not just the active one
            // This ensures department and academicRole are included even if they're in a different step
            const formData = new FormData(form);
            const formDataObj = {};
            formData.forEach((value, key) => {
                // Make sure empty strings are still included
                formDataObj[key] = value;
            });
            
            // Add all form fields explicitly to ensure they're included
            // This is a fallback to make sure department and academicRole are always sent
            const department = document.getElementById('department');
            const academicRole = document.getElementById('academicRole');
            if (department) {
                formDataObj.department = department.value;
            }
            if (academicRole) {
                formDataObj.academicRole = academicRole.value;
            }
            
            // Log form data for debugging
            console.log("Form data being sent:", formDataObj);
            
            // Use fetch directly to send the data to the server
            fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formDataObj),
            })
            .then(response => response.json())
            .then(data => {
                if (data.message && data.user) {
                    // Success
                    if (formStatus) {
                        formStatus.textContent = data.message;
                        formStatus.className = 'form-status-message success';
                        formStatus.style.display = 'block';
                    }
                    
                    // Clear form
                    form.reset();
                    
                    // Redirect to login page after a delay
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else if (data.errors) {
                    // Validation errors
                    Object.keys(data.errors).forEach(key => {
                        const input = document.getElementById(key);
                        if (input) {
                            showError(input, data.errors[key]);
                        }
                    });
                    
                    if (formStatus) {
                        formStatus.textContent = data.message || 'Please correct the errors above.';
                        formStatus.className = 'form-status-message error';
                        formStatus.style.display = 'block';
                    }
                } else if (data.message) {
                    // Other error
                    if (formStatus) {
                        formStatus.textContent = data.message;
                        formStatus.className = 'form-status-message error';
                        formStatus.style.display = 'block';
                    }
                }
            })
            .catch(error => {
                console.error('Signup error:', error);
                if (formStatus) {
                    formStatus.textContent = 'An error occurred during signup. Please try again later.';
                    formStatus.className = 'form-status-message error';
                    formStatus.style.display = 'block';
                }
            })
            .finally(() => {
                // Reset button state
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.classList.remove('loading');
                }
            });
        });
    }
    
    // Helper functions
    function showError(input, message) {
        const errorElement = document.querySelector(`output[for="${input.id}"]`) || input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        input.classList.add('error');
        
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('validated', 'error');
            formGroup.classList.remove('valid');
        }
    }
    
    function clearError(input) {
        const errorElement = document.querySelector(`output[for="${input.id}"]`) || input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        input.classList.remove('error');
        input.classList.add('valid');
        
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('validated', 'valid');
            formGroup.classList.remove('error');
        }
    }
});
