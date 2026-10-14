/* ---- Home scroll-spy: highlight the aside link in view ---------- */
// While a case study block crosses the middle of the screen, its link in
// the aside gets .nav-item--reading; the rest fade back (.is-spying).
import { lenis } from "../core/scroll.js";

(function () {
  var list = document.querySelector(".nav-list");
  var blocks = document.querySelectorAll(".sw");
  if (!list || !blocks.length) return;
  var pairs = [];
  blocks.forEach(function (b) {
    var stage = b.querySelector(".sw-stage");
    var href = stage && (stage.getAttribute("href") || stage.getAttribute("data-href"));
    var link = href && list.querySelector('a[href$="' + href + '"]');
    if (link) pairs.push({ block: b, link: link });
  });
  var current = null, queued = false;
  var mobile = window.matchMedia("(max-width: 1023px)");

  function update() {
    queued = false;
    var mid = window.innerHeight * 0.5, hit = null;
    for (var i = 0; i < pairs.length; i++) {
      var r = pairs[i].block.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid - 64) { hit = pairs[i]; } // gap counts as the block above
    }
    if (hit === current) return;
    if (current) current.link.classList.remove("nav-item--reading");
    current = hit;
    list.classList.toggle("is-spying", !!hit);
    if (!hit) return;
    hit.link.classList.add("nav-item--reading");
    // Mobile top bar scrolls sideways: bring the pill into view
    if (mobile.matches && list.scrollWidth > list.clientWidth) {
      var x = hit.link.offsetLeft - (list.clientWidth - hit.link.offsetWidth) / 2;
      list.scrollTo({ left: Math.max(0, x), behavior: "smooth" });
    }
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  if (lenis) lenis.on("scroll", queue);
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  update();
})();
