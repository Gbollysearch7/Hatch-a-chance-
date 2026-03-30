# Hatch-a-Chance — Easter Campaign Landing Page

## Brand

- **Company:** TradersYard
- **Website:** tradersyard.com
- **Brand Colors:**
  - Blue: `#4250EB` (primary)
  - White: `#FFFFFF`
  - Black: `#000000`
  - Light Blue (tint): `#EEF0FD` (backgrounds)
- **About:** TradersYard is an Austria-based prop trading firm founded 2024. Offers 2-step challenges, $10K–$100K funded accounts, up to 95% profit splits. Instruments: forex, crypto, indices, metals, oil, stocks.

---

## Campaign Overview

### Easter Promo
- **Dates:** April 1–10
- **Promo Codes:**
  - `EASTER30` — 30% off all accounts
  - `RESET20` — 20% off any reset / retry
- **Tagline:** "Two clean codes. One week. No complexity."

### Sub-Campaign: Hatch-a-Chance
- **Dates:** April 5–10
- **Concept:** Visitors crack a golden egg and instantly receive a surprise Easter offer — potentially better than the standard 30%. Everyone wins something. The standard 30% is the floor, not the ceiling.

---

## Promotion Timeline

| Date | Action |
|------|--------|
| Apr 1 | Teased in launch email — EASTER30 & RESET20 codes go live |
| Apr 5 | Hatch-a-Chance page goes live — announced fully |
| Apr 10 | Campaign ends |

---

## How It Works

1. Trader visits the Hatch-a-Chance page (linked from email, Discord & social)
2. Animated golden egg sits on screen — tap or click to crack it
3. Offer revealed instantly with a code to redeem at checkout
4. **One crack per device** (enforced via localStorage)

---

## Prize Pool — Full Distribution

### Recommended Weighted Pool (balanced to 100%)

| Prize | Display Text | Probability | Cap | Cost Est. |
|-------|-------------|-------------|-----|-----------|
| 30% off all accounts | "You got 30% OFF!" | 35% | Unlimited | Standard margin |
| 35% off all accounts | "Nice! 35% OFF!" | 22% | 50 uses | Slightly below standard |
| 20% off a reset | "20% OFF Reset!" | 15% | Unlimited | Low cost, high volume |
| 40% off all accounts | "40% OFF — Lucky!" | 12% | — | Still profitable |
| 50% off all accounts | "JACKPOT — 50% OFF!" | 8% | — | Margin-tight, drives buzz |
| €10 flat on a $5K challenge | "€10 DEAL — GRAB IT!" | 3% | 20 uses | Fixed loss, drives conversions |
| Free reset / retry | "FREE RESET!" | 3% | 30 uses | $0, reactivates churned traders |
| Free 5K account | "FREE 5K ACCOUNT!" | 1.5% | — | ~$0, huge word-of-mouth |
| Mystery prize (email reveal) | "MYSTERY EGG — Check your email!" | 0.5% | — | Drives email opens |

### Original Prize Pool Reference (from brief)

| Prize | Odds Label | Limit |
|-------|-----------|-------|
| 35% off all accounts | Rare | 50 uses |
| €10 flat on a $5K challenge | Very Rare | 20 uses |
| Free retry on your next challenge | Rare | 30 uses |
| 30% off all accounts | Common | Unlimited |
| 20% off a reset | Common | Unlimited |

---

## Additional Prize Ideas

### High-Engagement / Viral
| Prize | Display Text | Probability | Notes |
|-------|-------------|-------------|-------|
| Free $25K account upgrade | "Your 5K just became a 25K!" | Rare | ~$0 cost (simulated capital), massive word-of-mouth |
| 100% profit split for 1 month | "FULL PROFIT — YOU KEEP IT ALL!" | Very Rare | Cap at 10 uses, emotionally powerful |

### Retention-Focused
| Prize | Display Text | Probability | Notes |
|-------|-------------|-------------|-------|
| Extended challenge deadline (+7 days) | "BONUS WEEK — No rush!" | Moderate | Very low cost, high perceived value |
| Drawdown buffer boost (+2%) | "EXTRA BREATHING ROOM!" | Rare | Operationally simple, traders love flexibility |
| Challenge fee refund on pass | "PASS & PAY NOTHING!" | Very Rare | Conditional win, drives completion motivation |

### Community / Social
| Prize | Display Text | Notes |
|-------|-------------|-------|
| Discord VIP / private signals access | "VIP ACCESS UNLOCKED!" | $0 cost, builds community |
| "Golden Trader" badge | "GOLDEN TRADER STATUS!" | Exclusive leaderboard status, fuels social sharing |

### Scarcity / Gamification
| Prize | Display Text | Notes |
|-------|-------------|-------|
| Mystery prize (email reveal) | "MYSTERY EGG — Check your email!" | Drives email open rates post-crack |
| Double or nothing re-crack | "CRACK AGAIN — DOUBLE OR NOTHING!" | Rare trigger for second egg, pure gamification |

---

## Landing Page Structure

```
[Header: TradersYard logo + "EASTER PROMO · APR 1–10"]
          ↓
[Hero: "Hatch Your Chance" headline + countdown to Apr 10]
          ↓
[THE EGG — large animated golden egg, pulsing/wobbling]
   → User clicks/taps
   → Crack animation plays
   → Prize revealed with confetti burst
   → Discount code displayed (copyable)
   → CTA button → checkout
          ↓
[Quick codes strip: EASTER30 | RESET20 (always visible)]
          ↓
[How It Works — 3 steps]
          ↓
[Footer + T&Cs note]
```

---

## Technical Spec

- **Stack:** Single `index.html` — embedded CSS + vanilla JS, zero dependencies
- **Egg Animation:** CSS keyframe animation — wobble/pulse before crack, split with SVG crack lines on click
- **Prize Logic:** Weighted random selection client-side on click
- **One crack enforcement:** `localStorage` key set on crack — blocked on return visit with message
- **Confetti:** Pure JS canvas-based burst on prize reveal
- **Responsive:** Mobile-first (Discord/email links will drive mobile traffic)
- **Countdown timer:** JS countdown to April 10, 2026

---

## Open Questions

- [ ] Confirm final prize pool probabilities and caps
- [ ] Confirm actual redemption codes for each prize tier (e.g. HATCH35, HATCH50, etc.)
- [ ] Checkout URL for CTA button after prize reveal
- [ ] Any specific font preference (currently planning Inter via Google Fonts)
- [ ] Should the page be standalone or embedded within tradersyard.com?
