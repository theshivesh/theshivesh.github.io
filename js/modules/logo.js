/* ---- SHIV logo: play once on load, replay on hover ------------- */
(function () {
  var mark = document.querySelector(".shiv");
  if (!mark) return;
  var brand = mark.closest("a") || mark;
  var last = mark.querySelector(".shiv-v"); // the V's spin finishes the sequence
  function play() {
    if (mark.classList.contains("is-play")) return; // let a run finish
    mark.classList.add("is-play");
  }
  last.addEventListener("animationend", function () { mark.classList.remove("is-play"); });
  setTimeout(play, 500);
  brand.addEventListener("mouseenter", play);
  brand.addEventListener("focus", play);
})();
