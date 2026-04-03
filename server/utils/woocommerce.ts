import type { Prize } from '../data/prizes'

function randomAlphanumeric(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'  // no 0/O/I/1 to avoid confusion
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map(b => chars[b % chars.length])
    .join('')
}

export function generateCouponCode(): string {
  return `HATCH-${randomAlphanumeric(6)}`
}

export interface WooCouponPayload {
  code: string
  discount_type: 'percent' | 'fixed_cart'
  amount: string
  individual_use: boolean
  usage_limit: number
  usage_limit_per_user: number
  date_expires: string
  description: string
  free_shipping: boolean
  minimum_amount?: string
}

export async function createWooCoupon(
  prize: Prize,
  email: string,
  segment: string,
  code: string
): Promise<{ id: number; code: string }> {
  const config = useRuntimeConfig()

  if (!config.wcApiUrl || !config.wcConsumerKey) {
    // Dev/test mode — return mock coupon
    console.warn('[WooCommerce] No credentials configured — returning mock coupon')
    return { id: 0, code }
  }

  const payload: WooCouponPayload = {
    code,
    discount_type: prize.discount_type,
    amount: prize.discount_value.toString(),
    individual_use: true,
    usage_limit: 1,
    usage_limit_per_user: 1,
    date_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19),
    description: `Easter Hatch 2026 — ${prize.woo_description_suffix} — ${email} — ${segment}`,
    free_shipping: false,
  }

  if (prize.minimum_order) {
    payload.minimum_amount = prize.minimum_order.toString()
  }

  const encoded = btoa(`${config.wcConsumerKey}:${config.wcConsumerSecret}`)
  const res = await fetch(`${config.wcApiUrl}/coupons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${encoded}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`WooCommerce coupon creation failed: ${err}`)
  }

  const data = await res.json()
  return { id: data.id, code: data.code }
}
