/* ============================================================
   Mind Cloud .sa — لوحة التحكم: الحراسة والتخطيط المشترك
   ============================================================ */

const ADMIN = (() => {
  // السماح للمدير فقط
  function guard() {
    const u = MC.currentUser();
    if (!u) { location.href = '../auth.html?next=' + encodeURIComponent('admin/index.html'); return null; }
    if (u.role !== 'admin') { location.href = '../index.html'; return null; }
    return u;
  }

  const NAV = [
    ['index.html', '📊', 'نظرة عامة'],
    ['products.html', '📦', 'المنتجات'],
    ['orders.html', '🧾', 'الطلبات'],
    ['users.html', '👥', 'المستخدمون'],
    ['messages.html', '💬', 'رسائل الدعم'],
    ['settings.html', '⚙️', 'إعدادات المنصة']
  ];

  function layout(active, title, admin) {
    const page = location.pathname.split('/').pop() || 'index.html';
    document.body.classList.add('admin-body');
    document.body.insertAdjacentHTML('afterbegin', `
      <div class="admin-layout">
        <aside class="admin-sidebar">
          <div class="logo-wrap">
            <a class="logo" href="../index.html" style="font-size:1rem">
              <span class="m">Mind</span><span class="c">Cloud</span><span class="dot"></span><span class="sa">.sa</span>
            </a>
            <div style="font-size:.75rem;margin-top:8px;color:var(--gold);font-weight:700">لوحة تحكم المنصة</div>
          </div>
          <nav class="admin-nav">
            ${NAV.map(([href, ico, label]) => `<a href="${href}" class="${page === href ? 'active' : ''}">${ico} ${label}</a>`).join('')}
          </nav>
          <div class="side-footer">
            <a href="../index.html" style="color:#C9D4E8">↩️ عرض الموقع</a><br>
            <a href="#" onclick="MC.logout(); location.href='../index.html'; return false" style="color:#F0A0A0">🚪 تسجيل الخروج</a>
          </div>
        </aside>
        <div class="admin-main">
          <div class="admin-topbar">
            <h1>${title}</h1>
            <div class="admin-user">
              <span>${admin.name}</span>
              <div class="avatar">${admin.name.trim()[0]}</div>
            </div>
          </div>
          <div id="adminContent"></div>
        </div>
      </div>
      <div id="toast" role="status"></div>`);
  }

  function init(title) {
    const admin = guard();
    if (!admin) return null;
    layout(location.pathname, title, admin);
    return admin;
  }

  const content = () => document.getElementById('adminContent');

  const statusLabel = {
    completed: 'مكتمل', pending: 'قيد المعالجة', cancelled: 'ملغي',
    new: 'جديدة', answered: 'تم الرد', closed: 'مغلقة'
  };

  return { init, content, statusLabel };
})();
