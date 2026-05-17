# Grey Heron Books — Website (v3)

Static website for **Grey Heron Books**, a Maldivian folklore book series by Shafee Shafeeq (Fuvahmulah, Maldives). The site showcases 14 folklore titles, lets visitors browse characters and themes, and handles orders via WhatsApp.

---

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — hero collage, mission statement, feedback carousel |
| `books.html` | Full book collection listing |
| `book-details.html` | Individual book detail page |
| `characters.html` | Characters from the stories |
| `elements.html` | Themes / folkloric elements |
| `about.html` | About the project, author, and illustrator |
| `cart.html` | Shopping cart (localStorage-based) |
| `index-original.html` | Backup of the original home page design |

---

## JavaScript Files

### `airtable.js`
Airtable API integration — the site's data source. Included on every page that needs live data.

- **`AIRTABLE_TOKEN`** — personal access token (hardcoded; keep private)
- **`BASE_ID`** — Airtable base ID
- **`TABLES`** — maps friendly names to exact Airtable table names: `All Books`, `Characters`, `Themes`, `Feedback`
- **`VIEWS`** — view IDs that filter/sort each table fetch
- **`fetchAllRecords(tableName, options)`** — paginates through all Airtable records automatically
- **`getAttachmentUrl(field)`** — safely extracts the first attachment URL
- **`showLoading(containerId)`** / **`showError(containerId, message)`** — UI helpers

> Note: Opens with a friendly warning page if the site is loaded via `file://` (browsers block network requests in that mode). Use VS Code Live Server instead.

### `components.js`
Shared header and footer — injected into every page via `<div id="site-header">` / `<div id="site-footer">`.

- Renders site navigation with active-page highlighting
- Mobile nav toggle (hamburger menu) with outside-click close
- Cart badge icon in the header

### `cart.js`
Shopping cart backed by `localStorage` (`greyHeron_cart_v1`). No dependencies.

**Public API:**

| Method | Description |
|---|---|
| `Cart.add(book)` | Add a book; increments quantity if already in cart |
| `Cart.remove(id)` | Remove a book entirely |
| `Cart.has(id)` | Check if a book is in the cart |
| `Cart.getAll()` | Return all cart items |
| `Cart.count()` | Number of distinct titles |
| `Cart.totalItems()` | Sum of all quantities |
| `Cart.setQuantity(id, qty)` | Set quantity (min 1) |
| `Cart.incrementQty(id)` | Add 1 to quantity |
| `Cart.decrementQty(id)` | Subtract 1; removes item at 0 |
| `Cart.clear()` | Empty the cart |
| `Cart.onUpdate(fn)` | Register a callback fired on every change |

Book object shape for `Cart.add()`:
```js
{
  id:       string,   // Airtable record ID e.g. "recABC123"
  title:    string,
  language: string,   // e.g. "Dhivehi"
  price:    number | null,
  coverUrl: string | null,
}
```

### `gh-extras.js`
Extra UI features — edit mode, palette/motif/hero switching, and other enhancements.

---

## CSS Files

| File | Size | Purpose |
|---|---|---|
| `style.css` | ~47 KB | Global styles — typography, layout, components |
| `home-redesign.css` | ~34 KB | Home page redesign — hero, manifesto, feedback carousel |

---

## Data (Airtable)

All content is fetched live from Airtable at page load.

| Table | Used on |
|---|---|
| `All Books` | Home hero collage, books listing, book details |
| `Characters` | Characters page |
| `Themes` | Themes/elements page |
| `Feedback` | Home feedback carousel |

---

## Running Locally

Open with **VS Code Live Server** (right-click any HTML file → *Open with Live Server*). Do **not** open files directly from the filesystem — browsers block `fetch()` on `file://` URLs, which breaks all Airtable data loading.

---

## Deploying with Netlify

This site is now configured to use a Netlify serverless function at `/.netlify/functions/airtable-proxy`.

1. Push the code to GitHub.
2. Go to https://app.netlify.com and create a new site from Git.
3. Connect your `shafee360-svg/greyheronweb` repository.
4. Set the environment variables in Netlify:
   - `AIRTABLE_BASE_ID` = `appRrScZ2TSQYq0kL`
   - `AIRTABLE_TOKEN` = your Airtable personal access token
5. Deploy the site. Netlify will publish the static files from the repo root and run the serverless function automatically.

This is a free-tier-friendly setup for temporary deployment.

---

## Key Design Decisions

- **No framework** — pure vanilla HTML, CSS, and JS
- **Airtable as CMS** — all book/character/theme data lives in Airtable; no backend needed
- **WhatsApp ordering** — cart is informational; orders are completed via WhatsApp
- **No AI artwork** — all illustrations are hand-crafted; this is a core brand value stated explicitly on the About page

---

## Security Note

This project now uses a Netlify serverless function for Airtable access, so the token is stored in Netlify environment variables instead of hardcoded in `airtable.js`.

If you change providers, keep the token secret and do not push it into GitHub.

