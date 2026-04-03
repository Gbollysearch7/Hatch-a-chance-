// Thin database wrapper using native fetch against Supabase REST API
// OR swap out for a Postgres client (e.g. postgres.js) by changing the
// execute() function. The rest of the codebase uses this interface.

import { createHash } from 'crypto'

const config = useRuntimeConfig()

// ---- Hashing ---------------------------------------------------------------

export function hashValue(value: string): string {
  return createHash('sha256')
    .update(value + (config.ipHashSalt || 'easter2026-salt'))
    .digest('hex')
}

// ---- Simple query executor --------------------------------------------------
// Uses DATABASE_URL (postgres connection string).
// In Nitro/Nuxt 4 you can use the `db0` package or `postgres` npm package.
// This file exports a compatible interface — swap the implementation as needed.

let _pg: any = null

async function getDb() {
  if (_pg) return _pg
  // Dynamically import postgres (must be in dependencies)
  // npm install postgres
  try {
    const { default: postgres } = await import('postgres' as any)
    _pg = postgres(config.databaseUrl, { ssl: 'require', max: 5 })
  } catch {
    throw new Error('Database connection failed. Ensure DATABASE_URL is set and `postgres` package is installed.')
  }
  return _pg
}

export async function dbQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDb()
  // postgres.js uses tagged template literals, but we use parameterized approach
  const result = await db.unsafe(sql, params)
  return result as T[]
}

// ---- Rate limiting ----------------------------------------------------------

export async function checkRateLimit(ipHash: string, maxPerMinute = 5): Promise<boolean> {
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString()
  const rows = await dbQuery<{ count: string }>(
    `SELECT COUNT(*) as count FROM rate_limit_log WHERE ip_hash = $1 AND created_at > $2`,
    [ipHash, oneMinuteAgo]
  )
  return parseInt(rows[0]?.count ?? '0') < maxPerMinute
}

export async function logRateLimitHit(ipHash: string): Promise<void> {
  await dbQuery(
    `INSERT INTO rate_limit_log (ip_hash) VALUES ($1)`,
    [ipHash]
  )
}

// ---- Duplicate detection ----------------------------------------------------

export interface DuplicateCheckResult {
  isDuplicate: boolean
  isFingerprintAbuse: boolean  // fingerprint matches but different email
}

export async function checkDuplicate(
  emailNormalized: string,
  fingerprintHash: string,
  ipHash: string
): Promise<DuplicateCheckResult> {
  // Check email
  const emailMatch = await dbQuery(
    `SELECT id FROM crack_attempts WHERE email_normalized = $1 LIMIT 1`,
    [emailNormalized]
  )
  if (emailMatch.length > 0) {
    return { isDuplicate: true, isFingerprintAbuse: false }
  }

  // Check fingerprint
  const fpMatch = await dbQuery<{ email_normalized: string }>(
    `SELECT email_normalized FROM crack_attempts WHERE fingerprint_hash = $1 AND NOT abuse_flagged LIMIT 1`,
    [fingerprintHash]
  )
  if (fpMatch.length > 0) {
    // Different email, same fingerprint = abuse attempt
    return { isDuplicate: true, isFingerprintAbuse: true }
  }

  // Check IP — allow max 2 per IP per 24h (5-day promo, households covered)
  const oneDayAgo = new Date(Date.now() - 86_400_000).toISOString()
  const ipMatch = await dbQuery<{ count: string }>(
    `SELECT COUNT(*) as count FROM crack_attempts WHERE ip_hash = $1 AND created_at > $2`,
    [ipHash, oneDayAgo]
  )
  if (parseInt(ipMatch[0]?.count ?? '0') >= 2) {
    return { isDuplicate: true, isFingerprintAbuse: false }
  }

  return { isDuplicate: false, isFingerprintAbuse: false }
}

// ---- Prize inventory (atomic) -----------------------------------------------

export async function decrementInventory(prizeId: string): Promise<boolean> {
  // Atomic decrement — returns false if inventory hit 0
  const result = await dbQuery<{ remaining_inventory: number | null }>(
    `UPDATE prize_inventory
     SET remaining_inventory = CASE
       WHEN remaining_inventory IS NULL THEN NULL
       WHEN remaining_inventory > 0 THEN remaining_inventory - 1
       ELSE remaining_inventory
     END,
     updated_at = NOW()
     WHERE prize_id = $1
       AND active = TRUE
       AND (remaining_inventory IS NULL OR remaining_inventory > 0)
     RETURNING remaining_inventory`,
    [prizeId]
  )
  return result.length > 0
}

export async function getActivePrizeIds(segment: string): Promise<Set<string>> {
  const rows = await dbQuery<{ prize_id: string }>(
    `SELECT prize_id FROM prize_inventory WHERE segment = $1 AND active = TRUE AND (remaining_inventory IS NULL OR remaining_inventory > 0)`,
    [segment]
  )
  return new Set(rows.map(r => r.prize_id))
}

// ---- Crack attempt storage --------------------------------------------------

export interface CrackAttemptRecord {
  id?: string
  email: string
  email_normalized: string
  fingerprint_hash: string
  ip_hash: string
  segment: string
  prize_id: string
  prize_tier: number
  prize_name: string
  woo_coupon_code: string
  woo_coupon_id?: number | null
  gdpr_consent: boolean
  consent_timestamp?: string | null
  abuse_flagged?: boolean
  abuse_reason?: string
}

export async function saveCrackAttempt(record: CrackAttemptRecord): Promise<string> {
  const rows = await dbQuery<{ id: string }>(
    `INSERT INTO crack_attempts (
      email, email_normalized, fingerprint_hash, ip_hash, segment,
      prize_id, prize_tier, prize_name, woo_coupon_code, woo_coupon_id,
      gdpr_consent, consent_timestamp, abuse_flagged, abuse_reason
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    RETURNING id`,
    [
      record.email,
      record.email_normalized,
      record.fingerprint_hash,
      record.ip_hash,
      record.segment,
      record.prize_id,
      record.prize_tier,
      record.prize_name,
      record.woo_coupon_code,
      record.woo_coupon_id ?? null,
      record.gdpr_consent,
      record.consent_timestamp ?? (record.gdpr_consent ? new Date().toISOString() : null),
      record.abuse_flagged ?? false,
      record.abuse_reason ?? null,
    ]
  )
  return rows[0].id
}

// ---- Referral system --------------------------------------------------------

export async function createReferralCode(referrerEmail: string): Promise<string> {
  // Generate a short 8-char alphanumeric code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  for (const b of bytes) code += chars[b % chars.length]

  await dbQuery(
    `INSERT INTO referral_rewards (referrer_email, referral_code)
     VALUES ($1, $2)
     ON CONFLICT (referral_code) DO NOTHING`,
    [referrerEmail, code]
  )
  return code
}

export async function linkReferral(referralCode: string, referredEmail: string): Promise<boolean> {
  // Called when a referred friend cracks their egg.
  // Only links the referral — does NOT credit yet. Credit happens on redemption.
  const rows = await dbQuery<{ id: number }>(
    `UPDATE referral_rewards
     SET referred_email = $1
     WHERE referral_code = $2
       AND status = 'pending'
       AND referrer_email != $1
     RETURNING id`,
    [referredEmail, referralCode]
  )
  return rows.length > 0
}

export async function creditReferralOnRedemption(referredEmail: string): Promise<string | null> {
  // Called when the referred person's WooCommerce coupon is actually redeemed.
  // Only then does the referrer earn their second crack.
  // Returns referrer email to notify them, or null if nothing to credit.
  const rows = await dbQuery<{ referrer_email: string }>(
    `UPDATE referral_rewards
     SET status = 'credited', credited_at = NOW()
     WHERE referred_email = $1
       AND status = 'pending'
     RETURNING referrer_email`,
    [referredEmail]
  )
  return rows[0]?.referrer_email ?? null
}

export async function checkReferralCredit(referrerEmail: string): Promise<boolean> {
  // Returns true if this email has a credited (unused) second crack waiting
  const rows = await dbQuery<{ id: number }>(
    `SELECT id FROM referral_rewards
     WHERE referrer_email = $1
       AND status = 'credited'
     LIMIT 1`,
    [referrerEmail]
  )
  return rows.length > 0
}

export async function consumeReferralCredit(referrerEmail: string): Promise<boolean> {
  // Atomically marks one credited reward as used
  const rows = await dbQuery<{ id: number }>(
    `UPDATE referral_rewards
     SET status = 'used', used_at = NOW()
     WHERE id = (
       SELECT id FROM referral_rewards
       WHERE referrer_email = $1 AND status = 'credited'
       ORDER BY credited_at ASC
       LIMIT 1
     )
     RETURNING id`,
    [referrerEmail]
  )
  return rows.length > 0
}

export async function flagAbuseAttempt(
  emailNormalized: string,
  fingerprintHash: string,
  ipHash: string,
  reason: string
): Promise<void> {
  // Log a flagged attempt without saving a full record
  await dbQuery(
    `INSERT INTO crack_attempts (
      email, email_normalized, fingerprint_hash, ip_hash, segment,
      prize_id, prize_tier, prize_name, woo_coupon_code,
      gdpr_consent, abuse_flagged, abuse_reason
    ) VALUES ($1,$2,$3,$4,'unknown','cold-30pct',1,'none','ABUSE-BLOCKED',false,true,$5)`,
    [emailNormalized, emailNormalized, fingerprintHash, ipHash, reason]
  )
}
