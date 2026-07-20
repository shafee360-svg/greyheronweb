// ============================================================
//  gh-scroll.js — Scroll-driven motion for the home page
//  - Hero content zooms away in 3D as it scrolls past.
//  - Sections fade + rise into view once, the first time seen.
//  - Decorative motifs drift at different depths (parallax).
//  Fully inert under prefers-reduced-motion. Parallax speed is
//  softened on touch devices. registerParallax() is the same
//  hook future PNG illustration layers (fed from Airtable) will
//  use — no separate system needed when those arrive.
// ============================================================
(function () {
  'use strict';

  const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;

  const parallaxEls = []; // { el, speed }
  let ticking = false;
  let heroActive = false;
  let hero, heroInner;

  function clamp01(n) { return Math.max(0, Math.min(1, n)); }

  // ── Hero zoom-away ──
  function updateHero() {
    const rect = hero.getBoundingClientRect();
    const progress = clamp01(-rect.top / rect.height);
    const scale = 1 - progress * 0.22;
    const z = progress * -260;
    const lift = progress * -36;
    heroInner.style.transform =
      `perspective(1200px) translateZ(${z}px) translateY(${lift}px) scale(${scale})`;
    heroInner.style.opacity = clamp01(1 - progress * 1.15);
  }

  // ── Depth parallax ──
  // Composes on top of each element's own CSS transform (rotate, mirror,
  // centering translate, …) rather than overwriting it — read once at
  // registration time since that's the pre-parallax authored value.
  // depthSpeed (optional) shrinks the element with an explicit scale() as
  // it moves away from the viewport's vertical center — the same "zoom"
  // technique the hero title uses, rather than relying on translateZ +
  // perspective, whose visible effect is too subtle to read at small Z.
  function updateParallax() {
    const center = window.innerHeight / 2;
    parallaxEls.forEach(({ el, base, speed, depthSpeed }) => {
      const rect = el.getBoundingClientRect();
      const dist = center - (rect.top + rect.height / 2);
      const offsetY = dist * speed;
      const scalePart = depthSpeed
        ? ` scale(${(1 - Math.min(Math.abs(dist) * depthSpeed, 0.45)).toFixed(3)})`
        : '';
      el.style.transform = `${base} translateY(${offsetY.toFixed(1)}px)${scalePart}`;
    });
  }

  function onFrame() {
    ticking = false;
    if (heroActive) updateHero();
    if (parallaxEls.length) updateParallax();
  }
  function requestFrame() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onFrame);
  }

  // Exposed so future asset layers (Airtable-fed PNGs) can join the
  // same depth system as the existing SVG motifs. depthSpeed is optional —
  // when set, the element also shrinks as it moves away from center,
  // reading as it zooming away in depth.
  function registerParallax(el, speed, depthSpeed) {
    if (!el || REDUCE_MOTION) return;
    const damp = IS_TOUCH ? 0.4 : 1;
    const computed = getComputedStyle(el).transform;
    const base = (computed && computed !== 'none') ? computed : '';
    parallaxEls.push({ el, base, speed: speed * damp, depthSpeed: depthSpeed ? depthSpeed * damp : 0 });
    requestFrame();
  }

  function initParallaxMotifs() {
    document.querySelectorAll('[data-gh-depth]').forEach(el => {
      const speed = parseFloat(el.dataset.ghDepth);
      if (speed) registerParallax(el, speed);
    });
  }

  function initHero() {
    if (REDUCE_MOTION) return;
    hero = document.querySelector('.hr-hero, .hr-page-hero');
    heroInner = hero && hero.querySelector('.hr-hero__inner, .hr-page-hero__inner');
    if (!hero || !heroInner || !('IntersectionObserver' in window)) return;
    new IntersectionObserver((entries) => {
      heroActive = entries[0].isIntersecting;
      if (heroActive) requestFrame();
    }, { rootMargin: '50% 0px 50% 0px' }).observe(hero);
  }

  // ── Reveal-on-scroll ──
  function initReveal() {
    const targets = document.querySelectorAll('.gh-reveal');
    if (!targets.length) return;
    if (REDUCE_MOTION || !('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(el => io.observe(el));
  }

  function init() {
    initHero();
    initParallaxMotifs();
    initReveal();
    if (!REDUCE_MOTION) {
      window.addEventListener('scroll', requestFrame, { passive: true });
      window.addEventListener('resize', requestFrame);
    }
  }

  window.GH_SCROLL = { registerParallax };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
