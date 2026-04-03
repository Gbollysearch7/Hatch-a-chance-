// Prize pools — Easter 2026 Hatch a Chance
//
// Design principles:
// - Cold users (never bought): excitement-first, dollar-amount framing, entry-level hooks
// - Churned users (bought before, >60 days): win-back with resets + return discounts
// - Active users (recent buyers): upsell ONLY to next tier above their last purchase
// - Big discounts (40%, 50%) restricted to 2-Phase $5K/$10K only — caps margin exposure
// - No free resets — 20% or 30% off resets max
// - Free accounts: max 3 total across all segments
// - 50% Jackpot: restricted to $5K or $10K 2-Phase only
//
// Pricing reference (2-Phase Swing):
//   $5K=$39 | $10K=$79 | $25K=$149 | $50K=$249 | $100K=$499
// Pricing reference (1-Phase Swing):
//   $5K=$55 | $10K=$95 | $25K=$165 | $50K=$345 | $100K=$555
// Reset fees (2-Phase): $5K=$34 | $10K=$70 | $25K=$134 | $50K=$224 | $100K=$449

export type Segment = 'cold' | 'churned' | 'active'
export type DiscountType = 'percent' | 'fixed_cart'

export interface Prize {
  id: string
  name: string
  display_text: string         // shown on page and in email
  tier: 1 | 2 | 3 | 4 | 5 | 6 | 7
  tier_label: 'Common' | 'Common+' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Ultra Rare' | 'Jackpot'
  discount_type: DiscountType
  discount_value: number
  minimum_order?: number
  maximum_order?: number       // restrict to entry-level accounts (e.g. $5K/$10K only)
  weight: number
  inventory: number | null
  segment: Segment | 'all'
  woo_description_suffix: string
  // How long the coupon is valid after being issued. Defaults to 24h if omitted.
  expires_hours?: number
  // For active segment: which last-purchase tier this prize targets
  // undefined = applies to all active users
  targets_last_purchase?: number[]
}

// ---------------------------------------------------------------------------
// COLD POOL — Never purchased. Goal: acquisition.
// Dollar-amount framing beats % for people with no price anchor.
// Total weight = 100
// ---------------------------------------------------------------------------
export const coldPool: Prize[] = [
  {
    id: 'cold-10k-for-55',
    name: 'Get a $10K Challenge for $55',
    display_text: 'Get a $10K 2-Phase challenge for just $55',
    tier: 2,
    tier_label: 'Common+',
    discount_type: 'fixed_cart',
    discount_value: 24,          // $79 - $24 = $55 (~30% off)
    minimum_order: 79,
    weight: 30,
    inventory: 150,
    segment: 'cold',
    woo_description_suffix: '$10K 2-Phase for $55 — cold acquisition',
  },
  {
    id: 'cold-25k-for-104',
    name: 'Get a $25K Challenge for $104',
    display_text: 'Get a $25K 2-Phase challenge for just $104',
    tier: 2,
    tier_label: 'Common+',
    discount_type: 'fixed_cart',
    discount_value: 45,          // $149 - $45 = $104 (~30% off)
    minimum_order: 149,
    weight: 20,
    inventory: 80,
    segment: 'cold',
    woo_description_suffix: '$25K 2-Phase for $104 — cold acquisition',
  },
  {
    id: 'cold-reset-20pct',
    name: '20% Off Any Reset',
    display_text: '20% off any challenge reset',
    tier: 1,
    tier_label: 'Common',
    discount_type: 'percent',
    discount_value: 20,
    weight: 20,
    inventory: 80,
    segment: 'cold',
    expires_hours: 168,
    woo_description_suffix: '20% off reset — cold',
  },
  {
    id: 'cold-reset-30pct',
    name: '30% Off Any Reset',
    display_text: '30% off any challenge reset',
    tier: 2,
    tier_label: 'Common+',
    discount_type: 'percent',
    discount_value: 30,
    weight: 12,
    inventory: 40,
    segment: 'cold',
    expires_hours: 168,
    woo_description_suffix: '30% off reset — cold',
  },
  {
    id: 'cold-40pct-entry',
    name: '40% Off $5K or $10K 2-Phase',
    display_text: '40% off a $5K or $10K 2-Phase challenge',
    tier: 3,
    tier_label: 'Uncommon',
    discount_type: 'percent',
    discount_value: 40,
    minimum_order: 39,
    maximum_order: 79,           // only applies to $5K ($39) or $10K ($79)
    weight: 10,
    inventory: 50,
    segment: 'cold',
    woo_description_suffix: '40% off $5K/$10K 2-Phase — cold',
  },
  {
    id: 'cold-free-5k',
    name: 'Free $5K 2-Phase Account',
    display_text: 'Your first $5K 2-Phase challenge — on us',
    tier: 6,
    tier_label: 'Ultra Rare',
    discount_type: 'fixed_cart',
    discount_value: 39,
    minimum_order: 39,
    maximum_order: 39,
    weight: 3,
    inventory: 3,                // max 3 total — hard cap
    segment: 'cold',
    woo_description_suffix: 'Free $5K 2-Phase — cold ultra rare',
  },
  {
    id: 'cold-jackpot',
    name: '50% Off $5K or $10K 2-Phase — Jackpot',
    display_text: '50% off a $5K or $10K 2-Phase challenge — Jackpot!',
    tier: 7,
    tier_label: 'Jackpot',
    discount_type: 'percent',
    discount_value: 50,
    minimum_order: 39,
    maximum_order: 79,
    weight: 5,
    inventory: 10,
    segment: 'cold',
    woo_description_suffix: '50% off $5K/$10K 2-Phase — JACKPOT cold',
  },
]

// ---------------------------------------------------------------------------
// CHURNED POOL — Bought before, inactive 60+ days. Goal: win-back.
// Total weight = 100
// ---------------------------------------------------------------------------
export const churnedPool: Prize[] = [
  {
    id: 'churned-reset-20pct',
    name: '20% Off Any Reset',
    display_text: '20% off any challenge reset — welcome back',
    tier: 1,
    tier_label: 'Common',
    discount_type: 'percent',
    discount_value: 20,
    weight: 25,
    inventory: 60,
    segment: 'churned',
    expires_hours: 168,
    woo_description_suffix: '20% off reset — churned win-back',
  },
  {
    id: 'churned-25pct',
    name: '25% Off All Accounts',
    display_text: '25% off any challenge account — welcome back',
    tier: 2,
    tier_label: 'Common+',
    discount_type: 'percent',
    discount_value: 25,
    weight: 25,
    inventory: 80,
    segment: 'churned',
    woo_description_suffix: '25% off all accounts — churned win-back',
  },
  {
    id: 'churned-reset-30pct',
    name: '30% Off Any Reset',
    display_text: '30% off any challenge reset',
    tier: 2,
    tier_label: 'Common+',
    discount_type: 'percent',
    discount_value: 30,
    weight: 20,
    inventory: 40,
    segment: 'churned',
    expires_hours: 168,
    woo_description_suffix: '30% off reset — churned win-back',
  },
  {
    id: 'churned-25k-for-104',
    name: 'Step Up to $25K for $104',
    display_text: 'Step up to a $25K 2-Phase challenge for just $104',
    tier: 3,
    tier_label: 'Uncommon',
    discount_type: 'fixed_cart',
    discount_value: 45,
    minimum_order: 149,
    weight: 15,
    inventory: 50,
    segment: 'churned',
    woo_description_suffix: '$25K 2-Phase for $104 — churned upsell',
  },
  {
    id: 'churned-40pct-entry',
    name: '40% Off $5K or $10K 2-Phase',
    display_text: '40% off a $5K or $10K 2-Phase challenge',
    tier: 4,
    tier_label: 'Rare',
    discount_type: 'percent',
    discount_value: 40,
    minimum_order: 39,
    maximum_order: 79,
    weight: 10,
    inventory: 20,
    segment: 'churned',
    woo_description_suffix: '40% off $5K/$10K 2-Phase — churned',
  },
  {
    id: 'churned-jackpot',
    name: '50% Off $5K or $10K 2-Phase — Jackpot',
    display_text: '50% off a $5K or $10K 2-Phase challenge — Jackpot!',
    tier: 7,
    tier_label: 'Jackpot',
    discount_type: 'percent',
    discount_value: 50,
    minimum_order: 39,
    maximum_order: 79,
    weight: 5,
    inventory: 8,
    segment: 'churned',
    woo_description_suffix: '50% off $5K/$10K 2-Phase — JACKPOT churned',
  },
]

// ---------------------------------------------------------------------------
// ACTIVE POOL — Recent buyers. Goal: upsell to next tier above last purchase.
// drawPrize() filters this pool by targets_last_purchase at draw time.
// Total weight = 100 (per sub-pool after filtering)
// ---------------------------------------------------------------------------
export const activePool: Prize[] = [
  // Reset discounts — apply to everyone regardless of last purchase
  {
    id: 'active-reset-20pct',
    name: '20% Off Any Reset',
    display_text: '20% off your next reset — loyalty reward',
    tier: 1,
    tier_label: 'Common',
    discount_type: 'percent',
    discount_value: 20,
    weight: 20,
    inventory: 50,
    segment: 'active',
    expires_hours: 168,
    woo_description_suffix: '20% off reset — active loyalty',
  },
  {
    id: 'active-reset-30pct',
    name: '30% Off Any Reset',
    display_text: '30% off your next reset',
    tier: 2,
    tier_label: 'Common+',
    discount_type: 'percent',
    discount_value: 30,
    weight: 15,
    inventory: 30,
    segment: 'active',
    expires_hours: 168,
    woo_description_suffix: '30% off reset — active loyalty',
  },

  // Upsell: last purchase was $5K → push to $10K
  {
    id: 'active-upsell-5k-to-10k',
    name: 'Step Up to $10K for $55',
    display_text: 'Step up to a $10K 2-Phase challenge for just $55',
    tier: 3,
    tier_label: 'Uncommon',
    discount_type: 'fixed_cart',
    discount_value: 24,
    minimum_order: 79,
    weight: 25,
    inventory: 60,
    segment: 'active',
    targets_last_purchase: [5000],
    woo_description_suffix: '$10K 2-Phase for $55 — upsell from $5K',
  },

  // Upsell: last purchase was $10K → push to $25K
  {
    id: 'active-upsell-10k-to-25k',
    name: 'Step Up to $25K for $104',
    display_text: 'Step up to a $25K 2-Phase challenge for just $104',
    tier: 3,
    tier_label: 'Uncommon',
    discount_type: 'fixed_cart',
    discount_value: 45,
    minimum_order: 149,
    weight: 25,
    inventory: 40,
    segment: 'active',
    targets_last_purchase: [10000],
    woo_description_suffix: '$25K 2-Phase for $104 — upsell from $10K',
  },

  // Upsell: last purchase was $25K → push to $50K
  {
    id: 'active-upsell-25k-to-50k',
    name: 'Step Up to $50K for $174',
    display_text: 'Step up to a $50K 2-Phase challenge for just $174',
    tier: 4,
    tier_label: 'Rare',
    discount_type: 'fixed_cart',
    discount_value: 75,          // $249 - $75 = $174 (~30% off)
    minimum_order: 249,
    weight: 25,
    inventory: 25,
    segment: 'active',
    targets_last_purchase: [25000],
    woo_description_suffix: '$50K 2-Phase for $174 — upsell from $25K',
  },

  // Upsell: last purchase was $50K → push to $100K
  {
    id: 'active-upsell-50k-to-100k',
    name: 'Step Up to $100K for $349',
    display_text: 'Step up to a $100K 2-Phase challenge for just $349',
    tier: 4,
    tier_label: 'Rare',
    discount_type: 'fixed_cart',
    discount_value: 150,         // $499 - $150 = $349 (~30% off)
    minimum_order: 499,
    weight: 25,
    inventory: 15,
    segment: 'active',
    targets_last_purchase: [50000],
    woo_description_suffix: '$100K 2-Phase for $349 — upsell from $50K',
  },

  // Upsell: last purchase was $100K+ → loyalty % off (no higher tier to push to)
  {
    id: 'active-100k-loyalty',
    name: '25% Off Any Account',
    display_text: '25% off any challenge — loyalty reward',
    tier: 2,
    tier_label: 'Common+',
    discount_type: 'percent',
    discount_value: 25,
    weight: 25,
    inventory: 20,
    segment: 'active',
    targets_last_purchase: [100000, 150000, 200000],
    woo_description_suffix: '25% off all accounts — top-tier loyalty',
  },

  // Jackpot — restricted to $5K/$10K 2-Phase regardless of last purchase
  {
    id: 'active-jackpot',
    name: '50% Off $5K or $10K 2-Phase — Jackpot',
    display_text: '50% off a $5K or $10K 2-Phase challenge — Jackpot!',
    tier: 7,
    tier_label: 'Jackpot',
    discount_type: 'percent',
    discount_value: 50,
    minimum_order: 39,
    maximum_order: 79,
    weight: 5,
    inventory: 5,
    segment: 'active',
    woo_description_suffix: '50% off $5K/$10K 2-Phase — JACKPOT active',
  },
]

export const PRIZE_POOLS: Record<Segment, Prize[]> = {
  cold: coldPool,
  churned: churnedPool,
  active: activePool,
}

export const TIER_CONFIG = {
  1: { label: 'Common',     animation: 'none',           color: '#6b7280' },
  2: { label: 'Common+',    animation: 'confetti-small', color: '#3b82f6' },
  3: { label: 'Uncommon',   animation: 'confetti-green', color: '#22c55e' },
  4: { label: 'Rare',       animation: 'confetti-gold',  color: '#f59e0b' },
  5: { label: 'Very Rare',  animation: 'burst-gold',     color: '#f59e0b' },
  6: { label: 'Ultra Rare', animation: 'shake-rain',     color: '#a855f7' },
  7: { label: 'Jackpot',    animation: 'takeover',       color: '#eab308' },
}

// Campaign window — remove end date to run indefinitely, or set a date
export const CAMPAIGN_START = new Date('2026-04-03T00:00:00Z')
export const CAMPAIGN_END: Date | null = null  // null = no end date, runs until manually stopped

export function isCampaignActive(): boolean {
  const now = new Date()
  if (now < CAMPAIGN_START) return false
  if (CAMPAIGN_END && now > CAMPAIGN_END) return false
  return true
}
