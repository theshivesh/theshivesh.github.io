/* ---- Home hero: cherry petals from the tree ------------------------------ */
// Pink petals slip out of the lower canopy and off the sides of the trunk in
// the hero photo, then drift down and to the left on a light breeze. Spawn
// points are fractions of the photo (.hero-pic), so they stay on the tree at
// any size. Drawn on one small canvas; only runs while the hero is on
// screen and the tab is visible. Like the work previews, it ignores reduced
// motion (Shivesh's Mac reports it, so the petals never showed).
(function () {
  var frame = document.querySelector(".hero-bg");
  var pic = frame && frame.querySelector(".hero-pic");
  var canvas = frame && frame.querySelector(".hero-petals");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  // Where petals start, as [x0, x1, y0, y1] fractions of the photo.
  var SOURCES = [
    [0.52, 0.86, 0.22, 0.42], // the lower edge of the blossom
    [0.84, 0.92, 0.30, 0.70], // the left side of the trunk
    [0.94, 1.00, 0.28, 0.62], // the right side of the trunk
  ];
  // Petal tints: [base, tip]. The base (where it joined the flower) is
  // paler, the notched tip is pinker.
  var TINTS = [["#fde4ec", "#f19ab4"], ["#fbdbe5", "#ec8aa8"], ["#fff0f4", "#f6b4c8"], ["#f9d3df", "#e87ea0"]];

  // One sakura petal drawn once per tint (front, and a slightly darker,
  // flatter back) on a small sprite, then stamped with drawImage. Pointing
  // along +x: rounded at the base, widest past the middle, with the little
  // V notch in the tip that makes it read as a cherry petal.
  var SW = 48, SH = 34;
  function petalSprite(tint, back) {
    var c = document.createElement("canvas");
    c.width = SW; c.height = SH;
    var g = c.getContext("2d");
    g.translate(4, SH / 2);
    var L = SW - 8, w = SH / 2 - 3;
    g.beginPath();
    g.moveTo(0, 0);
    g.bezierCurveTo(L * 0.22, -w * 0.45, L * 0.55, -w * 1.15, L * 0.95, -w * 0.5);
    g.quadraticCurveTo(L * 0.92, -w * 0.12, L * 0.82, 0);      // into the notch
    g.quadraticCurveTo(L * 0.92, w * 0.12, L * 0.95, w * 0.5); // out of it
    g.bezierCurveTo(L * 0.55, w * 1.15, L * 0.22, w * 0.45, 0, 0);
    g.closePath();
    var grad = g.createLinearGradient(0, 0, L, 0);
    grad.addColorStop(0, tint[0]);
    grad.addColorStop(0.45, tint[0]);
    grad.addColorStop(1, tint[1]);
    g.fillStyle = grad;
    g.fill();
    // soft light across one side, a shade along the other: a slight cup
    var side = g.createLinearGradient(0, -w, 0, w);
    side.addColorStop(0, back ? "rgba(255,255,255,0)" : "rgba(255,255,255,0.35)");
    side.addColorStop(0.5, "rgba(255,255,255,0)");
    side.addColorStop(1, back ? "rgba(150,40,80,0.22)" : "rgba(170,60,95,0.12)");
    g.fillStyle = side;
    g.fill();
    // a faint centre vein
    g.strokeStyle = back ? "rgba(160,50,90,0.12)" : "rgba(255,255,255,0.4)";
    g.lineWidth = 0.8;
    g.beginPath(); g.moveTo(L * 0.06, 0); g.quadraticCurveTo(L * 0.45, -w * 0.06, L * 0.78, 0); g.stroke();
    return c;
  }
  var SPRITES = TINTS.map(function (t) { return [petalSprite(t, false), petalSprite(t, true)]; });

  var W = 0, H = 0, box = null, petals = [], live = false, raf = 0, last = 0, wind = 0;
  var max = window.matchMedia("(max-width: 767px)").matches ? 16 : 34;

  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var f = frame.getBoundingClientRect(), p = pic.getBoundingClientRect();
    W = f.width; H = f.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    box = { x: p.left - f.left, y: p.top - f.top, w: p.width, h: p.height };
  }

  function spawn(p) {
    var s = SOURCES[Math.random() < 0.6 ? 0 : Math.random() < 0.5 ? 1 : 2];
    var r = 2.4 + Math.random() * 2; // half the petal's length, in px
    p.x = box.x + box.w * (s[0] + Math.random() * (s[1] - s[0]));
    p.y = box.y + box.h * (s[2] + Math.random() * (s[3] - s[2]));
    p.r = r * (box.h / 600 + 0.4);
    p.vx = -(8 + Math.random() * 22);
    p.vy = 14 + Math.random() * 20;
    p.rot = Math.random() * 6.28; p.spin = (Math.random() - 0.5) * 2.4;
    p.flip = Math.random() * 6.28; p.flipV = 1.5 + Math.random() * 2.5;
    p.roll = Math.random() * 6.28; p.rollV = 0.6 + Math.random() * 1.4;
    p.sway = Math.random() * 6.28; p.swayV = 0.8 + Math.random() * 1.2;
    p.s = SPRITES[(Math.random() * SPRITES.length) | 0];
    p.age = 0; p.life = 5 + Math.random() * 5;
    return p;
  }

  function step(t) {
    raf = requestAnimationFrame(step);
    var dt = Math.min((t - last) / 1000 || 0, 0.05); last = t;
    wind = Math.sin(t / 4200) * 10 - 6; // a slow gust now and then
    if (petals.length < max && Math.random() < dt * max / 6) petals.push(spawn({}));
    ctx.setTransform(canvas.width / W, 0, 0, canvas.width / W, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (var i = petals.length - 1; i >= 0; i--) {
      var p = petals[i];
      p.age += dt;
      p.sway += p.swayV * dt; p.flip += p.flipV * dt; p.roll += p.rollV * dt; p.rot += p.spin * dt;
      p.x += (p.vx + wind + Math.sin(p.sway) * 14) * dt;
      p.y += p.vy * dt;
      if (p.age > p.life || p.y > H || p.x < -20) { spawn(p); continue; }
      // fade in, then out over the last second and a half
      var a = Math.min(p.age / 0.6, 1, (p.life - p.age) / 1.5);
      ctx.globalAlpha = Math.max(a, 0) * 0.95;
      // tumbling in 3D: flip squashes it across, roll foreshortens it
      // lengthwise, and the back shows when it has turned over
      var fy = Math.cos(p.flip), fx = 0.55 + 0.45 * Math.cos(p.roll);
      var k = p.r * 2 / (SW - 8);
      var dpr = canvas.width / W;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.scale(k * fx, k * Math.max(Math.abs(fy), 0.12));
      ctx.drawImage(p.s[fy < 0 ? 1 : 0], -SW / 2, -SH / 2);
    }
  }

  function sync() {
    var on = live && !document.hidden;
    if (on && !raf) { last = performance.now(); raf = requestAnimationFrame(step); }
    if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  size();
  window.addEventListener("resize", size);
  new IntersectionObserver(function (es) { live = es[0].isIntersecting; sync(); }).observe(frame);
  document.addEventListener("visibilitychange", sync);
})();
