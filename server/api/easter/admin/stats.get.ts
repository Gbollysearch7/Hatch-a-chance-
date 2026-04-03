import { dbQuery } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Auth check
  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader || authHeader !== `Bearer ${config.adminApiKey}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const [
    totalCracks,
    cracksBySegment,
    prizesByTier,
    redemptionRate,
    inventoryStatus,
    jackpots,
    abuseFlagged,
  ] = await Promise.all([
    // Total cracks
    dbQuery<{ count: string }>(
      `SELECT COUNT(*) as count FROM crack_attempts WHERE NOT abuse_flagged`
    ),

    // Cracks by segment
    dbQuery<{ segment: string; count: string }>(
      `SELECT segment, COUNT(*) as count FROM crack_attempts WHERE NOT abuse_flagged GROUP BY segment ORDER BY count DESC`
    ),

    // Prizes by tier
    dbQuery<{ prize_tier: number; count: string }>(
      `SELECT prize_tier, COUNT(*) as count FROM crack_attempts WHERE NOT abuse_flagged GROUP BY prize_tier ORDER BY prize_tier`
    ),

    // Redemption rate (redeemed / total)
    dbQuery<{ total: string; redeemed: string }>(
      `SELECT COUNT(*) as total, SUM(CASE WHEN redeemed THEN 1 ELSE 0 END) as redeemed FROM crack_attempts WHERE NOT abuse_flagged`
    ),

    // Remaining inventory per limited prize
    dbQuery<{ prize_id: string; prize_name: string; segment: string; total_inventory: number | null; remaining_inventory: number | null; active: boolean }>(
      `SELECT prize_id, prize_name, segment, total_inventory, remaining_inventory, active FROM prize_inventory WHERE total_inventory IS NOT NULL ORDER BY segment, prize_id`
    ),

    // Jackpot wins
    dbQuery<{ count: string }>(
      `SELECT COUNT(*) as count FROM crack_attempts WHERE prize_tier = 7 AND NOT abuse_flagged`
    ),

    // Abuse attempts
    dbQuery<{ count: string }>(
      `SELECT COUNT(*) as count FROM crack_attempts WHERE abuse_flagged`
    ),
  ])

  const total = parseInt(totalCracks[0]?.count ?? '0')
  const redeemedCount = parseInt(redemptionRate[0]?.redeemed ?? '0')
  const totalCount = parseInt(redemptionRate[0]?.total ?? '1')

  return {
    summary: {
      total_cracks: total,
      jackpot_wins: parseInt(jackpots[0]?.count ?? '0'),
      abuse_attempts_blocked: parseInt(abuseFlagged[0]?.count ?? '0'),
      redemption_rate: totalCount > 0 ? `${((redeemedCount / totalCount) * 100).toFixed(1)}%` : '0%',
    },
    by_segment: cracksBySegment.reduce((acc, r) => {
      acc[r.segment] = parseInt(r.count)
      return acc
    }, {} as Record<string, number>),
    by_tier: prizesByTier.reduce((acc, r) => {
      acc[`tier_${r.prize_tier}`] = parseInt(r.count)
      return acc
    }, {} as Record<string, number>),
    inventory: inventoryStatus.map(r => ({
      prize_id: r.prize_id,
      prize_name: r.prize_name,
      segment: r.segment,
      total: r.total_inventory,
      remaining: r.remaining_inventory,
      claimed: r.total_inventory != null ? r.total_inventory - (r.remaining_inventory ?? 0) : 0,
      active: r.active,
    })),
    generated_at: new Date().toISOString(),
  }
})
