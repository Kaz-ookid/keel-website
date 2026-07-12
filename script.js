// Keel site interactions: scroll reveals, the hero device's gentle tilt,
// and the year stamp. Vanilla on purpose; respects reduced motion.

(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll reveal: elements fade-rise once, when they enter the viewport.
  var revealed = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    revealed.forEach(function (el) { io.observe(el); });
  } else {
    revealed.forEach(function (el) { el.classList.add("revealed"); });
  }

  // Analytics vignette: grow the bars when the card shows up.
  var chart = document.querySelector(".chart-vignette");
  if (chart) {
    if ("IntersectionObserver" in window && !reduced) {
      var chartIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              chart.classList.add("grown");
              chartIo.disconnect();
            }
          });
        },
        { threshold: 0.4 }
      );
      chartIo.observe(chart);
    } else {
      chart.classList.add("grown");
    }
  }

  // Hero device: a small tilt following the pointer, desktop only.
  var device = document.getElementById("tilt-device");
  if (device && !reduced && window.matchMedia("(pointer: fine)").matches) {
    var hero = device.closest(".hero");
    hero.addEventListener("pointermove", function (e) {
      var rect = device.getBoundingClientRect();
      var dx = (e.clientX - rect.left - rect.width / 2) / rect.width;
      var dy = (e.clientY - rect.top - rect.height / 2) / rect.height;
      var clampedX = Math.max(-0.6, Math.min(0.6, dx));
      var clampedY = Math.max(-0.6, Math.min(0.6, dy));
      device.style.transform =
        "perspective(900px) rotateY(" + (clampedX * 7).toFixed(2) + "deg)" +
        " rotateX(" + (-clampedY * 5).toFixed(2) + "deg)";
    });
    hero.addEventListener("pointerleave", function () {
      device.style.transform = "";
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ------------------------------ Tour ------------------------------- */

  // Tabs
  var tabs = document.querySelectorAll(".tour-tab");
  var panels = document.querySelectorAll(".tour-panel");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("active"); });
      panels.forEach(function (p) { p.classList.remove("active"); });
      tab.classList.add("active");
      var panel = document.querySelector('[data-panel="' + tab.dataset.step + '"]');
      if (panel) panel.classList.add("active");
    });
  });

  // Step 1: play the read
  var readBtn = document.getElementById("tour-read");
  var out = document.getElementById("tour-out");
  var count = document.getElementById("tour-count");
  if (readBtn && out) {
    readBtn.addEventListener("click", function () {
      out.classList.add("played");
      readBtn.classList.add("done");
      readBtn.textContent = "Read";
      if (count) count.textContent = "· 16 items, 5 shown";
    });
  }

  // Step 2: the Upcoming replica. Folds, account filter (the hero follows),
  // and mark-paid that settles the row in place.
  var HERO = {
    all: ["Due this month", "CHF 1991.64", "then CHF 3222.00 in August"],
    bour: ["Boursorama needs", "€0", "nothing left this month, by Jul 31"],
    post: ["PostFinance needs", "CHF 1909.40", "by Jul 31"],
    neon: ["Neon needs", "€89.17", "by Jul 31"]
  };

  document.querySelectorAll(".fold-bar").forEach(function (bar) {
    bar.addEventListener("click", function () {
      var body = document.querySelector('[data-fold-body="' + bar.dataset.fold + '"]');
      if (!body) return;
      var open = !body.hidden;
      body.hidden = open;
      bar.classList.toggle("open", !open);
    });
  });

  var chips = document.querySelectorAll(".acct-chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      var acct = chip.dataset.acct;
      var hero = HERO[acct];
      var l = document.getElementById("t-hero-label");
      var a = document.getElementById("t-hero-amount");
      var s = document.getElementById("t-hero-sub");
      if (l && hero) { l.textContent = hero[0]; a.textContent = hero[1]; s.textContent = hero[2]; }
      document.querySelectorAll("#t-upcoming [data-acct]").forEach(function (row) {
        row.style.display = acct === "all" || row.dataset.acct === acct || row.dataset.acct === "all" ? "" : "none";
      });
      // A day section with every row filtered out hides entirely.
      document.querySelectorAll("#t-upcoming [data-section]").forEach(function (section) {
        var visible = Array.prototype.some.call(
          section.querySelectorAll("[data-acct]"),
          function (row) { return row.style.display !== "none"; }
        );
        section.style.display = visible ? "" : "none";
      });
    });
  });

  document.querySelectorAll("[data-mark]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var row = btn.closest(".up-row");
      var settledNow = row.classList.toggle("settled");
      row.classList.toggle("just-paid", settledNow);
      btn.textContent = settledNow ? "Undo" : "Mark paid";
      btn.classList.toggle("undo-btn", settledNow);
      var tag = row.querySelector(".up-tag");
      if (tag) {
        if (settledNow) {
          tag.dataset.was = tag.textContent;
          tag.dataset.over = tag.classList.contains("up-tag-over") ? "1" : "";
          tag.textContent = "paid ✓";
          tag.classList.remove("up-tag-over");
        } else if (tag.dataset.was) {
          tag.textContent = tag.dataset.was;
          if (tag.dataset.over === "1") tag.classList.add("up-tag-over");
        }
      }
    });
  });

  // Step 3: the year of months
  var MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  var TOTALS = [2841, 2797, 2752, 2752, 2752, 3271, 2752, 2752, 3870, 2752, 2752, 2752];
  var SPIKES = { 5: true, 8: true };
  var DETAILS = {
    0: {
      title: "July 2026",
      rows: [["AirPods · pay-in-4", "€44.75 · 3 of 4"], ["Custom keyboard · pay-in-4", "€44.42 · 4 of 4, last"]],
      note: "Two split payments riding on top of the baseline."
    },
    5: {
      title: "December 2026",
      rows: [["Half-fare card", "CHF 120 · yearly"], ["MagicPass", "CHF 399 · last payment"]],
      note: "The December ambush, visible from July."
    },
    8: {
      title: "March 2027",
      rows: [["SERAFE", "CHF 312 · price dropped"], ["TPG annual pass", "CHF 730 · price rose"], ["TCS", "CHF 76 · price dropped"]],
      note: "Three yearly renewals land together, and every price change was already on file."
    }
  };
  var BASELINE = [["Rent", "CHF 1620"], ["Car loan", "€645.30"], ["CSS Assurance", "CHF 289.40"], ["Basefit + Salt", "CHF 98.95"], ["Digital bits", "≈ CHF 28"]];

  var tbars = document.getElementById("tbars");
  var tdetail = document.getElementById("tbar-detail");
  if (tbars && tdetail) {
    var max = Math.max.apply(null, TOTALS);
    TOTALS.forEach(function (value, i) {
      var b = document.createElement("button");
      b.className = "tbar" + (SPIKES[i] ? " spike" : "");
      b.setAttribute("aria-label", MONTHS[i] + ", about " + value + " francs");
      var bar = document.createElement("i");
      bar.style.height = Math.round((value / max) * 82 + 8) + "%";
      var label = document.createElement("span");
      label.textContent = MONTHS[i];
      b.appendChild(bar);
      b.appendChild(label);
      b.addEventListener("click", function () { selectMonth(i, b); });
      tbars.appendChild(b);
    });
  }

  function selectMonth(i, btn) {
    tbars.classList.add("has-sel");
    tbars.querySelectorAll(".tbar").forEach(function (t) { t.classList.remove("sel"); });
    btn.classList.add("sel");
    var d = DETAILS[i];
    var rows = d ? d.rows : BASELINE;
    var title = d ? d.title : MONTHS[i] + " · the steady month";
    var note = d ? d.note : "No surprises: the recurring baseline, nothing else.";
    var html = "<h4>" + title + " · ≈ CHF " + TOTALS[i] + "</h4>";
    rows.forEach(function (r) {
      html += '<div class="mini-row"><span class="mini-name">' + r[0] +
        '</span><span class="mini-amount">' + r[1] + "</span></div>";
    });
    html += '<p class="note">' + note + "</p>";
    tdetail.innerHTML = html;
  }

  // Step 4: donut
  var SLICES = [
    ["Housing", 1660, "#7FB8B0"],
    ["Loans", 645, "#6C8EBF"],
    ["Insurance & fees", 315, "#B56576"],
    ["Transport", 95, "#C9A66B"],
    ["Digital & sport", 86, "#9C8FC7"]
  ];
  var donut = document.getElementById("donut");
  var legend = document.getElementById("donut-legend");
  var center = document.getElementById("donut-center");
  var donutTotal = SLICES.reduce(function (sum, s) { return sum + s[1]; }, 0);
  var donutSel = -1;

  function hexA(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }

  function paintDonut() {
    if (!donut) return;
    var stops = [];
    var angle = 0;
    SLICES.forEach(function (s, i) {
      var sweep = (s[1] / donutTotal) * 360;
      var color = donutSel === -1 || donutSel === i ? s[2] : hexA(s[2], 0.22);
      stops.push(color + " " + angle.toFixed(2) + "deg " + (angle + sweep).toFixed(2) + "deg");
      angle += sweep;
    });
    donut.style.background = "conic-gradient(" + stops.join(",") + ")";
    if (center) {
      center.innerHTML = donutSel === -1
        ? "<strong>CHF " + donutTotal + "</strong><span>per month, smoothed</span>"
        : "<strong>CHF " + SLICES[donutSel][1] + "</strong><span>" + SLICES[donutSel][0] + " / month</span>";
    }
  }

  if (donut && legend) {
    SLICES.forEach(function (s, i) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.innerHTML = '<span class="swatch" style="background:' + s[2] + '"></span>' +
        s[0] + '<span class="amt">CHF ' + s[1] + "</span>";
      b.addEventListener("click", function () {
        donutSel = donutSel === i ? -1 : i;
        legend.classList.toggle("has-sel", donutSel !== -1);
        legend.querySelectorAll("button").forEach(function (x) { x.classList.remove("sel"); });
        if (donutSel !== -1) b.classList.add("sel");
        paintDonut();
      });
      li.appendChild(b);
      legend.appendChild(li);
    });
    paintDonut();
  }
})();
