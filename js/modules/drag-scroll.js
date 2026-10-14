/* ---- Drag to scroll: sideways strips (journey map) with a mouse ---------
 * Also marks whether there's more to see on each side (.can-left /
 * .can-right), which the CSS uses to fade that edge out. */
(function () {
  document.querySelectorAll("[data-drag-scroll]").forEach(function (el) {
    var startX = 0, startLeft = 0, down = false;
    function edges() {
      var max = el.scrollWidth - el.clientWidth;
      el.classList.toggle("can-left", el.scrollLeft > 2);
      el.classList.toggle("can-right", el.scrollLeft < max - 2);
    }
    edges();
    el.addEventListener("scroll", edges, { passive: true });
    window.addEventListener("resize", edges);
    el.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      el.classList.add("is-dragging");
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      el.scrollLeft = startLeft - (e.clientX - startX);
    });
    window.addEventListener("pointerup", function () {
      down = false;
      el.classList.remove("is-dragging");
    });
  });
})();
