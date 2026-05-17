// ============================================================
//  airtable.js  —  Grey Heron Books Airtable Integration
//  Include this script on every page that needs live data.
// ============================================================

const AIRTABLE_TOKEN = 'YOUR_AIRTABLE_PAT_TOKEN_HERE'; // ← paste your pat... token here
const BASE_ID        = 'appRrScZ2TSQYq0kL';

// ── Table names (must match exactly) ──
const TABLES = {
  books:      'All Books',
  characters: 'Characters',
  themes:     'Themes',
  feedback:   'Feedback',
};

// ── View IDs — locks each fetch to the correct filtered view ──
const VIEWS = {
  'All Books':  'viwgaMg2yrSyiJ6dO',
  'Characters': 'viwCwherchHNZl4tK',
'Themes':     'viwVTSm0LoohOTeBA',};

// ── Detect file:// protocol (fetch is blocked by browsers in this mode) ──
if (window.location.protocol === 'file:') {
  document.addEventListener('DOMContentLoaded', () => {
    document.body.innerHTML = `
      <div style="font-family:sans-serif;max-width:600px;margin:80px auto;padding:40px;background:#fff8e1;border:2px solid #f9a825;border-radius:12px;text-align:center;">
        <h2 style="color:#e65100;">⚠️ Local File Detected</h2>
        <p style="font-size:1rem;line-height:1.7;color:#333;">
          You're opening this page directly from your computer (<code>file://</code>).<br>
          Browsers block network requests in this mode, so Airtable can't be reached.
        </p>
        <p style="font-size:1rem;line-height:1.7;color:#333;">
          <strong>Fix:</strong> Use VS Code with the Live Server extension —
          right-click your HTML file → <em>Open with Live Server</em>
        </p>
      </div>`;
  });
}

// ── Core fetch helper (handles Airtable pagination automatically) ──
async function fetchAllRecords(tableName, options = {}) {
  const { filterFormula, fields, sort, skipView } = options;
  const headers = {
    'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json',
  };

  let records = [];
  let offset  = null;

  do {
    const params = new URLSearchParams({ pageSize: 100 });

    // Apply the view ID unless skipView is set
    const viewId = VIEWS[tableName];
    if (viewId && !skipView) params.set('view', viewId);

    if (filterFormula) params.set('filterByFormula', filterFormula);
    if (offset)        params.set('offset', offset);
    if (fields)        fields.forEach(f => params.append('fields[]', f));
    if (sort)          sort.forEach((s, i) => {
      params.set(`sort[${i}][field]`, s.field);
      params.set(`sort[${i}][direction]`, s.direction || 'asc');
    });

    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}?${params}`;
    const res  = await fetch(url, { headers });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Airtable error on "${tableName}": ${err.error?.message || res.status}`);
    }

    const data = await res.json();
    records.push(...data.records);
    offset = data.offset || null;
  } while (offset);

  return records;
}

// ── Extract the URL from an Airtable attachment field ──
function getAttachmentUrl(field) {
  if (!field || !Array.isArray(field) || field.length === 0) return null;
  return field[0].url;
}

// ── Show a loading spinner inside a container ──
function showLoading(containerId, message = 'Loading…') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div style="text-align:center; padding:80px 20px; color:#888;">
      <div class="spinner"></div>
      <p style="margin-top:16px; font-size:1rem;">${message}</p>
    </div>`;
}

// ── Show an error message inside a container ──
function showError(containerId, message) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div style="text-align:center; padding:80px 20px; color:#c00;">
      <p style="font-size:1.1rem;">⚠️ ${message}</p>
      <p style="font-size:0.85rem; color:#888;">Check your Airtable token and table names in airtable.js</p>
    </div>`;
}