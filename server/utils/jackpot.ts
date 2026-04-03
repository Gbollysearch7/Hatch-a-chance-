export async function sendJackpotAlert(email: string, segment: string, prizeId: string) {
  const config = useRuntimeConfig()
  if (!config.jackpotWebhookUrl) return

  const payload = {
    // Discord webhook format
    embeds: [{
      title: '🎉 JACKPOT WIN — Easter 2026 Hatch a Chance',
      color: 0xeab308,
      fields: [
        { name: 'Email', value: maskEmail(email), inline: true },
        { name: 'Segment', value: segment, inline: true },
        { name: 'Prize', value: prizeId, inline: true },
        { name: 'Time', value: new Date().toISOString(), inline: false },
      ],
      footer: { text: 'TradersYard · Easter 2026 Campaign' },
    }],
  }

  try {
    await fetch(config.jackpotWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('[Jackpot webhook] Failed:', err)
  }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  return `${local[0]}***@${domain}`
}
