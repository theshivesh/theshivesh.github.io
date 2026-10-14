/* ---- Mobile header: hide on scroll-down, reveal otherwise -------- */
// On small screens the sidebar is a sticky top bar. Hide it while the
// user scrolls down (out of the way), and bring it back when they scroll
// up, pause, or reach the very top or bottom of the page.
import { lenis } from "../core/scroll.js";

(function () {
  var bar = document.querySelector(".sidebar");
  if (!bar) return;
  var mq = window.matchMedia("(max-width: 1023px)");
  var lastY = window.scrollY || 0;
  var idleTimer = null;
  var HIDE_AFTER = 80; // don't hide until scrolled past the header zone
  var DELTA = 6;       // ignore sub-pixel jitter

  function show() { bar.classList.remove("nav-hidden"); }
  function hide() { bar.classList.add("nav-hidden"); }
  function atBottom() {
    return window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4;
  }

  function onScroll() {
    if (!mq.matches) { show(); return; } // desktop: always visible
    var y = window.scrollY || 0;
    var diff = y - lastY;
    if (y <= HIDE_AFTER || atBottom()) show();
    else if (diff > DELTA) hide();       // scrolling down
    else if (diff < -DELTA) show();      // scrolling up
    lastY = y;
    // reveal again once scrolling settles
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(show, 220);
  }

  if (lenis) lenis.on("scroll", onScroll);
  window.addEventListener("scroll", onScroll, { passive: true });
  if (mq.addEventListener) mq.addEventListener("change", show);
})();
