# Hatch a Chance — Deploy Checklist

This document is everything needed to take this from GitHub to production.
All steps are one-command or copy-paste. Nothing requires clicking through UIs.

---

## 1. Environment Variables (Vercel)

Add these in Vercel → Project Settings → Environment Variables.
All are required unless marked optional.

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Supabase → project `hatch-a-chance-2026` → Settings → Database → Connection string |
| `SUPABASE_URL` | `https://iluqrcdruiukqrqxvrqr.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → project `hatch-a-chance-2026` → Settings → API → service_role key |
| `WC_API_URL` | `https://tradersyard.com/wp-json/wc/v3` |
| `WC_CONSUMER_KEY` | WooCommerce → Settings → Advanced → REST API |
| `WC_CONSUMER_SECRET` | WooCommerce → Settings → Advanced → REST API |
| `RESEND_API_KEY` | resend.com → API Keys |
| `RESEND_FROM_EMAIL` | `noreply@tradersyard.de` |
| `RESEND_AUDIENCE_ID` | Resend → Audiences → your audience ID (optional — for mailing list) |
| `IP_HASH_SALT` | Any random 32-char string (generate with: `openssl rand -hex 16`) |
| `ADMIN_API_KEY` | Any random 32-char string — same value goes into WooCommerce webhook secret |
| `JACKPOT_WEBHOOK_URL` | Discord → Server Settings → Integrations → Webhooks (optional) |
| `OMNISEND_API_KEY` | Already set — `695e66333556ddd5107fb242-cCz34G576PkJTlMNWXFGcbNH4v46tqipzdklewJrXSFgbk3hkZ` |

---

## 2. Database

**Automatic.** The server plugin at `server/plugins/migrate.ts` runs on every cold start.
It creates all tables and seeds prize inventory automatically using `IF NOT EXISTS` guards.
No manual SQL needed. Just set `DATABASE_URL` and deploy.

---

## 3. WooCommerce Webhook (Referral Credits)

This webhook fires referral credits when a HATCH- coupon is redeemed at checkout.
Run this curl command once after deploying (replace placeholders):

```bash
curl -s -X POST "https://tradersyard.com/wp-json/wc/v3/webhooks" \
  -u "YOUR_WC_CONSUMER_KEY:YOUR_WC_CONSUMER_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hatch a Chance — Order Completed",
    "topic": "order.completed",
    "delivery_url": "https://YOUR_VERCEL_DOMAIN/api/easter/redeem-webhook",
    "secret": "YOUR_ADMIN_API_KEY",
    "status": "active"
  }'
```

Replace:
- `YOUR_WC_CONSUMER_KEY` / `YOUR_WC_CONSUMER_SECRET` — from WooCommerce REST API settings
- `YOUR_VERCEL_DOMAIN` — your deployed Vercel domain (e.g. `hatch.tradersyard.com`)
- `YOUR_ADMIN_API_KEY` — same value as the `ADMIN_API_KEY` env var

To verify the webhook was created:
```bash
curl -s "https://tradersyard.com/wp-json/wc/v3/webhooks" \
  -u "YOUR_WC_CONSUMER_KEY:YOUR_WC_CONSUMER_SECRET" | python3 -m json.tool
```

---

## 4. Verify Deploy

After deploying, hit these endpoints to confirm everything is live:

```bash
# Page loads
curl -s -o /dev/null -w "%{http_code}" https://YOUR_DOMAIN/easter
# Expected: 200

# API is alive (should return 410 — campaign not started yet, or 400 if no body)
curl -s -X POST https://YOUR_DOMAIN/api/easter/crack \
  -H "Content-Type: application/json" \
  -d '{}' | python3 -m json.tool
# Expected: {"statusCode":400} or {"statusCode":410}

# Referral status endpoint
curl -s -X POST https://YOUR_DOMAIN/api/easter/referral-status \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}' | python3 -m json.tool
# Expected: {"has_credit":false}
```

---

## 5. Campaign Go-Live

The campaign window is controlled in `server/data/prizes.ts`:
```ts
export const CAMPAIGN_START = new Date('2026-04-05T00:00:00-05:00')
export const CAMPAIGN_END   = new Date('2026-04-10T23:59:59-05:00')
```

Update these dates before deploying if the campaign window changes.
No other changes needed — the page handles all states (pre-launch, live, ended) automatically.

---

## 6. Monitoring During Campaign

Watch for jackpot wins — set `JACKPOT_WEBHOOK_URL` to a Discord webhook and you'll get
a real-time ping whenever someone wins the 50% off jackpot prize.

Admin stats endpoint (requires `x-admin-key` header = `ADMIN_API_KEY`):
```bash
curl -s https://YOUR_DOMAIN/api/easter/admin/stats \
  -H "x-admin-key: YOUR_ADMIN_API_KEY" | python3 -m json.tool
```
