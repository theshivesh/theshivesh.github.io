/* ---- Content protection: no right click, selection or image drag -- */
(function () {
  // Right-click block paused while inspecting elements; restore when done.
  // document.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  document.addEventListener("selectstart", function (e) { e.preventDefault(); });
  document.addEventListener("dragstart", function (e) {
    if (e.target.closest && e.target.closest("img, svg, video")) e.preventDefault();
  });
})();
