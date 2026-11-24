const WA_URL = 'https://wa.me/201501110777?text=' + encodeURIComponent('مرحباً يوسف، أريد الاستفسار عن تصميم موقع');
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2200);
}

$$('[data-wa]').forEach((a) => (a.href = WA_URL));

$$('.play').forEach((btn) => {
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

$('#copyBtn').addEventListener('click', async () => {
  const num = $('#phone').textContent.trim();
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

$('#burger').addEventListener('click', () => $('#menu').classList.toggle('open'));
$$('#menu a').forEach((a) => a.addEventListener('click', () => $('#menu').classList.remove('open')));
$('#yr').textContent = new Date().getFullYear();
