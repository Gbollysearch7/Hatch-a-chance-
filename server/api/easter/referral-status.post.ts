import { checkReferralCredit } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string }>(event)
  if (!body?.email) return { has_credit: false }

  const emailNormalized = body.email.trim().toLowerCase()
  const hasCredit = await checkReferralCredit(emailNormalized).catch(() => false)
  return { has_credit: hasCredit }
})
