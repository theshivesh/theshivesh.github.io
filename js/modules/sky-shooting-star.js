/* ---- Sky: a shooting star every 20s, from a random spot --------- */
(function () {
  var star = document.querySelector(".sky-shoot");
  if (!star || !star.animate) return;
  function shoot() {
    // Only at night, and only when someone can see it
    if (document.documentElement.getAttribute("data-theme") !== "dark" || document.hidden) return;
    var sky = star.parentNode.getBoundingClientRect();
    var x = sky.width * (0.1 + Math.random() * 0.75);
    var y = 20 + Math.random() * 200;
    var angle = 12 + Math.random() * 22;      // degrees below the horizon
    var dir = Math.random() < 0.5 ? 1 : -1;   // left-to-right or right-to-left
    var run = 220 + Math.random() * 160;
    var rot = "rotate(" + (dir > 0 ? angle : 180 - angle) + "deg)";
    star.style.left = x + "px";
    star.style.top = y + "px";
    star.animate([
      { opacity: 0, transform: rot + " translateX(0)" },
      { opacity: 1, offset: 0.15 },
      { opacity: 0, transform: rot + " translateX(" + run + "px)" }
    ], { duration: 900 + Math.random() * 400, easing: "ease-out" });
  }
  setTimeout(function () { shoot(); setInterval(shoot, 20000); }, 4000);
})();
