<template>
  <div>
    <!-- ─── HERO SECTION ─── -->
    <section id="crack" class="relative overflow-hidden py-16 md:py-28 bg-[#0B0B0B]">
      <!-- Radial glow behind egg -->
      <div class="absolute inset-0 -z-10 pointer-events-none">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-campaign/10 blur-[120px]" />
      </div>

      <!-- Subtle floating decorations -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <IconSparkles class="absolute top-10 left-[8%] size-8 text-campaign opacity-[0.06] animate-float" style="animation-delay:0s" />
        <IconSparkles class="absolute bottom-24 left-[18%] size-6 text-campaign opacity-[0.06] animate-float" style="animation-delay:4s" />
        <IconSparkles class="absolute top-1/2 right-[6%] size-6 text-campaign opacity-[0.06] animate-float" style="animation-delay:3s" />
      </div>

      <Container>
        <div class="text-center max-w-4xl mx-auto space-y-8">

          <!-- Invited banner — shown when ?ref= is present -->
          <Transition name="slide-down">
            <div v-if="inboundRef" class="inline-flex items-center gap-2 bg-campaign/20 border border-campaign/40 rounded-full px-4 py-2 text-sm text-campaign font-medium mb-2">
              <IconGift class="size-4 flex-shrink-0" /> A friend sent you this — your egg is waiting
            </div>
          </Transition>

          <!-- Second crack banner — shown when returning user has a credit -->
          <Transition name="slide-down">
            <div v-if="hasReferralCredit && state === 'gate'" class="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 text-sm text-green-400 font-medium mb-2">
              <IconRosetteDiscountCheck class="size-4 flex-shrink-0" /> You've earned a second crack — enter your email to claim it
            </div>
          </Transition>

          <!-- Chip badge -->
          <div class="inline-block">
            <div class="rounded-full text-center bg-campaign text-black px-4 py-1.5 text-[10px] font-semibold tracking-[3px] uppercase transition-transform duration-300 hover:scale-105">
              Limited Time · One Egg Per Person
            </div>
          </div>

          <!-- Headline -->
          <h1 class="font-clash text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-tight">
            One Crack.<br />
            <span class="text-campaign">Everyone Wins Something.</span>
          </h1>

          <p class="text-lg md:text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            Enter your email, crack your Easter egg, and instantly reveal your prize.
            Your code lands in your inbox too — and it always beats our public deals.
          </p>

          <!-- Public codes reminder -->
          <div class="flex flex-wrap justify-center gap-3">
            <div class="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm">
              <span class="text-neutral-400">Public floor:</span>
              <span class="font-mono font-bold text-campaign tracking-wider">EASTER20</span>
              <span class="text-neutral-500">&</span>
              <span class="font-mono font-bold text-campaign tracking-wider">RESET20</span>
              <span class="text-neutral-400">— 20% off</span>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════════════════ -->
          <!-- PRIZE REVEAL CARD — shown blurred until email submitted -->
          <!-- ═══════════════════════════════════════════════════════ -->

          <!-- CAMPAIGN ENDED STATE -->
          <div v-if="campaignEnded" class="max-w-md mx-auto bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-3xl p-10 text-center">
            <IconLock class="size-12 text-neutral-400 mx-auto mb-4" />
            <h2 class="font-clash text-2xl font-semibold text-neutral-900 dark:text-white mb-2">This promotion has ended</h2>
            <p class="text-neutral-500 dark:text-neutral-400 text-sm mb-6">The Easter 2026 campaign closed on April 10th. Check Discord for upcoming promos.</p>
            <a href="https://app.tradersyard.com/challenges" class="inline-block bg-campaign hover:bg-campaign-dark text-black font-clash font-semibold px-6 py-3 rounded-xl transition-colors">
              View Challenges
            </a>
          </div>

          <!-- MAIN CAMPAIGN UI -->
          <template v-else>
            <div class="relative max-w-lg mx-auto">

              <!-- ── BLURRED PRIZE PREVIEW (shown before email submitted) ── -->
              <div
                v-if="state === 'gate'"
                class="relative rounded-3xl overflow-hidden border border-white/10 bg-neutral-900 shadow-[0_0_80px_rgba(234,179,8,0.15)]"
              >
                <!-- Blurred prize card underneath -->
                <div class="px-8 py-10 blur-md select-none pointer-events-none" aria-hidden="true">
                  <div class="text-center space-y-4">
                    <div class="inline-block bg-campaign/20 text-campaign text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Very Rare
                    </div>
                    <div class="text-6xl">🥚</div>
                    <div class="font-clash text-2xl font-semibold text-white">
                      40% Off Any Account
                    </div>
                    <div class="font-mono text-3xl font-bold tracking-widest bg-neutral-800 rounded-xl px-6 py-4 text-campaign">
                      HATCH-XXXX
                    </div>
                    <p class="text-neutral-500 text-sm">
                      Expires in <span class="font-mono font-semibold text-campaign">{{ codeCountdown }}</span>
                    </p>
                  </div>
                </div>

                <!-- Overlay with egg + form -->
                <div class="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/80 backdrop-blur-sm px-6 py-8">

                  <!-- Animated egg -->
                  <div class="mb-5 cursor-pointer" @click="wiggleEgg">
                    <div :class="['transition-transform', isWiggling ? 'egg-wiggle' : '']">
                      <svg viewBox="0 0 200 240" class="w-28 h-36 animate-egg-float animate-egg-glow drop-shadow-[0_0_30px_rgba(234,179,8,0.4)]">
                        <defs>
                          <radialGradient id="eggG" cx="35%" cy="30%" r="70%">
                            <stop offset="0%" stop-color="#fef08a" />
                            <stop offset="40%" stop-color="#eab308" />
                            <stop offset="100%" stop-color="#92400e" />
                          </radialGradient>
                          <radialGradient id="eggShine" cx="30%" cy="25%" r="35%">
                            <stop offset="0%" stop-color="rgba(255,255,255,0.45)" />
                            <stop offset="100%" stop-color="rgba(255,255,255,0)" />
                          </radialGradient>
                        </defs>
                        <ellipse cx="100" cy="130" rx="78" ry="105" fill="url(#eggG)" />
                        <ellipse cx="100" cy="130" rx="78" ry="105" fill="url(#eggShine)" />
                        <!-- hint crack -->
                        <path d="M92 55 L100 72 L108 60 L114 78" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                      </svg>
                    </div>
                  </div>

                  <p class="font-clash text-base font-semibold text-white mb-1">Your prize is waiting inside</p>
                  <p class="text-neutral-400 text-xs mb-5 text-center">Enter your email to crack it open</p>

                  <!-- Email form -->
                  <form @submit.prevent="submitCrack" class="w-full space-y-3">
                    <input
                      v-model="email"
                      type="email"
                      placeholder="your@email.com"
                      autocomplete="email"
                      required
                      :disabled="loading"
                      class="w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-xl px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-campaign/50 focus:border-campaign transition-all text-sm disabled:opacity-50"
                    />
                    <p v-if="emailError" class="text-red-500 text-xs -mt-1">{{ emailError }}</p>

                    <!-- GDPR -->
                    <label class="flex items-start gap-2.5 cursor-pointer text-left">
                      <div class="relative mt-0.5 flex-shrink-0">
                        <input v-model="gdprConsent" type="checkbox" class="sr-only peer" />
                        <div class="w-4 h-4 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 peer-checked:bg-campaign peer-checked:border-campaign transition-all flex items-center justify-center">
                          <svg v-if="gdprConsent" class="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      <span class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        I agree to receive marketing emails from TradersYard
                      </span>
                    </label>
                    <p v-if="gdprError" class="text-red-500 text-xs">{{ gdprError }}</p>

                    <Button variant="campaign" size="lg" type="submit" :disabled="loading" class="w-full justify-center">
                      <span v-if="!loading">Crack My Egg 🥚</span>
                      <span v-else class="flex items-center gap-2">
                        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Cracking…
                      </span>
                    </Button>

                    <p v-if="serverError" class="text-red-500 text-xs text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                      {{ serverError }}
                    </p>
                  </form>
                </div>
              </div>

              <!-- ── CRACKING ANIMATION ── -->
              <div v-if="state === 'cracking'" class="rounded-3xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-2xl px-8 py-12 text-center">
                <svg viewBox="0 0 200 240" class="w-28 h-36 mx-auto mb-6 egg-cracking drop-shadow-[0_0_40px_rgba(234,179,8,0.6)]">
                  <defs>
                    <radialGradient id="eggG2" cx="35%" cy="30%" r="70%">
                      <stop offset="0%" stop-color="#fef08a" />
                      <stop offset="40%" stop-color="#eab308" />
                      <stop offset="100%" stop-color="#92400e" />
                    </radialGradient>
                  </defs>
                  <ellipse cx="100" cy="130" rx="78" ry="105" fill="url(#eggG2)" />
                  <path d="M80 52 L100 78 L120 55 L132 88 L106 94 L118 125" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.95"/>
                  <path d="M83 72 L72 93 L88 98" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/>
                </svg>
                <p class="font-clash text-lg font-semibold text-neutral-900 dark:text-white animate-pulse">Revealing your prize…</p>
              </div>

              <!-- ── PRIZE REVEALED ── -->
              <div
                v-if="state === 'revealed' && prize"
                class="rounded-3xl border shadow-2xl overflow-hidden prize-reveal"
                :class="prizeCardClass"
              >
                <!-- Tier banner -->
                <div class="px-6 py-2 text-center text-xs font-bold uppercase tracking-widest" :class="tierBannerClass">
                  {{ prize.tier_label }}
                </div>

                <div class="px-8 py-8 text-center space-y-5">
                  <div class="flex justify-center"><IconTrophy class="size-12 text-campaign" /></div>

                  <h2 class="font-clash text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-white leading-tight">
                    {{ prize.display_text }}
                  </h2>

                  <!-- Coupon code block -->
                  <div>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Your code</p>
                    <button
                      @click="copyCode"
                      class="w-full font-mono text-2xl font-bold tracking-[4px] bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-campaign rounded-xl px-5 py-4 text-campaign transition-all flex items-center justify-center gap-3"
                    >
                      {{ prize.code }}
                      <svg v-if="!codeCopied" class="w-4 h-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                      <svg v-else class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    </button>
                    <p class="text-xs text-neutral-400 mt-2">Tap to copy · Expires in <span class="font-mono text-campaign font-semibold">{{ codeCountdown }}</span></p>
                  </div>

                  <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    Code also sent to <strong class="text-neutral-700 dark:text-neutral-300">{{ email }}</strong> ✓
                  </p>

                  <a
                    href="https://app.tradersyard.com/challenges"
                    class="inline-block w-full bg-campaign hover:bg-campaign-dark text-black font-clash font-semibold py-3.5 rounded-xl transition-colors text-base"
                  >
                    Redeem Now →
                  </a>

                  <!-- Share row -->
                  <div class="flex gap-3 pt-1">
                    <button @click="shareTwitter" class="flex-1 flex items-center justify-center gap-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-xl py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors">
                      <IconBrandX class="w-4 h-4" /> Share
                    </button>
                    <button @click="copyDiscord" class="flex-1 flex items-center justify-center gap-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-xl py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors">
                      <IconBrandDiscord class="w-4 h-4" />
                      <span v-if="discordCopied">Copied!</span>
                      <span v-else>Discord</span>
                    </button>
                  </div>

                  <!-- ── REFERRAL BLOCK ── -->
                  <div class="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <p class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Want another crack?</p>
                    <p class="text-xs text-neutral-400 mb-3 leading-relaxed">
                      Send your link to a friend. When they crack their egg, you earn a free second crack — a completely new prize draw.
                    </p>
                    <!-- Referral link display -->
                    <div class="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2.5 mb-3">
                      <span class="flex-1 text-xs font-mono text-neutral-500 dark:text-neutral-400 truncate">tradersyard.com/easter?ref={{ referralCode }}</span>
                      <button @click="copyReferralLink" class="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1 bg-campaign text-black rounded-lg transition-all">
                        <IconCheck v-if="referralLinkCopied" class="size-3" />
                        <IconCopy v-else class="size-3" />
                        {{ referralLinkCopied ? 'Copied!' : 'Copy' }}
                      </button>
                    </div>
                    <!-- Share buttons -->
                    <div class="flex gap-2">
                      <button @click="shareReferralWhatsApp" class="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-xl py-2 text-xs font-medium text-[#25D366] transition-colors">
                        <IconBrandWhatsapp class="size-3.5" /> WhatsApp
                      </button>
                      <button @click="shareReferralTwitter" class="flex-1 flex items-center justify-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-xl py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 transition-colors">
                        <IconBrandX class="size-3.5" /> Twitter
                      </button>
                      <button @click="shareReferralDiscord" class="flex-1 flex items-center justify-center gap-1.5 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 rounded-xl py-2 text-xs font-medium text-[#5865F2] transition-colors">
                        <IconBrandDiscord class="size-3.5" /> Discord
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Trust badges -->
            <div class="flex flex-wrap justify-center gap-4 md:gap-8 text-sm text-neutral-400 pt-4">
              <div class="flex items-center gap-2">
                <IconCircleCheck class="w-5 h-5 text-campaign flex-shrink-0" />
                <span>Everyone wins something</span>
              </div>
              <div class="flex items-center gap-2">
                <IconMail class="w-5 h-5 text-campaign flex-shrink-0" />
                <span>Code sent to your inbox instantly</span>
              </div>
              <div class="hidden sm:flex items-center gap-2">
                <IconShieldCheck class="w-5 h-5 text-campaign flex-shrink-0" />
                <span>Prize always beats public deals</span>
              </div>
            </div>
          </template>
        </div>
      </Container>
    </section>

    <!-- ─── REFERRAL CTA (persistent, visible to all) ─── -->
    <section class="py-14 bg-[#0B0B0B] border-t border-white/5">
      <Container>
        <div class="max-w-2xl mx-auto text-center space-y-5">
          <div class="inline-flex items-center gap-2 bg-campaign/10 border border-campaign/20 rounded-full px-4 py-1.5 text-xs font-semibold text-campaign uppercase tracking-wider">
            <IconEgg class="size-4" /> Earn a Second Crack
          </div>
          <h2 class="font-clash text-2xl md:text-3xl font-semibold text-white">
            Share Your Link.<br/>
            <span class="text-campaign">They Win. You Win Again.</span>
          </h2>
          <p class="text-neutral-400 text-sm leading-relaxed max-w-md mx-auto">
            After cracking your egg, you get a unique referral link. Share it — when a friend cracks their egg through your link, you unlock a brand new second draw. A completely fresh prize, no strings.
          </p>
          <div class="grid grid-cols-3 gap-4 max-w-md mx-auto pt-2">
            <div class="text-center space-y-2">
              <div class="w-10 h-10 bg-campaign rounded-xl flex items-center justify-center mx-auto text-black font-clash font-bold">1</div>
              <p class="text-xs text-neutral-400">Crack your egg — get your referral link</p>
            </div>
            <div class="text-center space-y-2">
              <div class="w-10 h-10 bg-campaign rounded-xl flex items-center justify-center mx-auto text-black font-clash font-bold">2</div>
              <p class="text-xs text-neutral-400">Share it via WhatsApp, Discord, or X</p>
            </div>
            <div class="text-center space-y-2">
              <div class="w-10 h-10 bg-campaign rounded-xl flex items-center justify-center mx-auto text-black font-clash font-bold">3</div>
              <p class="text-xs text-neutral-400">Friend cracks → you get a second draw</p>
            </div>
          </div>
          <a href="#crack" class="inline-block bg-campaign hover:bg-campaign-dark text-black font-clash font-semibold px-6 py-3 rounded-xl transition-colors text-sm mt-2">
            Crack My Egg First →
          </a>
        </div>
      </Container>
    </section>

    <!-- ─── HOW IT WORKS ─── -->
    <section class="py-16 bg-[#0B0B0B] border-y border-white/5">
      <Container>
        <div class="text-center mb-12">
          <h2 class="font-clash text-3xl md:text-4xl font-semibold text-white">How It Works</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div v-for="step in steps" :key="step.num" class="text-center space-y-4">
            <div class="w-14 h-14 bg-campaign rounded-2xl flex items-center justify-center mx-auto shadow-[0_4px_24px_rgba(234,179,8,0.35)]">
              <span class="font-clash text-2xl font-bold text-black">{{ step.num }}</span>
            </div>
            <h3 class="font-clash text-base font-semibold text-white">{{ step.title }}</h3>
            <p class="text-sm text-neutral-500 leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </Container>
    </section>

    <!-- ─── WIN UP TO — PERKS SHOWCASE ─── -->
    <section class="py-20 bg-[#0B0B0B] border-t border-white/5">
      <Container>
        <div class="text-center mb-14 reveal">
          <div class="inline-flex items-center gap-2 bg-campaign/10 border border-campaign/30 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-campaign mb-5">
            <IconSparkles class="size-3.5" /> The Prizes
          </div>
          <h2 class="font-clash text-4xl md:text-5xl font-semibold text-white mb-4 leading-tight">
            Win Up To the Most<br class="hidden md:block" />
            <span class="text-campaign"> Amazing Perks</span>
          </h2>
          <p class="text-neutral-400 max-w-lg mx-auto text-base">
            Every egg hides a real discount — auto-applied at checkout. The rarer your prize, the bigger your edge.
          </p>
        </div>

        <!-- Top 3 hero prize cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto mb-6 reveal">
          <!-- Jackpot -->
          <div class="relative rounded-3xl overflow-hidden border border-campaign/40 bg-gradient-to-br from-campaign/12 via-campaign/6 to-transparent p-9 flex flex-col min-h-[220px]">
            <div class="absolute inset-0 pointer-events-none">
              <div class="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-28 bg-campaign/20 blur-[60px] rounded-full" />
            </div>
            <div class="inline-flex items-center gap-1.5 bg-campaign text-black text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-5 self-start z-10">
              <IconTrophy class="size-3.5" /> Jackpot
            </div>
            <div class="font-clash text-7xl font-semibold text-campaign leading-none mb-2 z-10">50%</div>
            <div class="text-white font-clash text-lg font-semibold z-10">Off Your Challenge</div>
            <div class="text-neutral-400 text-sm mt-2 z-10">$5K or $10K 2-Phase · <strong class="text-campaign">$39.50</strong></div>
          </div>
          <!-- Free Account -->
          <div class="relative rounded-3xl overflow-hidden border border-purple-500/30 bg-gradient-to-br from-purple-500/12 via-purple-500/6 to-transparent p-9 flex flex-col min-h-[220px]">
            <div class="absolute inset-0 pointer-events-none">
              <div class="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-28 bg-purple-500/15 blur-[60px] rounded-full" />
            </div>
            <div class="inline-flex items-center gap-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-5 self-start z-10">
              <IconStarFilled class="size-3.5" /> Ultra Rare
            </div>
            <div class="font-clash text-7xl font-semibold text-purple-300 leading-none mb-2 z-10">Free</div>
            <div class="text-white font-clash text-lg font-semibold z-10">$5K 2-Phase Account</div>
            <div class="text-neutral-400 text-sm mt-2 z-10">A full challenge — completely on us</div>
          </div>
          <!-- Free Reset -->
          <div class="relative rounded-3xl overflow-hidden border border-green-500/30 bg-gradient-to-br from-green-500/12 via-green-500/6 to-transparent p-9 flex flex-col min-h-[220px]">
            <div class="absolute inset-0 pointer-events-none">
              <div class="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-28 bg-green-500/12 blur-[60px] rounded-full" />
            </div>
            <div class="inline-flex items-center gap-1.5 bg-green-500/20 text-green-300 border border-green-500/30 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-5 self-start z-10">
              <IconRefresh class="size-3.5" /> Uncommon
            </div>
            <div class="font-clash text-7xl font-semibold text-green-300 leading-none mb-2 z-10">30%</div>
            <div class="text-white font-clash text-lg font-semibold z-10">Off Any Reset</div>
            <div class="text-neutral-400 text-sm mt-2 z-10">Restart your challenge for less</div>
          </div>
        </div>

        <!-- Secondary perks grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto reveal">
          <div v-for="perk in topPerks" :key="perk.label"
            class="group relative rounded-2xl border border-white/8 bg-white/3 hover:border-campaign/40 hover:bg-campaign/5 transition-all duration-200 p-6">
            <div class="absolute top-0 left-0 right-0 h-[2px] bg-campaign opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-2xl" />
            <div class="flex items-center gap-3 mb-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" :style="{ background: perk.color + '22' }">
                <component :is="perk.icon" class="size-5" :style="{ color: perk.color }" />
              </div>
              <span class="text-[10px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5 border" :style="{ color: perk.color, borderColor: perk.color + '55', background: perk.color + '18' }">{{ perk.tier }}</span>
            </div>
            <p class="font-clash text-lg font-semibold text-white leading-snug">{{ perk.label }}</p>
            <p class="text-neutral-500 text-xs mt-1">{{ perk.sub }}</p>
          </div>
        </div>

        <p class="text-center text-xs text-neutral-600 mt-10">Every egg beats the public 20% floor — your prize is drawn the moment you crack.</p>
      </Container>
    </section>

  </div>
</template>

<script setup lang="ts">
import confetti from 'canvas-confetti'
import { useScrollReveal } from '~~/composables/useScrollReveal'
import {
  IconSparkles, IconGift, IconRosetteDiscountCheck, IconLock, IconTrophy,
  IconCircleCheck, IconMail, IconShieldCheck,
  IconRosetteDiscount, IconRefresh, IconCreditCard, IconStarFilled, IconEgg,
  IconBrandWhatsapp, IconBrandX, IconBrandDiscord, IconCopy, IconCheck,
  IconPercentage, IconArrowUpRight,
} from '@tabler/icons-vue'

definePageMeta({ layout: 'campaign' })
useScrollReveal()

const CAMPAIGN_END = new Date('2026-04-10T23:59:59-05:00')
const campaignEnded = computed(() => new Date() > CAMPAIGN_END)

// ── Prizes display data ───────────────────────────────────────────────────────
const TIER_COLORS: Record<number, string> = {
  1: '#6b7280',
  2: '#3b82f6',
  3: '#22c55e',
  4: '#f59e0b',
  5: '#f59e0b',
  6: '#a855f7',
  7: '#eab308',
}

const tierLegend = [
  { label: 'Common', color: TIER_COLORS[1] },
  { label: 'Common+', color: TIER_COLORS[2] },
  { label: 'Uncommon', color: TIER_COLORS[3] },
  { label: 'Rare', color: TIER_COLORS[4] },
  { label: 'Very Rare', color: TIER_COLORS[5] },
  { label: 'Ultra Rare', color: TIER_COLORS[6] },
  { label: 'Jackpot', color: TIER_COLORS[7] },
]

// Top perks for the "Win Up To" section (below jackpot)
const topPerks = [
  { label: 'Free $5K Account', sub: 'A full 2-Phase challenge on us', tier: 'Ultra Rare', color: '#a855f7', icon: IconStarFilled },
  { label: '40% Off Entry Account', sub: '$5K or $10K 2-Phase only', tier: 'Uncommon', color: '#22c55e', icon: IconPercentage },
  { label: 'Step Up to $25K for $104', sub: 'From $149 — save $45', tier: 'Uncommon', color: '#22c55e', icon: IconArrowUpRight },
  { label: 'Step Up to $50K for $174', sub: 'From $249 — save $75', tier: 'Rare', color: '#f59e0b', icon: IconArrowUpRight },
  { label: '30% Off Any Reset', sub: 'Restart your challenge cheaper', tier: 'Common+', color: '#3b82f6', icon: IconRefresh },
  { label: '25% Off Any Account', sub: 'All sizes, both phases', tier: 'Common+', color: '#3b82f6', icon: IconRosetteDiscount },
]

// Deduplicated prize list for the full grid — rarest first, matches new prize pool
const allPrizes = [
  { id: 'jackpot',      name: '50% Off $5K or $10K 2-Phase',    tier: 7, tier_label: 'Jackpot',    inventory: 23 },
  { id: 'free-5k',      name: 'Free $5K 2-Phase Account',        tier: 6, tier_label: 'Ultra Rare', inventory: 3  },
  { id: 'upsell-100k',  name: 'Step Up to $100K for $349',       tier: 4, tier_label: 'Rare',       inventory: 15 },
  { id: 'upsell-50k',   name: 'Step Up to $50K for $174',        tier: 4, tier_label: 'Rare',       inventory: 25 },
  { id: 'upsell-25k',   name: 'Step Up to $25K for $104',        tier: 3, tier_label: 'Uncommon',   inventory: 90 },
  { id: 'upsell-10k',   name: 'Step Up to $10K for $55',         tier: 3, tier_label: 'Uncommon',   inventory: 60 },
  { id: '40pct-entry',  name: '40% Off $5K or $10K 2-Phase',     tier: 3, tier_label: 'Uncommon',   inventory: 70 },
  { id: 'reset-30pct',  name: '30% Off Any Reset',               tier: 2, tier_label: 'Common+',    inventory: 80 },
  { id: '25pct-all',    name: '25% Off Any Account',             tier: 2, tier_label: 'Common+',    inventory: null },
  { id: 'reset-20pct',  name: '20% Off Any Reset',               tier: 1, tier_label: 'Common',     inventory: null },
]

function tierStyle(tier: number) {
  const color = TIER_COLORS[tier] ?? '#6b7280'
  return {
    borderColor: color + '55',
    backgroundColor: color + '18',
    color,
  }
}

function prizeListCardClass(tier: number) {
  if (tier >= 7) return 'border-yellow-400/30 shadow-yellow-400/10 shadow-md'
  if (tier === 6) return 'border-purple-500/30'
  if (tier === 5) return 'border-amber-400/30'
  if (tier === 4) return 'border-amber-300/20'
  return 'border-neutral-200 dark:border-neutral-700/60'
}

type State = 'gate' | 'cracking' | 'revealed'
const state = ref<State>('gate')

const email = ref('')
const gdprConsent = ref(false)
const loading = ref(false)
const emailError = ref('')
const gdprError = ref('')
const serverError = ref('')
const isWiggling = ref(false)
const codeCopied = ref(false)
const discordCopied = ref(false)

// ── 24h countdown ─────────────────────────────────────────────────────────────
const codeExpiresAt = ref<number | null>(null)   // timestamp set when prize is revealed
const codeCountdown = ref('24:00:00')

function startCountdown() {
  codeExpiresAt.value = Date.now() + 24 * 60 * 60 * 1000
  const tick = () => {
    const remaining = (codeExpiresAt.value ?? 0) - Date.now()
    if (remaining <= 0) { codeCountdown.value = '00:00:00'; return }
    const h = Math.floor(remaining / 3_600_000)
    const m = Math.floor((remaining % 3_600_000) / 60_000)
    const s = Math.floor((remaining % 60_000) / 1_000)
    codeCountdown.value = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    setTimeout(tick, 1000)
  }
  tick()
}

// ── Referral state ────────────────────────────────────────────────────────────
const referralCode = ref<string | null>(null)       // this user's share code (after cracking)
const inboundRef = ref<string | null>(null)         // ?ref= code from URL (friend invited them)
const referralLinkCopied = ref(false)
const hasReferralCredit = ref(false)                // earned a second crack
const referralCreditChecked = ref(false)

interface PrizeResult {
  display_text: string
  code: string
  tier: number
  tier_label: string
}
const prize = ref<PrizeResult | null>(null)

// On mount: read ?ref= from URL and store it; also check if returning user has credit
onMounted(async () => {
  const route = useRoute()

  // Capture inbound referral code from URL
  if (route.query.ref) {
    inboundRef.value = String(route.query.ref)
    sessionStorage.setItem('ty_ref', inboundRef.value)
  } else {
    // Check sessionStorage in case they refreshed
    inboundRef.value = sessionStorage.getItem('ty_ref')
  }
})

// Check referral credit when user types their email (debounced 600ms)
let _refCheckTimer: ReturnType<typeof setTimeout> | null = null
watch(email, (val: string) => {
  if (_refCheckTimer) clearTimeout(_refCheckTimer)
  _refCheckTimer = setTimeout(async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return
    if (referralCreditChecked.value) return
    referralCreditChecked.value = true
    try {
      const res = await $fetch<{ has_credit: boolean }>('/api/easter/referral-status', {
        method: 'POST',
        body: { email: val.trim().toLowerCase() },
      })
      hasReferralCredit.value = res.has_credit
    } catch {}
  }, 600)
})

function wiggleEgg() {
  if (isWiggling.value) return
  isWiggling.value = true
  setTimeout(() => { isWiggling.value = false }, 600)
}

async function getFingerprint(): Promise<string> {
  try {
    const { default: FingerprintJS } = await import(
      /* @vite-ignore */ 'https://openfpcdn.io/fingerprintjs/v4/esm.min.js'
    )
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    return result.visitorId
  } catch {
    const key = 'ty_fp'
    const stored = sessionStorage.getItem(key)
    if (stored) return stored
    const id = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0')).join('')
    sessionStorage.setItem(key, id)
    return id
  }
}

async function submitCrack() {
  emailError.value = ''
  gdprError.value = ''
  serverError.value = ''

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Please enter a valid email address.'
    return
  }
  if (!gdprConsent.value) {
    gdprError.value = 'Please agree to receive marketing emails to proceed.'
    return
  }

  loading.value = true
  try {
    const fingerprint = await getFingerprint()
    const res = await $fetch<{ prize: PrizeResult; referral_code: string | null } | { error: string }>('/api/easter/crack', {
      method: 'POST',
      body: {
        email: email.value.trim().toLowerCase(),
        fingerprint,
        gdpr_consent: gdprConsent.value,
        ref: inboundRef.value ?? undefined,
        is_referral_crack: hasReferralCredit.value,
      },
    })

    if ('error' in res) {
      serverError.value = res.error
      loading.value = false
      return
    }

    // Store the referral code they earned
    if (res.referral_code) {
      referralCode.value = res.referral_code
      sessionStorage.setItem('ty_my_ref', res.referral_code)
    }
    // Clear inbound ref from session so it can't be reused
    sessionStorage.removeItem('ty_ref')
    inboundRef.value = null

    state.value = 'cracking'
    loading.value = false
    await new Promise(r => setTimeout(r, 1800))
    prize.value = res.prize
    state.value = 'revealed'
    startCountdown()
    await nextTick()
    fireConfetti(res.prize.tier)
  } catch (err: any) {
    serverError.value = err?.data?.message || 'Something went wrong. Please try again.'
    loading.value = false
  }
}

// Build the full referral share URL
const referralShareUrl = computed(() => {
  const code = referralCode.value || sessionStorage.getItem?.('ty_my_ref')
  if (!code) return 'https://tradersyard.com/easter'
  return `https://tradersyard.com/easter?ref=${code}`
})

async function copyReferralLink() {
  await navigator.clipboard.writeText(referralShareUrl.value)
  referralLinkCopied.value = true
  setTimeout(() => { referralLinkCopied.value = false }, 2500)
}

function shareReferralTwitter() {
  const t = `I just cracked my Easter egg at @TradersYard 🥚 Everyone wins something — grab yours while it lasts! ${referralShareUrl.value}`
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}`, '_blank')
}

function shareReferralWhatsApp() {
  const t = `I just cracked my Easter egg at TradersYard and won a prize 🥚 Everyone wins something — try yours here: ${referralShareUrl.value}`
  window.open(`https://wa.me/?text=${encodeURIComponent(t)}`, '_blank')
}

async function shareReferralDiscord() {
  const m = `🥚 Just cracked my Easter egg at TradersYard — everyone wins something!\n\nUse my link to get yours: ${referralShareUrl.value}`
  await navigator.clipboard.writeText(m)
  referralLinkCopied.value = true
  setTimeout(() => { referralLinkCopied.value = false }, 2500)
}

function fireConfetti(tier: number) {
  const origin = { x: 0.5, y: 0.4 }
  const gold = ['#eab308', '#fef08a', '#ffffff', '#f59e0b']
  if (tier === 7) {
    const end = Date.now() + 4000
    ;(function frame() {
      confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 }, colors: gold })
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors: gold })
      if (Date.now() < end) requestAnimationFrame(frame)
    })()
  } else if (tier >= 5) {
    confetti({ particleCount: 150, spread: 120, origin, colors: gold })
  } else if (tier === 4) {
    confetti({ particleCount: 80, spread: 80, origin, colors: gold })
  } else if (tier === 3) {
    confetti({ particleCount: 50, spread: 60, origin, colors: ['#22c55e', '#86efac', '#fff'] })
  } else if (tier === 2) {
    confetti({ particleCount: 30, spread: 45, origin, colors: ['#3b82f6', '#93c5fd'] })
  }
}

const prizeCardClass = computed(() => {
  const t = prize.value?.tier ?? 1
  if (t === 7) return 'bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/30 dark:to-neutral-900 border-yellow-400 shadow-[0_0_60px_rgba(234,179,8,0.25)]'
  if (t === 6) return 'bg-white dark:bg-neutral-900 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.2)]'
  if (t >= 4) return 'bg-white dark:bg-neutral-900 border-yellow-400/60'
  if (t === 3) return 'bg-white dark:bg-neutral-900 border-green-400/60'
  return 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700'
})

const tierBannerClass = computed(() => {
  const t = prize.value?.tier ?? 1
  if (t === 7) return 'bg-campaign text-black'
  if (t === 6) return 'bg-purple-500 text-white'
  if (t >= 4) return 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
  if (t === 3) return 'bg-green-500/20 text-green-700 dark:text-green-400'
  return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
})

async function copyCode() {
  if (!prize.value) return
  await navigator.clipboard.writeText(prize.value.code)
  codeCopied.value = true
  setTimeout(() => { codeCopied.value = false }, 2500)
}

function shareTwitter() {
  if (!prize.value) return
  const t = `Just cracked my Easter egg at @TradersYard and won: ${prize.value.display_text} 🥚 Code: ${prize.value.code} — grab yours while it lasts! tradersyard.com/easter`
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}`, '_blank')
}

async function copyDiscord() {
  if (!prize.value) return
  const m = `🥚 Just cracked my Easter egg at TradersYard!\n\nI won: **${prize.value.display_text}**\nCode: \`${prize.value.code}\`\n\nGrab yours while it lasts → tradersyard.com/easter`
  await navigator.clipboard.writeText(m)
  discordCopied.value = true
  setTimeout(() => { discordCopied.value = false }, 3000)
}

const steps = [
  { num: '1', title: 'Enter Your Email', desc: 'Drop in your email and tick the checkbox. Takes 5 seconds.' },
  { num: '2', title: 'Crack the Egg', desc: 'Your personalised prize is drawn instantly on our servers.' },
  { num: '3', title: 'Claim Your Prize', desc: 'Use your unique code at checkout. We send it to your inbox too.' },
]

const prizePreviews = [
  { label: '30–50% Off', sub: 'All challenge accounts', icon: 'discount' },
  { label: 'Free Reset', sub: 'Restart your challenge', icon: 'refresh' },
  { label: 'Flat Credit', sub: 'On mid/top tier accounts', icon: 'credit' },
  { label: 'Free Account', sub: 'Limited — going fast', icon: 'star' },
]

useHead({
  title: 'Hatch a Chance 🥚 — TradersYard Easter 2026',
  meta: [
    { name: 'description', content: 'Crack your Easter egg and win a prize. One crack per person. Everyone wins something.' },
  ],
})
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }

@keyframes eggFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-10px) rotate(2deg); }
  66% { transform: translateY(-5px) rotate(-2deg); }
}
@keyframes eggGlow {
  0%, 100% { filter: drop-shadow(0 0 20px rgba(234,179,8,0.3)); }
  50% { filter: drop-shadow(0 0 40px rgba(234,179,8,0.6)); }
}
@keyframes eggWiggle {
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(-8deg); }
  40% { transform: rotate(8deg); }
  60% { transform: rotate(-5deg); }
  80% { transform: rotate(5deg); }
}
@keyframes eggCrack {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.06) rotate(-3deg); }
  75% { transform: scale(1.06) rotate(3deg); }
}
@keyframes prizeReveal {
  0% { opacity: 0; transform: scale(0.85) translateY(16px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.animate-egg-float { animation: eggFloat 4s ease-in-out infinite; }
.animate-egg-glow { animation: eggGlow 2s ease-in-out infinite; }
.egg-wiggle { animation: eggWiggle 0.6s ease-in-out !important; }
.egg-cracking { animation: eggCrack 0.35s ease-in-out infinite; }
.prize-reveal { animation: prizeReveal 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
</style>
