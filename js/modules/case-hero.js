/* ---- Case hero: the real screens as a walkthrough film -------------
 * Markup comes from PROTOS in build/generate.mjs. The screens play like a
 * screen recording: the page scrolls to where the action is, the cursor
 * moves over, the camera eases in a little, the cursor taps, and the next
 * screen fades in from its top over the zoomed view. One clock drives
 * everything, so pause and seek keep the camera, cursor and progress bar
 * in step. Click the screen or the button to pause, click the bar or use
 * the arrow keys to jump between screens. Plays only while on screen.
 * Heroes with a `still` (Picto, Headlines, Visualise AI, Stck Sign-up
 * Fix) are one static screen. The Earnings hero is a before / after slider instead. */
(function () {
  var hero = document.querySelector(".case-hero--proto");
  if (!hero) return;

  // a still screen has nothing to play
  if (hero.classList.contains("case-hero--still")) return;

  /* ---- Before / after slider ---------------------------------------- */
  var cmp = hero.querySelector("[data-compare]");
  if (cmp) {
    var range = cmp.querySelector(".pr-cmp-range");
    var touched = false, seen = false, timer = 0, dir = 1;
    function setPos(v) { cmp.style.setProperty("--pos", v + "%"); range.value = v; }
    range.addEventListener("input", function () { setPos(range.value); });
    ["pointerdown", "keydown"].forEach(function (t) {
      cmp.addEventListener(t, function () { touched = true; clearTimeout(timer); });
    });
    // until touched, sweep the divider back and forth once in a while
    function sweep() {
      if (touched || !seen) return;
      var from = +range.value, to = dir > 0 ? 82 : 18, t0 = performance.now();
      dir = -dir;
      (function step(t) {
        if (touched) return;
        var p = Math.min(1, (t - t0) / 1400), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        setPos(Math.round(from + (to - from) * e));
        if (p < 1) requestAnimationFrame(step); else timer = setTimeout(sweep, 1600);
      })(t0);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        seen = en[0].isIntersecting;
        clearTimeout(timer);
        if (seen && !touched) timer = setTimeout(sweep, 1200);
      }, { threshold: 0.4 }).observe(hero);
    }
    return;
  }

  /* ---- Walkthrough film -------------------------------------------- */
  var screens = hero.querySelector(".pr-screens");
  var steps = Array.prototype.slice.call(hero.querySelectorAll(".pr-step"));
  var cursor = hero.querySelector(".pr-cursor");
  var flash = hero.querySelector(".pr-flash");
  var playBtn = hero.querySelector(".pr-play");
  var track = hero.querySelector(".pr-track"), fill = hero.querySelector(".pr-fill");
  var num = hero.querySelector(".pr-num"), text = hero.querySelector(".pr-text");
  var name = hero.querySelector(".pr-name"), tip = hero.querySelector(".pr-tip");
  var ZOOM = +screens.getAttribute("data-zoom") || 1.3;
  var n = steps.length;

  // Beats inside a step with an action (ms from the start of the step)
  var FADE = 600, SCROLL0 = 450, SCROLL1 = 1650, MOVE0 = 1350, MOVE1 = 2300,
      IN0 = 2000, IN1 = 3100, TAP = 3200, HOT_D = 3900;

  var data = steps.map(function (el) {
    var h = el.getAttribute("data-hot");
    var auto = +el.getAttribute("data-auto");
    return {
      el: el,
      shot: el.querySelector(".pr-shot"),
      hot: h ? h.split(",").map(Number) : null,
      dur: h ? HOT_D : Math.max(auto || 1500, 1200) + FADE + 300,
      name: el.getAttribute("data-name"),
      tip: el.getAttribute("data-tip"),
    };
  });
  var starts = [], total = 0;
  data.forEach(function (d) { starts.push(total); total += d.dur; });

  // chapter ticks on the bar
  starts.slice(1).forEach(function (t) {
    var tick = document.createElement("i");
    tick.className = "pr-tick";
    tick.style.left = (t / total) * 100 + "%";
    track.appendChild(tick);
  });

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(p) { p = clamp(p, 0, 1); return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function span(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }

  // Layout, read without transforms: stage size, each shot's box and its
  // action point, in stage pixels.
  var W = 0, H = 0;
  function measure() {
    W = screens.clientWidth; H = screens.clientHeight;
    data.forEach(function (d) {
      var s = d.shot;
      var x = s.offsetLeft + s.clientLeft, y = s.offsetTop + s.clientTop;
      d.box = { x: x, y: y, w: s.clientWidth, h: s.clientHeight };
      d.pt = d.hot ? { x: x + d.hot[0] * s.clientWidth, y: y + d.hot[1] * s.clientHeight } : { x: W / 2, y: H / 2 };
      // how far the page scrolls to bring the action into view
      d.sy = clamp(d.pt.y - H * 0.55, 0, Math.max(0, y + s.clientHeight - H));
      d.cam = d.hot ? target(d) : null;
    });
  }
  // Where the camera ends up when zoomed on a step: the action point as
  // close to the centre as it can be without showing past the screen edge.
  function axis(stage, from, size, pt, z) {
    if (size * z <= stage) return stage / 2 - (from + size / 2) * z;
    return clamp(stage / 2 - pt * z, stage - (from + size) * z, -from * z);
  }
  function target(d) {
    // the action is zoomed toward the middle, from where the scroll left it
    var mid = { x: W / 2, y: clamp(d.pt.y - d.sy, H * 0.3, H * 0.7) };
    return {
      x: d.box.w * ZOOM <= W ? axis(W, d.box.x, d.box.w, d.pt.x, ZOOM) : clamp(mid.x - d.pt.x * ZOOM, W - (d.box.x + d.box.w) * ZOOM, -d.box.x * ZOOM),
      y: d.box.h * ZOOM <= H ? axis(H, d.box.y, d.box.h, d.pt.y, ZOOM) : clamp(mid.y - d.pt.y * ZOOM, H - (d.box.y + d.box.h) * ZOOM, -d.box.y * ZOOM),
    };
  }

  // Camera for step i at time t: zoom z and offset (x, y).
  function cam(i, t) {
    var d = data[i];
    if (!d.hot) {
      // a slow push in on screens that play by themselves
      var z = 1 + 0.045 * ease(t / d.dur);
      return { z: z, x: (W / 2) * (1 - z), y: (H / 2) * (1 - z) };
    }
    var sy = d.sy * ease(span(t, SCROLL0, SCROLL1));
    // stays zoomed after the tap; the next screen fades in over it
    var a = ease(span(t, IN0, IN1));
    var z1 = 1 + (ZOOM - 1) * a;
    // move the action point on a straight line to where it settles
    var px = d.pt.x + (d.pt.x * ZOOM + d.cam.x - d.pt.x) * a;
    var py = d.pt.y - sy + (d.pt.y * ZOOM + d.cam.y - d.pt.y + sy) * a;
    return { z: z1, x: px - d.pt.x * z1, y: py - d.pt.y * z1 };
  }
  // A new screen starts framed exactly like the last frame of the one
  // before (so similar screens don't jump while they crossfade), then eases
  // into its own camera.
  var HAND0 = 250, HAND1 = 1300;
  function shot(i, t) {
    var c = cam(i, t), b = ease(span(t, HAND0, HAND1));
    if (b >= 1) return c;
    var p = data[(i - 1 + n) % n], e = cam((i - 1 + n) % n, p.dur);
    return { z: e.z + (c.z - e.z) * b, x: e.x + (c.x - e.x) * b, y: e.y + (c.y - e.y) * b };
  }
  function put(el, c) {
    el.style.transform = "translate3d(" + c.x.toFixed(2) + "px," + c.y.toFixed(2) + "px,0) scale(" + c.z.toFixed(4) + ")";
  }

  var cur = -1, clock = FADE, from = null, here = null, shown = -1;

  function caption(i) {
    if (shown === i) return;
    shown = i;
    num.textContent = i + 1 + "/" + n;
    name.textContent = data[i].name;
    tip.textContent = data[i].tip;
    track.setAttribute("aria-valuenow", i + 1);
    track.setAttribute("aria-valuetext", data[i].name);
    text.classList.remove("is-in"); void text.offsetWidth; text.classList.add("is-in");
  }

  function render() {
    var i = 0;
    while (i < n - 1 && clock >= starts[i + 1]) i++;
    var t = clock - starts[i], d = data[i];
    if (i !== cur) {
      // the cursor sets off from wherever it last was on screen
      from = here || { x: W * 0.82, y: H * 0.88 };
      cur = i;
      caption(i);
    }
    var p = (i - 1 + n) % n;
    steps.forEach(function (el, k) {
      var on = k === i || (k === p && t < FADE);
      el.classList.toggle("is-on", on);
      el.style.zIndex = k === i ? 2 : 1;
    });
    // new screen fades in over the last frame of the one before
    d.el.style.opacity = ease(t / FADE);
    if (t < FADE) { data[p].el.style.opacity = 1; put(data[p].el, cam(p, data[p].dur)); }

    var c = shot(i, t);
    put(d.el, c);

    // cursor (screen space): stays put while the page scrolls under it,
    // then glides onto the action and rides the zoom
    var cx = from.x, cy = from.y, co = 1;
    if (d.hot) {
      var m = ease(span(t, MOVE0, MOVE1));
      cx += (d.pt.x * c.z + c.x - cx) * m;
      cy += (d.pt.y * c.z + c.y - cy) * m;
      co = span(t, 0, 300);
    } else {
      co = 1 - span(t, 0, 350);
    }
    here = { x: cx, y: cy };
    var press = t > TAP && t < TAP + 260 ? 0.8 + 0.2 * Math.abs((t - TAP - 130) / 130) : 1;
    cursor.style.opacity = co;
    cursor.style.transform = "translate3d(" + (cx - 4).toFixed(2) + "px," + (cy - 2).toFixed(2) + "px,0) scale(" + press + ")";

    fill.style.transform = "scaleX(" + (clock / total).toFixed(4) + ")";
  }

  var playing = true, visible = false, raf = 0, last = 0;
  function loop(now) {
    var dt = Math.min(now - last, 64);
    last = now;
    clock = (clock + dt) % total;
    render();
    raf = requestAnimationFrame(loop);
  }
  function sync() {
    var run = playing && visible && !document.hidden;
    if (run && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
    hero.classList.toggle("is-paused", !playing);
    playBtn.setAttribute("aria-label", playing ? "Pause walkthrough" : "Play walkthrough");
  }
  function toggle() {
    playing = !playing;
    flash.classList.toggle("is-play", playing);
    flash.classList.remove("is-on"); void flash.offsetWidth; flash.classList.add("is-on");
    sync();
  }
  function seek(ms) { clock = clamp(ms, 0, total - 1); render(); }
  playBtn.addEventListener("click", toggle);
  screens.addEventListener("click", toggle);
  track.addEventListener("pointerdown", function (e) {
    var b = track.getBoundingClientRect();
    function at(ev) {
      var f = clamp((ev.clientX - b.left) / b.width, 0, 1) * total;
      // snap to the start of the screen under the pointer
      var k = 0;
      while (k < n - 1 && f >= starts[k + 1]) k++;
      seek(starts[k] + FADE);
    }
    at(e);
    track.setPointerCapture(e.pointerId);
    track.onpointermove = at;
    track.onpointerup = function () { track.onpointermove = track.onpointerup = null; };
  });
  hero.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { seek(starts[(cur + 1) % n] + FADE); e.preventDefault(); }
    if (e.key === "ArrowLeft") { seek(starts[(cur - 1 + n) % n] + FADE); e.preventDefault(); }
  });
  document.addEventListener("visibilitychange", sync);
  function relayout() { measure(); render(); }
  window.addEventListener("resize", relayout);
  window.addEventListener("load", relayout);
  measure();
  render();

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      sync();
    }, { threshold: 0.35 }).observe(hero);
  } else {
    visible = true;
    sync();
  }
})();
