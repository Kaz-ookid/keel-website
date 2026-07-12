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
})();
