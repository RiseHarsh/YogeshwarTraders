document.getElementById('productForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const title = document.getElementById('productTitle').value;
    const description = document.getElementById('productDescription').value;
    const price = document.getElementById('productPrice').value;
    const discount = document.getElementById('productDiscount').value;

    const date = new Date().toLocaleString();

    const newRow = `<tr>
        <td>${title}</td>
        <td>${description}</td>
        <td>${price}</td>
        <td>${discount}%</td>
        <td>${date}</td>
    </tr>`;
    document.getElementById('productsTable').innerHTML += newRow;

    alert('Product added successfully!');
    this.reset();
});

document.getElementById('passwordForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    // Add logic to validate current password
    alert('Password changed successfully!');
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
    // Redirect to login page or clear session
}
