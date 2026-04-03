import type { Prize } from '../data/prizes'

interface SendPrizeEmailArgs {
  email: string
  prize: Prize
  code: string
  gdprConsent: boolean
}

export async function sendPrizeEmail({ email, prize, code, gdprConsent }: SendPrizeEmailArgs) {
  const config = useRuntimeConfig()
  if (!config.resendApiKey) {
    console.warn('[Resend] No API key configured — skipping email send')
    return
  }

  const firstName = email.split('@')[0].split(/[._-]/)[0]
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Your Easter Prize 🥚</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Inter,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111118;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:32px 40px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">🥚</div>
          <h1 style="color:#eab308;font-size:24px;font-weight:700;margin:0 0 6px;">Your Easter prize is here!</h1>
          <p style="color:#9ca3af;font-size:14px;margin:0;">Easter 2026 · Hatch a Chance</p>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="padding:36px 40px;">
          <p style="color:#e5e7eb;font-size:16px;margin:0 0 24px;">Hey ${displayName},</p>
          <p style="color:#9ca3af;font-size:15px;margin:0 0 28px;">You cracked your egg and here's what you won:</p>

          <!-- Prize box -->
          <div style="background:linear-gradient(135deg,rgba(234,179,8,0.1),rgba(234,179,8,0.05));border:1px solid rgba(234,179,8,0.3);border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
            <p style="color:#fbbf24;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">${prize.tier_label}</p>
            <h2 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 20px;line-height:1.3;">${prize.display_text}</h2>
            <p style="color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Your code</p>
            <div style="background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:16px 24px;display:inline-block;">
              <span style="font-family:monospace;font-size:26px;font-weight:700;color:#eab308;letter-spacing:4px;">${code}</span>
            </div>
            <p style="color:#6b7280;font-size:12px;margin:12px 0 0;">This code expires in 24 hours — use it today.</p>
          </div>

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:28px;">
            <a href="https://app.tradersyard.com/challenges" style="display:inline-block;background:#eab308;color:#000000;font-weight:700;font-size:16px;text-decoration:none;padding:16px 40px;border-radius:12px;">
              Redeem Now →
            </a>
          </div>

          <!-- Public codes reminder -->
          <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:16px;text-align:center;margin-bottom:24px;">
            <p style="color:#6b7280;font-size:12px;margin:0 0 8px;">Public codes also available while promotion is live:</p>
            <span style="font-family:monospace;background:rgba(234,179,8,0.1);color:#eab308;padding:4px 10px;border-radius:6px;font-size:13px;margin:0 4px;">EASTER20</span>
            <span style="font-family:monospace;background:rgba(234,179,8,0.1);color:#eab308;padding:4px 10px;border-radius:6px;font-size:13px;margin:0 4px;">RESET20</span>
            <p style="color:#6b7280;font-size:11px;margin:8px 0 0;">Your egg prize always beats or matches these.</p>
          </div>

          <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;">
            Good luck out there. The Yard is rooting for you.<br/>
            — The TradersYard Team
          </p>
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background:rgba(0,0,0,0.3);padding:20px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="color:#4b5563;font-size:11px;margin:0 0 6px;">© 2026 TradersYard · <a href="https://tradersyard.com" style="color:#4b5563;text-decoration:underline;">tradersyard.com</a></p>
          <p style="color:#4b5563;font-size:11px;margin:0;">
            You're receiving this because you participated in the Easter 2026 Hatch a Chance promotion.<br/>
            <a href="https://tradersyard.com/unsubscribe?email=${encodeURIComponent(email)}" style="color:#4b5563;text-decoration:underline;">Unsubscribe</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`

  const payload = {
    from: config.resendFromEmail,
    to: email,
    subject: `🥚 Your Easter prize is here, ${displayName}`,
    html,
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.resendApiKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[Resend] Email send failed:', err)
    // Don't throw — email failure shouldn't block the prize reveal
  }

  // Add to Resend audience if GDPR consented
  if (gdprConsent && config.resendAudienceId) {
    await addToAudience(email, config.resendAudienceId, config.resendApiKey)
  }
}

export async function sendReferralCreditEmail(referrerEmail: string) {
  const config = useRuntimeConfig()
  if (!config.resendApiKey) return

  const firstName = referrerEmail.split('@')[0].split(/[._-]/)[0]
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1)

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Inter,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111118;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
      <tr>
        <td style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:32px 40px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">🎉</div>
          <h1 style="color:#eab308;font-size:24px;font-weight:700;margin:0 0 6px;">Your friend cracked their egg!</h1>
          <p style="color:#9ca3af;font-size:14px;margin:0;">You've earned a second crack</p>
        </td>
      </tr>
      <tr>
        <td style="padding:36px 40px;">
          <p style="color:#e5e7eb;font-size:16px;margin:0 0 20px;">Hey ${displayName},</p>
          <p style="color:#9ca3af;font-size:15px;margin:0 0 28px;">
            Someone you referred just cracked their Easter egg — which means you've earned yourself a <strong style="color:#eab308;">second crack</strong>. Head back to the page, enter your email, and crack another egg.
          </p>
          <div style="text-align:center;margin-bottom:28px;">
            <a href="https://tradersyard.com/easter" style="display:inline-block;background:#eab308;color:#000000;font-weight:700;font-size:16px;text-decoration:none;padding:16px 40px;border-radius:12px;">
              Claim My Second Crack →
            </a>
          </div>
          <p style="color:#6b7280;font-size:13px;margin:0;">— The TradersYard Team</p>
        </td>
      </tr>
      <tr>
        <td style="background:rgba(0,0,0,0.3);padding:20px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="color:#4b5563;font-size:11px;margin:0;">© 2026 TradersYard · <a href="https://tradersyard.com" style="color:#4b5563;">tradersyard.com</a></p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.resendApiKey}` },
    body: JSON.stringify({
      from: config.resendFromEmail,
      to: referrerEmail,
      subject: `🎉 Your friend cracked their egg — your second crack is ready`,
      html,
    }),
  }).catch(err => console.error('[Resend] Referral credit email failed:', err))
}

async function addToAudience(email: string, audienceId: string, apiKey: string) {
  try {
    await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    })
  } catch (err) {
    console.error('[Resend] Audience add failed:', err)
  }
}
