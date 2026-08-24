export const DEFAULT_BANNER = 'create-starter - 快速生成你的模板代码'

export const REMOTE_STARTERS_URL = 'https://raw.githubusercontent.com/doyuli-starters/assets/main/starters.json'

export const REMOTE_TIMEOUT_MS = 5000

export interface StarterDefinition {
  name: string
  tar: string
  description: string
}

/**
 * 内置 Starter 清单，作为远程清单拉取失败/离线时的回退。
 * 占位符约定：pkg-placeholder → 项目名，_description_ → 项目描述
 */
export const defaultStarters: StarterDefinition[] = [
  {
    name: 'Nuxt Starter',
    tar: 'https://codeload.github.com/doyuli-starters/nuxt-starter/tar.gz/refs/heads/main',
    description: 'Nuxt 项目起始模板',
  },
  {
    name: 'Nuxt Electron Starter',
    tar: 'https://codeload.github.com/doyuli-starters/nuxt-electron-starter/tar.gz/refs/heads/main',
    description: 'Nuxt + Electron 桌面应用起始模板',
  },
]
