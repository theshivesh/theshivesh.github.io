/* ---- Global scroll-progress bar --------------------------------- */
import { lenis } from "../core/scroll.js";

(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var bar = document.createElement("div");
  bar.className = "scroll-progress";
  document.body.appendChild(bar);
  var raf = null;
  function paint() {
    raf = null;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var p = max > 0 ? (window.scrollY || doc.scrollTop || 0) / max : 0;
    if (p < 0) p = 0; else if (p > 1) p = 1;
    bar.style.transform = "scaleX(" + p + ")";
  }
  // Poll on a rAF loop rather than the scroll event: under Lenis, native
  // "scroll" events don't fire reliably, which would freeze the bar.
  var lastY = -1;
  (function tick() {
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    if (y !== lastY) { lastY = y; paint(); }
    requestAnimationFrame(tick);
  })();
  if (lenis) lenis.on("scroll", paint);
  window.addEventListener("resize", paint);
})();
