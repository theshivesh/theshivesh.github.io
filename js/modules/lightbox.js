/* ---- Image lightbox --------------------------------------------- */
// Click a screenshot, book cover or photo tile to zoom it into a full-
// screen overlay. Closes on the ✕ button, a click anywhere off the
// image, or Escape.
import { lenis } from "../core/scroll.js";

(function () {
  var SEL = ".fig-frame img, .book-cover img, .photo-tile, .daily-shot img, .about-grid img";
  var overlay, imgEl, capEl, lastFocus;
  function blockScroll(e) { e.preventDefault(); }

  function build() {
    overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Close image">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>' +
      "</button>" +
      '<figure class="lightbox-fig">' +
        '<img class="lightbox-img" alt="">' +
        '<figcaption class="lightbox-cap"></figcaption>' +
      "</figure>";
    imgEl = overlay.querySelector(".lightbox-img");
    capEl = overlay.querySelector(".lightbox-cap");
    document.body.appendChild(overlay);

    // Any click that isn't on the image itself closes the overlay.
    overlay.addEventListener("click", function (e) {
      if (!(e.target.closest && e.target.closest(".lightbox-img"))) close();
    });
  }

  function sourceOf(el) {
    if (el.tagName === "IMG") {
      return { src: el.currentSrc || el.src, alt: el.alt || "", cap: el.alt || "" };
    }
    // A .photo-tile paints its image as a CSS background.
    var bg = getComputedStyle(el).backgroundImage;
    var m = bg && bg.match(/url\(["']?(.*?)["']?\)/);
    return { src: m ? m[1] : "", alt: el.getAttribute("aria-label") || "", cap: "" };
  }

  function open(el) {
    if (!overlay) build();
    var info = sourceOf(el);
    if (!info.src) return;
    imgEl.src = info.src;
    imgEl.alt = info.alt;
    if (info.cap) {
      capEl.textContent = info.cap;
      capEl.style.display = "";
    } else {
      capEl.style.display = "none";
    }
    lastFocus = document.activeElement;
    // Freeze the page without moving it: pause Lenis, hide overflow, and
    // swallow scroll gestures. No layout change, so nothing shifts or "zooms".
    if (lenis && lenis.stop) lenis.stop();
    document.body.classList.add("lightbox-lock");
    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    overlay.querySelector(".lightbox-close").focus({ preventScroll: true });
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-lock");
    window.removeEventListener("wheel", blockScroll, { passive: false });
    window.removeEventListener("touchmove", blockScroll, { passive: false });
    if (lenis && lenis.start) lenis.start();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    setTimeout(function () {
      if (!overlay.classList.contains("is-open")) imgEl.src = "";
    }, 280);
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest(SEL);
    if (!t || t.closest("a")) return; // don't hijack images inside links
    e.preventDefault();
    open(t);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay && overlay.classList.contains("is-open")) close();
  });
})();
