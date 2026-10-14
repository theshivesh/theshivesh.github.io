// Shared scroll setup: GSAP ScrollTrigger (if loaded) and Lenis smooth
// scroll. Other modules import { lenis, hasGsap } from here.
// gsap, ScrollTrigger and Lenis are globals from the CDN scripts in the page.

export const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
if (hasGsap) gsap.registerPlugin(ScrollTrigger);

/* ---- Lenis smooth scroll ---------------------------------------- */
export let lenis = null;
if (typeof window.Lenis !== "undefined") {
  lenis = new Lenis({ lerp: 0.1, duration: 1.2, smoothWheel: true });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  if (hasGsap) lenis.on("scroll", ScrollTrigger.update);

  // Smooth in-page anchor navigation (#work, #about, #contact)
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (!id || id === "#") return;
    var el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    lenis.scrollTo(el, { offset: -24 });
  });
}
