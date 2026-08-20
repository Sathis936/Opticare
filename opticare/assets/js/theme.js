/* ============================================================
   OptiCare - theme.js
   Dark / Light mode + RTL / LTR switcher (localStorage)
   ============================================================ */
(function () {
  "use strict";

  var STORAGE = {
    theme: "opticare_theme",
    dir: "opticare_dir"
  };

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE.theme) || "light";
    } catch (e) {
      return "light";
    }
  }

  function getStoredDir() {
    try {
      return localStorage.getItem(STORAGE.dir) || "ltr";
    } catch (e) {
      return "ltr";
    }
  }

  function setTheme(theme, persist) {
    document.documentElement.setAttribute("data-theme", theme);
    if (persist !== false) {
      try {
        localStorage.setItem(STORAGE.theme, theme);
      } catch (e) { /* noop */ }
    }
    updateThemeIcons();
    document.dispatchEvent(new CustomEvent("opticare:theme", { detail: { theme: theme } }));
  }

  function setDir(dir, persist) {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", dir === "rtl" ? "ar" : "en");
    if (persist !== false) {
      try {
        localStorage.setItem(STORAGE.dir, dir);
      } catch (e) { /* noop */ }
    }
    updateDirLabels();
    document.dispatchEvent(new CustomEvent("opticare:dir", { detail: { dir: dir } }));
  }

  function updateThemeIcons() {
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      var icon = btn.querySelector("i");
      var label = btn.querySelector(".theme-label");
      if (icon) {
        icon.className = isDark ? "bi bi-sun" : "bi bi-moon-stars";
      }
      if (label) {
        label.textContent = isDark ? "Light" : "Dark";
      }
    });
  }

  function updateDirLabels() {
    var isRtl = document.documentElement.getAttribute("dir") === "rtl";
    var nextText = isRtl ? "LTR" : "RTL";
    document.querySelectorAll("[data-dir-toggle]").forEach(function (btn) {
      var dirText = btn.querySelector(".dir-text");
      var dirLabel = btn.querySelector(".dir-label");
      if (dirText) {
        dirText.textContent = nextText;
      } else if (dirLabel) {
        dirLabel.textContent = nextText;
      } else {
        btn.innerHTML = '<span class="dir-text">' + nextText + '</span>';
      }
      btn.setAttribute("aria-label", isRtl ? "Switch to LTR" : "Switch to RTL");
    });
  }

  function init() {
    setTheme(getStoredTheme(), false);
    setDir(getStoredDir(), false);

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        setTheme(next);
      });
    });

    document.querySelectorAll("[data-dir-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var next = document.documentElement.getAttribute("dir") === "rtl" ? "ltr" : "rtl";
        setDir(next);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.OptiCareTheme = {
    getTheme: function () { return document.documentElement.getAttribute("data-theme"); },
    getDir: function () { return document.documentElement.getAttribute("dir"); },
    setTheme: setTheme,
    setDir: setDir
  };
})();
