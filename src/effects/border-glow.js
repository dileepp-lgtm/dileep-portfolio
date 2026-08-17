/* ============================================================
   BorderGlow — vanilla port of the React Bits <BorderGlow />.

   All the visuals live in CSS; the component's only JS job is to publish
   two custom properties as the pointer moves:
     --edge-proximity  0-100, how close the pointer is to the card edge
     --cursor-angle    direction from the card centre to the pointer
   The maths below is the component's, unchanged. One delegated listener
   serves every card instead of one listener per card.
   ============================================================ */
(function (global) {
  'use strict';

  function getEdgeProximity(cx, cy, x, y) {
    var dx = x - cx, dy = y - cy;
    var kx = Infinity, ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }

  function getCursorAngle(cx, cy, x, y) {
    var dx = x - cx, dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    var degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  }

  function init(selector) {
    var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasHover = !global.matchMedia || global.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reduce || !hasHover) return;

    var cards = Array.prototype.slice.call(document.querySelectorAll(selector));
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.classList.add('glow-card');
      // the outer glow layer the component renders as <span className="edge-light" />
      if (!card.querySelector(':scope > .edge-light')) {
        var span = document.createElement('span');
        span.className = 'edge-light';
        span.setAttribute('aria-hidden', 'true');
        card.insertBefore(span, card.firstChild);
      }
    });

    var pending = false, lastEvt = null;

    function apply() {
      pending = false;
      var e = lastEvt;
      if (!e) return;
      var card = e.target.closest ? e.target.closest('.glow-card') : null;
      if (!card) return;
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var cx = rect.width / 2, cy = rect.height / 2;
      card.style.setProperty('--edge-proximity', (getEdgeProximity(cx, cy, x, y) * 100).toFixed(3));
      card.style.setProperty('--cursor-angle', getCursorAngle(cx, cy, x, y).toFixed(3) + 'deg');
    }

    var onMove = function (e) {
      if (!(e.target.closest && e.target.closest('.glow-card'))) return;
      lastEvt = e;
      if (pending) return;
      pending = true;
      requestAnimationFrame(apply);
    };
    document.addEventListener('pointermove', onMove, { passive: true });

    /* disposer so React (StrictMode double-mount) doesn't stack listeners */
    return {
      destroy: function () {
        document.removeEventListener('pointermove', onMove);
        cards.forEach(function (card) {
          card.classList.remove('glow-card');
          var el = card.querySelector(':scope > .edge-light');
          if (el) el.remove();
          card.style.removeProperty('--edge-proximity');
          card.style.removeProperty('--cursor-angle');
        });
      }
    };
  }

  global.BorderGlow = { init: init };
})(window);
