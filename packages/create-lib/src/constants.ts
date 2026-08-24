export const DEFAULT_BANNER = 'create-starter - 快速生成你的模板代码'

export const FEATURE_OPTIONS = [
  {
    value: 'monorepo',
    label: 'Monorepo（pnpm workspace 多包管理）',
  },
  {
    value: 'simple-git-hooks',
    label: 'Simple Git Hooks（Git Commit 检查）',
  },
  {
    value: 'github-workflows',
    label: 'GitHub Workflows（CI/CD 自动化）',
  },
] as const
