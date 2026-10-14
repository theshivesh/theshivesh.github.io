/* ---- More-work carousel arrows ---------------------------------- */
(function () {
  // The track uses mandatory scroll snap, which fights a frame-by-frame
  // tween (every scrollLeft write gets snapped, so the glide stutters).
  // So: switch snap off while gliding, land exactly on a card's snap
  // point, then switch it back on. Repeated clicks chain from where the
  // track is heading, not from where it is mid-glide.
  var DUR = 520;

  // each card's snap position: its left edge, minus the scroll padding
  function stops(track) {
    var pad = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    var base = track.getBoundingClientRect().left - track.scrollLeft;
    var max = track.scrollWidth - track.clientWidth;
    return Array.prototype.map.call(track.querySelectorAll(".mw-card"), function (c) {
      return Math.max(0, Math.min(max, c.getBoundingClientRect().left - base - pad));
    });
  }
  function nearest(list, x) {
    var best = 0;
    list.forEach(function (v, i) { if (Math.abs(v - x) < Math.abs(list[best] - x)) best = i; });
    return best;
  }
  function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }

  function glide(track, dir) {
    var list = stops(track);
    if (!list.length) return;
    var from = track._goal != null ? track._goal : track.scrollLeft;
    var i = nearest(list, from);
    // skip stops that land on the same spot (the last cards all hit max)
    var to = list[i];
    for (var k = i + dir; k >= 0 && k < list.length; k += dir) {
      if (Math.abs(list[k] - to) > 1) { to = list[k]; break; }
    }
    if (to === track._goal) return;

    cancelAnimationFrame(track._raf);
    track._goal = to;
    track.style.scrollSnapType = "none";
    var start = track.scrollLeft, t0 = performance.now();
    (function frame(now) {
      var p = Math.min(1, (now - t0) / DUR);
      track.scrollLeft = start + (to - start) * ease(p);
      if (p < 1) { track._raf = requestAnimationFrame(frame); return; }
      track._goal = null;
      track.style.scrollSnapType = "";
    })(t0);
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".carousel-btn");
    if (!btn) return;
    var section = btn.closest(".more-work");
    var track = section && section.querySelector("[data-carousel]");
    if (track) glide(track, parseInt(btn.getAttribute("data-dir"), 10));
  });
})();
