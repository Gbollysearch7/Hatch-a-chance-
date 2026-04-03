<template>
  <div class="min-h-screen bg-white dark:bg-dark transition-colors duration-200 relative">
    <div class="relative z-10">
      <!-- Scrolling banner -->
      <div class="banner-container overflow-hidden bg-gradient-to-r from-campaign to-campaign-dark py-3">
        <div class="banner-scroll flex gap-6 md:gap-12 whitespace-nowrap">
          <div v-for="i in 10" :key="i" class="banner-item flex items-center w-fit">
            <div class="font-clash flex items-center gap-6 md:gap-12 py-1">
              <div class="tracking-wide uppercase text-black font-semibold text-xs flex items-center gap-2">
                ✦ CRACK YOUR EGG — EVERYONE WINS SOMETHING — LIMITED EGGS REMAINING
              </div>
              <span class="text-black/40">✦</span>
              <div class="tracking-wide uppercase text-black font-semibold text-xs flex items-center gap-2">
                YOUR EGG ALWAYS BEATS PUBLIC CODES — COULD END AT ANY TIME
              </div>
              <span class="text-black/40">✦</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sticky Nav -->
      <div class="sticky top-0 z-50 bg-white/80 dark:bg-dark/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-800/50">
        <Container as="header" class="py-3">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center gap-4">
              <Logo />
              <div class="hidden sm:block h-6 w-px bg-neutral-200 dark:bg-neutral-700" />
              <span class="hidden sm:block text-sm font-clash font-medium text-campaign">Hatch a Chance</span>
            </div>
            <div class="flex items-center gap-3">
              <ThemeToggle />
              <a
                href="#crack"
                class="bg-campaign hover:bg-campaign-dark text-black font-clash font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
              >
                Crack My Egg 🥚
              </a>
            </div>
          </div>
        </Container>
      </div>

      <main>
        <slot />
      </main>

      <!-- Footer -->
      <footer class="bg-[#0B0B0B] border-t border-white/5 pt-12 pb-8">
        <Container>
          <div class="space-y-8">
            <!-- Top row: logo + nav links -->
            <div class="flex flex-col sm:flex-row justify-between items-center gap-6">
              <div class="flex items-center gap-3">
                <Logo />
                <span class="text-sm text-neutral-500">&copy; {{ new Date().getFullYear() }} TradersYard GmbH</span>
              </div>
              <div class="flex items-center gap-6 text-sm text-neutral-500">
                <a href="https://tradersyard.com/legal/terms" class="hover:text-neutral-300 transition-colors">Terms</a>
                <a href="https://tradersyard.com/legal/privacy" class="hover:text-neutral-300 transition-colors">Privacy</a>
                <a href="https://tradersyard.com/legal/refund" class="hover:text-neutral-300 transition-colors">Refund Policy</a>
              </div>
            </div>

            <div class="border-t border-white/5" />

            <!-- Disclaimers -->
            <div class="space-y-6 text-[11px] leading-relaxed text-neutral-500">

              <!-- Demo account notice -->
              <p class="text-center text-xs text-neutral-400 font-medium">
                All accounts provided to clients are demo accounts with virtual funds. All trading takes place in a simulated environment.
              </p>

              <!-- Campaign disclaimer -->
              <div>
                <h4 class="font-semibold text-neutral-400 uppercase tracking-wider text-[10px] mb-1">Campaign Disclaimer</h4>
                <p>This promotion ("Hatch a Chance") is available for a limited time only and may be withdrawn at any time without prior notice. One prize per person, per email address. Prizes are non-transferable and have no cash value. All coupon codes are single-use. TradersYard reserves the right to void any prize obtained through abuse, automation, or duplicate submissions, and to end the promotion at its sole discretion. Prize selection is server-side randomised and personalised based on account history. By participating, you agree to receive marketing communications from TradersYard.</p>
              </div>

              <!-- General Disclosure -->
              <div>
                <h4 class="font-semibold text-neutral-400 uppercase tracking-wider text-[10px] mb-1">General Disclosure</h4>
                <p>The materials and content provided by TradersYard GmbH, whether on our website, through distributed documents, or other communications, are intended solely for general informational purposes. This content does not constitute investment advice, an offer to buy or sell securities, or an endorsement of any financial instruments, companies, or funds. Users should not interpret the information as personalized financial advice. TradersYard GmbH, registered at K&auml;rntnerring 5-7, 1010 Vienna, Austria, adheres to all relevant European and international legal standards.</p>
              </div>

              <!-- Risk Disclosure -->
              <div>
                <h4 class="font-semibold text-neutral-400 uppercase tracking-wider text-[10px] mb-1">Risk Disclosure</h4>
                <p>Engaging in futures, forex, and other financial trading involves significant risk and is not appropriate for all investors. It is possible to lose the entire amount of your investment, or even more. Only use risk capital &mdash; money you can afford to lose without impacting your financial security or lifestyle. Trading should only be undertaken by individuals who have the necessary capital, can understand the risks involved, and acknowledge that past trading results do not guarantee future performance. TradersYard GmbH does not warrant the accuracy or completeness of the information provided and is not responsible for any losses or damages resulting from reliance on this information.</p>
              </div>

              <!-- Hypothetical Performance -->
              <div>
                <h4 class="font-semibold text-neutral-400 uppercase tracking-wider text-[10px] mb-1">Hypothetical Performance Disclosure</h4>
                <p>Performance results based on hypothetical data have many inherent limitations and should not be relied upon as indicative of actual future performance. Hypothetical performance figures are often generated with the benefit of hindsight and do not involve financial risk, thus differing significantly from actual trading results. Testimonials and other promotional materials on our website do not necessarily represent the experiences of other clients and do not predict future performance.</p>
              </div>

              <!-- CFTC -->
              <div>
                <h4 class="font-semibold text-neutral-400 uppercase tracking-wider text-[10px] mb-1">CFTC Rule 4.41</h4>
                <p>In accordance with CFTC Rule 4.41, hypothetical or simulated performance results have inherent limitations. They do not stem from actual trading activities and may misrepresent the impact of real market conditions such as liquidity. These models, often constructed with the benefit of hindsight, lack predictive value regarding future trading outcomes. No assurance is provided that any trading account will achieve profits or losses similar to those illustrated. Past performance metrics should not be interpreted as reliable indicators of future results.</p>
              </div>

            </div>
          </div>
        </Container>
      </footer>

      <Notice />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useTheme } from "~~/composables/useTheme.js"

onMounted(() => {
  const { initializeTheme } = useTheme()
  initializeTheme()
})
</script>

<style scoped>
@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.banner-scroll {
  animation: scroll 30s linear infinite;
}
.banner-container:hover .banner-scroll {
  animation-play-state: paused;
}
</style>
