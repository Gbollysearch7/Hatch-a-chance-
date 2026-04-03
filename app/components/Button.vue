<template>
	<component
			:is="href ? 'a' : 'button'"
		 :href="href ?? undefined"
	   :class="[
			'flex gap-2 justify-center items-center relative group overflow-hidden font-clash font-medium tracking-wide transition-all border duration-300',
			buttonVariantClass[variant],
			sizeVariantClass[size]
		]"
	>
		<span class="transition-all ease-in-out duration-300" :class="!noIcon && 'translate-x-4 group-hover:translate-x-0 rtl:-translate-x-4 rtl:group-hover:translate-x-0'"><slot /></span>

		<span v-if="!noIcon" class="transition-all ease-in-out rotate-45 group-hover:rotate-0 duration-300 opacity-0 translate-x-6 group-hover:translate-x-0 group-hover:opacity-100 rtl:-translate-x-6 rtl:group-hover:translate-x-0 rtl:-rotate-45">
			<component :is="icon ?? IconArrowRight" />
		</span>
	</component>
</template>

<script setup lang="ts">

import { type Icon, IconArrowRight } from "@tabler/icons-vue";

type ButtonVariant = 'primary' | 'light' | 'dark' | 'ghost' | 'campaign'
type ButtonSize = 'sm' | 'xs' | 'default' | 'lg'

const { variant = 'primary', size = 'default' } = defineProps<{
	variant?: ButtonVariant
	size?: ButtonSize
	href?: string
	icon?: Icon
	noIcon?: boolean
}>()

const buttonVariantClass: Record<ButtonVariant, string> = {
	primary: 'bg-primary text-white border-primary hover:bg-primary/75',
	campaign: 'bg-campaign text-white border-campaign hover:bg-campaign-dark',
	light: 'bg-white text-black border-neutral-200 dark:border-white hover:bg-neutral-100',
	dark: 'bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-800',
	ghost: 'text-white border-transparent hover:opacity-50'
}

const sizeVariantClass: Record<ButtonSize, string> = {
	default: 'text-lg px-6 py-3 rounded-xl',
	sm: 'text-base py-2 px-4 rounded-lg',
	xs: 'text-sm py-1.5 px-3 rounded-md',
	lg: 'text-xl py-4 px-6 rounded-2xl'
}
</script>