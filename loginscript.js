// Hardcoded credentials for demonstration
const correctUsername = "admin";
const correctPassword = "admin123"; // Replace with actual password or use server-side authentication

document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === correctUsername && password === correctPassword) {
        // Redirect to Admin Dashboard on successful login
        window.location.href = 'dashboard.html'; // Replace with the actual URL of your admin dashboard
    } else {
        // Show error message if login fails
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.style.display = 'block';
    }
});
