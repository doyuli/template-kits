<script setup lang="ts">
definePage({
  meta: {
    title: '关于',
  },
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center px-6 py-12">
    <h1 class="text-4xl font-bold text-gray-900 mb-6">
      About This Template
    </h1>
    <div class="max-w-2xl w-full space-y-6">
      <p class="text-gray-700 leading-relaxed">
        这是一个自用 Vue 3 开发模板，旨在快速搭建项目。
        集成了 <span class="font-semibold">Vite、Vue Router、Pinia、UnoCSS、VueUse</span>。
      </p>

      <div class="bg-white p-6 rounded-xl shadow space-y-3">
        <h2 class="text-2xl font-semibold text-gray-900">
          Features
        </h2>
        <ul class="list-disc list-inside text-gray-700 space-y-1">
          <li>TypeScript 支持</li>
          <li>动态 Layout</li>
          <li>动态 Document Title</li>
          <li>ESLint + Prettier 规范</li>
          <li>Git Hooks + lint-staged</li>
        </ul>
      </div>

      <router-link
        to="/"
        class="inline-block mt-4 px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition"
      >
        Back to Home
      </router-link>
    </div>
  </div>
</template>

<style scoped></style>
