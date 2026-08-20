/* ============================================================
   Mind Cloud .sa — الواجهة المشتركة (ترويسة، تذييل، تنبيهات)
   ============================================================ */

const UI = (() => {
  const logoHTML = () => `
    <a class="logo" href="index.html" aria-label="Mind Cloud .sa">
      <span class="m">Mind</span><span class="c">Cloud</span><span class="dot"></span><span class="sa">.sa</span>
    </a>`;

  function renderHeader(active = '') {
    const user = MC.currentUser();
    const cartCount = MC.cart().length;
    const links = [
      ['index.html', 'الرئيسية'],
      ['products.html', 'المنتجات'],
      ['about.html', 'عن المشروع'],
      ['faq.html', 'الأسئلة الشائعة'],
      ['contact.html', 'التواصل والدعم']
    ];
    const nav = links.map(([href, label]) =>
      `<a href="${href}" class="${active === href ? 'active' : ''}">${label}</a>`).join('');

    let actions;
    if (user) {
      actions = `
        ${user.role === 'admin' ? '<a class="btn btn-gold btn-sm" href="admin/index.html">لوحة التحكم</a>' : ''}
        <a class="btn btn-blue btn-sm" href="checkout.html">🛒 السلة${cartCount ? ' (' + cartCount + ')' : ''}</a>
        <a class="btn btn-primary btn-sm" href="account.html">👤 حسابي</a>`;
    } else {
      actions = `
        <a class="btn btn-blue btn-sm" href="checkout.html">🛒 السلة${cartCount ? ' (' + cartCount + ')' : ''}</a>
        <a class="btn btn-primary btn-sm" href="auth.html">تسجيل الدخول</a>`;
    }

    document.body.insertAdjacentHTML('afterbegin', `
      <header class="site-header">
        <div class="container inner">
          ${logoHTML()}
          <button class="nav-toggle" aria-label="القائمة" onclick="document.querySelector('.main-nav').classList.toggle('open')">☰</button>
          <nav class="main-nav">${nav}</nav>
          <div class="header-actions">${actions}</div>
        </div>
      </header>`);
  }

  function renderFooter() {
    const s = MC.settings();
    document.body.insertAdjacentHTML('beforeend', `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              ${logoHTML()}
              <p class="about-txt">منصة سعودية لبيع الملفات الرقمية الاحترافية — نمكّن روّاد الأعمال والمبدعين من أدوات تصنع النجاح.</p>
            </div>
            <div>
              <h4>روابط سريعة</h4>
              <ul>
                <li><a href="index.html">الرئيسية</a></li>
                <li><a href="products.html">المنتجات</a></li>
                <li><a href="about.html">عن المشروع</a></li>
                <li><a href="faq.html">الأسئلة الشائعة</a></li>
              </ul>
            </div>
            <div>
              <h4>الحساب</h4>
              <ul>
                <li><a href="auth.html">تسجيل الدخول</a></li>
                <li><a href="account.html">حسابي ومشترياتي</a></li>
                <li><a href="terms.html">الشروط والخصوصية</a></li>
              </ul>
            </div>
            <div>
              <h4>تواصل معنا</h4>
              <ul>
                <li><a href="mailto:${s.contactEmail || ''}">✉️ ${s.contactEmail || ''}</a></li>
                <li><a href="tel:${(s.contactPhone || '').replace(/\s/g, '')}">📞 <span dir="ltr">${s.contactPhone || ''}</span></a></li>
                <li><a href="contact.html">🎧 الدعم الفني</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            © ${new Date().getFullYear()} Mind Cloud <span class="sa-mark">.sa</span> — جميع الحقوق محفوظة | تمكين روّاد الأعمال والمبتكرين في المملكة العربية السعودية
          </div>
        </div>
      </footer>
      <div id="toast" role="status"></div>`);
  }

  let toastTimer;
  function toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'show ' + type;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }

  function alertBox(el, msg, type = 'error') {
    el.textContent = msg;
    el.className = `alert alert-${type} show`;
  }

  // حراسة الصفحات التي تتطلب تسجيل دخول
  function requireAuth() {
    if (!MC.currentUser()) {
      const next = encodeURIComponent(location.pathname.split('/').pop() + location.search);
      location.href = 'auth.html?next=' + next;
      return null;
    }
    return MC.currentUser();
  }

  const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('');

  const productCardHTML = (p, owned = false) => `
    <article class="product-card">
      <div class="product-cover ${p.cover}">
        <span class="cat-tag">${MC.esc(p.category)}</span>
        ${p.featured ? '<span class="badge-featured">⭐ مميز</span>' : ''}
        ${MC.esc(p.icon)}
      </div>
      <div class="product-body">
        <h3>${MC.esc(p.title)}</h3>
        <p class="desc">${MC.esc(p.desc)}</p>
        <div class="product-meta">
          <span class="price">${MC.fmtPrice(p.price)}${p.oldPrice ? `<span class="old">${MC.fmtPrice(p.oldPrice)}</span>` : ''}</span>
          <span class="sales-count">⬇️ ${p.sales || 0} عملية شراء</span>
        </div>
        <div class="product-actions">
          ${owned
            ? '<a class="btn btn-dark btn-sm" href="account.html">✔️ تم شراؤه — حسابي</a>'
            : `<button class="btn btn-primary btn-sm" onclick="UI.buyNow('${p.id}')">شراء الآن</button>
               <button class="btn btn-outline btn-sm" onclick="UI.addCart('${p.id}')">+ السلة</button>`}
        </div>
      </div>
    </article>`;

  function addCart(pid) {
    const user = MC.currentUser();
    if (user && MC.ownsProduct(user.id, pid)) { toast('هذا المنتج موجود في مشترياتك بالفعل', 'error'); return; }
    if (MC.addToCart(pid)) {
      toast('تمت إضافة المنتج إلى السلة ✔️');
      refreshCartBadge();
    } else {
      toast('المنتج موجود في السلة مسبقًا', 'error');
    }
  }

  function buyNow(pid) {
    const user = MC.currentUser();
    if (user && MC.ownsProduct(user.id, pid)) { toast('هذا المنتج موجود في مشترياتك بالفعل', 'error'); return; }
    MC.addToCart(pid);
    location.href = 'checkout.html';
  }

  function refreshCartBadge() {
    const btn = document.querySelector('.header-actions .btn-blue');
    if (btn) {
      const n = MC.cart().length;
      btn.innerHTML = '🛒 السلة' + (n ? ' (' + n + ')' : '');
    }
  }

  return { renderHeader, renderFooter, toast, alertBox, requireAuth, initials, productCardHTML, addCart, buyNow, refreshCartBadge };
})();
