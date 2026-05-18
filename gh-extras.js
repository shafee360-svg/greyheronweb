// ============================================================
//  gh-extras.js  —  Cross-page design system for Grey Heron Books
//  Injects: SVG motif sprite + Tweaks panel.
//  Persists palette / motifs / hero choice across pages via localStorage.
//  On index.html, window.__GH_DEFAULTS (from the EDITMODE-BEGIN
//  block) seeds the initial state and gets written back to disk.
// ============================================================
(function () {
  'use strict';

  // ── State ─────────────────────────────────────────────────
  const STORAGE_KEY = 'gh-tweaks-v1';
  const FALLBACK    = { palette: 'manuscript', motifs: 'bold', hero: 'collage' };

  function loadState() {
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (_) {}
    return {
      ...FALLBACK,
      ...(window.__GH_DEFAULTS || {}),
      ...(stored && typeof stored === 'object' ? stored : {}),
    };
  }
  function saveState(s) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (_) {}
  }

  let state = loadState();

  // ── SVG sprite (motifs + icons) ───────────────────────────
  const SPRITE_HTML = `
    <svg width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">
      <defs>
        <symbol id="m-leaf" viewBox="0 0 200 320">
          <path fill="currentColor" d="M100 8 C 142 38 168 96 168 168 C 168 232 138 286 100 312 C 62 286 32 232 32 168 C 32 96 58 38 100 8 Z"/>
          <path stroke="currentColor" stroke-width="2" fill="none" opacity="0.45" d="M100 14 L100 308"/>
          <g stroke="currentColor" stroke-width="1.4" fill="none" opacity="0.4">
            <path d="M100 40 Q 75 60 50 90"/>
            <path d="M100 40 Q 125 60 150 90"/>
            <path d="M100 80 Q 70 100 42 138"/>
            <path d="M100 80 Q 130 100 158 138"/>
            <path d="M100 130 Q 68 150 38 188"/>
            <path d="M100 130 Q 132 150 162 188"/>
            <path d="M100 180 Q 70 200 44 238"/>
            <path d="M100 180 Q 130 200 156 238"/>
            <path d="M100 230 Q 80 250 60 282"/>
            <path d="M100 230 Q 120 250 140 282"/>
          </g>
        </symbol>
        <symbol id="m-coral" viewBox="0 0 160 220">
          <g fill="currentColor">
            <path d="M76 218 Q 78 170 70 145 Q 60 122 48 110 Q 38 100 36 80 Q 36 60 50 50 Q 60 44 66 30 Q 72 14 80 6 Q 88 14 94 30 Q 100 44 110 50 Q 124 60 124 80 Q 122 100 112 110 Q 100 122 90 145 Q 82 170 84 218 Z" opacity="0.92"/>
            <circle cx="50" cy="58" r="4" opacity="0.6"/>
            <circle cx="110" cy="58" r="4" opacity="0.6"/>
            <circle cx="80" cy="22" r="3" opacity="0.6"/>
            <path d="M30 160 Q 25 140 30 120 Q 35 108 28 96 Q 22 86 26 72 Q 30 60 38 56" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.7"/>
            <path d="M130 160 Q 135 140 130 120 Q 125 108 132 96 Q 138 86 134 72 Q 130 60 122 56" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.7"/>
          </g>
        </symbol>
        <symbol id="m-palm" viewBox="0 0 160 300">
          <g fill="currentColor">
            <!-- Trunk: from crown (88,110) down to base -->
            <path d="M 68 300 Q 72 240 76 195 Q 80 155 84 130 Q 87 118 88 110
                     L 96 112 Q 96 124 93 138 Q 89 162 85 200 Q 81 244 78 300 Z"
                  opacity="0.88"/>
            <!-- Frond: lower-left droop -->
            <path d="M 88 110 Q 50 128 14 168 Q 48 136 74 120 Q 83 114 88 110 Z" opacity="0.9"/>
            <!-- Frond: left -->
            <path d="M 88 110 Q 46 104 6 116 Q 44 100 76 108 Q 84 110 88 110 Z" opacity="0.85"/>
            <!-- Frond: upper-left -->
            <path d="M 88 110 Q 58 84 36 58 Q 60 80 78 98 Q 85 106 88 110 Z" opacity="0.9"/>
            <!-- Frond: upper (slight lean) -->
            <path d="M 88 110 Q 78 76 74 46 Q 90 72 96 104 Q 93 108 88 110 Z" opacity="0.88"/>
            <!-- Frond: upper-right -->
            <path d="M 88 110 Q 118 82 140 56 Q 116 84 100 100 Q 93 107 88 110 Z" opacity="0.9"/>
            <!-- Frond: right -->
            <path d="M 88 110 Q 130 104 156 114 Q 122 100 100 108 Q 92 110 88 110 Z" opacity="0.85"/>
            <!-- Frond: lower-right droop -->
            <path d="M 88 110 Q 126 128 152 166 Q 124 136 106 120 Q 95 114 88 110 Z" opacity="0.9"/>
            <!-- Coconuts -->
            <circle cx="84" cy="119" r="7" opacity="0.75"/>
            <circle cx="95" cy="116" r="6" opacity="0.7"/>
            <circle cx="89" cy="128" r="5" opacity="0.65"/>
          </g>
        </symbol>
        <symbol id="m-shell-scallop" viewBox="0 0 160 130">
          <g fill="currentColor">
            <path d="M80 125 Q 15 105 8 55 Q 5 20 80 8 Q 155 20 152 55 Q 145 105 80 125 Z" opacity="0.9"/>
            <path d="M80 125 L 15 40" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.35"/>
            <path d="M80 125 L 38 16" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.35"/>
            <path d="M80 125 L 65 9"  stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.35"/>
            <path d="M80 125 L 95 9"  stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.35"/>
            <path d="M80 125 L 122 16" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.35"/>
            <path d="M80 125 L 145 40" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.35"/>
            <path d="M22 52 Q 30 28 50 18 Q 80 8 110 18 Q 130 28 138 52" stroke="currentColor" stroke-width="3" fill="none" opacity="0.5" stroke-linecap="round"/>
          </g>
        </symbol>
        <symbol id="m-shell-conch" viewBox="0 0 130 180">
          <g fill="currentColor">
            <path d="M65 10 Q 95 20 105 55 Q 112 82 104 112 Q 95 138 78 155 Q 62 170 45 168 Q 28 164 22 148 Q 16 132 26 118 Q 38 104 40 84 Q 42 66 34 48 Q 28 34 36 20 Q 46 10 65 10 Z" opacity="0.88"/>
            <path d="M60 35 Q 78 42 82 62 Q 84 76 72 84 Q 60 90 50 82 Q 42 74 48 62 Q 54 52 66 56" stroke="currentColor" stroke-width="2" fill="none" opacity="0.4" stroke-linecap="round"/>
            <path d="M100 120 Q 115 138 112 158 Q 108 172 98 178" stroke="currentColor" stroke-width="5" fill="none" opacity="0.65" stroke-linecap="round"/>
          </g>
        </symbol>
        <symbol id="m-heron" viewBox="0 0 240 280">
          <g fill="currentColor">
            <path d="M70 180 Q 60 150 78 130 Q 100 116 130 122 Q 160 128 178 144 Q 190 156 188 172 Q 184 188 168 192 L 90 198 Q 74 198 70 180 Z"/>
            <path d="M124 130 Q 110 100 116 70 Q 122 50 138 42 Q 154 36 162 50 Q 154 56 150 70 Q 146 88 154 122" stroke="currentColor" stroke-width="9" fill="none" stroke-linecap="round"/>
            <ellipse cx="158" cy="50" rx="13" ry="11"/>
            <path d="M168 48 L 198 56 L 168 56 Z"/>
            <path d="M110 192 L 102 250 L 96 258 M 100 252 L 112 252" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/>
            <path d="M148 192 L 142 250 L 136 258 M 140 252 L 152 252" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/>
            <path d="M86 158 Q 116 148 158 162 Q 150 172 116 178 Q 96 180 86 168 Z" opacity="0.5"/>
          </g>
        </symbol>
        <symbol id="m-glyph" viewBox="0 0 24 24">
          <g fill="currentColor">
            <path d="M12 4 L 18 12 L 12 20 L 6 12 Z" opacity="0.9"/>
            <circle cx="2"  cy="12" r="1.4"/>
            <circle cx="22" cy="12" r="1.4"/>
          </g>
        </symbol>
        <symbol id="m-wave" viewBox="0 0 1200 80" preserveAspectRatio="none">
          <path fill="currentColor" d="M0 80 L 0 30 Q 100 0 200 24 T 400 30 T 600 22 T 800 30 T 1000 24 T 1200 30 L 1200 80 Z"/>
          <path fill="currentColor" opacity="0.6" d="M0 80 L 0 48 Q 120 32 240 50 T 480 48 T 720 50 T 960 44 T 1200 50 L 1200 80 Z"/>
        </symbol>
        <symbol id="i-oral" viewBox="0 0 44 44">
          <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 28 V 18 a 8 8 0 0 1 16 0 v 10"/>
            <path d="M14 28 a 4 4 0 0 1 -4 -4 v -2 a 4 4 0 0 1 4 -4"/>
            <path d="M30 28 a 4 4 0 0 0 4 -4 v -2 a 4 4 0 0 0 -4 -4"/>
            <path d="M30 28 a 4 6 0 0 1 -4 6 h -3"/>
          </g>
        </symbol>
        <symbol id="i-hand" viewBox="0 0 44 44">
          <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 26 V 16 a 2 2 0 0 1 4 0 v 6"/>
            <path d="M16 22 V 12 a 2 2 0 0 1 4 0 v 10"/>
            <path d="M20 22 V 11 a 2 2 0 0 1 4 0 v 11"/>
            <path d="M24 22 V 14 a 2 2 0 0 1 4 0 v 10"/>
            <path d="M12 22 a 4 8 0 0 0 0 12 c 0 0 6 4 12 0 a 8 8 0 0 0 4 -8 V 18"/>
          </g>
        </symbol>
        <symbol id="i-book" viewBox="0 0 44 44">
          <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 14 V 34"/>
            <path d="M22 14 Q 16 11 10 12 V 32 Q 16 31 22 34"/>
            <path d="M22 14 Q 28 11 34 12 V 32 Q 28 31 22 34"/>
            <path d="M14 18 H 18 M 14 22 H 19"/>
            <path d="M26 18 H 30 M 25 22 H 30"/>
          </g>
        </symbol>
      </defs>
    </svg>`;

  function injectSprite() {
    if (document.getElementById('gh-sprite')) return;
    const div = document.createElement('div');
    div.id = 'gh-sprite';
    div.innerHTML = SPRITE_HTML.trim();
    document.body.insertBefore(div, document.body.firstChild);
  }

  // ── Tweaks panel ──────────────────────────────────────────
  const PANEL_HTML = `
    <div class="hr-tweaks" id="hr-tweaks" role="dialog" aria-label="Tweaks">
      <div class="hr-tweaks__head">
        <span>Tweaks</span>
        <button class="hr-tweaks__close" id="hr-tweaks-close" aria-label="Close tweaks">×</button>
      </div>
      <div class="hr-tweaks__body">
        <div class="hr-tweak-group">
          <span class="hr-tweak-group__label">Color Palette</span>
          <div class="hr-swatches" id="hr-palette">
            <button class="hr-swatch" data-value="ocean" type="button">
              <span class="hr-swatch__chip">
                <span style="background:#081a2c"></span>
                <span style="background:#f7f0e1"></span>
                <span style="background:#c45f22"></span>
                <span style="background:#b8892a"></span>
              </span>
              <span class="hr-swatch__name">Ocean Dusk</span>
            </button>
            <button class="hr-swatch" data-value="lagoon" type="button">
              <span class="hr-swatch__chip">
                <span style="background:#0a322f"></span>
                <span style="background:#f4ede0"></span>
                <span style="background:#d96a3a"></span>
                <span style="background:#c0902a"></span>
              </span>
              <span class="hr-swatch__name">Lagoon</span>
            </button>
            <button class="hr-swatch" data-value="manuscript" type="button">
              <span class="hr-swatch__chip">
                <span style="background:#1f120a"></span>
                <span style="background:#f4e9d1"></span>
                <span style="background:#b8421a"></span>
                <span style="background:#a87819"></span>
              </span>
              <span class="hr-swatch__name">Manuscript</span>
            </button>
          </div>
        </div>

        <div class="hr-tweak-group" data-only-home="true">
          <span class="hr-tweak-group__label">Hero Treatment</span>
          <div class="hr-segmented" id="hr-hero">
            <button data-value="collage" type="button">Collage</button>
            <button data-value="shelf" type="button">Shelf</button>
            <button data-value="editorial" type="button">Editorial</button>
          </div>
        </div>

        <div class="hr-tweak-group">
          <span class="hr-tweak-group__label">Motif Intensity</span>
          <div class="hr-segmented" id="hr-motifs">
            <button data-value="subtle" type="button">Subtle</button>
            <button data-value="medium" type="button">Medium</button>
            <button data-value="bold" type="button">Bold</button>
          </div>
        </div>
      </div>
    </div>`;

  function injectPanel() {
    if (document.getElementById('hr-tweaks')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = PANEL_HTML.trim();
    document.body.appendChild(wrap.firstChild);
  }

  // ── Apply state ───────────────────────────────────────────
  const isHome = () => {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    return path === 'index.html' || path === '';
  };

  function applyState() {
    const body = document.body;
    body.classList.add('home-redesign');
    body.setAttribute('data-palette', state.palette);
    body.setAttribute('data-motifs',  state.motifs);
    body.setAttribute('data-hero',    state.hero);
    syncControls();
  }
  function syncControls() {
    const panel = document.getElementById('hr-tweaks');
    if (!panel) return;
    panel.querySelectorAll('#hr-palette .hr-swatch').forEach(b => {
      b.classList.toggle('is-active', b.dataset.value === state.palette);
    });
    panel.querySelectorAll('#hr-motifs button').forEach(b => {
      b.classList.toggle('is-active', b.dataset.value === state.motifs);
    });
    panel.querySelectorAll('#hr-hero button').forEach(b => {
      b.classList.toggle('is-active', b.dataset.value === state.hero);
    });
  }
  function setKey(key, value) {
    state = { ...state, [key]: value };
    saveState(state);
    applyState();
    try {
      window.parent.postMessage({
        type: '__edit_mode_set_keys',
        edits: { [key]: value },
      }, '*');
    } catch (_) {}
  }

  // ── Wire panel + edit-mode protocol ───────────────────────
  function wirePanel() {
    const panel    = document.getElementById('hr-tweaks');
    const closeBtn = document.getElementById('hr-tweaks-close');
    if (!panel) return;

    // Hero tweak group only on home
    panel.querySelectorAll('[data-only-home]').forEach(el => {
      if (!isHome()) el.style.display = 'none';
    });

    panel.querySelectorAll('#hr-palette .hr-swatch').forEach(b => {
      b.addEventListener('click', () => setKey('palette', b.dataset.value));
    });
    panel.querySelectorAll('#hr-motifs button').forEach(b => {
      b.addEventListener('click', () => setKey('motifs', b.dataset.value));
    });
    panel.querySelectorAll('#hr-hero button').forEach(b => {
      b.addEventListener('click', () => setKey('hero', b.dataset.value));
    });
    closeBtn.addEventListener('click', () => {
      panel.classList.remove('is-open');
      try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (_) {}
    });

    // Edit-mode protocol — listener FIRST, then announce availability
    window.addEventListener('message', (e) => {
      const msg = e.data;
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === '__activate_edit_mode')   panel.classList.add('is-open');
      if (msg.type === '__deactivate_edit_mode') panel.classList.remove('is-open');
    });
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (_) {}
  }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    injectSprite();
    injectPanel();
    applyState();
    wirePanel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
