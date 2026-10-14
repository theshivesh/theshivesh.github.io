/* ---- Sky: the visitor's local weather ------------------------- */
// Approximate location from the IP (no permission prompt), current
// conditions from Open-Meteo, cached for 30 minutes. Sets data-weather on
// <html> for the CSS layers and draws rain or snow on the sky canvas.
// Preview any mode with ?weather=clear|cloudy|overcast|fog|drizzle|rain|snow|storm
(function () {
  var root = document.documentElement;
  var sky = document.querySelector(".sky");
  var canvas = sky && sky.querySelector(".sky-fx");
  if (!sky || !canvas || !window.fetch) return;
  var KINDS = ["clear", "cloudy", "overcast", "fog", "drizzle", "rain", "snow", "storm"];

  function kindOf(code) {
    if (code >= 95) return "storm";
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
    if (code >= 51 && code <= 57) return "drizzle";
    if (code === 45 || code === 48) return "fog";
    if (code === 3) return "overcast";
    if (code === 2) return "cloudy";
    return "clear";
  }
  function getJSON(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  function locate() {
    return getJSON("https://ipwho.is/").then(function (d) {
      if (!d.success) throw new Error("ipwho");
      return { lat: d.latitude, lon: d.longitude };
    }).catch(function () {
      return getJSON("https://ipapi.co/json/").then(function (d) { return { lat: d.latitude, lon: d.longitude }; });
    });
  }
  function lookup() {
    return locate().then(function (p) {
      return getJSON("https://api.open-meteo.com/v1/forecast?latitude=" + p.lat.toFixed(2) +
        "&longitude=" + p.lon.toFixed(2) + "&current=weather_code,wind_speed_10m&wind_speed_unit=kmh");
    }).then(function (d) {
      return { kind: kindOf(d.current.weather_code), wind: d.current.wind_speed_10m || 0 };
    });
  }

  var forced = (location.search.match(/[?&]weather=([a-z]+)/) || [])[1];
  var cached = null;
  try { cached = JSON.parse(localStorage.getItem("sky-weather")); } catch (e) {}
  var get = forced && KINDS.indexOf(forced) > -1 ? Promise.resolve({ kind: forced, wind: 14 })
    : cached && Date.now() - cached.t < 30 * 60 * 1000 ? Promise.resolve(cached)
    : lookup().then(function (w) {
        try { localStorage.setItem("sky-weather", JSON.stringify({ kind: w.kind, wind: w.wind, t: Date.now() })); } catch (e) {}
        return w;
      });
  get.then(start).catch(function () {}); // no weather, just the plain sky

  function start(w) {
    root.setAttribute("data-weather", w.kind);
    if (w.kind === "storm") thunder();
    if (/drizzle|rain|storm|snow/.test(w.kind)) precipitate(w);
  }

  // Faint double flicker every 9 to 20s
  function thunder() {
    var flash = sky.querySelector(".sky-flash");
    (function next() {
      setTimeout(function () {
        if (!document.hidden && window.scrollY < 700) {
          flash.animate([{ opacity: 0 }, { opacity: 1, offset: 0.08 }, { opacity: 0.2, offset: 0.2 }, { opacity: 0.8, offset: 0.3 }, { opacity: 0 }],
            { duration: 700, easing: "ease-out" });
        }
        next();
      }, 9000 + Math.random() * 11000);
    })();
  }

  // Rain streaks or snowflakes; only drawn while the sky is on screen
  function precipitate(w) {
    var ctx = canvas.getContext("2d");
    var snow = w.kind === "snow";
    var count = snow ? 90 : w.kind === "drizzle" ? 45 : w.kind === "storm" ? 110 : 80;
    var slant = Math.max(-0.5, Math.min(0.5, (w.wind || 0) / 60)); // wind tilts the fall
    var W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1), drops = [], raf = 0;
    function size() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function drop(anywhere) {
      var z = Math.random();
      z = snow ? z * z : 0.4 + z * 0.6; // snow: mostly distant flakes, a few near ones
      return {
        x: Math.random() * (W + 200) - 100,
        y: anywhere ? Math.random() * H : -20,
        z: z, // depth: nearer is bigger, softer and faster
        p: Math.random() * Math.PI * 2,
        s: 0.6 + Math.random() * 0.8, // sway speed
        r: Math.random() * Math.PI, // crystal rotation
        crystal: snow && z > 0.72 && Math.random() < 0.5
      };
    }
    size();
    for (var i = 0; i < count; i++) drops.push(drop(true));
    window.addEventListener("resize", size);

    // Snow sprites, drawn once per theme: a soft glowing flake and a small
    // six-armed crystal for a few of the nearest flakes
    var sprites = {};
    function sprite(kind, dark) {
      var key = kind + (dark ? "d" : "l");
      if (sprites[key]) return sprites[key];
      var c = document.createElement("canvas"), n = 64, g = c.getContext("2d");
      c.width = c.height = n;
      var core = dark ? "255, 255, 255" : "158, 176, 204";
      if (kind === "soft") {
        var grad = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
        grad.addColorStop(0, "rgba(" + core + ", 1)");
        grad.addColorStop(0.35, "rgba(" + core + ", 0.75)");
        grad.addColorStop(1, "rgba(" + core + ", 0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, n, n);
      } else {
        g.translate(n / 2, n / 2);
        g.strokeStyle = "rgba(" + core + ", 0.95)";
        g.lineWidth = 3;
        g.lineCap = "round";
        for (var k = 0; k < 6; k++) {
          g.rotate(Math.PI / 3);
          g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -26);
          g.moveTo(0, -15); g.lineTo(-7, -21); g.moveTo(0, -15); g.lineTo(7, -21);
          g.stroke();
        }
      }
      return (sprites[key] = c);
    }

    function ink(a) {
      var dark = root.getAttribute("data-theme") === "dark";
      return dark ? "rgba(255, 255, 255, " + a + ")" : "rgba(90, 110, 140, " + a + ")";
    }
    function frame() {
      raf = 0;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < drops.length; i++) {
        var d = drops[i];
        if (snow) {
          // Slow fall, a lazy side-to-side sway, crystals turn as they go
          d.p += 0.008 * d.s;
          d.y += 0.18 + d.z * 0.6;
          d.x += Math.sin(d.p) * (0.15 + d.z * 0.45) + slant * (0.3 + d.z * 0.5);
          d.r += 0.004 * d.s;
          var dark = root.getAttribute("data-theme") === "dark";
          var sz = d.crystal ? 7 + d.z * 6 : 2 + d.z * 7;
          ctx.globalAlpha = (dark ? 0.35 : 0.55) + d.z * 0.45;
          if (d.crystal) {
            ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.r);
            ctx.drawImage(sprite("crystal", dark), -sz / 2, -sz / 2, sz, sz);
            ctx.restore();
          } else {
            ctx.drawImage(sprite("soft", dark), d.x - sz / 2, d.y - sz / 2, sz, sz);
          }
          ctx.globalAlpha = 1;
        } else {
          var len = (w.kind === "drizzle" ? 6 : 12) * d.z;
          var v = (w.kind === "drizzle" ? 4 : 7) * d.z;
          d.y += v; d.x += v * slant;
          ctx.strokeStyle = ink(0.12 + d.z * 0.16);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - len * slant, d.y - len);
          ctx.stroke();
        }
        if (d.y > H + 10 || d.x < -120 || d.x > W + 120) drops[i] = drop(false);
      }
      loop();
    }
    function loop() {
      if (!raf && !document.hidden && window.scrollY < 700) raf = requestAnimationFrame(frame);
    }
    window.addEventListener("scroll", loop, { passive: true });
    document.addEventListener("visibilitychange", loop);
    loop();
  }
})();
