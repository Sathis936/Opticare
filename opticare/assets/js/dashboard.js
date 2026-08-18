/* ============================================================
   OptiCare - dashboard.js
   Admin analytics charts (Chart.js) + report charts
   Charts re-color on theme switch via a chart registry.
   ============================================================ */
(function () {
  "use strict";

  var d = document;

  function ready(fn) {
    if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function readCss() {
    var css = getComputedStyle(document.documentElement);
    return {
      primary: css.getPropertyValue("--primary").trim() || "#0b5fd9",
      secondary: css.getPropertyValue("--secondary").trim() || "#00c2a8",
      success: css.getPropertyValue("--success").trim() || "#12b76a",
      warning: css.getPropertyValue("--warning").trim() || "#f79009",
      danger: css.getPropertyValue("--danger").trim() || "#f04438",
      info: css.getPropertyValue("--info").trim() || "#06aed4",
      purple: css.getPropertyValue("--purple").trim() || "#7a5af8",
      muted: css.getPropertyValue("--muted-2").trim() || "#8494ab",
      grid: css.getPropertyValue("--border").trim() || "#e3eaf3",
      text: css.getPropertyValue("--text").trim() || "#16243a"
    };
  }

  function areaFill(ctx, hex) {
    var g = ctx.createLinearGradient(0, 0, 0, 280);
    g.addColorStop(0, hex + "66");
    g.addColorStop(1, hex + "00");
    return g;
  }

  var registry = [];
  var current = readCss();

  function register(chart) {
    if (chart) registry.push(chart);
  }

  function applyThemeToCharts() {
    current = readCss();
    Chart.defaults.color = current.muted;
    Chart.defaults.borderColor = current.grid;
    registry.forEach(function (chart) {
      if (chart.update) chart.update();
    });
  }

  ready(function () {
    if (typeof Chart === "undefined") return;
    Chart.defaults.font.family = "Inter, sans-serif";
    Chart.defaults.font.size = 12;

    var c = current;

    /* ---------- Revenue chart (dashboard index) ---------- */
    var revCtx = d.getElementById("revenueChart");
    if (revCtx) {
      register(new Chart(revCtx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [
            {
              label: "Revenue",
              data: [12, 19, 15, 24, 28, 22, 31, 35, 29, 38, 42, 48],
              borderColor: c.primary,
              backgroundColor: areaFill(revCtx, c.primary),
              fill: true,
              tension: 0.4,
              borderWidth: 2.5,
              pointRadius: 3,
              pointBackgroundColor: c.primary
            },
            {
              label: "Expenses",
              data: [9, 12, 11, 15, 16, 14, 17, 19, 16, 20, 22, 24],
              borderColor: c.secondary,
              backgroundColor: "transparent",
              fill: false,
              tension: 0.4,
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: { legend: { position: "top", align: "end", labels: { usePointStyle: true, boxWidth: 8 } } },
          scales: { y: { beginAtZero: true, ticks: { callback: function (v) { return "$" + v + "k"; } } } }
        }
      }));
    }

    /* ---------- Appointments chart (dashboard index) ---------- */
    var apptCtx = d.getElementById("appointmentChart");
    if (apptCtx) {
      register(new Chart(apptCtx, {
        type: "bar",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "Appointments",
              data: [18, 24, 20, 29, 26, 14, 8],
              backgroundColor: [c.primary, c.secondary, c.info, c.success, c.warning, c.purple, c.danger],
              borderRadius: 8,
              maxBarThickness: 34
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      }));
    }

    /* ---------- Sales by category doughnut ---------- */
    var catCtx = d.getElementById("categoryChart");
    if (catCtx) {
      register(new Chart(catCtx, {
        type: "doughnut",
        data: {
          labels: ["Reading", "Sunglasses", "Sports", "Kids", "Contact Lenses"],
          datasets: [{
            data: [32, 24, 15, 13, 16],
            backgroundColor: [c.primary, c.secondary, c.warning, c.purple, c.info],
            borderWidth: 2,
            borderColor: "transparent",
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "68%",
          plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8, padding: 14 } } }
        }
      }));
    }

    /* ---------- Weekly sales bar (reports) ---------- */
    var salesCtx = d.getElementById("salesChart");
    if (salesCtx) {
      register(new Chart(salesCtx, {
        type: "bar",
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"],
          datasets: [
            {
              label: "Frames",
              data: [8, 11, 9, 14, 12, 16, 13, 17],
              backgroundColor: c.primary,
              borderRadius: 6,
              maxBarThickness: 22
            },
            {
              label: "Lenses",
              data: [6, 8, 7, 10, 9, 12, 11, 14],
              backgroundColor: c.secondary,
              borderRadius: 6,
              maxBarThickness: 22
            },
            {
              label: "Accessories",
              data: [3, 4, 5, 4, 6, 5, 7, 6],
              backgroundColor: c.warning,
              borderRadius: 6,
              maxBarThickness: 22
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: { legend: { position: "top", align: "end", labels: { usePointStyle: true, boxWidth: 8 } } },
          scales: { y: { beginAtZero: true, ticks: { callback: function (v) { return "$" + v + "k"; } } } }
        }
      }));
    }

    /* ---------- Customer growth (reports) ---------- */
    var custCtx = d.getElementById("customersChart");
    if (custCtx) {
      register(new Chart(custCtx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [
            {
              label: "New Customers",
              data: [40, 62, 55, 78, 90, 84, 104, 118, 96, 128, 142, 156],
              borderColor: c.success,
              backgroundColor: areaFill(custCtx, c.success),
              fill: true,
              tension: 0.4,
              borderWidth: 2.5,
              pointRadius: 3,
              pointBackgroundColor: c.success
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "top", align: "end", labels: { usePointStyle: true, boxWidth: 8 } } },
          scales: { y: { beginAtZero: true } }
        }
      }));
    }

    /* ---------- Appointment analytics donut (reports) ---------- */
    var apptReportCtx = d.getElementById("appointmentReportChart");
    if (apptReportCtx) {
      register(new Chart(apptReportCtx, {
        type: "doughnut",
        data: {
          labels: ["Completed", "Pending", "Confirmed", "Cancelled"],
          datasets: [{
            data: [58, 14, 20, 8],
            backgroundColor: [c.success, c.warning, c.primary, c.danger],
            borderWidth: 2,
            borderColor: "transparent",
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "65%",
          plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8, padding: 14 } } }
        }
      }));
    }

    /* ---------- Top products horizontal bar (reports) ---------- */
    var prodCtx = d.getElementById("productChart");
    if (prodCtx) {
      register(new Chart(prodCtx, {
        type: "bar",
        data: {
          labels: ["Aviator Classic", "Marina Cat Eye", "Metro Round", "Solstice Wayfarer", "Opal Rimless", "Urban Titanium"],
          datasets: [{
            label: "Units Sold",
            data: [248, 210, 186, 165, 142, 118],
            backgroundColor: [c.primary, c.secondary, c.info, c.warning, c.purple, c.success],
            borderRadius: 6,
            maxBarThickness: 18
          }]
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true } }
        }
      }));
    }

    /* ---------- Traffic source (reports) ---------- */
    var trafficCtx = d.getElementById("trafficChart");
    if (trafficCtx) {
      register(new Chart(trafficCtx, {
        type: "line",
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [
            { label: "Organic", data: [12, 15, 14, 18], borderColor: c.primary, tension: 0.4, fill: false, borderWidth: 2 },
            { label: "Direct", data: [9, 11, 12, 14], borderColor: c.secondary, tension: 0.4, fill: false, borderWidth: 2 },
            { label: "Social", data: [6, 8, 9, 11], borderColor: c.purple, tension: 0.4, fill: false, borderWidth: 2 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "top", align: "end", labels: { usePointStyle: true, boxWidth: 8 } } },
          scales: { y: { beginAtZero: true } }
        }
      }));
    }

    /* ---------- Re-color charts when theme changes ---------- */
    d.addEventListener("opticare:theme", function () {
      applyThemeToCharts();
    });
  });
})();
