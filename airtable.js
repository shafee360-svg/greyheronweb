// ============================================================
//  airtable.js  —  Grey Heron Books Airtable Integration
//  Include this script on every page that needs live data.
// ============================================================

const BASE_ID = 'appRrScZ2TSQYq0kL';
const AIRTABLE_PROXY = '/.netlify/functions/airtable-proxy';
const IS_LOCAL_AIRTABLE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const LOCAL_AIRTABLE_TOKEN_KEY = 'greyHeronAirtableToken';

// Local development token — set once in browser console, never commit a real token here:
// localStorage.setItem('greyHeronAirtableToken', 'YOUR_AIRTABLE_PAT')
const LOCAL_DEV_AIRTABLE_TOKEN = '';

function getLocalAirtableToken() {
  if (window.AIRTABLE_TOKEN) return window.AIRTABLE_TOKEN;
  if (window.localStorage) {
    const t = window.localStorage.getItem(LOCAL_AIRTABLE_TOKEN_KEY);
    if (t) return t;
  }
  return LOCAL_DEV_AIRTABLE_TOKEN; // fallback for local testing
}

const AIRTABLE_TOKEN = IS_LOCAL_AIRTABLE ? getLocalAirtableToken() : null;

// ── Table names (must match exactly) ──
const TABLES = {
  books:          'All Books',
  characters:     'Characters',
  themes:         'Themes',
  characterTypes: 'Character Type',
  feedback:       'Feedback',
  aboutPage:      'about page',
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
function buildAirtableProxyUrl(params = {}) {
  const url = new URL(AIRTABLE_PROXY, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.forEach(v => url.searchParams.append(key, v));
    } else {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

function buildAirtableDirectUrl(tableName, params = {}, record = null) {
  const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}`);
  if (record) {
    url.pathname += `/${record}`;
    return url.toString();
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.forEach(v => url.searchParams.append(key, v));
    } else {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

async function fetchAirtableUrl(url) {
  if (IS_LOCAL_AIRTABLE) {
    if (!AIRTABLE_TOKEN) {
      throw new Error('Local Airtable token not found. Set it in localStorage with localStorage.setItem("greyHeronAirtableToken", "<YOUR_TOKEN>") and reload.');
    }
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      },
    });
  }
  return fetch(url);
}

async function fetchAllRecords(tableName, options = {}) {
  const { filterFormula, fields, sort, skipView } = options;
  let records = [];
  let offset = null;

  do {
    const params = {
      table: tableName,
      pageSize: 100,
    };

    const viewId = VIEWS[tableName];
    if (viewId && !skipView) params.view = viewId;
    if (filterFormula) params.filterByFormula = filterFormula;
    if (offset) params.offset = offset;
    if (fields) params['fields[]'] = fields;
    if (sort) {
      sort.forEach((s, i) => {
        params[`sort[${i}][field]`] = s.field;
        params[`sort[${i}][direction]`] = s.direction || 'asc';
      });
    }

    const url = IS_LOCAL_AIRTABLE ? buildAirtableDirectUrl(tableName, params) : buildAirtableProxyUrl(params);
    const res = await fetchAirtableUrl(url);

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