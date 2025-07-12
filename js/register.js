const API_BASE_URL = 'https://lime-chat-back-production.up.railway.app/api';

const urlParams = new URLSearchParams(window.location.search);
const returnedURL = urlParams.get('returned');

document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('registerForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('terms');
    const submitBtn = document.getElementById('registerBtn');
    const btnLoading = document.getElementById('btnLoading');
    const btnText = document.getElementById('btnText');
    const successMessage = document.getElementById('successMessage');

    // Password toggle functionality
    const passwordToggle = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');

    passwordToggle.addEventListener('click', () => {
        togglePasswordVisibility(passwordInput, passwordToggle);
    });

    confirmPasswordToggle.addEventListener('click', () => {
        togglePasswordVisibility(confirmPasswordInput, confirmPasswordToggle);
    });

    function togglePasswordVisibility(input, toggle) {
        if (input.type === 'password') {
            input.type = 'text';
            toggle.textContent = '🙈';
        } else {
            input.type = 'password';
            toggle.textContent = '👁️';
        }
    }

    // Validation functions
    function validateFullName(name) {
        const nameRegex = /^[a-zA-Z\s]{2,50}$/;
        return nameRegex.test(name.trim());
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    function showError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorElement = document.getElementById(inputId + 'Error');

        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    function clearError(inputId) {
        const input = document.getElementById(inputId);
        const errorElement = document.getElementById(inputId + 'Error');

        input.classList.remove('error');
        errorElement.classList.remove('show');
    }

    function clearAllErrors() {
        const inputs = ['fullName', 'email', 'password', 'confirmPassword'];
        inputs.forEach(clearError);
    }

    // Real-time validation
    fullNameInput.addEventListener('input', function () {
        if (this.value.trim() !== '') {
            if (validateFullName(this.value)) {
                clearError('fullName');
            } else {
                showError('fullName', 'Please enter a valid name (2-50 characters, letters only)');
            }
        } else {
            clearError('fullName');
        }
    });

    emailInput.addEventListener('input', function () {
        if (this.value.trim() !== '') {
            if (validateEmail(this.value)) {
                clearError('email');
            } else {
                showError('email', 'Please enter a valid email address');
            }
        } else {
            clearError('email');
        }
    });

    passwordInput.addEventListener('input', function () {
        if (this.value !== '') {
            if (validatePassword(this.value)) {
                clearError('password');
            } else {
                showError('password', 'Password must be at least 8 characters with uppercase, lowercase, and number');
            }
        } else {
            clearError('password');
        }

        // Check confirm password if it has a value
        if (confirmPasswordInput.value !== '') {
            if (this.value === confirmPasswordInput.value) {
                clearError('confirmPassword');
            } else {
                showError('confirmPassword', 'Passwords do not match');
            }
        }
    });

    confirmPasswordInput.addEventListener('input', function () {
        if (this.value !== '') {
            if (this.value === passwordInput.value) {
                clearError('confirmPassword');
            } else {
                showError('confirmPassword', 'Passwords do not match');
            }
        } else {
            clearError('confirmPassword');
        }
    });

    // Form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        clearAllErrors();
        let isValid = true;

        // Validate full name
        if (!fullNameInput.value.trim()) {
            showError('fullName', 'Full name is required');
            isValid = false;
        } else if (!validateFullName(fullNameInput.value)) {
            showError('fullName', 'Please enter a valid name (2-50 characters, letters only)');
            isValid = false;
        }

        // Validate email
        if (!emailInput.value.trim()) {
            showError('email', 'Email address is required');
            isValid = false;
        } else if (!validateEmail(emailInput.value)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }

        // Validate password
        if (!passwordInput.value) {
            showError('password', 'Password is required');
            isValid = false;
        } else if (!validatePassword(passwordInput.value)) {
            showError('password', 'Password must be at least 8 characters with uppercase, lowercase, and number');
            isValid = false;
        }

        // Validate confirm password
        if (!confirmPasswordInput.value) {
            showError('confirmPassword', 'Please confirm your password');
            isValid = false;
        } else if (passwordInput.value !== confirmPasswordInput.value) {
            showError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }

        // Check terms checkbox
        if (!termsCheckbox.checked) {
            alert('Please accept the Terms of Service and Privacy Policy');
            isValid = false;
        }

        if (isValid) {
            // Show loading state
            submitBtn.disabled = true;
            btnLoading.style.display = 'inline-block';
            btnText.textContent = 'Creating Account...';

            // Simulate API call
            setTimeout(() => {
                // Hide loading state
                submitBtn.disabled = false;
                btnLoading.style.display = 'none';
                btnText.textContent = 'Create Account';

                // Show success message
                successMessage.classList.add('show');
                form.reset();

                // In a real app, you would redirect to login or dashboard
                console.log('Registration successful!', {
                    fullName: fullNameInput.value,
                    email: emailInput.value,
                    password: passwordInput.value
                });

                // Hide success message after 5 seconds
                setTimeout(() => {
                    successMessage.classList.remove('show');
                }, 5000);
            }, 2000);
        }
    });

    // Add smooth focus effects
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function () {
            this.parentElement.classList.remove('focused');
        });
    });

});