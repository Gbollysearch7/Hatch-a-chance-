import { hashValue, checkRateLimit, logRateLimitHit } from '../utils/db'

// Rate limiting middleware for all /api/easter/* routes
// Max 5 requests per IP per minute
export default defineEventHandler(async (event) => {
  const url = event.node.req.url ?? ''
  if (!url.startsWith('/api/easter/')) return

  // Skip admin stats (has its own auth check)
  if (url.startsWith('/api/easter/admin/')) return

  const ip = (
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0].trim() ||
    getRequestHeader(event, 'x-real-ip') ||
    event.node.req.socket?.remoteAddress ||
    'unknown'
  )

  const ipHash = hashValue(ip)

  const allowed = await checkRateLimit(ipHash, 5).catch(() => true)  // fail open
  if (!allowed) {
    await logRateLimitHit(ipHash).catch(() => {})
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      data: { message: 'Too many attempts. Please wait a minute and try again.' },
    })
  }

  await logRateLimitHit(ipHash).catch(() => {})
})
