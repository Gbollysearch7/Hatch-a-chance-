// Auto-migration plugin — runs on every cold start
// Safe to run multiple times (all statements use IF NOT EXISTS / ON CONFLICT DO NOTHING)
// This means Vercel/the company never needs to touch Supabase manually.

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()

  if (!config.databaseUrl) {
    console.warn('[migrate] DATABASE_URL not set — skipping auto-migration')
    return
  }

  try {
    const { default: postgres } = await import('postgres' as any)
    const db = postgres(config.databaseUrl, { ssl: 'require', max: 1 })

    await db.unsafe(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`)

    await db.unsafe(`
      CREATE TABLE IF NOT EXISTS rate_limit_log (
        id          BIGSERIAL PRIMARY KEY,
        ip_hash     VARCHAR(64) NOT NULL,
        endpoint    VARCHAR(50) NOT NULL DEFAULT '/api/easter/crack',
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `)
    await db.unsafe(`CREATE INDEX IF NOT EXISTS idx_rate_limit_ip_created ON rate_limit_log(ip_hash, created_at)`)

    await db.unsafe(`
      CREATE TABLE IF NOT EXISTS prize_inventory (
        prize_id            VARCHAR(50) PRIMARY KEY,
        prize_name          VARCHAR(255) NOT NULL,
        segment             VARCHAR(20)  NOT NULL,
        total_inventory     INT,
        remaining_inventory INT,
        active              BOOLEAN DEFAULT TRUE,
        updated_at          TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await db.unsafe(`
      CREATE TABLE IF NOT EXISTS crack_attempts (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email               VARCHAR(255) NOT NULL,
        email_normalized    VARCHAR(255) NOT NULL,
        fingerprint_hash    VARCHAR(64)  NOT NULL,
        ip_hash             VARCHAR(64)  NOT NULL,
        segment             VARCHAR(20)  NOT NULL,
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
      )
    `)
    await db.unsafe(`CREATE UNIQUE INDEX IF NOT EXISTS idx_crack_email   ON crack_attempts(email_normalized)`)
    await db.unsafe(`CREATE UNIQUE INDEX IF NOT EXISTS idx_crack_fp      ON crack_attempts(fingerprint_hash) WHERE NOT abuse_flagged`)
    await db.unsafe(`CREATE INDEX        IF NOT EXISTS idx_crack_ip      ON crack_attempts(ip_hash)`)
    await db.unsafe(`CREATE INDEX        IF NOT EXISTS idx_crack_created ON crack_attempts(created_at)`)

    await db.unsafe(`
      CREATE TABLE IF NOT EXISTS referral_rewards (
        id                BIGSERIAL    PRIMARY KEY,
        referrer_email    VARCHAR(255) NOT NULL,
        referred_email    VARCHAR(255),
        referral_code     VARCHAR(16)  NOT NULL UNIQUE,
        status            VARCHAR(20)  NOT NULL DEFAULT 'pending',
        credited_at       TIMESTAMPTZ,
        used_at           TIMESTAMPTZ,
        created_at        TIMESTAMPTZ  DEFAULT NOW()
      )
    `)
    await db.unsafe(`CREATE INDEX IF NOT EXISTS idx_referral_code     ON referral_rewards(referral_code)`)
    await db.unsafe(`CREATE INDEX IF NOT EXISTS idx_referral_referrer ON referral_rewards(referrer_email)`)
    await db.unsafe(`CREATE INDEX IF NOT EXISTS idx_referral_referred ON referral_rewards(referred_email)`)

    // Seed prize inventory (safe — ON CONFLICT DO NOTHING)
    await db.unsafe(`
      INSERT INTO prize_inventory (prize_id, prize_name, segment, total_inventory, remaining_inventory, active) VALUES
        -- Cold pool (7 prizes)
        ('cold-10k-for-55',          'Get a $10K Challenge for $55',              'cold',    150, 150, true),
        ('cold-25k-for-104',         'Get a $25K Challenge for $104',             'cold',    80,  80,  true),
        ('cold-reset-20pct',         '20% Off Any Reset',                         'cold',    80,  80,  true),
        ('cold-reset-30pct',         '30% Off Any Reset',                         'cold',    40,  40,  true),
        ('cold-40pct-entry',         '40% Off $5K or $10K 2-Phase',               'cold',    50,  50,  true),
        ('cold-free-5k',             'Free $5K 2-Phase Account',                  'cold',    3,   3,   true),
        ('cold-jackpot',             '50% Off $5K or $10K 2-Phase — Jackpot',     'cold',    10,  10,  true),
        -- Churned pool (6 prizes)
        ('churned-reset-20pct',      '20% Off Any Reset',                         'churned', 60,  60,  true),
        ('churned-25pct',            '25% Off All Accounts',                      'churned', 80,  80,  true),
        ('churned-reset-30pct',      '30% Off Any Reset',                         'churned', 40,  40,  true),
        ('churned-25k-for-104',      'Step Up to $25K for $104',                  'churned', 50,  50,  true),
        ('churned-40pct-entry',      '40% Off $5K or $10K 2-Phase',               'churned', 20,  20,  true),
        ('churned-jackpot',          '50% Off $5K or $10K 2-Phase — Jackpot',     'churned', 8,   8,   true),
        -- Active pool (8 prizes)
        ('active-reset-20pct',       '20% Off Any Reset',                         'active',  50,  50,  true),
        ('active-reset-30pct',       '30% Off Any Reset',                         'active',  30,  30,  true),
        ('active-upsell-5k-to-10k',  'Step Up to $10K for $55',                   'active',  60,  60,  true),
        ('active-upsell-10k-to-25k', 'Step Up to $25K for $104',                  'active',  40,  40,  true),
        ('active-upsell-25k-to-50k', 'Step Up to $50K for $174',                  'active',  25,  25,  true),
        ('active-upsell-50k-to-100k','Step Up to $100K for $349',                 'active',  15,  15,  true),
        ('active-100k-loyalty',      '25% Off Any Account',                       'active',  20,  20,  true),
        ('active-jackpot',           '50% Off $5K or $10K 2-Phase — Jackpot',     'active',  5,   5,   true)
      ON CONFLICT (prize_id) DO NOTHING
    `)

    await db.end()
    console.log('[migrate] Hatch-a-Chance schema ready')
  } catch (err) {
    console.error('[migrate] Migration failed — check DATABASE_URL:', err)
    // Don't crash the server — log and continue
  }
})
