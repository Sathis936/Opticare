/* ============================================================
   OptiStore – Centralized Product Catalog + Cart + Wishlist
   Persists via localStorage (keys: opticare_cart, opticare_wishlist)
   ============================================================ */
window.OptiStore = (function () {
  "use strict";

  /* ---------- Product Catalog ---------- */
  var CATALOG = {
    "f-01": { id: "f-01", name: "Metro Round", category: "Reading", brand: "Metro", price: 89, image: "assets/images/frames/frame-01.jpg", rating: 4.7 },
    "f-02": { id: "f-02", name: "Aviator Classic", category: "Sunglasses", brand: "Ray-Ban", price: 259, image: "assets/images/frames/frame-02.jpg", rating: 4.8 },
    "f-03": { id: "f-03", name: "Velocity Sport", category: "Sports", brand: "Oakley", price: 199, image: "assets/images/frames/frame-03.jpg", rating: 4.9 },
    "f-04": { id: "f-04", name: "Kids Round", category: "Kids", brand: "Fastrack", price: 59, image: "assets/images/frames/frame-04.jpg", rating: 4.5 },
    "f-05": { id: "f-05", name: "Wayfarer Lux", category: "Sunglasses", brand: "Ray-Ban", price: 289, image: "assets/images/frames/frame-05.jpg", rating: 4.7 },
    "f-06": { id: "f-06", name: "Retro Square", category: "Reading", brand: "Vogue", price: 119, image: "assets/images/frames/frame-06.jpg", rating: 4.6 },
    "f-07": { id: "f-07", name: "Rimless Light", category: "Reading", brand: "Metro", price: 149, image: "assets/images/frames/frame-07.jpg", rating: 4.5 },
    "f-08": { id: "f-08", name: "Shield Sport", category: "Sports", brand: "Oakley", price: 229, image: "assets/images/frames/frame-08.jpg", rating: 4.8 },
    "f-09": { id: "f-09", name: "Cat-Eye Chic", category: "Sunglasses", brand: "Vogue", price: 179, image: "assets/images/frames/frame-09.jpg", rating: 4.6 },
    "f-10": { id: "f-10", name: "Kid's Flex", category: "Kids", brand: "Fastrack", price: 49, image: "assets/images/frames/frame-10.jpg", rating: 4.4 },
    "f-11": { id: "f-11", name: "Polar Night", category: "Sunglasses", brand: "Ray-Ban", price: 319, image: "assets/images/frames/frame-11.jpg", rating: 4.9 },
    "f-12": { id: "f-12", name: "Minimal Tan", category: "Reading", brand: "Metro", price: 99, image: "assets/images/frames/frame-12.jpg", rating: 4.5 },
    "frame-01": { id: "frame-01", name: "Aviator Classic", category: "Sunglasses", brand: "Ray-Ban", price: 2499, image: "assets/images/frames/frame-01.jpg", rating: 4.8 },
    "frame-02": { id: "frame-02", name: "Metro Round", category: "Reading", brand: "Metro", price: 1799, image: "assets/images/frames/frame-02.jpg", rating: 4.6 },
    "frame-03": { id: "frame-03", name: "Velocity Sport", category: "Sports", brand: "Oakley", price: 3499, image: "assets/images/frames/frame-03.jpg", rating: 4.9 },
    "frame-04": { id: "frame-04", name: "Marina Cat Eye", category: "Reading", brand: "Vogue", price: 2199, image: "assets/images/frames/frame-04.jpg", rating: 5.0 }
  };

  var CART_KEY = "opticare_cart";
  var WISH_KEY = "opticare_wishlist";

  /* ---------- Helpers ---------- */
  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* noop */ }
  }

  /* ---------- Product Lookup ---------- */
  function getProduct(id) {
    return CATALOG[id] || null;
  }

  /* ---------- Build product from DOM card ---------- */
  function productFromCard(cardEl) {
    if (!cardEl) return null;
    var priceEl = cardEl.querySelector("[data-price]");
    var imgEl = cardEl.querySelector(".product-media img, .gallery-main img");
    return {
      id: null,
      name: cardEl.getAttribute("data-name") || "Product",
      category: cardEl.getAttribute("data-category") || "",
      brand: cardEl.getAttribute("data-brand") || "",
      price: priceEl ? parseFloat(priceEl.getAttribute("data-price")) || 0 : 0,
      image: imgEl ? imgEl.getAttribute("src") : "",
      rating: parseFloat(cardEl.getAttribute("data-rating")) || 0,
      quantity: 1
    };
  }

  /* ---------- Cart ---------- */
  function getCart() { return read(CART_KEY, []); }
  function saveCart(c) { write(CART_KEY, c); }

  function addToCart(id, qty) {
    qty = qty || 1;
    var cart = getCart();
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id) { existing = cart[i]; break; }
    }
    if (existing) {
      existing.quantity += qty;
    } else {
      var product = getProduct(id);
      if (!product) return false;
      cart.push({ id: product.id, name: product.name, category: product.category, price: product.price, image: product.image, quantity: qty });
    }
    saveCart(cart);
    return true;
  }

  function removeFromCart(id) {
    var cart = getCart().filter(function (item) { return item.id !== id; });
    saveCart(cart);
  }

  function updateCartQty(id, qty) {
    if (qty <= 0) { removeFromCart(id); return; }
    var cart = getCart();
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id) { cart[i].quantity = qty; break; }
    }
    saveCart(cart);
  }

  function getCartTotal() {
    return getCart().reduce(function (sum, item) { return sum + item.price * item.quantity; }, 0);
  }

  function getCartCount() {
    return getCart().reduce(function (sum, item) { return sum + item.quantity; }, 0);
  }

  function clearCart() { write(CART_KEY, []); }

  /* ---------- Wishlist ---------- */
  function getWishlist() { return read(WISH_KEY, []); }
  function saveWishlist(w) { write(WISH_KEY, w); }

  function toggleWishlist(id) {
    var list = getWishlist();
    var idx = list.indexOf(id);
    if (idx !== -1) {
      list.splice(idx, 1);
      saveWishlist(list);
      return false;
    }
    list.push(id);
    saveWishlist(list);
    return true;
  }

  function isInWishlist(id) {
    return getWishlist().indexOf(id) !== -1;
  }

  function getWishlistCount() { return getWishlist().length; }

  function getWishlistProducts() {
    return getWishlist().map(function (id) {
      return getProduct(id);
    }).filter(function (p) { return p !== null; });
  }

  /* ---------- Badge Updaters ---------- */
  function updateCartBadge() {
    var count = getCartCount();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? "" : "none";
    });
  }

  function updateWishlistBadge() {
    var count = getWishlistCount();
    document.querySelectorAll("[data-wish-count]").forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? "" : "none";
    });
  }

  function syncBadges() {
    updateCartBadge();
    updateWishlistBadge();
  }

  /* ---------- Public API ---------- */
  return {
    getProduct: getProduct,
    productFromCard: productFromCard,
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    updateCartQty: updateCartQty,
    getCart: getCart,
    getCartCount: getCartCount,
    getCartTotal: getCartTotal,
    clearCart: clearCart,
    toggleWishlist: toggleWishlist,
    isInWishlist: isInWishlist,
    getWishlist: getWishlist,
    getWishlistCount: getWishlistCount,
    getWishlistProducts: getWishlistProducts,
    updateCartBadge: updateCartBadge,
    updateWishlistBadge: updateWishlistBadge,
    syncBadges: syncBadges
  };
})();
