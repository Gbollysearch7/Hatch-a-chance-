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
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="format-detection" content="telephone=no,address=no,email=no,date=no">
<title>Your Easter Prize</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{margin:0;padding:0;font-family:'Inter',-apple-system,sans-serif;background:#000;}
.wrap{width:100%;background:#0a0a0a;padding:20px 0;}.ctr{max-width:600px;margin:0 auto;background:#0a0a0a;border:1px solid #D4AF37;border-radius:4px;overflow:hidden;}
@media screen and (max-width:600px){.mob-pad{padding-left:24px!important;padding-right:24px!important;}}
</style></head><body>
<div class="wrap"><div class="ctr">
  <!-- Logo bar -->
  <div style="border-bottom:1px solid rgba(212,175,55,0.3);padding:24px 48px;text-align:center;" class="mob-pad">
    <a href="https://tradersyard.com"><img src="https://iili.io/fyq9H0X.png" alt="TY" width="40" height="40" style="display:inline-block;border:0;"></a>
  </div>
  <!-- Hero -->
  <div class="mob-pad" style="padding:40px 48px 24px;text-align:center;">
    <div style="font-size:11px;font-weight:600;color:#D4AF37;text-transform:uppercase;letter-spacing:3px;margin-bottom:16px;">&#9830; Easter 2026 · Hatch a Chance &#9830;</div>
    <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:44px;font-weight:600;color:#fff;line-height:1.1;letter-spacing:-1px;">Your egg is hatched,<br>${displayName}.</h1>
    <div style="width:60px;height:1px;background:linear-gradient(90deg,transparent,#D4AF37,transparent);margin:20px auto;"></div>
    <p style="font-size:14px;color:#71717a;line-height:1.6;">Here's what you won:</p>
  </div>
  <!-- Prize card -->
  <div class="mob-pad" style="padding:0 48px 24px;">
    <div style="border:1px solid rgba(212,175,55,0.35);border-radius:12px;padding:32px 28px;text-align:center;background:linear-gradient(180deg,rgba(212,175,55,0.08) 0%,transparent 100%);">
      <div style="font-size:10px;font-weight:600;color:#D4AF37;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;">${prize.tier_label}</div>
      <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;font-weight:600;color:#fff;line-height:1.25;margin-bottom:24px;">${prize.display_text}</h2>
      <div style="font-size:11px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;">Your Code</div>
      <div style="display:inline-block;border:1px solid rgba(212,175,55,0.5);border-radius:6px;padding:12px 32px;background:rgba(212,175,55,0.06);">
        <span style="font-family:'Courier New',monospace;font-size:24px;font-weight:700;color:#D4AF37;letter-spacing:4px;">${code}</span>
      </div>
      <p style="font-size:12px;color:#52525b;margin-top:14px;">This code expires in 24 hours — use it today.</p>
    </div>
  </div>
  <!-- CTA -->
  <div class="mob-pad" style="padding:8px 48px 32px;text-align:center;">
    <a href="https://app.tradersyard.com/challenges" style="display:inline-block;background:#D4AF37;color:#0a0a0a;text-decoration:none;padding:16px 44px;border-radius:4px;font-size:15px;font-weight:600;letter-spacing:0.5px;">Redeem Now →</a>
  </div>
  <!-- Sign-off -->
  <div class="mob-pad" style="padding:0 48px 28px;text-align:center;">
    <p style="font-size:13px;color:#71717a;">Good luck out there. The Yard is rooting for you.</p>
    <p style="font-size:13px;color:#71717a;margin-top:6px;">— The TradersYard Team</p>
  </div>
  <!-- Footer -->
  <div style="border-top:1px solid rgba(212,175,55,0.2);padding:24px 40px;text-align:center;">
    <div style="text-align:center;margin-bottom:16px;">
      <a href="https://discord.gg/tradersyard" target="_blank" style="text-decoration:none;display:inline-block;margin:0 6px;"><img src="https://iili.io/fyqBZog.png" width="24" height="24" alt="Discord" style="display:block;"></a>
      <a href="https://www.instagram.com/tradersyard/" target="_blank" style="text-decoration:none;display:inline-block;margin:0 6px;"><img src="https://fwtzypc.stripocdn.email/content/assets/img/social-icons/logo-white/instagram-logo-white.png" width="24" height="24" alt="Instagram" style="display:block;"></a>
      <a href="https://www.youtube.com/@TradersYard" target="_blank" style="text-decoration:none;display:inline-block;margin:0 6px;"><img src="https://fwtzypc.stripocdn.email/content/assets/img/social-icons/logo-white/youtube-logo-white.png" width="24" height="24" alt="YouTube" style="display:block;"></a>
      <a href="https://www.tiktok.com/@tradersyard" target="_blank" style="text-decoration:none;display:inline-block;margin:0 6px;"><img src="https://fwtzypc.stripocdn.email/content/assets/img/social-icons/logo-white/tiktok-logo-white.png" width="24" height="24" alt="TikTok" style="display:block;"></a>
      <a href="https://x.com/TradersYard" target="_blank" style="text-decoration:none;display:inline-block;margin:0 6px;"><img src="https://fwtzypc.stripocdn.email/content/assets/img/social-icons/logo-white/x-logo-white.png" width="24" height="24" alt="X" style="display:block;"></a>
    </div>
    <p style="font-size:9px;color:#52525b;line-height:1.7;margin-top:8px;"><strong>DISCLAIMER:</strong> Trading financial instruments, including simulated trading activities in a demo environment offered by <strong>TradersYard GmbH</strong>, involves a substantial risk of loss and is not suitable for all individuals. The valuation of financial instruments may be highly volatile. Participants may experience gains or losses greater than their initial demo trade order.</p>
    <p style="font-size:9px;color:#52525b;line-height:1.7;margin-top:8px;"><strong>TradersYard GmbH does not provide trading or investment advice.</strong> Any trading or investment decisions you make are solely your responsibility and at your own risk. Past performance is not indicative of future results.</p>
    <p style="font-size:9px;color:#52525b;margin-top:12px;">&copy; 2026 TradersYard GmbH &nbsp;&middot;&nbsp; <a href="https://tradersyard.com" style="color:#52525b;text-decoration:underline;">tradersyard.com</a> &nbsp;&middot;&nbsp; <a href="https://tradersyard.com/unsubscribe?email=${encodeURIComponent(email)}" style="color:#52525b;text-decoration:underline;">Unsubscribe</a></p>
  </div>
</div></div></body></html>`

  const payload = {
    from: config.resendFromEmail,
    to: email,
    subject: `Your Easter prize is here, ${displayName} 🥚`,
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
  }

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
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your Second Crack is Ready</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box;}body{margin:0;padding:0;font-family:'Inter',-apple-system,sans-serif;background:#000;}.wrap{width:100%;background:#0a0a0a;padding:20px 0;}.ctr{max-width:600px;margin:0 auto;background:#0a0a0a;border:1px solid #D4AF37;border-radius:4px;overflow:hidden;}@media screen and (max-width:600px){.mob-pad{padding-left:24px!important;padding-right:24px!important;}}</style></head><body>
<div class="wrap"><div class="ctr">
  <div style="border-bottom:1px solid rgba(212,175,55,0.3);padding:24px 48px;text-align:center;" class="mob-pad">
    <a href="https://tradersyard.com"><img src="https://iili.io/fyq9H0X.png" alt="TY" width="40" height="40" style="display:inline-block;border:0;"></a>
  </div>
  <div class="mob-pad" style="padding:40px 48px 24px;text-align:center;">
    <div style="font-size:11px;font-weight:600;color:#D4AF37;text-transform:uppercase;letter-spacing:3px;margin-bottom:16px;">&#9830; Easter 2026 · Hatch a Chance &#9830;</div>
    <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:40px;font-weight:600;color:#fff;line-height:1.15;letter-spacing:-1px;">Your friend cracked their egg, ${displayName}.</h1>
    <div style="width:60px;height:1px;background:linear-gradient(90deg,transparent,#D4AF37,transparent);margin:20px auto;"></div>
    <p style="font-size:15px;color:#71717a;line-height:1.7;max-width:420px;margin:0 auto;">
      Someone you referred just cracked their Easter egg — which means you've earned a <strong style="color:#D4AF37;">second crack</strong>. Head back to the page, enter your email, and crack another one.
    </p>
  </div>
  <div class="mob-pad" style="padding:8px 48px 36px;text-align:center;">
    <a href="https://tradersyard.com/easter" style="display:inline-block;background:#D4AF37;color:#0a0a0a;text-decoration:none;padding:16px 44px;border-radius:4px;font-size:15px;font-weight:600;letter-spacing:0.5px;">Claim My Second Crack →</a>
  </div>
  <div class="mob-pad" style="padding:0 48px 28px;text-align:center;">
    <p style="font-size:13px;color:#71717a;">— The TradersYard Team</p>
  </div>
  <div style="border-top:1px solid rgba(212,175,55,0.2);padding:24px 40px;text-align:center;">
    <p style="font-size:9px;color:#52525b;">&copy; 2026 TradersYard GmbH &nbsp;&middot;&nbsp; <a href="https://tradersyard.com" style="color:#52525b;text-decoration:underline;">tradersyard.com</a></p>
  </div>
</div></div></body></html>`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.resendApiKey}` },
    body: JSON.stringify({
      from: config.resendFromEmail,
      to: referrerEmail,
      subject: `Your friend cracked their egg — second crack ready, ${displayName}`,
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
