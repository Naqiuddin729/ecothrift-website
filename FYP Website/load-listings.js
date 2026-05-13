/* ── LOAD APPROVED LISTINGS FROM FIRESTORE ──────────────────────────────
   Dipanggil oleh ecothrift-clothes.html, ecothrift-pants.html,
   ecothrift-accessories.html. Set window.LISTING_CATEGORY sebelum include.
   ────────────────────────────────────────────────────────────────────── */

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    if (typeof db === 'undefined') return;

    const categoryPrefix = window.LISTING_CATEGORY || '';
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    db.collection('listings')
      .where('status', '==', 'approved')
      .get()
      .then(snap => {
        if (snap.empty) return;

        let added = 0;
        snap.forEach(doc => {
          const d = doc.data();
          if (categoryPrefix && !(d.category || '').startsWith(categoryPrefix)) return;

          const card = buildCard(doc.id, d);
          grid.insertBefore(card, grid.firstChild);
          added++;
        });

      })
      .catch(err => console.error('Load listings error:', err));
  });

  function buildCard(id, d) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.condition = d.condition || '';
    card.dataset.price     = d.askingPrice || 0;
    card.dataset.size      = d.size || '';
    card.dataset.negeri    = d.negeri || '';
    card.dataset.seller    = d.sellerName || 'Penjual';
    card.dataset.sellerId  = id;
    card.dataset.color     = '';

    const savePct = d.retailPrice && d.askingPrice
      ? '−' + Math.round((1 - d.askingPrice / d.retailPrice) * 100) + '%'
      : '';

    const imgHTML = d.photoURLs && d.photoURLs[0]
      ? `<img src="${d.photoURLs[0]}" alt="${esc(d.category)}"
            style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;">`
      : `<span style="font-size:3rem;">👕</span>`;

    const badgeHTML = d.condition === 'Seperti Baru'
      ? `<div class="product-badge">Baru</div>` : '';

    card.innerHTML = `
      <div class="product-img">
        ${imgHTML}
        ${badgeHTML}
        <div class="product-save">♡</div>
      </div>
      <div class="product-condition">${esc(d.condition || '')}</div>
      <div class="product-name">${esc(d.listingName || d.category || 'Produk')}</div>
      <div class="product-seller">👤 ${esc(d.sellerName || 'Penjual')}</div>
      <div class="product-price">RM ${d.askingPrice || '—'}
        ${d.retailPrice ? `<span class="original">RM ${d.retailPrice}</span>` : ''}
        ${savePct ? `<span class="save-pct">${savePct}</span>` : ''}
      </div>`;

    // Save button
    card.querySelector('.product-save')?.addEventListener('click', e => {
      e.stopPropagation();
      const pname = card.querySelector('.product-name')?.textContent || '';
      if (typeof ECO !== 'undefined') ECO.toggleWishlist(pname, e.currentTarget);
    });

    // Open quickView on card click (except save button)
    card.addEventListener('click', e => {
      if (e.target.closest('.product-save')) return;
      if (typeof ECO !== 'undefined') ECO.quickView(card);
    });

    return card;
  }

  function esc(str) {
    return String(str || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
})();
