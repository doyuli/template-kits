<script lang="ts" setup>
defineProps<{
  title: string
}>()
</script>

<template>
  <h1 class="text-5xl font-extrabold text-gray-900">
    {{ title }}
  </h1>
</template>

<style scoped></style>
