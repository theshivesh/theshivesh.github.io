/* ---- Floating contextual CTA ------------------------------------ */
import { lenis } from "../core/scroll.js";

(function () {
  var cta = document.getElementById("floatingCta");
  if (!cta) return;
  var label = cta.querySelector(".cta-label");

  // section -> CTA copy + where it takes you
  var states = [
    { sel: ".hero", text: "See my work", target: "#work", up: false },
    { sel: "#work", text: "Let’s connect", target: "#contact", up: false },
    { sel: "#contact", text: "Back to top", target: "#top", up: true }
  ];
  var els = states.map(function (s) { return document.querySelector(s.sel); });
  var current = -1;

  function apply(i) {
    if (i === current) return;
    var first = current === -1;
    current = i;
    var st = states[i];
    cta.setAttribute("data-target", st.target);
    cta.classList.toggle("is-up", !!st.up);
    // first paint: set the label without the slide animation
    if (first) { label.textContent = st.text; return; }
    // slide the old label up and out
    label.classList.add("cta-out");
    setTimeout(function () {
      label.textContent = st.text;
      label.classList.remove("cta-out");
      label.classList.add("cta-in"); // drop below instantly (no transition)
      requestAnimationFrame(function () {
        label.classList.remove("cta-in"); // then glide up into place
      });
    }, 240);
  }

  function update() {
    var mid = window.innerHeight * 0.5;
    var idx = 0;
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el && el.getBoundingClientRect().top <= mid) idx = i;
    }
    apply(idx);
  }

  // Fog fade: the pill dissolves after 4s without scrolling, and
  // re-materializes the moment the user scrolls (or moves the pointer).
  var idleTimer = null;
  function wake() {
    cta.classList.remove("is-idle");
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      cta.classList.add("is-idle");
    }, 4000);
  }

  if (lenis) lenis.on("scroll", function () { update(); wake(); });
  window.addEventListener("scroll", function () { update(); wake(); }, { passive: true });
  window.addEventListener("resize", update);
  update();
  wake(); // start the idle countdown on load

  cta.addEventListener("click", function () {
    var t = document.querySelector(cta.getAttribute("data-target"));
    if (!t) return;
    if (lenis) lenis.scrollTo(t, { offset: -24 });
    else t.scrollIntoView({ behavior: "smooth" });
  });
})();
