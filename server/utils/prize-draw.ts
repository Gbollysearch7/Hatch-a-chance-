import { PRIZE_POOLS, type Segment, type Prize } from '../data/prizes'
import { getActivePrizeIds } from './db'

// Weighted random draw — server-side only, never exposed to client
export async function drawPrize(segment: Segment): Promise<Prize | null> {
  const pool = PRIZE_POOLS[segment]
  if (!pool || pool.length === 0) return null

  // Get currently active prize IDs (inventory not exhausted)
  const activeIds = await getActivePrizeIds(segment)

  // Filter pool to only active prizes
  const available = pool.filter(p => activeIds.has(p.id))
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

// Determine segment from WooCommerce order history
// Returns segment + last purchased challenge size for active segment upsell
export async function getSegment(email: string): Promise<{
  segment: Segment
  lastPurchaseValue?: number
}> {
  const config = useRuntimeConfig()

  if (!config.wcApiUrl || !config.wcConsumerKey) {
    // No WooCommerce configured — default to cold
    return { segment: 'cold' }
  }

  try {
    const encoded = btoa(`${config.wcConsumerKey}:${config.wcConsumerSecret}`)
    const url = `${config.wcApiUrl}/orders?email=${encodeURIComponent(email)}&per_page=10&orderby=date&order=desc&status=completed`

    const res = await fetch(url, {
      headers: { Authorization: `Basic ${encoded}` },
    })

    if (!res.ok) return { segment: 'cold' }

    const orders: any[] = await res.json()
    if (!orders || orders.length === 0) return { segment: 'cold' }

    const lastOrder = orders[0]
    const lastOrderDate = new Date(lastOrder.date_created)
    const daysSince = (Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSince > 60) return { segment: 'churned' }

    // Active: try to extract last challenge account size from order
    // Look for a line item with meta matching a challenge value
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
