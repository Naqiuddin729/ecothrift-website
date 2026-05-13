/* ── ECOTHRIFT LOCATION SELECTOR ─────────────────────────────────────────
   Injects a Malaysia state selector into the nav bar on all pages.
   Saves selection to localStorage and restores on load.
   ────────────────────────────────────────────────────────────────────── */

const LOCATION = (() => {

  const STATES = [
    { region: 'Semenanjung Malaysia', states: [
      { name: 'Johor',           abbr: 'JHR' },
      { name: 'Kedah',           abbr: 'KDH' },
      { name: 'Kelantan',        abbr: 'KTN' },
      { name: 'Melaka',          abbr: 'MLK' },
      { name: 'Negeri Sembilan', abbr: 'NSN' },
      { name: 'Pahang',          abbr: 'PHG' },
      { name: 'Perak',           abbr: 'PRK' },
      { name: 'Perlis',          abbr: 'PLS' },
      { name: 'Pulau Pinang',    abbr: 'PNG' },
      { name: 'Selangor',        abbr: 'SGR' },
      { name: 'Terengganu',      abbr: 'TRG' },
    ]},
    { region: 'Malaysia Timur', states: [
      { name: 'Sabah',   abbr: 'SBH' },
      { name: 'Sarawak', abbr: 'SWK' },
    ]},
    { region: 'Wilayah Persekutuan', states: [
      { name: 'Kuala Lumpur', abbr: 'KUL' },
      { name: 'Labuan',       abbr: 'LBN' },
      { name: 'Putrajaya',    abbr: 'PJY' },
    ]},
  ];

  let selected = JSON.parse(localStorage.getItem('eco_location') || 'null');
  let open = false;

  /* ── CSS ───────────────────────────────────────────────────────── */
  function injectCSS() {
    const s = document.createElement('style');
    s.textContent = `
      .loc-btn {
        display: flex; align-items: center; gap: 6px;
        background: transparent; border: 1px solid rgba(196,168,130,0.45);
        padding: 0.45rem 0.9rem; border-radius: 2px; cursor: pointer;
        font-family: 'DM Sans', sans-serif; font-size: 0.78rem;
        font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase;
        color: var(--smoke, #7A7568); transition: all 0.2s; white-space: nowrap;
        position: relative;
      }
      .loc-btn:hover { border-color: var(--clay, #C4A882); color: var(--ink, #1A1A18); }
      .loc-btn.has-loc { color: var(--forest, #2D4A3E); border-color: rgba(45,74,62,0.4); }
      .loc-btn .loc-pin { font-size: 0.9rem; }

      .loc-panel {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        z-index: 9000; display: flex; align-items: flex-start; justify-content: flex-end;
        padding-top: 72px; padding-right: 3rem;
        pointer-events: none;
      }
      .loc-panel.open { pointer-events: all; }

      .loc-backdrop {
        position: fixed; inset: 0; background: rgba(26,26,24,0.35);
        opacity: 0; transition: opacity 0.2s; z-index: -1;
        backdrop-filter: blur(2px);
      }
      .loc-panel.open .loc-backdrop { opacity: 1; }

      .loc-box {
        background: #FEFCF8; border-radius: 4px;
        box-shadow: 0 8px 32px rgba(26,26,24,0.18);
        width: 320px; overflow: hidden;
        transform: translateY(-8px); opacity: 0;
        transition: transform 0.22s ease, opacity 0.22s ease;
      }
      .loc-panel.open .loc-box { transform: translateY(0); opacity: 1; }

      .loc-header {
        padding: 1.25rem 1.25rem 0.75rem;
        border-bottom: 1px solid rgba(196,168,130,0.2);
        background: #2D4A3E;
      }
      .loc-header-title {
        font-family: 'Playfair Display', serif; font-size: 1.1rem;
        font-weight: 700; color: #FEFCF8; margin-bottom: 0.2rem;
      }
      .loc-header-sub { font-size: 0.75rem; color: rgba(254,252,248,0.55); }

      .loc-search-wrap { padding: 0.75rem 1rem; border-bottom: 1px solid rgba(196,168,130,0.15); }
      .loc-search-input {
        width: 100%; padding: 0.6rem 0.85rem;
        background: #E8DFD0; border: 1px solid rgba(196,168,130,0.4);
        border-radius: 2px; font-family: 'DM Sans', sans-serif;
        font-size: 0.85rem; color: #1A1A18; outline: none; box-sizing: border-box;
      }
      .loc-search-input::placeholder { color: #7A7568; }
      .loc-search-input:focus { border-color: #C4A882; }

      .loc-list { max-height: 280px; overflow-y: auto; }
      .loc-list::-webkit-scrollbar { width: 4px; }
      .loc-list::-webkit-scrollbar-track { background: transparent; }
      .loc-list::-webkit-scrollbar-thumb { background: rgba(196,168,130,0.4); border-radius: 2px; }

      .loc-region-hdr {
        padding: 0.5rem 1rem 0.3rem;
        font-size: 0.65rem; font-weight: 500; letter-spacing: 0.12em;
        text-transform: uppercase; color: #C4A882;
        background: rgba(232,223,208,0.4);
        border-bottom: 1px solid rgba(196,168,130,0.15);
        position: sticky; top: 0;
      }
      .loc-item {
        padding: 0.7rem 1rem; display: flex; align-items: center; gap: 0.75rem;
        cursor: pointer; transition: background 0.12s;
        border-bottom: 1px solid rgba(196,168,130,0.1);
        font-size: 0.88rem; color: #1A1A18;
      }
      .loc-item:last-child { border-bottom: none; }
      .loc-item:hover { background: #E8DFD0; }
      .loc-item.active { background: rgba(45,74,62,0.08); color: #2D4A3E; }
      .loc-item .abbr-tag {
        font-size: 0.65rem; font-weight: 500; letter-spacing: 0.05em;
        padding: 0.15rem 0.45rem; border-radius: 2px;
        background: rgba(196,168,130,0.2); color: #7A7568;
        min-width: 34px; text-align: center; flex-shrink: 0;
      }
      .loc-item.active .abbr-tag { background: rgba(45,74,62,0.15); color: #2D4A3E; }
      .loc-item .check { margin-left: auto; color: #2D4A3E; font-size: 0.9rem; }

      .loc-none { padding: 1.5rem 1rem; text-align: center; font-size: 0.85rem; color: #7A7568; }

      .loc-footer {
        padding: 0.85rem 1rem;
        border-top: 1px solid rgba(196,168,130,0.2);
        display: flex; gap: 0.6rem;
      }
      .loc-confirm-btn {
        flex: 1; background: #1A1A18; color: #FEFCF8;
        border: none; padding: 0.7rem;
        font-family: 'DM Sans', sans-serif; font-size: 0.8rem;
        font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase;
        cursor: pointer; border-radius: 2px; transition: background 0.2s;
      }
      .loc-confirm-btn:hover { background: #2D4A3E; }
      .loc-clear-btn {
        background: transparent; color: #7A7568;
        border: 1px solid rgba(196,168,130,0.4); padding: 0.7rem 0.9rem;
        font-family: 'DM Sans', sans-serif; font-size: 0.8rem;
        cursor: pointer; border-radius: 2px; transition: all 0.2s;
      }
      .loc-clear-btn:hover { border-color: #B85C3A; color: #B85C3A; }
    `;
    document.head.appendChild(s);
  }

  /* ── BUILD HTML ────────────────────────────────────────────────── */
  function buildUI() {
    const btn = document.createElement('button');
    btn.className = 'loc-btn' + (selected ? ' has-loc' : '');
    btn.id = 'loc-nav-btn';
    btn.innerHTML = `<span class="loc-pin">📍</span><span id="loc-btn-text">${selected ? selected.abbr : 'Negeri'}</span>`;
    btn.addEventListener('click', togglePanel);

    const panel = document.createElement('div');
    panel.className = 'loc-panel';
    panel.id = 'loc-panel';
    panel.innerHTML = `
      <div class="loc-backdrop" id="loc-backdrop"></div>
      <div class="loc-box">
        <div class="loc-header">
          <div class="loc-header-title">Pilih Negeri Anda</div>
          <div class="loc-header-sub">Untuk penghantaran dan tawaran tempatan</div>
        </div>
        <div class="loc-search-wrap">
          <input class="loc-search-input" type="text" placeholder="Cari negeri..." id="loc-search-input" autocomplete="off">
        </div>
        <div class="loc-list" id="loc-list"></div>
        <div class="loc-footer">
          <button class="loc-confirm-btn" id="loc-confirm-btn">Sahkan</button>
          <button class="loc-clear-btn" id="loc-clear-btn">Kosongkan</button>
        </div>
      </div>`;

    // Insert btn into nav actions (before Sign In / cart)
    const navActions = document.querySelector('.nav-actions');
    if (navActions) navActions.insertBefore(btn, navActions.firstChild);
    document.body.appendChild(panel);

    // Events
    document.getElementById('loc-backdrop').addEventListener('click', closePanel);
    document.getElementById('loc-search-input').addEventListener('input', renderList);
    document.getElementById('loc-confirm-btn').addEventListener('click', confirmLocation);
    document.getElementById('loc-clear-btn').addEventListener('click', clearLocation);

    renderList();
  }

  /* ── RENDER LIST ───────────────────────────────────────────────── */
  let pending = selected ? { ...selected } : null;

  function renderList() {
    const q = (document.getElementById('loc-search-input')?.value || '').toLowerCase();
    const container = document.getElementById('loc-list');
    if (!container) return;
    container.innerHTML = '';
    let total = 0;

    STATES.forEach(group => {
      const filtered = group.states.filter(s =>
        s.name.toLowerCase().includes(q) || s.abbr.toLowerCase().includes(q)
      );
      if (!filtered.length) return;
      total += filtered.length;

      const hdr = document.createElement('div');
      hdr.className = 'loc-region-hdr';
      hdr.textContent = group.region;
      container.appendChild(hdr);

      filtered.forEach(state => {
        const isActive = pending && pending.name === state.name;
        const item = document.createElement('div');
        item.className = 'loc-item' + (isActive ? ' active' : '');
        item.innerHTML = `
          <span class="abbr-tag">${state.abbr}</span>
          <span>${state.name}</span>
          ${isActive ? '<span class="check">✓</span>' : ''}`;
        item.addEventListener('click', () => {
          pending = { name: state.name, abbr: state.abbr, region: group.region };
          renderList();
        });
        container.appendChild(item);
      });
    });

    if (total === 0) {
      container.innerHTML = '<div class="loc-none">Tiada negeri ditemui.</div>';
    }
  }

  /* ── TOGGLE / CLOSE ────────────────────────────────────────────── */
  function togglePanel() {
    open ? closePanel() : openPanel();
  }

  function openPanel() {
    open = true;
    document.getElementById('loc-panel').classList.add('open');
    setTimeout(() => document.getElementById('loc-search-input')?.focus(), 120);
  }

  function closePanel() {
    open = false;
    document.getElementById('loc-panel').classList.remove('open');
    document.getElementById('loc-search-input').value = '';
    pending = selected ? { ...selected } : null;
    renderList();
  }

  /* ── CONFIRM ───────────────────────────────────────────────────── */
  function confirmLocation() {
    if (!pending) return;
    selected = { ...pending };
    localStorage.setItem('eco_location', JSON.stringify(selected));
    updateBtn();
    closePanel();
    typeof ECO !== 'undefined' && ECO.toast(`📍 Lokasi: ${selected.name}`, 'success', 2500);
    window.dispatchEvent(new CustomEvent('eco:locationChanged', { detail: { location: selected } }));
  }

  function clearLocation() {
    selected = null;
    pending = null;
    localStorage.removeItem('eco_location');
    updateBtn();
    renderList();
    typeof ECO !== 'undefined' && ECO.toast('Lokasi dikosongkan', 'info', 1800);
    window.dispatchEvent(new CustomEvent('eco:locationChanged', { detail: { location: null } }));
  }

  function updateBtn() {
    const btn = document.getElementById('loc-nav-btn');
    const txt = document.getElementById('loc-btn-text');
    if (!btn || !txt) return;
    txt.textContent = selected ? selected.abbr : 'Negeri';
    btn.classList.toggle('has-loc', !!selected);
  }

  /* ── INIT ──────────────────────────────────────────────────────── */
  function init() {
    injectCSS();
    buildUI();
  }

  document.addEventListener('DOMContentLoaded', init);

  return { open: openPanel, close: closePanel, getSelected: () => selected };
})();
