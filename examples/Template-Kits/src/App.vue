<script setup lang="ts">
import { useTitle } from '@vueuse/core'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const route = useRoute()

const layouts: Record<string, any> = {
  DefaultLayout,
}
const layout = computed(() => layouts[route.meta.layout as string] || DefaultLayout)

const appTitle = import.meta.env.VITE_APP_TITLE
const title = useTitle(appTitle)

watchEffect(() => {
  title.value = route.meta.title ? `${route.meta.title} - ${appTitle}` : appTitle
})
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
</template>

<style scoped></style>
