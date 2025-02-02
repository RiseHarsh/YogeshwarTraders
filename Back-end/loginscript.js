
    document.getElementById('loginForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            

            const data = await response.json();

            if (data.success) {
                // Redirect to Admin Dashboard on successful login
                window.location.href = 'dashboard.html'; // Replace with the actual URL of your admin dashboard
            } else {
                // Show error message if login fails
                const errorMessage = document.getElementById('errorMessage');
                errorMessage.style.display = 'block';
                errorMessage.textContent = data.message || 'Invalid credentials. Please try again.';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
