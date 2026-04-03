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

// Creates a WooCommerce coupon via the existing TradersYard edge function.
// The WooCommerce API keys are stored as secrets inside that edge function —
// they never need to be in this app's environment.
export async function createWooCoupon(
  prize: Prize,
  email: string,
  segment: string,
  code: string
): Promise<{ id: number; code: string }> {
  const config = useRuntimeConfig()

  const supabaseUrl = config.supabaseUrl || 'https://qbbqlnldleqobkymeudk.supabase.co'
  const supabaseKey = config.supabaseServiceRoleKey

  if (!supabaseKey) {
    console.warn('[WooCommerce] No Supabase service role key — returning mock coupon')
    return { id: 0, code }
  }

  const expiryHours = prize.expires_hours ?? 24
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString().slice(0, 19)

  const body: Record<string, any> = {
    action: 'create_coupon',
    code,
    discount_type: prize.discount_type,
    amount: prize.discount_value.toString(),
    usage_limit: 1,
    usage_limit_per_user: 1,
    individual_use: true,
    date_expires: expiresAt,
    description: `Hatch a Chance 2026 — ${prize.woo_description_suffix} — ${email} — ${segment}`,
    free_shipping: false,
  }

  if (prize.minimum_order) {
    body.minimum_amount = prize.minimum_order.toString()
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/woo-coupon-manager`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Coupon creation failed: ${err}`)
  }

  const data = await res.json()
  if (!data.success) {
    throw new Error(`Coupon creation failed: ${JSON.stringify(data)}`)
  }

  return { id: data.coupon.id, code: data.coupon.code.toUpperCase() }
}
