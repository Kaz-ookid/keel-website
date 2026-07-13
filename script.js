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

  // The aura follows the dive: each glow lags the scroll at its own depth
  // (via --scrolly), and the sea floor fades in near the bottom of the
  // page (via --scrollp, 0 at the top, 1 at the end).
  if (!reduced) {
    var auraTick = false;
    var setAura = function () {
      var doc = document.documentElement;
      var range = Math.max(1, doc.scrollHeight - window.innerHeight);
      doc.style.setProperty("--scrolly", window.scrollY + "px");
      doc.style.setProperty("--scrollp", String(Math.min(1, window.scrollY / range)));
      auraTick = false;
    };
    window.addEventListener("scroll", function () {
      if (!auraTick) { auraTick = true; requestAnimationFrame(setAura); }
    }, { passive: true });
    setAura();
  }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ------------------------------ Tour ------------------------------- */

  // Tabs: locked until the read has been played (the tour's data has to
  // exist before the screens that show it).
  var tourUnlocked = false;
  var tabs = document.querySelectorAll(".tour-tab");
  var panels = document.querySelectorAll(".tour-panel");
  var readBtn = document.getElementById("tour-read");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      if (!tourUnlocked && tab.dataset.step !== "0") {
        // Wave from the button instead: that's the way in.
        if (readBtn) {
          readBtn.classList.remove("nudge");
          void readBtn.offsetWidth; // restart the animation
          readBtn.classList.add("nudge");
        }
        return;
      }
      tabs.forEach(function (t) { t.classList.remove("active"); });
      panels.forEach(function (p) { p.classList.remove("active"); });
      tab.classList.add("active");
      var panel = document.querySelector('[data-panel="' + tab.dataset.step + '"]');
      if (panel) panel.classList.add("active");
    });
  });

  // Step 1: play the read, which unlocks the rest of the tour.
  var out = document.getElementById("tour-out");
  var count = document.getElementById("tour-count");
  if (readBtn && out) {
    readBtn.addEventListener("click", function () {
      out.classList.add("played");
      readBtn.classList.add("done");
      readBtn.textContent = "Read";
      if (count) count.textContent = "· 17 items read";
      tourUnlocked = true;
      tabs.forEach(function (t) { t.classList.remove("locked"); });
    });
  }

  // Step 2: the Upcoming replica. Every row carries its amount and
  // currency, and every total on screen (hero, fold bars, day sections)
  // is recomputed from the rows' current state, the way the app does it.
  var RATE = 0.9253; // EUR to CHF, frozen for the demo
  var HERO = {
    all: ["Due this month", "then CHF 2674.09 in August"],
    bour: ["Boursorama needs", "nothing left this month, by Jul 31"],
    post: ["PostFinance needs", "by Jul 31"],
    neon: ["Neon needs", "by Jul 31"]
  };
  var ZERO = { all: "CHF 0", bour: "€0", post: "CHF 0", neon: "€0" };
  var currentAcct = "all";

  var upRoot = document.getElementById("t-upcoming");
  var paidFold = document.querySelector('[data-fold-body="paid"]');
  var paidBar = document.querySelector('[data-fold="paid"]');
  var nextFold = document.querySelector('[data-fold-body="next"]');
  var nextBar = document.querySelector('[data-fold="next"]');

  function money(n) { return n.toFixed(2).replace(/\.00$/, ""); }
  function fmtSum(s, acct) {
    if (s.eur > 0 && s.chf > 0) return "CHF " + money(s.chf + s.eur * RATE);
    if (s.eur > 0) return "€" + money(s.eur);
    if (s.chf > 0) return "CHF " + money(s.chf);
    return ZERO[acct || "all"];
  }
  function inFilter(row) { return currentAcct === "all" || row.dataset.acct === currentAcct; }
  function sumRows(rows) {
    var s = { chf: 0, eur: 0, n: 0 };
    rows.forEach(function (row) {
      if (!inFilter(row)) return;
      s.n++;
      if (row.dataset.cur === "eur") s.eur += parseFloat(row.dataset.amt);
      else s.chf += parseFloat(row.dataset.amt);
    });
    return s;
  }

  function recompute() {
    if (!upRoot) return;
    var rows = Array.prototype.slice.call(upRoot.querySelectorAll(".up-row[data-amt]"));
    var due = sumRows(rows.filter(function (r) {
      return !r.classList.contains("settled") && !nextFold.contains(r);
    }));
    var paid = sumRows(rows.filter(function (r) { return r.classList.contains("settled"); }));
    var aug = sumRows(rows.filter(function (r) { return nextFold.contains(r); }));

    var hero = HERO[currentAcct];
    document.getElementById("t-hero-label").textContent = hero[0];
    document.getElementById("t-hero-amount").textContent = fmtSum(due, currentAcct);
    document.getElementById("t-hero-sub").textContent = hero[1];

    // Rows follow the filter; a section with nothing left hides entirely,
    // and each day's total re-adds from what is still unpaid in it.
    rows.forEach(function (row) { row.style.display = inFilter(row) ? "" : "none"; });
    upRoot.querySelectorAll("[data-section]").forEach(function (section) {
      var sectionRows = Array.prototype.slice.call(section.querySelectorAll(".up-row"));
      var shown = sectionRows.filter(inFilter);
      section.style.display = shown.length ? "" : "none";
      var total = section.querySelector(".up-day-total");
      if (total) {
        var open = sumRows(sectionRows.filter(function (r) { return !r.classList.contains("settled"); }));
        total.textContent = open.n ? fmtSum(open) : "";
      }
    });

    // The two folds carry their totals on the bar. No paid payments under
    // the current filter: no paid fold at all.
    if (paidBar && paidFold) {
      paidBar.style.display = paid.n ? "" : "none";
      if (!paid.n) { paidFold.hidden = true; paidBar.classList.remove("open"); }
      paidBar.querySelector("span").textContent = "Paid this month · " + fmtSum(paid);
    }
    if (nextBar) nextBar.querySelector("span").textContent = "August 2026 · " + fmtSum(aug);
  }

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
      currentAcct = chip.dataset.acct;
      recompute();
    });
  });

  // Mark paid: the row settles, then MOVES up into the "Paid this month"
  // fold (which opens so you see it land). Undo sends it home again. Salt
  // Home arrives already paid; undoing it lands in Overdue (it was due
  // July 9th), exactly what the app would do.
  var saltRow = document.getElementById("row-salt");
  var overdueSection = document.getElementById("sec-overdue");
  if (saltRow && overdueSection) saltRow._home = { parent: overdueSection, next: null };
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
      // Overdue rows show their amount in orange until they are settled.
      if (settledNow) row.classList.remove("overdue");
      else if (tag && tag.dataset.over === "1") row.classList.add("overdue");
      if (paidFold && paidBar) {
        if (settledNow) {
          // Remember where home is, then travel to the settled zone.
          row._home = { parent: row.parentElement, next: row.nextElementSibling };
          setTimeout(function () {
            if (!row.classList.contains("settled")) return; // undone mid-flight
            paidFold.appendChild(row);
            paidFold.hidden = false;
            paidBar.classList.add("open");
            recompute();
          }, 550);
        } else if (row._home) {
          row._home.parent.insertBefore(row, row._home.next);
          row._home = null;
        }
      }
      recompute();
    });
  });

  recompute();

  // Step 3: months, three year-windows deep. Rows carry a payment status
  // (✓ paid, ○ still due, ! overdue), exactly the states the app shows.
  var MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  var ST = { paid: ["✓", "st-paid"], due: ["○", "st-due"], over: ["!", "st-over"] };
  var BASE_NOW = [["Rent", "CHF 1620", "due"], ["Car loan", "€645.30", "due"], ["CSS Assurance", "CHF 289.40", "due"], ["Basefit + Salt", "CHF 98.95", "due"], ["Digital bits", "≈ CHF 28", "due"]];

  var WINDOWS = [
    {
      label: "Jul 2025 · Jun 2026",
      totals: [651, 651, 651, 651, 651, 1170, 651, 651, 3491, 2645, 2734, 2734],
      spikes: { 5: true, 8: true },
      now: -1,
      details: {
        5: { title: "December 2025", rows: [["Half-fare card", "CHF 120", "paid"], ["MagicPass", "CHF 399", "paid"]], note: "The first December: both passes bought." },
        8: { title: "March 2026", rows: [["Rent begins", "CHF 1620", "paid"], ["CSS, SERAFE, TPG, TCS", "≈ CHF 1220", "paid"]], note: "The move-in month: five commitments started at once." }
      },
      fallback: { rows: [["The early baseline", "loan, fees, cloud", "paid"]], note: "Before March 2026, not much was recurring yet." }
    },
    {
      label: "Jul 2026 · Jun 2027",
      totals: [2841, 2797, 2752, 2752, 2752, 3271, 2752, 2752, 3870, 2752, 2752, 2752],
      spikes: { 5: true, 8: true },
      now: 0,
      details: {
        0: {
          title: "July 2026 · now",
          rows: [["Salt Home", "CHF 39.95", "paid"], ["CSS Assurance", "CHF 289.40", "over"], ["AirPods · 3 of 4", "€44.75", "due"], ["Rent", "CHF 1620", "due"], ["Keyboard · last", "€44.42", "due"]],
          note: "The current month: one paid, one overdue, the rest on their way."
        },
        5: { title: "December 2026", rows: [["Half-fare card", "CHF 120", "due"], ["MagicPass", "CHF 399", "due"]], note: "The December ambush, visible from July. MagicPass's last ride." },
        8: { title: "March 2027", rows: [["SERAFE", "CHF 312", "due"], ["TPG annual", "CHF 730", "due"], ["TCS", "CHF 76", "due"]], note: "Three renewals land together, every price change already on file." }
      },
      fallback: { rows: BASE_NOW, note: "The steady month: the recurring baseline, nothing else." }
    },
    {
      label: "Jul 2027 · Jun 2028",
      totals: [2681, 2681, 2681, 2681, 2681, 2871, 2681, 2681, 3799, 2681, 2681, 2681],
      spikes: { 5: true, 8: true },
      now: -1,
      details: {
        5: { title: "December 2027", rows: [["Half-fare card", "CHF 190", "due"]], note: "The new price, known since day one. No MagicPass: it ended in 2026." },
        8: { title: "March 2028", rows: [["SERAFE", "CHF 312", "due"], ["TPG annual", "CHF 730", "due"], ["TCS", "CHF 76", "due"]], note: "Next year's March, already priced in." }
      },
      fallback: { rows: [["The settled baseline", "≈ CHF 2681 / month", "due"]], note: "The splits are done; the yearly spikes are all that's left to watch." }
    }
  ];

  var windowIndex = 1;
  var tbars = document.getElementById("tbars");
  var tdetail = document.getElementById("tbar-detail");
  var tprev = document.getElementById("tbar-prev");
  var tnext = document.getElementById("tbar-next");
  var twindow = document.getElementById("tbar-window");

  // The chart box is 240px tall: 10px padding top and bottom, a 24px label
  // strip (fixed, so a two-line "now" label can't push its bar up) and a
  // 6px gap leave 190px of bar room. Everything below is placed in pixels
  // from the same numbers, so bars and the average line agree.
  var BAR_ROOM = 190;
  var BAR_FLOOR = 10 + 24 + 6; // padding + label strip + gap
  function barPx(value, max) {
    return Math.round(((value / max) * 0.82 + 0.08) * BAR_ROOM);
  }

  var TBAR_HINT =
    '<p class="tour-foot">Tap a bar to see its payments: paid, still due, or overdue. Tap it again to step back. The dashed line is the monthly average.</p>';

  function statusRow(r) {
    var st = ST[r[2]] || ST.due;
    return '<div class="mini-row"><span class="st ' + st[1] + '">' + st[0] +
      '</span><span class="mini-name">' + r[0] +
      '</span><span class="mini-amount">' + r[1] + "</span></div>";
  }

  function clearMonth() {
    tbars.classList.remove("has-sel");
    tbars.querySelectorAll(".tbar").forEach(function (t) { t.classList.remove("sel"); });
    tdetail.innerHTML = TBAR_HINT;
  }

  function renderWindow() {
    if (!tbars) return;
    var w = WINDOWS[windowIndex];
    twindow.textContent = w.label;
    tprev.disabled = windowIndex === 0;
    tnext.disabled = windowIndex === WINDOWS.length - 1;
    tbars.innerHTML = "";
    var max = Math.max.apply(null, w.totals);
    // The dashed average line, like the app's.
    var mean = w.totals.reduce(function (s, v) { return s + v; }, 0) / 12;
    var meanLine = document.createElement("div");
    meanLine.className = "tbar-mean";
    meanLine.style.bottom = BAR_FLOOR + barPx(mean, max) + "px";
    meanLine.innerHTML = "<span>avg ≈ CHF " + Math.round(mean) + "</span>";
    tbars.appendChild(meanLine);
    w.totals.forEach(function (value, i) {
      var b = document.createElement("button");
      b.className = "tbar" + (w.spikes[i] ? " spike" : "") + (w.now === i ? " now" : "");
      b.setAttribute("aria-label", MONTHS[i] + ", about " + value + " francs");
      var bar = document.createElement("i");
      bar.style.height = barPx(value, max) + "px";
      var label = document.createElement("span");
      label.innerHTML = w.now === i ? MONTHS[i] + "<em>now</em>" : MONTHS[i];
      b.appendChild(bar);
      b.appendChild(label);
      b.addEventListener("click", function () { selectMonth(i, b); });
      tbars.appendChild(b);
    });
    clearMonth();
  }

  function selectMonth(i, btn) {
    // A second tap on the selected bar steps back out.
    if (btn.classList.contains("sel")) { clearMonth(); return; }
    var w = WINDOWS[windowIndex];
    tbars.classList.add("has-sel");
    tbars.querySelectorAll(".tbar").forEach(function (t) { t.classList.remove("sel"); });
    btn.classList.add("sel");
    var d = w.details[i] || { title: MONTHS[i] + " · " + w.label.slice(-4), rows: w.fallback.rows, note: w.fallback.note };
    var html = "<h4>" + d.title + " · ≈ CHF " + w.totals[i] + "</h4>";
    d.rows.forEach(function (r) { html += statusRow(r); });
    html += '<p class="note">' + d.note + "</p>";
    tdetail.innerHTML = html;
  }

  if (tbars && tdetail && tprev && tnext) {
    tprev.addEventListener("click", function () { if (windowIndex > 0) { windowIndex--; renderWindow(); } });
    tnext.addEventListener("click", function () { if (windowIndex < WINDOWS.length - 1) { windowIndex++; renderWindow(); } });
    renderWindow();
  }

  // Step 4: donut. Slice totals are the demo list's committed monthly,
  // smoothed: yearlies in twelfths, EUR converted, splits and the paused
  // 3a excluded. Each slice knows the payments inside it for the detail
  // card on the right.
  var SLICES = [
    ["Housing & utilities", 1648, "#7FB8B0", [
      ["Rent", "", "CHF 1620"],
      ["SERAFE", "CHF 335 a year", "CHF 28"]
    ]],
    ["Finance", 599, "#6C8EBF", [
      ["Car loan", "€645.30 monthly", "CHF 597"],
      ["Account fee", "€2 · first Thursday", "CHF 1.85"]
    ]],
    ["Insurance", 289, "#B56576", [
      ["CSS Assurance", "", "CHF 289.40"]
    ]],
    ["Comms & sport", 99, "#8FBC94", [
      ["Basefit", "", "CHF 59"],
      ["Salt Home", "", "CHF 39.95"]
    ]],
    ["Transport & passes", 93, "#C9A66B", [
      ["TPG annual", "CHF 500 a year", "CHF 42"],
      ["MagicPass", "CHF 399 a year", "CHF 33"],
      ["Half-fare card", "CHF 120 a year", "CHF 10"],
      ["TCS", "CHF 96 a year", "CHF 8"]
    ]],
    ["Software", 25, "#9C8FC7", [
      ["ChatGPT Plus", "", "CHF 21.55"],
      ["Google One", "two accounts", "CHF 3.83"]
    ]]
  ];
  var donut = document.getElementById("donut");
  var legend = document.getElementById("donut-legend");
  var center = document.getElementById("donut-center");
  var ddetail = document.getElementById("donut-detail");
  var donutTotal = SLICES.reduce(function (sum, s) { return sum + s[1]; }, 0);
  var donutSel = -1;

  function renderSliceDetail() {
    if (!ddetail) return;
    if (donutSel === -1) {
      ddetail.innerHTML =
        '<p class="tour-foot">Tap a slice or its legend row to see what’s inside it.</p>';
      return;
    }
    var s = SLICES[donutSel];
    var html = '<h4><span class="swatch" style="background:' + s[2] + '"></span>' +
      s[0] + " · CHF " + s[1] + " /mo</h4>";
    s[3].forEach(function (r) {
      html += '<div class="mini-row"><span class="mini-name">' + r[0] + "</span>" +
        (r[1] ? '<span class="dd-sub">' + r[1] + "</span>" : "") +
        '<span class="mini-amount">' + r[2] + "</span></div>";
    });
    ddetail.innerHTML = html;
  }

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

  function selectSlice(i) {
    donutSel = donutSel === i ? -1 : i;
    legend.classList.toggle("has-sel", donutSel !== -1);
    legend.querySelectorAll("button").forEach(function (x, j) {
      x.classList.toggle("sel", j === donutSel);
    });
    paintDonut();
    renderSliceDetail();
  }

  if (donut && legend) {
    SLICES.forEach(function (s, i) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      var pct = Math.max(1, Math.round((s[1] / donutTotal) * 100));
      b.innerHTML = '<span class="swatch" style="background:' + s[2] + '"></span>' +
        s[0] + '<span class="amt">CHF ' + s[1] + '</span><span class="pct">' + pct + "%</span>";
      b.addEventListener("click", function () { selectSlice(i); });
      li.appendChild(b);
      legend.appendChild(li);
    });

    // The ring itself is tappable: angle from 12 o'clock picks the slice.
    donut.addEventListener("click", function (e) {
      var rect = donut.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      var r = Math.hypot(x, y);
      if (r < 60 || r > rect.width / 2) return; // the hole and outside miss
      var angle = (Math.atan2(y, x) * 180 / Math.PI + 90 + 360) % 360;
      var acc = 0;
      for (var i = 0; i < SLICES.length; i++) {
        acc += (SLICES[i][1] / donutTotal) * 360;
        if (angle <= acc) { selectSlice(i); return; }
      }
    });

    paintDonut();
  }
})();
