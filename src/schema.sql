-- Proxy Panel schema
CREATE TABLE IF NOT EXISTS subscriptions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  url           TEXT,
  price         REAL    NOT NULL DEFAULT 0,
  currency      TEXT    NOT NULL DEFAULT 'CNY',
  cycle_days    INTEGER NOT NULL DEFAULT 30,     -- 计费周期（天），例如月付=30、年付=365
  purchase_date TEXT    NOT NULL,                 -- YYYY-MM-DD
  expiry_date   TEXT    NOT NULL,                 -- YYYY-MM-DD
  last_renewed  TEXT,                             -- YYYY-MM-DD，最近一次续费日期
  notes         TEXT,
  archived      INTEGER NOT NULL DEFAULT 0,       -- 0=活跃 1=归档
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_subs_expiry ON subscriptions(expiry_date);
CREATE INDEX IF NOT EXISTS idx_subs_archived ON subscriptions(archived);

-- 登录验证码挑战：密码校验通过后生成一次性 code，用户从 TG 读取后回填
CREATE TABLE IF NOT EXISTS login_codes (
  id         TEXT    PRIMARY KEY,          -- challenge id（随机 24 字节 base64url）
  code_hash  TEXT    NOT NULL,             -- SHA-256(salt + code)
  ip         TEXT,
  ua         TEXT,
  expires_at INTEGER NOT NULL,             -- unix 秒
  attempts   INTEGER NOT NULL DEFAULT 0,
  used       INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_login_codes_expires ON login_codes(expires_at);

-- 记录已经发送过的提醒，避免重复推送
CREATE TABLE IF NOT EXISTS reminder_log (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id INTEGER NOT NULL,
  days_before     INTEGER NOT NULL,
  sent_for_expiry TEXT    NOT NULL,   -- 针对哪个 expiry_date 发送的
  sent_at         TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(subscription_id, days_before, sent_for_expiry)
);
