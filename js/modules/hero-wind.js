/* ---- Home hero: wind in the photo ---------------------------------------- */
// Redraws the hero photo on a WebGL canvas and nudges three parts of it with
// a soft breeze: the grass on the slope, the guy's hair and the blossom on
// the tree. Each part is a soft shape in the photo's own pixels (1671 x 941)
// with its own kind of movement; everything else stays still. The canvas
// sits over the <img> with the same mask, and the <img> hides only once the
// first frame is drawn, so without WebGL the plain photo stays. Runs only
// while the hero is on screen and the tab is visible. Like the work
// previews, it ignores reduced motion (Shivesh's Mac reports it).
(function () {
  var pic = document.querySelector(".hero-pic");
  var img = pic && pic.querySelector("img");
  if (!img) return;

  var canvas = document.createElement("canvas");
  canvas.className = "hero-wind";
  var gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false });
  if (!gl) return;

  var VERT =
    "attribute vec2 p; varying vec2 vUv;" +
    "void main(){ vUv = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5); gl_Position = vec4(p, 0.0, 1.0); }";

  // px = photo pixels, y down. Masks are soft shapes; d is how far (in photo
  // pixels) each spot is pushed, and the shader samples from px - d.
  var FRAG = [
    "precision highp float;",
    "uniform sampler2D uImg; uniform float uT; uniform vec2 uA, uB;",
    "varying vec2 vUv;",
    "const vec2 SIZE = vec2(1671.0, 941.0);",
    "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
    "float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }",
    "float oval(vec2 p, vec2 c, vec2 r, float soft){ return 1.0 - smoothstep(1.0 - soft, 1.0, length((p - c) / r)); }",
    // the top of the slope, left to right
    "float groundY(float x){",
    "  if (x < 300.0) return mix(820.0, 868.0, x / 300.0);",
    "  if (x < 700.0) return mix(868.0, 798.0, (x - 300.0) / 400.0);",
    "  if (x < 1000.0) return mix(798.0, 762.0, (x - 700.0) / 300.0);",
    "  return 762.0; }",
    "void main(){",
    "  vec2 px = vUv * uA + uB;",
    "  float gust = 0.65 + 0.35 * sin(uT * 0.31) + 0.2 * sin(uT * 0.83 + 1.7);",
    "  vec2 d = vec2(0.0);",

    // grass: waves rolling right to left across the slope, plus a flutter
    "  float g = smoothstep(groundY(px.x) - 8.0, groundY(px.x) + 18.0, px.y);",
    "  g *= 1.0 - oval(px, vec2(1140.0, 718.0), vec2(96.0, 80.0), 0.35);",  // dog
    "  g *= 1.0 - oval(px, vec2(1350.0, 668.0), vec2(150.0, 112.0), 0.3);", // the two of them
    "  g *= 1.0 - smoothstep(1455.0, 1500.0, px.x) * (1.0 - smoothstep(760.0, 810.0, px.y));", // trunk
    "  g *= 1.0 - oval(px, vec2(1380.0, 892.0), vec2(150.0, 64.0), 0.4);",  // big rock
    "  g *= 1.0 - oval(px, vec2(952.0, 803.0), vec2(42.0, 18.0), 0.5);",    // small rock
    "  float wave = sin(px.x * 0.011 + uT * 1.5 + px.y * 0.004);",
    "  float flutter = noise(vec2(px.x * 0.05 + uT * 2.2, px.y * 0.08)) - 0.5;",
    "  d.x += g * (wave * 2.2 + flutter * 3.0) * gust;",
    "  d.y += g * (noise(vec2(px.x * 0.04 - uT, px.y * 0.06)) - 0.5) * 1.2 * gust;",

    // hair: small curls lifting and settling, more at the crown
    "  float h = oval(px, vec2(1390.0, 580.0), vec2(44.0, 32.0), 0.7);",
    "  float lift = smoothstep(612.0, 556.0, px.y);",
    "  d.x += h * (sin(uT * 2.3 + px.y * 0.21) * 0.9 + (noise(px * 0.12 + uT * 1.8) - 0.5) * 1.6) * (0.6 + lift) * gust;",
    "  d.y += h * sin(uT * 2.9 + px.x * 0.27) * 0.6 * lift * gust;",

    // blossom: the whole crown sways slowly, the outer twigs most,
    // the flowers flutter on top; trunk and main limb stay put
    "  float low = mix(330.0, 400.0, smoothstep(980.0, 1100.0, px.x));", // clear of the peak
    "  float c = 1.0 - smoothstep(low, low + 70.0, px.y);",
    "  c *= smoothstep(560.0, 660.0, px.x);",
    "  c *= 1.0 - smoothstep(1440.0, 1500.0, px.x) * smoothstep(220.0, 300.0, px.y);",
    "  float reach = clamp(length(px - vec2(1560.0, 330.0)) / 800.0, 0.0, 1.0);",
    "  vec2 sway = vec2(sin(uT * 0.7 + px.y * 0.004), cos(uT * 0.55 + px.x * 0.003) * 0.6) * 3.2;",
    "  vec2 shake = vec2(noise(px * 0.03 + uT * 1.4), noise(px * 0.03 - uT * 1.2 + 7.0)) - 0.5;",
    "  d += c * (sway * reach + shake * 2.4) * gust;",

"  gl_FragColor = texture2D(uImg, clamp((px - d) / SIZE, 0.0, 1.0));",
    "}",
  ].join("\n");

  function shader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  var vs = shader(gl.VERTEX_SHADER, VERT), fs = shader(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var uT = gl.getUniformLocation(prog, "uT"), uA = gl.getUniformLocation(prog, "uA"), uB = gl.getUniformLocation(prog, "uB");

  var ready = false, live = false, raf = 0, t0 = performance.now();

  // The photo is object-fit: cover, pinned right bottom. Work out which
  // photo pixel each corner of the canvas shows.
  function size() {
    var r = pic.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var s = Math.max(r.width / 1671, r.height / 941);
    var dpr = Math.min(window.devicePixelRatio || 1, 2, Math.max(1, 1 / s));
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uA, r.width / s, r.height / s);
    gl.uniform2f(uB, 1671 - r.width / s, 941 - r.height / s);
  }

  function draw(t) {
    gl.uniform1f(uT, (t - t0) / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function step(t) {
    raf = requestAnimationFrame(step);
    draw(t);
  }

  function sync() {
    var on = ready && live && !document.hidden;
    if (on && !raf) raf = requestAnimationFrame(step);
    if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  function start() {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    pic.appendChild(canvas);
    size();
    draw(performance.now());
    pic.classList.add("is-wind");
    ready = true;
    sync();
  }

  if (img.complete && img.naturalWidth) start();
  else img.addEventListener("load", start, { once: true });
  window.addEventListener("resize", function () { if (ready) { size(); draw(performance.now()); } });
  new IntersectionObserver(function (es) { live = es[0].isIntersecting; sync(); }).observe(pic);
  document.addEventListener("visibilitychange", sync);
})();
