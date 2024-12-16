window.onload = function() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productContainer = document.getElementById('product-container');

    products.forEach(product => {
        const productHTML = `
            <div class="card" style="width: 18rem;">
                <img src="${product.imageUrl}" class="card-img-top" alt="${product.title}" />
                <div class="card-body">
                    <h5 class="card-title">${product.title}</h5>
                    <p class="card-text">${product.description}</p>
                    <p>Price: ₹${product.price}</p>
                    <p>Discount: ${product.discount}%</p>
                    <p>Date Listed: ${product.date}</p>
                    <a href="#" class="btn btn-primary">More</a>
                </div>
            </div>
        `;
        productContainer.innerHTML += productHTML;
    });
};
