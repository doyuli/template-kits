import { defineConfig } from 'bumpp'

export default defineConfig({
  execute: 'pnpm run build',
  files: [
    'packages/*/package.json',
  ],
})
