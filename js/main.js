/* ==========================================================================
   Riyal — landing page behaviour (no dependencies)
   1. Links from js/links.js      2. EN ⇄ AR language toggle
   3. Scroll reveal               4. Nav state, progress, scroll-spy
   5. Hero coin (tilt + tap-flip)
   Each block is isolated: if one fails, the page still works.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var safe = function (fn) { try { fn(); } catch (e) { if (window.console) console.error(e); } };

  /* ---------- 1 · Links ---------- */
  safe(function () {
    var cfg = window.RIYAL_LINKS || {};
    $$('[data-link]').forEach(function (el) {
      var url = String(cfg[el.getAttribute('data-link')] || '').trim();
      var hasFallback = el.hasAttribute('href');

      if (url) {
        el.setAttribute('href', url);
        if (/^https?:/i.test(url)) { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener noreferrer'); }
        el.classList.remove('is-soon');
        el.removeAttribute('aria-disabled');
        el.removeAttribute('role');
      } else if (!hasFallback) {
        // No URL yet → "Coming soon" state
        el.classList.add('is-soon');
        el.setAttribute('aria-disabled', 'true');
        el.setAttribute('role', 'link');
      }
    });
  });

  /* ---------- 2 · Language (EN ⇄ AR) ---------- */
  safe(function () {
    var toggle = $('[data-lang-toggle]');
    var TITLES = {
      en: 'Riyal ريال | Know where your money goes',
      ar: 'ريال | اعرف إلى أين يذهب مالك'
    };

    function setLang(lang) {
      var ar = lang === 'ar';
      root.lang = lang;
      root.dir = ar ? 'rtl' : 'ltr';

      $$('[data-ar]').forEach(function (el) {
        if (el.getAttribute('data-en') === null) {
          el.setAttribute('data-en', el.textContent.trim());
          el.setAttribute('data-lang0', el.getAttribute('lang') || '');
        }
        el.textContent = ar ? el.getAttribute('data-ar') : el.getAttribute('data-en');
        // language-of-part: Latin text inside Arabic mode (and vice-versa) keeps the right lang tag
        var l = ar ? el.getAttribute('data-ar-lang') : el.getAttribute('data-lang0');
        if (l) el.setAttribute('lang', l); else el.removeAttribute('lang');
      });

      $$('[data-ar-label]').forEach(function (el) {
        if (el.getAttribute('data-en-label') === null) el.setAttribute('data-en-label', el.getAttribute('aria-label') || '');
        el.setAttribute('aria-label', ar ? el.getAttribute('data-ar-label') : el.getAttribute('data-en-label'));
      });

      document.title = TITLES[lang];
      if (toggle) {
        toggle.textContent = ar ? 'English' : 'العربية';
        toggle.setAttribute('lang', ar ? 'en' : 'ar');
      }
    }

    // First paint language was already set by the inline <script> in <head>.
    if (root.lang === 'ar') setLang('ar');

    if (toggle) {
      toggle.addEventListener('click', function () {
        var next = root.lang === 'ar' ? 'en' : 'ar';
        setLang(next);
        try { localStorage.setItem('riyal-lang', next); } catch (e) {}
      });
    }
  });

  /* ---------- 3 · Scroll reveal ---------- */
  safe(function () {
    // Auto-stagger the children of any .stagger container
    $$('.stagger').forEach(function (parent) {
      Array.prototype.forEach.call(parent.children, function (child, i) {
        child.classList.add('reveal');
        child.style.setProperty('--d', i);
      });
    });

    if (reduceMotion || !('IntersectionObserver' in window)) return; // everything stays visible

    root.classList.add('reveal-on');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    $$('.reveal, .observe').forEach(function (el) { io.observe(el); });
  });

  /* ---------- 4 · Nav: stuck border, progress line, scroll-spy ---------- */
  safe(function () {
    var nav = $('.nav');
    var bar = $('.progress');
    var ticking = false;

    function update() {
      var y = window.pageYOffset || root.scrollTop;
      var max = root.scrollHeight - window.innerHeight;
      if (nav) nav.classList.toggle('is-stuck', y > 8);
      if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1).toFixed(4) : 0) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();

    if ('IntersectionObserver' in window) {
      var links = {};
      $$('.nav__links a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
      // Observe every section, not just the ones in the nav — entering a section without a
      // nav link (e.g. App preview, Links) clears the highlight instead of leaving a stale one.
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          Object.keys(links).forEach(function (k) { links[k].removeAttribute('aria-current'); });
          if (links[e.target.id]) links[e.target.id].setAttribute('aria-current', 'true');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      $$('main > section[id]').forEach(function (s) { spy.observe(s); });
    }
  });

  /* ---------- 5 · Hero coin: pointer tilt (desktop) + tap/click flip ---------- */
  safe(function () {
    var wrap = $('[data-coin]');
    if (!wrap || reduceMotion) return;
    var tilt = $('.coin3d__tilt', wrap);
    var flipping = false;

    if (window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var area = wrap.closest('.hero') || wrap;
      area.addEventListener('pointermove', function (e) {
        if (flipping) return;
        var r = wrap.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;   // -0.5 … 0.5
        var y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        tilt.style.setProperty('--ry', (x * 22).toFixed(2) + 'deg');
        tilt.style.setProperty('--rx', (-y * 16).toFixed(2) + 'deg');
      });
      area.addEventListener('pointerleave', function () {
        tilt.style.setProperty('--ry', '0deg');
        tilt.style.setProperty('--rx', '0deg');
      });
    }

    // Same "edge-on swap" trick as the app's flipping coin: turn to 90° (invisible), jump to -90°, finish.
    tilt.addEventListener('click', function () {
      if (flipping || !tilt.animate) return;
      flipping = true;
      tilt.animate([
        { transform: 'rotateY(0deg)', offset: 0 },
        { transform: 'rotateY(90deg)', offset: 0.5, easing: 'ease-in' },
        { transform: 'rotateY(-90deg)', offset: 0.5 },
        { transform: 'rotateY(0deg)', offset: 1, easing: 'ease-out' }
      ], { duration: 720, easing: 'ease-in-out' }).onfinish = function () { flipping = false; };
    });
  });
})();
