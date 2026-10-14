/* ---- Hero gradient spotlight (follows the cursor) --------------- */
(function () {
  var wrap = document.getElementById("heroTitle");
  if (!wrap || !window.matchMedia("(pointer: fine)").matches) return;
  var raf = null, px = 0, py = 0;
  function apply() {
    raf = null;
    wrap.style.setProperty("--mx", px + "px");
    wrap.style.setProperty("--my", py + "px");
  }
  wrap.addEventListener("pointermove", function (e) {
    var r = wrap.getBoundingClientRect();
    px = e.clientX - r.left;
    py = e.clientY - r.top;
    if (!raf) raf = requestAnimationFrame(apply);
  });
  wrap.addEventListener("pointerenter", function () {
    wrap.style.setProperty("--spot", "1");
  });
  wrap.addEventListener("pointerleave", function () {
    wrap.style.setProperty("--spot", "0");
  });
})();
