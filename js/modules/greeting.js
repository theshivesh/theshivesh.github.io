/* ---- Time-of-day greeting --------------------------------------- */
var greetingEl = document.getElementById("greeting");
if (greetingEl) {
  var h = new Date().getHours();
  var g = "Hey there";
  if (h >= 5 && h < 12) g = "Good morning";
  else if (h >= 12 && h < 17) g = "Good afternoon";
  else if (h >= 17 && h < 21) g = "Good evening";
  else if (h >= 21 && h < 24) g = "Late evening";
  else g = "Up late?";
  greetingEl.textContent = g + (g.slice(-1) === "?" ? "" : ",");
}
