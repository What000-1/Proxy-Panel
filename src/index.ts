import { HTML_PAGE } from "./ui";

export interface Env {
  DB: D1Database;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
  TG_BOT_TOKEN?: string;
  TG_CHAT_ID?: string;
  REMIND_DAYS?: string;
  TIMEZONE?: string;
}

interface Subscription {
  id: number;
  name: string;
  url: string | null;
  price: number;
  currency: string;
  cycle_days: number;
  purchase_date: string;
  expiry_date: string;
  last_renewed: string | null;
  notes: string | null;
  archived: number;
  created_at: string;
  updated_at: string;
}

const COOKIE_NAME = "pp_session";
const SESSION_TTL = 60 * 60 * 24 * 14; // 14 天
const CODE_TTL = 5 * 60;                // 验证码有效期：5 分钟
const CODE_MAX_ATTEMPTS = 5;            // 单个 challenge 最多尝试次数

// ---------- utilities ----------

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...(init.headers || {}) },
  });
}

function bad(msg: string, status = 400): Response {
  return json({ ok: false, error: msg }, { status });
}

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return b64url(sig);
}

async function makeSession(secret: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL;
  const payload = `v1.${exp}`;
  const sig = await hmac(secret, payload);
  return `${payload}.${sig}`;
}

async function verifySession(secret: string, token: string | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [v, expStr, sig] = parts;
  if (v !== "v1") return false;
  const exp = Number(expStr);
  if (!exp || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmac(secret, `${v}.${expStr}`);
  return timingSafeEq(sig, expected);
}

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function readCookie(req: Request, name: string): string | null {
  const c = req.headers.get("cookie");
  if (!c) return null;
  for (const p of c.split(/;\s*/)) {
    const eq = p.indexOf("=");
    if (eq < 0) continue;
    if (p.slice(0, eq) === name) return decodeURIComponent(p.slice(eq + 1));
  }
  return null;
}

async function isAuthed(req: Request, env: Env): Promise<boolean> {
  return verifySession(env.SESSION_SECRET, readCookie(req, COOKIE_NAME));
}

// ---------- 登录验证码 ----------

function randomId(bytes = 18): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return b64url(arr);
}

function randomCode(len = 6): string {
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  let s = "";
  for (let i = 0; i < len; i++) s += String(arr[i] % 10);
  return s;
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hashCode(secret: string, challengeId: string, code: string): Promise<string> {
  return sha256Hex(`${secret}|${challengeId}|${code}`);
}

function clientIP(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}

function shortUA(req: Request): string {
  const ua = req.headers.get("user-agent") || "";
  return ua.slice(0, 200);
}

function guessDevice(ua: string): string {
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Unknown";
}

function guessBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua)) return "Safari";
  return "Browser";
}

function formatTime(tz: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

async function purgeExpiredCodes(env: Env): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare("DELETE FROM login_codes WHERE expires_at < ?").bind(now).run();
}

// ---------- date helpers ----------

function todayISO(tz = "UTC"): string {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(now); // YYYY-MM-DD
}

function daysBetween(a: string, b: string): number {
  const da = Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10));
  const db = Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10));
  return Math.round((db - da) / 86400000);
}

function addDays(iso: string, days: number): string {
  const d = new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)));
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// ---------- API handlers ----------

async function apiList(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    "SELECT * FROM subscriptions ORDER BY archived ASC, expiry_date ASC",
  ).all<Subscription>();
  return json({ ok: true, items: results ?? [] });
}

interface SubInput {
  name?: string;
  url?: string | null;
  price?: number;
  currency?: string;
  cycle_days?: number;
  purchase_date?: string;
  expiry_date?: string;
  last_renewed?: string | null;
  notes?: string | null;
  archived?: boolean | number;
}

function normalizeInput(body: SubInput, partial: boolean): Record<string, unknown> | string {
  const out: Record<string, unknown> = {};
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) return "name 必填";
    out.name = body.name.trim().slice(0, 100);
  } else if (!partial) return "name 必填";

  if (body.url !== undefined) {
    if (body.url === null || body.url === "") out.url = null;
    else if (typeof body.url !== "string") return "url 非法";
    else out.url = body.url.trim().slice(0, 500);
  }

  if (body.price !== undefined) {
    const n = Number(body.price);
    if (!isFinite(n) || n < 0) return "price 非法";
    out.price = n;
  }

  if (body.currency !== undefined) {
    if (typeof body.currency !== "string") return "currency 非法";
    out.currency = body.currency.trim().slice(0, 8) || "CNY";
  }

  if (body.cycle_days !== undefined) {
    const n = Number(body.cycle_days);
    if (!Number.isInteger(n) || n <= 0 || n > 3650) return "cycle_days 非法";
    out.cycle_days = n;
  }

  for (const k of ["purchase_date", "expiry_date"] as const) {
    if (body[k] !== undefined) {
      if (typeof body[k] !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body[k] as string))
        return `${k} 应为 YYYY-MM-DD`;
      out[k] = body[k];
    } else if (!partial) return `${k} 必填`;
  }

  if (body.last_renewed !== undefined) {
    if (body.last_renewed === null || body.last_renewed === "") out.last_renewed = null;
    else if (typeof body.last_renewed !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.last_renewed))
      return "last_renewed 应为 YYYY-MM-DD";
    else out.last_renewed = body.last_renewed;
  }

  if (body.notes !== undefined) {
    if (body.notes === null) out.notes = null;
    else if (typeof body.notes !== "string") return "notes 非法";
    else out.notes = body.notes.slice(0, 2000);
  }

  if (body.archived !== undefined) {
    out.archived = body.archived ? 1 : 0;
  }

  return out;
}

async function apiCreate(req: Request, env: Env): Promise<Response> {
  const body = (await req.json().catch(() => null)) as SubInput | null;
  if (!body) return bad("请求体无效");
  const v = normalizeInput(body, false);
  if (typeof v === "string") return bad(v);

  const cols = Object.keys(v);
  const placeholders = cols.map(() => "?").join(", ");
  const stmt = env.DB.prepare(
    `INSERT INTO subscriptions (${cols.join(", ")}) VALUES (${placeholders})`,
  ).bind(...cols.map((k) => (v as Record<string, unknown>)[k]));
  const res = await stmt.run();
  return json({ ok: true, id: res.meta.last_row_id });
}

async function apiUpdate(id: number, req: Request, env: Env): Promise<Response> {
  const body = (await req.json().catch(() => null)) as SubInput | null;
  if (!body) return bad("请求体无效");
  const v = normalizeInput(body, true);
  if (typeof v === "string") return bad(v);

  const cols = Object.keys(v);
  if (cols.length === 0) return bad("无更新字段");
  const sets = cols.map((c) => `${c} = ?`).join(", ");
  const stmt = env.DB.prepare(
    `UPDATE subscriptions SET ${sets}, updated_at = datetime('now') WHERE id = ?`,
  ).bind(...cols.map((k) => (v as Record<string, unknown>)[k]), id);
  const res = await stmt.run();
  if (res.meta.changes === 0) return bad("记录不存在", 404);
  return json({ ok: true });
}

async function apiDelete(id: number, env: Env): Promise<Response> {
  const res = await env.DB.prepare("DELETE FROM subscriptions WHERE id = ?").bind(id).run();
  if (res.meta.changes === 0) return bad("记录不存在", 404);
  await env.DB.prepare("DELETE FROM reminder_log WHERE subscription_id = ?").bind(id).run();
  return json({ ok: true });
}

async function apiRenew(id: number, req: Request, env: Env): Promise<Response> {
  const body = (await req.json().catch(() => ({}))) as { on?: string; extend_days?: number };
  const sub = await env.DB.prepare("SELECT * FROM subscriptions WHERE id = ?")
    .bind(id)
    .first<Subscription>();
  if (!sub) return bad("记录不存在", 404);

  const on = body.on && /^\d{4}-\d{2}-\d{2}$/.test(body.on) ? body.on : todayISO();
  const extend = Number.isInteger(body.extend_days) ? Number(body.extend_days) : sub.cycle_days;
  // 从旧到期日和续费日中较晚者算起，避免续费叠加错误
  const base = sub.expiry_date > on ? sub.expiry_date : on;
  const newExpiry = addDays(base, extend);

  await env.DB.prepare(
    "UPDATE subscriptions SET expiry_date = ?, last_renewed = ?, updated_at = datetime('now') WHERE id = ?",
  )
    .bind(newExpiry, on, id)
    .run();
  return json({ ok: true, expiry_date: newExpiry, last_renewed: on });
}

async function apiTestTg(env: Env): Promise<Response> {
  if (!env.TG_BOT_TOKEN || !env.TG_CHAT_ID)
    return bad("尚未配置 TG_BOT_TOKEN / TG_CHAT_ID（用 wrangler secret put 设置）");
  try {
    await sendTelegram(env, "✅ Proxy Panel 测试消息：机器人配置正常。");
    return json({ ok: true });
  } catch (e) {
    return bad(`发送失败: ${(e as Error).message}`);
  }
}

// ---------- Telegram ----------

async function sendTelegram(env: Env, text: string): Promise<void> {
  if (!env.TG_BOT_TOKEN || !env.TG_CHAT_ID) return;
  const resp = await fetch(`https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: env.TG_CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Telegram ${resp.status}: ${t}`);
  }
}

function escapeHTML(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------- Cron: check expiring & notify ----------

async function runReminderCheck(env: Env): Promise<{ notified: number; skipped: number }> {
  const tz = env.TIMEZONE || "UTC";
  const today = todayISO(tz);
  const days = (env.REMIND_DAYS || "7,3,1,0")
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n >= 0);

  const { results } = await env.DB.prepare(
    "SELECT * FROM subscriptions WHERE archived = 0",
  ).all<Subscription>();

  let notified = 0;
  let skipped = 0;

  for (const sub of results ?? []) {
    const remain = daysBetween(today, sub.expiry_date);
    if (!days.includes(remain) && !(remain < 0 && days.includes(0))) continue;

    const bucket = remain < 0 ? 0 : remain;
    // 去重：同一 expiry_date + 同一 bucket 只发一次
    const existing = await env.DB.prepare(
      "SELECT id FROM reminder_log WHERE subscription_id = ? AND days_before = ? AND sent_for_expiry = ?",
    )
      .bind(sub.id, bucket, sub.expiry_date)
      .first();
    if (existing) {
      skipped++;
      continue;
    }

    const emoji = remain < 0 ? "🚨" : remain === 0 ? "⚠️" : remain <= 3 ? "⏰" : "📅";
    const status =
      remain < 0
        ? `已过期 ${-remain} 天`
        : remain === 0
        ? "今天到期"
        : `还剩 ${remain} 天到期`;
    const lines = [
      `${emoji} <b>机场到期提醒</b>`,
      "",
      `• 名称: <b>${escapeHTML(sub.name)}</b>`,
      `• 状态: ${status}`,
      `• 到期: ${sub.expiry_date}`,
      `• 价格: ${sub.price} ${escapeHTML(sub.currency)} / ${sub.cycle_days} 天`,
    ];
    if (sub.url) lines.push(`• 链接: ${escapeHTML(sub.url)}`);
    if (sub.notes) lines.push(`• 备注: ${escapeHTML(sub.notes)}`);

    try {
      await sendTelegram(env, lines.join("\n"));
      await env.DB.prepare(
        "INSERT INTO reminder_log (subscription_id, days_before, sent_for_expiry) VALUES (?, ?, ?)",
      )
        .bind(sub.id, bucket, sub.expiry_date)
        .run();
      notified++;
    } catch (e) {
      console.error("TG send failed", e);
    }
  }

  return { notified, skipped };
}

// ---------- Router ----------

async function handle(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const p = url.pathname;

  // 登录第一步：校验密码 → 生成一次性验证码 → 推送到 TG
  if (p === "/login" && req.method === "POST") {
    const body = (await req.json().catch(() => null)) as { password?: string } | null;
    if (!body?.password || body.password !== env.ADMIN_PASSWORD) return bad("密码错误", 401);

    // 无 TG 配置时退化为单因素，方便首次搭建
    if (!env.TG_BOT_TOKEN || !env.TG_CHAT_ID) {
      const token = await makeSession(env.SESSION_SECRET);
      const secure = url.protocol === "https:" ? "; Secure" : "";
      return json(
        { ok: true, need_code: false, warn: "TG 未配置，已直接登录（建议配置后再使用）" },
        {
          headers: {
            "set-cookie": `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL}${secure}`,
          },
        },
      );
    }

    await purgeExpiredCodes(env);

    const challengeId = randomId();
    const code = randomCode(6);
    const hash = await hashCode(env.SESSION_SECRET, challengeId, code);
    const ip = clientIP(req);
    const ua = shortUA(req);
    const now = Math.floor(Date.now() / 1000);
    const expires = now + CODE_TTL;

    await env.DB.prepare(
      "INSERT INTO login_codes (id, code_hash, ip, ua, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(challengeId, hash, ip, ua, expires, now)
      .run();

    const tz = env.TIMEZONE || "UTC";
    const lines = [
      "🔐 <b>Proxy Panel 登录验证</b>",
      "",
      `验证码：<code>${code}</code>`,
      `有效期：${Math.floor(CODE_TTL / 60)} 分钟`,
      "",
      `📍 IP: <code>${escapeHTML(ip)}</code>`,
      `💻 设备: ${escapeHTML(guessDevice(ua))} · ${escapeHTML(guessBrowser(ua))}`,
      `🕒 时间: ${escapeHTML(formatTime(tz))}`,
      "",
      "<i>若不是本人操作，请立即修改登录密码。</i>",
    ];
    try {
      await sendTelegram(env, lines.join("\n"));
    } catch (e) {
      console.error("send login code failed", e);
      // 清掉这条 challenge 避免残留
      await env.DB.prepare("DELETE FROM login_codes WHERE id = ?").bind(challengeId).run();
      return bad(`验证码发送失败: ${(e as Error).message}`, 500);
    }

    // IP 打码后返回，前端只需知道后缀让用户对得上
    const ipHint = ip.length > 6 ? "***" + ip.slice(-4) : "***";
    return json({
      ok: true,
      need_code: true,
      challenge_id: challengeId,
      expires_in: CODE_TTL,
      ip_hint: ipHint,
    });
  }

  // 登录第二步：校验验证码 → 下发 session
  if (p === "/login/verify" && req.method === "POST") {
    const body = (await req.json().catch(() => null)) as
      | { challenge_id?: string; code?: string }
      | null;
    if (!body?.challenge_id || !body?.code) return bad("参数缺失");

    const rec = await env.DB.prepare(
      "SELECT id, code_hash, expires_at, attempts, used FROM login_codes WHERE id = ?",
    )
      .bind(body.challenge_id)
      .first<{ id: string; code_hash: string; expires_at: number; attempts: number; used: number }>();

    if (!rec) return bad("验证码已失效，请重新登录", 401);
    const now = Math.floor(Date.now() / 1000);
    if (rec.used) return bad("该验证码已使用", 401);
    if (rec.expires_at < now) {
      await env.DB.prepare("DELETE FROM login_codes WHERE id = ?").bind(rec.id).run();
      return bad("验证码已过期，请重新登录", 401);
    }
    if (rec.attempts >= CODE_MAX_ATTEMPTS) {
      await env.DB.prepare("DELETE FROM login_codes WHERE id = ?").bind(rec.id).run();
      return bad("尝试次数过多，请重新登录", 429);
    }

    const inputHash = await hashCode(env.SESSION_SECRET, rec.id, body.code.trim());
    if (!timingSafeEq(inputHash, rec.code_hash)) {
      await env.DB.prepare("UPDATE login_codes SET attempts = attempts + 1 WHERE id = ?")
        .bind(rec.id)
        .run();
      return bad("验证码错误", 401);
    }

    await env.DB.prepare("UPDATE login_codes SET used = 1 WHERE id = ?").bind(rec.id).run();

    const token = await makeSession(env.SESSION_SECRET);
    const secure = url.protocol === "https:" ? "; Secure" : "";
    return json(
      { ok: true },
      {
        headers: {
          "set-cookie": `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL}${secure}`,
        },
      },
    );
  }

  if (p === "/login" || p === "/login/verify") return bad("方法不允许", 405);

  if (p === "/logout") {
    return json(
      { ok: true },
      {
        headers: {
          "set-cookie": `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
        },
      },
    );
  }

  // 页面
  if (p === "/" || p === "/index.html") {
    return new Response(HTML_PAGE, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  // API 全部需要认证
  if (p.startsWith("/api/")) {
    if (!(await isAuthed(req, env))) return bad("未登录", 401);

    if (p === "/api/subscriptions" && req.method === "GET") return apiList(env);
    if (p === "/api/subscriptions" && req.method === "POST") return apiCreate(req, env);

    const m = p.match(/^\/api\/subscriptions\/(\d+)(?:\/(renew))?$/);
    if (m) {
      const id = Number(m[1]);
      const action = m[2];
      if (action === "renew" && req.method === "POST") return apiRenew(id, req, env);
      if (!action && req.method === "PUT") return apiUpdate(id, req, env);
      if (!action && req.method === "DELETE") return apiDelete(id, env);
    }

    if (p === "/api/telegram/test" && req.method === "POST") return apiTestTg(env);

    if (p === "/api/cron/run" && req.method === "POST") {
      const r = await runReminderCheck(env);
      return json({ ok: true, ...r });
    }

    if (p === "/api/session" && req.method === "GET") return json({ ok: true });

    return bad("未找到", 404);
  }

  return bad("未找到", 404);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    try {
      return await handle(req, env);
    } catch (e) {
      console.error(e);
      return bad(`服务器错误: ${(e as Error).message}`, 500);
    }
  },

  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      runReminderCheck(env).then(
        (r) => console.log(`reminder: notified=${r.notified} skipped=${r.skipped}`),
        (e) => console.error("reminder failed", e),
      ),
    );
  },
};
