/* ---- Scroll reveals --------------------------------------------- */
import { hasGsap } from "../core/scroll.js";

var reveals = document.querySelectorAll(".reveal");
if (hasGsap) {
  reveals.forEach(function (el) {
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: function () { el.classList.add("is-in"); }
    });
  });
} else {
  reveals.forEach(function (el) { el.classList.add("is-in"); });
}
