/* ── ECOTHRIFT AUTH NAV ────────────────────────────────────────────────────
   Mendengar perubahan auth state dan kemaskini butang nav pada semua halaman.
   ────────────────────────────────────────────────────────────────────────── */

(function () {
  const ADMIN_EMAIL = 'naqiuddinellis18@gmail.com';

  function updateNav(user) {
    const btn = document.getElementById('nav-signin-btn');
    if (!btn) return;

    // Show/hide admin link
    let adminLink = document.getElementById('nav-admin-link');
    if (user && user.email === ADMIN_EMAIL) {
      if (!adminLink) {
        adminLink = document.createElement('a');
        adminLink.id = 'nav-admin-link';
        adminLink.href = 'admin.html';
        adminLink.textContent = '⚙ Admin';
        adminLink.style.cssText = 'font-size:0.78rem;font-weight:600;letter-spacing:0.06em;' +
          'text-transform:uppercase;color:#B85C3A;text-decoration:none;' +
          'background:rgba(184,92,58,0.1);padding:0.4rem 0.8rem;border-radius:2px;transition:background 0.2s;';
        adminLink.onmouseover = () => adminLink.style.background = 'rgba(184,92,58,0.2)';
        adminLink.onmouseout  = () => adminLink.style.background = 'rgba(184,92,58,0.1)';
        btn.parentNode.insertBefore(adminLink, btn);
      }
    } else {
      if (adminLink) adminLink.remove();
    }

    if (user) {
      const name = user.displayName ? user.displayName.split(' ')[0] : user.email.split('@')[0];
      btn.innerHTML = `
        <span style="font-size:0.8rem;font-weight:500;letter-spacing:0.04em;">👤 ${name}</span>
        <span id="nav-logout-btn" style="font-size:0.72rem;color:var(--smoke);cursor:pointer;margin-left:0.5rem;text-decoration:underline;">Log Keluar</span>
      `;
      btn.style.pointerEvents = 'none';
      btn.style.cursor = 'default';

      setTimeout(() => {
        const logoutBtn = document.getElementById('nav-logout-btn');
        if (logoutBtn) {
          logoutBtn.style.pointerEvents = 'all';
          logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            auth.signOut().then(() => {
              window.location.href = 'signin.html';
            });
          });
        }
      }, 100);
    } else {
      btn.innerHTML = 'Log Masuk';
      btn.style.pointerEvents = '';
      btn.style.cursor = '';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof auth === 'undefined') return;
    auth.onAuthStateChanged(updateNav);
  });
})();
