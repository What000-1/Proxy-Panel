export const HTML_PAGE = /* html */ `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
<title>Proxy Panel · 机场订阅面板</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ctext y='52' font-size='52'%3E%E2%9C%88%EF%B8%8F%3C/text%3E%3C/svg%3E" />
<style>
  :root {
    color-scheme: light dark;
    --bg: #f4f6fb;
    --bg-2: #eef1f8;
    --panel: rgba(255,255,255,0.72);
    --panel-strong: rgba(255,255,255,0.9);
    --border: rgba(20,30,60,0.08);
    --border-strong: rgba(20,30,60,0.14);
    --text: #1a2036;
    --text-soft: #5a6584;
    --text-mute: #8892b0;
    --brand: #5b6cff;
    --brand-2: #7a5bff;
    --ok: #10b981;
    --warn: #f59e0b;
    --danger: #ef4444;
    --shadow: 0 10px 30px rgba(20,30,60,0.08), 0 2px 8px rgba(20,30,60,0.04);
    --radius: 14px;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0b1020;
      --bg-2: #0f1530;
      --panel: rgba(22,27,49,0.72);
      --panel-strong: rgba(22,27,49,0.92);
      --border: rgba(255,255,255,0.06);
      --border-strong: rgba(255,255,255,0.12);
      --text: #e6ecff;
      --text-soft: #a9b3d3;
      --text-mute: #6c7699;
      --shadow: 0 10px 30px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.25);
    }
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
      "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    color: var(--text);
    background:
      radial-gradient(1000px 600px at 10% -10%, rgba(91,108,255,0.16), transparent 60%),
      radial-gradient(900px 500px at 110% 10%, rgba(122,91,255,0.14), transparent 60%),
      var(--bg);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 1200px; margin: 0 auto; padding: 24px 20px 60px; }
  header.top {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
  }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand .logo {
    width: 42px; height: 42px; border-radius: 12px;
    background: linear-gradient(135deg, var(--brand), var(--brand-2));
    display: grid; place-items: center; font-size: 22px; color: #fff;
    box-shadow: 0 8px 20px rgba(91,108,255,0.35);
  }
  .brand h1 { font-size: 20px; margin: 0; letter-spacing: 0.2px; }
  .brand p { margin: 0; color: var(--text-mute); font-size: 12px; }
  .top-actions { display: flex; gap: 8px; flex-wrap: wrap; }

  .btn {
    appearance: none; border: 1px solid var(--border-strong);
    background: var(--panel-strong); color: var(--text);
    padding: 8px 14px; border-radius: 10px; font-size: 13px;
    cursor: pointer; transition: transform .06s ease, background .15s;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .btn:hover { background: var(--panel); }
  .btn:active { transform: translateY(1px); }
  .btn.primary {
    background: linear-gradient(135deg, var(--brand), var(--brand-2));
    color: #fff; border-color: transparent;
    box-shadow: 0 8px 22px rgba(91,108,255,0.35);
  }
  .btn.primary:hover { filter: brightness(1.05); }
  .btn.ghost { background: transparent; }
  .btn.danger { color: #fff; background: var(--danger); border-color: transparent; }
  .btn.small { padding: 5px 10px; font-size: 12px; border-radius: 8px; }
  .btn:disabled { opacity: .5; cursor: not-allowed; }

  /* stats */
  .stats {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 14px; margin-bottom: 20px;
  }
  @media (max-width: 720px) { .stats { grid-template-columns: repeat(2, 1fr); } }
  .stat {
    background: var(--panel); backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px 18px; box-shadow: var(--shadow);
  }
  .stat .label { color: var(--text-mute); font-size: 12px; }
  .stat .value { font-size: 24px; font-weight: 700; margin-top: 4px; }
  .stat .sub { color: var(--text-mute); font-size: 11px; margin-top: 4px; }

  /* toolbar */
  .toolbar {
    display: flex; gap: 10px; align-items: center; margin-bottom: 14px;
    flex-wrap: wrap;
  }
  .search {
    flex: 1; min-width: 200px;
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px; border-radius: 10px;
    background: var(--panel); border: 1px solid var(--border);
  }
  .search input {
    flex: 1; border: 0; outline: 0; background: transparent;
    color: var(--text); font-size: 13px;
  }
  .filters { display: flex; gap: 6px; }
  .chip {
    padding: 6px 12px; border-radius: 999px; font-size: 12px;
    background: var(--panel); border: 1px solid var(--border);
    cursor: pointer; color: var(--text-soft);
  }
  .chip.active { background: var(--brand); color: #fff; border-color: transparent; }

  /* cards */
  .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
  .card {
    position: relative;
    background: var(--panel); backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px; box-shadow: var(--shadow);
    transition: transform .12s ease, border-color .12s ease;
  }
  .card:hover { transform: translateY(-2px); border-color: var(--border-strong); }
  .card .top-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
  .card .name { font-weight: 600; font-size: 16px; }
  .card .url {
    display: inline-flex; align-items: center; gap: 4px;
    color: var(--text-mute); font-size: 12px; text-decoration: none;
    margin-top: 2px; word-break: break-all;
  }
  .card .url:hover { color: var(--brand); }
  .badge {
    font-size: 11px; padding: 3px 9px; border-radius: 999px;
    background: rgba(16,185,129,0.15); color: var(--ok); white-space: nowrap;
  }
  .badge.warn { background: rgba(245,158,11,0.15); color: var(--warn); }
  .badge.danger { background: rgba(239,68,68,0.18); color: var(--danger); }
  .badge.muted { background: rgba(120,130,160,0.18); color: var(--text-mute); }

  .kv { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; margin-top: 14px; font-size: 12px; }
  .kv .k { color: var(--text-mute); }
  .kv .v { color: var(--text); font-weight: 500; }
  .notes { margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border-strong);
    font-size: 12px; color: var(--text-soft); white-space: pre-wrap; word-break: break-word; }
  .card-actions { display: flex; gap: 6px; margin-top: 14px; }

  .empty {
    text-align: center; padding: 60px 20px; color: var(--text-mute);
    border: 1px dashed var(--border-strong); border-radius: var(--radius);
  }

  /* modal */
  .mask {
    position: fixed; inset: 0; background: rgba(10,15,30,0.55);
    backdrop-filter: blur(4px); display: none; z-index: 30;
    align-items: center; justify-content: center; padding: 16px;
  }
  .mask.show { display: flex; }
  .modal {
    width: 100%; max-width: 520px; max-height: 90vh; overflow: auto;
    background: var(--panel-strong); border: 1px solid var(--border-strong);
    border-radius: 16px; box-shadow: var(--shadow); padding: 22px;
  }
  .modal h2 { margin: 0 0 4px; font-size: 18px; }
  .modal p.sub { margin: 0 0 18px; color: var(--text-mute); font-size: 12px; }
  .form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .form .full { grid-column: 1 / -1; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field label { font-size: 12px; color: var(--text-soft); }
  .field input, .field textarea, .field select {
    background: var(--bg-2); border: 1px solid var(--border-strong);
    border-radius: 10px; padding: 9px 12px; font-size: 13px; color: var(--text);
    outline: 0; transition: border-color .15s;
    font-family: inherit;
  }
  .field input:focus, .field textarea:focus, .field select:focus {
    border-color: var(--brand);
  }
  .field textarea { min-height: 70px; resize: vertical; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }

  /* login */
  .login-wrap {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .login {
    width: 100%; max-width: 380px;
    background: var(--panel-strong); border: 1px solid var(--border);
    border-radius: 18px; padding: 30px; box-shadow: var(--shadow);
    text-align: center;
  }
  .login .logo { margin: 0 auto 14px; }
  .login h1 { margin: 0 0 6px; font-size: 20px; }
  .login p { margin: 0 0 20px; color: var(--text-mute); font-size: 13px; }
  .login input {
    width: 100%; padding: 11px 14px; border-radius: 10px;
    background: var(--bg-2); border: 1px solid var(--border-strong);
    color: var(--text); font-size: 14px; margin-bottom: 12px; outline: 0;
  }
  .login .btn { width: 100%; justify-content: center; padding: 11px; }

  /* toast */
  .toast-wrap { position: fixed; bottom: 20px; right: 20px; z-index: 50; display: flex; flex-direction: column; gap: 8px; }
  .toast {
    background: var(--panel-strong); border: 1px solid var(--border-strong);
    padding: 10px 14px; border-radius: 10px; box-shadow: var(--shadow);
    font-size: 13px; animation: slideIn .2s ease;
  }
  .toast.err { border-left: 3px solid var(--danger); }
  .toast.ok { border-left: 3px solid var(--ok); }
  @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

  .link { color: var(--brand); cursor: pointer; text-decoration: none; }
  .link:hover { text-decoration: underline; }
</style>
</head>
<body>
<div id="app"></div>
<div class="toast-wrap" id="toasts"></div>

<script>
// ------------ tiny helpers ------------
const $ = (sel, el = document) => el.querySelector(sel);
const el = (tag, attrs = {}, ...children) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v === true) e.setAttribute(k, '');
    else if (v === false || v == null) {}
    else e.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return e;
};
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function toast(msg, kind = 'ok') {
  const t = el('div', { class: 'toast ' + kind }, msg);
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 2800);
}

async function api(path, options = {}) {
  const opts = { ...options };
  if (opts.body && typeof opts.body === 'object') {
    opts.headers = { 'content-type': 'application/json', ...(opts.headers || {}) };
    opts.body = JSON.stringify(opts.body);
  }
  const r = await fetch(path, opts);
  const data = await r.json().catch(() => ({}));
  if (!r.ok || data.ok === false) {
    const msg = data.error || ('HTTP ' + r.status);
    if (r.status === 401 && path !== '/login') {
      renderLogin();
      throw new Error('未登录');
    }
    throw new Error(msg);
  }
  return data;
}

function todayISO() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function daysUntil(iso) {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const d = Date.UTC(+iso.slice(0,4), +iso.slice(5,7) - 1, +iso.slice(8,10));
  return Math.round((d - today) / 86400000);
}

function statusOf(sub) {
  if (sub.archived) return { kind: 'muted', text: '已归档' };
  const d = daysUntil(sub.expiry_date);
  if (d < 0) return { kind: 'danger', text: '已过期 ' + (-d) + ' 天' };
  if (d === 0) return { kind: 'danger', text: '今天到期' };
  if (d <= 3) return { kind: 'danger', text: d + ' 天后到期' };
  if (d <= 7) return { kind: 'warn', text: d + ' 天后到期' };
  return { kind: 'ok', text: d + ' 天后到期' };
}

// ------------ state ------------
const state = {
  items: [],
  filter: 'all', // all | active | soon | expired | archived
  q: '',
  editing: null, // subscription or null
};

// ------------ render: login ------------
function renderLogin() {
  document.body.innerHTML = '';
  const app = el('div', { id: 'app' });
  document.body.appendChild(app);
  document.body.appendChild(el('div', { class: 'toast-wrap', id: 'toasts' }));

  const err = el('div', { class: 'toast err', style: 'display:none;margin-bottom:10px' });
  const info = el('div', { class: 'toast ok', style: 'display:none;margin-bottom:10px' });

  // 第一步：密码
  const passInput = el('input', { type: 'password', placeholder: '登录密码', autofocus: true });
  const passBtn = el('button', { class: 'btn primary', onclick: doPassword }, '获取验证码');

  // 第二步：验证码
  const codeStep = el('div', { style: 'display:none' });
  const codeInput = el('input', {
    type: 'text', inputmode: 'numeric', maxlength: '6',
    placeholder: '6 位数字验证码',
    style: 'letter-spacing:6px;text-align:center;font-size:18px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace',
  });
  const codeBtn = el('button', { class: 'btn primary', onclick: doVerify }, '登录');
  const backBtn = el('button', { class: 'btn ghost', onclick: reset, style: 'margin-top:8px;width:100%;justify-content:center' }, '← 返回上一步');
  const countdown = el('div', { style: 'color:var(--text-mute);font-size:12px;margin:8px 0 12px' });

  let challengeId = null;
  let timer = null;

  function showErr(msg) { err.textContent = msg; err.style.display = 'block'; info.style.display = 'none'; }
  function showInfo(msg) { info.textContent = msg; info.style.display = 'block'; err.style.display = 'none'; }
  function clearMsgs() { err.style.display = 'none'; info.style.display = 'none'; }

  function reset() {
    if (timer) { clearInterval(timer); timer = null; }
    challengeId = null;
    codeStep.style.display = 'none';
    passInput.parentElement.style.display = '';
    passBtn.style.display = '';
    passBtn.disabled = false; passBtn.textContent = '获取验证码';
    codeInput.value = '';
    clearMsgs();
    setTimeout(() => passInput.focus(), 0);
  }

  function startCountdown(seconds) {
    let left = seconds;
    const tick = () => {
      const m = Math.floor(left / 60);
      const s = left % 60;
      countdown.textContent = '⏳ 验证码有效期剩余 ' + m + ':' + String(s).padStart(2, '0');
      if (left <= 0) {
        clearInterval(timer); timer = null;
        countdown.textContent = '⚠️ 验证码已过期，请返回重新获取';
        codeBtn.disabled = true;
      }
      left--;
    };
    tick();
    timer = setInterval(tick, 1000);
  }

  async function doPassword() {
    clearMsgs();
    if (!passInput.value) { showErr('请输入密码'); return; }
    passBtn.disabled = true; passBtn.textContent = '发送中…';
    try {
      const r = await api('/login', { method: 'POST', body: { password: passInput.value } });
      if (r.need_code === false) {
        showInfo(r.warn || '登录成功');
        await load();
        return;
      }
      challengeId = r.challenge_id;
      passInput.parentElement.style.display = 'none';
      passBtn.style.display = 'none';
      codeStep.style.display = '';
      showInfo('✅ 验证码已发送到 Telegram，请查收（IP 尾号 ' + (r.ip_hint || '***') + '）');
      startCountdown(r.expires_in || 300);
      codeBtn.disabled = false;
      setTimeout(() => codeInput.focus(), 0);
    } catch (e) {
      showErr(e.message);
      passBtn.disabled = false; passBtn.textContent = '获取验证码';
    }
  }

  async function doVerify() {
    if (!challengeId) return;
    const code = codeInput.value.trim();
    if (!/^\d{4,8}$/.test(code)) { showErr('请输入验证码'); return; }
    codeBtn.disabled = true; codeBtn.textContent = '验证中…';
    try {
      await api('/login/verify', { method: 'POST', body: { challenge_id: challengeId, code } });
      if (timer) clearInterval(timer);
      await load();
    } catch (e) {
      showErr(e.message);
      codeBtn.disabled = false; codeBtn.textContent = '登录';
    }
  }

  passInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doPassword(); });
  codeInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doVerify(); });
  codeInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  codeStep.appendChild(codeInput);
  codeStep.appendChild(countdown);
  codeStep.appendChild(codeBtn);
  codeStep.appendChild(backBtn);

  const passWrap = el('div', {}, passInput);

  app.appendChild(el('div', { class: 'login-wrap' },
    el('div', { class: 'login' },
      el('div', { class: 'logo', style: 'width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,var(--brand),var(--brand-2));color:#fff;display:grid;place-items:center;font-size:26px;box-shadow:0 8px 20px rgba(91,108,255,0.35);margin:0 auto 14px' }, '✈'),
      el('h1', {}, 'Proxy Panel'),
      el('p', {}, '机场订阅管理与到期提醒'),
      err, info,
      passWrap,
      passBtn,
      codeStep,
    )
  ));
}

// ------------ render: main ------------
async function load() {
  try {
    const data = await api('/api/subscriptions');
    state.items = data.items;
    renderMain();
  } catch (e) {
    if (e.message !== '未登录') toast(e.message, 'err');
  }
}

function renderMain() {
  document.body.innerHTML = '';
  const app = el('div', { id: 'app' });
  document.body.appendChild(app);
  document.body.appendChild(el('div', { class: 'toast-wrap', id: 'toasts' }));

  const wrap = el('div', { class: 'wrap' });
  app.appendChild(wrap);

  // header
  wrap.appendChild(el('header', { class: 'top' },
    el('div', { class: 'brand' },
      el('div', { class: 'logo' }, '✈'),
      el('div', {},
        el('h1', {}, 'Proxy Panel'),
        el('p', {}, '机场订阅管理与 Telegram 到期提醒')
      )
    ),
    el('div', { class: 'top-actions' },
      el('button', { class: 'btn ghost', onclick: testTelegram }, '📨 测试 TG'),
      el('button', { class: 'btn ghost', onclick: runCron }, '🔔 立即检查提醒'),
      el('button', { class: 'btn ghost', onclick: logout }, '退出'),
      el('button', { class: 'btn primary', onclick: () => openEditor(null) }, '＋ 添加机场'),
    )
  ));

  // stats
  const active = state.items.filter(s => !s.archived);
  const soon = active.filter(s => { const d = daysUntil(s.expiry_date); return d >= 0 && d <= 7; });
  const expired = active.filter(s => daysUntil(s.expiry_date) < 0);
  const monthly = active.reduce((sum, s) => sum + (s.price * 30 / s.cycle_days), 0);

  wrap.appendChild(el('div', { class: 'stats' },
    statCard('总订阅', active.length, '个活跃机场'),
    statCard('即将到期', soon.length, '未来 7 天内'),
    statCard('已过期', expired.length, '待处理'),
    statCard('月均支出', monthly.toFixed(2), '按周期折算'),
  ));

  // toolbar
  const searchInput = el('input', {
    placeholder: '搜索名称 / 链接 / 备注…',
    value: state.q,
    oninput: (e) => { state.q = e.target.value; renderList(list); }
  });
  const toolbar = el('div', { class: 'toolbar' },
    el('div', { class: 'search' }, el('span', {}, '🔎'), searchInput),
    el('div', { class: 'filters' },
      chip('all', '全部'),
      chip('soon', '即将到期'),
      chip('expired', '已过期'),
      chip('archived', '已归档'),
    )
  );
  wrap.appendChild(toolbar);

  // list
  const list = el('div');
  wrap.appendChild(list);
  renderList(list);

  // modal container
  wrap.appendChild(el('div', { class: 'mask', id: 'mask' }));
}

function statCard(label, value, sub) {
  return el('div', { class: 'stat' },
    el('div', { class: 'label' }, label),
    el('div', { class: 'value' }, String(value)),
    el('div', { class: 'sub' }, sub),
  );
}

function chip(key, label) {
  return el('div', {
    class: 'chip' + (state.filter === key ? ' active' : ''),
    onclick: () => { state.filter = key; renderMain(); }
  }, label);
}

function renderList(container) {
  container.innerHTML = '';
  let items = state.items.slice();

  if (state.filter === 'archived') items = items.filter(s => s.archived);
  else items = items.filter(s => !s.archived);

  if (state.filter === 'soon') items = items.filter(s => { const d = daysUntil(s.expiry_date); return d >= 0 && d <= 7; });
  if (state.filter === 'expired') items = items.filter(s => daysUntil(s.expiry_date) < 0);

  const q = state.q.trim().toLowerCase();
  if (q) items = items.filter(s => (s.name + ' ' + (s.url || '') + ' ' + (s.notes || '')).toLowerCase().includes(q));

  if (items.length === 0) {
    container.appendChild(el('div', { class: 'empty' }, '暂无匹配的订阅记录。点击右上角「＋ 添加机场」开始记录。'));
    return;
  }

  const cards = el('div', { class: 'cards' });
  for (const sub of items) cards.appendChild(renderCard(sub));
  container.appendChild(cards);
}

function renderCard(sub) {
  const st = statusOf(sub);
  const urlEl = sub.url
    ? el('a', { class: 'url', href: sub.url, target: '_blank', rel: 'noopener' }, '🔗 ' + sub.url)
    : el('div', { class: 'url', style: 'opacity:.5' }, '— 未填写链接 —');

  return el('div', { class: 'card' },
    el('div', { class: 'top-row' },
      el('div', {},
        el('div', { class: 'name' }, sub.name),
        urlEl
      ),
      el('span', { class: 'badge ' + st.kind }, st.text),
    ),
    el('div', { class: 'kv' },
      el('div', { class: 'k' }, '价格'),
      el('div', { class: 'v' }, sub.price + ' ' + sub.currency + ' / ' + sub.cycle_days + ' 天'),
      el('div', { class: 'k' }, '到期日'),
      el('div', { class: 'v' }, sub.expiry_date),
      el('div', { class: 'k' }, '购买日'),
      el('div', { class: 'v' }, sub.purchase_date),
      el('div', { class: 'k' }, '上次续费'),
      el('div', { class: 'v' }, sub.last_renewed || '—'),
    ),
    sub.notes ? el('div', { class: 'notes' }, sub.notes) : null,
    el('div', { class: 'card-actions' },
      el('button', { class: 'btn small primary', onclick: () => renewSub(sub) }, '续费'),
      el('button', { class: 'btn small', onclick: () => openEditor(sub) }, '编辑'),
      el('button', { class: 'btn small', onclick: () => toggleArchive(sub) }, sub.archived ? '恢复' : '归档'),
      el('button', { class: 'btn small danger', onclick: () => deleteSub(sub) }, '删除'),
    ),
  );
}

// ------------ modal editor ------------
function openEditor(sub) {
  const isEdit = !!sub;
  const s = sub || {
    name: '', url: '', price: 0, currency: 'CNY',
    cycle_days: 30, purchase_date: todayISO(), expiry_date: '',
    last_renewed: '', notes: '',
  };

  const f = {
    name: el('input', { value: s.name || '', required: true, placeholder: '例如：机场A' }),
    url: el('input', { value: s.url || '', placeholder: 'https://example.com/user' }),
    price: el('input', { type: 'number', step: '0.01', min: '0', value: s.price ?? 0 }),
    currency: el('input', { value: s.currency || 'CNY', placeholder: 'CNY / USD…' }),
    cycle_days: el('input', { type: 'number', min: '1', value: s.cycle_days || 30 }),
    purchase_date: el('input', { type: 'date', value: s.purchase_date || todayISO() }),
    expiry_date: el('input', { type: 'date', value: s.expiry_date || '' }),
    last_renewed: el('input', { type: 'date', value: s.last_renewed || '' }),
    notes: el('textarea', { placeholder: '账号、套餐、流量、备注…' }, s.notes || ''),
  };

  // 自动算到期
  const autoExpiry = () => {
    if (isEdit) return;
    if (!f.purchase_date.value || !f.cycle_days.value) return;
    const start = f.purchase_date.value;
    const days = parseInt(f.cycle_days.value, 10);
    if (!Number.isFinite(days)) return;
    const d = new Date(Date.UTC(+start.slice(0,4), +start.slice(5,7)-1, +start.slice(8,10)));
    d.setUTCDate(d.getUTCDate() + days);
    f.expiry_date.value = d.toISOString().slice(0, 10);
  };
  f.purchase_date.addEventListener('change', autoExpiry);
  f.cycle_days.addEventListener('change', autoExpiry);
  if (!isEdit && !f.expiry_date.value) autoExpiry();

  const modal = el('div', { class: 'modal' },
    el('h2', {}, isEdit ? '编辑机场' : '添加机场'),
    el('p', { class: 'sub' }, isEdit ? '修改后保存即可。' : '填写基础信息，系统会自动推算到期日。'),
    el('div', { class: 'form' },
      field('名称 *', f.name, true),
      field('机场链接（订阅/官网）', f.url, true),
      field('价格', f.price),
      field('币种', f.currency),
      field('计费周期（天）', f.cycle_days),
      field('购买日期', f.purchase_date),
      field('到期日期', f.expiry_date),
      field('最近续费', f.last_renewed),
      field('备注', f.notes, true),
    ),
    el('div', { class: 'modal-actions' },
      el('button', { class: 'btn ghost', onclick: closeModal }, '取消'),
      el('button', { class: 'btn primary', onclick: () => save() }, isEdit ? '保存修改' : '添加'),
    ),
  );

  async function save() {
    const payload = {
      name: f.name.value.trim(),
      url: f.url.value.trim() || null,
      price: parseFloat(f.price.value) || 0,
      currency: f.currency.value.trim() || 'CNY',
      cycle_days: parseInt(f.cycle_days.value, 10) || 30,
      purchase_date: f.purchase_date.value,
      expiry_date: f.expiry_date.value,
      last_renewed: f.last_renewed.value || null,
      notes: f.notes.value.trim() || null,
    };
    if (!payload.name) return toast('请填写名称', 'err');
    if (!payload.purchase_date || !payload.expiry_date) return toast('请填写购买日期与到期日期', 'err');
    try {
      if (isEdit) await api('/api/subscriptions/' + sub.id, { method: 'PUT', body: payload });
      else await api('/api/subscriptions', { method: 'POST', body: payload });
      toast(isEdit ? '已保存' : '已添加');
      closeModal();
      await load();
    } catch (e) { toast(e.message, 'err'); }
  }

  const mask = $('#mask');
  mask.innerHTML = '';
  mask.appendChild(modal);
  mask.classList.add('show');
  mask.onclick = (e) => { if (e.target === mask) closeModal(); };
}

function field(label, input, full) {
  return el('div', { class: 'field' + (full ? ' full' : '') },
    el('label', {}, label),
    input,
  );
}

function closeModal() {
  const mask = $('#mask');
  if (mask) { mask.classList.remove('show'); mask.innerHTML = ''; }
}

// ------------ actions ------------
async function renewSub(sub) {
  const days = prompt('本次续费天数（默认按订阅周期 ' + sub.cycle_days + ' 天）：', String(sub.cycle_days));
  if (days === null) return;
  const on = prompt('续费日期（YYYY-MM-DD，默认今天）：', todayISO());
  if (on === null) return;
  try {
    const r = await api('/api/subscriptions/' + sub.id + '/renew', {
      method: 'POST',
      body: { on: on || todayISO(), extend_days: parseInt(days, 10) || sub.cycle_days },
    });
    toast('续费成功，新到期日：' + r.expiry_date);
    await load();
  } catch (e) { toast(e.message, 'err'); }
}

async function toggleArchive(sub) {
  try {
    await api('/api/subscriptions/' + sub.id, { method: 'PUT', body: { archived: !sub.archived } });
    await load();
  } catch (e) { toast(e.message, 'err'); }
}

async function deleteSub(sub) {
  if (!confirm('确定删除「' + sub.name + '」？此操作不可撤销。')) return;
  try {
    await api('/api/subscriptions/' + sub.id, { method: 'DELETE' });
    toast('已删除');
    await load();
  } catch (e) { toast(e.message, 'err'); }
}

async function testTelegram() {
  try {
    await api('/api/telegram/test', { method: 'POST' });
    toast('测试消息已发送');
  } catch (e) { toast(e.message, 'err'); }
}

async function runCron() {
  try {
    const r = await api('/api/cron/run', { method: 'POST' });
    toast('检查完成：发送 ' + r.notified + '，跳过 ' + r.skipped);
  } catch (e) { toast(e.message, 'err'); }
}

async function logout() {
  await fetch('/logout', { method: 'GET' });
  renderLogin();
}

// ------------ init ------------
(async () => {
  try {
    await api('/api/session');
    await load();
  } catch (e) {
    renderLogin();
  }
})();
</script>
</body>
</html>`;
