import { isCampaignActive, PRIZE_POOLS } from '../../data/prizes'
import { drawPrize, getSegment } from '../../utils/prize-draw'
import { generateCouponCode, createWooCoupon } from '../../utils/woocommerce'
import { sendPrizeEmail } from '../../utils/email'
import { sendJackpotAlert } from '../../utils/jackpot'
import {
  hashValue,
  checkDuplicate,
  decrementInventory,
  saveCrackAttempt,
  flagAbuseAttempt,
  createReferralCode,
  linkReferral,
  checkReferralCredit,
  consumeReferralCredit,
} from '../../utils/db'
import { sendReferralCreditEmail } from '../../utils/email'

interface CrackBody {
  email: string
  fingerprint: string
  gdpr_consent: boolean
  ref?: string          // referral code from ?ref= param
  is_referral_crack?: boolean  // true when using their earned second crack
}

export default defineEventHandler(async (event) => {
  // Campaign window check
  if (!isCampaignActive()) {
    throw createError({
      statusCode: 410,
      data: { message: 'This promotion has ended. Thanks for playing!' },
    })
  }

  const body = await readBody<CrackBody>(event)

  // Input validation
  if (!body?.email || !body?.fingerprint) {
    throw createError({ statusCode: 400, data: { message: 'Invalid request.' } })
  }

  const emailNormalized = body.email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailNormalized)) {
    throw createError({ statusCode: 400, data: { message: 'Invalid email address.' } })
  }

  // Get client IP (trust x-forwarded-for from Vercel/proxy)
  const ip = (
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0].trim() ||
    getRequestHeader(event, 'x-real-ip') ||
    event.node.req.socket?.remoteAddress ||
    'unknown'
  )

  const ipHash = hashValue(ip)
  const fingerprintHash = hashValue(body.fingerprint)

  // Duplicate detection — check all three signals
  const { isDuplicate, isFingerprintAbuse } = await checkDuplicate(
    emailNormalized,
    fingerprintHash,
    ipHash
  )

  if (isFingerprintAbuse) {
    await flagAbuseAttempt(emailNormalized, fingerprintHash, ipHash, 'fingerprint_mismatch').catch(() => {})
    return { prize: null, error: "You've already cracked your egg! Check your inbox." }
  }

  if (isDuplicate) {
    // Allow if they have a referral credit earned (second crack)
    if (body.is_referral_crack) {
      const hasCredit = await checkReferralCredit(emailNormalized)
      if (!hasCredit) {
        return { prize: null, error: "No second crack available yet. Share your link to earn one!" }
      }
      // Consume the credit atomically before proceeding
      const consumed = await consumeReferralCredit(emailNormalized)
      if (!consumed) {
        return { prize: null, error: "No second crack available yet. Share your link to earn one!" }
      }
    } else {
      return { prize: null, error: "You've already cracked your egg! Check your inbox." }
    }
  }

  // If a referral code was passed, link the referral (credit fires only on redemption)
  if (body.ref && !isDuplicate) {
    await linkReferral(body.ref, emailNormalized).catch(() => {})
  }

  // Determine segment server-side
  const { segment, lastPurchaseValue } = await getSegment(emailNormalized)

  // Draw prize (weighted random, inventory-aware, tier-targeted for active users)
  const prize = await drawPrize(segment, lastPurchaseValue)
  if (!prize) {
    throw createError({
      statusCode: 503,
      data: { message: 'Prize pool is temporarily unavailable. Please try again.' },
    })
  }

  // Atomic inventory decrement — retry with fallback if race condition hits
  let inventoryOk = await decrementInventory(prize.id)
  if (!inventoryOk) {
    // Prize ran out mid-draw — fall back to unlimited tier-1 prize
    const fallback = PRIZE_POOLS[segment].find(p => p.inventory === null)
    if (!fallback) {
      throw createError({ statusCode: 503, data: { message: 'Please try again in a moment.' } })
    }
    // Use fallback (unlimited, always available)
    Object.assign(prize, fallback)
    inventoryOk = await decrementInventory(fallback.id)
  }

  // Generate WooCommerce coupon
  const couponCode = generateCouponCode()
  let couponId: number | undefined

  try {
    const coupon = await createWooCoupon(prize, emailNormalized, segment, couponCode)
    couponId = coupon.id
  } catch (err) {
    console.error('[Crack] WooCommerce coupon creation failed:', err)
    // Don't block the user — coupon will be generated manually if needed
  }

  // Save to DB
  await saveCrackAttempt({
    email: body.email.trim(),
    email_normalized: emailNormalized,
    fingerprint_hash: fingerprintHash,
    ip_hash: ipHash,
    segment,
    prize_id: prize.id,
    prize_tier: prize.tier,
    prize_name: prize.name,
    woo_coupon_code: couponCode,
    woo_coupon_id: couponId ?? null,
    gdpr_consent: body.gdpr_consent === true,
    consent_timestamp: body.gdpr_consent ? new Date().toISOString() : null,
  }).catch(err => {
    console.error('[Crack] DB save failed:', err)
  })

  // Generate referral code for this user (so they can invite friends)
  const referralCode = await createReferralCode(emailNormalized).catch(() => null)

  // Send prize email (non-blocking)
  sendPrizeEmail({
    email: emailNormalized,
    prize,
    code: couponCode,
    gdprConsent: body.gdpr_consent === true,
  }).catch(err => console.error('[Crack] Email send failed:', err))

  // Jackpot alert (tier 7)
  if (prize.tier === 7) {
    sendJackpotAlert(emailNormalized, segment, prize.id)
      .catch(err => console.error('[Crack] Jackpot alert failed:', err))
  }

  // Return ONLY what the client needs — never expose segment, odds, pool details
  return {
    prize: {
      display_text: prize.display_text,
      code: couponCode,
      tier: prize.tier,
      tier_label: prize.tier_label,
    },
    referral_code: referralCode,  // used to build share URL client-side
  }
})

