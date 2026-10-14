/* ---- Home: selected work previews ------------------------------ */
// Each case study block has a live preview. Loops only run while the
// stage is on screen (.is-live); stages with [data-tilt] lean toward the
// pointer, with layered children floating at different depths.
// These are small, slow product demos, so they run even when the system
// asks for reduced motion (otherwise they read as broken, static mocks).
(function () {
  var stages = document.querySelectorAll(".sw-stage");
  if (!stages.length) return;
  var fine = window.matchMedia("(pointer: fine)").matches;

  var onLive = []; // callbacks fired when a stage enters / leaves view
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      en.target.classList.toggle("is-live", en.isIntersecting);
      onLive.forEach(function (fn) { fn(en.target, en.isIntersecting); });
    });
  }, { threshold: 0.2 });
  stages.forEach(function (s) { io.observe(s); });
  function whileLive(stage, start, stop) {
    onLive.push(function (el, live) {
      if (el !== stage) return;
      if (live) start(); else if (stop) stop();
    });
  }

  // Pointer tilt
  if (fine) {
    document.querySelectorAll(".sw-stage[data-tilt]").forEach(function (stage) {
      var inner = stage.querySelector(".sw-tilt");
      if (!inner) return;
      var cur = { x: 0, y: 0 }, tgt = { x: 0, y: 0 }, running = false;
      function step() {
        cur.x += (tgt.x - cur.x) * 0.08;
        cur.y += (tgt.y - cur.y) * 0.08;
        stage.style.setProperty("--rx", cur.y.toFixed(2) + "deg");
        stage.style.setProperty("--ry", cur.x.toFixed(2) + "deg");
        if (Math.abs(tgt.x - cur.x) > 0.02 || Math.abs(tgt.y - cur.y) > 0.02) requestAnimationFrame(step);
        else running = false;
      }
      function kick() { if (!running) { running = true; requestAnimationFrame(step); } }
      stage.addEventListener("pointermove", function (e) {
        var b = stage.getBoundingClientRect();
        tgt.x = ((e.clientX - b.left) / b.width - 0.5) * 2 * 9;
        tgt.y = -((e.clientY - b.top) / b.height - 0.5) * 2 * 7;
        kick();
      });
      stage.addEventListener("pointerleave", function () { tgt.x = 0; tgt.y = 0; kick(); });
    });
  }

  // Picto: cycle the image, font and alignment
  (function () {
    var stage = document.querySelector(".sw-stage--picto");
    if (!stage) return;
    var shots = stage.querySelectorAll(".pc-shot");
    var fonts = stage.querySelectorAll(".pc-font");
    var aligns = stage.querySelectorAll(".pc-align");
    var title = stage.querySelector(".pc-title");
    var looks = [
      { font: "var(--font-display)", weight: 900, style: "normal", align: "left" },
      { font: "Georgia, serif", weight: 700, style: "italic", align: "center" },
      { font: "var(--font-hand)", weight: 700, style: "normal", align: "right" },
      { font: "var(--font-sans)", weight: 300, style: "normal", align: "center" }
    ];
    var i = 0, timer = null;
    function apply() {
      var look = looks[i % looks.length];
      shots.forEach(function (s, n) { s.classList.toggle("is-on", n === i % shots.length); });
      fonts.forEach(function (f, n) { f.classList.toggle("is-on", n === i % fonts.length); });
      var al = ["left", "center", "right"].indexOf(look.align);
      aligns.forEach(function (a, n) { a.classList.toggle("is-on", n === al); });
      title.classList.add("is-swap");
      setTimeout(function () {
        title.style.fontFamily = look.font;
        title.style.fontWeight = look.weight;
        title.style.fontStyle = look.style;
        title.style.textAlign = look.align;
        title.classList.remove("is-swap");
      }, 300);
    }
    apply();
    whileLive(stage, function () {
      if (!timer) timer = setInterval(function () { i++; apply(); }, 3000);
    }, function () { clearInterval(timer); timer = null; });
  })();

  // Custom domain: show each creator page, flip it to its own domain,
  // then move on to the next creator in the array
  (function () {
    var stage = document.querySelector(".sw-stage--custom-domain");
    if (!stage) return;
    var cd = stage.querySelector(".cd");
    var pages = stage.querySelectorAll(".cd-page");
    var i = 0, timers = [];
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function show(n) {
      timers = []; // everything from the last round has fired
      cd.classList.remove("is-on");
      pages.forEach(function (p, k) { p.classList.toggle("is-on", k === n); });
      later(function () { cd.classList.add("is-on"); }, 1100);
      later(function () { i = (i + 1) % pages.length; show(i); }, 4400);
    }
    whileLive(stage, function () {
      if (timers.length) return;
      show(i);
    }, function () {
      timers.forEach(clearTimeout); timers = [];
    });
  })();

  // Scripted loops: run(later) plays one round, scheduling steps with
  // later(fn, ms); rounds repeat while the stage is on screen and stop
  // (timers cleared) when it leaves.
  function scripted(sel, run) {
    var stage = document.querySelector(sel);
    if (!stage) return;
    var timers = [];
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function round() { timers = []; run(later, round); }
    whileLive(stage, function () {
      if (!timers.length) round();
    }, function () {
      timers.forEach(clearTimeout); timers = [];
    });
  }

  // Visualise AI: type the paragraph first, then generate its image
  scripted(".sw-stage--visualise-ai", (function () {
    var va = document.querySelector(".va");
    if (!va) return null;
    var scenes = JSON.parse(va.getAttribute("data-scenes"));
    var drop = va.querySelector(".va-drop");
    var text = va.querySelector(".va-text");
    var gen = va.querySelector(".va-gen");
    var imgs = va.querySelectorAll(".va-img");
    var i = 0;
    return function (later, again) {
      var full = scenes[i], n = i;
      gen.classList.remove("is-gen", "is-done");
      va.classList.remove("is-typed");
      drop.textContent = full[0];
      text.textContent = "";
      later(function () {
        imgs.forEach(function (img, k) { img.classList.toggle("is-on", k === n); });
      }, 600); // after the old image has faded out
      var t = 300;
      for (var c = 2; c <= full.length; c++) {
        t += 22 + Math.random() * 26;
        (function (c) { later(function () { text.textContent = full.slice(1, c); }, t); })(c);
      }
      later(function () { va.classList.add("is-typed"); }, t + 100);
      later(function () { gen.classList.add("is-gen"); }, t + 500);
      later(function () { gen.classList.add("is-done"); }, t + 3000);
      later(function () { i = (i + 1) % scenes.length; again(); }, t + 6500);
    };
  })());

  // Petdoo: slide the matches rail along and heart each pet
  scripted(".sw-stage--petdoo", (function () {
    var track = document.querySelector(".pd-track");
    var cards = track ? track.querySelectorAll(".pd-card") : [];
    var toast = document.querySelector(".pd-toast");
    var i = 0;
    return function (later, again) {
      if (i === 0) cards.forEach(function (c) { c.querySelector(".pd-heart").classList.remove("is-liked"); });
      var step = cards[0].offsetWidth + 10;
      track.style.transform = "translateX(" + (-Math.min(i, cards.length - 2) * step) + "px)";
      var heart = cards[i].querySelector(".pd-heart");
      later(function () {
        heart.classList.add("is-tap", "is-liked");
        toast.classList.add("is-on");
      }, 1000);
      later(function () { heart.classList.remove("is-tap"); toast.classList.remove("is-on"); }, 2300);
      later(function () { i = (i + 1) % cards.length; again(); }, 2900);
    };
  })());

  // Headlines: swipe the top story away, the next one rises
  scripted(".sw-stage--headlines", (function () {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".hl-card"));
    var hint = document.querySelector(".hl-hint");
    return function (later, again) {
      later(function () {
        var top = cards.filter(function (c) { return c.getAttribute("data-pos") === "0"; })[0];
        top.classList.add("is-out");
        if (hint) hint.classList.add("is-gone"); // the reader has got it now
        cards.forEach(function (c) {
          if (c !== top) c.setAttribute("data-pos", +c.getAttribute("data-pos") - 1);
        });
        later(function () {
          top.style.transition = "none";
          top.classList.remove("is-out");
          top.setAttribute("data-pos", cards.length - 1);
          top.offsetWidth; // commit the jump before restoring transitions
          top.style.transition = "";
        }, 650);
      }, 2600);
      later(again, 3300);
    };
  })());

  // Comments: write, submit, wait for approval, get a reply
  scripted(".sw-stage--comments", (function () {
    var cm = document.querySelector(".cm");
    var typed = cm ? cm.querySelector(".cm-typed") : null;
    var count = cm ? cm.querySelector(".cm-count") : null;
    var text = "Loved this piece. The stand-up scene here finally has the stage it deserves.";
    return function (later, again) {
      cm.classList.remove("is-sent", "is-approved", "is-replied", "is-press");
      typed.textContent = ""; count.textContent = "0 / 1500";
      var c = 0, t = 600;
      while (c < text.length) {
        c++; t += 28 + (text[c - 1] === " " ? 30 : 0);
        (function (n) {
          later(function () { typed.textContent = text.slice(0, n); count.textContent = n + " / 1500"; }, t);
        })(c);
      }
      later(function () { cm.classList.add("is-press"); }, t + 500);
      later(function () { cm.classList.remove("is-press"); cm.classList.add("is-sent"); }, t + 700);
      later(function () { cm.classList.add("is-approved"); }, t + 2600);
      later(function () { cm.classList.add("is-replied"); }, t + 3800);
      later(again, t + 7200);
    };
  })());

  // Earnings: count the total up the first time it comes into view
  (function () {
    var stage = document.querySelector(".sw-stage--earnings-redesign");
    var el = stage && stage.querySelector("[data-count]");
    if (!el) return;
    var max = +el.getAttribute("data-count"), done = false;
    el.textContent = "₹0";
    whileLive(stage, function () {
      if (done) return;
      done = true;
      var t0 = performance.now(), dur = 1600;
      (function tick(now) {
        var k = Math.min(1, (now - t0) / dur);
        k = 1 - Math.pow(1 - k, 3);
        el.textContent = "₹" + Math.round(max * k).toLocaleString("en-IN");
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    });
  })();

  // Stck Books: a 3D print book you can turn (from experiments/book-3d)
  (function () {
    var scene = document.querySelector("[data-book]");
    if (!scene) return;
    var stage = scene.closest(".sw-stage");
    var tiltEl = scene.querySelector(".bk-tilt");
    var floor = scene.querySelector(".bk-floor");
    var B = {
      title: "Stories the Fire Could Not Burn", author: "Hoihnu Hauzel", pub: "Speaking Tiger",
      price: "$20", pages: 232, ar: 0.651, spine: "#f4f2ee", spineInk: "#b8342a",
      img: new URL("../../img/home/book-cover.jpg", import.meta.url).href,
      desc: "A searing personal account of the Manipur crisis of 2023 to 2025. Printed on demand, one copy at a time."
    };
    var H = 100, D = (B.pages * 0.012 + 9).toFixed(2);
    var book = document.createElement("div");
    book.className = "bk";
    book.style.cssText = "--w: calc(var(--u) * " + (B.ar * H).toFixed(2) + "); --h: calc(var(--u) * " + H +
      "); --d: calc(var(--u) * " + D + "); --spine: " + B.spine + "; --spine-ink: " + B.spineInk + ";";
    book.innerHTML =
      '<div class="bk-fboard">' +
        '<div class="bk-face bk-cin"></div>' +
        '<div class="bk-face bk-bedge r"></div><div class="bk-face bk-bedge t"></div><div class="bk-face bk-bedge b"></div>' +
        '<div class="bk-face bk-front" data-n="0,0,1" style="background-color:' + B.spine + '"><div class="bk-cover" style="background-image:url(\'' + B.img + '\')"></div><div class="bk-gloss"></div></div>' +
      '</div>' +
      '<div class="bk-face bk-spin"></div>' +
      '<div class="bk-bboard"><div class="bk-face bk-bin"></div>' +
        '<div class="bk-face bk-bedge r"></div><div class="bk-face bk-bedge t"></div><div class="bk-face bk-bedge b"></div></div>' +
      '<div class="bk-face bk-back bk-cloth" data-n="0,0,-1"><div class="bk-bc"><b>' + B.pub + '</b><p>' + B.desc + '</p>' +
        '<div class="foot"><span class="price">' + B.price + '</span><div class="bk-barcode"><i></i>978 183726</div></div></div></div>' +
      '<div class="bk-face bk-spine bk-cloth" data-n="-1,0,0"><div class="bk-sp"><span class="bk-sp-a">' + B.author +
        '</span><span class="bk-sp-t">' + B.title + '</span><span class="bk-sp-p">' + B.pub + '</span></div></div>' +
      '<div class="bk-face bk-edge" data-n="1,0,0"></div>' +
      '<div class="bk-face bk-top" data-n="0,-1,0"></div>' +
      '<div class="bk-face bk-bottom" data-n="0,1,0"></div>';
    tiltEl.appendChild(book);
    var faces = Array.prototype.map.call(book.querySelectorAll(".bk-face[data-n]"), function (f) {
      return { el: f, n: f.getAttribute("data-n").split(",").map(Number) };
    });

    // Lighting: darken each face by how far it turns from the light
    var L = (function () { var v = [-0.3, -0.65, 1], l = Math.hypot(v[0], v[1], v[2]); return v.map(function (x) { return x / l; }); })();
    function shade(list) {
      var m = list.reduce(function (acc, r) {
        return acc.rotateAxisAngle(r[0] === "x" ? 1 : 0, r[0] === "y" ? 1 : 0, 0, r[1]);
      }, new DOMMatrix());
      faces.forEach(function (f) {
        var n = m.transformPoint(new DOMPoint(f.n[0], f.n[1], f.n[2], 0));
        var d = Math.max(0, n.x * L[0] + n.y * L[1] + n.z * L[2]);
        f.el.style.setProperty("--shade", (0.45 * (1 - d)).toFixed(3));
      });
    }

    // Drag to turn, with momentum; idle sway; cursor lean
    var HOME = { rx: -8, ry: 30 };
    // idleSince is backdated so the book is already swaying on first view
    var r = { rx: HOME.rx, ry: HOME.ry, vx: 0, vy: 0, target: null, dragging: false, idleSince: performance.now() - 3200, base: HOME.ry };
    var tilt = { x: 0, y: 0, tx: 0, ty: 0 };
    var clampX = function (v) { return Math.max(-60, Math.min(60, v)); };
    var last = null, moved = 0;
    scene.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      r.dragging = true; r.target = null; r.vx = r.vy = 0; moved = 0;
      last = { x: e.clientX, y: e.clientY, t: performance.now() };
      if (e.pointerType === "mouse") scene.setPointerCapture(e.pointerId);
      scene.classList.add("is-dragging");
    });
    scene.addEventListener("pointermove", function (e) {
      var b = scene.getBoundingClientRect();
      if (!r.dragging) {
        if (e.pointerType !== "mouse") return;
        tilt.tx = ((e.clientX - b.left) / b.width - 0.5) * 2 * 9;
        tilt.ty = -((e.clientY - b.top) / b.height - 0.5) * 2 * 9;
        return;
      }
      var dx = e.clientX - last.x, dy = e.clientY - last.y;
      moved += Math.abs(dx) + Math.abs(dy);
      // On touch, only horizontal drags turn the book (vertical scrolls the page)
      if (e.pointerType !== "mouse") dy = 0;
      r.ry += dx * 0.5; r.rx = clampX(r.rx - dy * 0.5);
      r.vy = dx * 0.5; r.vx = -dy * 0.5;
      last = { x: e.clientX, y: e.clientY, t: performance.now() };
    });
    function endDrag() {
      if (!r.dragging) return;
      r.dragging = false;
      scene.classList.remove("is-dragging");
      if (performance.now() - last.t > 80) r.vx = r.vy = 0;
      r.idleSince = performance.now(); r.base = r.ry;
    }
    scene.addEventListener("pointerup", endDrag);
    scene.addEventListener("pointercancel", endDrag);
    scene.addEventListener("pointerleave", function () { tilt.tx = tilt.ty = 0; });
    // A click (not a drag) on the book opens the case study
    scene.addEventListener("click", function (e) {
      if (moved > 6) return;
      location.href = stage.getAttribute("data-href");
    });
    scene.addEventListener("keydown", function (e) {
      var map = { ArrowLeft: [0, -20], ArrowRight: [0, 20], ArrowUp: [15, 0], ArrowDown: [-15, 0] };
      if (e.key === "Enter") { location.href = stage.getAttribute("data-href"); return; }
      if (!map[e.key]) return;
      e.preventDefault();
      var t = r.target || r;
      r.vx = r.vy = 0;
      r.target = { rx: clampX(t.rx + map[e.key][0]), ry: t.ry + map[e.key][1] };
    });

    var live = false, raf = 0;
    function frame(now) {
      raf = 0;
      if (!r.dragging) {
        if (r.target) {
          r.rx += (r.target.rx - r.rx) * 0.1; r.ry += (r.target.ry - r.ry) * 0.1;
          if (Math.abs(r.target.rx - r.rx) < 0.05 && Math.abs(r.target.ry - r.ry) < 0.05) {
            r.rx = r.target.rx; r.ry = r.target.ry; r.target = null; r.idleSince = now; r.base = r.ry;
          }
        } else if (Math.abs(r.vx) > 0.01 || Math.abs(r.vy) > 0.01) {
          r.ry += r.vy; r.rx = clampX(r.rx + r.vx); r.vx *= 0.94; r.vy *= 0.94;
          r.idleSince = now; r.base = r.ry;
        } else if (now - r.idleSince > 1200) {
          var t = (now - r.idleSince - 1200) / 1000;
          r.ry = r.base + Math.sin(t * 0.7) * 14 * Math.min(1, t / 2);
        }
      } else { tilt.tx *= 0.9; tilt.ty *= 0.9; }
      tilt.x += (tilt.tx - tilt.x) * 0.08;
      tilt.y += (tilt.ty - tilt.y) * 0.08;
      tiltEl.style.setProperty("--tx", tilt.y.toFixed(2) + "deg");
      tiltEl.style.setProperty("--ty", tilt.x.toFixed(2) + "deg");
      book.style.transform = "rotateX(" + r.rx + "deg) rotateY(" + r.ry + "deg)";
      var ry = r.ry + tilt.x;
      shade([["x", tilt.y], ["y", tilt.x], ["x", r.rx], ["y", r.ry]]);
      book.style.setProperty("--gloss-x", (50 + Math.sin(ry * Math.PI / 180) * 60) + "%");
      floor.style.setProperty("--shadow-x", (0.55 + 0.45 * Math.abs(Math.cos(ry * Math.PI / 180))).toFixed(3));
      if (live) raf = requestAnimationFrame(frame);
    }
    frame(performance.now()); // paint the first pose even before it is live
    whileLive(stage, function () {
      live = true;
      if (!raf) raf = requestAnimationFrame(frame);
    }, function () { live = false; });
  })();
})();
