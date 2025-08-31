//API URL
const fakeStoreapi = 'https://fakestoreapi.com';
//const platziApi = 'https://api.escuelajs.co/api/v1';

let allProducts = [];

// get products
async function fetchProducts() {
    try {
        const res = await fetch(`${fakeStoreapi}/products`);
        // Parse JSON
        const data = await res.json();
        //console.log('Parsed data:', data);
        return data;
    } catch (err) {
        console.error('Error fetching products:', err);
        return [];
    }
}

fetchProducts();


// get featured products
async function getFeaturedProducts() {
    try {
        const products = await fetchProducts();
        const featured = products.slice(0, 8);
        const grid = document.getElementById('featuredProducts');

        if (grid) {
            grid.innerHTML = featured.map(product => `
                  
                <div class="product-card bg-white border rounded-lg shadow-sm transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 group cursor-pointer"
                    data-id="${product.id}">
                    <div class ="p-0">
                        <div class="aspect-square overflow-hidden rounded-t-lg">
                            <img 
                                src="${product.image}" 
                                alt="${product.title}"
                                class="h-screen w-screen object-cover transition-transform duration-300 group-hover:scale-105 p-0"
                                width  
                            />
                        </div>
                    </div>

                    <div class="p-4">
                        <div class="mb-2">
                            <span class="text-xs font-medium text-primary bg-blue-400 px-2 py-1 rounded-full">
                                ${product.category}
                            </span>
                        </div>

                        <h3 class="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            ${product.title}
                        </h3>

                        <p class="text-sm text-gray-600 clamp-2">
                            ${product.description}
                        </p>

                        <div class="flex items-center mt-2">
                            ⭐ ${product.rating.rate} (${product.rating.count})
                        </div>
                    </div>

                    <div class="p-4 pt-0 flex items-center justify-between">
                        <span class="text-2xl font-bold text-primary">
                            $${product.price.toFixed(2)}
                        </span>
                        <button 
                            class="add-to-cart bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="text-white h-5 w-5 mr-2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                            </svg>
                            Add to Cart
                        </button>
                    </div>
                </div>
            `).join('');

            // Attach click listeners for cards
            const cards = document.querySelectorAll(".product-card");
            cards.forEach(card => {
                const productId = card.dataset.id;
                if (!productId) {
                    console.warn("Missing data-id on product card");
                    return;
                }
                card.addEventListener("click", (e) => {
                    // Prevent add-to-cart button click from triggering navigation
                    if (e.target.classList.contains("add-to-cart")) return;
                    console.log("Navigating to product ID:", productId);
                    window.location.href = `/pages/productDetails.html?id=${productId}`;
                });
            });

            // Attach add-to-cart listeners
            const addButtons = document.querySelectorAll(".add-to-cart");
            addButtons.forEach(btn => {
                btn.addEventListener("click", e => {
                    e.stopPropagation();
                    const id = btn.dataset.id;
                    const product = allProducts.find(p => p.id == id);
                    if (product) {
                        addToCart(product.id, product.title, product.price, product.image);
                    } else {
                        console.warn("Product not found for ID:", id);
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
    }
}

// Call it to test
getFeaturedProducts();

//search functionality from the header across all pages
function searchProducts(event) {
    event.preventDefault();
    const query = document.getElementById("searchInput").value.trim();

    // Always resolve relative to site root
    window.location.href = `/pages/shop.html?q=${encodeURIComponent(query)}`;

    return false;
}


// Load all products and apply search query (from URL if exists)
async function loadShopProducts() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("q")?.toLowerCase() || "";
    const category = urlParams.get("category") || "";
  
    allProducts = await fetchProducts();
  
    // initial filter with query
    let filtered = allProducts;
    if (query) {
      filtered = allProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter from URL
  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

    // Highlight active category button from index.html
    highlightActiveCategory(category);
  
    renderProducts(filtered);
}

loadShopProducts();

// Apply filters from the shop page UI
function applyFilters() {
    let filtered = [...allProducts];
  
    // Text search (shop filter form input)
    const searchText = document.querySelector("#filterSearch")?.value.toLowerCase();
    if (searchText) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchText) ||
          p.description.toLowerCase().includes(searchText) ||
          p.category.toLowerCase().includes(searchText)
      );
    }
  
    // Category filter
    const category = document.querySelector("#filterCategory")?.value;
    if (category && category !== "") {
      filtered = filtered.filter((p) => p.category === category);
    }
  
    // Price range filter
    const minPrice = parseFloat(document.querySelector("#minPrice")?.value || 0);
    const maxPrice = parseFloat(document.querySelector("#maxPrice")?.value || Infinity);
    filtered = filtered.filter((p) => p.price >= minPrice && p.price <= maxPrice);
  
    renderProducts(filtered);
}

// Hook events to UI
document.addEventListener("DOMContentLoaded", () => {
    loadShopProducts();
  
    // Shop page search form
    document.getElementById("shopFilterForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      applyFilters();
    });

    // Category dropdown
  document.getElementById("filterCategory")?.addEventListener("change", applyFilters);

  // Price range inputs
  document.getElementById("minPrice")?.addEventListener("input", applyFilters);
  document.getElementById("maxPrice")?.addEventListener("input", applyFilters);

  // Clear filters
  document.getElementById("clearFilters")?.addEventListener("click", () => {
    document.getElementById("filterSearch").value = "";
    document.getElementById("filterCategory").value = "";
    document.getElementById("minPrice").value = "";
    document.getElementById("maxPrice").value = "";
    renderProducts(allProducts);
  });
});

//to call the filtered product
//renderProducts(filtered);

//function to fetch and display all the products
function renderProducts(products) {
    const grid = document.getElementById("allProducts");
    const count = document.getElementById("productCount");

    if (!grid) {
        console.warn("#allProducts not found");
        return;
    }

    if (products.length === 0) {
        grid.innerHTML = `
            <div class="rounded-lg border card-bg text-card-foreground shadow-sm">
                <div class="flex flex-col space-y-1.5 p-6 pt-3">
                    <h3 class="text-lg font-semibold mb-2">No products found</h3>
                    <p class="foreground-text">
                      Try adjusting your filters or search terms
                    </p>
                </div>
            </div>`;
    } else {
        grid.innerHTML = products.map(product => {
            if (!product.id) {
                console.warn("Product missing ID:", product);
                return '';
            }
            return `
                <div class="product-card bg-white border rounded-lg shadow-sm transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 group cursor-pointer" 
                    data-id="${product.id}">
                    <div class="p-0">
                        <div class="aspect-square overflow-hidden rounded-t-lg">
                            <img 
                                src="${product.image}" 
                                alt="${product.title}" 
                                class="h-screen w-screen object-cover transition-transform duration-300 group-hover:scale-105 p-0"
                            >
                        </div>
                    </div>
                    <div class="p-4">
                        <span class="text-xs bg-blue-400 text-white px-2 py-1 rounded-full">${product.category}</span>
                        <h3 class="font-semibold text-lg mt-2 clamp-2">${product.title}</h3>
                        <p class="text-sm text-gray-600 clamp-2">${product.description}</p>
                        <div class="flex items-center mt-2">
                            ⭐ ${product.rating.rate} (${product.rating.count})
                        </div>
                    </div>
                    <div class="p-4 flex justify-between items-center">
                        <span class="text-2xl font-bold text-blue-600">$${product.price.toFixed(2)}</span>
                        <button class="add-to-cart bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" data-id="${product.id}">Add to Cart</button>
                    </div>
                </div>
            `;
        }).join("");

        // Attach click listeners for cards
        const cards = document.querySelectorAll(".product-card");
        cards.forEach(card => {
            const productId = card.dataset.id;
            if (!productId) {
                console.warn("Missing data-id on product card");
                return;
            }
            card.addEventListener("click", (e) => {
                // Prevent add-to-cart button click from triggering navigation
                if (e.target.classList.contains("add-to-cart")) return;
                console.log("Navigating to product ID:", productId);
                window.location.href = `/pages/productDetails.html?id=${productId}`;
            });
        });

        // Attach add-to-cart listeners
        const addButtons = document.querySelectorAll(".add-to-cart");
        addButtons.forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const product = allProducts.find(p => p.id == id);
                if (product) {
                    addToCart(product.id, product.title, product.price, product.image);
                } else {
                    console.warn("Product not found for ID:", id);
                }
            });
        });
    }

    if (count) {
        count.textContent = `Showing ${products.length} products`;
    }
}


function goToProductDetail(id) {
    // Navigate to productDetails.html with the product id
    window.location.href = `/pages/productDetails.html?id=${id}`;
}
  
//renderProducts(products);

//============================category filter to be captured in the shop template select field===============/
function highlightActiveCategory(activeCategory) {
    const select = document.querySelector(".filter-category-select");
  
    document.querySelectorAll(".category_button button").forEach((btn) => {
      const btnCategory = btn.textContent.trim().toLowerCase();
      let mappedCategory;
      switch (btnCategory) {
        case "electronics": mappedCategory = "electronics"; break;
        case "jewelry": mappedCategory = "jewelery"; break;
        case "men clothing": mappedCategory = "men's clothing"; break;
        case "women clothing": mappedCategory = "women's clothing"; break;
        default: mappedCategory = "";
      }
  
      // Highlight button
      if (mappedCategory === activeCategory) {
        btn.classList.add("bg-blue-500", "text-white");
      } else {
        btn.classList.remove("bg-blue-500", "text-white");
      }
    });
  
    // Update the select dropdown value
    if (select) {
      select.value = activeCategory || ""; // Default to All Categories if empty
    }
}
   
//==================================== Hook category buttons to filter products==================//
document.querySelectorAll(".category_button button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const categoryText = btn.textContent.trim().toLowerCase();
  
      // Map button text to API category values
      let mappedCategory;
      switch (categoryText) {
        case "electronics":
          mappedCategory = "electronics";
          break;
        case "jewelry":
          mappedCategory = "jewelery"; // API spelling
          break;
        case "men clothing":
          mappedCategory = "men's clothing";
          break;
        case "women clothing":
          mappedCategory = "women's clothing";
          break;
        default:
          mappedCategory = "";
      }
  
      // Redirect to shop page with query param
      window.location.href = `/pages/shop.html?category=${encodeURIComponent(mappedCategory)}`;
    });
});

//============================product details and cart logic======================================//
let cart = JSON.parse(localStorage.getItem("cart")) ||[];
let currentQuantity = 1;

// Save cart and update cart count
function updateCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = totalItems;
    }
}


// Fetch single Product
async function loadProductById() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    console.log("URL Params ID:", id); // Should now log the clicked product ID

    if (!id) return;

    try {
        const res = await fetch(`https://fakestoreapi.com/products/${id}`);
        const product = await res.json();
        renderProductDetail(product);

        // fetch related products
        const relatedRes = await fetch(`https://fakestoreapi.com/products/category/${encodeURIComponent(product.category)}`);
        const relatedProducts = await relatedRes.json();
        renderRelatedProducts(relatedProducts.filter(p => p.id != product.id));
    } catch (err) {
        console.error("Error loading product:", err);
    }
}

document.addEventListener("DOMContentLoaded", loadProductById);


//============================function to render product details======================================//
function renderProductDetail(product) {
    const container = document.getElementById("productDetails");
    if (!container) {
      console.warn("#productDetails not found");
      return;
    }
  
    // IMPORTANT: backticks + class (not className)
    const safeTitle = String(product.title).replace(/'/g, "\\'");
    container.innerHTML = `
      <!-- left: image -->
      <div class="aspect-square overflow-hidden rounded-lg bg-gray-100">
        <img
          src="${product.image}"
          alt="${product.title}"
          class="h-full w-full object-contain"
        />
      </div>
  
      <!-- right: info -->
      <div class="space-y-6">
        <div>
          <span class="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded mb-2">
            ${product.category}
          </span>
          <h1 class="text-3xl font-bold mb-4">${product.title}</h1>
          ${renderRating(product.rating)}
        </div>
  
        <div class="text-4xl font-bold text-blue-600">
          $${product.price.toFixed(2)}
        </div>
  
        <p class="text-gray-600 text-lg leading-relaxed">
          ${product.description}
        </p>
  
        <!-- Quantity -->
        <div class="flex items-center gap-4">
          <span class="font-medium">Quantity:</span>
          <div class="flex items-center border rounded-md">
            <button onclick="changeQuantity(-1)" class="px-3 py-2 hover:bg-gray-100">-</button>
            <span id="quantityDisplay" class="px-4 py-2 font-medium">${currentQuantity}</span>
            <button onclick="changeQuantity(1)" class="px-3 py-2 hover:bg-gray-100">+</button>
          </div>
        </div>
  
        <!-- Actions -->
        <div class="flex gap-4">
          <button
            onclick="addToCart(${product.id}, '${safeTitle}', ${product.price}, '${product.image}')"
            class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            🛒 Add to Cart
          </button>
          <button class="border px-6 py-3 rounded-lg hover:bg-gray-100">
            Buy Now
          </button>
        </div>
  
        <!-- Features -->
        <div class="border rounded-lg p-6">
          <h3 class="font-semibold mb-4">Product Features</h3>
          <ul class="space-y-2 text-gray-600">
            <li>✓ High quality materials</li>
            <li>✓ Fast and secure shipping</li>
            <li>✓ 30-day return policy</li>
            <li>✓ Customer satisfaction guaranteed</li>
          </ul>
        </div>
      </div>
    `;
}

////Function to render ratings in star image
function renderRating(rating) {
    if (!rating) return "";
  
    let stars = "";
    for (let i = 0; i < 5; i++) {
      stars += `<span class="${i < Math.floor(rating.rate) ? "text-yellow-400" : "text-gray-300"}">★</span>`;
    }
  
    return `
      <div class="flex items-center space-x-2 mb-4">
        <div>${stars}</div>
        <span class="text-lg font-medium">${rating.rate}</span>
        <span class="text-gray-500">(${rating.count} reviews)</span>
      </div>
    `;
}

//===============funtion to display related products//
function renderRelatedProducts(products) {
    const slot = document.getElementById("relatedProducts");
    if (!slot) return;
    slot.innerHTML = `
      <h2 class="text-2xl font-bold mb-6">Related Products</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${products.map(p => `
          <div class="bg-white border rounded-lg shadow-sm p-4 hover:shadow-lg transition">
            <img src="${p.image}" alt="${p.title}" class="h-40 mx-auto object-contain mb-3" />
            <h3 class="font-semibold line-clamp-2 mb-1">${p.title}</h3>
            <p class="text-blue-600 font-bold mb-3">$${p.price.toFixed(2)}</p>
            <button
              class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onclick="window.location.href='productDetails.html?id=${p.id}'">
              View
            </button>
          </div>
        `).join("")}
      </div>
    `;
}
  
// init
document.addEventListener("DOMContentLoaded", () => {
    updateCart();       // show persisted cart count in header
    loadProductById();  // fetch and render product
    //loadShopProducts();
});

//function to add quantity
function changeQuantity(amount) {
    currentQuantity = Math.max(1, currentQuantity + amount);
    document.getElementById("quantityDisplay").textContent = currentQuantity;
}

// Add to cart function
function addToCart(id, title, price, image) {
    const existingItem = cart.find(item => item.id === id);
  
    if (existingItem) {
      existingItem.quantity += currentQuantity;
    } else {
      cart.push({ id, title, price, image, quantity: currentQuantity });
    }
  
    updateCart();
    alert(`${currentQuantity} × ${title} added to cart!`);

    // Initialize badge on page load
    document.addEventListener("DOMContentLoaded", updateCart);
}






  
  





