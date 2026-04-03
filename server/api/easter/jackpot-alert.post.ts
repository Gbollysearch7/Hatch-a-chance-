// Internal endpoint — called from crack.post.ts when tier 7 is drawn
// Also callable manually for testing. Auth-protected.

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authHeader = getRequestHeader(event, 'authorization')

  if (!authHeader || authHeader !== `Bearer ${config.adminApiKey}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { email, segment, prize_id } = body ?? {}

  if (!email || !segment) {
    throw createError({ statusCode: 400, data: { message: 'Missing fields.' } })
  }

  const { sendJackpotAlert } = await import('../../utils/jackpot')
  await sendJackpotAlert(email, segment, prize_id ?? 'unknown')

  return { ok: true }
})
