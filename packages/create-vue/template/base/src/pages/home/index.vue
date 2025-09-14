<script setup lang="ts">
definePage({
  path: '/',
  meta: {
    title: '首页',
  },
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
    <div class="text-center space-y-4">
      <h1 class="text-5xl font-extrabold text-gray-900">
        Vue Template
      </h1>
      <p class="text-gray-600 max-w-lg mx-auto">
        自用 Vue 3 开发模板，集成 Vite、Pinia、Vue Router、UnoCSS 等常用工具。
      </p>
      <div class="flex flex-wrap gap-4 justify-center mt-4">
        <router-link
          to="/about"
          class="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition"
        >
          About Page
        </router-link>
        <a
          href="https://github.com/"
          target="_blank"
          class="px-6 py-3 rounded-lg bg-gray-100 text-gray-800 font-medium shadow hover:bg-gray-200 transition"
        >
          GitHub
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
