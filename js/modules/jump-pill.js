/* ---- Sticky "jump to next section" pill -------------------------- */
import { lenis } from "../core/scroll.js";

(function () {
  var pill = document.querySelector(".section-jump");
  if (!pill) return;
  var labelEl = pill.querySelector(".section-jump-label");
  var targets = [].slice.call(
    document.querySelectorAll(".case-overview, .case-section, .more-work")
  );
  if (!targets.length) return;
  var current = null;

  function labelOf(t) {
    var l = t.querySelector(".section-label");
    return l ? l.textContent.trim() : "Next";
  }
  function update() {
    var threshold = 150;
    var next = null;
    for (var i = 0; i < targets.length; i++) {
      if (targets[i].getBoundingClientRect().top > threshold) {
        next = targets[i];
        break;
      }
    }
    pill.hidden = false;
    if (next) {
      current = next;
      labelEl.textContent = labelOf(next);
      pill.classList.remove("is-top");
    } else {
      current = null;
      labelEl.textContent = "Back to top";
      pill.classList.add("is-top");
    }
  }
  pill.addEventListener("click", function () {
    if (current) {
      if (lenis) lenis.scrollTo(current, { offset: -70 });
      else current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
  update();
  window.addEventListener("scroll", update, { passive: true });
  if (lenis) lenis.on("scroll", update);
  window.addEventListener("resize", update);
})();
