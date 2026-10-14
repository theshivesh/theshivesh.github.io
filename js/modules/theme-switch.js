/* ---- Theme switch with a sneak peek ----------------------------- */
// The toggle floats top-right and slips away while the page scrolls.
// Hovering it opens a wavy window in the top-right corner that previews
// the other theme (an inverted backdrop). Clicking grows that
// wave across the screen: with View Transitions the real new theme is
// revealed through the same wave shape, otherwise it just swaps.
(function () {
  var root = document.documentElement;
  var btn = document.querySelector(".theme-switch");
  if (!btn) return;

  function isDark() { return root.getAttribute("data-theme") === "dark"; }
  function sync() { btn.setAttribute("aria-checked", isDark() ? "true" : "false"); }
  sync(); // reflect the theme set by the no-flash head script

  function apply(next) {
    if (next === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    try { localStorage.setItem("theme", next); } catch (e) {}
    sync();
  }

  // Quarter-circle wave anchored at the top-right corner
  var AMP = 10, LOBES = 22;
  function wave(r, phase) {
    var W = document.documentElement.clientWidth, pts = [W + "px 0px"];
    for (var i = 0; i <= 48; i++) {
      var t = (i / 48) * Math.PI / 2;
      var rr = Math.max(0, r + (r > 1 ? AMP * Math.sin(t * LOBES + phase) : 0));
      pts.push((W - rr * Math.sin(t)).toFixed(1) + "px " + (rr * Math.cos(t)).toFixed(1) + "px");
    }
    return "polygon(" + pts.join(",") + ")";
  }

  var peek = document.createElement("div");
  peek.className = "theme-peek";
  peek.setAttribute("aria-hidden", "true");
  document.body.appendChild(peek);

  var r = 0, target = 0, phase = 0, raf = 0, last = 0;
  function peekSize() { return Math.max(212, Math.min(375, Math.min(window.innerWidth, window.innerHeight) * 0.425)); }
  function frame(now) {
    var dt = Math.min(50, now - (last || now)); last = now;
    phase += dt * 0.004;
    r += (target - r) * 0.12;
    peek.style.clipPath = wave(r, phase);
    peek.classList.toggle("is-on", r > 1);
    if (target > 0 || r > 1) raf = requestAnimationFrame(frame);
    else { raf = 0; last = 0; r = 0; peek.style.clipPath = wave(0, 0); }
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  btn.addEventListener("pointerenter", function (e) {
    if (e.pointerType !== "mouse") return;
    target = peekSize(); kick();
  });
  btn.addEventListener("pointerleave", function () { target = 0; kick(); });
  btn.addEventListener("focus", function () { if (btn.matches(":focus-visible")) { target = peekSize(); kick(); } });
  btn.addEventListener("blur", function () { target = 0; kick(); });

  // Slip away while scrolling, come back once it settles
  var away = null;
  function onScroll() {
    btn.classList.add("is-away");
    target = 0; kick();
    clearTimeout(away);
    away = setTimeout(function () { btn.classList.remove("is-away"); }, 650);
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  btn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    var from = Math.max(r, 0), ph = phase;
    var full = Math.hypot(window.innerWidth, window.innerHeight) + AMP * 2;
    target = 0; r = 0; peek.classList.remove("is-on");
    if (!document.startViewTransition) { apply(next); return; }
    root.classList.add("theme-vt");
    var vt = document.startViewTransition(function () { apply(next); });
    vt.ready.then(function () {
      var frames = [];
      for (var i = 0; i <= 24; i++) {
        var k = i / 24, e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        frames.push({ clipPath: wave(from + (full - from) * e, ph + k * 6) });
      }
      root.animate(frames, { duration: 900, easing: "linear", pseudoElement: "::view-transition-new(root)" });
    }).catch(function () {});
    vt.finished.finally(function () { root.classList.remove("theme-vt"); });
  });
})();
