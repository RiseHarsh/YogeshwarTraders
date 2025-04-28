document.addEventListener("DOMContentLoaded", async function () {
    const productContainer = document.getElementById("product-container");

    async function fetchProducts() {
        try {
            const response = await fetch("https://firestore.googleapis.com/v1/projects/yogeshwar-traders/databases/(default)/documents/products");
            const data = await response.json();

            if (!data.documents) {
                console.error("No products found.");
                return;
            }

            const products = data.documents.map(doc => {
                const fields = doc.fields;
                return {
                    id: doc.name.split("/").pop(), // Extract document ID
                    title: fields.title.stringValue,
                    price: fields.price.stringValue,
                    discount: fields.discount.stringValue,
                    imageUrls: fields.imageUrls ? fields.imageUrls.arrayValue.values.map(val => val.stringValue) : ["placeholder.jpg"]
                };
            });

            displayProducts(products);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }

    function displayProducts(products) {
        productContainer.innerHTML = "";
        products.forEach(product => {
            const productHTML = `
                <div class="col-md-4">
                    <div class="card">
                        <img src="${product.imageUrls[0]}" loading="lazy" alt="${product.title}" class="card-img-top">
                        <div class="card-body">
                            <h5 class="card-title">${product.title}</h5>
                            <p>₹${product.price} (${product.discount}% off)</p>
                            <a href="product.html?id=${product.id}" class="btn btn-primary">View Details</a>
                            <a href="https://wa.me/7900189415?text=I want to order ${product.title}" class="btn btn-success">Order Now</a>
                        </div>
                    </div>
                </div>
            `;
            productContainer.innerHTML += productHTML;
        });
    }

    fetchProducts();

    // ✅ Admin Login Redirect on Double Click
    let logo = document.getElementById("admin-logo");
    if (logo) {
        logo.addEventListener("dblclick", function () {
            window.location.href = "login.html"; // Redirect to admin login page
        });
    }
});
