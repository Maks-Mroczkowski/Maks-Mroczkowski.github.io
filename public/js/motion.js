/*
  Panel outlines that draw themselves in, shared by Home and Projects.

  - Each outlined panel (a chapter, a project, "Where I am now") that starts
    below the fold has its outline drawn as it comes up the screen. The stroke
    starts on the panel's left edge, level with its dot (or its heading), and
    wraps round the text both ways to meet on the far side. The text inside
    never moves.
  - While it draws, the panel's CSS outline is hidden (.rv-g) and an SVG
    stroke in the same place stands in. When it finishes, the CSS outline fades
    back in (.rv-done) and the SVG goes, so later resizes need nothing from here.
  - On Projects, a project's dot pulses once as its outline starts. On Home
    the dots belong to the line (home.js) and are left alone.
  - Panels already on screen at load are left alone. Without JavaScript, or
    with reduced motion, every outline simply shows.
*/
(function () {
  'use strict';

  var PANELS = '.ch, .now, .pj';
  var DRAW_MS = 1800;
  var EASE = 'cubic-bezier(.55,0,.25,1)'; // eases in from the dot, glides round, settles where the two ends meet
  var TRIGGER = '0px 0px -40% 0px';       // start once the panel's top is 60% of the way up the screen
  var NS = 'http://www.w3.org/2000/svg';

  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (reduced || !('IntersectionObserver' in window) || !Element.prototype.animate) return;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // Where the stroke starts, from the panel's top: level with the panel's dot,
  // or else the middle of its heading's first line.
  function startY(panel, top) {
    var dot = panel.querySelector('.dot');
    if (dot) {
      var d = dot.getBoundingClientRect();
      return d.top + d.height / 2 - top;
    }
    var h = panel.querySelector('h2');
    if (!h) return 0;
    return h.getBoundingClientRect().top - top + (parseFloat(getComputedStyle(h).lineHeight) || 0) / 2;
  }

  // A closed loop round a w x h rounded rectangle, inset by k so a stroke 2k
  // wide sits where the CSS outline does. It starts at height y on the left
  // edge and goes clockwise (cw) or anticlockwise.
  function loop(w, h, r, y, k, cw) {
    var x0 = k, y0 = k, x1 = w - k, y1 = h - k, s = cw ? 1 : 0;
    var rr = Math.max(0, Math.min(r - k, (x1 - x0) / 2, (y1 - y0) / 2));
    var a = ' A' + rr + ' ' + rr + ' 0 0 ' + s + ' ';
    y = clamp(y, y0 + rr, y1 - rr);
    return 'M' + x0 + ' ' + y + (cw
      ? ' V' + (y0 + rr) + a + (x0 + rr) + ' ' + y0 + ' H' + (x1 - rr) + a + x1 + ' ' + (y0 + rr) +
        ' V' + (y1 - rr) + a + (x1 - rr) + ' ' + y1 + ' H' + (x0 + rr) + a + x0 + ' ' + (y1 - rr)
      : ' V' + (y1 - rr) + a + (x0 + rr) + ' ' + y1 + ' H' + (x1 - rr) + a + x1 + ' ' + (y1 - rr) +
        ' V' + (y0 + rr) + a + (x1 - rr) + ' ' + y0 + ' H' + (x0 + rr) + a + x0 + ' ' + (y0 + rr)) + ' Z';
  }

  function draw(panel) {
    var box = panel.getBoundingClientRect();
    var w = box.width, h = box.height;
    var r = parseFloat(getComputedStyle(panel).borderTopLeftRadius) || 0;
    var y = startY(panel, box.top);

    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'rv-frame');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    panel.appendChild(svg);

    // Two strokes leave the start point in opposite directions; each draws half the loop.
    var runs = [true, false].map(function (cw) {
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', loop(w, h, r, y, 0.75, cw));
      svg.appendChild(p);
      var half = p.getTotalLength() / 2;
      p.style.strokeDasharray = half + 'px ' + (half * 3) + 'px';
      p.style.strokeDashoffset = half + 'px';
      return p.animate(
        [{ strokeDashoffset: half + 'px' }, { strokeDashoffset: '0px' }],
        { duration: DRAW_MS, easing: EASE, fill: 'forwards' }
      ).finished;
    });

    var dot = panel.querySelector('.dot:not([data-dot])');
    if (dot) dot.classList.add('pulse');

    // Hand back to the CSS outline: it fades in beneath the stroke, then the stroke
    // fades off it. They can sit a fraction of a pixel apart, so a straight swap
    // would flicker.
    function clean() {
      panel.classList.remove('rv-g', 'rv-done');
      svg.remove();
      if (dot) dot.classList.remove('pulse');
    }
    function done() {
      panel.classList.add('rv-done');
      svg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, delay: 250, fill: 'forwards' })
        .finished.then(clean, clean);
    }
    Promise.all(runs).then(done, done);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      draw(e.target);
    });
  }, { rootMargin: TRIGGER });

  var fold = window.innerHeight || 800;
  Array.prototype.forEach.call(document.querySelectorAll(PANELS), function (panel) {
    if (panel.getBoundingClientRect().top < fold) return;
    panel.classList.add('rv-g');
    io.observe(panel);
  });
})();
