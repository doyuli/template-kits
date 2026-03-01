import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
    pnpm: true,
    ignores: [
      '**/template/**',
      'examples/**',
    ],
    rules: {
      'no-console': 'off',
    },
  },
)
