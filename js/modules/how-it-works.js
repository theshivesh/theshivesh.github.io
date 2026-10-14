/* ---- Case study: "How it works" steps ---------------------------------
 * Hover, focus or tap a step to make it active and show its screenshot.
 * While the section is on screen it moves through the steps on its own,
 * until the visitor points at or taps it. */
(function () {
  document.querySelectorAll("[data-hiw]").forEach(function (root) {
    var steps = Array.prototype.slice.call(root.querySelectorAll(".hiw-step"));
    var shots = root.querySelectorAll(".hiw-shot");
    var current = 0, timer = null, touched = false;

    function show(i) {
      current = i;
      steps.forEach(function (s, k) {
        s.classList.toggle("is-on", k === i);
        s.setAttribute("aria-pressed", k === i ? "true" : "false");
      });
      var shot = +steps[i].getAttribute("data-shot");
      shots.forEach(function (img, k) { img.classList.toggle("is-on", k === shot); });
    }
    function stop() {
      touched = true;
      clearInterval(timer);
      timer = null;
    }

    steps.forEach(function (s, i) {
      s.addEventListener("click", function () { stop(); show(i); });
      s.addEventListener("focus", function () { show(i); });
      s.addEventListener("pointerenter", function (e) {
        if (e.pointerType === "mouse") { stop(); show(i); }
      });
    });

    if (!("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (visible && !timer && !touched) {
        timer = setInterval(function () { show((current + 1) % steps.length); }, 4000);
      } else if (!visible && timer) {
        clearInterval(timer);
        timer = null;
      }
    }, { threshold: 0.3 }).observe(root);
  });
})();
