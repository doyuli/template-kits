import type { Option } from '@clack/prompts'
import type { PromptStep } from './setupPrompts'
import { confirm, multiselect, select } from '@clack/prompts'
import pico from 'picocolors'
import { unwrapPrompt } from '../utils'

interface SelectOptions<T> {
  message: string
  options: Option<T>[]
}

interface FeaturesOptions<T> {
  message?: string
  options: Option<T>[]
  required?: boolean
}

interface ConfirmOptions {
  message: string
  initialValue?: boolean
}

export function setupSelect<Key extends string, T extends string>(key: Key, options: SelectOptions<T>): PromptStep<Record<Key, T>> {
  return async () => {
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
    const selected = await unwrapPrompt(
      multiselect({
        message: options.message ?? `请选择要包含的功能： ${pico.dim('(↑/↓ 切换，空格选择，a 全选，回车确认)')}`,
        options: options.options,
        required: options.required ?? false,
      }),
    )
    return { [key]: selected } as Record<Key, T[]>
  }
}

export function setupConfirm<Key extends string>(key: Key, options: ConfirmOptions): PromptStep<Record<Key, boolean>> {
  return async () => {
    const value = await unwrapPrompt(
      confirm({
        message: options.message,
        initialValue: options.initialValue ?? false,
      }),
    )
    return { [key]: value } as Record<Key, boolean>
  }
}
