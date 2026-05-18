// ============================================================
//  cart.js — Grey Heron Books Shopping Cart
//  Include this script on every page that needs cart access.
//
//  Depends on: nothing (pure vanilla JS, no airtable.js needed)
//
//  Public API:
//    Cart.add(book)              — add a book object (qty defaults to 1)
//    Cart.remove(id)             — remove a book entirely by record ID
//    Cart.has(id)                — returns true/false
//    Cart.getAll()               — returns array of all cart items
//    Cart.count()                — total number of distinct titles
//    Cart.totalItems()           — sum of all quantities
//    Cart.setQuantity(id, qty)   — set quantity for a book (min 1)
//    Cart.incrementQty(id)       — add 1 to a book's quantity
//    Cart.decrementQty(id)       — subtract 1 (removes if hits 0)
//    Cart.clear()                — empties the cart
//    Cart.onUpdate(fn)           — register a callback fired on every change
//    Cart.renderIcon(container)  — inject nav cart icon + badge
//
//  Book object shape expected by Cart.add():
//    {
//      id:       string,   // Airtable record ID  e.g. "recABC123"
//      title:    string,   // e.g. "Kudahithaage Reyvun"
//      language: string,   // e.g. "Dhivehi"
//      price:    number|null,
//      coverUrl: string|null,
//    }
//
//  Stored item shape (in localStorage):
//    { ...book fields, quantity: number, addedAt: timestamp }
// ============================================================

const Cart = (() => {
  const STORAGE_KEY = 'greyHeron_cart_v1';

  // ── Internal helpers ───────────────────────────────────────

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function save(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Cart: localStorage write failed.', e);
    }
  }

  // Registered update listeners
  const listeners = [];

  function notify() {
    const items = load();
    listeners.forEach(fn => {
      try { fn(items); } catch (e) { console.warn('Cart listener error:', e); }
    });
    _updateBadges(_totalItems(items));
  }

  function _totalItems(items) {
    return (items || load()).reduce((sum, b) => sum + (b.quantity || 1), 0);
  }

  function _updateBadges(count) {
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.textContent   = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  // ── Public API ─────────────────────────────────────────────

  function add(book) {
    if (!book || !book.id) { console.warn('Cart.add: book must have an id'); return; }
    const items = load();
    const existing = items.find(b => b.id === book.id);
    if (existing) {
      // Already in cart — increment quantity and refresh stored metadata
      existing.quantity = (existing.quantity || 1) + 1;
      existing.title = book.title || existing.title;
      existing.language = book.language || existing.language;
      existing.price = book.price ?? existing.price;
      existing.coverUrl = book.coverUrl || existing.coverUrl;
    } else {
      items.push({
        id:       book.id,
        title:    book.title    || 'Untitled',
        language: book.language || '',
        price:    book.price    ?? null,
        coverUrl: book.coverUrl || null,
        quantity: 1,
        addedAt:  Date.now(),
      });
    }
    save(items);
    notify();
  }

  function remove(id) {
    save(load().filter(b => b.id !== id));
    notify();
  }

  function has(id) {
    return load().some(b => b.id === id);
  }

  function getAll() {
    return load();
  }

  function count() {
    return load().length; // distinct titles
  }

  function totalItems() {
    return _totalItems();
  }

  function setQuantity(id, qty) {
    const q = Math.max(1, Math.floor(qty)); // minimum 1
    const items = load();
    const item = items.find(b => b.id === id);
    if (!item) return;
    item.quantity = q;
    save(items);
    notify();
  }

  function incrementQty(id) {
    const items = load();
    const item = items.find(b => b.id === id);
    if (!item) return;
    item.quantity = (item.quantity || 1) + 1;
    save(items);
    notify();
  }

  function decrementQty(id) {
    const items = load();
    const item = items.find(b => b.id === id);
    if (!item) return;
    item.quantity = (item.quantity || 1) - 1;
    if (item.quantity < 1) {
      save(items.filter(b => b.id !== id)); // remove entirely at 0
    } else {
      save(items);
    }
    notify();
  }

  function clear() {
    save([]);
    notify();
  }

  function updateItem(id, updates) {
    const items = load();
    const item = items.find(b => b.id === id);
    if (!item) return;
    Object.assign(item, updates);
    save(items);
    notify();
  }

  function onUpdate(fn) {
    if (typeof fn === 'function') listeners.push(fn);
  }

  // ── Cart icon injector ─────────────────────────────────────
  // Appends a shopping bag icon + live badge into any container.
  // components.js will call this when building the nav.

  function renderIcon(container) {
    if (!container) return;
    const n = totalItems();
    const a = document.createElement('a');
    a.href      = 'cart.html';
    a.className = 'cart-nav-icon';
    a.setAttribute('aria-label', 'View cart');
    a.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
           stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      <span class="cart-badge" style="display:${n > 0 ? 'flex' : 'none'};">${n}</span>
    `;
    container.appendChild(a);
  }

  // ── Auto-init badge on DOMContentLoaded ───────────────────
  document.addEventListener('DOMContentLoaded', () => {
    _updateBadges(totalItems());
  });

  return {
    add,
    remove,
    has,
    getAll,
    count,
    totalItems,
    setQuantity,
    incrementQty,
    decrementQty,
    clear,
    updateItem,
    onUpdate,
    renderIcon,
  };
})();
