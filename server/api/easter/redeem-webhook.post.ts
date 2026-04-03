// WooCommerce order.completed webhook
// Set this up in WooCommerce → Settings → Advanced → Webhooks
// Topic: Order completed  |  URL: https://your-domain.com/api/easter/redeem-webhook
// Secret: same as ADMIN_API_KEY env var

import { createHmac, timingSafeEqual } from 'crypto'
import { creditReferralOnRedemption } from '../../utils/db'
import { sendReferralCreditEmail } from '../../utils/email'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Verify WooCommerce HMAC-SHA256 signature
  const signature = getRequestHeader(event, 'x-wc-webhook-signature')
  const rawBody = await readRawBody(event)
  if (!rawBody) return { ok: false }

  if (config.adminApiKey && config.adminApiKey !== 'change-this-before-deploy') {
    const expected = createHmac('sha256', config.adminApiKey)
      .update(rawBody)
      .digest('base64')
    if (!signature || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      throw createError({ statusCode: 401, message: 'Invalid signature' })
    }
  }

  let order: any
  try {
    order = JSON.parse(rawBody)
  } catch {
    return { ok: false }
  }

  // Extract the coupon codes used in this order
  const couponLines: { code: string }[] = order.coupon_lines ?? []
  const billingEmail: string = order.billing?.email?.trim().toLowerCase() ?? ''

  for (const coupon of couponLines) {
    const code = coupon.code?.toUpperCase() ?? ''
    // Only process HATCH- campaign coupons
    if (!code.startsWith('HATCH-')) continue

    // Credit the referrer (if this person was referred)
    if (billingEmail) {
      const referrerEmail = await creditReferralOnRedemption(billingEmail).catch(() => null)
      if (referrerEmail) {
        sendReferralCreditEmail(referrerEmail).catch(err =>
          console.error('[Webhook] Referral credit email failed:', err)
        )
      }
    }
  }

  return { ok: true }
})
