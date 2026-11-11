/*
  Home page behaviour: the orange margin line ("First line").

  - The page is served in its finished state (whole line drawn, every dot and
    year filled), so it reads correctly without JavaScript.
  - With JavaScript, the line draws as you scroll. Its tip sits around the middle
    of the screen, catches up quickly near the top, and speeds up over the last
    screen so the whole line is drawn when you reach the bottom.
  - Each dot fills, and each year label darkens, as the line reaches it.
  - Once per visit (sessionStorage), the small year beside the headline spins
    from 2023 to 2026 while the line draws down to the opening dot.
  - Reduced motion, or a window too tall to scroll, shows the finished state.
*/
(function () {
  'use strict';

  var INTRO_MS = 1200;
  var SEEN_KEY = 'mm-first-line';

  var site = document.querySelector('.site');
  var rule = site && site.querySelector('[data-rule]');
  var drawn = site && site.querySelector('.rule-drawn');
  var odo = site && site.querySelector('.odo-strip');
  if (!site || !rule || !drawn) return;

  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var KEYS = Array.prototype.map.call(site.querySelectorAll('[data-dot]'), function (d) {
    return d.getAttribute('data-dot');
  });

  var motion = 'static';
  var intro = 'done';
  var geo = null;
  var raf = 0;
  var rraf = 0;
  var timer = 0;
  var ease = false;
  var lastDrawn = -1;
  var onCount = -1;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function setMode(m, i) {
    motion = m;
    intro = i;
    site.setAttribute('data-motion', m);
    site.setAttribute('data-intro', i);
  }

  // Dots carry data-dot="key"; the year label for the same chapter carries data-for="key".
  function setOn(on) {
    KEYS.forEach(function (k) {
      var els = site.querySelectorAll('[data-dot="' + k + '"], [data-for="' + k + '"]');
      Array.prototype.forEach.call(els, function (el) { el.classList.toggle('on', !!on[k]); });
    });
  }

  function allOn() {
    var o = {};
    KEYS.forEach(function (k) { o[k] = 1; });
    return o;
  }

  // The headline's year: p3 shows 2023, p6 shows 2026.
  function setYear(p) {
    if (!odo) return;
    odo.classList.remove('p3', 'p4', 'p5', 'p6');
    odo.classList.add('p' + p);
  }

  function draw(px, mode) {
    drawn.style.transition = mode === 'intro'
      ? 'height ' + INTRO_MS + 'ms cubic-bezier(.16,1,.3,1)'
      : (mode === 'ease' ? 'height .4s cubic-bezier(.33,1,.68,1)' : 'none');
    drawn.style.height = px == null ? '100%' : Math.max(0, px) + 'px';
  }

  function scrollable() {
    var vh = window.innerHeight || 0;
    return document.documentElement.scrollHeight - vh > Math.max(40, vh * 0.25);
  }

  function measure() {
    var sy = window.scrollY || 0;
    var rr = rule.getBoundingClientRect();
    var dots = [];
    var openDot = null;
    Array.prototype.forEach.call(site.querySelectorAll('[data-dot]'), function (d) {
      var b = d.getBoundingClientRect();
      if (!b.height) return;
      var y = b.top + sy + b.height / 2;
      var k = d.getAttribute('data-dot');
      if (k === 'o') openDot = y; else dots.push({ k: k, y: y });
    });
    var lineTop = rr.top + sy;
    geo = {
      lineTop: lineTop,
      lineLen: rr.height,
      dots: dots,
      openDot: openDot == null ? lineTop : openDot,
      maxScroll: Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    };
  }

  function update(force) {
    if (!geo || motion !== 'live' || intro !== 'done') return;
    var sy = window.scrollY || 0;
    var vh = window.innerHeight || 800;
    var tip = sy + vh * 0.5;
    var need = geo.lineTop + geo.lineLen;
    var endRead = geo.maxScroll + vh * 0.5;
    if (geo.maxScroll > 0 && endRead < need) {
      var zone = Math.min(geo.maxScroll, vh * 0.8);
      tip += (need - endRead) * clamp((sy - (geo.maxScroll - zone)) / zone, 0, 1);
    }
    tip = Math.max(geo.openDot, Math.min(tip, geo.openDot + sy * 2));
    var d = clamp(tip - geo.lineTop, 0, geo.lineLen);
    if (force || ease || Math.abs(d - lastDrawn) >= 0.5) {
      draw(d, ease ? 'ease' : 'none');
      ease = false;
      lastDrawn = d;
    }
    var on = { o: 1 };
    var n = 1;
    geo.dots.forEach(function (p) { if (tip >= p.y - 1) { on[p.k] = 1; n++; } });
    if (force || n !== onCount) { setOn(on); onCount = n; }
  }

  function finished(mode) {
    clearTimeout(timer);
    draw(null, 'none');
    setMode(mode, 'done');
    setOn(allOn());
    setYear(6);
    onCount = -1;
  }

  function endIntro(early) {
    if (intro === 'done') return;
    clearTimeout(timer);
    try { window.sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
    ease = !!early;
    setMode('live', 'done');
    measure();
    update(true);
  }

  function runIntro() {
    setMode('live', 'pending');
    setOn({});
    setYear(3);
    draw(0, 'none');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        measure();
        draw(geo ? geo.openDot - geo.lineTop : 0, 'intro');
        setMode('live', 'running');
        setYear(6);
        timer = setTimeout(function () { endIntro(false); }, INTRO_MS + 40);
      });
    });
  }

  function start() {
    measure();
    if (!scrollable()) { finished('static'); return; }
    if (reduced) { finished('reduced'); return; }
    var seen = false;
    try { seen = window.sessionStorage.getItem(SEEN_KEY) === '1'; } catch (e) {}
    if (seen || (window.scrollY || 0) > 40) {
      setMode('live', 'done');
      measure();
      update(true);
      return;
    }
    runIntro();
  }

  function onResize() {
    if (rraf) return;
    rraf = requestAnimationFrame(function () {
      rraf = 0;
      measure();
      var can = scrollable();
      if (!can && motion !== 'static') { finished('static'); return; }
      if (can && motion === 'static') { start(); return; }
      update(true);
    });
  }

  window.addEventListener('scroll', function () {
    if (intro === 'running' && (window.scrollY || 0) > 24) endIntro(true);
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; update(false); });
  }, { passive: true });
  window.addEventListener('resize', onResize);
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(site);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);

  // #EatABRHack video: the still frame and play button stand in until the file exists.
  // Put the video at assets/eatabrhack.mp4 and the button swaps in a real player.
  Array.prototype.forEach.call(site.querySelectorAll('.play[data-video-src]'), function (btn) {
    btn.addEventListener('click', function () {
      var box = btn.closest('.box');
      if (!box) return;
      var v = document.createElement('video');
      v.src = btn.getAttribute('data-video-src');
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      v.setAttribute('aria-label', '#EatABRHack video');
      v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000';
      box.innerHTML = '';
      box.appendChild(v);
      v.focus();
    });
  });

  start();
})();
