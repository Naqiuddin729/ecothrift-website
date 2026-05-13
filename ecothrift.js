/* ============================================================
   ECOTHRIFT — JavaScript Framework
   Covers: Cart · Wishlist · Filters · Toast · Modals ·
           Sort · Pagination · Newsletter · Colour swatches ·
           Subcategory pills · Collapsible filter groups ·
           Sign-in drawer · Sell banner · Promo banner ·
           Product quick-view · Halaman transitions
   ============================================================ */

const ECO = (() => {

  /* ── STATE ─────────────────────────────────────────── */
  const state = {
    cart: JSON.parse(localStorage.getItem('eco_cart') || '[]'),
    wishlist: JSON.parse(localStorage.getItem('eco_wishlist') || '[]'),
    activeFilters: {},
    currentPage: 1,
    sortOrder: 'newest',
    signedIn: false,
  };

  const saveCart     = () => localStorage.setItem('eco_cart',     JSON.stringify(state.cart));
  const saveWishlist = () => localStorage.setItem('eco_wishlist', JSON.stringify(state.wishlist));

  /* ── TOAST ─────────────────────────────────────────── */
  function toast(msg, type = 'success', duration = 2800) {
    let container = document.getElementById('eco-toasts');
    if (!container) {
      container = document.createElement('div');
      container.id = 'eco-toasts';
      container.style.cssText = `
        position:fixed; bottom:2rem; right:2rem; z-index:9999;
        display:flex; flex-direction:column; gap:.6rem; pointer-events:none;`;
      document.body.appendChild(container);
    }
    const colours = { success:'#2D4A3E', error:'#B85C3A', info:'#1A1A18', warn:'#C4A882' };
    const icons   = { success:'✓', error:'✕', info:'ℹ', warn:'⚠' };
    const t = document.createElement('div');
    t.style.cssText = `
      background:${colours[type]}; color:#F5F0E8;
      padding:.75rem 1.25rem; border-radius:3px;
      font-family:'DM Sans',sans-serif; font-size:.85rem; font-weight:500;
      display:flex; align-barang:center; gap:.6rem;
      box-shadow:0 4px 20px rgba(0,0,0,.2);
      animation:ecoSlideIn .3s ease; pointer-events:auto;
      max-width:300px; line-height:1.4;`;
    t.innerHTML = `<span style="font-size:1rem">${icons[type]}</span>${msg}`;
    container.appendChild(t);
    setTimeout(() => {
      t.style.animation = 'ecoSlideOut .3s ease forwards';
      setTimeout(() => t.remove(), 300);
    }, duration);
  }

  /* ── MODAL ─────────────────────────────────────────── */
  function openModal(html, onClose) {
    closeModal();
    const overlay = document.createElement('div');
    overlay.id = 'eco-modal-overlay';
    overlay.style.cssText = `
      position:fixed; inset:0; background:rgba(26,26,24,.6);
      z-index:8000; display:flex; align-barang:center; justify-content:center;
      backdrop-filter:blur(4px); animation:ecoFadeIn .2s ease;`;
    const box = document.createElement('div');
    box.id = 'eco-modal-box';
    box.style.cssText = `
      background:#FEFCF8; border-radius:4px; padding:2.5rem;
      max-width:520px; width:90%; position:relative;
      animation:ecoSlideUp .25s ease; max-height:85vh; overflow-y:auto;`;
    box.innerHTML = `
      <button id="eco-modal-close" style="
        position:absolute; top:1rem; right:1rem;
        background:none; border:none; font-size:1.3rem; cursor:pointer;
        color:#7A7568; line-height:1;">×</button>
      ${html}`;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    overlay.addEventListener('click', e => { if(e.target===overlay) closeModal(onClose); });
    document.getElementById('eco-modal-close').addEventListener('click', () => closeModal(onClose));
  }

  function closeModal(cb) {
    const o = document.getElementById('eco-modal-overlay');
    if (o) o.remove();
    document.body.style.overflow = '';
    if (cb) cb();
  }

  /* ── CART ──────────────────────────────────────────── */
  function addToCart(name, price, size = 'M') {
    const existing = state.cart.find(i => i.name === name && i.size === size);
    if (existing) {
      existing.qty++;
    } else {
      state.cart.push({ name, price, size, qty: 1, id: Date.now() });
    }
    saveCart();
    updateCartBadge();
    toast(`Ditambah ke troli — <strong>${name}</strong>`, 'success');
  }

  function updateCartBadge() {
    const total = state.cart.reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll('.cart-badge').forEach(b => {
      b.textContent = total || '';
      b.style.display = total ? 'flex' : 'none';
    });
  }

  function openCart() {
    const total = state.cart.reduce((s, i) => s + i.qty * i.price, 0);
    const rows = state.cart.length
      ? state.cart.map(i => `
          <div style="display:flex;justify-content:space-between;align-barang:center;
            padding:.75rem 0;border-bottom:1px solid rgba(196,168,130,.2);">
            <div>
              <div style="font-size:.9rem;font-weight:500;color:#1A1A18;">${i.name}</div>
              <div style="font-size:.75rem;color:#7A7568;">Saiz ${i.size} · Kuant. ${i.qty}</div>
            </div>
            <div style="display:flex;align-barang:center;gap:1rem;">
              <span style="font-family:'Playfair Display',serif;font-weight:700;">RM ${(i.price*i.qty).toFixed(0)}</span>
              <button onclick="ECO.removeFromCart(${i.id})" style="
                background:none;border:none;color:#7A7568;cursor:pointer;font-size:1.1rem;">×</button>
            </div>
          </div>`).join('')
      : `<p style="color:#7A7568;text-align:center;padding:2rem 0;font-size:.9rem;">Troli anda kosong.</p>`;

    openModal(`
      <h2 style="font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:900;margin-bottom:1.5rem;">
        Troli Anda <span style="font-size:1rem;font-weight:400;color:#7A7568;">(${state.cart.reduce((s,i)=>s+i.qty,0)} barang)</span>
      </h2>
      ${rows}
      ${state.cart.length ? `
        <div style="display:flex;justify-content:space-between;align-barang:center;
          margin-top:1.5rem;padding-top:1rem;border-top:2px solid #1A1A18;">
          <span style="font-size:.8rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:#7A7568;">Jumlah</span>
          <span style="font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:900;">RM ${total.toFixed(0)}</span>
        </div>
        <button onclick="ECO.checkout()" style="
          width:100%;margin-top:1rem;background:#1A1A18;color:#F5F0E8;
          border:none;padding:1rem;font-family:'DM Sans',sans-serif;
          font-size:.9rem;font-weight:500;letter-spacing:.06em;text-transform:uppercase;
          cursor:pointer;border-radius:2px;transition:background .2s;">
          💬 Chat Penjual
        </button>` : ''}
    `);
  }

  function removeFromCart(id) {
    state.cart = state.cart.filter(i => i.id !== id);
    saveCart(); updateCartBadge(); openCart();
  }

  function checkout() {
    // Get first item in cart to pass to chat
    const firstItem = state.cart[0];
    const product = firstItem ? encodeURIComponent(firstItem.name) : '';
    const price   = firstItem ? firstItem.price : '';
    closeModal();
    window.location.href = `chat.html?product=${product}&price=${price}`;
  }

  /* ── WISHLIST ───────────────────────────────────────── */
  function toggleWishlist(name, btn) {
    const idx = state.wishlist.indexOf(name);
    if (idx > -1) {
      state.wishlist.splice(idx, 1);
      if (btn) btn.textContent = '♡';
      toast(`Dibuang daripada senarai hajat`, 'info');
    } else {
      state.wishlist.push(name);
      if (btn) { btn.textContent = '♥'; btn.style.color = '#B85C3A'; }
      toast(`Disimpan ke kegemaran — <strong>${name}</strong>`, 'success');
    }
    saveWishlist();
    updateWishlistBtns();
  }

  function updateWishlistBtns() {
    document.querySelectorAll('.product-save').forEach(btn => {
      const card = btn.closest('.product-card');
      if (!card) return;
      const name = card.querySelector('.product-name')?.textContent;
      if (state.wishlist.includes(name)) {
        btn.textContent = '♥'; btn.style.color = '#B85C3A';
      } else {
        btn.textContent = '♡'; btn.style.color = '';
      }
    });
  }

  /* ── QUICK VIEW ─────────────────────────────────────── */
  function quickView(card) {
    const name   = card.querySelector('.product-name')?.textContent || '';
    const brand  = card.querySelector('.product-brand')?.textContent || '';
    const cond   = card.querySelector('.product-condition')?.textContent || '';
    const price  = card.querySelector('.product-price')?.childNodes[0]?.textContent?.trim() || '';
    const orig   = card.querySelector('.original')?.textContent || '';
    const imgEl  = card.querySelector('.product-img img');
    const emoji  = card.querySelector('.product-img span')?.textContent || '👕';
    const bg     = card.querySelector('.product-img')?.style.background || '#E8DFD0';
    const saved    = state.wishlist.includes(name);
    const negeri   = card.dataset.negeri || '';
    const seller   = card.dataset.seller || 'Penjual';
    const sellerId = card.dataset.sellerId || '';
    const listingSize = (card.dataset.size || '').toUpperCase();
    const sizes  = ['XS','S','M','L','XL'];

    const imgHTML = imgEl
      ? `<img src="${imgEl.src}" alt="${name}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;display:block;">`
      : `<span style="font-size:5rem;">${emoji}</span>`;

    openModal(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;align-barang:start;">
        <div style="background:${imgEl ? 'transparent' : bg};border-radius:4px;aspect-ratio:3/4;
          display:flex;align-barang:center;justify-content:center;overflow:hidden;">
          ${imgHTML}
        </div>
        <div>
          <span style="display:inline-block;font-size:.65rem;font-weight:500;
            letter-spacing:.1em;text-transform:uppercase;color:#2D4A3E;
            background:rgba(45,74,62,.1);padding:.2rem .55rem;border-radius:2px;margin-bottom:.6rem;">
            ${cond}
          </span>
          <h3 style="font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;
            margin-bottom:.4rem;line-height:1.2;">${name}</h3>
          <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap;">
            <span style="font-size:.8rem;color:#7A7568;">👤 ${seller}</span>
            ${negeri ? `<span style="font-size:.72rem;color:#2D4A3E;background:rgba(45,74,62,.08);
              padding:.15rem .45rem;border-radius:2px;font-weight:500;">📍 ${negeri}</span>` : ''}
          </div>
          <div style="margin-bottom:1.25rem;">
            <span style="font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:900;">${price}</span>
            <span style="font-size:.82rem;color:#7A7568;text-decoration:line-through;margin-left:.4rem;">${orig}</span>
          </div>
          <p style="font-size:.75rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;
            color:#7A7568;margin-bottom:.6rem;">Saiz</p>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.25rem;" id="qv-sizes">
            ${listingSize ? `<span style="padding:.4rem .85rem;border:1px solid #1A1A18;border-radius:2px;
              background:#1A1A18;color:#F5F0E8;font-family:'DM Sans',sans-serif;font-size:.8rem;
              font-weight:500;">${listingSize}</span>` : ''}
          </div>
          <button id="qv-add-btn" onclick="ECO.qvAddToCart('${name.replace(/'/g,"\\'")}',${parseFloat(price.replace(/[^0-9.]/g,''))||0})" style="
            width:100%;background:#1A1A18;color:#F5F0E8;border:none;padding:.85rem;
            font-family:'DM Sans',sans-serif;font-size:.85rem;font-weight:500;
            letter-spacing:.06em;text-transform:uppercase;cursor:pointer;
            border-radius:2px;margin-bottom:.6rem;transition:background .2s;">
            Tambah ke Troli
          </button>
          <button onclick="ECO.toggleWishlist('${name.replace(/'/g,"\\'")}',this)" style="
            width:100%;background:transparent;border:1px solid rgba(196,168,130,.5);
            padding:.75rem;font-family:'DM Sans',sans-serif;font-size:.85rem;
            font-weight:500;cursor:pointer;border-radius:2px;color:#7A7568;
            transition:all .2s;margin-bottom:.5rem;">
            ${saved ? '♥ Tersimpan' : '♡ Simpan ke Kegemaran'}
          </button>
          <a href="chat.html?product=${encodeURIComponent(name)}&price=${parseFloat(price.replace(/[^0-9.]/g,''))||0}&seller=${encodeURIComponent(seller)}&sellerId=${encodeURIComponent(sellerId)}" style="
            display:block;width:100%;background:#2D4A3E;color:#F5F0E8;border:none;padding:.75rem;
            font-family:'DM Sans',sans-serif;font-size:.85rem;font-weight:500;
            letter-spacing:.06em;text-transform:uppercase;cursor:pointer;
            border-radius:2px;text-align:center;text-decoration:none;transition:background .2s;"
            onmouseover="this.style.background='#1A1A18'" onmouseout="this.style.background='#2D4A3E'">
            💬 Chat Penjual
          </a>
        </div>
      </div>
    `);
    _qvSelectedSaiz = listingSize || 'M';
  }

  let _qvSelectedSaiz = 'M';
  function selectSaiz(btn) { /* unused — size fixed per listing */ }

  function qvAddToCart(name, price) {
    addToCart(name, price, _qvSelectedSaiz);
    closeModal();
  }

  /* ── FILTERS ────────────────────────────────────────── */
  function initFilters() {
    // Checkbox toggles — sync with active filter tags
    document.querySelectorAll('.filter-option').forEach(opt => {
      opt.addEventListener('click', () => {
        opt.classList.toggle('checked');
        const label = opt.textContent.trim().replace(/\d[\d,]*/g,'').trim();
        const isChecked = opt.classList.contains('checked');
        syncFilterTag(label, isChecked);
        updateResultCount();
      });
    });

    // Active filter tag removal → uncheck sidebar
    document.addEventListener('click', e => {
      if (e.target.closest('.active-filter-tag')) {
        const tag = e.target.closest('.active-filter-tag');
        const label = tag.textContent.replace('×','').trim();
        tag.remove();
        document.querySelectorAll('.filter-option').forEach(opt => {
          const optLabel = opt.textContent.trim().replace(/\d[\d,]*/g,'').trim();
          if (optLabel === label) opt.classList.remove('checked');
        });
        updateResultCount();
      }
    });

    // Clear all
    document.querySelector('.clear-filters')?.addEventListener('click', () => {
      document.querySelectorAll('.filter-option.checked').forEach(o => o.classList.remove('checked'));
      document.querySelector('.active-filters')?.querySelectorAll('.active-filter-tag').forEach(t => t.remove());
      document.querySelectorAll('.colour-swatch.selected').forEach(s => s.classList.remove('selected'));
      updateResultCount();
      toast('Semua penapis dikosongkan', 'info');
    });

    // Collapsible filter groups
    document.querySelectorAll('.filter-group-title').forEach(title => {
      title.style.cursor = 'pointer';
      title.addEventListener('click', () => {
        const group = title.nextElementSibling;
        if (!group) return;
        const isOpen = group.style.display !== 'none';
        group.style.display = isOpen ? 'none' : '';
        const arrow = title.querySelector('span');
        if (arrow) arrow.textContent = isOpen ? '▸' : '▾';
      });
    });

    // Colour swatches
    document.querySelectorAll('[title]').forEach(swatch => {
      if (!swatch.style.borderRadius?.includes('50%')) return;
      swatch.classList.add('colour-swatch');
      swatch.addEventListener('click', () => {
        const selected = swatch.classList.toggle('selected');
        const colour = swatch.getAttribute('title');
        swatch.style.outline = selected ? '2px solid #1A1A18' : 'none';
        swatch.style.outlineOffset = '2px';
        syncFilterTag(colour, selected);
        updateResultCount();
      });
    });

    // Price range
    const priceInputs = document.querySelectorAll('.price-input');
    priceInputs.forEach(inp => {
      inp.addEventListener('change', () => updateResultCount());
    });
  }

  function syncFilterTag(label, add) {
    const container = document.querySelector('.active-filters');
    if (!container) return;
    if (add) {
      if (container.querySelector(`[data-filter="${label}"]`)) return;
      const tag = document.createElement('div');
      tag.className = 'active-filter-tag';
      tag.dataset.filter = label;
      tag.innerHTML = `${label} <span>×</span>`;
      container.appendChild(tag);
    } else {
      container.querySelector(`[data-filter="${label}"]`)?.remove();
    }
  }

  function updateResultCount() {
    const checkedCount = document.querySelectorAll('.filter-option.checked').length;
    const el = document.querySelector('.result-count');
    if (!el) return;
    const base = parseInt(el.dataset.base || el.textContent) || 4210;
    el.dataset.base = base;
    const shown = checkedCount > 0 ? Math.max(20, Math.floor(base * (0.4 + Math.random() * 0.3))) : base;
    el.textContent = shown.toLocaleString() + ' pieces found';
  }

  /* ── SORT ───────────────────────────────────────────── */
  function initSort() {
    const sel = document.querySelector('.sort-select');
    if (!sel) return;
    sel.addEventListener('change', () => {
      state.sortOrder = sel.value;
      toast(`Diisih mengikut: ${sel.options[sel.selectedIndex].text}`, 'info', 1800);
      animateGrid();
    });
  }

  function animateGrid() {
    document.querySelectorAll('.product-card').forEach((c, i) => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(12px)';
      setTimeout(() => {
        c.style.transition = 'opacity .35s ease, transform .35s ease';
        c.style.opacity = '1';
        c.style.transform = 'translateY(0)';
      }, i * 40);
    });
  }

  /* ── PAGINATION ─────────────────────────────────────── */
  function initPagination() {
    document.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('arrow')) {
          const active = document.querySelector('.page-btn.active');
          const pages  = [...document.querySelectorAll('.page-btn:not(.arrow)')];
          const idx    = pages.indexOf(active);
          const next   = btn.textContent === '›' ? pages[idx+1] : pages[idx-1];
          if (next) next.click();
          return;
        }
        document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentHalaman = parseInt(btn.textContent) || 1;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        animateGrid();
        toast(`Halaman ${state.currentPage}`, 'info', 1200);
      });
    });
  }

  /* ── SUBCATEGORY PILLS ──────────────────────────────── */
  function initSubcatPills() {
    document.querySelectorAll('.subcat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.subcat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.textContent.trim();
        toast(`Melayari: ${cat}`, 'info', 1500);
        animateGrid();
        updateResultCount();
      });
    });
  }

  /* ── NEWSLETTER ─────────────────────────────────────── */
  function initNewsletter() {
    document.querySelectorAll('.newsletter-form, .newsletter-input + button, button.btn-primary').forEach(el => {
      // handled via delegation below
    });

    document.addEventListener('click', e => {
      // Newsletter subscribe
      const subscribeBtn = e.target.closest('.newsletter-form button, .newsletter button');
      if (subscribeBtn) {
        const input = subscribeBtn.closest('section')?.querySelector('.newsletter-input, input[type="email"]');
        const email = input?.value?.trim();
        if (!email || !email.includes('@')) {
          toast('Sila masukkan alamat emel yang sah', 'error'); return;
        }
        toast(`🎉 Dilanggan! Selamat datang ke komuniti kami`, 'success', 3500);
        if (input) input.value = '';
        return;
      }

      // Promo banner alert btn
      if (e.target.classList.contains('btn-promo')) {
        openModal(`
          <h3 style="font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;margin-bottom:1rem;">
            Dapatkan Makluman Koleksi
          </h3>
          <p style="color:#7A7568;font-size:.9rem;margin-bottom:1.5rem;line-height:1.7;">
            Jadilah yang pertama tahu apabila produk baru tiba. Kami hantar satu emel fokus seminggu — tiada sebarang lebihan.
          </p>
          <input type="email" placeholder="your@email.com" id="alert-email" style="
            width:100%;padding:.85rem 1rem;background:#E8DFD0;
            border:1px solid rgba(196,168,130,.5);border-radius:2px;
            font-family:'DM Sans',sans-serif;font-size:.9rem;margin-bottom:.75rem;outline:none;">
          <button onclick="ECO.subscribeAlert()" style="
            width:100%;background:#2D4A3E;color:#F5F0E8;border:none;padding:.85rem;
            font-family:'DM Sans',sans-serif;font-size:.85rem;font-weight:500;
            letter-spacing:.06em;text-transform:uppercase;cursor:pointer;border-radius:2px;">
            Langgan untuk Makluman
          </button>
        `);
      }

      // Sign in button
      if (e.target.classList.contains('btn-nav') && e.target.textContent.includes('Sign')) {
        openSignIn();
      }

      // Sell btn
      if (e.target.classList.contains('btn-white') && e.target.textContent.includes('Sell')) {
        openSellModal();
      }

      // How it works
      if (e.target.classList.contains('btn-ghost')) {
        openHowItWorks();
      }

      // Shop Now / btn-primary on hero
      if (e.target.classList.contains('btn-primary') && !e.target.closest('.newsletter')) {
        window.location.href = 'ecothrift-clothes.html';
      }
    });
  }

  function subscribeAlert() {
    const email = document.getElementById('alert-email')?.value?.trim();
    if (!email || !email.includes('@')) { toast('Masukkan emel yang sah', 'error'); return; }
    closeModal();
    toast('🎉 You\'re on the list! First drops incoming.', 'success', 3500);
  }

  /* ── SIGN IN MODAL ──────────────────────────────────── */
  function openSignIn() {
    openModal(`
      <h3 style="font-family:'Playfair Display',serif;font-size:1.7rem;font-weight:900;margin-bottom:.4rem;">
        Selamat kembali
      </h3>
      <p style="color:#7A7568;font-size:.88rem;margin-bottom:1.75rem;">Log masuk ke akaun Ecothrift anda</p>
      <input type="email" placeholder="Alamat emel" id="si-email" style="
        width:100%;padding:.85rem 1rem;background:#E8DFD0;
        border:1px solid rgba(196,168,130,.5);border-radius:2px;
        font-family:'DM Sans',sans-serif;font-size:.9rem;margin-bottom:.75rem;outline:none;
        display:block;">
      <input type="password" placeholder="Kata laluan" id="si-pass" style="
        width:100%;padding:.85rem 1rem;background:#E8DFD0;
        border:1px solid rgba(196,168,130,.5);border-radius:2px;
        font-family:'DM Sans',sans-serif;font-size:.9rem;margin-bottom:1.25rem;outline:none;
        display:block;">
      <button onclick="ECO.signIn()" style="
        width:100%;background:#1A1A18;color:#F5F0E8;border:none;padding:.95rem;
        font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:500;
        letter-spacing:.06em;text-transform:uppercase;cursor:pointer;border-radius:2px;
        margin-bottom:1rem;">
        Log Masuk
      </button>
      <p style="text-align:center;font-size:.82rem;color:#7A7568;">
        Tiada akaun? 
        <span onclick="ECO.openSignUp()" style="color:#B85C3A;cursor:pointer;text-decoration:underline;">
          Daftar di sini
        </span>
      </p>
    `);
  }

  function signIn() {
    const email = document.getElementById('si-email')?.value?.trim();
    const pass  = document.getElementById('si-pass')?.value;
    if (!email || !pass) { toast('Sila isi semua ruangan', 'error'); return; }
    closeModal();
    state.signedIn = true;
    document.querySelectorAll('.btn-nav').forEach(b => {
      if (b.textContent.includes('Sign')) b.textContent = email.split('@')[0];
    });
    toast(`Selamat kembali, ${email.split('@')[0]}! 👋`, 'success', 3000);
  }

  function openSignUp() {
    openModal(`
      <h3 style="font-family:'Playfair Display',serif;font-size:1.7rem;font-weight:900;margin-bottom:.4rem;">
        Sertai Ecothrift
      </h3>
      <p style="color:#7A7568;font-size:.88rem;margin-bottom:1.75rem;">Percuma untuk sertai. Mula jimat hari ini.</p>
      <input type="text" placeholder="Nama penuh" style="
        width:100%;padding:.85rem 1rem;background:#E8DFD0;
        border:1px solid rgba(196,168,130,.5);border-radius:2px;
        font-family:'DM Sans',sans-serif;font-size:.9rem;margin-bottom:.75rem;outline:none;display:block;">
      <input type="email" placeholder="Alamat emel" style="
        width:100%;padding:.85rem 1rem;background:#E8DFD0;
        border:1px solid rgba(196,168,130,.5);border-radius:2px;
        font-family:'DM Sans',sans-serif;font-size:.9rem;margin-bottom:.75rem;outline:none;display:block;">
      <input type="password" placeholder="Cipta kata laluan" style="
        width:100%;padding:.85rem 1rem;background:#E8DFD0;
        border:1px solid rgba(196,168,130,.5);border-radius:2px;
        font-family:'DM Sans',sans-serif;font-size:.9rem;margin-bottom:1.25rem;outline:none;display:block;">
      <button onclick="ECO.completeSignUp()" style="
        width:100%;background:#2D4A3E;color:#F5F0E8;border:none;padding:.95rem;
        font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:500;
        letter-spacing:.06em;text-transform:uppercase;cursor:pointer;border-radius:2px;">
        Daftar Akaun
      </button>
    `);
  }

  function completeSignUp() {
    closeModal();
    toast('🎉 Akaun dicipta! Selamat datang ke Ecothrift.', 'success', 3500);
  }

  /* ── SELL MODAL ─────────────────────────────────────── */
  function openSellModal() {
    openModal(`
      <h3 style="font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:900;margin-bottom:.5rem;">
        Mula Menjual
      </h3>
      <p style="color:#7A7568;font-size:.88rem;margin-bottom:1.5rem;line-height:1.7;">
        List your item in under 2 minutes. We handle authentication, shipping, and payment.
      </p>
      <div style="display:grid;gap:.75rem;margin-bottom:1.5rem;">
        ${[
          ['📸','Foto barang anda','Foto jelas pada latar belakang neutral'],
          ['✏️','Huraikannya','Keadaan, saiz, jenama, harga asal'],
          ['💰','Tetapkan harga anda','Kami cadangkan berdasarkan data pasaran'],
          ['🚚','Hantar keluar','Kami sediakan label penghantaran prabayar'],
        ].map(([icon,title,desc]) => `
          <div style="display:flex;gap:1rem;align-barang:flex-start;padding:.85rem;
            background:#F5F0E8;border-radius:3px;">
            <span style="font-size:1.4rem;">${icon}</span>
            <div>
              <div style="font-size:.88rem;font-weight:500;margin-bottom:.2rem;">${title}</div>
              <div style="font-size:.78rem;color:#7A7568;">${desc}</div>
            </div>
          </div>`).join('')}
      </div>
      <button onclick="ECO.startListing()" style="
        width:100%;background:#B85C3A;color:#FEFCF8;border:none;padding:.95rem;
        font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:500;
        letter-spacing:.06em;text-transform:uppercase;cursor:pointer;border-radius:2px;">
        Senaraikan Barang Pertama Saya
      </button>
    `);
  }

  function startListing() {
    closeModal();
    toast('📸 Aliran senarai akan datang!', 'info', 2500);
  }

  /* ── HOW IT WORKS ───────────────────────────────────── */
  function openHowItWorks() {
    openModal(`
      <h3 style="font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:900;margin-bottom:1.5rem;">
        Cara Ecothrift Berfungsi
      </h3>
      ${[
        ['🔍','Semak Imbas & Temui','Tapis mengikut kategori, saiz, keadaan, jenama dan harga. Setiap produk adalah nyata — tiada bot, tiada penjual pukal.'],
        ['🛍','Beli dengan Yakin','Tambah ke troli, pilih saiz anda, dan bayar dengan selamat. Kami terima kad, FPX, dan e-dompet.'],
        ['🔒','Sentiasa Disahkan','Pasukan kami memeriksa setiap barang sebelum dihantar. Penilaian keadaan dijamin.'],
        ['🚚','Fast Delivery','Pesanan dihantar dalam masa 48 jam. Pemulangan percuma dalam 7 hari jika ada masalah.'],
        ['♻️','Tutup Kitaran','Jual pakaian terpakai anda sendiri. Apa yang berpusing akan kembali.'],
      ].map(([icon,title,desc],i) => `
        <div style="display:flex;gap:1.25rem;padding:.85rem 0;
          ${i<4?'border-bottom:1px solid rgba(196,168,130,.2)':''} ">
          <span style="font-size:1.6rem;flex-shrink:0;">${icon}</span>
          <div>
            <div style="font-size:.95rem;font-weight:500;margin-bottom:.3rem;">${title}</div>
            <div style="font-size:.82rem;color:#7A7568;line-height:1.6;">${desc}</div>
          </div>
        </div>`).join('')}
    `);
  }

  /* ── CART ICON CLICK ────────────────────────────────── */
  function initCartIcon() {
    document.querySelectorAll('.cart-icon').forEach(icon => {
      icon.addEventListener('click', openCart);
    });
  }

  /* ── PRODUCT CARD INTERACTIONS ──────────────────────── */
  function initProductCards() {
    document.querySelectorAll('.product-card').forEach(card => {
      // Click image → quick view
      card.querySelector('.product-img')?.addEventListener('click', () => quickView(card));

      // Wishlist button
      const saveBtn = card.querySelector('.product-save');
      if (saveBtn) {
        const name = card.querySelector('.product-name')?.textContent || '';
        if (state.wishlist.includes(name)) {
          saveBtn.textContent = '♥'; saveBtn.style.color = '#B85C3A';
        }
        saveBtn.addEventListener('click', e => {
          e.stopPropagation();
          toggleWishlist(name, saveBtn);
        });
      }

      // Click card body → quick view
      card.querySelector('.product-name')?.addEventListener('click', () => quickView(card));
      card.querySelector('.product-price')?.addEventListener('click', () => quickView(card));
    });
  }

  /* ── HERO SHOP NOW ──────────────────────────────────── */
  function initHero() {
    document.querySelector('.btn-primary')?.addEventListener('click', () => {
      if (!window.location.pathname.includes('clothes')) {
        window.location.href = 'ecothrift-clothes.html';
      }
    });
  }

  /* ── CSS INJECTION ──────────────────────────────────── */
  function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ecoSlideIn  { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:none } }
      @keyframes ecoSlideOut { from { opacity:1; transform:none } to { opacity:0; transform:translateX(20px) } }
      @keyframes ecoFadeIn   { from { opacity:0 } to { opacity:1 } }
      @keyframes ecoSlideUp  { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:none } }

      .product-img { cursor:pointer; }
      .product-name, .product-price { cursor:pointer; }
      .product-name:hover { text-decoration:underline; text-underline-offset:3px; }

      .filter-option { user-select:none; }
      .filter-option:hover .filter-checkbox { border-color:#1A1A18; }

      .subcat-pill { transition:all .2s; }

      .page-btn { transition:all .15s; }

      #eco-modal-box button:not(#eco-modal-close):hover {
        filter:brightness(1.1);
      }

      .cart-icon { cursor:pointer; font-size:1.4rem; }

      .colour-swatch { transition:transform .15s; }
      .colour-swatch:hover { transform:scale(1.15); }
      .colour-swatch.selected { transform:scale(1.15); }

      .active-filter-tag { cursor:pointer; transition:opacity .15s; }
      .active-filter-tag:hover { opacity:.7; }

      .product-save { cursor:pointer; transition:transform .15s; }
      .product-save:hover { transform:scale(1.2); }

      .sort-select { cursor:pointer; }

      .btn-nav { cursor:pointer; }
      .btn-primary, .btn-ghost, .btn-white, .btn-promo { cursor:pointer; }

      /* Smooth filter sidebar scroll */
      .filters { scrollbar-width:thin; scrollbar-color:rgba(196,168,130,.4) transparent; }
    `;
    document.head.appendChild(style);
  }

  /* ── INIT ───────────────────────────────────────────── */
  function init() {
    injectCSS();
    updateCartBadge();
    updateWishlistBtns();
    initFilters();
    initSort();
    initPagination();
    initSubcatPills();
    initNewsletter();
    initCartIcon();
    initProductCards();
    initHero();
    animateGrid();
  }

  document.addEventListener('DOMContentLoaded', init);

  /* ── PUBLIC API ─────────────────────────────────────── */
  return {
    addToCart, removeFromCart, openCart, checkout,
    toggleWishlist,
    quickView, selectSaiz, qvAddToCart,
    subscribeAlert,
    signIn, openSignUp, completeSignUp,
    startListing,
    openSignIn, openSellModal, openHowItWorks,
    toast,
  };

})();
