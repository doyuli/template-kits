import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
    pnpm: true,
    ignores: [
      '**/template',
    ],
    rules: {
      'no-console': 'off',
    },
  },
  // {
  //   files: [
  //     '**/template',
  //   ],
  //   rules: {
  //     all: 'off',
  //   },
  // },
)
