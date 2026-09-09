export const REMOTE_STARTERS_URL = 'https://raw.githubusercontent.com/doyuli-starters/assets/main/starters.json'

export const REMOTE_TIMEOUT_MS = 5000

export interface StarterDefinition {
  name: string
  tar: string
  description: string
}

/**
 * 内置 Starter 清单，作为远程清单拉取失败/离线时的回退。
 * 占位符约定：__project_name__ → 项目名，__description__ → 项目描述
 */
export const defaultStarters: StarterDefinition[] = [
  {
    name: 'Nuxt Starter',
    tar: 'https://codeload.github.com/doyuli-starters/nuxt-starter/tar.gz/refs/heads/main',
    description: 'Nuxt 项目起始模板',
  },
  {
    name: 'Nestjs Starter',
    tar: 'https://codeload.github.com/doyuli-starters/nestjs-starter/tar.gz/refs/heads/main',
    description: 'Nestjs 项目起始模板',
  },
  {
    name: 'Website Starter',
    tar: 'https://codeload.github.com/doyuli-starters/website-starter/tar.gz/refs/heads/main',
    description: 'Nestjs Server + Nuxt SPA 项目起始模板',
  },
  {
    name: 'Nuxt Electron Starter',
    tar: 'https://codeload.github.com/doyuli-starters/nuxt-electron-starter/tar.gz/refs/heads/main',
    description: 'Nuxt + Electron 桌面应用起始模板',
  },
]
