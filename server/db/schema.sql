-- Easter 2026 Hatch a Chance Campaign Schema
-- Run once against your PostgreSQL / Supabase database

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limit_log (
  id          BIGSERIAL PRIMARY KEY,
  ip_hash     VARCHAR(64) NOT NULL,
  endpoint    VARCHAR(50) NOT NULL DEFAULT '/api/easter/crack',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_ip_created ON rate_limit_log(ip_hash, created_at);

-- Prize inventory table (seed this after creating)
CREATE TABLE IF NOT EXISTS prize_inventory (
  prize_id            VARCHAR(50) PRIMARY KEY,
  prize_name          VARCHAR(255) NOT NULL,
  segment             VARCHAR(20)  NOT NULL,  -- 'cold' | 'churned' | 'active' | 'all'
  total_inventory     INT,                     -- NULL = unlimited
  remaining_inventory INT,                     -- NULL = unlimited
  active              BOOLEAN DEFAULT TRUE,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Crack attempts table
CREATE TABLE IF NOT EXISTS crack_attempts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               VARCHAR(255) NOT NULL,
  email_normalized    VARCHAR(255) NOT NULL,  -- lowercase, trimmed
  fingerprint_hash    VARCHAR(64)  NOT NULL,
  ip_hash             VARCHAR(64)  NOT NULL,  -- SHA-256 + salt, never raw IP
  segment             VARCHAR(20)  NOT NULL,  -- 'cold' | 'churned' | 'active'
  prize_id            VARCHAR(50)  NOT NULL REFERENCES prize_inventory(prize_id),
  prize_tier          SMALLINT     NOT NULL CHECK (prize_tier BETWEEN 1 AND 7),
  prize_name          VARCHAR(255) NOT NULL,
  woo_coupon_code     VARCHAR(50)  NOT NULL,
  woo_coupon_id       BIGINT,
  gdpr_consent        BOOLEAN      NOT NULL DEFAULT FALSE,
  consent_timestamp   TIMESTAMPTZ,
  created_at          TIMESTAMPTZ  DEFAULT NOW(),
  redeemed            BOOLEAN      DEFAULT FALSE,
  redeemed_at         TIMESTAMPTZ,
  abuse_flagged       BOOLEAN      DEFAULT FALSE,
  abuse_reason        VARCHAR(100)
);

-- Unique constraints for duplicate detection
CREATE UNIQUE INDEX IF NOT EXISTS idx_crack_email     ON crack_attempts(email_normalized);
CREATE UNIQUE INDEX IF NOT EXISTS idx_crack_fp        ON crack_attempts(fingerprint_hash) WHERE NOT abuse_flagged;
CREATE INDEX        IF NOT EXISTS idx_crack_ip        ON crack_attempts(ip_hash);
CREATE INDEX        IF NOT EXISTS idx_crack_created   ON crack_attempts(created_at);

-- Seed prize inventory from prizes.ts
-- Run this block after creating tables
INSERT INTO prize_inventory (prize_id, prize_name, segment, total_inventory, remaining_inventory, active) VALUES
  -- Cold pool
  ('cold-30pct',       '30% Off All Accounts',                 'cold',    NULL, NULL, true),
  ('cold-35pct',       '35% Off All Accounts',                 'cold',    NULL, NULL, true),
  ('cold-40pct',       '40% Off All Accounts',                 'cold',    75,   75,   true),
  ('cold-free-5k',     'Free CFD 2-Phase $5K Account',         'cold',    25,   25,   true),
  ('cold-credit-5k-cfd1', '$16 Credit on $5K CFD 1-Phase',    'cold',    40,   40,   true),
  ('cold-free-reset',  'Free Reset',                           'cold',    30,   30,   true),
  ('cold-50pct',       '50% Off Any Account',                  'cold',    15,   15,   true),
  -- Churned pool
  ('churned-free-reset',  'Free Reset',                        'churned', 75,   75,   true),
  ('churned-20pct',       '20% Off All Accounts',              'churned', NULL, NULL, true),
  ('churned-25pct',       '25% Off All Accounts',              'churned', NULL, NULL, true),
  ('churned-credit-25k',  '$22 Credit on $25K CFD 2-Phase',   'churned', 50,   50,   true),
  ('churned-30pct',       '30% Off All Accounts',              'churned', NULL, NULL, true),
  ('churned-credit-50k',  '$37 Credit on $50K CFD 2-Phase',   'churned', 20,   20,   true),
  ('churned-free-5k',     'Free CFD 2-Phase $5K Retry',        'churned', 10,   10,   true),
  -- Active pool
  ('active-20pct',        '20% Off All Accounts',              'active',  NULL, NULL, true),
  ('active-25pct',        '25% Off All Accounts',              'active',  NULL, NULL, true),
  ('active-credit-50k',   '$25 Credit on $50K CFD 2-Phase',   'active',  40,   40,   true),
  ('active-30pct',        '30% Off All Accounts',              'active',  NULL, NULL, true),
  ('active-credit-100k',  '$50 Credit on $100K CFD 2-Phase',  'active',  25,   25,   true),
  ('active-free-reset',   'Free Reset on Current Tier',        'active',  30,   30,   true),
  ('active-50pct',        '50% Off Any Account',               'active',  10,   10,   true)
ON CONFLICT (prize_id) DO NOTHING;

-- ─── Referral system ────────────────────────────────────────────────────────

-- Each crack attempt generates a referral code.
-- When a referred friend cracks their egg, the referrer earns a second crack.
CREATE TABLE IF NOT EXISTS referral_rewards (
  id                BIGSERIAL    PRIMARY KEY,
  referrer_email    VARCHAR(255) NOT NULL,   -- person who shared
  referred_email    VARCHAR(255),            -- friend who cracked (NULL until redeemed)
  referral_code     VARCHAR(16)  NOT NULL UNIQUE,  -- short code in the share URL (?ref=)
  status            VARCHAR(20)  NOT NULL DEFAULT 'pending',
  -- 'pending'  = link shared, friend not yet cracked
  -- 'credited' = friend cracked, second crack available to referrer
  -- 'used'     = referrer has claimed their second crack
  credited_at       TIMESTAMPTZ,
  used_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_code          ON referral_rewards(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_referrer      ON referral_rewards(referrer_email);
CREATE INDEX IF NOT EXISTS idx_referral_referred      ON referral_rewards(referred_email);
