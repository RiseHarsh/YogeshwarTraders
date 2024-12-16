document.getElementById('productForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const title = document.getElementById('productTitle').value;
    const description = document.getElementById('productDescription').value;
    const price = document.getElementById('productPrice').value;
    const discount = document.getElementById('productDiscount').value;
    const productImage = document.getElementById('productImage').files[0];

    const date = new Date().toLocaleString();

    // Create product object
    const product = {
        title,
        description,
        price,
        discount,
        date,
        imageUrl: URL.createObjectURL(productImage)
    };

    // Get existing products from localStorage or create an empty array
    const products = JSON.parse(localStorage.getItem('products')) || [];

    // Add new product to the array
    products.push(product);

    // Save updated products list to localStorage
    localStorage.setItem('products', JSON.stringify(products));

    // Display success message
    alert('Product added successfully!');
    this.reset();
});

function showSection(sectionId) {
    document.querySelectorAll('.main-content section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

function logout() {
    alert('Logged out successfully!');
    
        // Clear any session or localStorage data (if used for authentication)
        localStorage.removeItem('authToken'); // If you store an auth token or user session in localStorage
        sessionStorage.removeItem('authToken'); // If using sessionStorage
    
        // Redirect to login page
        window.location.href = 'index.html'; // Replace with the actual login page URL

    
}
