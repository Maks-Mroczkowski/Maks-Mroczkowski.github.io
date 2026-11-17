/*
  Scroll reveals, shared by Home and Projects.

  - Each panel (a chapter, a project, "Where I am now", the ending) that starts
    below the fold reveals as it scrolls into view: its outline fades in and
    its contents rise in, a beat apart, in reading order. Photos also settle
    from a slight zoom. The styles live under .rv-g, .rv-i and .in in each
    page's CSS.
  - On Home the dot and year in the margin belong to the line (home.js), so
    they are never part of a reveal.
  - Anything already on screen when the page loads is left alone, so nothing
    blinks. Without JavaScript, or with reduced motion, everything just shows.
*/
(function () {
  'use strict';

  var GROUPS = '.ch, .now, .end, .pj, .pj-end';
  var STEP_MS = 90;       // the beat between items that arrive together
  var MAX_DELAY_MS = 360;
  var SETTLE_MS = 1700;   // after this the reveal classes come off, so hovers work as normal

  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (reduced || !('IntersectionObserver' in window)) return;

  // What reveals inside a panel: its own children apart from the line's dot and
  // year, with a photo row taken photo by photo.
  function items(group) {
    var out = [];
    Array.prototype.forEach.call(group.children, function (c) {
      if (c.matches('.dot, .yr-tag')) return;
      if (c.matches('.photos')) { out.push.apply(out, c.children); return; }
      out.push(c);
    });
    return out;
  }

  function show(el, delay) {
    if (delay) el.style.setProperty('--rv-d', delay + 'ms');
    el.classList.add('in');
    setTimeout(function () {
      el.classList.remove('rv-g', 'rv-i', 'in');
      el.style.removeProperty('--rv-d');
    }, delay + SETTLE_MS);
  }

  var io = new IntersectionObserver(function (entries) {
    var arrived = entries
      .filter(function (e) { return e.isIntersecting; })
      .map(function (e) { return e.target; })
      .sort(function (a, b) {
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });
    var n = 0;
    arrived.forEach(function (el) {
      io.unobserve(el);
      if (el.classList.contains('rv-g')) { show(el, 0); return; }
      show(el, Math.min(n++ * STEP_MS, MAX_DELAY_MS));
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  var fold = (window.innerHeight || 800) * 0.92;
  function below(el) { return el.getBoundingClientRect().top >= fold; }

  Array.prototype.forEach.call(document.querySelectorAll(GROUPS), function (group) {
    if (below(group)) { group.classList.add('rv-g'); io.observe(group); }
    items(group).forEach(function (el) {
      if (!below(el)) return;
      el.classList.add('rv-i');
      io.observe(el);
    });
  });
})();
