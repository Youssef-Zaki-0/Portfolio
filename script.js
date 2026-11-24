const WA_URL = 'https://wa.me/201501110777?text=' + encodeURIComponent('مرحباً يوسف، أريد الاستفسار عن تصميم موقع');
const 1 = (s) => document.querySelector(s);
const 2 = (s) => [...document.querySelectorAll(s)];

function toast(msg) {
  const t = 1('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2200);
}

2('[data-wa]').forEach((a) => (a.href = WA_URL));

2('.play').forEach((btn) => {
  btn.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.className = 'live';
    f.src = btn.dataset.url;
    f.loading = 'lazy';
    f.title = 'معاينة ' + btn.dataset.title;
    f.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
    f.referrerPolicy = 'no-referrer';
    btn.parentElement.appendChild(f);
    btn.remove();
  });
});

1('copyBtn').addEventListener('click', async () => {
  const num = 1('phone').textContent.trim();
  try {
    await navigator.clipboard.writeText(num);
  } catch (e) {
    const t = document.createElement('textarea');
    t.value = num;
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    t.remove();
  }
  toast('تم نسخ الرقم: ' + num);
});

1('burger').addEventListener('click', () => 1('menu').classList.toggle('open'));
2('menu a').forEach((a) => a.addEventListener('click', () => 1('menu').classList.remove('open')));
1('yr').textContent = new Date().getFullYear();
