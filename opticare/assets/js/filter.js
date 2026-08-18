/* ============================================================
   OptiCare - filter.js
   Product catalog: search, category/brand/gender filters,
   price range, sorting, pagination (frames.html)
   ============================================================ */
(function () {
  "use strict";

  var d = document;

  function ready(fn) {
    if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    var grid = d.getElementById("productGrid");
    if (!grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".product-card"));
    var state = {
      q: "",
      category: "all",
      brand: "all",
      gender: "all",
      priceMax: 1000,
      sort: "featured",
      page: 1,
      perPage: 9
    };

    var searchInput = d.getElementById("productSearch");
    var categoryRadios = d.querySelectorAll('input[name="filter-category"]');
    var brandRadios = d.querySelectorAll('input[name="filter-brand"]');
    var genderRadios = d.querySelectorAll('input[name="filter-gender"]');
    var priceInput = d.getElementById("priceRange");
    var priceOutput = d.getElementById("priceOutput");
    var sortSelect = d.getElementById("productSort");
    var resultCount = d.getElementById("productCount");
    var paginationEl = d.getElementById("productPagination");
    var resetBtn = d.getElementById("filterReset");

    // search
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        state.q = searchInput.value.trim().toLowerCase();
        state.page = 1;
        render();
      });
    }

    // radio group helper
    function bindRadio(radios, key) {
      radios.forEach(function (radio) {
        radio.addEventListener("change", function () {
          if (radio.checked) {
            state[key] = radio.value;
            state.page = 1;
            render();
          }
        });
      });
    }
    bindRadio(categoryRadios, "category");
    bindRadio(brandRadios, "brand");
    bindRadio(genderRadios, "gender");

    // price
    if (priceInput) {
      function updatePrice() {
        state.priceMax = parseInt(priceInput.value, 10) || 1000;
        if (priceOutput) priceOutput.textContent = "$" + state.priceMax;
        state.page = 1;
        render();
      }
      priceInput.addEventListener("input", updatePrice);
      priceInput.addEventListener("change", updatePrice);
    }

    // sort
    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        state.sort = sortSelect.value;
        state.page = 1;
        render();
      });
    }

    // reset
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        state.q = "";
        state.category = "all";
        state.brand = "all";
        state.gender = "all";
        state.priceMax = 1000;
        state.sort = "featured";
        state.page = 1;
        if (searchInput) searchInput.value = "";
        if (priceInput) { priceInput.value = 1000; if (priceOutput) priceOutput.textContent = "$1000"; }
        if (sortSelect) sortSelect.value = "featured";
        d.querySelectorAll('input[name="filter-category"], input[name="filter-brand"], input[name="filter-gender"]').forEach(function (r) {
          if (r.value === "all") r.checked = true;
          else r.checked = false;
        });
        render();
      });
    }

    function priceOf(card) {
      var el = card.querySelector("[data-price]");
      return el ? parseFloat(el.getAttribute("data-price")) || 0 : 0;
    }

    function filtered() {
      return cards.filter(function (card) {
        if (state.q) {
          var hay = (card.getAttribute("data-name") || "").toLowerCase() + " " + (card.getAttribute("data-category") || "").toLowerCase();
          if (hay.indexOf(state.q) === -1) return false;
        }
        if (state.category !== "all" && card.getAttribute("data-category") !== state.category) return false;
        if (state.brand !== "all" && card.getAttribute("data-brand") !== state.brand) return false;
        if (state.gender !== "all" && card.getAttribute("data-gender") !== state.gender) return false;
        if (priceOf(card) > state.priceMax) return false;
        return true;
      });
    }

    function sort(list) {
      var arr = list.slice();
      switch (state.sort) {
        case "price-asc":
          arr.sort(function (a, b) { return priceOf(a) - priceOf(b); });
          break;
        case "price-desc":
          arr.sort(function (a, b) { return priceOf(b) - priceOf(a); });
          break;
        case "name-asc":
          arr.sort(function (a, b) {
            return (a.getAttribute("data-name") || "").localeCompare(b.getAttribute("data-name") || "");
          });
          break;
        case "rating":
          arr.sort(function (a, b) {
            return parseFloat(b.getAttribute("data-rating") || 0) - parseFloat(a.getAttribute("data-rating") || 0);
          });
          break;
        default:
          break;
      }
      return arr;
    }

    function render() {
      var list = sort(filtered());
      var total = list.length;
      var totalPages = Math.max(1, Math.ceil(total / state.perPage));
      if (state.page > totalPages) state.page = totalPages;
      var start = (state.page - 1) * state.perPage;
      var pageItems = list.slice(start, start + state.perPage);

      cards.forEach(function (card) { card.style.display = "none"; });
      pageItems.forEach(function (card) {
        card.style.display = "";
        card.classList.add("reveal", "visible");
      });

      if (resultCount) {
        resultCount.textContent = total + " product" + (total === 1 ? "" : "s");
      }

      // empty state
      var empty = d.getElementById("emptyState");
      if (empty) empty.style.display = total ? "none" : "block";

      renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
      if (!paginationEl) return;
      paginationEl.innerHTML = "";
      var list = d.createElement("ul");
      list.className = "pagination-custom";

      var prev = d.createElement("li");
      if (state.page === 1) prev.className = "disabled";
      var prevA = d.createElement("a");
      prevA.href = "#";
      prevA.innerHTML = '<i class="bi bi-chevron-left"></i>';
      prevA.setAttribute("aria-label", "Previous");
      prevA.addEventListener("click", function (e) { e.preventDefault(); if (state.page > 1) { state.page--; render(); } });
      prev.appendChild(prevA);
      list.appendChild(prev);

      var startP = Math.max(1, state.page - 2);
      var endP = Math.min(totalPages, startP + 4);
      startP = Math.max(1, endP - 4);
      for (var i = startP; i <= endP; i++) {
        (function (p) {
          var li = d.createElement("li");
          if (p === state.page) li.classList.add("active");
          var a = d.createElement("a");
          a.href = "#";
          a.textContent = p;
          a.addEventListener("click", function (e) { e.preventDefault(); state.page = p; render(); });
          li.appendChild(a);
          list.appendChild(li);
        })(i);
      }

      var next = d.createElement("li");
      if (state.page === totalPages) next.className = "disabled";
      var nextA = d.createElement("a");
      nextA.href = "#";
      nextA.innerHTML = '<i class="bi bi-chevron-right"></i>';
      nextA.setAttribute("aria-label", "Next");
      nextA.addEventListener("click", function (e) { e.preventDefault(); if (state.page < totalPages) { state.page++; render(); } });
      next.appendChild(nextA);
      list.appendChild(next);

      paginationEl.appendChild(list);
    }

    render();
  });
})();
