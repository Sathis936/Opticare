/* ============================================================
   OptiCare - booking.js
   Multi-step eye-test booking wizard with validation,
   date picker, and time-slot selection.
   ============================================================ */
(function () {
  "use strict";

  var d = document;

  function ready(fn) {
    if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    var wizard = d.getElementById("bookingWizard");
    if (!wizard) return;

    var steps = Array.prototype.slice.call(wizard.querySelectorAll(".booking-step"));
    var dots = Array.prototype.slice.call(wizard.querySelectorAll(".step-dot"));
    var connectors = Array.prototype.slice.call(wizard.querySelectorAll(".step-connector"));
    var prevBtn = d.getElementById("bookingPrev");
    var nextBtn = d.getElementById("bookingNext");
    var confirmBtn = d.getElementById("bookingConfirm");
    var startAgainBtn = d.getElementById("bookingAgain");
    var current = 0;
    var formData = {
      first: "", last: "", email: "", phone: "", dob: "",
      service: "", date: "", time: "", optometrist: "", notes: ""
    };

    // service selection
    wizard.querySelectorAll(".service-select-card").forEach(function (card) {
      card.addEventListener("click", function () {
        var scope = card.closest("[data-service-group]");
        scope.querySelectorAll(".service-select-card").forEach(function (c) {
          c.classList.remove("selected");
          c.querySelector('input[type="radio"]').checked = false;
        });
        card.classList.add("selected");
        var radio = card.querySelector('input[type="radio"]');
        radio.checked = true;
      });
    });

    // time slots
    wizard.querySelectorAll(".time-slot").forEach(function (slot) {
      if (!slot.classList.contains("disabled")) {
        slot.addEventListener("click", function () {
          var scope = slot.closest("[data-time-group]");
          scope.querySelectorAll(".time-slot").forEach(function (s) { s.classList.remove("selected"); });
          slot.classList.add("selected");
        });
      }
    });

    // flatpickr
    var dateInput = d.getElementById("bkDate");
    if (dateInput && window.flatpickr) {
      window.flatpickr(dateInput, {
        dateFormat: "Y-m-d",
        minDate: "today",
        disable: [function (date) { return date.getDay() === 0; }],
        locale: { firstDayOfWeek: 1 }
      });
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, steps.length - 1));
      steps.forEach(function (s, i) { s.classList.toggle("active", i === current); });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
        dot.classList.toggle("done", i < current);
      });
      connectors.forEach(function (c, i) {
        c.classList.toggle("filled", i < current);
      });
      if (prevBtn) prevBtn.style.visibility = current === 0 ? "hidden" : "visible";
      if (nextBtn) nextBtn.style.display = current === steps.length - 1 ? "none" : "";
      if (confirmBtn) confirmBtn.style.display = current === steps.length - 1 ? "" : "none";
      var title = steps[current].getAttribute("data-step-title");
      var stepLabel = d.getElementById("currentStepLabel");
      if (stepLabel && title) stepLabel.textContent = title;
      if (current === steps.length - 1) fillSummary();
      wizard.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function validateStep(index) {
      var step = steps[index];
      var valid = true;
      step.querySelectorAll("[data-error]").forEach(function (input) {
        var value = input.value.trim();
        var rules = (input.getAttribute("data-error") || "").split(",");
        var ok = true;
        if (rules.indexOf("required") !== -1 && !value) ok = false;
        else if (value && rules.indexOf("email") !== -1 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) ok = false;
        else if (value && rules.indexOf("phone") !== -1 && !/^[+\d][\d\s\-()]{6,}$/.test(value)) ok = false;

        var err = step.querySelector("#error-" + input.id);
        if (err) {
          err.textContent = ok ? "" : (rules.indexOf("email") !== -1 ? "Enter a valid email." : rules.indexOf("phone") !== -1 ? "Enter a valid phone." : "This field is required.");
          err.classList.toggle("show", !ok);
        }
        input.classList.toggle("is-invalid", !ok);
        if (!ok) valid = false;
      });

      if (index === 1) {
        var service = step.querySelector('input[name="bk-service"]:checked');
        if (!service) {
          showError("Please select a service to continue.");
          valid = false;
        }
      }
      if (index === 2) {
        var date = step.querySelector("#bkDate");
        if (!date || !date.value) {
          showError("Please choose an appointment date.");
          valid = false;
        }
      }
      if (index === 3) {
        var slot = step.querySelector(".time-slot.selected");
        var opt = step.querySelector("#bkOptometrist");
        if (!slot) {
          showError("Please select an available time slot.");
          valid = false;
        }
        if (opt && !opt.value) {
          showError("Please choose an optometrist.");
          valid = false;
        }
      }
      return valid;
    }

    function showError(msg) {
      var box = d.getElementById("bookingError");
      if (!box) {
        box = d.createElement("div");
        box.className = "alert alert-danger mt-3";
        box.id = "bookingError";
        wizard.querySelector(".booking-body").appendChild(box);
      }
      box.textContent = msg;
      box.classList.remove("d-none");
    }

    function clearError() {
      var box = d.getElementById("bookingError");
      if (box) box.classList.add("d-none");
    }

    function collect() {
      formData.first = val("#bkFirst");
      formData.last = val("#bkLast");
      formData.email = val("#bkEmail");
      formData.phone = val("#bkPhone");
      formData.dob = val("#bkDob");
      var service = wizard.querySelector('input[name="bk-service"]:checked');
      formData.service = service ? service.value : "";
      formData.date = val("#bkDate");
      var slot = wizard.querySelector(".time-slot.selected");
      formData.time = slot ? slot.textContent.trim() : "";
      formData.optometrist = val("#bkOptometrist");
      formData.notes = val("#bkNotes");
    }

    function val(id) {
      var el = d.getElementById(id);
      return el ? el.value.trim() : "";
    }

    function fillSummary() {
      collect();
      var map = {
        "sum-name": (formData.first + " " + formData.last).trim(),
        "sum-email": formData.email,
        "sum-phone": formData.phone,
        "sum-dob": formData.dob || "-",
        "sum-service": formData.service,
        "sum-date": formData.date,
        "sum-time": formData.time,
        "sum-optometrist": formData.optometrist || "First available",
        "sum-notes": formData.notes || "None"
      };
      Object.keys(map).forEach(function (id) {
        var el = d.getElementById(id);
        if (el) el.textContent = map[id];
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        clearError();
        if (validateStep(current)) {
          goTo(current + 1);
        }
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener("click", function () { goTo(current - 1); });
    }
    if (confirmBtn) {
      confirmBtn.addEventListener("click", function () {
        clearError();
        if (validateStep(current)) {
          collect();
          var success = d.getElementById("bookingSuccess");
          var body = wizard.querySelector(".booking-body");
          if (success) {
            var fname = d.getElementById("successName");
            if (fname) fname.textContent = formData.first + " " + formData.last;
            var fdate = d.getElementById("successDate");
            if (fdate) fdate.textContent = formData.date + " at " + formData.time;
            success.classList.add("show");
            if (body) body.style.display = "none";
          }
          var summary = d.getElementById("bookingSummary");
          if (summary) summary.style.display = "none";
        }
      });
    }
    if (startAgainBtn) {
      startAgainBtn.addEventListener("click", function () {
        wizard.querySelectorAll(".service-select-card").forEach(function (c) { c.classList.remove("selected"); });
        wizard.querySelectorAll(".time-slot.selected").forEach(function (s) { s.classList.remove("selected"); });
        wizard.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]), select, textarea').forEach(function (input) {
          if (input.type !== "button" && input.type !== "submit") input.value = "";
        });
        wizard.querySelectorAll('input[type="radio"]').forEach(function (r) { r.checked = false; });
        var success = d.getElementById("bookingSuccess");
        var body = wizard.querySelector(".booking-body");
        if (success) success.classList.remove("show");
        if (body) body.style.display = "";
        var summary = d.getElementById("bookingSummary");
        if (summary) summary.style.display = "";
        current = 0;
        goTo(0);
      });
    }

    // init
    goTo(0);
  });
})();
