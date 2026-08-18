/* ============================================================
   OptiCare - main.js
   Global interactions: header, mobile nav, search, sliders,
   wishlist, cart, validation, tables, toasts, reveal, etc.
   ============================================================ */
(function () {
  "use strict";

  var d = document;

  function ready(fn) {
    if (d.readyState === "loading") {
      d.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  /* ---------- Sticky header ---------- */
  function initStickyHeader() {
    var header = d.querySelector(".header");
    if (!header) return;

    var onScroll = function () {
      if (window.scrollY > 10) {
        header.classList.add("sticky");
      } else {
        header.classList.remove("sticky");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Back to top ---------- */
  function initBackToTop() {
    var btn = d.querySelector(".back-to-top");
    if (!btn) return;
    var onScroll = function () {
      btn.classList.toggle("show", window.scrollY > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    onScroll();
  }

  /* ---------- Active nav link ---------- */
  function initActiveNav() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    d.querySelectorAll(".main-nav .nav-link, .offcanvas-nav .nav-link").forEach(function (link) {
      var href = link.getAttribute("href");
      if (href && href.split("#")[0] === path) {
        link.classList.add("active");
      }
    });
  }

  /* ---------- Search popover ---------- */
  function initSearchPop() {
    var openBtns = d.querySelectorAll("[data-search-open]");
    var closeBtns = d.querySelectorAll("[data-search-close]");
    var pop = d.getElementById("searchPop");
    if (!pop) return;
    openBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        pop.classList.add("show");
        var input = pop.querySelector("input");
        if (input) input.focus();
      });
    });
    closeBtns.forEach(function (btn) {
      btn.addEventListener("click", function () { pop.classList.remove("show"); });
    });
    d.addEventListener("click", function (e) {
      if (!pop.contains(e.target) && !e.target.closest("[data-search-open]")) {
        pop.classList.remove("show");
      }
    });
    d.addEventListener("keydown", function (e) {
      if (e.key === "Escape") pop.classList.remove("show");
    });
  }

  /* ---------- Password visibility toggle ---------- */
  function initPasswordToggles() {
    d.querySelectorAll(".password-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var input = d.getElementById(btn.getAttribute("data-password-target"));
        if (!input) {
          input = btn.closest(".input-icon-wrap, .form-group, .mb-3, .position-relative")
            ? btn.parentElement.querySelector("input")
            : null;
        }
        if (!input) return;
        var show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.querySelector("i").className = show ? "bi bi-eye-slash" : "bi bi-eye";
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var items = d.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Animated counters ---------- */
  function initCounters() {
    var counters = d.querySelectorAll("[data-counter]");
    if (!counters.length) return;
    function run(el) {
      var target = parseFloat(el.getAttribute("data-counter")) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      var prefix = el.getAttribute("data-prefix") || "";
      var dur = 1600;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = Math.round(target * eased);
        el.textContent = prefix + val.toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!("IntersectionObserver" in window)) {
      counters.forEach(run);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Countdown timer ---------- */
  function initCountdown() {
    var el = d.getElementById("countdownTimer");
    if (!el) return;
    var target = new Date();
    target.setDate(target.getDate() + 12);
    target.setHours(9, 0, 0, 0);
    function tick() {
      var diff = target.getTime() - Date.now();
      if (diff < 0) { target.setDate(target.getDate() + 1); diff = target.getTime() - Date.now(); }
      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var mins = Math.floor((diff % 3600000) / 60000);
      var secs = Math.floor((diff % 60000) / 1000);
      var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
      el.querySelector("[data-cd-days]").textContent = pad(days);
      el.querySelector("[data-cd-hours]").textContent = pad(hours);
      el.querySelector("[data-cd-mins]").textContent = pad(mins);
      el.querySelector("[data-cd-secs]").textContent = pad(secs);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Swiper sliders ---------- */
  function initSliders() {
    if (typeof window.Swiper === "undefined") return;

    d.querySelectorAll(".swiper-init").forEach(function (el) {
      var config = window.OptiCareSliderConfig || {};
      new Swiper(el, config[el.id] || {});
    });

    // testimonial
    if (d.querySelector("#testimonialSlider")) {
      new Swiper("#testimonialSlider", {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        autoplay: { delay: 5000, disableOnInteraction: false },
        pagination: { el: "#testimonialSlider .swiper-pagination", clickable: true },
        breakpoints: {
          768: { slidesPerView: 2 },
          1200: { slidesPerView: 3 }
        }
      });
    }

    // logo / brand marquee
    if (d.querySelector("#brandSlider")) {
      new Swiper("#brandSlider", {
        slidesPerView: 2,
        spaceBetween: 24,
        loop: true,
        autoplay: { delay: 2600, disableOnInteraction: false },
        breakpoints: {
          576: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          992: { slidesPerView: 5 },
          1200: { slidesPerView: 6 }
        }
      });
    }

    // featured frames
    if (d.querySelector("#featuredFramesSlider")) {
      new Swiper("#featuredFramesSlider", {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        navigation: {
          nextEl: "#featuredFramesSlider .swiper-button-next",
          prevEl: "#featuredFramesSlider .swiper-button-prev"
        },
        breakpoints: {
          576: { slidesPerView: 2 },
          992: { slidesPerView: 3 },
          1200: { slidesPerView: 4 }
        }
      });
    }

    // team slider
    if (d.querySelector("#teamSlider")) {
      new Swiper("#teamSlider", {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        navigation: {
          nextEl: "#teamSlider .swiper-button-next",
          prevEl: "#teamSlider .swiper-button-prev"
        },
        breakpoints: {
          576: { slidesPerView: 2 },
          992: { slidesPerView: 3 },
          1200: { slidesPerView: 4 }
        }
      });
    }

    // blog slider
    if (d.querySelector("#blogSlider")) {
      new Swiper("#blogSlider", {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        navigation: {
          nextEl: "#blogSlider .swiper-button-next",
          prevEl: "#blogSlider .swiper-button-prev"
        },
        breakpoints: {
          576: { slidesPerView: 2 },
          992: { slidesPerView: 3 }
        }
      });
    }

    // product gallery
    if (d.querySelector("#productGallery")) {
      new Swiper("#productGallery", {
        slidesPerView: 1,
        spaceBetween: 8,
        loop: true
      });
    }
  }

  /* ---------- Gallery thumbs ---------- */
  function initGalleryThumbs() {
    d.querySelectorAll("[data-gallery-thumb]").forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var group = thumb.getAttribute("data-gallery-thumb");
        var target = d.querySelector('img[data-gallery-main="' + group + '"]');
        var src = thumb.getAttribute("data-gallery-src");
        if (target && src) {
          target.src = src;
          d.querySelectorAll('[data-gallery-thumb="' + group + '"]').forEach(function (t) {
            t.classList.toggle("active", t === thumb);
          });
        }
      });
    });
  }

  /* ---------- Custom FAQ accordion ---------- */
  function initFaqAccordion() {
    d.querySelectorAll(".faq-item").forEach(function (item) {
      var q = item.querySelector(".faq-q");
      if (!q) return;
      q.setAttribute("aria-expanded", "false");
      q.addEventListener("click", function () {
        var answer = item.querySelector(".faq-a");
        var isActive = item.classList.contains("active");
        var scope = item.closest("[data-faq-group]") || d;
        scope.querySelectorAll(".faq-item.active").forEach(function (it) {
          it.classList.remove("active");
          var a = it.querySelector(".faq-a");
          if (a) a.classList.remove("show");
          it.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        });
        if (!isActive) {
          item.classList.add("active");
          if (answer) answer.classList.add("show");
          q.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /* ---------- Wishlist (uses OptiStore) ---------- */
  function initWishlist() {
    if (!window.OptiStore) return;
    OptiStore.syncBadges();
    d.querySelectorAll("[data-wishlist]").forEach(function (btn) {
      var id = btn.getAttribute("data-wishlist");
      if (OptiStore.isInWishlist(id)) btn.classList.add("active");
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var added = OptiStore.toggleWishlist(id);
        btn.classList.toggle("active", added);
        OptiStore.updateWishlistBadge();
        showToast(added ? "Added to wishlist" : "Removed from wishlist", added ? "success" : "neutral");
      });
    });
  }

  /* ---------- Cart (uses OptiStore) ---------- */
  function initCartCount() {
    if (!window.OptiStore) return;
    OptiStore.syncBadges();
    d.querySelectorAll("[data-add-cart]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var id = btn.getAttribute("data-add-cart");
        if (!id) {
          var card = btn.closest(".product-card");
          if (card) {
            var stored = card.querySelector("[data-price]");
            if (stored) id = stored.getAttribute("data-price-id") || card.getAttribute("data-product-id");
          }
        }
        if (!id) return;
        var ok = OptiStore.addToCart(id);
        if (ok) {
          OptiStore.updateCartBadge();
          var original = btn.innerHTML;
          btn.innerHTML = '<i class="bi bi-check2"></i> Added';
          btn.disabled = true;
          btn.classList.add("btn-added");
          setTimeout(function () {
            btn.innerHTML = original;
            btn.disabled = false;
            btn.classList.remove("btn-added");
          }, 1500);
          showToast("Added to cart", "success");
        } else {
          showToast("Product not found", "danger");
        }
      });
    });
  }

  /* ---------- Toast helper ---------- */
  function showToast(message, type) {
    var container = d.querySelector(".toast-container");
    if (!container) {
      container = d.createElement("div");
      container.className = "toast-container position-fixed bottom-0 end-0 p-3";
      d.body.appendChild(container);
    }
    var toast = d.createElement("div");
    toast.className = "toast align-items-center border-0";
    var bg = type === "success" ? "text-bg-success" : type === "danger" ? "text-bg-danger" : "bg-primary text-white";
    toast.innerHTML =
      '<div class="d-flex">' +
      '<div class="toast-body">' +
      (type === "success" ? '<i class="bi bi-check-circle-fill me-2"></i>' : type === "danger" ? '<i class="bi bi-exclamation-circle-fill me-2"></i>' : '<i class="bi bi-heart-fill me-2"></i>') +
      '<span>' + message + "</span></div>" +
      '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>' +
      "</div>";
    toast.classList.add(bg);
    container.appendChild(toast);
    var instance = new bootstrap.Toast(toast, { delay: 2600 });
    instance.show();
    toast.addEventListener("hidden.bs.toast", function () { toast.remove(); });
  }
  window.OptiCareToast = showToast;

  /* ---------- Generic form validation ---------- */
  function initValidation() {
    d.querySelectorAll("form[data-validate]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var valid = validateForm(form);
        if (valid) {
          showToast("Form submitted successfully", "success");
          var success = form.querySelector("[data-form-success]");
          if (success) success.classList.remove("d-none");
          form.reset();
          form.querySelectorAll(".field-error").forEach(function (er) { er.classList.remove("show"); });
          form.querySelectorAll(".form-control.is-invalid, .form-select.is-invalid").forEach(function (el) {
            el.classList.remove("is-invalid");
          });
        }
      });
    });

    d.querySelectorAll("form[data-validate] [data-error]").forEach(function (input) {
      input.addEventListener("input", function () {
        validateField(input);
      });
    });
  }

  function validateForm(form) {
    var valid = true;
    var firstInvalid = null;
    form.querySelectorAll("[data-error]").forEach(function (input) {
      var ok = validateField(input);
      if (!ok) {
        valid = false;
        if (!firstInvalid) firstInvalid = input;
      }
    });
    if (firstInvalid) {
      showToast("Please fix the highlighted fields", "danger");
      firstInvalid.focus();
    }
    return valid;
  }

  function validateField(input) {
    var err = input.closest(".mb-3, .form-group, .mb-4") ? input.parentElement.querySelector(".field-error") : null;
    if (!err) {
      var label = input.getAttribute("data-error");
      if (label) {
        var container = input.closest("form");
        var errEl = d.getElementById("error-" + input.id) || null;
        if (!errEl && container) {
          errEl = d.createElement("div");
          errEl.className = "field-error";
          errEl.id = "error-" + input.id;
          input.insertAdjacentElement("afterend", errEl);
        }
        err = errEl;
      }
    }
    var value = input.value.trim();
    var rules = (input.getAttribute("data-error") || "").split(",");
    var ok = true;
    var message = "";

    if (rules.indexOf("required") !== -1 && !value) {
      ok = false;
      message = input.getAttribute("data-required-msg") || "This field is required.";
    } else if (value) {
      if (rules.indexOf("email") !== -1 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        ok = false;
        message = "Please enter a valid email address.";
      }
      if (rules.indexOf("phone") !== -1 && !/^[+\d][\d\s\-()]{6,}$/.test(value)) {
        ok = false;
        message = "Please enter a valid phone number.";
      }
      if (rules.indexOf("password") !== -1 && value.length < 6) {
        ok = false;
        message = "Password must be at least 6 characters.";
      }
      var min = input.getAttribute("data-min");
      if (min && value.length < parseInt(min, 10)) {
        ok = false;
        message = "Must be at least " + min + " characters.";
      }
    }

    input.classList.toggle("is-invalid", !ok);
    if (err) {
      err.textContent = message;
      err.classList.toggle("show", !ok);
    }
    return ok;
  }

  /* ---------- Newsletter ---------- */
  function initNewsletter() {
    d.querySelectorAll("[data-newsletter]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector("input[type=email]");
        var ok = input && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
        if (!ok) {
          showToast("Please enter a valid email", "danger");
          return;
        }
        var success = form.querySelector("[data-newsletter-success]");
        if (success) success.style.display = "block";
        showToast("Subscribed successfully", "success");
        form.reset();
      });
    });
  }

  /* ---------- Color / size selectors ---------- */
  function initOptionSelectors() {
    d.querySelectorAll("[data-color-options] .color-swatch").forEach(function (sw) {
      sw.addEventListener("click", function () {
        var group = sw.closest("[data-color-options]");
        group.querySelectorAll(".color-swatch").forEach(function (s) { s.classList.remove("active"); });
        sw.classList.add("active");
      });
    });
    d.querySelectorAll("[data-size-options] .size-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var group = chip.closest("[data-size-options]");
        group.querySelectorAll(".size-chip").forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
      });
    });
  }

  /* ---------- Data tables: search / filter / sort / pagination ---------- */
  function initDataTables() {
    d.querySelectorAll("[data-table]").forEach(function (table) {
      var tbody = table.querySelector("tbody");
      var rows = Array.prototype.slice.call(tbody ? tbody.querySelectorAll("tr") : []);
      var searchInput = d.querySelector('input[data-table-search="' + table.getAttribute("data-table") + '"]');
      var select = d.querySelector('select[data-table-status="' + table.getAttribute("data-table") + '"]');
      var pageSizeSel = d.querySelector('select[data-table-size="' + table.getAttribute("data-table") + '"]');
      var paginationEl = d.querySelector('[data-table-pagination="' + table.getAttribute("data-table") + '"]');
      var infoEl = d.querySelector('[data-table-info="' + table.getAttribute("data-table") + '"]');
      var state = { q: "", status: "all", size: 5, page: 1 };

      function matches(row) {
        var text = row.textContent.toLowerCase();
        if (state.q && text.indexOf(state.q.toLowerCase()) === -1) return false;
        if (state.status !== "all") {
          var badge = row.querySelector(".status-badge");
          var rowStatus = badge ? (badge.getAttribute("data-status") || badge.textContent.trim().toLowerCase()) : "";
          if (rowStatus !== state.status) return false;
        }
        return true;
      }

      function render() {
        if (!tbody) return;
        var filtered = rows.filter(matches);
        var totalPages = Math.max(1, Math.ceil(filtered.length / state.size));
        if (state.page > totalPages) state.page = totalPages;
        var start = (state.page - 1) * state.size;
        var pageRows = filtered.slice(start, start + state.size);
        rows.forEach(function (row) { row.style.display = "none"; });
        pageRows.forEach(function (row) { row.style.display = ""; });
        if (infoEl) infoEl.textContent = "Showing " + (filtered.length ? start + 1 : 0) + "-" + (start + pageRows.length) + " of " + filtered.length;
        renderPagination(totalPages, filtered.length);
      }

      function renderPagination(totalPages, total) {
        if (!paginationEl) return;
        var prev = document.createElement("li");
        var prevA = document.createElement("button");
        prevA.innerHTML = '<i class="bi bi-chevron-left"></i>';
        prevA.setAttribute("aria-label", "Previous");
        prevA.disabled = state.page === 1;
        prevA.addEventListener("click", function () { if (state.page > 1) { state.page--; render(); } });
        prev.appendChild(prevA);
        paginationEl.innerHTML = "";
        paginationEl.appendChild(prev);

        var startP = Math.max(1, state.page - 2);
        var endP = Math.min(totalPages, startP + 4);
        startP = Math.max(1, endP - 4);
        for (var i = startP; i <= endP; i++) {
          (function (p) {
            var li = document.createElement("li");
            var a = document.createElement("button");
            a.textContent = p;
            if (p === state.page) li.classList.add("active");
            a.addEventListener("click", function () { state.page = p; render(); });
            li.appendChild(a);
            paginationEl.appendChild(li);
          })(i);
        }

        var next = document.createElement("li");
        var nextA = document.createElement("button");
        nextA.innerHTML = '<i class="bi bi-chevron-right"></i>';
        nextA.setAttribute("aria-label", "Next");
        nextA.disabled = state.page === totalPages;
        nextA.addEventListener("click", function () { if (state.page < totalPages) { state.page++; render(); } });
        next.appendChild(nextA);
        paginationEl.appendChild(next);
      }

      if (searchInput) {
        searchInput.addEventListener("input", function () { state.q = searchInput.value; state.page = 1; render(); });
      }
      if (select) {
        select.addEventListener("change", function () { state.status = select.value; state.page = 1; render(); });
      }
      if (pageSizeSel) {
        pageSizeSel.addEventListener("change", function () { state.size = parseInt(pageSizeSel.value, 10) || 5; state.page = 1; render(); });
      }
      render();
    });
  }

  /* ---------- Delete confirmation (admin) ---------- */
  function initDeleteButtons() {
    d.querySelectorAll("[data-delete]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var modal = d.getElementById("deleteModal");
        if (modal && window.bootstrap) {
          var bsModal = bootstrap.Modal.getOrCreateInstance(modal);
          bsModal.show();
        } else {
          if (confirm("Are you sure you want to delete this item?")) {
            showToast("Item deleted", "danger");
          }
        }
      });
    });
  }

  /* ---------- Upload area preview ---------- */
  function initUploadAreas() {
    d.querySelectorAll("[data-upload]").forEach(function (area) {
      area.addEventListener("click", function () {
        var input = d.getElementById(area.getAttribute("data-upload-input"));
        if (input) input.click();
      });
    });
    d.querySelectorAll('input[type="file"]').forEach(function (input) {
      input.addEventListener("change", function () {
        var preview = d.querySelector('[data-upload-preview="' + input.id + '"]');
        if (!preview) return;
        preview.innerHTML = "";
        Array.prototype.slice.call(input.files).slice(0, 6).forEach(function (file) {
          var reader = new FileReader();
          reader.onload = function (e) {
            var item = d.createElement("div");
            item.className = "prev-item";
            item.innerHTML = '<img src="' + e.target.result + '" alt="Preview">' +
              '<button type="button" class="prev-remove" aria-label="Remove">&times;</button>';
            item.querySelector(".prev-remove").addEventListener("click", function () { item.remove(); });
            preview.appendChild(item);
          };
          reader.readAsDataURL(file);
        });
      });
    });
  }

  /* ---------- Admin sidebar toggle ---------- */
  function initAdminSidebar() {
    var toggles = d.querySelectorAll("[data-sidebar-toggle]");
    toggles.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var isMobile = window.innerWidth <= 991.98;
        if (isMobile) {
          d.body.classList.toggle("sidebar-open");
        } else {
          d.body.classList.toggle("sidebar-collapsed");
        }
      });
    });
    var backdrop = d.getElementById("sidebarBackdrop");
    if (backdrop) {
      backdrop.addEventListener("click", function () {
        d.body.classList.remove("sidebar-open");
      });
    }
  }

  /* ---------- Theme toggle in admin (syncs with theme.js) ---------- */
  function initAdminThemeSync() {
    d.querySelectorAll("[data-theme-toggle]").forEach(function () { /* handled by theme.js */ });
  }

  /* ---------- Timeline / progress counters in admin ---------- */
  function initStatCounters() {
    // data-counter handled above; admin stats reuse it
  }

  /* ---------- Blog filtering ---------- */
  function initBlogFilters() {
    var filterBtns = d.querySelectorAll("[data-blog-filter]");
    var cards = d.querySelectorAll("[data-blog-category]");
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var cat = btn.getAttribute("data-blog-filter");
        cards.forEach(function (card) {
          var show = cat === "all" || card.getAttribute("data-blog-category") === cat;
          card.closest(".blog-filter-item").style.display = show ? "" : "none";
        });
      });
    });
  }

  /* ---------- Context Menu Dropdown (Right-click & Hover) ---------- */
  function initContextDropdown() {
    var triggers = d.querySelectorAll(".dropdown-trigger");

    triggers.forEach(function (trigger) {
      var dropdownId = trigger.getAttribute("data-dropdown-id");
      var dropdown = d.getElementById(dropdownId);
      if (!dropdown) return;

      // Hide all dropdowns when clicking outside
      d.addEventListener("click", function (e) {
        if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.classList.remove("show");
        }
      });

      // Hide on Escape key
      d.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          dropdown.classList.remove("show");
        }
      });

      // Right-click context menu
      trigger.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        var rect = trigger.getBoundingClientRect();
        dropdown.style.top = rect.bottom + "px";
        dropdown.style.left = rect.left + rect.width / 2 + "px";
        dropdown.classList.add("show");
      });

      // Hover to show dropdown
      trigger.addEventListener("mouseenter", function () {
        dropdown.classList.add("show");
      });

      trigger.addEventListener("mouseleave", function () {
        // Delay hide to allow hovering over dropdown
        setTimeout(function () {
          if (!trigger.matches(":hover") && !dropdown.matches(":hover")) {
            dropdown.classList.remove("show");
          }
        }, 100);
      });

      // Keep dropdown visible when hovering over it
      dropdown.addEventListener("mouseenter", function () {
        dropdown.classList.add("show");
      });

      dropdown.addEventListener("mouseleave", function () {
        setTimeout(function () {
          if (!trigger.matches(":hover")) {
            dropdown.classList.remove("show");
          }
        }, 100);
      });

      // Close dropdown when clicking on items
      dropdown.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          dropdown.classList.remove("show");
        });
      });
    });
  }

  /* ---------- Admin Home shortcut ---------- */
  function initAdminHomeShortcut() {
    d.querySelectorAll(".admin-topbar .topbar-left").forEach(function (topbarLeft) {
      if (topbarLeft.querySelector(".admin-home-menu")) return;

      var homeMenu = d.createElement("div");
      homeMenu.className = "admin-home-menu";
      homeMenu.innerHTML =
        '<a class="admin-home-link" href="../index.html">Home <i class="bi bi-chevron-down home-dropdown-icon" aria-hidden="true"></i></a>' +
        '<ul class="dropdown-menu">' +
          '<li><a class="dropdown-item" href="../index.html">Home 1</a></li>' +
          '<li><a class="dropdown-item" href="../home-2.html">Home 2</a></li>' +
        '</ul>';

      topbarLeft.insertBefore(homeMenu, topbarLeft.children[1] || null);
    });
  }

  /* ---------- Public header actions ---------- */
  function initPublicHeaderActions() {
    d.querySelectorAll(".header .nav-actions").forEach(function (actions) {
      if (actions.querySelector("[data-public-header-actions]")) return;

      var extras = d.createElement("span");
      extras.className = "d-none d-xl-inline-flex align-items-center gap-2";
      extras.setAttribute("data-public-header-actions", "");
      extras.innerHTML =
        '<button type="button" class="nav-icon-btn" data-public-theme aria-label="Toggle dark mode"><i class="bi bi-moon-stars"></i></button>' +
        '<button type="button" class="nav-icon-btn" data-public-dir aria-label="Toggle text direction"><i class="bi bi-globe2"></i></button>' +
        '<a class="nav-icon-btn" href="login.html" aria-label="Account"><i class="bi bi-person"></i></a>';

      var cta = actions.querySelector(".nav-cta");
      actions.insertBefore(extras, cta || null);

      var themeSource = d.querySelector(".topbar [data-theme-toggle]");
      var dirSource = d.querySelector(".topbar [data-dir-toggle]");
      var themeButton = extras.querySelector("[data-public-theme]");
      var dirButton = extras.querySelector("[data-public-dir]");

      if (themeSource) {
        themeButton.addEventListener("click", function () { themeSource.click(); });
      }
      if (dirSource) {
        dirButton.addEventListener("click", function () { dirSource.click(); });
      }
    });
  }

  /* ---------- Home navigation menu (right-click only) ---------- */
  function initHomeNavDropdown() {
    /* Only target the Home dropdown (which links to index.html), not Products or other dropdowns */
    var homeDropdown = d.querySelector('.main-nav .dropdown > .dropdown-toggle[href="index.html"]');
    var adminHome = d.querySelector('.admin-home-menu > .admin-home-link');
    var toggles = [];
    if (homeDropdown) toggles.push(homeDropdown);
    if (adminHome) toggles.push(adminHome);
    if (!toggles.length) return;

    function closeAll() {
      d.querySelectorAll(".main-nav .dropdown-menu.home-context-open, .admin-home-menu .dropdown-menu.home-context-open").forEach(function (menu) {
        menu.classList.remove("home-context-open");
      });
      toggles.forEach(function (toggle) {
        toggle.setAttribute("aria-expanded", "false");
      });
    }

    toggles.forEach(function (toggle) {
      var menu = toggle.parentElement.querySelector(":scope > .dropdown-menu");
      if (!menu) return;

      // Keep the label as a normal link to Home 1 instead of a click-to-toggle control.
      toggle.removeAttribute("data-bs-toggle");

      if (!toggle.querySelector(".home-dropdown-icon")) {
        var icon = d.createElement("i");
        icon.className = "bi bi-chevron-down home-dropdown-icon";
        icon.setAttribute("aria-hidden", "true");
        toggle.appendChild(icon);
      }

      toggle.addEventListener("contextmenu", function (event) {
        event.preventDefault();
        closeAll();
        menu.classList.add("home-context-open");
        toggle.setAttribute("aria-expanded", "true");
      });
    });

    d.addEventListener("click", function (event) {
      if (!event.target.closest(".main-nav .dropdown, .admin-home-menu")) closeAll();
    });

    d.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeAll();
    });
  }

  /* ---------- Init all ---------- */
  ready(function () {
    initStickyHeader();
    initBackToTop();
    initActiveNav();
    initSearchPop();
    initPasswordToggles();
    initReveal();
    initCounters();
    initCountdown();
    initSliders();
    initGalleryThumbs();
    initFaqAccordion();
    initWishlist();
    initCartCount();
    initValidation();
    initNewsletter();
    initOptionSelectors();
    initDataTables();
    initDeleteButtons();
    initUploadAreas();
    initAdminSidebar();
    initAdminThemeSync();
    initBlogFilters();
    initContextDropdown();
    // initPublicHeaderActions();
    initAdminHomeShortcut();
    initHomeNavDropdown();

    if (window.bootstrap) {
      // enable tooltips
      var tt = [].slice.call(d.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tt.forEach(function (el) { new bootstrap.Tooltip(el); });
    }
  });
})();
