<template>
	<component :is="as ?? 'div'" class="xl:max-w-screen-xl 2xl:max-w-screen-2xl mx-auto px-4">
		<slot />
	</component>
</template>

<script setup lang="ts">
defineProps<{
	as?: string
}>()
</script>