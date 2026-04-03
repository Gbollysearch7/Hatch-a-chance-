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
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Your Easter Prize — TradersYard</title>
<style>
  body,table,td,p,a,li{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{-ms-interpolation-mode:bicubic;border:0;line-height:100%;outline:none;text-decoration:none;}
  body{margin:0!important;padding:0!important;width:100%!important;}
  a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;}
  u+#body a{color:inherit;text-decoration:none;}
  @media screen and (max-width:620px){
    .email-container{width:100%!important;}
    .mobile-pad{padding-left:24px!important;padding-right:24px!important;}
    .hero-hl{font-size:28px!important;line-height:1.25!important;}
    .prize-num{font-size:52px!important;}
  }
</style>
</head>
<body id="body">

  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;">Your egg is hatched, ${displayName}. Here's what you won.</div>
  <div style="display:none;max-height:0;overflow:hidden;">&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;</div>

  <!-- Wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f0f1ff;">
  <tr><td align="center" style="padding:32px 16px 48px;">

    <!-- Container -->
    <table class="email-container" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;">

      <!-- Hero -->
      <tr>
        <td style="background-color:#4250eb;padding:40px 48px 44px;" class="mobile-pad">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td valign="middle">
                <a href="https://tradersyard.com" target="_blank" style="text-decoration:none;">
                  <img src="https://iili.io/fyq9H0X.png" alt="TradersYard" width="36" height="36" style="display:block;width:36px;height:36px;border:0;filter:brightness(0) invert(1);">
                </a>
              </td>
              <td align="right" valign="middle">
                <span style="font-family:Verdana,Geneva,sans-serif;font-size:10px;font-weight:700;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:3px;">Easter 2026</span>
              </td>
            </tr>
          </table>
          <h1 class="hero-hl" style="margin:36px 0 16px;font-family:Verdana,Geneva,sans-serif;font-size:34px;font-weight:700;color:#ffffff;line-height:1.2;letter-spacing:-0.5px;">Your egg is hatched,<br>${displayName}.</h1>
          <p style="margin:0;font-family:Verdana,Geneva,sans-serif;font-size:15px;color:rgba(255,255,255,0.75);line-height:1.7;">You cracked your egg and won a real prize. Here's what's inside.</p>
        </td>
      </tr>

      <!-- Egg + "Here's what you won" -->
      <tr>
        <td align="center" style="padding:36px 48px 0;" class="mobile-pad">
          <p style="margin:0 0 6px;font-family:Verdana,Geneva,sans-serif;font-size:32px;line-height:1;">&#x1F423;</p>
          <p style="margin:0;font-family:Verdana,Geneva,sans-serif;font-size:11px;font-weight:700;color:#86868b;text-transform:uppercase;letter-spacing:3px;">Here's what you won</p>
        </td>
      </tr>

      <!-- Prize card -->
      <tr>
        <td style="padding:20px 48px 0;" class="mobile-pad">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="background-color:#f0f1ff;border:2px solid #4250eb;border-radius:4px;padding:32px 28px;text-align:center;">
                <p style="margin:0 0 12px;font-family:Verdana,Geneva,sans-serif;font-size:20px;font-weight:700;color:#1d1d1f;line-height:1.3;">${prize.display_text}</p>
                <p style="margin:0 0 16px;font-family:Verdana,Geneva,sans-serif;font-size:11px;font-weight:700;color:#86868b;text-transform:uppercase;letter-spacing:3px;">Your Code</p>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                  <tr>
                    <td style="border:2px solid #4250eb;padding:12px 28px;border-radius:3px;background-color:#ffffff;">
                      <span style="font-family:'Courier New',Courier,monospace;font-size:22px;font-weight:700;color:#4250eb;letter-spacing:4px;">${code}</span>
                    </td>
                  </tr>
                </table>
                <p style="margin:12px 0 0;font-family:Verdana,Geneva,sans-serif;font-size:11px;color:#86868b;">This code expires in 24 hours &mdash; use it today.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td align="center" style="padding:28px 48px 12px;" class="mobile-pad">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" bgcolor="#eab308" style="border-radius:6px;">
                <a href="https://app.tradersyard.com/challenges" target="_blank" style="display:inline-block;padding:16px 48px;font-family:Verdana,Geneva,sans-serif;font-size:16px;font-weight:700;color:#000000;text-decoration:none;border-radius:6px;background-color:#eab308;">Redeem Now &rarr;</a>
              </td>
            </tr>
          </table>
          <p style="margin:10px 0 0;font-family:Verdana,Geneva,sans-serif;font-size:11px;color:#86868b;">Code also sent to <strong style="color:#1d1d1f;">${email}</strong> &#10003;</p>
        </td>
      </tr>

      <!-- Divider -->
      <tr>
        <td style="padding:0 48px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td style="border-top:1px solid #f0f1ff;font-size:0;line-height:0;">&nbsp;</td></tr>
          </table>
        </td>
      </tr>

      <!-- Sign-off -->
      <tr>
        <td style="padding:28px 48px 32px;" class="mobile-pad">
          <p style="margin:0;font-family:Verdana,Geneva,sans-serif;font-size:14px;color:#86868b;line-height:1.7;">Good luck out there,</p>
          <p style="margin:4px 0 0;font-family:Verdana,Geneva,sans-serif;font-size:14px;font-weight:700;color:#1d1d1f;">The TradersYard Team</p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color:#1d1d1f;padding:32px 48px 24px;" class="mobile-pad">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <a href="https://tradersyard.com" target="_blank">
                  <img src="https://iili.io/fyq9H0X.png" alt="TradersYard" width="28" height="28" style="display:block;width:28px;height:28px;border:0;margin:0 auto;filter:brightness(0) invert(1);">
                </a>
              </td>
            </tr>
          </table>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:0 6px;"><a href="https://discord.gg/tradersyard" target="_blank"><img src="https://iili.io/fyqBZog.png" width="22" height="22" alt="Discord" style="display:block;border:0;"></a></td>
                    <td style="padding:0 6px;"><a href="https://www.instagram.com/tradersyard/" target="_blank"><img src="https://fwtzypc.stripocdn.email/content/assets/img/social-icons/logo-white/instagram-logo-white.png" width="22" height="22" alt="Instagram" style="display:block;border:0;"></a></td>
                    <td style="padding:0 6px;"><a href="https://www.youtube.com/@TradersYard" target="_blank"><img src="https://fwtzypc.stripocdn.email/content/assets/img/social-icons/logo-white/youtube-logo-white.png" width="22" height="22" alt="YouTube" style="display:block;border:0;"></a></td>
                    <td style="padding:0 6px;"><a href="https://www.tiktok.com/@tradersyard" target="_blank"><img src="https://fwtzypc.stripocdn.email/content/assets/img/social-icons/logo-white/tiktok-logo-white.png" width="22" height="22" alt="TikTok" style="display:block;border:0;"></a></td>
                    <td style="padding:0 6px;"><a href="https://x.com/TradersYard" target="_blank"><img src="https://fwtzypc.stripocdn.email/content/assets/img/social-icons/logo-white/x-logo-white.png" width="22" height="22" alt="X" style="display:block;border:0;"></a></td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <a href="https://tradersyard.com/profile" target="_blank" style="font-family:Verdana,Geneva,sans-serif;font-size:11px;color:rgba(255,255,255,0.5);text-decoration:none;">Profile</a>
                <span style="font-family:Verdana,Geneva,sans-serif;font-size:11px;color:rgba(255,255,255,0.2);padding:0 10px;">|</span>
                <a href="https://tradersyard.com/support" target="_blank" style="font-family:Verdana,Geneva,sans-serif;font-size:11px;color:rgba(255,255,255,0.5);text-decoration:none;">Contact</a>
                <span style="font-family:Verdana,Geneva,sans-serif;font-size:11px;color:rgba(255,255,255,0.2);padding:0 10px;">|</span>
                <a href="https://tradersyard.com/terms" target="_blank" style="font-family:Verdana,Geneva,sans-serif;font-size:11px;color:rgba(255,255,255,0.5);text-decoration:none;">Terms</a>
                <span style="font-family:Verdana,Geneva,sans-serif;font-size:11px;color:rgba(255,255,255,0.2);padding:0 10px;">|</span>
                <a href="https://tradersyard.com/unsubscribe?email=${encodeURIComponent(email)}" target="_blank" style="font-family:Verdana,Geneva,sans-serif;font-size:11px;color:rgba(255,255,255,0.5);text-decoration:none;">Unsubscribe</a>
              </td>
            </tr>
          </table>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="border-top:1px solid rgba(255,255,255,0.1);padding-top:20px;">
                <p style="margin:0 0 12px;font-family:Verdana,Geneva,sans-serif;font-size:10px;color:rgba(255,255,255,0.3);line-height:1.7;"><strong style="color:rgba(255,255,255,0.45);">DISCLAIMER:</strong> Trading financial instruments, including simulated trading activities in a demo environment offered by <strong style="color:rgba(255,255,255,0.45);">TradersYard GmbH</strong>, involves a substantial risk of loss and is not suitable for all individuals. The valuation of financial instruments may be highly volatile. Participants may experience gains or losses greater than their initial demo trade order.</p>
                <p style="margin:0 0 20px;font-family:Verdana,Geneva,sans-serif;font-size:10px;color:rgba(255,255,255,0.3);line-height:1.7;"><strong style="color:rgba(255,255,255,0.45);">TradersYard GmbH does not provide trading or investment advice.</strong> Any trading or investment decisions you make are solely your responsibility and at your own risk. Past performance is not indicative of future results.</p>
                <p style="margin:0;font-family:Verdana,Geneva,sans-serif;font-size:10px;color:rgba(255,255,255,0.25);text-align:center;">&copy; 2026 TradersYard GmbH</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

    </table>
  </td></tr>
  </table>

</body>
</html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.resendApiKey}`,
    },
    body: JSON.stringify({
      from: config.resendFromEmail,
      to: email,
      subject: `Your Easter prize is here, ${displayName} 🥚`,
      html,
    }),
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
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Your Second Crack is Ready — TradersYard</title>
<style>
  body,table,td,p,a,li{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{-ms-interpolation-mode:bicubic;border:0;line-height:100%;outline:none;text-decoration:none;}
  body{margin:0!important;padding:0!important;width:100%!important;}
  a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;}
  @media screen and (max-width:620px){
    .email-container{width:100%!important;}
    .mobile-pad{padding-left:24px!important;padding-right:24px!important;}
    .hero-hl{font-size:26px!important;line-height:1.25!important;}
  }
</style>
</head>
<body id="body">

  <div style="display:none;max-height:0;overflow:hidden;">Your friend cracked their egg — your second crack is waiting, ${displayName}.</div>
  <div style="display:none;max-height:0;overflow:hidden;">&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;</div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f0f1ff;">
  <tr><td align="center" style="padding:32px 16px 48px;">

    <table class="email-container" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;">

      <!-- Hero -->
      <tr>
        <td style="background-color:#4250eb;padding:40px 48px 44px;" class="mobile-pad">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td valign="middle">
                <a href="https://tradersyard.com" target="_blank" style="text-decoration:none;">
                  <img src="https://iili.io/fyq9H0X.png" alt="TradersYard" width="36" height="36" style="display:block;width:36px;height:36px;border:0;filter:brightness(0) invert(1);">
                </a>
              </td>
              <td align="right" valign="middle">
                <span style="font-family:Verdana,Geneva,sans-serif;font-size:10px;font-weight:700;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:3px;">Easter 2026</span>
              </td>
            </tr>
          </table>
          <h1 class="hero-hl" style="margin:36px 0 16px;font-family:Verdana,Geneva,sans-serif;font-size:34px;font-weight:700;color:#ffffff;line-height:1.2;letter-spacing:-0.5px;">Your friend cracked their egg,<br>${displayName}.</h1>
          <p style="margin:0;font-family:Verdana,Geneva,sans-serif;font-size:15px;color:rgba(255,255,255,0.75);line-height:1.7;">That means you've earned a second crack — a completely fresh prize draw.</p>
        </td>
      </tr>

      <!-- Egg -->
      <tr>
        <td align="center" style="padding:36px 48px 0;" class="mobile-pad">
          <p style="margin:0 0 6px;font-family:Verdana,Geneva,sans-serif;font-size:32px;line-height:1;">&#x1F423;</p>
        </td>
      </tr>

      <!-- Body copy -->
      <tr>
        <td style="padding:20px 48px 0;" class="mobile-pad">
          <p style="margin:0;font-family:Verdana,Geneva,sans-serif;font-size:15px;color:#1d1d1f;line-height:1.7;">Someone you referred just cracked their Easter egg. Head back to the page, enter your email, and crack another one &mdash; your second draw is waiting.</p>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td align="center" style="padding:28px 48px 12px;" class="mobile-pad">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" bgcolor="#eab308" style="border-radius:6px;">
                <a href="https://tradersyard.com/easter" target="_blank" style="display:inline-block;padding:16px 48px;font-family:Verdana,Geneva,sans-serif;font-size:16px;font-weight:700;color:#000000;text-decoration:none;border-radius:6px;background-color:#eab308;">Claim My Second Crack &rarr;</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Divider -->
      <tr>
        <td style="padding:0 48px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td style="border-top:1px solid #f0f1ff;font-size:0;line-height:0;">&nbsp;</td></tr>
          </table>
        </td>
      </tr>

      <!-- Sign-off -->
      <tr>
        <td style="padding:28px 48px 32px;" class="mobile-pad">
          <p style="margin:0;font-family:Verdana,Geneva,sans-serif;font-size:14px;color:#86868b;line-height:1.7;">See you in the Yard,</p>
          <p style="margin:4px 0 0;font-family:Verdana,Geneva,sans-serif;font-size:14px;font-weight:700;color:#1d1d1f;">The TradersYard Team</p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color:#1d1d1f;padding:32px 48px 24px;" class="mobile-pad">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <a href="https://tradersyard.com" target="_blank">
                  <img src="https://iili.io/fyq9H0X.png" alt="TradersYard" width="28" height="28" style="display:block;width:28px;height:28px;border:0;margin:0 auto;filter:brightness(0) invert(1);">
                </a>
              </td>
            </tr>
          </table>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:0 6px;"><a href="https://discord.gg/tradersyard" target="_blank"><img src="https://iili.io/fyqBZog.png" width="22" height="22" alt="Discord" style="display:block;border:0;"></a></td>
                    <td style="padding:0 6px;"><a href="https://www.instagram.com/tradersyard/" target="_blank"><img src="https://fwtzypc.stripocdn.email/content/assets/img/social-icons/logo-white/instagram-logo-white.png" width="22" height="22" alt="Instagram" style="display:block;border:0;"></a></td>
                    <td style="padding:0 6px;"><a href="https://www.youtube.com/@TradersYard" target="_blank"><img src="https://fwtzypc.stripocdn.email/content/assets/img/social-icons/logo-white/youtube-logo-white.png" width="22" height="22" alt="YouTube" style="display:block;border:0;"></a></td>
                    <td style="padding:0 6px;"><a href="https://www.tiktok.com/@tradersyard" target="_blank"><img src="https://fwtzypc.stripocdn.email/content/assets/img/social-icons/logo-white/tiktok-logo-white.png" width="22" height="22" alt="TikTok" style="display:block;border:0;"></a></td>
                    <td style="padding:0 6px;"><a href="https://x.com/TradersYard" target="_blank"><img src="https://fwtzypc.stripocdn.email/content/assets/img/social-icons/logo-white/x-logo-white.png" width="22" height="22" alt="X" style="display:block;border:0;"></a></td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="border-top:1px solid rgba(255,255,255,0.1);padding-top:20px;">
                <p style="margin:0 0 20px;font-family:Verdana,Geneva,sans-serif;font-size:10px;color:rgba(255,255,255,0.3);line-height:1.7;"><strong style="color:rgba(255,255,255,0.45);">TradersYard GmbH does not provide trading or investment advice.</strong> Any trading or investment decisions you make are solely your responsibility and at your own risk. Past performance is not indicative of future results.</p>
                <p style="margin:0;font-family:Verdana,Geneva,sans-serif;font-size:10px;color:rgba(255,255,255,0.25);text-align:center;">&copy; 2026 TradersYard GmbH</p>
              </td>
            </tr>
          </table>
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
