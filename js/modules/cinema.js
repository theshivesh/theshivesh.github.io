/* ---- Cinematic fig-list: full-viewport 3D genie slideshow -------- */
// Turns each case-study screenshot gallery (.fig-list) into a pinned,
// scroll-scrubbed stage. As you reach it, the first design rises from
// the bottom, tilts into a flat, edge-to-edge frame with its caption,
// then genies upward as the next one climbs in behind it. Desktop +
// fine pointer + motion-allowed only; everywhere else the normal
// stacked layout is left completely untouched.
import { lenis } from "../core/scroll.js";

(function () {
  var lists = document.querySelectorAll(".fig-list");
  if (!lists.length) return;

  var _force = location.search.indexOf("fx=1") > -1;
  var wide = window.matchMedia("(min-width: 1024px)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!(wide && fine && (_force || !reduce))) {
    console.log(
      "[figcinema] skipped —" +
      (!wide ? " screen<1024px" : "") +
      (!fine ? " no-fine-pointer" : "") +
      (reduce ? " reduce-motion-ON (add ?fx=1 to force)" : "") +
      " | lists=" + lists.length
    );
    return;
  }
  console.log("[figcinema] active, galleries=", lists.length);

  var LEAD = 0.7; // slide-units the first design travels in before centering
  var TAIL = 0.5; // slide-units the last design lifts away before release
  // scroll length per design (viewport heights) — quicker for big galleries
  // so an 11-shot set doesn't turn into an endless scroll.
  function perFor(n) { return n > 7 ? 0.5 : n > 4 ? 0.58 : 0.66; }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  var stages = [];

  lists.forEach(function (list) {
    var figs = [].slice.call(list.querySelectorAll(".fig"));
    if (figs.length < 2) return; // a single shot isn't a slideshow

    var cinema = document.createElement("div");
    cinema.className = "figcinema";
    cinema.setAttribute("data-count", figs.length);

    var stage = document.createElement("div");
    stage.className = "figcinema-stage";
    var scene = document.createElement("div");
    scene.className = "figcinema-scene";

    figs.forEach(function (fig) {
      fig.classList.add("figcinema-slide");
      var img = fig.querySelector("img");
      if (img) { img.loading = "eager"; img.decoding = "async"; }
      scene.appendChild(fig);
    });
    stage.appendChild(scene);

    var hud = document.createElement("div");
    hud.className = "figcinema-hud";
    hud.innerHTML =
      '<span class="figcinema-num"><b class="fc-i">1</b><i>/</i>' +
      '<span class="fc-n">' + pad(figs.length) + "</span></span>" +
      '<span class="figcinema-hint">Scroll</span>';
    stage.appendChild(hud);

    var rail = document.createElement("div");
    rail.className = "figcinema-rail";
    rail.innerHTML = "<span></span>";
    stage.appendChild(rail);

    cinema.appendChild(stage);

    // A .reveal ancestor's translateY entrance would trap position:sticky in
    // a transformed containing block. Pin its transform to none (inline wins
    // over the stylesheet) so the section still fades in via opacity while
    // the sticky stage stays anchored to the viewport.
    var rev = list.closest(".reveal");
    if (rev) rev.style.transform = "none";

    list.parentNode.replaceChild(cinema, list);

    stages.push({
      el: cinema,
      stage: stage,
      caseEl: cinema.closest(".case") || document.body,
      slides: figs,
      count: figs.length,
      units: (figs.length - 1) + LEAD + TAIL,
      per: perFor(figs.length),
      numEl: hud.querySelector(".fc-i"),
      railEl: rail.querySelector("span"),
      lastIdx: -1
    });
  });

  if (!stages.length) return;

  // Continuous transform for a slide at signed distance d from centre.
  // d = 0 centred, flat, edge-to-edge; d > 0 waiting below; d < 0 gone above.
  function slideStyle(d) {
    var ad = d < 0 ? -d : d;
    if (ad > 1.18) return { o: 0 };

    var ty, rx, sy, sx, blur;
    if (d >= 0) {
      // incoming from below: tilted back, flattening as it centres
      ty = d * 58;      // vh
      rx = d * 9;       // deg
      sy = 1;
      sx = 1 - d * 0.04;
      blur = d * 2.5;
    } else {
      // leaving upward with a genie squash + curl
      ty = d * 52;      // vh (negative -> up)
      rx = d * -15;     // deg (curls away)
      sy = 1 + d * 0.30; // compress toward a point
      sx = 1 + d * 0.10;
      blur = -d * 6;
    }
    var scale = 1 - ad * 0.03;
    sx *= scale;
    sy *= scale;

    var o = 1;
    if (d > 0.82) o = Math.max(0, 1 - (d - 0.82) / 0.34);
    else if (d < -0.82) o = Math.max(0, 1 - (-d - 0.82) / 0.34);

    var tf =
      "translate(-50%, -50%) translate3d(0, " + ty.toFixed(2) + "vh, " +
      (-ad * 150).toFixed(1) + "px) rotateX(" + rx.toFixed(2) + "deg) scale(" +
      sx.toFixed(4) + ", " + sy.toFixed(4) + ")";
    return { o: o, tf: tf, blur: blur };
  }

  function measure() {
    stages.forEach(function (s) {
      var cr = s.caseEl.getBoundingClientRect();
      var mr = s.el.getBoundingClientRect();
      s.stage.style.width = cr.width + "px";
      s.stage.style.marginLeft = (cr.left - mr.left) + "px";
    });
  }

  function layout() {
    var vh = window.innerHeight;
    stages.forEach(function (s) {
      s.el.style.setProperty("--fc-h", (vh + s.units * s.per * vh) + "px");
    });
    measure();
    render();
  }

  function render() {
    var vh = window.innerHeight;
    stages.forEach(function (s) {
      var rect = s.el.getBoundingClientRect();
      var travel = s.el.offsetHeight - vh;
      var p = travel > 0 ? -rect.top / travel : 0;
      if (p < 0) p = 0; else if (p > 1) p = 1;

      var pos = -LEAD + p * s.units; // continuous position in slide-space

      for (var i = 0; i < s.count; i++) {
        var el = s.slides[i];
        var st = slideStyle(i - pos);
        if (st.o <= 0.001) {
          if (el.style.visibility !== "hidden") {
            el.style.opacity = "0";
            el.style.visibility = "hidden";
          }
          continue;
        }
        el.style.visibility = "visible";
        el.style.opacity = st.o.toFixed(3);
        el.style.transform = st.tf;
        el.style.filter = st.blur > 0.05 ? "blur(" + st.blur.toFixed(2) + "px)" : "none";
      }

      var live = rect.top <= vh * 0.5 && rect.bottom >= vh * 0.5;
      s.el.classList.toggle("is-live", live);
      var idx = Math.round(pos);
      if (idx < 0) idx = 0; else if (idx > s.count - 1) idx = s.count - 1;
      if (idx !== s.lastIdx) { s.numEl.textContent = pad(idx + 1); s.lastIdx = idx; }
      var fill = s.count > 1 ? pos / (s.count - 1) : 1;
      if (fill < 0) fill = 0; else if (fill > 1) fill = 1;
      s.railEl.style.transform = "scaleX(" + fill.toFixed(4) + ")";
      s.el.classList.toggle("is-end", pos > s.count - 1.2);
    });
  }

  // Drive the scrub from a rAF loop that watches scrollY, not from scroll
  // events: under Lenis native "scroll" events are unreliable and would
  // leave the slideshow frozen on the first frame.
  var lastY = -1;
  (function tick() {
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    if (y !== lastY) { lastY = y; render(); }
    requestAnimationFrame(tick);
  })();
  if (lenis) lenis.on("scroll", render); // second driver, per Lenis frame

  var rt = null;
  window.addEventListener("resize", function () {
    if (rt) clearTimeout(rt);
    rt = setTimeout(layout, 120);
  });

  // Recompute once images settle to their real size.
  stages.forEach(function (s) {
    s.slides.forEach(function (fig) {
      var img = fig.querySelector("img");
      if (img && !img.complete) img.addEventListener("load", layout, { once: true });
    });
  });

  layout();
})();
