/* ---- Custom cursor (desktop only) ------------------------------- */
(function () {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  var dot = document.querySelector(".cursor-dot");
  if (!dot) return;

  var x = window.innerWidth / 2, y = window.innerHeight / 2, tx = x, ty = y;

  window.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; });
  window.addEventListener("mouseover", function (e) {
    var t = e.target.closest && e.target.closest('a, button, [role="button"], input, label');
    dot.classList.toggle("is-hover", !!t);
  });
  document.documentElement.classList.add("has-custom-cursor");

  (function loop() {
    x += (tx - x) * 0.2;
    y += (ty - y) * 0.2;
    dot.style.transform = "translate(" + x + "px, " + y + "px)";
    requestAnimationFrame(loop);
  })();
})();
