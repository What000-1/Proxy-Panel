
CREATE TABLE IF NOT EXISTS subscriptions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  url           TEXT,
  price         REAL    NOT NULL DEFAULT 0,
  currency      TEXT    NOT NULL DEFAULT 'CNY',
  cycle_days    INTEGER NOT NULL DEFAULT 30,     
  purchase_date TEXT    NOT NULL,                 
  expiry_date   TEXT    NOT NULL,                 
  last_renewed  TEXT,                             
  notes         TEXT,
  archived      INTEGER NOT NULL DEFAULT 0,       
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_subs_expiry ON subscriptions(expiry_date);
CREATE INDEX IF NOT EXISTS idx_subs_archived ON subscriptions(archived);


CREATE TABLE IF NOT EXISTS login_codes (
  id         TEXT    PRIMARY KEY,          
  code_hash  TEXT    NOT NULL,             
  ip         TEXT,
  ua         TEXT,
  expires_at INTEGER NOT NULL,             
  attempts   INTEGER NOT NULL DEFAULT 0,
  used       INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_login_codes_expires ON login_codes(expires_at);


CREATE TABLE IF NOT EXISTS reminder_log (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id INTEGER NOT NULL,
  days_before     INTEGER NOT NULL,
  sent_for_expiry TEXT    NOT NULL,   
  sent_at         TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(subscription_id, days_before, sent_for_expiry)
);
