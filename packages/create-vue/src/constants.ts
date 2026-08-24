export const DEFAULT_BANNER = 'create-starter - 快速生成你的模板代码'

export const FEATURE_OPTIONS = [
  {
    value: 'file-routing',
    label: '约定式路由（vue-router v5）',
  },
  {
    value: 'simple-git-hooks',
    label: 'Simple Git Hooks（Git Commit 检查）',
  },
  {
    value: 'vitest',
    label: 'Vitest（单元测试）',
  },
] as const

export const CSS_FRAMEWORK_OPTIONS = [
  {
    value: 'unocss',
    label: 'UnoCSS',
  },
  {
    value: 'tailwindcss',
    label: 'TailwindCSS',
  },
] as const
