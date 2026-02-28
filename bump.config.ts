import { defineConfig } from 'bumpp'

export default defineConfig({
  execute: 'pnpm run build',
  files: [
    './package.json',
    'packages/*/package.json',
  ],
})
