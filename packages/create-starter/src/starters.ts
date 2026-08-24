import type { StarterDefinition } from './constants'
import process from 'node:process'
import pico from 'picocolors'
import { defaultStarters, REMOTE_STARTERS_URL, REMOTE_TIMEOUT_MS } from './constants'

export async function resolveStarters(): Promise<StarterDefinition[]> {
  // 可用环境变量 DOYULI_STARTERS_URL 覆盖为自定义清单地址（如 fork 仓库）
  const startersUrl = process.env.DOYULI_STARTERS_URL || REMOTE_STARTERS_URL

  try {
    const response = await fetch(startersUrl, {
      signal: AbortSignal.timeout(REMOTE_TIMEOUT_MS),
    })
    if (!response.ok)
      throw new Error(`HTTP ${response.status}`)

    const data: unknown = await response.json()
    const starters = parseStarters(data)
    console.log(pico.green(`Starter 清单已更新：${starters.length} 个`))
    return starters
  }
  catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    console.warn(pico.yellow(`远程 Starter 清单加载失败（${reason}），使用内置清单`))
    return defaultStarters
  }
}

function parseStarters(data: unknown): StarterDefinition[] {
  if (!Array.isArray(data))
    throw new Error('清单格式错误：应为数组')

  const starters = data.map((item) => {
    if (typeof item !== 'object' || item === null)
      throw new Error('清单格式错误：条目应为对象')

    const { name, tar, description } = item as Record<string, unknown>
    if (typeof name !== 'string' || typeof tar !== 'string' || typeof description !== 'string')
      throw new Error('清单格式错误：条目缺少 name/tar/description')

    return { name, tar, description }
  })

  if (starters.length === 0)
    throw new Error('清单为空')

  return starters
}
