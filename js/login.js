const API_BASE_URL = 'http://localhost:5000/api';

const urlParams = new URLSearchParams(window.location.search);
const returnedURL = urlParams.get('returned');

document.addEventListener('DOMContentLoaded', function () {
    const authHeader = document.getElementById('authHeader');
    const authForm = document.getElementById('authForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const authButton = document.getElementById('authButton');
    const messageArea = document.getElementById('messageArea');
    const toggleText = document.getElementById('toggleText');
    const toggleAuthMode = document.getElementById('toggleAuthMode');

    let isLoginMode = true; // State to track if it's login or signup mode

    // Function to display messages
    function showMessage(message, type) {
        messageArea.innerHTML = message;
        messageArea.className = 'message-area'; // Reset classes
        messageArea.classList.add(type); // Add success or error class
        messageArea.style.display = 'block'; // Show the message area
    }

    // Function to clear messages
    function clearMessage() {
        messageArea.style.display = 'none';
        messageArea.textContent = '';
        messageArea.className = 'message-area';
    }

    // Function to switch between login and signup modes
    function toggleMode() {
        isLoginMode = !isLoginMode;
        clearMessage(); // Clear messages when switching modes

        if (isLoginMode) {
            authHeader.textContent = 'Login';
            authButton.textContent = 'Login';
            toggleText.textContent = "Don't have an account?";
            toggleAuthMode.textContent = 'Sign Up';
        } else {
            authHeader.textContent = 'Sign Up';
            authButton.textContent = 'Sign Up';
            toggleText.textContent = "Already have an account?";
            toggleAuthMode.textContent = 'Login';
        }
    }

    // Simulate API call for authentication
    async function authenticateUser(email, password) {
        // In a real application, you would send this to your backend:
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        return data;


    }

    // Handle form submission
    authForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent default form submission

        clearMessage(); // Clear previous messages

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showMessage('Please fill in all fields.', 'error');
            return;
        }

        authButton.disabled = true; // Disable button during submission
        authButton.textContent = isLoginMode ? 'Logging in...' : 'Signing up...';

        const result = await authenticateUser(email, password);

        authButton.disabled = false; // Re-enable button
        authButton.textContent = isLoginMode ? 'Login' : 'Sign Up';

        if (result.success) {
            showMessage(result.message, 'success');
            localStorage.setItem('token', result.token); // Store token in localStorage
            // In a real app, redirect to chat page or dashboard
            window.location.href = returnedURL || '/chat.html'; // Redirect to chat page or dashboard
        } else {
            showMessage(result.message, 'error');
        }
    });

    // Toggle mode on link click
    toggleAuthMode.addEventListener('click', function (event) {
        event.preventDefault();
        toggleMode();
    });
});