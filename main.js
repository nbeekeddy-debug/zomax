// Loader is managed by the inline `manageLoader()` script in index.html

/* ------------------------------------------------------------
  Zomax Frontend — Developer Notes (brief)

  Overview:
  - `main.js` is organized into sections: State, Persistence, Backend Adapter,
    UI Renderers, Modal & UX helpers, and Actions. Keep functions grouped.
  - Backend developers should implement `/api` endpoints as documented in
    BACKEND_CONNECT.md. The `backend` adapter below provides local fallbacks
    so the frontend remains usable without a server.

  Conventions:
  - Functions that change app state should call `saveState()` after changes.
  - Use `backend.*` helpers to read/write shared resources (cart, orders, account, reviews).
  - Dates: orders store friendly date strings for display; analytics uses ISO dates.
------------------------------------------------------------ */

const categories = [
  { id: "fashion", name: "Fashion", icon: "shirt", color: "bg-pink-100 text-pink-600" },
  { id: "electronics", name: "Electronics", icon: "smartphone", color: "bg-blue-100 text-blue-600" },
  { id: "home", name: "Home & Living", icon: "lamp-ceiling", color: "bg-amber-100 text-amber-600" },
  { id: "beauty", name: "Beauty", icon: "sparkles", color: "bg-purple-100 text-purple-600" },
  { id: "food", name: "Food & Groceries", icon: "utensils", color: "bg-emerald-100 text-emerald-600" },
  { id: "sports", name: "Sports", icon: "dumbbell", color: "bg-cyan-100 text-cyan-600" },
  { id: "automotive", name: "Automotive", icon: "car-front", color: "bg-slate-200 text-slate-700" },
  { id: "kids", name: "Kids", icon: "baby", color: "bg-yellow-100 text-yellow-600" },
  { id: "services", name: "Services", icon: "handshake", color: "bg-indigo-100 text-indigo-600" },
  { id: "phones", name: "Phones & Tablets", icon: "tablet-smartphone", color: "bg-red-100 text-red-600" }
];

let products = [];

const defaultAccount = {
  name: "",
  username: "",
  email: "",
  phone: "",
  address: "",
  addresses: [],
  paymentMethod: "",
  paymentMethods: [],
  cardName: "",
  cardLast4: "",
  memberSince: ""
};

let cart = JSON.parse(localStorage.getItem("zomax_cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("zomax_wishlist") || "[]");
let orders = JSON.parse(localStorage.getItem("zomax_orders") || "[]");
let account = JSON.parse(localStorage.getItem("zomax_account") || JSON.stringify(defaultAccount));
let currentUser = JSON.parse(localStorage.getItem("zomax_currentUser") || "null");
let currentSearch = "";
let currentProductModalId = null;
let currentProductModalTab = "overview";
let currentProductModalImageIndex = 0;
let lastOrder = null;

// Reviews store (persisted in localStorage)
let reviewsStore = JSON.parse(localStorage.getItem('zomax_reviews') || '{}');

let editingReviewProductId = null;
let editingReviewIndex = null;

function getReviewsForProduct(id) {
  return (reviewsStore[id] || []).slice().sort((a,b) => b.createdAt - a.createdAt);
}

function saveReviewsStore() {
  localStorage.setItem('zomax_reviews', JSON.stringify(reviewsStore));
}

function addReview(productId, { author, rating, text }) {
  const id = String(productId);
  reviewsStore[id] = reviewsStore[id] || [];
  const review = { author: author || 'Anonymous', rating: Number(rating) || 5, text: text || '', createdAt: Date.now() };
  reviewsStore[id].push(review);
  // update product aggregate rating and reviews count for quick display
  const product = products.find(p => p.id === productId);
  if (product) {
    const all = getReviewsForProduct(productId);
    const avg = all.reduce((s,r) => s + r.rating, 0) / (all.length || 1);
    product.rating = Number(avg.toFixed(1));
    product.reviews = all.length;
  }
  saveReviewsStore();
  saveState();
  backend.saveReview(productId, review).catch(err => {
    console.warn('Failed to save review to backend', err);
    // fallback: attempt to sync entire store later
    backend.syncReviews(reviewsStore).catch(() => {});
  });
}

const money = value => "₦" + Number(value).toLocaleString("en-NG");



/**
 * Backend adapter
 * Provides a minimal adapter that prefers localStorage and `data/*.json` fallbacks.
 * Backend developers should implement matching `/api` endpoints to provide
 * persistent, server-side data. Keep responses compatible with shapes in `data/`.
 */
const backend = {
  async getJson(url, fallback = null) {
    try {
      // Attempt to read static data files for known read-only endpoints.
      if (url === '/api/products') {
        const res = await fetch('data/products.json');
        if (res.ok) return await res.json();
      }

      // Local reviews are stored in localStorage; return them if present.
      if (url.startsWith('/api/products/') && url.endsWith('/reviews')) {
        const productId = String(url.split('/')[3]);
        return reviewsStore[productId] || [];
      }

      if (url === '/api/cart') return JSON.parse(localStorage.getItem('zomax_cart') || '[]');
      if (url === '/api/wishlist') return JSON.parse(localStorage.getItem('zomax_wishlist') || '[]');
      if (url === '/api/orders') return JSON.parse(localStorage.getItem('zomax_orders') || '[]');
      if (url === '/api/account') return JSON.parse(localStorage.getItem('zomax_account') || JSON.stringify(defaultAccount));
      if (url === '/api/auth/current-user') return JSON.parse(localStorage.getItem('zomax_currentUser') || 'null');

      // As a last resort, try to fetch the URL (will fail if no backend is present).
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (err) {
      // fall through to fallback
    }

    return fallback;
  },

  async postJson(url, body, fallback = null) {
    try {
      // Persist known resources to localStorage so the app remains usable without a backend.
      if (url === '/api/auth/login') {
        localStorage.setItem('zomax_currentUser', JSON.stringify(body || null));
        return body || null;
      }

      if (url === '/api/auth/logout') {
        localStorage.removeItem('zomax_currentUser');
        return { success: true };
      }

      if (url === '/api/account') {
        localStorage.setItem('zomax_account', JSON.stringify(body || defaultAccount));
        return body || defaultAccount;
      }

      if (url === '/api/cart') {
        localStorage.setItem('zomax_cart', JSON.stringify(body || []));
        return body || [];
      }

      if (url === '/api/wishlist') {
        localStorage.setItem('zomax_wishlist', JSON.stringify(body || []));
        return body || [];
      }

      if (url === '/api/orders') {
        localStorage.setItem('zomax_orders', JSON.stringify(body || []));
        return body || [];
      }

      if (url === '/api/reviews') {
        reviewsStore = body || reviewsStore || {};
        saveReviewsStore();
        return reviewsStore;
      }

      if (url.startsWith('/api/products/') && url.endsWith('/reviews')) {
        const productId = String(url.split('/')[3]);
        reviewsStore[productId] = reviewsStore[productId] || [];
        reviewsStore[productId].push(body);
        saveReviewsStore();
        return body;
      }

      if (url === '/api/products') {
        const newProduct = Object.assign({ id: Date.now(), createdAt: new Date().toISOString() }, body);
        products.unshift(newProduct);
        saveState();
        return newProduct;
      }
    } catch (err) {
      // ignore and return fallback
    }

    return fallback;
  },

  async deleteJson(url, fallback = null) {
    try {
      if (url.startsWith('/api/products/') && url.includes('/reviews/')) {
        const parts = url.split('/');
        const productId = String(parts[3]);
        const index = Number(parts[5]);
        if (Array.isArray(reviewsStore[productId]) && reviewsStore[productId][index]) {
          const [deleted] = reviewsStore[productId].splice(index, 1);
          saveReviewsStore();
          return deleted || {};
        }
        return fallback;
      }
    } catch (err) {}
    return fallback;
  },

  // High-level helpers used across the app — all operate locally when possible.
  fetchAccount: async () => JSON.parse(localStorage.getItem('zomax_account') || JSON.stringify(defaultAccount)),
  fetchCurrentUser: async () => JSON.parse(localStorage.getItem('zomax_currentUser') || 'null'),
  fetchProducts: async () => {
    try {
      const res = await fetch('data/products.json');
      if (res.ok) return await res.json();
    } catch (e) {}
    return products || [];
  },
  fetchProductReviews: async productId => reviewsStore[String(productId)] || [],
  fetchCart: async () => JSON.parse(localStorage.getItem('zomax_cart') || '[]'),
  fetchWishlist: async () => JSON.parse(localStorage.getItem('zomax_wishlist') || '[]'),
  fetchOrders: async () => JSON.parse(localStorage.getItem('zomax_orders') || '[]'),
  login: async credentials => { localStorage.setItem('zomax_currentUser', JSON.stringify(credentials)); return credentials; },
  logout: async () => { localStorage.removeItem('zomax_currentUser'); return null; },
  syncAccount: async updatedAccount => { localStorage.setItem('zomax_account', JSON.stringify(updatedAccount)); return updatedAccount; },
  syncCart: async updatedCart => { localStorage.setItem('zomax_cart', JSON.stringify(updatedCart)); return updatedCart; },
  syncWishlist: async updatedWishlist => { localStorage.setItem('zomax_wishlist', JSON.stringify(updatedWishlist)); return updatedWishlist; },
  syncOrders: async updatedOrders => { localStorage.setItem('zomax_orders', JSON.stringify(updatedOrders)); return updatedOrders; },
  saveOrder: async order => { orders.unshift(order); localStorage.setItem('zomax_orders', JSON.stringify(orders)); return order; },
  saveProductListing: async product => { const result = Object.assign({ id: Date.now(), createdAt: new Date().toISOString() }, product); products.unshift(result); saveState(); return result; },
  saveReview: async (productId, review) => { const id = String(productId); reviewsStore[id] = reviewsStore[id] || []; reviewsStore[id].push(review); saveReviewsStore(); return review; },
  deleteReview: async (productId, index) => { const id = String(productId); if (Array.isArray(reviewsStore[id]) && reviewsStore[id][index]) { const [del] = reviewsStore[id].splice(index, 1); saveReviewsStore(); return del; } return {}; },
  syncReviews: async allReviews => { reviewsStore = allReviews || reviewsStore; saveReviewsStore(); return reviewsStore; }
};

function saveState() {
  localStorage.setItem("zomax_cart", JSON.stringify(cart));
  localStorage.setItem("zomax_wishlist", JSON.stringify(wishlist));
  localStorage.setItem("zomax_orders", JSON.stringify(orders));
  localStorage.setItem("zomax_account", JSON.stringify(account));
  if (currentUser) {
    localStorage.setItem("zomax_currentUser", JSON.stringify(currentUser));
  } else {
    localStorage.removeItem("zomax_currentUser");
  }
  updateBadges();
  try { backend.syncAccount(account); } catch (e) {}
  try { backend.syncCart(cart); } catch (e) {}
  try { backend.syncWishlist(wishlist); } catch (e) {}
}

function setPrimaryAddress(index) {
  account.addresses = account.addresses || [];
  if (index < 0 || index >= account.addresses.length) { showToast('Invalid address'); return; }
  const [item] = account.addresses.splice(index,1);
  account.addresses.unshift(item);
  saveState();
  renderProfilePage();
  showToast('Primary address updated');
}

function setPrimaryPayment(index) {
  account.paymentMethods = account.paymentMethods || [];
  if (index < 0 || index >= account.paymentMethods.length) { showToast('Invalid payment'); return; }
  const [item] = account.paymentMethods.splice(index,1);
  account.paymentMethods.unshift(item);
  saveState();
  renderProfilePage();
  showToast('Primary payment updated');
}

function showConfirm(message) {
  return new Promise(resolve => {
    const modal = document.getElementById('confirmModal');
    if (!modal) {
      const ok = window.confirm(message);
      resolve(ok);
      return;
    }
    const msgEl = document.getElementById('confirmModalMessage');
    const yesBtn = document.getElementById('confirmModalYes');
    const noBtn = document.getElementById('confirmModalNo');
    msgEl.textContent = message;

    function cleanup(result) {
      yesBtn.removeEventListener('click', onYes);
      noBtn.removeEventListener('click', onNo);
      closeModal('confirmModal');
      resolve(result);
    }

    function onYes() { cleanup(true); }
    function onNo() { cleanup(false); }

    yesBtn.addEventListener('click', onYes);
    noBtn.addEventListener('click', onNo);

    openModal('confirmModal');
  });
}

async function initializeApp() {
  // Initialize state from localStorage / static files; no backend required.
  account = await backend.fetchAccount();
  currentUser = await backend.fetchCurrentUser() || currentUser;
  products = await backend.fetchProducts();
  cart = await backend.fetchCart();
  wishlist = await backend.fetchWishlist();
  orders = await backend.fetchOrders();
  renderCategories();
  renderHome();
  renderShop();
  renderDashboard();
  renderProfilePage();
  renderAuthState();
  updateBadges();
  // Respect direct page links via hash (e.g. /shop.html -> index.html#shop)
  const initialPage = (window.location.hash && window.location.hash.slice(1)) || (new URLSearchParams(window.location.search).get('page')) || 'home';
  navigate(initialPage || 'home');
  renderDashboardAnalytics();
  refreshIcons();
}


function categoryName(id) {
  return categories.find(category => category.id === id)?.name || id;
}

function navigate(page) {
  const pageIds = {
    home: 'page-home',
    shop: 'page-shop',
    categories: 'page-categories',
    cart: 'page-cart',
    wishlist: 'page-wishlist',
    orders: 'page-orders',
    confirmation: 'page-confirmation',
    profile: 'page-profile',
    login: 'page-login',
    signup: 'page-signup',
    dashboard: 'page-dashboard',
    sell: 'page-sell'
  };

  const targetId = pageIds[page] || pageIds.home;
  document.querySelectorAll('.page').forEach(section => {
    section.classList.toggle('active', section.id === targetId);
  });

  document.querySelectorAll('[data-nav]').forEach(button => {
    button.classList.toggle('active', button.dataset.nav === page);
  });

  // Only the home page keeps the site header; all other views are full-screen and header-free.
  const desktopHeader = document.getElementById('desktopHeader');
  const mobileHeader = document.getElementById('mobileHeader');
  const isMobileViewport = window.innerWidth < 768;

  if (page === 'home') {
    if (desktopHeader) desktopHeader.classList.toggle('hidden', isMobileViewport);
    if (mobileHeader) mobileHeader.classList.toggle('hidden', !isMobileViewport);
  } else {
    if (desktopHeader) desktopHeader.classList.add('hidden');
    if (mobileHeader) mobileHeader.classList.add('hidden');
  }

  if (targetId === 'page-confirmation') renderOrderConfirmation();

  renderHome();
  renderShop();
  renderCart();
  renderWishlist();
  renderOrders();
  renderProfilePage();
  renderDashboard();
  refreshIcons();
}

// Seller CTA: require seller auth, then directly open the store editor after sign-in.
function becomeSeller() {
  try {
    if (window.loader && typeof window.loader.addSignal === 'function') window.loader.addSignal('become:seller');
    if (window.loader && typeof window.loader.setProgress === 'function') window.loader.setProgress(10);
  } catch (e) {}

  if (!currentUser) {
    window.pendingSellerRedirect = 'storeSettings';
    openStoreAuthModal();
  } else {
    window.pendingSellerRedirect = null;
    renderStoreSettings();
    openModal('storeSettingsModal');
  }

  try {
    const ms = 15000;
    setTimeout(() => { try { if (window.loader && typeof window.loader.markDone === 'function') window.loader.markDone('become:seller'); } catch (e) {} }, ms);
  } catch (e) { }
}

function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

function renderCategories() {
  const categoryMarkup = categories.map(category => `
    <button onclick="filterByCategory('${category.id}')" class="group min-w-[110px] rounded-[28px] border border-slate-200/80 bg-white/95 p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <span class="mx-auto grid h-14 w-14 place-items-center rounded-2xl ${category.color}">
        <i data-lucide="${category.icon}" class="h-6 w-6"></i>
      </span>
      <span class="mt-3 block text-xs font-bold leading-4 text-slate-700">${category.name}</span>
    </button>
  `).join("");

  document.getElementById("homeCategories").innerHTML = categoryMarkup;
  document.getElementById("allCategories").innerHTML = categories.map(category => `
    <button onclick="filterByCategory('${category.id}')" class="rounded-[32px] border border-slate-200/80 bg-white/95 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <span class="grid h-14 w-14 place-items-center rounded-2xl ${category.color}">
        <i data-lucide="${category.icon}" class="h-7 w-7"></i>
      </span>
      <h3 class="mt-5 font-black">${category.name}</h3>
      <p class="mt-1 text-xs text-slate-500">${products.filter(product => product.category === category.id).length} products</p>
    </button>
  `).join("");

  document.getElementById("categoryFilter").innerHTML = `
    <option value="all">All categories</option>
    ${categories.map(category => `<option value="${category.id}">${category.name}</option>`).join("")}
  `;

  document.getElementById("sellerCategory").innerHTML = categories.map(category => `
    <option value="${category.id}">${category.name}</option>
  `).join("");

  refreshIcons();
}

function fallbackProductImage(product) {
  const fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85';
  return product?.image || fallback;
}

function productCard(product) {
  const saved = wishlist.includes(product.id);
  const safeImage = fallbackProductImage(product);

  return `
    <article class="product-card overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/95 shadow-sm">
      <div class="relative cursor-pointer" onclick="openProduct(${product.id})">
        <img src="${safeImage}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85'" alt="${product.name}" class="h-44 w-full object-cover sm:h-52" />
        
        <div class="absolute left-3 bottom-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-900 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4 fill-amber-400 stroke-amber-400"><path d="M12 .587l3.668 7.431L23.4 9.748l-5.7 5.557L18.834 24 12 20.202 5.166 24l1.134-8.695L.6 9.748l7.732-1.73L12 .587z"/></svg>
          <span>${product.rating}</span>
          <span class="text-slate-400">(${product.reviews})</span>
        </div>
        <button onclick="event.stopPropagation(); toggleWishlist(${product.id})" class="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-500 shadow-sm hover:text-red-500">
          <i data-lucide="heart" class="h-4 w-4 ${saved ? "fill-red-500 text-red-500" : ""}"></i>
        </button>
      </div>

      <div class="p-3.5">
        <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">${categoryName(product.category)}</p>
        <h3 onclick="openProduct(${product.id})" class="mt-1 cursor-pointer truncate text-sm font-black text-slate-800">${product.name}</h3>

        <div class="mt-2 flex items-center gap-1 text-xs">
          <i data-lucide="star" class="h-3.5 w-3.5 fill-amber-400 text-amber-400"></i>
          <b>${product.rating}</b>
          <span class="text-slate-400">(${product.reviews})</span>
        </div>

        <div class="mt-3 flex items-end justify-between gap-2">
          <div>
            <p class="text-base font-black text-slate-900">${money(product.price)}</p>
            ${product.oldPrice ? `<p class="text-[11px] text-slate-400 line-through">${money(product.oldPrice)}</p>` : ""}
          </div>
          <button onclick="event.stopPropagation(); addToCart(${product.id})" class="grid h-11 w-11 place-items-center rounded-3xl bg-gradient-to-br from-orange-500 to-orange-400 text-white shadow-lg shadow-orange-200 hover:from-orange-600 hover:to-orange-500">
            <i data-lucide="plus" class="h-4 w-4"></i>
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderHome() {
  document.getElementById("homeProducts").innerHTML = products.slice(0, 8).map(productCard).join("");
  refreshIcons();
}

function renderShop() {
  const category = document.getElementById("categoryFilter")?.value || "all";
  const sort = document.getElementById("sortFilter")?.value || "featured";

  let result = products.filter(product => {
    const matchesCategory = category === "all" || product.category === category;
    const text = `${product.name} ${product.seller} ${categoryName(product.category)}`.toLowerCase();
    return matchesCategory && text.includes(currentSearch.toLowerCase());
  });

  if (sort === "low") result.sort((a, b) => a.price - b.price);
  if (sort === "high") result.sort((a, b) => b.price - a.price);
  if (sort === "rating") result.sort((a, b) => b.rating - a.rating);

  document.getElementById("shopResultText").textContent = `${result.length} product${result.length === 1 ? "" : "s"} found`;
  document.getElementById("shopProducts").innerHTML = result.length
    ? result.map(productCard).join("")
    : emptyState("search-x", "No products found", "Try another keyword or category.");
  refreshIcons();
}

// renderDeals removed — deals page deprecated

function renderDashboard() {
  const totalProducts = products.length;
  const totalRevenue = products.reduce((sum, product) => sum + Number(product.price || 0), 0);
  const activeProducts = products.filter(product => Number(product.stock || 0) > 0).length;
  const averagePrice = totalProducts ? Math.round(totalRevenue / totalProducts) : 0;
  const totalOrders = orders.length;

  document.getElementById("dashboardStats").innerHTML = `
    <div class="rounded-2xl md:rounded-3xl bg-white p-3 md:p-5 shadow-sm">
      <p class="text-[10px] md:text-xs uppercase tracking-[0.3em] text-slate-400">Total listings</p>
      <h3 class="mt-2 md:mt-3 text-xl md:text-3xl font-black text-slate-900">${totalProducts}</h3>
    </div>
    <div class="rounded-2xl md:rounded-3xl bg-white p-3 md:p-5 shadow-sm">
      <p class="text-[10px] md:text-xs uppercase tracking-[0.3em] text-slate-400">In stock</p>
      <h3 class="mt-2 md:mt-3 text-xl md:text-3xl font-black text-slate-900">${activeProducts}</h3>
    </div>
    <div class="rounded-2xl md:rounded-3xl bg-white p-3 md:p-5 shadow-sm">
      <p class="text-[10px] md:text-xs uppercase tracking-[0.3em] text-slate-400">Total sales</p>
      <h3 class="mt-2 md:mt-3 text-xl md:text-3xl font-black text-slate-900">${totalOrders}</h3>
    </div>
    <div class="rounded-2xl md:rounded-3xl bg-white p-3 md:p-5 shadow-sm">
      <p class="text-[10px] md:text-xs uppercase tracking-[0.3em] text-slate-400">Catalog value</p>
      <h3 class="mt-2 md:mt-3 text-xl md:text-3xl font-black text-slate-900">${money(totalRevenue)}</h3>
    </div>
  `;

  // Update active listing count in store health
  const activeListingElement = document.getElementById('storeActiveListing');
  if (activeListingElement) activeListingElement.textContent = activeProducts;

  // Render recent products
  const recentProducts = products.slice(0, 5);
  document.getElementById("dashboardProducts").innerHTML = recentProducts.length ? recentProducts.map(product => `
    <div class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-orange-50">
      <img src="${fallbackProductImage(product)}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85'" alt="${product.name}" class="h-14 w-14 rounded-xl object-cover" />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-black text-slate-900">${product.name}</p>
        <p class="text-xs text-slate-500">${categoryName(product.category)} · ${money(product.price)}</p>
      </div>
      <div class="text-right">
        <span class="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black text-emerald-700">${Number(product.stock || 0)}</span>
        <p class="text-xs text-slate-500 mt-1">in stock</p>
      </div>
    </div>
  `).join("") : '<p class="text-sm text-slate-500 text-center py-6">No products yet. <a href="#" onclick="navigate(\'sell\')" class="text-orange-500 font-bold">Add your first product</a></p>';

  // Render top products
  renderDashboardTopProducts();

  // Render sales activity
  renderDashboardSalesActivity();

  // Render customer reviews
  renderDashboardReviews();

  // Render analytics
  renderDashboardAnalytics();

  refreshIcons();
}

function renderDashboardTopProducts() {
  const container = document.getElementById("dashboardTopProducts");
  if (!container) return;

  // Get products sorted by review count (popularity proxy)
  const topProducts = products.slice().sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 5);

  container.innerHTML = topProducts.length ? topProducts.map(product => {
    const rating = product.rating || 5;
    const reviews = product.reviews || 0;
    return `
      <div class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-orange-50">
        <img src="${fallbackProductImage(product)}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85'" alt="${product.name}" class="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-black text-slate-900">${product.name}</p>
          <div class="mt-1 flex items-center gap-2">
            <span class="text-xs font-bold text-yellow-600">★ ${rating}</span>
            <span class="text-xs text-slate-500">${reviews} reviews</span>
          </div>
        </div>
        <div class="text-right flex-shrink-0">
          <p class="text-sm font-black text-orange-600">${money(product.price)}</p>
        </div>
      </div>
    `;
  }).join("") : '<p class="text-sm text-slate-500 text-center py-6">Publish products to track performance</p>';
}

function renderDashboardSalesActivity() {
  const container = document.getElementById("dashboardSalesActivity");
  if (!container) return;

  const recentOrders = orders.slice(-5).reverse();

  container.innerHTML = recentOrders.length ? recentOrders.map(order => {
    const items = order.items || [];
    const itemsSummary = items.length === 1 ? items[0].name : `${items.length} items`;
    const statusColor = order.status === 'delivered' ? 'emerald' : order.status === 'pending' ? 'orange' : 'blue';
    return `
      <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div>
          <p class="text-sm font-black text-slate-900">${itemsSummary}</p>
          <p class="text-xs text-slate-500">Order ${order.id ? order.id.toString().slice(-6) : 'N/A'}</p>
        </div>
        <div class="text-right">
          <p class="text-sm font-black text-slate-900">${money(order.total || 0)}</p>
          <span class="inline-block rounded-full bg-${statusColor}-100 px-2 py-0.5 text-[10px] font-bold text-${statusColor}-700 mt-1">${order.status || 'pending'}</span>
        </div>
      </div>
    `;
  }).join("") : '<p class="text-sm text-slate-500 text-center py-6">No sales yet. Keep marketing your products!</p>';
}

function renderDashboardReviews() {
  const container = document.getElementById("dashboardReviews");
  if (!container) return;

  // Get all reviews across products
  const allReviews = [];
  Object.entries(reviewsStore).forEach(([productId, reviews]) => {
    if (Array.isArray(reviews)) {
      reviews.forEach(review => {
        allReviews.push({ ...review, productId });
      });
    }
  });

  const recentReviews = allReviews.sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);

  container.innerHTML = recentReviews.length ? recentReviews.map(review => {
    const product = products.find(p => p.id === Number(review.productId));
    const productName = product?.name || 'Product';
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    return `
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold text-yellow-600">${stars}</p>
            <p class="text-xs text-slate-600 mt-1 line-clamp-2">"${review.text || 'Great product!'}"</p>
            <p class="text-[10px] text-slate-500 mt-1">— ${review.author || 'Customer'}</p>
          </div>
        </div>
      </div>
    `;
  }).join("") : '<p class="text-sm text-slate-500 text-center py-6">No reviews yet</p>';
}

function computeSMA(series, window) {
  if (!Array.isArray(series) || window <= 0) return [];
  const out = Array(series.length).fill(null);
  let sum = 0;
  for (let i = 0; i < series.length; i++) {
    sum += Number(series[i] || 0);
    if (i >= window) sum -= Number(series[i - window] || 0);
    if (i >= window - 1) out[i] = +(sum / window).toFixed(2);
  }
  return out;
}

function renderDashboardAnalytics() {
  const analyticsArea = document.getElementById('dashboardAnalytics');
  if (!analyticsArea) return;

  // Build last-7-days labels
  const days = 7;
  const labels = [];
  const revenue = [];
  const ordersSeries = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toISOString().slice(0, 10);
    labels.push(label);
    revenue.push(0);
    ordersSeries.push(0);
  }

  orders.forEach(o => {
    const od = new Date(o.date);
    if (isNaN(od)) return;
    const key = od.toISOString().slice(0, 10);
    const idx = labels.indexOf(key);
    if (idx >= 0) {
      revenue[idx] += Number(o.total || 0);
      ordersSeries[idx] += 1;
    }
  });

  const revenueSMA7 = computeSMA(revenue, 7);
  const ordersSMA7 = computeSMA(ordersSeries, 7);

  // Render simple analytics summary in dashboard
  const revSMAVal = revenueSMA7[revenueSMA7.length - 1] || 0;
  const ordSMAVal = ordersSMA7[ordersSMA7.length - 1] || 0;

  analyticsArea.innerHTML = `
    <div class="rounded-2xl md:rounded-3xl bg-white p-3 md:p-5 shadow-sm">
      <p class="text-[10px] md:text-xs uppercase tracking-[0.3em] text-slate-400">7-day revenue</p>
      <h3 class="mt-2 md:mt-3 text-xl md:text-2xl font-black text-slate-900">${money(revSMAVal)}</h3>
    </div>
    <div class="rounded-2xl md:rounded-3xl bg-white p-3 md:p-5 shadow-sm">
      <p class="text-[10px] md:text-xs uppercase tracking-[0.3em] text-slate-400">7-day orders</p>
      <h3 class="mt-2 md:mt-3 text-xl md:text-2xl font-black text-slate-900">${ordSMAVal}</h3>
    </div>
  `;
}

// Admin dashboard removed


function filterByCategory(category) {
  document.getElementById("categoryFilter").value = category;
  currentSearch = "";
  document.getElementById("desktopSearch").value = "";
  document.getElementById("mobileSearch").value = "";
  navigate("shop");
}

function applyFilters() {
  renderShop();
}

function handleSearch(value) {
  currentSearch = value;
  if (!document.getElementById("page-shop").classList.contains("active")) navigate("shop");
  renderShop();
}

function setProductModalTab(tab) {
  if (!currentProductModalId) return;
  currentProductModalTab = tab;
  renderProductModal(currentProductModalId, tab);
  refreshIcons();
}

function selectProductModalImage(index) {
  currentProductModalImageIndex = index;
  renderProductModal(currentProductModalId, currentProductModalTab);
  refreshIcons();
}

function openProduct(id) {
  currentProductModalId = id;
  currentProductModalTab = "overview";
  currentProductModalImageIndex = 0;
  renderProductModal(id, currentProductModalTab);
  openModal("productModal");
  refreshIcons();
}

function renderProductModal(id, activeTab) {
  const product = products.find(item => item.id === id);
  const saved = wishlist.includes(id);
  const images = product.images?.length ? product.images : [fallbackProductImage(product), fallbackProductImage(product), fallbackProductImage(product)];
  const activeImage = images[currentProductModalImageIndex] || images[0];
  const thumbnailMarkup = images.map((src, index) => `
    <button onclick="selectProductModalImage(${index})" class="rounded-3xl border p-1 transition ${currentProductModalImageIndex === index ? 'border-orange-500 bg-white ring-2 ring-orange-200' : 'border-slate-200 bg-slate-100 hover:border-slate-300 hover:ring-2 hover:ring-orange-200'}">
      <img src="${src}" alt="${product.name} thumbnail ${index + 1}" class="h-16 w-16 rounded-2xl object-cover" />
    </button>
  `).join("");
  const relatedProducts = products.filter(item => item.category === product.category && item.id !== product.id).slice(0, 4);
  const relatedMarkup = relatedProducts.length
    ? relatedProducts.map(item => `
        <button onclick="openProduct(${item.id})" class="group min-w-[220px] overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm">
          <img src="${fallbackProductImage(item)}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85'" alt="${item.name}" class="h-28 w-full rounded-2xl object-cover" />
          <div class="mt-3">
            <p class="text-xs font-bold uppercase tracking-wide text-slate-400">${categoryName(item.category)}</p>
            <h3 class="mt-2 line-clamp-2 text-sm font-black text-slate-900">${item.name}</h3>
            <p class="mt-2 text-sm font-black text-orange-500">${money(item.price)}</p>
          </div>
        </button>
      `).join("")
    : `<p class="text-sm text-slate-500">No related products found yet.</p>`;

  const tabButton = (tab, label, icon) => `
    <button onclick="setProductModalTab('${tab}')" class="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold ${activeTab === tab ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}">
      <i data-lucide="${icon}" class="h-4 w-4"></i>
      ${label}
    </button>
  `;

  let tabContent = "";
  if (activeTab === "overview") {
    tabContent = `
      <div class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div class="space-y-4">
          <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <h3 class="text-lg font-black">Product details</h3>
            <p class="mt-3 text-sm leading-6 text-slate-600">${product.description}</p>
          </div>
          <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <h3 class="text-lg font-black">Highlights</h3>
            <div class="mt-3 space-y-2 text-sm text-slate-600">
              <p><strong class="text-slate-900">Seller:</strong> ${product.seller}</p>
              <p><strong class="text-slate-900">Location:</strong> ${product.location}</p>
              <p><strong class="text-slate-900">Category:</strong> ${categoryName(product.category)}</p>
            </div>
          </div>
        </div>
        <div class="space-y-4">
          <div class="rounded-3xl border border-slate-200 bg-white p-5">
            <p class="text-xs uppercase tracking-wide text-slate-500">Price</p>
            <p class="mt-2 text-2xl font-black text-orange-500">${money(product.price)}</p>
            ${product.oldPrice ? `<span class="block text-xs text-slate-400 line-through">${money(product.oldPrice)}</span>` : ""}
            <button onclick="addToCart(${product.id}); closeModal('productModal')" class="mt-5 w-full rounded-xl bg-orange-500 py-3.5 text-sm font-black text-white hover:bg-orange-600">
              Add to cart
            </button>
          </div>
        </div>
      </div>
    `;
  } else if (activeTab === "reviews") {
    const productReviews = getReviewsForProduct(product.id);
    const reviewsList = productReviews.length ? productReviews.map((r, i) => `
        <div class="rounded-2xl border border-slate-100 bg-white p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <b class="font-semibold text-slate-900">${r.author}</b>
              <div class="mt-1 text-sm text-slate-500">${new Date(r.createdAt).toLocaleString()}</div>
              <div class="mt-2 text-sm font-black text-amber-400">${'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="inline h-4 w-4 fill-amber-400 stroke-amber-400"><path d="M12 .587l3.668 7.431L23.4 9.748l-5.7 5.557L18.834 24 12 20.202 5.166 24l1.134-8.695L.6 9.748l7.732-1.73L12 .587z"/></svg>'}${' '.repeat(0)} ${r.rating}</div>
            </div>
            <div class="flex gap-2">
              <button onclick="editReview(${product.id}, ${i})" class="rounded-xl p-2 text-slate-500 hover:bg-slate-50" title="Edit review">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </button>
              <button onclick="deleteReview(${product.id}, ${i})" class="rounded-xl p-2 text-slate-500 hover:bg-slate-50" title="Delete review">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24"><path d="M9 3v1H4v2h16V4h-5V3H9zM6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"/></svg>
              </button>
            </div>
          </div>
          <p class="mt-3 text-sm text-slate-700">${r.text}</p>
        </div>
      `).join('') : `
        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
          <h3 class="text-lg font-black text-slate-900">Customer reviews</h3>
          <p class="mt-3">No reviews yet. Be the first to review this product.</p>
        </div>
      `;

    tabContent = `
      <div class="space-y-4">
        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 class="text-lg font-black text-slate-900">Customer reviews</h3>
          <div class="mt-4 space-y-3">${reviewsList}</div>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-5">
          <h3 class="text-lg font-black text-slate-900">Leave a review</h3>
          <form onsubmit="submitReview(event, ${product.id})" class="mt-3 space-y-3">
            <div>
              <label class="text-sm font-semibold">Name</label>
              <input id="reviewAuthor" class="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" placeholder="Your name (optional)" />
            </div>
            <div>
              <label class="text-sm font-semibold">Rating</label>
              <input type="hidden" id="reviewRating" value="5" />
              <div class="mt-2 flex gap-1" id="reviewStars">
                <button type="button" class="review-star text-slate-300" data-value="1" onclick="setReviewStars(1)">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5"><path d="M12 .587l3.668 7.431L23.4 9.748l-5.7 5.557L18.834 24 12 20.202 5.166 24l1.134-8.695L.6 9.748l7.732-1.73L12 .587z"/></svg>
                </button>
                <button type="button" class="review-star text-slate-300" data-value="2" onclick="setReviewStars(2)">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5"><path d="M12 .587l3.668 7.431L23.4 9.748l-5.7 5.557L18.834 24 12 20.202 5.166 24l1.134-8.695L.6 9.748l7.732-1.73L12 .587z"/></svg>
                </button>
                <button type="button" class="review-star text-slate-300" data-value="3" onclick="setReviewStars(3)">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5"><path d="M12 .587l3.668 7.431L23.4 9.748l-5.7 5.557L18.834 24 12 20.202 5.166 24l1.134-8.695L.6 9.748l7.732-1.73L12 .587z"/></svg>
                </button>
                <button type="button" class="review-star text-slate-300" data-value="4" onclick="setReviewStars(4)">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5"><path d="M12 .587l3.668 7.431L23.4 9.748l-5.7 5.557L18.834 24 12 20.202 5.166 24l1.134-8.695L.6 9.748l7.732-1.73L12 .587z"/></svg>
                </button>
                <button type="button" class="review-star text-slate-300" data-value="5" onclick="setReviewStars(5)">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5"><path d="M12 .587l3.668 7.431L23.4 9.748l-5.7 5.557L18.834 24 12 20.202 5.166 24l1.134-8.695L.6 9.748l7.732-1.73L12 .587z"/></svg>
                </button>
              </div>
            </div>
            <div>
              <label class="text-sm font-semibold">Review</label>
              <textarea id="reviewText" rows="3" class="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" placeholder="Share your experience"></textarea>
            </div>
            <div>
              <button type="submit" class="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-black text-white">Submit review</button>
            </div>
          </form>
        </div>
      </div>
    `;
  } else if (activeTab === "faq") {
    tabContent = `
      <div class="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
        <h3 class="text-lg font-black text-slate-900">Frequently asked questions</h3>
        <p class="mt-3">No FAQ entries available yet. This section will be populated after backend integration.</p>
      </div>
    `;
  } else if (activeTab === "related") {
    tabContent = `
      <div class="mt-3 flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible">
        ${relatedMarkup}
      </div>
    `;
  }

  document.getElementById("productModalContent").innerHTML = `
    <div class="space-y-4">
      <div class="relative">
        <img src="${activeImage}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85'" alt="${product.name}" class="h-64 w-full object-cover sm:h-80" />
        <button onclick="closeModal('productModal')" class="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90">
          <i data-lucide="x"></i>
        </button>
      </div>
      <div class="flex gap-3 overflow-x-auto pb-1">${thumbnailMarkup}</div>
    </div>

    <div class="p-5 sm:p-7 space-y-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-orange-500">${categoryName(product.category)}</p>
          <h2 class="mt-2 text-2xl font-black">${product.name}</h2>
          <p class="mt-2 text-sm text-slate-500">Sold by ${product.seller} · ${product.location}</p>
        </div>
        <button onclick="toggleWishlist(${product.id}); openProduct(${product.id})" class="rounded-xl border border-slate-200 p-3 ${saved ? "text-red-500" : "text-slate-500"}">
          <i data-lucide="heart" class="h-5 w-5 ${saved ? "fill-red-500" : ""}"></i>
        </button>
      </div>

      <div class="rounded-3xl bg-white p-4 shadow-sm">
        <div class="flex flex-wrap gap-2">
          ${tabButton("overview", "Overview", "layers")}
          ${tabButton("reviews", "Reviews", "message-circle")}
          ${tabButton("faq", "FAQ", "help-circle")}
          ${tabButton("related", "Related", "package")}
        </div>
        <div class="mt-4">${tabContent}</div>
      </div>
    </div>
  `;
  // initialize icons and optional review-star UI
  refreshIcons();
  const ratingInput = document.getElementById('reviewRating');
  if (ratingInput) setReviewStars(Number(ratingInput.value) || 5);
}

function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });

  saveState();
  showToast("Product added to cart");
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveState();
  renderCart();
}

function changeQuantity(id, amount) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.qty += amount;
  if (item.qty <= 0) removeFromCart(id);
  else {
    saveState();
    renderCart();
  }
}

function clearCart() {
  if (!cart.length) return;
  cart = [];
  saveState();
  renderCart();
  showToast("Cart cleared");
}

function cartDetails() {
  return cart.map(item => {
    const product = products.find(product => product.id === item.id);
    return product ? { ...product, qty: item.qty } : null;
  }).filter(Boolean);
}

function cartTotal() {
  return cartDetails().reduce((total, item) => total + item.price * item.qty, 0);
}

function renderCart() {
  const items = cartDetails();

  if (!items.length) {
    document.getElementById("cartContent").innerHTML = emptyState("shopping-cart", "Your cart is empty", "Add products to start your order.");
    return;
  }

  document.getElementById("cartContent").innerHTML = `
    <div class="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div class="space-y-3">
        ${items.map(item => `
          <div class="flex gap-3 rounded-2xl bg-white p-3 shadow-sm sm:gap-5 sm:p-4">
            <img src="${item.image}" alt="${item.name}" class="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28" />
            <div class="min-w-0 flex-1">
              <div class="flex justify-between gap-3">
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">${categoryName(item.category)}</p>
                  <h3 class="mt-1 truncate text-sm font-black">${item.name}</h3>
                </div>
                <button onclick="removeFromCart(${item.id})" class="text-slate-400 hover:text-red-500">
                  <i data-lucide="trash-2" class="h-4 w-4"></i>
                </button>
              </div>
              <p class="mt-2 font-black">${money(item.price)}</p>
              <div class="mt-3 flex items-center justify-between">
                <div class="flex items-center rounded-xl border border-slate-200">
                  <button onclick="changeQuantity(${item.id}, -1)" class="px-3 py-1.5 text-lg">−</button>
                  <span class="px-2 text-sm font-bold">${item.qty}</span>
                  <button onclick="changeQuantity(${item.id}, 1)" class="px-3 py-1.5 text-lg">+</button>
                </div>
                <b class="text-sm">${money(item.price * item.qty)}</b>
              </div>
            </div>
          </div>
        `).join("")}
      </div>

      <aside class="h-fit rounded-2xl bg-white p-5 shadow-sm">
        <h2 class="text-lg font-black">Order summary</h2>
        <div class="mt-5 space-y-3 text-sm">
          <div class="flex justify-between"><span class="text-slate-500">Subtotal</span><b>${money(cartTotal())}</b></div>
          <div class="flex justify-between"><span class="text-slate-500">Delivery</span><b class="text-emerald-600">Free</b></div>
          <div class="border-t border-slate-100 pt-3 text-base"><div class="flex justify-between"><b>Total</b><b>${money(cartTotal())}</b></div></div>
        </div>
        <button onclick="openCheckout()" class="mt-5 w-full btn-primary py-3.5 text-sm font-black">
          Proceed to checkout
        </button>
      </aside>
    </div>
  `;

  refreshIcons();
}

function toggleWishlist(id) {
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(item => item !== id);
    showToast("Removed from wishlist");
  } else {
    wishlist.push(id);
    showToast("Saved to wishlist");
  }

  saveState();
  renderHome();
  renderShop();
  if (document.getElementById("page-wishlist").classList.contains("active")) renderWishlist();
}

function renderWishlist() {
  const savedProducts = wishlist.map(id => products.find(product => product.id === id)).filter(Boolean);

  document.getElementById("wishlistContent").innerHTML = savedProducts.length
    ? `<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">${savedProducts.map(productCard).join("")}</div>`
    : emptyState("heart-off", "Your wishlist is empty", "Save products you love and find them here later.");

  refreshIcons();
}

function renderOrders() {
  if (!orders.length) {
    document.getElementById("ordersContent").innerHTML = emptyState("package-open", "No orders yet", "Your completed purchases will appear here.");
    return;
  }
  
  document.getElementById("ordersContent").innerHTML = `
    <div class="space-y-4">
      ${orders.map(order => `
        <article class="rounded-2xl bg-white p-5 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-slate-400">${order.id}</p>
              <h3 class="mt-1 font-black">${order.items.length} item${order.items.length === 1 ? "" : "s"} · ${money(order.total)}</h3>
            </div>
            <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">${order.status}</span>
          </div>
          <p class="mt-3 text-xs text-slate-500">${order.date}</p>
          <div class="mt-4 flex gap-2 overflow-x-auto">
            ${order.items.map(item => `
              <img src="${item.image}" alt="${item.name}" title="${item.name}" class="h-14 w-14 rounded-xl object-cover" />
            `).join("")}
          </div>
        </article>
      `).join("")}
    </div>
  `;

  // make order items clickable to open details
  document.querySelectorAll('#ordersContent article').forEach((el, idx) => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => openOrderDetail(orders[idx].id));
  });

  refreshIcons();
}

function renderOrderConfirmation() {
  const order = lastOrder || orders[0];
  const container = document.getElementById("confirmationContent");
  if (!container) return;

  if (!order) {
    container.innerHTML = `
      <div class="rounded-3xl bg-slate-50 p-8 text-center">
        <p class="text-sm text-slate-500">No recent order details are available yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <p class="text-xs uppercase tracking-[0.35em] text-slate-400">Order ID</p>
      <h2 class="mt-2 text-2xl font-black text-slate-900">${order.id}</h2>
      <p class="mt-2 text-sm text-slate-500">Placed on ${order.date}</p>
      <div class="mt-6 space-y-3 text-sm text-slate-600">
        <div class="flex justify-between"><span>Status</span><strong>${order.status}</strong></div>
        <div class="flex justify-between"><span>Items</span><strong>${order.items.length}</strong></div>
        <div class="flex justify-between"><span>Total paid</span><strong>${money(order.total)}</strong></div>
      </div>
    </div>
    <aside class="rounded-3xl border border-slate-200 bg-white p-6">
      <h3 class="text-lg font-black text-slate-900">Order summary</h3>
      <div class="mt-4 space-y-4">
        ${order.items.map(item => `
          <div class="flex items-center gap-3">
            <img src="${item.image}" alt="${item.name}" class="h-16 w-16 rounded-2xl object-cover" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-black text-slate-900">${item.name}</p>
              <p class="text-xs text-slate-500">${item.qty} × ${money(item.price)}</p>
            </div>
            <p class="text-sm font-black text-slate-900">${money(item.price * item.qty)}</p>
          </div>
        `).join("")}
      </div>
    </aside>
  `;
}

function openOrderDetail(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  const content = document.getElementById('orderDetailContent');
  content.innerHTML = `
    <div class="space-y-4">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <p class="text-xs uppercase tracking-[0.35em] text-slate-400">Order ID</p>
        <h2 class="mt-2 text-2xl font-black text-slate-900">${order.id}</h2>
        <p class="mt-2 text-sm text-slate-500">Placed on ${order.date}</p>
        <div class="mt-6 space-y-3 text-sm text-slate-600">
          <div class="flex justify-between"><span>Status</span><strong>${order.status}</strong></div>
          <div class="flex justify-between"><span>Items</span><strong>${order.items.length}</strong></div>
          <div class="flex justify-between"><span>Total paid</span><strong>${money(order.total)}</strong></div>
        </div>
      </div>
      <div class="rounded-2xl bg-white p-5 shadow-sm">
        <h3 class="text-lg font-black text-slate-900">Items</h3>
        <div class="mt-4 space-y-3">
          ${order.items.map(item => `
            <div class="flex items-center gap-3">
              <img src="${item.image}" alt="${item.name}" class="h-16 w-16 rounded-2xl object-cover" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-black text-slate-900">${item.name}</p>
                <p class="text-xs text-slate-500">${item.qty} × ${money(item.price)}</p>
              </div>
              <p class="text-sm font-black text-slate-900">${money(item.price * item.qty)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  openModal('orderDetailModal');
}

function openCheckout() {
  if (!cart.length) {
    showToast("Your cart is empty");
    return;
  }

  if (document.getElementById("checkoutName")) {
    document.getElementById("checkoutName").value = account.name || "";
    document.getElementById("checkoutPhone").value = account.phone || "";
    document.getElementById("checkoutAddress").value = account.address || "";
    document.getElementById("checkoutPaymentMethod").value = account.paymentMethod || "";
  }

  document.getElementById("checkoutTotal").innerHTML = `
    <div class="flex justify-between">
      <span class="text-slate-500">Total to pay</span>
      <b class="text-lg text-orange-600">${money(cartTotal())}</b>
    </div>
  `;

  openModal("checkoutModal");
}

function placeOrder(event) {
  event.preventDefault();

  const name = document.getElementById("checkoutName")?.value.trim();
  const phone = document.getElementById("checkoutPhone")?.value.trim();
  const address = document.getElementById("checkoutAddress")?.value.trim();
  const paymentMethod = document.getElementById("checkoutPaymentMethod")?.value;

  if (!name || !phone || !address || !paymentMethod) {
    showToast("Please complete the checkout details.");
    return;
  }

  account.name = name;
  account.phone = phone;
  account.address = address;
  account.paymentMethod = paymentMethod;
  account.memberSince = account.memberSince || new Date().getFullYear().toString();
  saveState();
  renderProfilePage();

  const newOrder = {
    id: `ZMX-${Date.now().toString().slice(-6)}`,
    items: cartDetails(),
    total: cartTotal(),
    status: "Processing",
    date: new Date().toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }),
    customer: {
      name,
      phone,
      address,
      paymentMethod
    }
  };

  orders.unshift(newOrder);
      lastOrder = newOrder;
      cart = [];
      saveState();
      backend.syncOrders(orders).catch(() => {});
      closeModal("checkoutModal");
      renderCart();
      navigate("confirmation");
}

function submitProduct(event) {
  event.preventDefault();

  // Check if user is logged in
  if (!currentUser) {
    window.pendingSellerRedirect = 'storeSettings';
    showToast("Please login or create an account to publish a product");
    navigate('login');
    return;
  }

  const name = document.getElementById("sellerName").value.trim();
  const category = document.getElementById("sellerCategory").value;
  const price = Number(document.getElementById("sellerPrice").value);
  const image = document.getElementById("sellerImage").value.trim() || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85";
  const description = document.getElementById("sellerDescription").value.trim() || "Seller-listed product on Zomax.";
  const sellerName = account.name || "Zomax Seller";
  const sellerLocation = account.address ? account.address.split(",").slice(-1)[0].trim() : "Unknown";

  const newProduct = {
    id: Date.now(),
    name,
    category,
    price,
    oldPrice: null,
    rating: 5,
    reviews: 0,
    seller: sellerName,
    location: sellerLocation,
    image,
    description
  };

  products.unshift(newProduct);
  event.target.reset();
  renderHome();
  renderShop();
  backend.saveProductListing(newProduct).catch(() => {});
  showToast("Product published successfully");
  navigate("shop");
}

function emptyState(icon, title, description) {
  return `
    <div class="rounded-3xl bg-white px-6 py-14 text-center shadow-sm">
      <span class="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-orange-100 text-orange-600">
        <i data-lucide="${icon}" class="h-7 w-7"></i>
      </span>
      <h2 class="mt-5 text-xl font-black">${title}</h2>
      <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">${description}</p>
      <button onclick="navigate('shop')" class="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white">
        Browse products
      </button>
    </div>
  `;
}

function updateBadges() {
  const cartCount = cart.reduce((total, item) => total + item.qty, 0);
  const wishlistCount = wishlist.length;

  ["desktopCartCount", "mobileCartCount"].forEach(id => {
    const element = document.getElementById(id);
    element.textContent = cartCount;
    element.classList.toggle("hidden", cartCount === 0);
  });

  ["desktopWishlistCount", "mobileWishlistCount"].forEach(id => {
    const element = document.getElementById(id);
    element.textContent = wishlistCount;
    element.classList.toggle("hidden", wishlistCount === 0);
  });
}

function openModal(id) {
  document.getElementById(id).classList.add("open");
  document.body.classList.add("overflow-hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  document.body.classList.remove("overflow-hidden");
}

function renderProfilePage() {
  // First-letter avatar
  const initials = currentUser ? ((account.name && account.name.trim().length) ? account.name.trim().charAt(0).toUpperCase() : (account.username || '?').charAt(0).toUpperCase()) : '?';
  const profileEl = document.getElementById('profileInitials');
  const topbarEl = document.getElementById('topbarProfileInitials');

  if (currentUser) {
    profileEl.textContent = initials;
    profileEl.className = 'grid h-20 w-20 place-items-center rounded-3xl bg-orange-500 text-white text-3xl font-black ring-1 ring-white/10';
    topbarEl.textContent = initials;
    topbarEl.className = 'grid h-9 w-9 place-items-center rounded-full bg-orange-500 text-white font-bold';
  } else {
    profileEl.textContent = '?';
    profileEl.className = 'grid h-20 w-20 place-items-center rounded-3xl bg-white/10 text-3xl font-black ring-1 ring-white/15';
    topbarEl.textContent = '?';
    topbarEl.className = 'grid h-9 w-9 place-items-center rounded-full bg-orange-100 font-bold text-orange-600';
  }

  document.getElementById('profileDisplayName').textContent = currentUser ? (account.name || 'Your name') : 'Guest shopper';
  document.getElementById('profileContactLine').textContent = currentUser ? (account.email ? `${account.email} • ${account.phone || 'No phone'}` : 'Update your contact details') : 'Login to unlock saved account details and faster checkout.';
  document.getElementById('profileOrdersCount').textContent = currentUser ? orders.length : 0;
  document.getElementById('profileWishlistCount').textContent = currentUser ? wishlist.length : 0;
  document.getElementById('profileSince').textContent = currentUser ? account.memberSince || '—' : '—';
  document.getElementById('profileSettingsSection').classList.toggle('hidden', !currentUser);

  // Render inline primary address & payment selection
  const primaryContainer = document.getElementById('profilePrimaryInfo');
  if (primaryContainer) {
    if (!currentUser) {
      primaryContainer.innerHTML = '';
    } else {
      // Primary address
      const addrList = account.addresses || [];
      const primaryAddr = addrList.length ? addrList[0].address : (account.address || 'No address set');
      const addrOptions = addrList.length ? addrList.map((a,i)=>`<option value="${i}">${a.label||`Address ${i+1}`} — ${a.address.slice(0,40)}${a.address.length>40?'...':''}</option>`).join('') : '';

      // Primary payment
      const payList = account.paymentMethods || [];
      const primaryPay = payList.length ? `${payList[0].type} • **** ${payList[0].last4}` : (account.cardLast4 ? `**** ${account.cardLast4}` : 'No payment method');
      const payOptions = payList.length ? payList.map((p,i)=>`<option value="${i}">${p.label||p.type} • **** ${p.last4}</option>`).join('') : '';

      primaryContainer.innerHTML = `
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <div class="text-sm">
            <p class="text-xs text-orange-200">Primary delivery</p>
            <p class="text-sm font-semibold text-white">${primaryAddr}</p>
          </div>
          <div class="flex items-center gap-2">
            ${addrOptions ? `<select id="profileAddrSelect" class="rounded-2xl px-3 py-2 text-sm">${addrOptions}</select>
            <button type="button" onclick="setPrimaryAddress(Number(document.getElementById('profileAddrSelect').value))" class="rounded-2xl bg-white/10 px-3 py-2 text-sm text-white">Set primary</button>
            <button type="button" onclick="openAccountSettings('address')" class="rounded-2xl border border-white/10 px-3 py-2 text-sm text-white">Manage</button>` : `<button type="button" onclick="openAccountSettings('address')" class="rounded-2xl border border-white/10 px-3 py-2 text-sm text-white">Add address</button>`}
          </div>
        </div>

        <div class="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <div class="text-sm">
            <p class="text-xs text-orange-200">Primary payment</p>
            <p class="text-sm font-semibold text-white">${primaryPay}</p>
          </div>
          <div class="flex items-center gap-2">
            ${payOptions ? `<select id="profilePaySelect" class="rounded-2xl px-3 py-2 text-sm">${payOptions}</select>
            <button type="button" onclick="setPrimaryPayment(Number(document.getElementById('profilePaySelect').value))" class="rounded-2xl bg-white/10 px-3 py-2 text-sm text-white">Set primary</button>
            <button type="button" onclick="openAccountSettings('payment')" class="rounded-2xl border border-white/10 px-3 py-2 text-sm text-white">Manage</button>` : `<button type="button" onclick="openAccountSettings('payment')" class="rounded-2xl border border-white/10 px-3 py-2 text-sm text-white">Add payment</button>`}
          </div>
        </div>
      `;
    }
  }

  if (!currentUser) {
    document.getElementById('profileActionCards').innerHTML = `
      <div class="rounded-[32px] border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <p class="text-sm font-semibold text-slate-500">You're browsing as a guest</p>
        <h2 class="mt-4 text-2xl font-black text-slate-900">Login for a personalized account</h2>
        <p class="mt-3 text-sm leading-6 text-slate-500">Sign in to save your profile, address, wishlist and orders across sessions.</p>
        <button onclick="navigate('login')" class="mt-6 inline-flex rounded-3xl bg-orange-500 px-6 py-3 text-sm font-black text-white hover:bg-orange-600">Login now</button>
      </div>
    `;
  } else {
    const paymentMethod = account.cardLast4 ? `**** **** **** ${account.cardLast4}` : 'No card saved';
    const newsletterOn = account.preferences?.newsletter ? 'checked' : '';
    document.getElementById('profileActionCards').innerHTML = `
      <div class="grid gap-4 sm:grid-cols-2">
        <button onclick="navigate('orders')" class="group rounded-[32px] border border-slate-200 bg-white p-5 text-left shadow-lg shadow-slate-200/30 transition hover:-translate-y-0.5 hover:shadow-xl">
          <div class="flex h-14 w-14 items-center justify-center rounded-3xl bg-orange-100 text-orange-600 transition group-hover:bg-orange-200">
            <i data-lucide="package" class="h-5 w-5"></i>
          </div>
          <div class="mt-4">
            <p class="text-sm font-semibold text-slate-700">My orders</p>
            <p class="mt-1 text-sm text-slate-400">${orders.length} orders • Track deliveries</p>
          </div>
        </button>

        <div class="group rounded-[32px] border border-slate-200 bg-white p-5 text-left shadow-lg shadow-slate-200/30">
          <div class="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-700">
            <i data-lucide="credit-card" class="h-5 w-5"></i>
          </div>
          <div class="mt-4">
            <p class="text-sm font-semibold text-slate-700">Payment</p>
            <p class="mt-1 text-sm text-slate-400">${paymentMethod}</p>
          </div>
        </div>

        <div class="rounded-[32px] border border-slate-200 bg-white p-5 text-left shadow-lg">
          <div class="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-700">
            <i data-lucide="activity" class="h-5 w-5"></i>
          </div>
          <div class="mt-4">
            <p class="text-sm font-semibold text-slate-700">Recent activity</p>
            <p class="mt-1 text-sm text-slate-400">See your latest orders and reviews</p>
          </div>
        </div>

        <div class="rounded-[32px] border border-slate-200 bg-white p-5 text-left shadow-lg">
          <div class="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-700">
            <i data-lucide="download" class="h-5 w-5"></i>
          </div>
          <div class="mt-4 flex items-start gap-3">
            <div class="flex-1">
              <p class="text-sm font-semibold text-slate-700">Account export</p>
              <p class="mt-1 text-sm text-slate-400">Download a copy of your account data</p>
            </div>
            <div class="flex flex-col gap-2">
              <button type="button" onclick="exportAccount()" class="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">Export</button>
              <button type="button" onclick="document.getElementById('accountImportInput').click()" class="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">Import</button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 rounded-[32px] bg-white p-5 shadow-lg">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-slate-700">Newsletter</p>
          <label class="flex items-center gap-3">
            <input id="newsletterToggle" type="checkbox" ${newsletterOn} onchange="toggleNewsletter(this.checked)" />
            <span class="text-sm text-slate-500">Subscribe</span>
          </label>
        </div>
        <p class="mt-3 text-sm text-slate-500">Receive exclusive offers and product updates.</p>
      </div>

      <div id="recentActivity" class="mt-6 rounded-[32px] bg-white p-5 shadow-lg">
        <h3 class="text-lg font-black text-slate-900">Recent activity</h3>
        <div class="mt-4" id="recentActivityList"></div>
      </div>
    `;
    renderRecentActivity();
  }

  // Show or hide the Deactivate button on the profile overview (explicit add/remove avoids toggle edge-cases)
  const deactivateBtn = document.getElementById('profileDeactivateBtn');
  if (deactivateBtn) {
    if (!currentUser) deactivateBtn.classList.add('hidden');
    else deactivateBtn.classList.remove('hidden');
  }
}

function openAccountSettings(tab = "profile") {
  if (!currentUser) {
    openLoginModal();
    return;
  }
  renderAccountModal(tab);
  openModal("accountModal");
  refreshIcons();
}

function openStoreSettings() {
  if (!currentUser) {
    window.pendingSellerRedirect = 'storeSettings';
    openStoreAuthModal();
    return;
  }
  window.pendingSellerRedirect = null;
  renderStoreSettings();
  openModal("storeSettingsModal");
  refreshIcons();
}

function openStoreAuthModal() {
  const container = document.getElementById('storeAuthContent');
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-5">
      <div class="rounded-[28px] border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="grid h-12 w-12 place-items-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200">
            <i data-lucide="shield-check" class="h-5 w-5"></i>
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-600">Seller access</p>
            <p class="mt-1 text-sm text-slate-600">Securely manage your store, prices, shipping and policies.</p>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-600">
          <div class="rounded-2xl bg-white/80 px-2 py-2 shadow-sm ring-1 ring-slate-100">
            <div class="text-slate-900">100%</div>
            <div class="mt-1 text-[9px] uppercase tracking-[0.18em] text-slate-500">Secure</div>
          </div>
          <div class="rounded-2xl bg-white/80 px-2 py-2 shadow-sm ring-1 ring-slate-100">
            <div class="text-slate-900">24/7</div>
            <div class="mt-1 text-[9px] uppercase tracking-[0.18em] text-slate-500">Access</div>
          </div>
          <div class="rounded-2xl bg-white/80 px-2 py-2 shadow-sm ring-1 ring-slate-100">
            <div class="text-slate-900">Live</div>
            <div class="mt-1 text-[9px] uppercase tracking-[0.18em] text-slate-500">Sync</div>
          </div>
        </div>
      </div>

      <form onsubmit="loginToStoreSettings(event)" class="space-y-4">
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700">Email address</label>
          <div class="relative">
            <span class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
              <i data-lucide="mail" class="h-4 w-4"></i>
            </span>
            <input id="storeAuthEmail" type="email" required class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100" value="${currentUser?.email || ''}" placeholder="you@example.com" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700">Password</label>
          <div class="relative">
            <span class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
              <i data-lucide="lock" class="h-4 w-4"></i>
            </span>
            <input id="storeAuthPassword" type="password" required class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100" placeholder="Enter your password" />
          </div>
        </div>

        <button type="submit" class="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:brightness-105">Continue to store settings</button>
      </form>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
        Need an account? <a href="#" onclick="navigate('signup'); closeModal('storeAuthModal'); return false;" class="font-black text-orange-600">Create one</a>
      </div>
    </div>
  `;

  openModal('storeAuthModal');
  refreshIcons();
}

async function loginToStoreSettings(event) {
  event.preventDefault();

  const email = document.getElementById('storeAuthEmail')?.value.trim();
  const password = document.getElementById('storeAuthPassword')?.value.trim();

  if (!email || !password) {
    showToast('Enter your email and password to continue.');
    return;
  }

  const username = email.split('@')[0];
  const name = username.split(/[._-]/).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') || 'Zomax shopper';

  try {
    currentUser = await backend.login({ username, email, name, role: 'buyer', memberSince: new Date().getFullYear().toString() });
    account.username = account.username || username;
    account.name = account.name || name;
    account.email = account.email || email;
    account.memberSince = account.memberSince || currentUser.memberSince;
    saveState();
    renderProfilePage();
    renderAuthState();

    const shouldOpenStoreSetup = window.pendingSellerRedirect === 'storeSettings';
    window.pendingSellerRedirect = null;
    closeModal('storeAuthModal');

    if (shouldOpenStoreSetup) {
      renderStoreSettings();
      openModal('storeSettingsModal');
      showToast('Store access granted');
      return;
    }

    renderStoreSettings();
    openModal('storeSettingsModal');
    showToast('Store access granted');
  } catch (error) {
    showToast('Unable to sign in. Please try again.');
  }
}

function renderStoreSettings() {
  const container = document.getElementById('storeSettingsContent');
  if (!container) return;

  // Initialize storeInfo if not exists
  if (!account.storeInfo) {
    account.storeInfo = {
      storeName: account.name || '',
      storeEmail: account.email || '',
      storePhone: account.phone || '',
      storeLocation: account.address || '',
      storeDescription: '',
      storeLogo: '',
      storeHours: '9:00 AM - 6:00 PM',
      shippingInfo: 'Free shipping on orders over ₦5,000',
      returnPolicy: '30 days return policy',
      businessType: 'Individual',
      taxId: '',
      bankAccount: ''
    };
  }

  const store = account.storeInfo;

  container.innerHTML = `
    <form onsubmit="saveStoreSettings(event)" class="space-y-4">
      <!-- Basic Info Section -->
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 class="font-black text-slate-900">Basic Information</h3>
        
        <label class="mt-4 block text-sm font-semibold text-slate-700">
          Store name
          <input type="text" id="storeNameInput" value="${store.storeName}" required class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" placeholder="Your store name" />
        </label>

        <label class="mt-3 block text-sm font-semibold text-slate-700">
          Store email
          <input type="email" id="storeEmailInput" value="${store.storeEmail}" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" placeholder="store@example.com" />
        </label>

        <label class="mt-3 block text-sm font-semibold text-slate-700">
          Store phone
          <input type="tel" id="storePhoneInput" value="${store.storePhone}" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" placeholder="+234 (0) 123 456 7890" />
        </label>

        <label class="mt-3 block text-sm font-semibold text-slate-700">
          Store location
          <input type="text" id="storeLocationInput" value="${store.storeLocation}" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" placeholder="City, State" />
        </label>
      </div>

      <!-- Store Description Section -->
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 class="font-black text-slate-900">Store Profile</h3>
        
        <label class="mt-4 block text-sm font-semibold text-slate-700">
          Store description
          <textarea id="storeDescriptionInput" rows="3" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" placeholder="Tell customers about your store...">${store.storeDescription}</textarea>
        </label>

        <label class="mt-3 block text-sm font-semibold text-slate-700">
          Store logo URL
          <input type="url" id="storeLogoInput" value="${store.storeLogo}" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" placeholder="https://example.com/logo.jpg" />
        </label>

        <label class="mt-3 block text-sm font-semibold text-slate-700">
          Business type
          <select id="businessTypeInput" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm">
            <option value="Individual" ${store.businessType === 'Individual' ? 'selected' : ''}>Individual seller</option>
            <option value="Business" ${store.businessType === 'Business' ? 'selected' : ''}>Registered business</option>
            <option value="Enterprise" ${store.businessType === 'Enterprise' ? 'selected' : ''}>Enterprise</option>
          </select>
        </label>
      </div>

      <!-- Operating Hours Section -->
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 class="font-black text-slate-900">Operating Hours</h3>
        
        <label class="mt-4 block text-sm font-semibold text-slate-700">
          Store hours
          <input type="text" id="storeHoursInput" value="${store.storeHours}" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" placeholder="9:00 AM - 6:00 PM" />
        </label>
      </div>

      <!-- Policies Section -->
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 class="font-black text-slate-900">Policies & Shipping</h3>
        
        <label class="mt-4 block text-sm font-semibold text-slate-700">
          Shipping information
          <input type="text" id="shippingInfoInput" value="${store.shippingInfo}" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" placeholder="Free shipping on orders over ₦5,000" />
        </label>

        <label class="mt-3 block text-sm font-semibold text-slate-700">
          Return policy
          <input type="text" id="returnPolicyInput" value="${store.returnPolicy}" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" placeholder="30 days return policy" />
        </label>
      </div>

      <!-- Tax & Banking Section -->
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 class="font-black text-slate-900">Tax & Banking</h3>
        
        <label class="mt-4 block text-sm font-semibold text-slate-700">
          Tax ID (optional)
          <input type="text" id="taxIdInput" value="${store.taxId}" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" placeholder="Your tax identification number" />
        </label>

        <label class="mt-3 block text-sm font-semibold text-slate-700">
          Bank account (last 4 digits)
          <input type="text" id="bankAccountInput" value="${store.bankAccount}" maxlength="4" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" placeholder="Last 4 digits" />
        </label>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2 pt-4">
        <button type="submit" class="flex-1 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-white hover:bg-orange-600">
          Save changes
        </button>
        <button type="button" onclick="closeModal('storeSettingsModal')" class="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </form>
  `;
}

function saveStoreSettings(event) {
  event.preventDefault();

  account.storeInfo = {
    storeName: document.getElementById('storeNameInput').value.trim(),
    storeEmail: document.getElementById('storeEmailInput').value.trim(),
    storePhone: document.getElementById('storePhoneInput').value.trim(),
    storeLocation: document.getElementById('storeLocationInput').value.trim(),
    storeDescription: document.getElementById('storeDescriptionInput').value.trim(),
    storeLogo: document.getElementById('storeLogoInput').value.trim(),
    businessType: document.getElementById('businessTypeInput').value,
    storeHours: document.getElementById('storeHoursInput').value.trim(),
    shippingInfo: document.getElementById('shippingInfoInput').value.trim(),
    returnPolicy: document.getElementById('returnPolicyInput').value.trim(),
    taxId: document.getElementById('taxIdInput').value.trim(),
    bankAccount: document.getElementById('bankAccountInput').value.trim()
  };

  saveState();
  showToast('Store settings saved successfully');
  closeModal('storeSettingsModal');
  renderDashboard();
}

function toggleNewsletter(enabled) {
  account.preferences = account.preferences || {};
  account.preferences.newsletter = !!enabled;
  saveState();
  showToast(enabled ? 'Subscribed to newsletter' : 'Unsubscribed from newsletter');
}

function renderRecentActivity() {
  const container = document.getElementById('recentActivityList');
  if (!container) return;
  const items = [];
  // recent orders (up to 3)
  const recentOrders = orders.slice().reverse().slice(0, 3);
  recentOrders.forEach(o => items.push({type: 'order', text: `Order #${o.id} — ${o.items?.length || 0} items • ${o.status || 'Placed'}`}));
  // recent wishlist additions (best-effort)
  if (wishlist.length) items.push({type: 'wishlist', text: `Added ${wishlist.length} item(s) to wishlist`});
  // recent reviews
  const reviewKeys = Object.keys(reviewsStore||{}).slice(-3).reverse();
  reviewKeys.forEach(k => items.push({type: 'review', text: `Left a review for ${reviewsStore[k].productName || 'a product'}`}));

  if (!items.length) {
    container.innerHTML = `<p class="text-sm text-slate-500">No recent activity.</p>`;
    return;
  }

  container.innerHTML = items.map(it => `
    <div class="flex items-start gap-3 py-3 border-b border-slate-100">
      <div class="h-9 w-9 shrink-0 rounded-xl bg-slate-50 grid place-items-center text-slate-700">
        <i data-lucide="${it.type === 'order' ? 'package' : it.type === 'review' ? 'message-circle' : 'heart'}" class="h-4 w-4"></i>
      </div>
      <div>
        <p class="text-sm font-semibold text-slate-800">${it.text}</p>
      </div>
    </div>
  `).join('');
  refreshIcons();
}

function renderAccountModal(activeTab) {
  const tabButton = (tab, label, icon) => `
    <button onclick="renderAccountModal('${tab}')" class="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold ${activeTab === tab ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}">
      <i data-lucide="${icon}" class="h-4 w-4"></i>
      ${label}
    </button>
  `;

  const profileContent = `
    <form onsubmit="saveAccountSettings(event)">
      <div class="space-y-4">
        <label class="block text-sm font-semibold text-slate-700">
          Full name
          <input id="accountName" type="text" class="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" value="${account.name}" placeholder="Enter your name" required />
        </label>
        <label class="block text-sm font-semibold text-slate-700">
          Email address
          <input id="accountEmail" type="email" class="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" value="${account.email}" placeholder="user@example.com" required />
        </label>
        <label class="block text-sm font-semibold text-slate-700">
          Phone number
          <input id="accountPhone" type="tel" class="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" value="${account.phone}" placeholder="+234 800 000 0000" required />
        </label>
        <button type="submit" class="mt-2 w-full rounded-3xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600">Save profile</button>
        <button type="button" onclick="deactivateAccount()" class="mt-2 w-full rounded-3xl bg-red-500 px-5 py-3 text-sm font-black text-white hover:bg-red-600">Deactivate account</button>
        <div class="mt-3 flex gap-3">
          <button type="button" onclick="exportAccount()" class="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">Export account</button>
          <button type="button" onclick="document.getElementById('accountImportInput').click()" class="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">Import account</button>
        </div>
      </div>
    </form>
  `;

  const addressContent = `
    <div class="space-y-4">
      <p class="text-sm text-slate-500">Manage your saved delivery addresses. Use the add button to create a new address.</p>
      <div id="addressesList" class="space-y-3">
        ${account.addresses && account.addresses.length ? account.addresses.map((a, i) => `
          <div class="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 p-3">
            <div>
              <p class="text-sm font-semibold text-slate-800">${a.label || `Address ${i+1}`}</p>
              <p class="mt-1 text-sm text-slate-500">${a.address}</p>
            </div>
            <div class="flex gap-2">
              <button type="button" onclick="editAddress(${i})" class="rounded-2xl border border-slate-200 px-3 py-2 text-sm">Edit</button>
              <button type="button" onclick="deleteAddress(${i})" class="rounded-2xl border border-red-200 px-3 py-2 text-sm text-red-600">Delete</button>
            </div>
          </div>
        `).join('') : '<p class="text-sm text-slate-500">No addresses saved yet.</p>'}
      </div>

      <div id="addressFormWrap" class="hidden">
        <form id="addressForm" onsubmit="saveAddressForm(event)">
          <label class="block text-sm font-semibold text-slate-700">
            Label (e.g., Home, Office)
            <input id="addressLabel" type="text" class="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            Full address
            <textarea id="addressValue" rows="3" required class="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"></textarea>
          </label>
          <div class="flex gap-2">
            <button type="submit" class="mt-2 rounded-3xl bg-orange-500 px-4 py-2 text-sm font-black text-white">Save address</button>
            <button type="button" onclick="hideAddressForm()" class="mt-2 rounded-3xl border border-slate-200 px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      </div>

      <button type="button" onclick="showAddressForm()" class="mt-2 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">Add new address</button>
    </div>
  `;

  const paymentContent = `
    <div class="space-y-4">
      <p class="text-sm text-slate-500">Manage saved payment methods used at checkout.</p>
      <div id="paymentList" class="space-y-3">
        ${account.paymentMethods && account.paymentMethods.length ? account.paymentMethods.map((p, i) => `
          <div class="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 p-3">
            <div>
              <p class="text-sm font-semibold text-slate-800">${p.label || p.type || `Card ${i+1}`}</p>
              <p class="mt-1 text-sm text-slate-500">${p.type} ${p.last4 ? `• **** ${p.last4}` : ''}</p>
            </div>
            <div class="flex gap-2">
              <button type="button" onclick="editPayment(${i})" class="rounded-2xl border border-slate-200 px-3 py-2 text-sm">Edit</button>
              <button type="button" onclick="deletePayment(${i})" class="rounded-2xl border border-red-200 px-3 py-2 text-sm text-red-600">Delete</button>
            </div>
          </div>
        `).join('') : '<p class="text-sm text-slate-500">No payment methods saved.</p>'}
      </div>

      <div id="paymentFormWrap" class="hidden">
        <form id="paymentForm" onsubmit="savePaymentForm(event)">
          <label class="block text-sm font-semibold text-slate-700">
            Label (e.g., Personal, Company)
            <input id="paymentLabel" type="text" class="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            Type
            <select id="paymentType" class="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <option value="Card payment">Card payment</option>
              <option value="Mobile wallet">Mobile wallet</option>
            </select>
          </label>
          <label class="block text-sm font-semibold text-slate-700">
            Last 4 digits
            <input id="paymentLast4" type="text" maxlength="4" class="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
          </label>
          <div class="flex gap-2">
            <button type="submit" class="mt-2 rounded-3xl bg-orange-500 px-4 py-2 text-sm font-black text-white">Save payment</button>
            <button type="button" onclick="hidePaymentForm()" class="mt-2 rounded-3xl border border-slate-200 px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      </div>

      <button type="button" onclick="showPaymentForm()" class="mt-2 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">Add payment method</button>
    </div>
  `;

  const content = activeTab === "address" ? addressContent : activeTab === "payment" ? paymentContent : profileContent;

  document.getElementById("accountModalContent").innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-orange-500">Account settings</p>
        <h3 class="mt-3 text-lg font-black text-slate-900">${activeTab === "address" ? "Delivery address" : activeTab === "payment" ? "Payment settings" : "Edit profile"}</h3>
      </div>
      <div class="flex flex-wrap gap-2">
        ${tabButton("profile", "Profile", "user")}
        ${tabButton("address", "Address", "map-pin")}
        ${tabButton("payment", "Payment", "credit-card")}
      </div>
    </div>
    <div class="mt-6">${content}</div>
  `;

  refreshIcons();
}

function saveAccountSettings(event) {
  event.preventDefault();
  account.name = document.getElementById("accountName").value.trim() || account.name;
  account.email = document.getElementById("accountEmail").value.trim() || account.email;
  account.phone = document.getElementById("accountPhone").value.trim() || account.phone;
  saveState();
  renderProfilePage();
  renderAccountModal("profile");
  showToast("Profile updated successfully");
}

function saveDeliveryAddress(event) {
  event.preventDefault();
  // Deprecated: keep compatibility with single-address field
  const single = document.getElementById("accountAddress");
  if (single) {
    account.address = single.value.trim();
    saveState();
    renderAccountModal("address");
    showToast("Delivery address saved");
  }
}

function savePaymentSettings(event) {
  event.preventDefault();
  // Deprecated: keep compatibility with legacy single-payment form
  const pm = document.getElementById("accountPaymentMethod");
  if (pm) {
    account.paymentMethod = pm.value;
    account.cardName = document.getElementById("accountCardName").value.trim() || account.cardName;
    account.cardLast4 = document.getElementById("accountCardLast4").value.trim().slice(-4) || account.cardLast4;
    saveState();
    renderAccountModal("payment");
    showToast("Payment settings updated");
  }
}

// Address CRUD helpers
function showAddressForm(editIndex = null) {
  document.getElementById('addressFormWrap').classList.remove('hidden');
  if (editIndex !== null) {
    const addr = account.addresses[editIndex];
    document.getElementById('addressLabel').value = addr.label || '';
    document.getElementById('addressValue').value = addr.address || '';
    document.getElementById('addressForm').dataset.editIndex = editIndex;
  } else {
    document.getElementById('addressLabel').value = '';
    document.getElementById('addressValue').value = '';
    delete document.getElementById('addressForm').dataset.editIndex;
  }
}

function hideAddressForm() {
  document.getElementById('addressFormWrap').classList.add('hidden');
  delete document.getElementById('addressForm').dataset.editIndex;
}

function saveAddressForm(event) {
  event.preventDefault();
  const label = document.getElementById('addressLabel').value.trim();
  const addr = document.getElementById('addressValue').value.trim();
  if (!addr) { showToast('Address cannot be empty'); return; }
  account.addresses = account.addresses || [];
  const idx = document.getElementById('addressForm').dataset.editIndex;
  if (idx !== undefined) {
    account.addresses[Number(idx)] = { label, address: addr };
    showToast('Address updated');
  } else {
    account.addresses.push({ label, address: addr });
    showToast('Address added');
  }
  saveState();
  renderAccountModal('address');
}

function editAddress(i) { showAddressForm(i); }

function deleteAddress(i) {
  if (!confirm('Delete this address?')) return;
  account.addresses = account.addresses || [];
  account.addresses.splice(i,1);
  saveState();
  renderAccountModal('address');
  showToast('Address deleted');
}

// Payment CRUD helpers
function showPaymentForm(editIndex = null) {
  document.getElementById('paymentFormWrap').classList.remove('hidden');
  if (editIndex !== null) {
    const pm = account.paymentMethods[editIndex];
    document.getElementById('paymentLabel').value = pm.label || '';
    document.getElementById('paymentType').value = pm.type || 'Card payment';
    document.getElementById('paymentLast4').value = pm.last4 || '';
    document.getElementById('paymentForm').dataset.editIndex = editIndex;
  } else {
    document.getElementById('paymentLabel').value = '';
    document.getElementById('paymentType').value = 'Card payment';
    document.getElementById('paymentLast4').value = '';
    delete document.getElementById('paymentForm').dataset.editIndex;
  }
}

function hidePaymentForm() {
  document.getElementById('paymentFormWrap').classList.add('hidden');
  delete document.getElementById('paymentForm').dataset.editIndex;
}

function savePaymentForm(event) {
  event.preventDefault();
  const label = document.getElementById('paymentLabel').value.trim();
  const type = document.getElementById('paymentType').value;
  const last4 = document.getElementById('paymentLast4').value.trim().slice(-4);
  if (!last4) { showToast('Enter last 4 digits'); return; }
  account.paymentMethods = account.paymentMethods || [];
  const idx = document.getElementById('paymentForm').dataset.editIndex;
  if (idx !== undefined) {
    account.paymentMethods[Number(idx)] = { label, type, last4 };
    showToast('Payment updated');
  } else {
    account.paymentMethods.push({ label, type, last4 });
    showToast('Payment method added');
  }
  saveState();
  renderAccountModal('payment');
}

function editPayment(i) { showPaymentForm(i); }

function deletePayment(i) {
  if (!confirm('Delete this payment method?')) return;
  account.paymentMethods = account.paymentMethods || [];
  account.paymentMethods.splice(i,1);
  saveState();
  renderAccountModal('payment');
  showToast('Payment method removed');
}

function exportAccount() {
  const payload = {
    account,
    currentUser,
    wishlist,
    cart,
    orders,
    reviewsStore
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zomax-account-${(account.username||'guest')}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Account exported');
}

document.getElementById('accountImportInput')?.addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const obj = JSON.parse(text);
    if (obj.account) account = Object.assign({}, defaultAccount, obj.account);
    if (obj.currentUser) currentUser = obj.currentUser;
    if (Array.isArray(obj.wishlist)) wishlist = obj.wishlist;
    if (Array.isArray(obj.cart)) cart = obj.cart;
    if (Array.isArray(obj.orders)) orders = obj.orders;
    if (obj.reviewsStore) reviewsStore = obj.reviewsStore;
    saveReviewsStore();
    saveState();
    renderProfilePage();
    closeModal('accountModal');
    showToast('Account imported');
  } catch (err) {
    console.error('Failed to import account', err);
    showToast('Invalid account file');
  } finally {
    e.target.value = '';
  }
});

function renderAuthState() {
  const authLabel = currentUser ? "Logout" : "Login";
  const accountLabel = currentUser ? (account.name ? `Hi, ${account.name.split(" ")[0]}` : "Account") : "Guest";
  document.getElementById("topbarAuthButton").textContent = authLabel;
  document.getElementById("mobileAuthButton").textContent = authLabel;
  document.getElementById("topbarAccountLabel").textContent = accountLabel;
}

function finalizeSellerRedirect() {
  const shouldOpenStoreSetup = window.pendingSellerRedirect === 'storeSettings';
  window.pendingSellerRedirect = null;

  ['storeAuthModal', 'loginModal'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) closeModal(id);
  });

  if (shouldOpenStoreSetup) {
    renderStoreSettings();
    openModal('storeSettingsModal');
    return true;
  }

  return false;
}

function openLoginModal() {
  document.getElementById("loginModalContent").innerHTML = `
    <div class="space-y-5">
      <div class="rounded-3xl border border-orange-100 bg-orange-50/60 p-4">
        <div class="flex items-center gap-3">
          <div class="grid h-11 w-11 place-items-center rounded-2xl bg-white text-orange-500 shadow-sm">
            <i data-lucide="user-round" class="h-5 w-5"></i>
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-orange-600">Welcome back</p>
            <p class="mt-1 text-sm text-slate-600">Sign in to continue shopping and managing your account.</p>
          </div>
        </div>
      </div>

      <form onsubmit="login(event)" class="space-y-4">
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700">Email address</label>
          <div class="relative">
            <span class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
              <i data-lucide="mail" class="h-4 w-4"></i>
            </span>
            <input id="loginEmail" type="email" required class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100" value="${currentUser?.email || ""}" placeholder="you@example.com" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700">Password</label>
          <div class="relative">
            <span class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
              <i data-lucide="lock" class="h-4 w-4"></i>
            </span>
            <input id="loginPassword" type="password" required class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100" placeholder="Enter your password" />
          </div>
        </div>

        <button type="submit" class="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:brightness-105">Continue</button>
      </form>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
        New here? <a href="#" onclick="navigate('signup'); closeModal('loginModal'); return false;" class="font-black text-orange-600">Create an account</a>
      </div>
    </div>
  `;
  openModal("loginModal");
  refreshIcons();
}

async function login(event) {
  event.preventDefault();
  // Support both modal and page forms
  const email = (document.getElementById("loginEmail") || document.getElementById('pageLoginEmail')).value.trim();
  const password = (document.getElementById("loginPassword") || document.getElementById('pageLoginPassword')).value.trim();

  if (!email || !password) {
    showToast("Enter your email and password to continue.");
    return;
  }

  const username = email.split("@")[0];
  const name = username.split(/[._-]/).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") || "Zomax shopper";

  const payload = {
    username,
    email,
    name,
    role: "buyer",
    memberSince: new Date().getFullYear().toString()
  };

  currentUser = await backend.login(payload);

  account.username = account.username || username;
  account.name = account.name || name;
  account.email = account.email || email;
  account.memberSince = account.memberSince || currentUser.memberSince;
  saveState();
  renderProfilePage();
  renderAuthState();
  closeModal("loginModal");
  showToast(`Welcome back, ${name}`);

  const shouldOpenStoreSetup = window.pendingSellerRedirect === 'storeSettings';
  window.pendingSellerRedirect = null;

  if (shouldOpenStoreSetup) {
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.textContent = originalText;
      loginBtn.classList.remove('opacity-50');
    }
    closeModal("loginModal");
    renderStoreSettings();
    openModal('storeSettingsModal');
    showToast('Welcome! Let’s set up your store.');
    return;
  }

  // Show loading for 10 seconds then auto-navigate to account page
  const loginBtn = event.target.querySelector('button[type="submit"]');
  if (loginBtn) {
    loginBtn.disabled = true;
    const originalText = loginBtn.textContent;
    loginBtn.textContent = 'Loading...';
    loginBtn.classList.add('opacity-50');
  }

  setTimeout(() => {
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.textContent = originalText;
      loginBtn.classList.remove('opacity-50');
    }
    navigate('profile');
  }, 10000);
}

async function signup(event) {
  event.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();
  if (!name || !email || !password) { showToast('Complete the signup form'); return; }
  const username = email.split('@')[0];
  const payload = { username, email, name, role: 'buyer', memberSince: new Date().getFullYear().toString() };
  currentUser = await backend.login(payload);
  account.username = account.username || username;
  account.name = account.name || name;
  account.email = account.email || email;
  account.memberSince = account.memberSince || currentUser.memberSince;
  saveState();
  renderProfilePage();
  renderAuthState();

  if (window.pendingSellerRedirect === 'storeSettings') {
    window.pendingSellerRedirect = null;
    navigate('profile');
    renderStoreSettings();
    openModal('storeSettingsModal');
    showToast('Welcome! Let’s set up your store.');
    return;
  }

  navigate('profile');
  showToast(`Welcome, ${name}`);
}

async function logout() {
  await backend.logout();
  currentUser = null;
  account = { ...defaultAccount };
  saveState();
  renderProfilePage();
  renderAuthState();
  showToast("Logged out successfully");
}

async function deactivateAccount() {
  const ok = await showConfirm('Are you sure you want to deactivate your account? This will remove local profile data.');
  if (!ok) return;

  try { await backend.postJson('/api/account/deactivate', { username: account.username }, null); } catch (e) {}

  // Clear local session and personal data
  currentUser = null;
  account = { ...defaultAccount };
  reviewsStore = {};
  cart = [];
  wishlist = [];
  orders = [];

  localStorage.removeItem('zomax_currentUser');
  localStorage.removeItem('zomax_account');
  localStorage.removeItem('zomax_reviews');
  localStorage.removeItem('zomax_cart');
  localStorage.removeItem('zomax_wishlist');
  localStorage.removeItem('zomax_orders');

  saveReviewsStore();
  saveState();

  try { await backend.syncReviews(reviewsStore); } catch (e) {}
  try { await backend.syncAccount(account); } catch (e) {}

  renderProfilePage();
  renderAuthState();
  closeModal('accountModal');
  // Ensure any Deactivate buttons are hidden immediately
  const headerBtn = document.getElementById('profileDeactivateBtn');
  if (headerBtn) headerBtn.classList.add('hidden');
  const modalBtn = document.querySelector('#accountModal button[onclick="deactivateAccount()"]');
  if (modalBtn) modalBtn.classList.add('hidden');

  showToast('Account deactivated — local data cleared');
}

function showToast(message) {
  const toast = document.getElementById("toast");
  document.getElementById("toastMessage").textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function submitReview(event, productId) {
  event.preventDefault();
  const authorEl = document.getElementById('reviewAuthor');
  const ratingEl = document.getElementById('reviewRating');
  const textEl = document.getElementById('reviewText');
  const author = authorEl ? authorEl.value.trim() : 'Anonymous';
  const rating = ratingEl ? ratingEl.value : 5;
  const text = textEl ? textEl.value.trim() : '';
  addReview(productId, { author, rating, text });
  renderProductModal(productId, 'reviews');
  refreshIcons();
  showToast('Thanks — your review has been added');
}

function setReviewStars(rating) {
  const input = document.getElementById('reviewRating');
  if (input) input.value = rating;
  document.querySelectorAll('.review-star').forEach(btn => {
    const val = Number(btn.getAttribute('data-value')) || 0;
    if (val <= rating) {
      btn.classList.add('text-amber-400');
      btn.classList.add('fill-amber-400');
    } else {
      btn.classList.remove('text-amber-400');
      btn.classList.remove('fill-amber-400');
    }
  });
}

async function deleteReview(productId, index) {
  const ok = await showConfirm('Delete this review?');
  if (!ok) return;
  const id = String(productId);
  if (!reviewsStore[id] || !reviewsStore[id][index]) return;
  reviewsStore[id].splice(index, 1);
  saveReviewsStore();
  // update product aggregates
  const product = products.find(p => p.id === productId);
  if (product) {
    const all = getReviewsForProduct(productId);
    const avg = all.length ? all.reduce((s,r) => s + r.rating, 0) / all.length : product.rating;
    product.rating = Number((avg || product.rating).toFixed(1));
    product.reviews = all.length;
  }
  saveState();
  // try to delete on backend, fallback to syncing full store
  backend.deleteReview(productId, index).catch(() => backend.syncReviews(reviewsStore).catch(() => {}));
  renderProductModal(productId, 'reviews');
  showToast('Review deleted');
}

function editReview(productId, index) {
  openEditReviewModal(productId, index);
}

function openEditReviewModal(productId, index) {
  const id = String(productId);
  const existing = reviewsStore[id] && reviewsStore[id][index];
  if (!existing) return;
  editingReviewProductId = productId;
  editingReviewIndex = index;
  const textEl = document.getElementById('editReviewText');
  const ratingEl = document.getElementById('editReviewRating');
  if (textEl) textEl.value = existing.text || '';
  if (ratingEl) ratingEl.value = existing.rating || 5;
  openModal('editReviewModal');
}

function saveEditedReview() {
  const productId = editingReviewProductId;
  const index = editingReviewIndex;
  if (productId == null || index == null) return closeModal('editReviewModal');
  const id = String(productId);
  const existing = reviewsStore[id] && reviewsStore[id][index];
  if (!existing) return closeModal('editReviewModal');
  const newText = document.getElementById('editReviewText').value.trim();
  const newRating = Number(document.getElementById('editReviewRating').value) || existing.rating;
  existing.text = String(newText);
  existing.rating = Math.max(1, Math.min(5, newRating));
  existing.createdAt = Date.now();
  saveReviewsStore();
  // update product aggregates
  const product = products.find(p => p.id === productId);
  if (product) {
    const all = getReviewsForProduct(productId);
    const avg = all.length ? all.reduce((s,r) => s + r.rating, 0) / all.length : product.rating;
    product.rating = Number((avg || product.rating).toFixed(1));
    product.reviews = all.length;
  }
  saveState();
  backend.saveReview(productId, existing).catch(() => backend.syncReviews(reviewsStore).catch(() => {}));
  closeModal('editReviewModal');
  renderProductModal(productId, 'reviews');
  showToast('Review updated');
}

document.getElementById("productModal").addEventListener("click", event => {
  if (event.target.id === "productModal") closeModal("productModal");
});

document.getElementById("checkoutModal").addEventListener("click", event => {
  if (event.target.id === "checkoutModal") closeModal("checkoutModal");
});

document.getElementById("loginModal").addEventListener("click", event => {
  if (event.target.id === "loginModal") closeModal("loginModal");
});

document.getElementById("accountModal").addEventListener("click", event => {
  if (event.target.id === "accountModal") closeModal("accountModal");
});

initializeApp();
