document.addEventListener("DOMContentLoaded", async function () {
  console.log("Initializing Firebase...");

  const response = await fetch("env.json");
  const env = await response.json();

  const firebaseConfig = {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    appId: env.FIREBASE_APP_ID,
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  // Supabase setup
  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_KEY = env.SUPABASE_ANON_KEY;

  // Cloudinary setup
  const CLOUD_NAME = env.Cloud_Name;
  const UPLOAD_PRESET = env.Upload_Preset;

  auth.onAuthStateChanged((user) => {
    if (!user) {
      alert("You must be logged in to access the admin panel.");
      window.location.href = "index.html";
    }
  });

  // ✅ Logout function
  window.logout = function () {
    auth.signOut().then(() => {
      window.location.href = "index.html";
    });
  };

  // ✅ Cloudinary Image Upload Function
  async function uploadToCloudinary(image) {
    const CLOUDINARY_URL =
      "https://api.cloudinary.com/v1_1/dkux9iebb/image/upload";
    const CLOUDINARY_UPLOAD_PRESET = "yt_preset";

    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Cloudinary image upload failed!");
    }

    const data = await response.json();
    return data.secure_url; // ✅ Cloudinary returns a secure image URL
  }

  // ✅ Add Product with Cloudinary Image Upload
  document
    .getElementById("productForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const title = document.getElementById("productTitle").value;
      const description = document.getElementById("productDescription").value;
      const price = document.getElementById("productPrice").value;
      const discount = document.getElementById("productDiscount").value;
      const stock = document.getElementById("productStock").value;
      const category = document.getElementById("productCategory").value;
      const images = document.getElementById("productImages").files;

      if (images.length === 0) {
        alert("Please upload at least one product image.");
        return;
      }

      const imageUrls = [];
      for (const image of images) {
        try {
          const imageUrl = await uploadToCloudinary(image);
          imageUrls.push(imageUrl);
        } catch (error) {
          console.error("Error uploading image:", error);
          alert("❌ Failed to upload image. Please try again.");
          return;
        }
      }

      await db.collection("products").add({
        title,
        description,
        category,
        price,
        discount,
        stock,
        imageUrls, // ✅ Store Cloudinary image URLs in Firestore
        date: new Date().toISOString(),
      });

      alert("✅ Product added successfully!");
      document.getElementById("productForm").reset();
      loadProducts();
    });

  // ✅ Load Products (Including Images)
  async function loadProducts() {
    const productsTable = document.getElementById("productsTable");
    productsTable.innerHTML = "";

    const snapshot = await db.collection("products").get();
    if (!snapshot || snapshot.empty) {
      console.warn("No products found.");
      return;
    }

    snapshot.forEach((doc) => {
      const product = doc.data();
      const docId = doc.id;
      const stockBadge =
        product.stock === "Available" ? "✅ In Stock" : "❌ Out of Stock";

      const imagesHTML = product.imageUrls
        ? product.imageUrls
            .map((url) => `<img src="${url}" width="50" height="50">`)
            .join(" ")
        : "No Image";

      productsTable.innerHTML += `
                    <tr>
                        <td>${product.title}</td>
                        <td>${product.description}</td>
                        <td>${product.category}</td>
                        <td>${product.price}</td>
                        <td>${
                          product.discount ? product.discount + "%" : "N/A"
                        }</td>
                        <td>${stockBadge}</td>
                        <td>${imagesHTML}</td>
                        <td>
                            <button onclick="editProduct('${docId}')">✏️ Edit</button>
                            <button onclick="deleteProduct('${docId}')">🗑 Delete</button>
                        </td>
                    </tr>
                `;
    });
  }

  // ✅ Delete Product
  window.deleteProduct = async function (id) {
    if (confirm("Are you sure you want to delete this product?")) {
      await db.collection("products").doc(id).delete();
      alert("✅ Product deleted!");
      loadProducts();
    }
  };

  // ✅ Edit Product
  window.editProduct = async function (id) {
    const newTitle = prompt("Enter new product title:");
    if (newTitle) {
      await db.collection("products").doc(id).update({ title: newTitle });
      alert("✅ Product updated!");
      loadProducts();
    }
  };

  loadProducts();
});

// Load Reviews for Admin
async function loadAdminReviews() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/Reviews?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  const reviews = await response.json();

  const reviewsTableBody = document.getElementById("reviews-table-body");
  reviewsTableBody.innerHTML = "";

  if (reviews.length === 0) {
    reviewsTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No reviews available.</td></tr>`;
    return;
  }

  reviews.forEach((r) => {
    const tr = document.createElement("tr");

    // Fetch product title from Supabase (or Firebase if needed)
    const productTitle = r.product_title || "Unknown Product";

    // Product Title
    const tdProduct = document.createElement("td");
    tdProduct.textContent = productTitle;
    tr.appendChild(tdProduct);

    // User Name
    const tdUser = document.createElement("td");
    tdUser.textContent = r.user_name;
    tr.appendChild(tdUser);

    // Feedback (shortened with Read more)
    const tdFeedback = document.createElement("td");
    const shortFeedback =
      r.feedback.length > 50 ? r.feedback.substring(0, 50) + "..." : r.feedback;
    tdFeedback.innerHTML = `${shortFeedback} ${
      r.feedback.length > 50
        ? `<a href="#" onclick="alert('${r.feedback.replace(
            /'/g,
            "\\'"
          )}')">Read More</a>`
        : ""
    }`;
    tr.appendChild(tdFeedback);

    // Rating (stars)
    const tdRating = document.createElement("td");
    tdRating.innerHTML = renderStars(r.rating);
    tr.appendChild(tdRating);

    // Images (lightbox)
    const tdImages = document.createElement("td");
    if (r.image_urls && r.image_urls.length > 0) {
      r.image_urls.forEach((imgUrl) => {
        const imgLink = document.createElement("a");
        imgLink.href = imgUrl;
        imgLink.setAttribute("data-lightbox", "review-images");
        imgLink.innerHTML = `<img src="${imgUrl}" style="width:40px; height:40px; margin:2px;">`;
        tdImages.appendChild(imgLink);
      });
    } else {
      tdImages.textContent = "No images";
    }
    tr.appendChild(tdImages);

    // Date
    const tdDate = document.createElement("td");
    tdDate.textContent = new Date(r.created_at).toLocaleDateString();
    tr.appendChild(tdDate);

    // Actions (Delete button)
    const tdActions = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = () => deleteReview(r.id);
    tdActions.appendChild(deleteBtn);
    tr.appendChild(tdActions);

    reviewsTableBody.appendChild(tr);
  });
}

// Helper for deleting review
async function deleteReview(reviewId) {
  if (!confirm("Are you sure you want to delete this review?")) return;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/Reviews?id=eq.${reviewId}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    if (response.ok) {
      alert("Review deleted successfully!");
      loadAdminReviews(); // Reload after delete
    } else {
      const result = await response.json();
      console.error("Error deleting review:", result);
      alert("Error deleting review!");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while deleting the review.");
  }
}

// Render stars for rating
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStars = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStars;

  return (
    "★".repeat(fullStars) + (halfStars ? "☆" : "") + "☆".repeat(emptyStars)
  );
}

// ✅ Show Section Function (Fix for "showSection is not defined" error)
function showSection(sectionId) {
  document.querySelectorAll("main section").forEach((section) => {
    section.classList.add("hidden"); // Hide all sections
  });
  document.getElementById(sectionId).classList.remove("hidden"); // Show selected section
}
