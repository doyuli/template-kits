import type { Option } from '@clack/prompts'
import type { PromptStep } from './setupPrompts'
import { confirm, multiselect, select } from '@clack/prompts'
import pico from 'picocolors'
import { assertInteractive, unwrapPrompt } from '../utils'

interface SelectOptions<T> {
  message: string
  options: Option<T>[]
  fromCli?: T
}

interface FeaturesOptions<T> {
  message?: string
  options: Option<T>[]
  required?: boolean
  fromCli?: T[]
}

interface ConfirmOptions {
  message: string
  initialValue?: boolean
  fromCli?: boolean
}

export function setupSelect<Key extends string, T extends string>(key: Key, options: SelectOptions<T>): PromptStep<Record<Key, T>> {
  return async () => {
    if (options.fromCli !== undefined)
      return { [key]: options.fromCli } as Record<Key, T>

    assertInteractive('请传入 --features 等参数跳过提问，或使用交互式终端')

    const value = await unwrapPrompt(
      select({
        message: options.message,
        options: options.options,
      }),
    )
    return { [key]: value } as Record<Key, T>
  }
}

export function setupFeatures<Key extends string, T extends string>(key: Key, options: FeaturesOptions<T>): PromptStep<Record<Key, T[]>> {
  return async () => {
    if (options.fromCli !== undefined)
      return { [key]: options.fromCli } as Record<Key, T[]>

    assertInteractive('请传入 --features 等参数跳过提问，或使用交互式终端')

    const selected = await unwrapPrompt(
      multiselect({
        message: options.message ?? `请选择要包含的功能： ${pico.dim('(空格选择，a 全选，直接回车跳过 · 最小配置)')}`,
        options: options.options,
        required: options.required ?? false,
      }),
    )
    return { [key]: selected } as Record<Key, T[]>
  }
}

export function setupConfirm<Key extends string>(key: Key, options: ConfirmOptions): PromptStep<Record<Key, boolean>> {
  return async () => {
    if (options.fromCli !== undefined)
      return { [key]: options.fromCli } as Record<Key, boolean>

    assertInteractive('当前环境不支持交互式提问，或使用交互式终端')

    const value = await unwrapPrompt(
      confirm({
        message: options.message,
        initialValue: options.initialValue ?? false,
      }),
    )
    return { [key]: value } as Record<Key, boolean>
  }
}
