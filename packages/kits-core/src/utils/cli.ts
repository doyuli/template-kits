import type { ArgsDef, ParsedArgs } from 'citty'
import process from 'node:process'
import { log } from '@clack/prompts'
import { defineCommand } from 'citty'
import pico from 'picocolors'
import { renderBanner } from './banner'

export type { ArgsDef } from 'citty'
export { runMain } from 'citty'

export const COMMON_ARGS = {
  force: {
    type: 'boolean',
    description: '目标目录已存在时跳过确认，直接覆盖',
  },
  default: {
    type: 'boolean',
    description: '全部选项使用默认值（最小配置），全程无交互',
  },
} as const satisfies ArgsDef

export interface CliCommandOptions<T extends ArgsDef = ArgsDef> {
  name: string
  version: string
  description?: string
  args?: T
  run: (ctx: { args: ParsedArgs<T> }) => Promise<void> | void
}

export function createCliCommand<const T extends ArgsDef = ArgsDef>(options: CliCommandOptions<T>) {
  const argsDef = { ...(options.args ?? {}), ...COMMON_ARGS } as ArgsDef

  return defineCommand({
    meta: {
      name: options.name,
      version: options.version,
      description: options.description,
    },
    args: argsDef,
    run: async (ctx) => {
      try {
        log.message(renderBanner({ name: options.name, version: options.version }))
        await options.run({ args: ctx.args as ParsedArgs<T> })
      }
      catch (error) {
        friendlyExit(error)
      }
    },
  })
}

/** 解析逗号分隔的多值参数（如 --features file-routing,vitest） */
export function parseCsvFlags(value: unknown, validValues: readonly string[], flagName: string): string[] | undefined {
  if (typeof value !== 'string')
    return undefined
  const items = value.split(',').map(v => v.trim()).filter(Boolean)
  for (const item of items) {
    if (!validValues.includes(item))
      throw new Error(`--${flagName} 包含无效值：${item}（可选：${validValues.join(', ')}）`)
  }
  return items
}

/** 统一错误出口：已知错误给简洁红字提示，异常类型保留堆栈；一律 exit 1 */
export function friendlyExit(error: unknown): never {
  if (error instanceof Error && error.message)
    console.error(pico.red(`✖ ${error.message}`))
  else
    console.error(error)
  process.exit(1)
}
