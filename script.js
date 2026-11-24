const PHONE_INTL = '201501110777';
const WA_TEXT = 'مرحباً يوسف، أريد الاستفسار عن تصميم موقع';
const WA_URL = `https://wa.me/${PHONE_INTL}?text=${encodeURIComponent(WA_TEXT)}`;

const PROJECTS = [
  { id: 'smile', name: 'عيادة Smile Care', brand: 'Smile Care', url: 'https://github.io',
    desc: 'موقع طبي متكامل لعيادة أسنان مع نظام حجز مباشر.', g1: 'rgba(0,229,255,.28)', g2: 'rgba(99,102,241,.25)' },
  { id: 'fire', name: 'مطعم Fire Burger', brand: 'Fire Burger', url: 'https://github.io',
    desc: 'موقع مطعم ومنيو تفاعلي لعرض الوجبات والعروض والفروع.', g1: 'rgba(249,115,22,.30)', g2: 'rgba(239,68,68,.22)' },
  { id: 'watch', name: 'ساعة Ultra Pro الذكية', brand: 'Ultra Pro', url: 'https://github.io',
    desc: 'صفحة هبوط بيعية عالية التحويل مع نموذج طلب مباشر.', g1: 'rgba(99,102,241,.35)', g2: 'rgba(0,229,255,.18)' },
  { id: 'art', name: 'منصة Art Home', brand: 'Art Home', url: 'https://github.io', soon: true,
    desc: 'منصة قيد التطوير، وتوجد نسخة تجريبية للمعاينة.', g1: 'rgba(168,85,247,.28)', g2: 'rgba(236,72,153,.2)' }
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

const LS = (() => {
  const mem = {};
  let ok = true;
  try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); } catch (e) { ok = false; }
  return {
    get: k => (ok ? localStorage.getItem(k) : (k in mem ? mem[k] : null)),
    set: (k, v) => { if (ok) localStorage.setItem(k, v); else mem[k] = v; },
    del: k => { if (ok) localStorage.removeItem(k); else delete mem[k]; }
  };
})();

$$('[data-wa]').forEach(a => (a.href = WA_URL));

const Store = {
  _users: () => JSON.parse(LS.get('yz_users') || '{}'),
  async _hash(p) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(p));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    } catch { return btoa(unescape(encodeURIComponent(p))); }
  },
  async signUp(name, email, pass) {
    const users = this._users();
    if (users[email]) throw new Error('هذا البريد مسجل بالفعل.');
    users[email] = { name, hash: await this._hash(pass) };
    LS.set('yz_users', JSON.stringify(users));
    LS.set('yz_session', email);
    return { name, email };
  },
  async logIn(email, pass) {
    const u = this._users()[email];
    if (!u || u.hash !== await this._hash(pass)) throw new Error('البريد أو كلمة المرور غير صحيحة.');
    LS.set('yz_session', email);
    return { name: u.name, email };
  },
  logOut() { LS.del('yz_session'); },
  current() {
    const email = LS.get('yz_session');
    const u = email && this._users()[email];
    return u ? { name: u.name, email } : null;
  },
  getBookmarks(email) { return JSON.parse(LS.get('yz_bm_' + email) || '[]'); },
  setBookmarks(email, list) { LS.set('yz_bm_' + email, JSON.stringify(list)); }
};

let user = Store.current();

function renderAuthUI() {
  const btn = $('#authBtn'), badge = $('#welcome');
  if (user) {
    const n = Store.getBookmarks(user.email).length;
    badge.textContent = `أهلاً، ${user.name.split(' ')[0]} · ${n} محفوظ`;
    badge.classList.remove('hidden');
    btn.textContent = 'تسجيل الخروج';
  } else {
    badge.classList.add('hidden');
    btn.textContent = 'تسجيل الدخول';
  }
  renderProjects();
}

let mode = 'login';
function setMode(m) {
  mode = m;
  $$('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === m));
  $('#fName').classList.toggle('hidden', m !== 'signup');
  $('#mTitle').textContent = m === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد';
  $('#fSubmit').textContent = m === 'login' ? 'دخول' : 'إنشاء الحساب';
  $('#fPass').autocomplete = m === 'login' ? 'current-password' : 'new-password';
  $('#fErr').textContent = '';
}
function openModal(m = 'login') { setMode(m); $('#modal').classList.remove('hidden'); $('#fEmail').focus(); }
function closeModal() { $('#modal').classList.add('hidden'); $('#authForm').reset(); $('#fErr').textContent = ''; }

$('#authBtn').addEventListener('click', () => {
  if (user) { Store.logOut(); user = null; renderAuthUI(); toast('تم تسجيل الخروج'); }
  else openModal('login');
});
$('#mClose').addEventListener('click', closeModal);
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
$$('.tabs button').forEach(b => b.addEventListener('click', () => setMode(b.dataset.tab)));

$('#authForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = $('#fName').value.trim(), email = $('#fEmail').value.trim().toLowerCase(), pass = $('#fPass').value;
  const err = $('#fErr');
  if (mode === 'signup' && name.length < 2) return (err.textContent = 'اكتب اسمك من فضلك.');
  if (!/^\S+@\S+\.\S+$/.test(email)) return (err.textContent = 'اكتب بريداً إلكترونياً صحيحاً.');
  if (pass.length < 6) return (err.textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
  try {
    user = mode === 'signup' ? await Store.signUp(name, email, pass) : await Store.logIn(email, pass);
    closeModal(); renderAuthUI(); toast(`أهلاً بك يا ${user.name}`);
  } catch (ex) { err.textContent = ex.message; }
});

function renderProjects() {
  const saved = user ? Store.getBookmarks(user.email) : [];
  $('#projects').innerHTML = PROJECTS.map(p => `
    <article class="proj" data-id="${p.id}">
      <div class="screen">
        <div class="bar"><i></i><i></i><i></i><em>${p.url.replace('https://', '')}</em></div>
        <div class="mock" style="--g1:${p.g1};--g2:${p.g2}"><b>${p.brand}</b><small>${p.soon ? 'قريباً' : 'معاينة حية'}</small></div>
        ${p.soon ? '<span class="soon">قيد التطوير - قريباً</span>' : ''}
        <button class="play" data-play="${p.id}">تشغيل المعاينة الحية</button>
      </div>
      <div class="pbody">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="pact">
          <a class="btn primary" href="${p.url}" target="_blank" rel="noopener">${p.soon ? 'معاينة تجريبية' : 'معاينة الموقع'}</a>
          <button class="btn ghost bm ${saved.includes(p.id) ? 'on' : ''}" data-bm="${p.id}" aria-label="حفظ المشروع" aria-pressed="${saved.includes(p.id)}">${saved.includes(p.id) ? '★' : '☆'}</button>
        </div>
      </div>
    </article>`).join('');
}

$('#projects').addEventListener('click', e => {
  const play = e.target.closest('[data-play]');
  if (play) {
    const p = PROJECTS.find(x => x.id === play.dataset.play);
    const screen = play.closest('.screen');
    const f = document.createElement('iframe');
    f.className = 'live';
    f.src = p.url;
    f.loading = 'lazy';
    f.title = 'معاينة ' + p.name;
    f.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
    f.referrerPolicy = 'no-referrer';
    screen.appendChild(f);
    play.remove();
    return;
  }
  const bm = e.target.closest('[data-bm]');
  if (bm) {
    if (!user) { toast('سجّل الدخول لحفظ المشاريع'); return openModal('login'); }
    const id = bm.dataset.bm;
    let list = Store.getBookmarks(user.email);
    list = list.includes(id) ? list.filter(x => x !== id) : [...list, id];
    Store.setBookmarks(user.email, list);
    renderAuthUI();
    toast(list.includes(id) ? 'تم حفظ المشروع' : 'تمت إزالة المشروع من المحفوظات');
  }
});

$('#copyBtn').addEventListener('click', async () => {
  const num = $('#phone').textContent.trim();
  try { await navigator.clipboard.writeText(num); }
  catch {
    const t = document.createElement('textarea');
    t.value = num; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
  }
  toast('تم نسخ الرقم: ' + num);
});

$('#burger').addEventListener('click', () => $('#menu').classList.toggle('open'));
$$('#menu a').forEach(a => a.addEventListener('click', () => $('#menu').classList.remove('open')));
$('#yr').textContent = new Date().getFullYear();

renderAuthUI();
