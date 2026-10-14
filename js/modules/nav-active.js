/* ---- Active project: center its pill in the mobile nav ---------- */
(function () {
  var active = document.querySelector(".nav-item--active");
  var list = document.querySelector(".nav-list");
  if (!active || !list) return;
  // Only meaningful when the nav scrolls horizontally (mobile top bar).
  if (list.scrollWidth <= list.clientWidth) return;
  var target = active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2;
  list.scrollLeft = Math.max(0, target);
})();
