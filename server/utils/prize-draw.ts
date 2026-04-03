import { PRIZE_POOLS, type Segment, type Prize } from '../data/prizes'
import { getActivePrizeIds } from './db'

// Weighted random draw — server-side only, never exposed to client
// For active segment: filters by targets_last_purchase if lastPurchaseValue is provided
export async function drawPrize(segment: Segment, lastPurchaseValue?: number): Promise<Prize | null> {
  const pool = PRIZE_POOLS[segment]
  if (!pool || pool.length === 0) return null

  // Get currently active prize IDs (inventory not exhausted)
  const activeIds = await getActivePrizeIds(segment)

  // Filter pool to only active prizes
  let available = pool.filter(p => activeIds.has(p.id))

  // For active segment: filter by targets_last_purchase
  // A prize is eligible if:
  //   - targets_last_purchase is undefined (applies to everyone in this segment)
  //   - OR targets_last_purchase includes the user's lastPurchaseValue
  if (segment === 'active' && lastPurchaseValue !== undefined) {
    available = available.filter(p =>
      p.targets_last_purchase === undefined ||
      p.targets_last_purchase.includes(lastPurchaseValue)
    )
  } else if (segment === 'active') {
    // No lastPurchaseValue known — only include prizes without targeting
    available = available.filter(p => p.targets_last_purchase === undefined)
  }

  if (available.length === 0) return null

  // Recalculate weights proportionally for remaining active prizes
  const totalWeight = available.reduce((sum, p) => sum + p.weight, 0)
  if (totalWeight === 0) return null

  const rand = Math.random() * totalWeight
  let cumulative = 0

  for (const prize of available) {
    cumulative += prize.weight
    if (rand <= cumulative) return prize
  }

  // Fallback: return last item
  return available[available.length - 1]
}

// Determine segment from WooCommerce order history via Supabase edge function
// Returns segment + last purchased challenge size for active segment upsell
export async function getSegment(email: string): Promise<{
  segment: Segment
  lastPurchaseValue?: number
}> {
  const config = useRuntimeConfig()

  const supabaseUrl = config.supabaseUrl || 'https://qbbqlnldleqobkymeudk.supabase.co'
  const supabaseKey = config.supabaseServiceRoleKey as string | undefined

  if (!supabaseKey) {
    // No Supabase key — default to cold (dev mode)
    return { segment: 'cold' }
  }

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/get-woocommerce-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ action: 'get_customer_orders', email }),
    })

    if (!res.ok) return { segment: 'cold' }

    const data = await res.json()
    const orders: any[] = data.orders ?? []

    if (!orders || orders.length === 0) return { segment: 'cold' }

    const lastOrder = orders[0]
    const lastOrderDate = new Date(lastOrder.date_created)
    const daysSince = (Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSince > 60) return { segment: 'churned' }

    // Active: try to extract last challenge account size from order line items
    const CHALLENGE_VALUES = [5000, 10000, 25000, 50000, 100000, 150000, 200000]
    let lastPurchaseValue: number | undefined

    for (const item of lastOrder.line_items ?? []) {
      const meta = item.meta_data ?? []
      for (const m of meta) {
        if (m.key === 'challenge_size' || m.key === 'account_size') {
          const parsed = parseInt(m.value?.replace(/\D/g, '') ?? '')
          if (CHALLENGE_VALUES.includes(parsed)) {
            lastPurchaseValue = parsed
            break
          }
        }
      }
      if (lastPurchaseValue) break
    }

    return { segment: 'active', lastPurchaseValue }

  } catch {
    return { segment: 'cold' }
  }
}
