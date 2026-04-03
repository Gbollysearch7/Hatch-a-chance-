// Prize pools built from actual TradersYard pricing data
// Source: app/data/gift-a-challenge.ts (originalPrice values)
//
// Key prices used:
//   CFD 2-Phase Swing: $5K=$39, $10K=$79, $25K=$149, $50K=$249, $100K=$499
//   CFD 1-Phase:       $5K=$55, $10K=$95, $25K=$165, $50K=$345, $100K=$555, $200K=$1,045
//   Futures Static:    $10K=$149, $25K=$249, $50K=$399
//   Futures EoD:       $50K=$299, $100K=$424, $150K=$549
//
// Entry-level (smallest/cheapest): CFD 2-Phase $5K @ $39
// Reset fees: CFD 2-Phase $5K=$34, $10K=$70, $25K=$134, $50K=$224, $100K=$449

export type Segment = 'cold' | 'churned' | 'active'
export type DiscountType = 'percent' | 'fixed_cart'

export interface Prize {
  id: string
  name: string
  display_text: string
  tier: 1 | 2 | 3 | 4 | 5 | 6 | 7
  tier_label: 'Common' | 'Common+' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Ultra Rare' | 'Jackpot'
  discount_type: DiscountType
  discount_value: number        // percent (1-100) or flat amount in USD
  minimum_order?: number        // for fixed_cart: min order so coupon only applies to correct tier
  weight: number                // relative weight for random draw (sum = 100 per pool)
  inventory: number | null      // null = unlimited
  segment: Segment | 'all'
  woo_description_suffix: string
}

// ---------------------------------------------------------------------------
// SEGMENT A — Cold / Never Purchased
// Goal: Acquisition. Floor = 30% off. Free $5K account is the hook.
// Total weight = 100
// ---------------------------------------------------------------------------
export const coldPool: Prize[] = [
  {
    id: 'cold-30pct',
    name: '30% Off All Accounts',
    display_text: '30% off any challenge account',
    tier: 1,
    tier_label: 'Common',
    discount_type: 'percent',
    discount_value: 30,
    weight: 35,
    inventory: null,
    segment: 'cold',
    woo_description_suffix: '30% off all accounts',
  },
  {
    id: 'cold-35pct',
    name: '35% Off All Accounts',
    display_text: '35% off any challenge account',
    tier: 2,
    tier_label: 'Common+',
    discount_type: 'percent',
    discount_value: 35,
    weight: 25,
    inventory: null,
    segment: 'cold',
    woo_description_suffix: '35% off all accounts',
  },
  {
    id: 'cold-40pct',
    name: '40% Off All Accounts',
    display_text: '40% off any challenge account',
    tier: 3,
    tier_label: 'Uncommon',
    discount_type: 'percent',
    discount_value: 40,
    weight: 15,
    inventory: 75,
    segment: 'cold',
    woo_description_suffix: '40% off all accounts',
  },
  {
    id: 'cold-free-5k',
    name: 'Free CFD 2-Phase $5K Account',
    display_text: 'Free $5K CFD 2-Phase challenge account ($39 value)',
    tier: 5,
    tier_label: 'Very Rare',
    discount_type: 'fixed_cart',
    discount_value: 39,        // exact price of CFD 2-Phase $5K
    minimum_order: 39,
    weight: 8,
    inventory: 25,
    segment: 'cold',
    woo_description_suffix: 'Free CFD 2-Phase $5K account (acquisition)',
  },
  {
    id: 'cold-credit-5k-cfd1',
    name: '$16 Credit on $5K CFD 1-Phase',
    display_text: '$16 credit on a $5K CFD 1-Phase account (~30% of $55)',
    tier: 3,
    tier_label: 'Uncommon',
    discount_type: 'fixed_cart',
    discount_value: 16,        // ~30% of $55 CFD 1-Phase 5K
    minimum_order: 55,
    weight: 7,
    inventory: 40,
    segment: 'cold',
    woo_description_suffix: '$16 credit on CFD 1-Phase $5K',
  },
  {
    id: 'cold-free-reset',
    name: 'Free Reset',
    display_text: 'Free reset on any challenge account',
    tier: 2,
    tier_label: 'Common+',
    discount_type: 'percent',
    discount_value: 100,       // applied with minimum_order to cover reset cost only — note: coupon scoped by description
    minimum_order: 34,         // CFD 2-Phase $5K reset fee
    weight: 5,
    inventory: 30,
    segment: 'cold',
    woo_description_suffix: 'Free reset — $5K CFD 2-Phase',
  },
  {
    id: 'cold-50pct',
    name: '50% Off Any Account',
    display_text: '50% off any challenge account — the jackpot!',
    tier: 7,
    tier_label: 'Jackpot',
    discount_type: 'percent',
    discount_value: 50,
    weight: 5,
    inventory: 15,
    segment: 'cold',
    woo_description_suffix: '50% off all accounts — JACKPOT',
  },
]

// ---------------------------------------------------------------------------
// SEGMENT B — Churned / Lapsed (bought before, inactive 60+ days)
// Goal: Reactivation. Remove the barrier to return.
// Floor = free reset. Top prize = free retry on entry-level account.
// Total weight = 100
// ---------------------------------------------------------------------------
export const churnedPool: Prize[] = [
  {
    id: 'churned-free-reset',
    name: 'Free Reset',
    display_text: 'Free reset on any challenge account',
    tier: 2,
    tier_label: 'Common+',
    discount_type: 'fixed_cart',
    discount_value: 34,        // CFD 2-Phase $5K reset fee (entry-level reset)
    minimum_order: 34,
    weight: 30,
    inventory: 75,
    segment: 'churned',
    woo_description_suffix: 'Free reset — reactivation',
  },
  {
    id: 'churned-20pct',
    name: '20% Off All Accounts',
    display_text: '20% off any challenge account',
    tier: 1,
    tier_label: 'Common',
    discount_type: 'percent',
    discount_value: 20,
    weight: 20,
    inventory: null,
    segment: 'churned',
    woo_description_suffix: '20% off all accounts',
  },
  {
    id: 'churned-25pct',
    name: '25% Off All Accounts',
    display_text: '25% off any challenge account',
    tier: 2,
    tier_label: 'Common+',
    discount_type: 'percent',
    discount_value: 25,
    weight: 15,
    inventory: null,
    segment: 'churned',
    woo_description_suffix: '25% off all accounts',
  },
  {
    id: 'churned-credit-25k',
    name: '$22 Credit on $25K CFD 2-Phase',
    display_text: '$22 credit toward a $25K CFD 2-Phase account (~15% of $149)',
    tier: 3,
    tier_label: 'Uncommon',
    discount_type: 'fixed_cart',
    discount_value: 22,        // ~15% of $149 (CFD 2-Phase $25K)
    minimum_order: 149,
    weight: 15,
    inventory: 50,
    segment: 'churned',
    woo_description_suffix: '$22 credit on CFD 2-Phase $25K — reactivation',
  },
  {
    id: 'churned-30pct',
    name: '30% Off All Accounts',
    display_text: '30% off any challenge account',
    tier: 3,
    tier_label: 'Uncommon',
    discount_type: 'percent',
    discount_value: 30,
    weight: 10,
    inventory: null,
    segment: 'churned',
    woo_description_suffix: '30% off all accounts',
  },
  {
    id: 'churned-credit-50k',
    name: '$37 Credit on $50K CFD 2-Phase',
    display_text: '$37 credit toward a $50K CFD 2-Phase account (~15% of $249)',
    tier: 4,
    tier_label: 'Rare',
    discount_type: 'fixed_cart',
    discount_value: 37,        // ~15% of $249 (CFD 2-Phase $50K)
    minimum_order: 249,
    weight: 7,
    inventory: 20,
    segment: 'churned',
    woo_description_suffix: '$37 credit on CFD 2-Phase $50K — reactivation',
  },
  {
    id: 'churned-free-5k',
    name: 'Free CFD 2-Phase $5K Retry',
    display_text: 'Free $5K CFD 2-Phase challenge — come back on us ($39 value)',
    tier: 6,
    tier_label: 'Ultra Rare',
    discount_type: 'fixed_cart',
    discount_value: 39,        // full price of CFD 2-Phase $5K
    minimum_order: 39,
    weight: 3,
    inventory: 10,
    segment: 'churned',
    woo_description_suffix: 'Free CFD 2-Phase $5K — reactivation ultra rare',
  },
]

// ---------------------------------------------------------------------------
// SEGMENT C — Active / Recent Buyers
// Goal: Upsell & loyalty. Prizes map to tier ABOVE last purchase.
// Flat credits = ~10-15% of next tier up price.
// No free entry-level accounts.
// Total weight = 100
// ---------------------------------------------------------------------------
export const activePool: Prize[] = [
  {
    id: 'active-20pct',
    name: '20% Off All Accounts',
    display_text: '20% off any challenge account',
    tier: 1,
    tier_label: 'Common',
    discount_type: 'percent',
    discount_value: 20,
    weight: 25,
    inventory: null,
    segment: 'active',
    woo_description_suffix: '20% off all accounts — loyalty',
  },
  {
    id: 'active-25pct',
    name: '25% Off All Accounts',
    display_text: '25% off any challenge account',
    tier: 2,
    tier_label: 'Common+',
    discount_type: 'percent',
    discount_value: 25,
    weight: 20,
    inventory: null,
    segment: 'active',
    woo_description_suffix: '25% off all accounts — loyalty',
  },
  {
    id: 'active-credit-50k',
    name: '$25 Credit on $50K CFD 2-Phase',
    display_text: '$25 credit toward a $50K challenge upgrade (~10% of $249)',
    tier: 3,
    tier_label: 'Uncommon',
    discount_type: 'fixed_cart',
    discount_value: 25,        // ~10% of $249 (CFD 2-Phase $50K — tier above $25K buyer)
    minimum_order: 249,
    weight: 20,
    inventory: 40,
    segment: 'active',
    woo_description_suffix: '$25 credit on CFD 2-Phase $50K — upsell',
  },
  {
    id: 'active-30pct',
    name: '30% Off All Accounts',
    display_text: '30% off any challenge account',
    tier: 3,
    tier_label: 'Uncommon',
    discount_type: 'percent',
    discount_value: 30,
    weight: 15,
    inventory: null,
    segment: 'active',
    woo_description_suffix: '30% off all accounts — loyalty',
  },
  {
    id: 'active-credit-100k',
    name: '$50 Credit on $100K CFD 2-Phase',
    display_text: '$50 credit toward a $100K challenge upgrade (~10% of $499)',
    tier: 4,
    tier_label: 'Rare',
    discount_type: 'fixed_cart',
    discount_value: 50,        // ~10% of $499 (CFD 2-Phase $100K — tier above $50K buyer)
    minimum_order: 499,
    weight: 10,
    inventory: 25,
    segment: 'active',
    woo_description_suffix: '$50 credit on CFD 2-Phase $100K — upsell',
  },
  {
    id: 'active-free-reset',
    name: 'Free Reset on Current Tier',
    display_text: 'Free reset on your current challenge tier',
    tier: 3,
    tier_label: 'Uncommon',
    discount_type: 'fixed_cart',
    discount_value: 70,        // CFD 2-Phase $10K reset fee (mid-tier default)
    minimum_order: 70,
    weight: 7,
    inventory: 30,
    segment: 'active',
    woo_description_suffix: 'Free reset — active buyer loyalty',
  },
  {
    id: 'active-50pct',
    name: '50% Off Any Account',
    display_text: '50% off any challenge account — the jackpot!',
    tier: 7,
    tier_label: 'Jackpot',
    discount_type: 'percent',
    discount_value: 50,
    weight: 3,
    inventory: 10,
    segment: 'active',
    woo_description_suffix: '50% off all accounts — JACKPOT',
  },
]

export const PRIZE_POOLS: Record<Segment, Prize[]> = {
  cold: coldPool,
  churned: churnedPool,
  active: activePool,
}

// Tier animation config — returned with prize reveal
export const TIER_CONFIG = {
  1: { label: 'Common', animation: 'none', color: '#6b7280' },
  2: { label: 'Common+', animation: 'confetti-small', color: '#3b82f6' },
  3: { label: 'Uncommon', animation: 'confetti-green', color: '#22c55e' },
  4: { label: 'Rare', animation: 'confetti-gold', color: '#f59e0b' },
  5: { label: 'Very Rare', animation: 'burst-gold', color: '#f59e0b' },
  6: { label: 'Ultra Rare', animation: 'shake-rain', color: '#a855f7' },
  7: { label: 'Jackpot', animation: 'takeover', color: '#eab308' },
}

// Campaign window
export const CAMPAIGN_START = new Date('2026-04-05T00:00:00-05:00')
export const CAMPAIGN_END = new Date('2026-04-10T23:59:59-05:00')

export function isCampaignActive(): boolean {
  const now = new Date()
  return now >= CAMPAIGN_START && now <= CAMPAIGN_END
}
