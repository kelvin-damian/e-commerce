//API URL
const fakeStoreapi = 'https://fakestoreapi.com';
const platziApi = 'https://api.escuelajs.co/api/v1';

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

//to get categories
async function getProductsByCategory(_categories){
    try{
        const res = await fetch((`${fakeStorepi}/categories`))

        // Parse JSON
        const data = await res.json();
        return data;
    }catch (err) {
        console.error('Error fetching products:', err);
        return [];
    }
}

//to get product by id (to get a single product)
async function getProductById(id){
    try{
        const response = await fetch ((`${fakeStoreapi}/products/{id}`))
        const data = await response.json();
        return data;
    }
    catch(error){
        console.error('Error fetching product:', error);
        return []
    }
}


// get featured products
async function getFeaturedProducts() {
    try {
        const products = await fetchProducts();
        const featured = products.slice(0, 8);
        const grid = document.getElementById('featuredProducts');

        if (grid) {
            grid.innerHTML = featured.map(product => `
                  
                <div class="bg-white border rounded-lg shadow-sm transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 group">
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
                            onclick="alert('Added ${product.title} to cart!')" 
                            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="text-white h-5 w-5 mr-2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                            </svg>
                            Add to Cart
                        </button>
                    </div>
                </div>
            `).join('');
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

//to get the searched item from the header item
async function loadShopProducts(){
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("q")?.toLowerCase() || "";

    let products = await fetchProducts();
    let filtered = products;

    // if query exists, filter by title, description, or category
    if (query) {
        filtered = products.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
        );
    }
    renderProducts(filtered);
}

loadShopProducts();

function renderProducts(products){
    const grid = document.getElementById("allProducts");
    const count = document.getElementById("productCount");

    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = 
        `<div class="rounded-lg border card-bg text-card-foreground shadow-sm">
            <div class="flex flex-col space-y-1.5 p-6 pt-3">
                <h3 class="text-lg font-semibold mb-2">No products found</h3>
                <p class="foreground-text">
                  Try adjusting your filters or search terms
                </p>
            </div>
        </div
        //<p class="col-span-full text-center text-gray-500">No products found.</p>`;
    }else {
        grid.innerHTML = products.map(product => `
            <div class="bg-white border rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
              <div class="aspect-square overflow-hidden rounded-t-lg">
                <img src="${product.image}" alt="${product.title}" class="h-full w-full object-contain p-4">
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
                <button onclick="alert('Added ${product.title}')" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add to Cart</button>
              </div>
            </div>
        `).join("");

        if (count) {
            count.textContent = `Showing ${products.length} products`;
        }
    }

   
}

renderProducts(products);

