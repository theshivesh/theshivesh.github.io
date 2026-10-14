/* ---- Page transitions: card <-> work page ----------------------- */
// Uses cross-document View Transitions. On the way out, the clicked work
// card is tagged so it morphs into the case-study hero (which carries the
// same view-transition-name in CSS). Unsupported browsers just navigate.
(function () {
  if (!("startViewTransition" in document)) return; // no VT support
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Tag the work card whose href matches `url` with the shared morph name
  // (and clear the rest). Returns the tagged card, or null.
  function tagCardForUrl(url) {
    var tagged = null;
    document.querySelectorAll(".sw-stage").forEach(function (card) {
      var href = card.getAttribute("href") || card.getAttribute("data-href");
      var norm = href ? href.replace(/^\.?\//, "") : "";
      if (norm && url && url.indexOf(norm) !== -1) {
        card.style.viewTransitionName = "case-hero";
        tagged = card;
      } else {
        card.style.viewTransitionName = "";
      }
    });
    return tagged;
  }

  // Outgoing (index -> work): name the clicked card so it morphs INTO the
  // case-study hero.
  window.addEventListener("pageswap", function (e) {
    if (!e.viewTransition) return;
    var dest = e.activation && e.activation.entry && e.activation.entry.url;
    tagCardForUrl(dest); // no-op on the work page (it has no cards)
  });

  // Incoming (work -> index, via browser back OR the "All work" link): name
  // the card we came FROM so the hero morphs BACK into it. The "from" URL
  // comes from the Navigation API's activation record.
  window.addEventListener("pagereveal", function (e) {
    if (!e.viewTransition) return;
    var from =
      window.navigation &&
      navigation.activation &&
      navigation.activation.from &&
      navigation.activation.from.url;
    var card = tagCardForUrl(from);
    if (card && e.viewTransition.finished) {
      // clear once settled so the name can't linger and block later nav
      e.viewTransition.finished.then(function () {
        card.style.viewTransitionName = "";
      }, function () {});
    }
  });
})();
