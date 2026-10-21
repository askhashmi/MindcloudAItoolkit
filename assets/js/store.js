/* ============================================================
   Mind Cloud .sa — طبقة البيانات (localStorage)
   نسخة تجريبية تعمل بالكامل في المتصفح بدون خادم.
   عند الربط بخادم حقيقي تُستبدل هذه الدوال بنداءات API.
   ============================================================ */

const MC = (() => {
  const K = {
    users: 'mc_users',
    session: 'mc_session',
    products: 'mc_products',
    orders: 'mc_orders',
    messages: 'mc_messages',
    settings: 'mc_settings',
    cart: 'mc_cart',
    seeded: 'mc_seeded_v2'
  };

  const read = (k, fallback) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? fallback; }
    catch { return fallback; }
  };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const uid = (p = '') => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  // تهريب رموز HTML — يُستخدم عند إدراج أي نص من المستخدم داخل innerHTML لمنع XSS
  const esc = (s) => String(s ?? '').replace(/[&<>"'`]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[c]));

  /* ---------- تجزئة كلمة المرور ----------
     نسخة تجريبية Front-End: تجزئة مملّحة ومكرّرة (أفضل من تجزئة بسيطة قابلة للعكس)،
     لكنها ليست بديلًا عن KDF على خادم (bcrypt/argon2). الإنتاج يتطلب تجزئة خادمية.
     الصيغة المخزّنة: "salt$hex128" */
  const HASH_ROUNDS = 6000;
  function randSalt() {
    if (window.crypto && crypto.getRandomValues) {
      const a = new Uint32Array(4); crypto.getRandomValues(a);
      return Array.from(a, x => x.toString(16).padStart(8, '0')).join('');
    }
    return (Math.random().toString(16) + Date.now().toString(16)).replace(/\./g, '').slice(0, 32);
  }
  function hashWith(pass, salt) {
    const input = salt + '::' + String(pass);
    let a = [0x811c9dc5, 5381, 0x1000193, 52711].map(x => x >>> 0);
    for (let r = 0; r < HASH_ROUNDS; r++) {
      for (let i = 0; i < input.length; i++) {
        const c = (input.charCodeAt(i) ^ (r & 0xff)) >>> 0;
        for (let k = 0; k < a.length; k++) {
          a[k] = (((a[k] * 33) >>> 0) ^ c ^ a[(k + 1) % a.length]) >>> 0;
        }
      }
    }
    return a.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
  }
  const hash = (pass) => { const salt = randSalt(); return salt + '$' + hashWith(pass, salt); };
  function verify(pass, stored) {
    if (typeof stored !== 'string' || stored.indexOf('$') === -1) return false;
    const [salt, hex] = stored.split('$');
    const a = hashWith(pass, salt);
    // مقارنة بزمن ثابت لتفادي تسريب التوقيت
    if (a.length !== (hex || '').length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ hex.charCodeAt(i);
    return diff === 0;
  }

  const fmtPrice = (n) => Number(n).toLocaleString('ar-SA', { maximumFractionDigits: 2 }) + ' ر.س';
  const fmtDate = (iso) => new Date(iso).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

  /* ---------- البذور الأولية ---------- */
  function seed() {
    if (localStorage.getItem(K.seeded)) return;

    write(K.users, [{
      id: 'u_admin',
      name: 'مدير المنصة',
      email: 'admin@mindcloud.sa',
      pass: hash('Admin@123'),
      role: 'admin',
      active: true,
      createdAt: new Date().toISOString()
    }]);

    const now = Date.now();
    const P = (i, title, desc, category, price, oldPrice, icon, cover, file, featured, sales) => ({
      id: 'p_' + i,
      title, desc, category, price, oldPrice, icon, cover,
      file, featured, sales,
      active: true,
      createdAt: new Date(now - i * 86400000).toISOString()
    });

    write(K.products, [
      P(1, 'دليل ريادة الأعمال في السعودية', 'كتاب إلكتروني شامل (180 صفحة) يغطي رحلة تأسيس الشركات الناشئة في المملكة: التراخيص، التمويل، والنمو.', 'كتب إلكترونية', 89, 129, '📘', 'cover-1', { name: 'saudi-entrepreneurship-guide.pdf', type: 'PDF', size: '12 MB' }, true, 342),
      P(2, 'قالب دراسة الجدوى الاحترافي', 'قالب Excel جاهز مع نماذج مالية تلقائية: التدفقات النقدية، نقطة التعادل، والتوقعات لخمس سنوات.', 'قوالب', 59, null, '📊', 'cover-2', { name: 'feasibility-study-template.xlsx', type: 'XLSX', size: '4 MB' }, true, 518),
      P(3, 'حزمة عروض تقديمية للمستثمرين', '20 شريحة Pitch Deck قابلة للتعديل بالكامل، مصممة وفق معايير صناديق الاستثمار الجريء.', 'قوالب', 120, 180, '🎯', 'cover-3', { name: 'investor-pitch-deck.pptx', type: 'PPTX', size: '28 MB' }, true, 276),
      P(4, 'دورة التسويق الرقمي للمشاريع الناشئة', 'دورة مسجلة (8 ساعات) تغطي إعلانات المنصات، تحسين محركات البحث، وبناء قمع المبيعات.', 'دورات', 249, 349, '🎬', 'cover-4', { name: 'digital-marketing-course.zip', type: 'ZIP', size: '2.4 GB' }, true, 194),
      P(5, 'مجموعة هويات بصرية جاهزة', '10 هويات بصرية متكاملة (شعار + ألوان + خطوط) بصيغ مفتوحة المصدر قابلة للتخصيص.', 'تصاميم', 149, null, '🎨', 'cover-5', { name: 'brand-identity-pack.zip', type: 'ZIP', size: '860 MB' }, false, 88),
      P(6, 'نموذج خطة العمل التنفيذية', 'مستند Word منسق باحترافية لكتابة خطة عمل متكاملة، مع أمثلة وإرشادات لكل قسم.', 'قوالب', 39, 69, '📝', 'cover-6', { name: 'business-plan-template.docx', type: 'DOCX', size: '2 MB' }, false, 431),
      P(7, 'كتاب التحول الرقمي للمنشآت الصغيرة', 'خارطة طريق عملية لرقمنة منشأتك: الأدوات، التكاليف، وقصص نجاح سعودية ملهمة.', 'كتب إلكترونية', 75, null, '💡', 'cover-2', { name: 'digital-transformation.pdf', type: 'PDF', size: '9 MB' }, false, 157),
      P(8, 'أدوات إدارة المشاريع — حزمة Notion', 'قوالب Notion جاهزة لإدارة المهام، خارطة الطريق، واجتماعات الفريق في مكان واحد.', 'أدوات', 45, 65, '🗂️', 'cover-1', { name: 'notion-pm-toolkit.zip', type: 'ZIP', size: '15 MB' }, false, 203),
      P(9, 'دورة أساسيات التجارة الإلكترونية', 'من فتح المتجر حتى أول عملية بيع: منصات البيع، الشحن، وبوابات الدفع السعودية.', 'دورات', 199, null, '🛒', 'cover-3', { name: 'ecommerce-basics-course.zip', type: 'ZIP', size: '1.8 GB' }, false, 121)
    ]);

    write(K.orders, []);
    write(K.messages, []);
    write(K.settings, {
      siteName: 'Mind Cloud',
      heroTitle: 'ملفات رقمية *تصنع الفرق* لروّاد الأعمال',
      heroSub: 'كتب، قوالب، دورات وأدوات احترافية — حمّلها فورًا وابدأ رحلتك نحو مشروع ناجح.',
      contactEmail: 'support@mindcloud.sa',
      contactPhone: '+966 55 000 0000',
      twitter: 'https://x.com/mindcloud_sa',
      whatsapp: 'https://wa.me/966550000000',
      vatRate: 15
    });

    localStorage.setItem(K.seeded, '1');
  }

  /* ---------- المستخدمون والجلسة ---------- */
  const users = () => read(K.users, []);
  const saveUsers = (u) => write(K.users, u);

  function register(name, email, pass) {
    email = email.trim().toLowerCase();
    if (users().some(u => u.email === email)) throw new Error('البريد الإلكتروني مسجّل مسبقًا');
    const u = { id: uid('u_'), name: name.trim(), email, pass: hash(pass), role: 'user', active: true, createdAt: new Date().toISOString() };
    saveUsers([...users(), u]);
    write(K.session, { userId: u.id });
    return u;
  }

  function login(email, pass) {
    email = email.trim().toLowerCase();
    const u = users().find(u => u.email === email);
    if (!u || !verify(pass, u.pass)) throw new Error('بيانات الدخول غير صحيحة');
    if (!u.active) throw new Error('هذا الحساب موقوف — تواصل مع الدعم الفني');
    write(K.session, { userId: u.id });
    return u;
  }

  const logout = () => localStorage.removeItem(K.session);

  function currentUser() {
    const s = read(K.session, null);
    if (!s) return null;
    return users().find(u => u.id === s.userId) || null;
  }

  function updateUser(id, patch) {
    const all = users();
    const i = all.findIndex(u => u.id === id);
    if (i === -1) throw new Error('المستخدم غير موجود');
    if (patch.email) {
      patch.email = patch.email.trim().toLowerCase();
      if (all.some(u => u.email === patch.email && u.id !== id)) throw new Error('البريد الإلكتروني مستخدم من حساب آخر');
    }
    if (patch.pass) patch.pass = hash(patch.pass);
    all[i] = { ...all[i], ...patch };
    saveUsers(all);
    return all[i];
  }

  const deleteUser = (id) => saveUsers(users().filter(u => u.id !== id));

  /* ---------- المنتجات ---------- */
  const products = (onlyActive = false) => {
    const p = read(K.products, []);
    return onlyActive ? p.filter(x => x.active) : p;
  };
  const product = (id) => products().find(p => p.id === id) || null;

  function saveProduct(data) {
    const all = products();
    if (data.id) {
      const i = all.findIndex(p => p.id === data.id);
      if (i === -1) throw new Error('المنتج غير موجود');
      all[i] = { ...all[i], ...data };
    } else {
      all.unshift({ ...data, id: uid('p_'), sales: 0, active: true, createdAt: new Date().toISOString() });
    }
    write(K.products, all);
  }

  const deleteProduct = (id) => write(K.products, products().filter(p => p.id !== id));

  /* ---------- السلة ---------- */
  const cart = () => read(K.cart, []);
  function addToCart(pid) {
    const c = cart();
    if (c.includes(pid)) return false;
    write(K.cart, [...c, pid]);
    return true;
  }
  const removeFromCart = (pid) => write(K.cart, cart().filter(id => id !== pid));
  const clearCart = () => write(K.cart, []);

  /* ---------- الطلبات ---------- */
  const orders = () => read(K.orders, []);
  const userOrders = (userId) => orders().filter(o => o.userId === userId);

  function createOrder(userId, productIds, method) {
    const items = productIds.map(id => {
      const p = product(id);
      return { productId: p.id, title: p.title, price: p.price, icon: p.icon, cover: p.cover, file: p.file };
    });
    const subtotal = items.reduce((s, i) => s + i.price, 0);
    const vatRate = settings().vatRate || 15;
    const vat = +(subtotal * vatRate / 100).toFixed(2);
    const order = {
      id: 'ORD-' + Date.now().toString().slice(-8),
      userId, items, subtotal, vat, total: +(subtotal + vat).toFixed(2),
      method, status: 'completed',
      createdAt: new Date().toISOString()
    };
    write(K.orders, [order, ...orders()]);
    // زيادة عدّاد المبيعات
    const all = products();
    productIds.forEach(id => { const p = all.find(x => x.id === id); if (p) p.sales = (p.sales || 0) + 1; });
    write(K.products, all);
    return order;
  }

  function updateOrder(id, patch) {
    const all = orders();
    const i = all.findIndex(o => o.id === id);
    if (i === -1) return;
    all[i] = { ...all[i], ...patch };
    write(K.orders, all);
  }

  // المنتجات التي يملكها المستخدم (من طلباته المكتملة)
  function ownedProducts(userId) {
    const seen = new Map();
    userOrders(userId).filter(o => o.status === 'completed').forEach(o => {
      o.items.forEach(it => { if (!seen.has(it.productId)) seen.set(it.productId, { ...it, orderId: o.id, date: o.createdAt }); });
    });
    return [...seen.values()];
  }

  const ownsProduct = (userId, pid) => ownedProducts(userId).some(p => p.productId === pid);

  /* ---------- رسائل الدعم ---------- */
  const messages = () => read(K.messages, []);
  function createMessage(data) {
    const m = { id: uid('m_'), ...data, status: 'new', reply: '', createdAt: new Date().toISOString() };
    write(K.messages, [m, ...messages()]);
    return m;
  }
  function updateMessage(id, patch) {
    const all = messages();
    const i = all.findIndex(m => m.id === id);
    if (i === -1) return;
    all[i] = { ...all[i], ...patch };
    write(K.messages, all);
  }
  const deleteMessage = (id) => write(K.messages, messages().filter(m => m.id !== id));

  /* ---------- الإعدادات ---------- */
  const settings = () => read(K.settings, {});
  const saveSettings = (patch) => write(K.settings, { ...settings(), ...patch });

  /* ---------- تنزيل الملف (محاكاة) ---------- */
  function downloadFile(item) {
    const content = [
      'Mind Cloud .sa — منصة الملفات الرقمية',
      '======================================',
      'المنتج: ' + item.title,
      'الملف: ' + item.file.name + ' (' + item.file.type + ' — ' + item.file.size + ')',
      '',
      'هذا ملف تجريبي يمثل المنتج الرقمي الذي اشتريته.',
      'في النسخة الفعلية يتم تسليم الملف الأصلي من خادم آمن برابط موقّع.',
      '',
      'شكرًا لدعمك روّاد الأعمال السعوديين 🇸🇦'
    ].join('\n');
    const blob = new Blob(['﻿' + content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = item.file.name.replace(/\.[^.]+$/, '') + '-mindcloud.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  seed();

  return {
    register, login, logout, currentUser, updateUser, deleteUser, users,
    products, product, saveProduct, deleteProduct,
    cart, addToCart, removeFromCart, clearCart,
    orders, userOrders, createOrder, updateOrder, ownedProducts, ownsProduct,
    messages, createMessage, updateMessage, deleteMessage,
    settings, saveSettings,
    downloadFile, fmtPrice, fmtDate, esc
  };
})();
