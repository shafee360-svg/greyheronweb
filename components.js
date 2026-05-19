// ============================================================
//  components.js — Shared Header & Footer for every page
// ============================================================

(function () {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  function isActive(href) {
    return currentPage === href ? 'aria-current="page"' : '';
  }

  function isCartPage() {
    return currentPage === 'cart.html';
  }

  // ── Header HTML ──
  // The nav lives INSIDE the header so it participates in the desktop flex
  // layout. The backdrop-filter that previously trapped position:fixed children
  // has been moved to a ::before pseudo-element in style.css, so the header
  // itself no longer creates a containing block for the fixed mobile nav.
  const headerHTML = `
    <header class="site-header">
      <div class="site-header__inner">

        <a href="index.html" class="site-logo">
          <img
            src="https://raw.githubusercontent.com/shafee360-svg/greyheron/refs/heads/main/greyheron_books_logo.png"
            alt="Grey Heron Books"
            class="site-logo__img"
            width="44"
            height="44"
          >
          <span class="site-logo__text">Grey Heron Books</span>
        </a>

        <nav class="site-nav" id="site-nav" aria-label="Main navigation">
          <ul>
            <li><a href="index.html"      ${isActive('index.html')}>Home</a></li>
            <li><a href="books.html"      ${isActive('books.html')}>Collection</a></li>
            <li><a href="characters.html" ${isActive('characters.html')}>Characters</a></li>
            <li><a href="elements.html"   ${isActive('elements.html')}>Themes</a></li>
            <li><a href="about.html"      ${isActive('about.html')}>About</a></li>
          </ul>
        </nav>

        <button class="nav-toggle" id="nav-toggle" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>

        <a href="cart.html" class="cart-nav-icon${isCartPage() ? ' cart-nav-icon--active' : ''}" aria-label="View cart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
               stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <span class="cart-badge" style="display:none;">0</span>
        </a>

      </div>
    </header>
  `;

  // ── Footer HTML ──
  const footerHTML = `
    <footer class="site-footer">
      <div class="site-footer__inner">
        <div class="site-footer__brand">
          <span class="site-logo__text">Grey Heron Books</span>
          <p>Preserving Maldivian folklore<br>for future generations.</p>
        </div>

        <nav class="site-footer__nav">
          <h4>Explore</h4>
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="books.html">Collection</a></li>
            <li><a href="elements.html">Themes</a></li>
          </ul>
        </nav>

        <div class="site-footer__contact">
          <h4>Contact</h4>
          <p>Order books or ask questions via WhatsApp.</p>
          <a href="https://wa.me/9609387095" class="btn-outline-light" target="_blank" rel="noopener">WhatsApp Us</a>
        </div>
      </div>

      <div class="site-footer__bottom">
        <p>&copy; ${new Date().getFullYear()} Grey Heron Books. All Rights Reserved.</p>
      </div>
    </footer>
  `;

  // ── Inject into the page ──
  document.addEventListener('DOMContentLoaded', () => {
    const headerSlot = document.getElementById('site-header');
    const footerSlot = document.getElementById('site-footer');

    if (headerSlot) headerSlot.outerHTML = headerHTML;
    if (footerSlot) footerSlot.outerHTML = footerHTML;

    // ── Mobile nav toggle ──
    const toggle = document.getElementById('nav-toggle');
    const nav    = document.getElementById('site-nav');

    function closeNav() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    if (toggle && nav) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
      });

      // Clicking a nav link closes the menu
      nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeNav);
      });

      // Clicking anywhere outside the nav or toggle closes it
      document.addEventListener('click', (e) => {
        if (nav.classList.contains('is-open') &&
            !nav.contains(e.target) &&
            !toggle.contains(e.target)) {
          closeNav();
        }
      });
    }
  });
})();
